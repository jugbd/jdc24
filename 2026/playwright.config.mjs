import { defineConfig } from "@playwright/test";
import { existsSync } from "node:fs";
import site from "./content/site.json" with { type: "json" };
const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
export default defineConfig({
  testDir: "./tests/browser",
  fullyParallel: true,
  workers: 2,
  use: {
    baseURL: `http://127.0.0.1:4321${site.basePath}`,
    timezoneId: "America/Toronto",
    launchOptions: existsSync(chrome) ? { executablePath: chrome } : {},
    screenshot: "only-on-failure",
  },
  webServer: [
    {
      command: "npm run preview -- --host 127.0.0.1 --port 4321 --ignore-lock",
      url: `http://127.0.0.1:4321${site.basePath}`,
      reuseExistingServer: !process.env.CI,
      env: { ASTRO_TELEMETRY_DISABLED: "1" },
    },
    {
      command:
        "npm run preview -- --host 127.0.0.1 --port 4322 --ignore-lock --outDir .test-archive",
      url: `http://127.0.0.1:4322${site.basePath}`,
      reuseExistingServer: !process.env.CI,
      env: { ASTRO_TELEMETRY_DISABLED: "1" },
    },
  ],
});
