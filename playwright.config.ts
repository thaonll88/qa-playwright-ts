import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  use: {
    baseURL: "https://demoqa.com",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    trace: "on-first-retry",
  },

  reporter: [
    ["html", { outputFolder: "playwright-report" }],
    ["list"],
    ["allure-playwright", { outputFolder: "allure-results" }],
  ],

  projects: [
    // UI tests
    {
      name: "chromium",
      testMatch: "**/ui/**/*.spec.ts",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: "https://demoqa.com",
        screenshot: "only-on-failure",
        video: "retain-on-failure",
        trace: "on-first-retry",
      },
    },
    // API tests
    {
      name: "api",
      testMatch: "**/api/**/*.spec.ts",
      use: {
        baseURL: "https://demoqa.com",
      },
    },
  ],
});
