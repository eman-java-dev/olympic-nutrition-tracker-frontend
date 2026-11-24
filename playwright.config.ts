import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:4200',
    channel: 'chrome',
    launchOptions: {
      args: ['--proxy-server=http://127.0.0.1:1', '--proxy-bypass-list=localhost;127.0.0.1'],
    },
    trace: 'off',
    video: 'off',
    screenshot: 'off',
  },
  webServer: {
    command: 'node e2e/serve.mjs',
    url: 'http://localhost:4200',
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
