import type { ImageMetadata } from "astro";
const imports = import.meta.glob<{ default: ImageMetadata }>(
  "../../media/originals/**/*.{jpg,jpeg,png,svg}",
  { eager: true },
);
export const images = Object.fromEntries(
  Object.entries(imports).map(([path, image]) => [
    path.replace("../../media/originals/", "images/"),
    image.default,
  ]),
);
