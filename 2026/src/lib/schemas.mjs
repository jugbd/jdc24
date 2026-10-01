import { z } from "astro/zod";

const text = z
  .string()
  .refine(
    (value) => !/<\/?[a-z][^>]*>/i.test(value),
    "Use plain text or Markdown, not HTML",
  );
const id = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const webUrl = z
  .url()
  .refine((value) => /^https?:\/\//.test(value), "Use an HTTP(S) URL");
const image = z
  .string()
  .regex(/^images\/[a-zA-Z0-9_./-]+$/)
  .refine((value) => !value.includes(".."), "Invalid asset path");
const time = z
  .string()
  .regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/)
  .nullable();
const instant = z.iso.datetime({ offset: true }).nullable();
const status = z.enum(["unannounced", "announced"]);
const link = z.strictObject({ text, link: webUrl });

export const eventSchema = z
  .strictObject({
    id,
    year: z.number().int().min(2000),
    edition: z.number().int().positive(),
    editionLabel: text,
    title: text,
    headline: z.strictObject({ before: text, accent: text, after: text }),
    timezone: z.string().refine((value) => {
      try {
        new Intl.DateTimeFormat("en", { timeZone: value });
        return true;
      } catch {
        return false;
      }
    }, "Unknown IANA timezone"),
    startsAt: instant,
    endsAt: instant,
    programmeStatus: z.enum(["unannounced", "published"]),
    cta: link,
    venue: z.strictObject({
      status,
      name: text.nullable(),
      street: text.nullable(),
      city: text,
      mapUrl: webUrl.nullable(),
      mapEmbedUrl: webUrl.nullable(),
    }),
  })
  .superRefine((event, ctx) => {
    if (
      event.headline.before + event.headline.accent + event.headline.after !==
      event.title
    )
      ctx.addIssue({
        code: "custom",
        message: "Headline segments must equal the full title",
      });
    if (Boolean(event.startsAt) !== Boolean(event.endsAt))
      ctx.addIssue({
        code: "custom",
        message: "Set both startsAt and endsAt, or neither",
      });
    if (
      event.startsAt &&
      event.endsAt &&
      Date.parse(event.endsAt) <= Date.parse(event.startsAt)
    )
      ctx.addIssue({ code: "custom", message: "endsAt must follow startsAt" });
    if (event.venue.status === "announced" && !event.venue.name)
      ctx.addIssue({
        code: "custom",
        message: "An announced venue needs a name",
      });
  });
export const speakerSchema = z.strictObject({
  id,
  eventId: id,
  name: text.min(1),
  role: text,
  company: text,
  image,
  linkedin: webUrl.nullable(),
  twitter: webUrl.nullable(),
  website: webUrl.nullable(),
});
export const sessionSchema = z
  .strictObject({
    id,
    eventId: id,
    order: z.number().int().nonnegative(),
    status,
    title: text.nullable(),
    track: text.nullable(),
    speakerIds: z.array(id),
    tags: z.array(text),
  })
  .superRefine((session, ctx) => {
    if (session.status === "announced" && !session.title)
      ctx.addIssue({
        code: "custom",
        message: "An announced session needs a title",
      });
    if (new Set(session.speakerIds).size !== session.speakerIds.length)
      ctx.addIssue({ code: "custom", message: "Duplicate speaker reference" });
  });
export const agendaSchema = z
  .strictObject({
    id,
    eventId: id,
    order: z.number().int().nonnegative(),
    kind: z.enum(["session", "break", "plenary"]),
    sessionId: id.nullable(),
    title: text.nullable(),
    presenter: text.nullable(),
    start: time,
    end: time,
  })
  .superRefine((slot, ctx) => {
    if ((slot.kind === "session") !== Boolean(slot.sessionId))
      ctx.addIssue({
        code: "custom",
        message: "Only session slots must reference a sessionId",
      });
    if (
      slot.kind === "session" &&
      (slot.title !== null || slot.presenter !== null)
    )
      ctx.addIssue({
        code: "custom",
        message:
          "Session titles and speakers must come from their referenced records",
      });
    if (slot.kind !== "session" && !slot.title)
      ctx.addIssue({
        code: "custom",
        message: "Breaks and plenaries need a title",
      });
    if (
      Boolean(slot.start) !== Boolean(slot.end) ||
      (slot.start && slot.end && slot.end <= slot.start)
    )
      ctx.addIssue({
        code: "custom",
        message: "Use a complete, increasing start/end time pair",
      });
  });
