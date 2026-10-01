import { parseTime } from "./time.mjs";

/**
 * Only identifiers establish relationships; display text is never a key.
 * @param {import('astro/zod').z.infer<typeof import('./schemas.mjs').eventSchema>} event
 * @param {{speakers: import('astro/zod').z.infer<typeof import('./schemas.mjs').speakerSchema>[], sessions: import('astro/zod').z.infer<typeof import('./schemas.mjs').sessionSchema>[], agenda: import('astro/zod').z.infer<typeof import('./schemas.mjs').agendaSchema>[], sponsors: import('astro/zod').z.infer<typeof import('./schemas.mjs').sponsorSchema>[], team: import('astro/zod').z.infer<typeof import('./schemas.mjs').teamSchema>[]}} records
 */
export function createModel(
  event,
  { speakers, sessions, agenda, sponsors, team },
) {
  const eventSpeakers = speakers.filter((item) => item.eventId === event.id);
  const speakerById = new Map(eventSpeakers.map((item) => [item.id, item]));
  const eventSessions = sessions
    .filter((item) => item.eventId === event.id)
    .sort((a, b) => a.order - b.order)
    .map((session) => ({
      ...session,
      speakers: session.speakerIds.map((id) => {
        const speaker = speakerById.get(id);
        if (!speaker)
          throw new Error(`Session ${session.id}: unknown speaker ${id}`);
        return speaker;
      }),
    }));
  const sessionById = new Map(eventSessions.map((item) => [item.id, item]));
  const schedule = agenda
    .filter((item) => item.eventId === event.id)
    .sort((a, b) => a.order - b.order)
    .map((slot) => {
      const session = slot.sessionId ? sessionById.get(slot.sessionId) : null;
      if (slot.sessionId && !session)
        throw new Error(`Slot ${slot.id}: unknown session ${slot.sessionId}`);
      return {
        ...slot,
        session,
        startMinutes: parseTime(slot.start),
        endMinutes: parseTime(slot.end),
      };
    });
  return {
    event,
    speakers: eventSpeakers,
    sessions: eventSessions,
    schedule,
    sponsors: sponsors.filter((item) => item.eventId === event.id),
    team: [...team].sort((a, b) => a.order - b.order),
    sessionById,
    speakerById,
  };
}
