import { provideZoneChangeDetection } from "@angular/core";
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';

import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app';
import { appConfig } from './app/app.config';
registerLocaleData(localeFr);

bootstrapApplication(AppComponent, {...appConfig, providers: [provideZoneChangeDetection(), ...appConfig.providers]})
  .catch(err => console.error(err));
