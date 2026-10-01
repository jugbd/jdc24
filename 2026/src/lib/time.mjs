/** Schedule times are always explicit 24-hour wall times in the event timezone. */
export function parseTime(value) {
  if (value == null) return null;
  if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value)) {
    throw new Error(`Invalid 24-hour time: ${value}`);
  }
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

export function formatTime(minutes) {
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

export function eventParts(date, timezone) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const values = Object.fromEntries(
    parts.map(({ type, value }) => [type, value]),
  );
  return {
    date: `${values.year}-${values.month}-${values.day}`,
    minutes: Number(values.hour) * 60 + Number(values.minute),
  };
}

export function eventState(event, now = new Date()) {
  if (!event.startsAt) return "unannounced";
  if (now < new Date(event.startsAt)) return "upcoming";
  if (event.endsAt && now >= new Date(event.endsAt)) return "completed";
  return "live";
}

/** @param {any} event @param {Date} now @param {string | null} preview */
export function eventClock(event, now = new Date(), preview = null) {
  if (preview !== null) {
    try {
      return parseTime(preview);
    } catch {
      return null;
    }
  }
  if (eventState(event, now) !== "live") return null;
  return eventParts(now, event.timezone).minutes;
}

export function dateLabel(event, pending) {
  if (!event.startsAt) return pending;
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: event.timezone,
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(event.startsAt));
}

export function countdown(event, labels, now = new Date()) {
  const state = eventState(event, now);
  if (state === "unannounced") return labels.countdownPending;
  if (state === "completed") return labels.countdownDone;
  if (state === "live") return labels.countdownLive;
  const remaining = Math.max(
    0,
    Math.ceil((new Date(event.startsAt) - now) / 1000),
  );
  const days = Math.floor(remaining / 86400);
  const hours = Math.floor(remaining / 3600) % 24;
  const minutes = Math.floor(remaining / 60) % 60;
  const seconds = remaining % 60;
  return `PT${days * 24 + hours}H${minutes}M${seconds}S // ${days}d ${hours}h ${minutes}m ${seconds}s`;
}
