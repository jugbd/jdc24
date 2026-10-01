import { readFile, readdir, access } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import matter from "gray-matter";
import * as schemas from "../src/lib/schemas.mjs";
import { parseTime, eventParts } from "../src/lib/time.mjs";

export async function readContent(root = ".") {
  const json = async (name) =>
    JSON.parse(await readFile(path.join(root, name), "utf8"));
  const readRecords = async (folder, schema) => {
    const result = [];
    for (const name of (await readdir(path.join(root, folder))).sort()) {
      if (!/\.(json|md)$/.test(name)) continue;
      const file = path.join(root, folder, name);
      const raw = await readFile(file, "utf8");
      const parsed = name.endsWith(".md")
        ? matter(raw)
        : { data: JSON.parse(raw), content: "" };
      if (/<\/?[a-z][^>]*>/i.test(parsed.content))
        throw new Error(`${file}: use Markdown, not inline HTML`);
      const record = schema.safeParse(parsed.data);
      if (!record.success) throw new Error(`${file}: ${record.error.message}`);
      result.push(record.data);
    }
    return result;
  };
  const bundle = {
    site: schemas.siteSchema.parse(await json("content/site.json")),
    home: schemas.homeSchema.parse(await json("content/pages/home.json")),
    sessionsPage: schemas.sessionsPageSchema.parse(
      await json("content/pages/sessions.json"),
    ),
    schedulePage: schemas.schedulePageSchema.parse(
      await json("content/pages/schedule.json"),
    ),
    ui: schemas.uiSchema.parse(await json("content/ui.json")),
    events: await readRecords("content/events", schemas.eventSchema),
    speakers: await readRecords(
      "content/collections/speakers",
      schemas.speakerSchema,
    ),
    sessions: await readRecords(
      "content/collections/sessions",
      schemas.sessionSchema,
    ),
    agenda: await readRecords(
      "content/collections/agenda",
      schemas.agendaSchema,
    ),
    team: await readRecords("content/collections/team", schemas.teamSchema),
    sponsors: await readRecords(
      "content/collections/sponsors",
      schemas.sponsorSchema,
    ),
  };
  await readRecords("content/pages", {
    safeParse: (data) => {
      // JSON page settings have already been validated above.
      return data.id === "about"
        ? schemas.aboutSchema.safeParse(data)
        : { success: true, data };
    },
  });
  return bundle;
}

export function validateRelationships(bundle) {
  const errors = [];
  const fail = (message) => errors.push(message);
  for (const name of [
    "events",
    "speakers",
    "sessions",
    "agenda",
    "team",
    "sponsors",
  ]) {
    const ids = new Set();
    for (const item of bundle[name]) {
      if (ids.has(item.id)) fail(`${name}: duplicate id ${item.id}`);
      ids.add(item.id);
    }
  }
  const events = new Map(bundle.events.map((event) => [event.id, event]));
  const sessions = new Map(
    bundle.sessions.map((session) => [session.id, session]),
  );
  const speakers = new Map(
    bundle.speakers.map((speaker) => [speaker.id, speaker]),
  );
  if (!events.has(bundle.site.eventId))
    fail(`Unknown active event ${bundle.site.eventId}`);
  for (const item of [
    ...bundle.sessions,
    ...bundle.speakers,
    ...bundle.agenda,
    ...bundle.sponsors,
  ]) {
    if (!events.has(item.eventId))
      fail(`${item.id}: unknown event ${item.eventId}`);
  }
  for (const session of bundle.sessions) {
    for (const id of session.speakerIds) {
      const speaker = speakers.get(id);
      if (!speaker || speaker.eventId !== session.eventId)
        fail(`${session.id}: missing or cross-edition speaker ${id}`);
    }
  }
  for (const slot of bundle.agenda) {
    if (slot.sessionId) {
      const session = sessions.get(slot.sessionId);
      if (!session || session.eventId !== slot.eventId)
        fail(`${slot.id}: missing or cross-edition session ${slot.sessionId}`);
    }
  }
  for (const event of bundle.events) {
    const slots = bundle.agenda
      .filter((slot) => slot.eventId === event.id)
      .sort((a, b) => a.order - b.order);
    const orders = new Set();
    const scheduled = new Set();
    let previousEnd = null;
    const start = event.startsAt
      ? eventParts(new Date(event.startsAt), event.timezone)
      : null;
    const end = event.endsAt
      ? eventParts(new Date(event.endsAt), event.timezone)
      : null;
    if (start && end && start.date !== end.date)
      fail(`${event.id}: this schedule supports one local calendar day`);
    if (start && Number(start.date.slice(0, 4)) !== event.year)
      fail(`${event.id}: year disagrees with startsAt in its timezone`);
    for (const slot of slots) {
      if (orders.has(slot.order))
        fail(`${event.id}: duplicate agenda order ${slot.order}`);
      orders.add(slot.order);
      if (slot.sessionId && scheduled.has(slot.sessionId))
        fail(`${event.id}: session scheduled twice: ${slot.sessionId}`);
      if (slot.sessionId) scheduled.add(slot.sessionId);
      if (slot.start !== null) {
        const from = parseTime(slot.start),
          to = parseTime(slot.end);
        if (previousEnd !== null && from < previousEnd)
          fail(`${slot.id}: overlaps the previous slot`);
        if (start && (from < start.minutes || to > end.minutes))
          fail(`${slot.id}: outside the event start/end`);
        previousEnd = to;
      }
    }
  }
  if (errors.length) throw new Error(errors.join("\n"));
}

export async function validateAssets(bundle, root = ".") {
  const images = [
    ...bundle.home.gallery.map((photo) => photo.src),
    ...bundle.speakers.map((person) => person.image),
    ...bundle.team.map((person) => person.image),
    ...bundle.sponsors.map((sponsor) => sponsor.logo),
  ];
  const available = new Set();
  const walk = async (dir) => {
    for (const entry of await readdir(path.join(root, dir), {
      withFileTypes: true,
    })) {
      const name = `${dir}/${entry.name}`;
      if (entry.isDirectory()) await walk(name);
      else available.add(name.replace("media/originals/", "images/"));
    }
  };
  await walk("media/originals");
  for (const image of images)
    if (!available.has(image)) throw new Error(`Missing image: ${image}`);
  for (const icon of ["favicon.ico", "android-chrome-192x192.png"])
    await access(path.join(root, "public/icons", icon));
}

export async function validateContent(root = ".") {
  const bundle = await readContent(root);
  validateRelationships(bundle);
  await validateAssets(bundle, root);
  return bundle;
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  try {
    const bundle = await validateContent();
    console.log(
      `Content valid: ${bundle.events.length} editions, ${bundle.speakers.length} speakers, ${bundle.sessions.length} sessions, ${bundle.agenda.length} schedule entries.`,
    );
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
