import { useEffect, useState, useSyncExternalStore } from "react";

export type Profile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  targetRole: string;
  summary: string;
  education: string;
  skills: string;
  experience: string;
  extras: string;
  createdAt: number;
  updatedAt: number;
};

type Store = {
  profiles: Profile[];
  activeId: string | null;
};

const KEY = "fumanai.store.v1";
const EMPTY: Store = { profiles: [], activeId: null };

function read(): Store {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Store;
    return { profiles: parsed.profiles ?? [], activeId: parsed.activeId ?? null };
  } catch {
    return EMPTY;
  }
}

const listeners = new Set<() => void>();
let cache: Store = EMPTY;
let cacheLoaded = false;
function loadCache() {
  cache = read();
  cacheLoaded = true;
}
function emit() {
  loadCache();
  listeners.forEach((l) => l());
}
function write(s: Store) {
  localStorage.setItem(KEY, JSON.stringify(s));
  cache = s;
  cacheLoaded = true;
  emit();
}

export function useProfiles() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const state = useSyncExternalStore(
    (cb) => {
      if (!cacheLoaded) loadCache();
      listeners.add(cb);
      const handler = (e: StorageEvent) => {
        if (e.key === KEY) {
          loadCache();
          cb();
        }
      };
      window.addEventListener("storage", handler);
      return () => {
        listeners.delete(cb);
        window.removeEventListener("storage", handler);
      };
    },
    () => cache,
    () => EMPTY,
  );
  return { ...state, hydrated };
}

export function getActive(): Profile | null {
  const s = read();
  return s.profiles.find((p) => p.id === s.activeId) ?? null;
}

export function saveProfile(p: Omit<Profile, "id" | "createdAt" | "updatedAt"> & { id?: string }): Profile {
  const s = read();
  const now = Date.now();
  if (p.id) {
    const idx = s.profiles.findIndex((x) => x.id === p.id);
    if (idx >= 0) {
      const updated: Profile = { ...s.profiles[idx], ...p, id: p.id, updatedAt: now };
      s.profiles[idx] = updated;
      write(s);
      return updated;
    }
  }
  const created: Profile = {
    ...p,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
  s.profiles.push(created);
  s.activeId = created.id;
  write(s);
  return created;
}

export function deleteProfile(id: string) {
  const s = read();
  s.profiles = s.profiles.filter((p) => p.id !== id);
  if (s.activeId === id) s.activeId = s.profiles[0]?.id ?? null;
  write(s);
}

export function setActive(id: string) {
  const s = read();
  if (s.profiles.some((p) => p.id === id)) {
    s.activeId = id;
    write(s);
  }
}

export function clearAll() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(KEY);
    emit();
  }
}