export const sponsorSchema = z.strictObject({
  id,
  eventId: id,
  name: text,
  logo: image,
  website: webUrl,
});
export const teamSchema = z.strictObject({
  id,
  order: z.number().int().nonnegative(),
  name: text,
  company: text,
  linkedin: webUrl.nullable(),
  image,
});
export const siteSchema = z.strictObject({
  eventId: id,
  url: webUrl,
  basePath: z.string().regex(/^\/.*\/$/),
  brand: text,
  description: text,
  email: z.email(),
  social: z.array(z.strictObject({ name: text, link: webUrl })),
  copyright: text,
  footerCode: text,
  nav: z.array(
    z.strictObject({
      id,
      label: text,
      path: z
        .string()
        .refine(
          (value) => !/^(?:[a-z]+:|\/)/i.test(value) && !value.includes(".."),
          "Use a relative site path",
        ),
    }),
  ),
});
export const aboutSchema = z.strictObject({
  id: z.literal("about"),
  title: text,
});
export const homeSchema = z.strictObject({
  aboutHeading: text,
  aboutSince: text,
  terminalTitle: text,
  terminalPackage: text,
  terminalFactory: text,
  terminalVariable: text,
  terminalCountdown: text,
  terminalJoin: text,
  secondaryCta: text,
  stats: z.array(
    z.strictObject({
      key: z.enum(["edition", "talks", "speakers", "volunteers"]),
      label: text,
    }),
  ),
  whyTitle: text,
  why: z.array(z.strictObject({ title: text, body: text })),
  speakersTitle: text,
  speakersLink: text,
  speakersPending: text,
  scheduleTitle: text,
  scheduleLink: text,
  galleryTitle: text,
  sponsorsTitle: text,
  sponsorsPending: text,
  sponsorsInvite: text,
  sponsorshipSubject: text,
  teamTitle: text,
  teamSubtitle: text,
  venueTitle: text,
  addressLabel: text,
  mapLabel: text,
  updatesTitle: text,
  updatesBody: text,
  updatesLink: webUrl,
  gallery: z.array(z.strictObject({ src: image, alt: text.min(1) })).min(1),
});
export const sessionsPageSchema = z.strictObject({
  title: text,
  description: text,
  pending: text,
  empty: text,
  all: text,
  filterLabel: text,
  count: text,
});
export const schedulePageSchema = z.strictObject({
  title: text,
  description: text,
  pending: text,
  hint: text,
  empty: text,
  timezoneLabel: text,
});
export const uiSchema = z.strictObject({
  skip: text.min(1),
  navLabel: text.min(1),
  paletteLabel: text.min(1),
  themeLabel: text.min(1),
  lightTheme: text.min(1),
  darkTheme: text.min(1),
  datePending: text.min(1),
  timePending: text.min(1),
  venuePending: text.min(1),
  speakerPending: text.min(1),
  titlePending: text.min(1),
  trackPending: text.min(1),
  details: text.min(1),
  speakerDetails: text.min(1),
  close: text.min(1),
  agenda: text.min(1),
  addAgenda: text.min(1),
  removeAgenda: text.min(1),
  saved: text.min(1),
  removed: text.min(1),
  storageUnavailable: text.min(1),
  countdownPending: text.min(1),
  countdownLive: text.min(1),
  countdownDone: text.min(1),
  live: text.min(1),
  past: text.min(1),
  now: text.min(1),
  previousPhotos: text.min(1),
  nextPhotos: text.min(1),
  aboutPhoto: text.min(1),
  talks: text.min(1),
  bio: text.min(1),
  socialLabels: z.strictObject({
    linkedin: text,
    twitter: text,
    website: text,
  }),
  scheduleTags: z.strictObject({ break: text, plenary: text, session: text }),
  scheduleLevels: z.strictObject({ break: text, plenary: text, session: text }),
});
