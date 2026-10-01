import { getCollection, getEntry } from "astro:content";
import { createModel } from "./model.mjs";
import {
  siteSchema,
  homeSchema,
  sessionsPageSchema,
  schedulePageSchema,
  uiSchema,
} from "./schemas.mjs";
import siteData from "../../content/site.json";
import homeData from "../../content/pages/home.json";
import sessionsData from "../../content/pages/sessions.json";
import scheduleData from "../../content/pages/schedule.json";
import uiData from "../../content/ui.json";

export const site = siteSchema.parse(siteData);
export const homeCopy = homeSchema.parse(homeData);
export const sessionsCopy = sessionsPageSchema.parse(sessionsData);
export const scheduleCopy = schedulePageSchema.parse(scheduleData);
export const ui = uiSchema.parse(uiData);

export async function getConference() {
  const eventId = process.env.JDC_EVENT_ID || site.eventId;
  const entry = await getEntry("events", eventId);
  if (!entry) throw new Error(`Unknown event: ${eventId}`);
  const [speakers, sessions, agenda, sponsors, team] = await Promise.all([
    getCollection("speakers"),
    getCollection("sessions"),
    getCollection("agenda"),
    getCollection("sponsors"),
    getCollection("team"),
  ]);
  return createModel(entry.data, {
    speakers: speakers.map((entry) => entry.data),
    sessions: sessions.map((entry) => entry.data),
    agenda: agenda.map((entry) => entry.data),
    sponsors: sponsors.map((entry) => entry.data),
    team: team.map((entry) => entry.data),
  });
}
export type Conference = Awaited<ReturnType<typeof getConference>>;
