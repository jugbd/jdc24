import { defineConfig } from "astro/config";
import site from "./content/site.json" with { type: "json" };

export default defineConfig({
  site: process.env.SITE_URL || site.url,
  base: process.env.BASE_PATH || site.basePath,
  output: "static",
  build: { format: "preserve" },
  devToolbar: { enabled: false },
});
