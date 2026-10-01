import { readFile, rm } from "node:fs/promises";
import { resolve } from "node:path";

// Refuse to remove caches from under a running, tracked Astro dev server.
let lock;
try {
  lock = JSON.parse(await readFile(".astro/dev.json", "utf8"));
} catch (error) {
  if (error.code !== "ENOENT" && !(error instanceof SyntaxError)) throw error;
}
if (Number.isInteger(lock?.pid) && lock.pid > 0) {
  let running = true;
  try {
    process.kill(lock.pid, 0);
  } catch (error) {
    if (error.code === "ESRCH") running = false;
    else throw error;
  }
  if (running) {
    console.error(
      "Stop the dev server with Ctrl+C (or npm run dev -- stop) before resetting its caches.",
    );
    process.exit(1);
  }
}
for (const directory of [
  ".astro",
  "node_modules/.astro",
  "node_modules/.vite",
  "node_modules/.vite-temp",
]) {
  await rm(resolve(directory), { recursive: true, force: true });
}
console.log(
  "Cleared generated Astro and Vite caches. Source files and dist/ were preserved.",
);
