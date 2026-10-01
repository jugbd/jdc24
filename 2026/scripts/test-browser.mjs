import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
const run = (command, args, env = {}) => {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    env: { ...process.env, ASTRO_TELEMETRY_DISABLED: "1", ...env },
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
};
if (!existsSync("dist/index.html")) run("npm", ["run", "build"]);
run(
  "node",
  ["node_modules/astro/bin/astro.mjs", "build", "--outDir", ".test-archive"],
  { JDC_EVENT_ID: "jdc-2025" },
);
run("node", ["scripts/check-output.mjs", ".test-archive"]);
run("node", [
  "node_modules/@playwright/test/cli.js",
  "test",
  ...process.argv.slice(2),
]);
