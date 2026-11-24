import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideRouter, Router, UrlTree } from '@angular/router';
import { environment } from '../../environments/environment';
import { AuthService, authGuard, guestGuard } from './auth';
import { authInterceptor } from './auth.interceptor';

const sessionKey = 'nt_session';
const api = environment.apiUrl;

function session(expiresIn = 60, username = 'fixture-user') {
  const encode = (value: object) => btoa(JSON.stringify(value)).replace(/=+$/, '')
    .replace(/\+/g, '-').replace(/\//g, '_');
  const token = [
    encode({ alg: 'HS256' }),
    encode({ sub: username, exp: Math.floor(Date.now() / 1000) + expiresIn }),
    'c2ln',
  ].join('.');
  return { username, role: 'ATHLETE', token };
}

describe('Authentication and API session handling', () => {
  let httpTesting: HttpTestingController;
  let router: Router;
  let navigate: jasmine.Spy;
  let auth: AuthService | undefined;

  beforeEach(() => {
    localStorage.removeItem(sessionKey);
    auth = undefined;
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    httpTesting = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    navigate = spyOn(router, 'navigateByUrl').and.resolveTo(true);
  });

  afterEach(() => {
    httpTesting.verify();
    auth?.logout();
    localStorage.removeItem(sessionKey);
  });

  function start(): AuthService {
    return auth = TestBed.inject(AuthService);
  }

  function guardTarget(guard: typeof authGuard): string | boolean {
    const userState = TestBed.runInInjectionContext(() => guard({} as never, {} as never));
    return userState instanceof UrlTree ? router.serializeUrl(userState) : userState as boolean;
  }

  it('clears malformed persisted sessions and redirects protected routes', () => {
    localStorage.setItem(sessionKey, '{invalid');
    expect(start().currentUser()).toBeNull();
    expect(localStorage.getItem(sessionKey)).toBeNull();
    expect(auth?.sessionNotice()).toBe('rejected');
    expect(guardTarget(authGuard)).toBe('/signin');
    expect(guardTarget(guestGuard)).toBeTrue();
  });

  it('rejects expired persisted sessions and expires valid sessions on schedule', fakeAsync(() => {
    localStorage.setItem(sessionKey, JSON.stringify(session(2)));
    expect(start().isAuthenticated()).toBeTrue();
    expect(guardTarget(authGuard)).toBeTrue();
    expect(guardTarget(guestGuard)).toBe('/home');
    tick(2000);
    expect(auth?.currentUser()).toBeNull();
    expect(auth?.sessionNotice()).toBe('expired');
    expect(navigate).toHaveBeenCalledWith('/signin');
  }));

  it('rejects an already expired persisted session', () => {
    localStorage.setItem(sessionKey, JSON.stringify(session(-10)));
    expect(start().currentUser()).toBeNull();
    expect(auth?.sessionNotice()).toBe('expired');
  });

  it('clears persisted login state on logout', () => {
    localStorage.setItem(sessionKey, JSON.stringify(session()));
    start().logout();
    expect(auth?.isAuthenticated()).toBeFalse();
    expect(localStorage.getItem(sessionKey)).toBeNull();
    expect(navigate).toHaveBeenCalledWith('/signin');
  });

  it('maps login errors and refuses a malformed successful response', async () => {
    const service = start();
    for (const [status, message] of [[401, 'credentials'], [403, 'forbidden'], [503, 'unavailable']] as const) {
      const result = service.login('fixture-user', 'fixture-password');
      httpTesting.expectOne(api + '/auth/login').flush({}, { status, statusText: 'Synthetic error' });
      expect(await result).toBe(message);
    }
    const result = service.login('fixture-user', 'fixture-password');
    httpTesting.expectOne(api + '/auth/login').flush({ username: 'fixture-user' });
    expect(await result).toBe('invalid-response');
    expect(service.currentUser()).toBeNull();
  });

  it('limits the bearer token to the configured origin and path and excludes authentication endpoints', () => {
    const fixture = session();
    localStorage.setItem(sessionKey, JSON.stringify(fixture));
    start();
    const http = TestBed.inject(HttpClient);
    for (const [url, attached] of [
      [api + '/athletes', true],
      [api + '/auth/login?mode=test', false],
      [api + '/auth/register/', false],
      [api + '-extra/athletes', false],
      ['https://example.invalid/api/athletes', false],
    ] as const) {
      http.get(url).subscribe();
      const request = httpTesting.expectOne(url);
      expect(request.request.headers.get('Authorization')).toBe(attached ? 'Bearer ' + fixture.token : null);
      request.flush([]);
    }
  });

  it('preserves the session on authorization and validation failures but clears it on rejection', () => {
    localStorage.setItem(sessionKey, JSON.stringify(session()));
    const service = start();
    const http = TestBed.inject(HttpClient);
    const url = api + '/nutrition-entries';
    for (const status of [403, 400, 401]) {
      const rejected = jasmine.createSpy('request error');
      http.post(url, {}).subscribe({ error: rejected });
      httpTesting.expectOne(url).flush(
        { message: 'Synthetic error', fields: { date: 'required' } },
        { status, statusText: 'Synthetic error' },
      );
      expect(rejected).toHaveBeenCalledWith(jasmine.objectContaining({ status }));
      expect(service.isAuthenticated()).toBe(status !== 401);
    }
    expect(service.sessionNotice()).toBe('rejected');
  });
});
