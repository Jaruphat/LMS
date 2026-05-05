import { defineConfig, devices } from "@playwright/test"

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000"
const shouldStartLocalServer =
  process.env.PLAYWRIGHT_SKIP_WEBSERVER !== "1" &&
  /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(baseURL)
const vercelProtectionBypassToken = process.env.VERCEL_PROTECTION_BYPASS_TOKEN

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
    baseURL,
    ...(vercelProtectionBypassToken
      ? {
          extraHTTPHeaders: {
            "x-vercel-protection-bypass": vercelProtectionBypassToken,
            "x-vercel-set-bypass-cookie": "true",
          },
        }
      : {}),
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
  ...(shouldStartLocalServer
    ? {
        webServer: {
          command: "cmd /c ..\\start-lms-dev.cmd 3000",
          url: baseURL,
          reuseExistingServer: true,
          timeout: 240000,
        },
      }
    : {}),
})
