import { countdown, eventClock, formatTime, parseTime } from "../lib/time.mjs";
const data = document.body.dataset;
const event = {
  startsAt: data.startsAt || null,
  endsAt: data.endsAt || null,
  timezone: data.timezone!,
};
const labels = {
  countdownPending: data.countdownPending,
  countdownLive: data.countdownLive,
  countdownDone: data.countdownDone,
};
const preview = new URLSearchParams(location.search).get("now");
function update() {
  document.querySelectorAll<HTMLElement>("[data-countdown]").forEach((node) => {
    node.textContent = countdown(event, labels);
  });
  const now = eventClock(event, new Date(), preview);
  const live = document.querySelector<HTMLElement>("[data-live]");
  if (live) live.hidden = now === null;
  const liveTime = document.querySelector<HTMLElement>("[data-live-time]");
  if (liveTime && now !== null) liveTime.textContent = formatTime(now);
  document.querySelectorAll<HTMLElement>("[data-slot]").forEach((row) => {
    const start = parseTime(row.dataset.start || null);
    const end = parseTime(row.dataset.end || null);
    const current =
      now !== null &&
      start !== null &&
      end !== null &&
      now >= start &&
      now < end;
    row.classList.toggle("now", current);
    row.classList.toggle("past", now !== null && end !== null && now >= end);
    if (current) row.setAttribute("aria-current", "time");
    else row.removeAttribute("aria-current");
    const label = row.querySelector<HTMLElement>(".now-label");
    if (label) label.hidden = !current;
  });
}
update();
if (event.startsAt || preview)
  setInterval(
    update,
    document.querySelector("[data-countdown]") ? 1000 : 30000,
  );
