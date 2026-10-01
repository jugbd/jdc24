import { readdir, readFile, unlink } from "node:fs/promises";
import path from "node:path";

// Astro imports image metadata for server rendering. Vite also emits the source
// images, even when every page uses generated variants. Drop only images whose
// filenames appear in none of the generated HTML, CSS, JS, or JSON assets.
export async function pruneUnusedImages(root) {
  const files = [];
  const walk = async (dir) => {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) await walk(file);
      else files.push(file);
    }
  };
  await walk(root);
  const text = (
    await Promise.all(
      files
        .filter((file) => /\.(?:html|css|m?js|json)$/.test(file))
        .map((file) => readFile(file, "utf8")),
    )
  ).join("\n");
  let bytes = 0;
  for (const file of files) {
    if (
      !file.includes(`${path.sep}_astro${path.sep}`) ||
      !/\.(?:jpe?g|png|webp|svg)$/.test(file)
    )
      continue;
    if (!text.includes(path.basename(file))) {
      bytes += (await readFile(file)).length;
      await unlink(file);
    }
  }
  console.log(
    `Removed ${(bytes / 1024 / 1024).toFixed(2)} MiB of unused generated image copies.`,
  );
}
