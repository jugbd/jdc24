import { agenda } from "./agenda";
const cards = [...document.querySelectorAll<HTMLElement>("[data-session]")];
const filters = [...document.querySelectorAll<HTMLButtonElement>("[data-tag]")];
const starFilter = document.querySelector<HTMLButtonElement>(
  "[data-only-starred]",
);
let tag = "";
let onlyStarred = false;
function filter() {
  let visible = 0;
  cards.forEach((card) => {
    const tags: string[] = JSON.parse(card.dataset.tags || "[]");
    card.hidden = Boolean(
      (tag && !tags.includes(tag)) ||
      (onlyStarred && !agenda.has(card.dataset.session)),
    );
    if (!card.hidden) visible++;
  });
  const count = document.querySelector<HTMLElement>("[data-session-count]");
  if (count)
    count.textContent = cards.length
      ? count.dataset
          .template!.replace("{visible}", String(visible))
          .replace("{total}", String(cards.length))
      : "";
  const empty = document.querySelector<HTMLElement>("[data-sessions-empty]");
  if (empty) empty.hidden = visible > 0;
}
filters.forEach((button) =>
  button.addEventListener("click", () => {
    tag = button.dataset.tag || "";
    filters.forEach((item) =>
      item.setAttribute("aria-pressed", String(item === button)),
    );
    filter();
  }),
);
starFilter?.addEventListener("click", () => {
  onlyStarred = !onlyStarred;
  starFilter.setAttribute("aria-pressed", String(onlyStarred));
  filter();
});
document.addEventListener("agenda-change", filter);
filter();
