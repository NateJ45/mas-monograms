import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  reporter: 'list',
  workers: 2,
  timeout: 120000,
  use: { baseURL: 'http://localhost:4415' },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'webkit-iphone', use: { ...devices['iPhone 14'] }, testMatch: /(smoke|a11y|reduced-motion)\.spec\.ts$/ },
  ],
});
