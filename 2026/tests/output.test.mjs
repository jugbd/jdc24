import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, access, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { pruneUnusedImages } from "../scripts/prune-images.mjs";

test("image pruning preserves references from HTML, CSS, and browser scripts", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "jdc-output-"));
  try {
    await mkdir(path.join(root, "_astro"));
    for (const name of ["html.webp", "css.png", "script.jpg", "unused.jpg"])
      await writeFile(path.join(root, "_astro", name), "image");
    await writeFile(
      path.join(root, "index.html"),
      '<img src="/2026/_astro/html.webp">',
    );
    await writeFile(
      path.join(root, "_astro", "style.css"),
      "body{background:url(css.png)}",
    );
    await writeFile(
      path.join(root, "_astro", "script.js"),
      'const image="script.jpg";',
    );
    await pruneUnusedImages(root);
    for (const name of ["html.webp", "css.png", "script.jpg"])
      await access(path.join(root, "_astro", name));
    await assert.rejects(access(path.join(root, "_astro", "unused.jpg")));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
