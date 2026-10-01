import assert from "node:assert/strict";
import {
  cp,
  mkdtemp,
  readFile,
  realpath,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { dev } from "astro";
import site from "../content/site.json" with { type: "json" };

// Use an isolated source copy and cold caches, never modify a contributor's files.
const root = await realpath(await mkdtemp(join(tmpdir(), "jdc-dev-")));
const project = fileURLToPath(new URL("../", import.meta.url));
let server;
try {
  for (const name of [
    "src",
    "content",
    "media",
    "public",
    "astro.config.mjs",
    "tsconfig.json",
    "package.json",
    "package-lock.json",
  ]) {
    await cp(resolve(project, name), join(root, name), { recursive: true });
  }
  await symlink(
    resolve(project, "node_modules"),
    join(root, "node_modules"),
    process.platform === "win32" ? "junction" : "dir",
  );
  server = await dev({
    root,
    cacheDir: join(root, ".astro-cache"),
    server: { host: "127.0.0.1", port: 0 },
    vite: { cacheDir: join(root, ".vite-cache") },
  });
  const base =
    (process.env.BASE_PATH || site.basePath).replace(/\/$/, "") + "/";
  const origin = `http://127.0.0.1:${server.address.port}`;
  async function page(route) {
    const response = await fetch(origin + base + route, {
      signal: AbortSignal.timeout(15000),
    });
    assert.equal(
      response.status,
      200,
      `${route || "home"} must render in development`,
    );
    const html = await response.text();
    assert.match(html, /<h1[\s>]/);
    return html;
  }
  for (const route of ["", "sessions.html", "schedule/"]) await page(route);

  const about = join(root, "content/pages/about.md");
  const original = await readFile(about, "utf8");
  const marker = "Development reload verification";
  const reloaded = new Promise((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error("Content file change was not observed")),
      15000,
    );
    server.watcher.once("change", () => {
      clearTimeout(timeout);
      resolve();
    });
  });
  await writeFile(about, original + `\n\n${marker}\n`);
  await reloaded;
  const deadline = Date.now() + 15000;
  let html;
  do {
    html = await page("");
    if (html.includes(marker)) break;
    await new Promise((resolve) => setTimeout(resolve, 100));
  } while (Date.now() < deadline);
  assert.ok(
    html.includes(marker),
    "Markdown changes must appear without restarting the dev server",
  );
  console.log(
    "Development check passed: cold startup, three routes, and live content reload.",
  );
} finally {
  await server?.stop();
  await rm(root, { recursive: true, force: true });
}
