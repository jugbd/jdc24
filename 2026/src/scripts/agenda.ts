import { createAgenda } from "../lib/storage.mjs";
const buttons = [
  ...document.querySelectorAll<HTMLButtonElement>("[data-star]"),
];
export const agenda = createAgenda(
  document.body.dataset.eventId!,
  JSON.parse(document.body.dataset.sessionIds || "[]"),
);
const labels = document.body.dataset;
function sync() {
  buttons.forEach((button) => {
    const selected = agenda.has(button.dataset.star);
    button.setAttribute("aria-pressed", String(selected));
    button.setAttribute(
      "aria-label",
      (selected ? labels.removeAgenda! : labels.addAgenda!).replace(
        "{title}",
        button.dataset.title || "",
      ),
    );
  });
  document
    .querySelectorAll<HTMLElement>("[data-session]")
    .forEach((card) =>
      card.classList.toggle("on", agenda.has(card.dataset.session)),
    );
}
buttons.forEach((button) =>
  button.addEventListener("click", () => {
    const selected = agenda.toggle(button.dataset.star);
    sync();
    const status = document.getElementById("agenda-status");
    if (status)
      status.textContent = agenda.persistent
        ? selected
          ? labels.saved!
          : labels.removed!
        : labels.storageUnavailable!;
    document.dispatchEvent(new CustomEvent("agenda-change"));
  }),
);
sync();
