import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  reporter: [
    ["list"],
    ["html", { outputFolder: ".artifacts/playwright/report", open: "never" }],
    ["json", { outputFile: ".artifacts/playwright/results.json" }],
  ],
  outputDir: ".artifacts/playwright/test-results",
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 1100 },
      },
    },
  ],
  webServer: {
    command: "cmd /c ..\\start-lms-dev.cmd 3000",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 240000,
  },
})
