import { agenda } from "./agenda";
import "./clock";
const button = document.querySelector<HTMLButtonElement>("[data-only-starred]");
const rows = [...document.querySelectorAll<HTMLElement>("[data-slot]")];
let onlyStarred = false;
function filter() {
  const hasSelected = rows.some((row) => agenda.has(row.dataset.sessionId));
  rows.forEach((row) => {
    row.hidden =
      onlyStarred &&
      (!hasSelected ||
        (row.dataset.kind !== "break" && !agenda.has(row.dataset.sessionId)));
  });
  const empty = document.querySelector<HTMLElement>("[data-schedule-empty]");
  if (empty) empty.hidden = !onlyStarred || hasSelected;
}
button?.addEventListener("click", () => {
  onlyStarred = !onlyStarred;
  button.setAttribute("aria-pressed", String(onlyStarred));
  filter();
});
document.addEventListener("agenda-change", filter);
