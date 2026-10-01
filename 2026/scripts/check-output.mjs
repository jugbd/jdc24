import { pruneUnusedImages } from "./prune-images.mjs";
import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseHTML } from "linkedom";
import site from "../content/site.json" with { type: "json" };
const root = path.resolve(process.argv[2] || "dist");
const base = (process.env.BASE_PATH || site.basePath).replace(/\/$/, "") + "/";
const htmlFiles = [];
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(file);
    else if (file.endsWith(".html")) htmlFiles.push(file);
  }
}
await pruneUnusedImages(root);
await walk(root);
const documents = new Map();
for (const file of htmlFiles)
  documents.set(file, parseHTML(await readFile(file, "utf8")).document);
const failures = [];
for (const [file, document] of documents) {
  const label = path.relative(root, file);
  const pageUrl = new URL(
    base + label.replace(/index\.html$/, ""),
    "https://local.test",
  );
  const ids = new Set();
  for (const element of document.querySelectorAll("[id]")) {
    if (ids.has(element.id))
      failures.push(`${label}: duplicate id ${element.id}`);
    ids.add(element.id);
  }
  if (document.querySelectorAll("h1").length !== 1)
    failures.push(`${label}: expected one h1`);
  if (document.querySelector("a button, button a, button button, a a"))
    failures.push(`${label}: nested interactive elements`);
  for (const dialog of document.querySelectorAll("dialog")) {
    if (!ids.has(dialog.getAttribute("aria-labelledby")))
      failures.push(`${label}: unlabelled dialog`);
  }
  if (!document.querySelector("main")?.textContent.trim())
    failures.push(`${label}: missing static content`);
  const refs = [
    ...document.querySelectorAll("[href], [src], [srcset]"),
  ].flatMap((element) =>
    [
      element.getAttribute("href"),
      element.getAttribute("src"),
      ...(element.getAttribute("srcset") || "")
        .split(",")
        .map((value) => value.trim().split(/\s/)[0]),
    ].filter(Boolean),
  );
  for (const ref of refs) {
    if (/^(?:https?:|mailto:|tel:|data:|\/\/)/.test(ref)) continue;
    const url = new URL(ref, pageUrl);
    if (!url.pathname.startsWith(base)) {
      failures.push(`${label}: path escapes deployment base: ${ref}`);
      continue;
    }
    const pathname = decodeURIComponent(url.pathname.slice(base.length));
    let target = path.resolve(root, pathname);
    try {
      if ((await stat(target)).isDirectory())
        target = path.join(target, "index.html");
      await stat(target);
      if (
        url.hash &&
        documents.has(target) &&
        !documents
          .get(target)
          .getElementById(decodeURIComponent(url.hash.slice(1)))
      )
        failures.push(`${label}: missing fragment: ${ref}`);
    } catch {
      failures.push(`${label}: missing local target: ${ref}`);
    }
  }
}
if (failures.length) {
  console.error([...new Set(failures)].join("\n"));
  process.exitCode = 1;
} else
  console.log(
    `Static output valid: ${htmlFiles.length} pages; local links, fragments, assets, IDs, and dialog labels checked.`,
  );

await writeFile(
  path.join(root, "_headers"),
  `/*\n  Cache-Control: public, max-age=0, must-revalidate\n${base}_astro/*\n  Cache-Control: public, max-age=31536000, immutable\n`,
);
