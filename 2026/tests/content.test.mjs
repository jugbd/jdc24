import test from "node:test";
import assert from "node:assert/strict";
import {
  readContent,
  validateContent,
  validateRelationships,
} from "../scripts/validate-content.mjs";
import {
  eventSchema,
  agendaSchema,
  sessionSchema,
} from "../src/lib/schemas.mjs";
import { createModel } from "../src/lib/model.mjs";
const bundle = await readContent();
test("all editions pass schemas, relationships, and image checks", async () => {
  await validateContent();
});
test("editing a title or speaker name preserves session IDs and relationships", () => {
  const data = structuredClone(bundle);
  const event = data.events.find((event) => event.id === "jdc-2025");
  data.sessions[0].title = "A completely new title";
  const speakerId = data.sessions[0].speakerIds[0];
  data.speakers.find((speaker) => speaker.id === speakerId).name =
    "A new display name";
  const model = createModel(event, data);
  const session = model.sessions.find(
    (session) => session.id === data.sessions[0].id,
  );
  assert.equal(session.title, "A completely new title");
  assert.equal(session.speakers[0].name, "A new display name");
  assert.equal(
    model.schedule.find((slot) => slot.sessionId === session.id).session,
    session,
  );
});
test("identical titles do not merge distinct sessions", () => {
  const data = structuredClone(bundle);
  data.sessions[0].title = data.sessions[1].title;
  const model = createModel(
    data.events.find((event) => event.id === "jdc-2025"),
    data,
  );
  assert.equal(model.sessionById.size, data.sessions.length);
});
test("duplicate IDs and broken references fail validation", () => {
  const duplicate = structuredClone(bundle);
  duplicate.sessions.push(duplicate.sessions[0]);
  assert.throws(() => validateRelationships(duplicate), /duplicate id/);
  const broken = structuredClone(bundle);
  broken.sessions[0].speakerIds = ["does-not-exist"];
  assert.throws(
    () => validateRelationships(broken),
    /missing or cross-edition speaker/,
  );
  const cross = structuredClone(bundle);
  cross.sessions[0].eventId = "jdc-2026";
  assert.throws(() => validateRelationships(cross), /cross-edition/);
});
test("overlapping slots and dates without a timezone are rejected", () => {
  const overlap = structuredClone(bundle);
  const slots = overlap.agenda.filter((slot) => slot.eventId === "jdc-2025");
  slots[1].start = "10:15";
  assert.throws(() => validateRelationships(overlap), /overlaps/);
  const event = structuredClone(
    bundle.events.find((event) => event.id === "jdc-2025"),
  );
  event.startsAt = "2025-12-06T10:00:00";
  assert.equal(eventSchema.safeParse(event).success, false);
});
test("one source owns schedule times and session titles", () => {
  assert.equal(
    sessionSchema.safeParse({ ...bundle.sessions[0], time: "10:30" }).success,
    false,
  );
  const slot = bundle.agenda.find((slot) => slot.kind === "session");
  assert.equal(
    agendaSchema.safeParse({ ...slot, title: "Duplicate title" }).success,
    false,
  );
});
