export function createStorage(getStorage = () => globalThis.localStorage) {
  const memory = new Map();
  let persistent = true;
  return {
    get persistent() {
      return persistent;
    },
    read(key) {
      if (memory.has(key)) return memory.get(key);
      try {
        return getStorage()?.getItem(key) ?? null;
      } catch {
        persistent = false;
        return null;
      }
    },
    write(key, value) {
      memory.set(key, value);
      try {
        getStorage().setItem(key, value);
      } catch {
        persistent = false;
      }
    },
  };
}

export function createAgenda(eventId, validIds, storage = createStorage()) {
  const key = `${eventId}:agenda:v1`;
  const allowed = new Set(validIds);
  let saved;
  try {
    saved = JSON.parse(storage.read(key) || "[]");
  } catch {
    saved = [];
  }
  const selected = new Set(
    Array.isArray(saved)
      ? saved.filter((id) => typeof id === "string" && allowed.has(id))
      : [],
  );
  return {
    key,
    get persistent() {
      return storage.persistent;
    },
    has: (id) => selected.has(id),
    ids: () => [...selected],
    toggle(id) {
      if (!allowed.has(id)) return false;
      if (selected.has(id)) selected.delete(id);
      else selected.add(id);
      storage.write(key, JSON.stringify([...selected]));
      return selected.has(id);
    },
  };
}
