import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtemp, mkdir, writeFile, access, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
const reset = fileURLToPath(
  new URL("../scripts/reset-dev.mjs", import.meta.url),
);

test("dev reset clears generated caches while preserving source and built pages", async () => {
  const root = await mkdtemp(join(tmpdir(), "jdc-reset-"));
  try {
    for (const name of [
      ".astro",
      "node_modules/.vite",
      "node_modules/.vite-temp",
      "node_modules/.astro",
      "src",
      "dist",
    ]) {
      await mkdir(join(root, name), { recursive: true });
      await writeFile(join(root, name, "keep.txt"), "data");
    }
    execFileSync(process.execPath, [reset], { cwd: root });
    for (const name of [
      ".astro",
      "node_modules/.vite",
      "node_modules/.vite-temp",
      "node_modules/.astro",
    ])
      await assert.rejects(access(join(root, name)));
    for (const name of ["src", "dist"])
      await access(join(root, name, "keep.txt"));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("dev reset refuses to clear a running server’s cache", async () => {
  const root = await mkdtemp(join(tmpdir(), "jdc-reset-"));
  try {
    await mkdir(join(root, ".astro"));
    const lock = join(root, ".astro/dev.json");
    await writeFile(lock, JSON.stringify({ pid: process.pid }));
    const result = spawnSync(process.execPath, [reset], {
      cwd: root,
      encoding: "utf8",
    });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Stop the dev server/);
    await access(lock);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
