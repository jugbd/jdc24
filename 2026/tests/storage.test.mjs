import test from "node:test";
import assert from "node:assert/strict";
import { createAgenda, createStorage } from "../src/lib/storage.mjs";
function store(initial) {
  const values = new Map(Object.entries(initial));
  return createStorage(() => ({
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  }));
}
test("malformed and non-array saved agendas recover without breaking the page", () => {
  for (const value of ["{", "{}", "null", "1", '"text"']) {
    const agenda = createAgenda(
      "jdc-2026",
      ["session-a"],
      store({ "jdc-2026:agenda:v1": value }),
    );
    assert.deepEqual(agenda.ids(), []);
    assert.equal(agenda.toggle("session-a"), true);
  }
});
test("agenda drops unknown IDs and duplicates, and isolates event editions", () => {
  const storage = store({
    "jdc-2026:agenda:v1": '["session-a","session-a","removed",12]',
    "jdc-2025:agenda:v1": '["session-b"]',
  });
  const current = createAgenda("jdc-2026", ["session-a", "session-b"], storage);
  assert.deepEqual(current.ids(), ["session-a"]);
  assert.equal(current.toggle("unknown"), false);
  current.toggle("session-b");
  assert.deepEqual(
    createAgenda("jdc-2026", ["session-a", "session-b"], storage).ids(),
    ["session-a", "session-b"],
  );
  assert.deepEqual(
    createAgenda("jdc-2025", ["session-a", "session-b"], storage).ids(),
    ["session-b"],
  );
});
test("unavailable storage retains working in-memory interactions", () => {
  const storage = createStorage(() => {
    throw new Error("SecurityError");
  });
  const agenda = createAgenda("jdc-2026", ["session-a"], storage);
  assert.equal(agenda.toggle("session-a"), true);
  assert.equal(agenda.has("session-a"), true);
  assert.equal(agenda.persistent, false);
  assert.equal(agenda.toggle("session-a"), false);
});
test("quota failures retain the current selection", () => {
  const storage = createStorage(() => ({
    getItem: () => null,
    setItem: () => {
      throw new Error("QuotaExceededError");
    },
  }));
  const agenda = createAgenda("jdc-2026", ["session-a"], storage);
  agenda.toggle("session-a");
  assert.equal(agenda.has("session-a"), true);
  assert.equal(agenda.persistent, false);
});
