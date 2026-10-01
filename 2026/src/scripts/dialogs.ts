const origins = new WeakMap<HTMLDialogElement, HTMLElement>();
function open(id: string, origin?: HTMLElement) {
  const dialog = document.getElementById(id);
  if (!(dialog instanceof HTMLDialogElement) || dialog.open) return;
  if (origin) origins.set(dialog, origin);
  dialog.showModal();
  dialog.scrollTop = 0;
}
document
  .querySelectorAll<HTMLElement>("[data-open-dialog]")
  .forEach((trigger) =>
    trigger.addEventListener("click", (event) => {
      const target = document.getElementById(trigger.dataset.openDialog!);
      if (!(target instanceof HTMLDialogElement) || !("showModal" in target))
        return;
      event.preventDefault();
      open(target.id, trigger);
    }),
  );
document.querySelectorAll("dialog").forEach((dialog) => {
  dialog
    .querySelector("[data-close-dialog]")
    ?.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom
    )
      dialog.close();
  });
  dialog.addEventListener("close", () => {
    const origin = origins.get(dialog);
    if (origin?.isConnected) origin.focus({ preventScroll: true });
  });
});
function openHash() {
  let id;
  try {
    id = decodeURIComponent(location.hash.slice(1));
  } catch {
    return;
  }
  if (!id) return;
  const card = document.getElementById(id);
  if (!card?.hasAttribute("data-session")) return;
  open(
    `dialog-${id}`,
    card.querySelector<HTMLElement>("[data-open-dialog]") || undefined,
  );
}
openHash();
window.addEventListener("hashchange", openHash);
