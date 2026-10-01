import test from "node:test";
import assert from "node:assert/strict";
import {
  parseTime,
  eventState,
  eventClock,
  eventParts,
  dateLabel,
  countdown,
} from "../src/lib/time.mjs";
const event = {
  startsAt: "2026-12-06T08:30:00+06:00",
  endsAt: "2026-12-06T19:00:00+06:00",
  timezone: "Asia/Dhaka",
};
const labels = {
  countdownPending: "pending",
  countdownLive: "live",
  countdownDone: "done",
};
test("explicit 24-hour times preserve morning, noon, and midnight", () => {
  assert.equal(parseTime("08:30"), 510);
  assert.equal(parseTime("00:00"), 0);
  assert.equal(parseTime("12:00"), 720);
  assert.equal(parseTime("23:59"), 1439);
  assert.equal(parseTime(null), null);
  for (const value of ["8:30", "24:00", "12:60", "2:00 PM", "TBD"])
    assert.throws(() => parseTime(value));
});
test("event becomes live at its start and completed only at its end", () => {
  assert.equal(eventState(event, new Date("2026-12-06T02:29:59Z")), "upcoming");
  assert.equal(eventState(event, new Date("2026-12-06T02:30:00Z")), "live");
  assert.equal(eventState(event, new Date("2026-12-06T12:59:59Z")), "live");
  assert.equal(
    eventState(event, new Date("2026-12-06T13:00:00Z")),
    "completed",
  );
  assert.equal(countdown(event, labels, new Date(event.startsAt)), "live");
  assert.equal(countdown(event, labels, new Date(event.endsAt)), "done");
  assert.equal(countdown({ startsAt: null }, labels), "pending");
});
test("clock and displayed date use Dhaka even on another local calendar day", () => {
  const now = new Date("2026-12-05T18:30:00Z");
  assert.deepEqual(eventParts(now, "Asia/Dhaka"), {
    date: "2026-12-06",
    minutes: 30,
  });
  assert.match(
    dateLabel({ ...event, startsAt: now.toISOString() }, "pending"),
    /6 Dec 2026/,
  );
  assert.equal(eventClock(event, new Date("2026-12-06T04:00:00Z")), 600);
  assert.equal(eventClock(event, new Date("2026-12-07T04:00:00Z")), null);
});
test("preview times are validated and work before an event date is announced", () => {
  assert.equal(eventClock({ startsAt: null }, new Date(), "08:30"), 510);
  assert.equal(eventClock(event, new Date(), "nope"), null);
  assert.equal(eventClock(event, new Date(), "24:00"), null);
});
