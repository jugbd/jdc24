import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import {
  eventSchema,
  speakerSchema,
  sessionSchema,
  agendaSchema,
  sponsorSchema,
  teamSchema,
  aboutSchema,
} from "./lib/schemas.mjs";

const loader = (base: string, pattern: string) =>
  glob({ base, pattern, generateId: ({ data }) => String(data.id) });
export const collections = {
  events: defineCollection({
    loader: loader("./content/events", "*.json"),
    schema: eventSchema,
  }),
  speakers: defineCollection({
    loader: loader("./content/collections/speakers", "*.md"),
    schema: speakerSchema,
  }),
  sessions: defineCollection({
    loader: loader("./content/collections/sessions", "*.md"),
    schema: sessionSchema,
  }),
  agenda: defineCollection({
    loader: loader("./content/collections/agenda", "*.json"),
    schema: agendaSchema,
  }),
  sponsors: defineCollection({
    loader: loader("./content/collections/sponsors", "*.json"),
    schema: sponsorSchema,
  }),
  team: defineCollection({
    loader: loader("./content/collections/team", "*.json"),
    schema: teamSchema,
  }),
  pages: defineCollection({
    loader: loader("./content/pages", "*.md"),
    schema: aboutSchema,
  }),
};
