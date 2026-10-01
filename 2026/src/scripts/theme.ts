import { createStorage } from "../lib/storage.mjs";
const storage = createStorage();
const root = document.documentElement;
function sync() {
  document
    .querySelectorAll<HTMLButtonElement>(".themebtn")
    .forEach((button) => {
      button.setAttribute(
        "aria-label",
        (root.dataset.theme === "dark"
          ? button.dataset.lightLabel
          : button.dataset.darkLabel) || "",
      );
    });
  document
    .querySelectorAll<HTMLButtonElement>("button[data-palette]")
    .forEach((button) =>
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.palette === root.dataset.palette),
      ),
    );
}
document.querySelectorAll(".themebtn").forEach((button) =>
  button.addEventListener("click", () => {
    root.dataset.theme = root.dataset.theme === "light" ? "dark" : "light";
    storage.write("jdc-theme", root.dataset.theme);
    sync();
  }),
);
document
  .querySelectorAll<HTMLButtonElement>("button[data-palette]")
  .forEach((button) =>
    button.addEventListener("click", () => {
      root.dataset.palette = button.dataset.palette;
      storage.write("jdc-palette", root.dataset.palette);
      sync();
    }),
  );
sync();
