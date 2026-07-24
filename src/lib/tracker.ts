import { useEffect, useState, useSyncExternalStore } from "react";

export const TRACKER_COLUMNS = [
  "Applied",
  "No Response",
  "Online Assessment",
  "Interview",
  "Offer Received",
  "Hired",
  "Declined",
] as const;
export type TrackerColumn = (typeof TRACKER_COLUMNS)[number];

export type JobCard = {
  id: string;
  title: string;
  company: string;
  location: string;
  matchScore: number;
  column: TrackerColumn;
  createdAt: number;
};

const KEY = "fumanai.tracker.v1";
const EMPTY: JobCard[] = [];

function read(): JobCard[] {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as JobCard[];
    return Array.isArray(parsed) ? parsed : EMPTY;
  } catch {
    return EMPTY;
  }
}

const listeners = new Set<() => void>();
let cache: JobCard[] = EMPTY;
let cacheLoaded = false;
function loadCache() {
  cache = read();
  cacheLoaded = true;
}
function emit() {
  loadCache();
  listeners.forEach((l) => l());
}
function write(cards: JobCard[]) {
  localStorage.setItem(KEY, JSON.stringify(cards));
  cache = cards;
  cacheLoaded = true;
  emit();
}

export function useTracker() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const cards = useSyncExternalStore(
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
  return { cards, hydrated };
}

export function addJobCard(input: Omit<JobCard, "id" | "createdAt" | "column"> & { column?: TrackerColumn }): JobCard {
  const cards = read();
  const card: JobCard = {
    id: crypto.randomUUID(),
    title: input.title || "Untitled role",
    company: input.company || "Unknown company",
    location: input.location || "Unknown location",
    matchScore: Math.max(0, Math.min(10, Number(input.matchScore) || 0)),
    column: input.column ?? "Applied",
    createdAt: Date.now(),
  };
  write([card, ...cards]);
  return card;
}

export function moveJobCard(id: string, column: TrackerColumn) {
  const cards = read().map((c) => (c.id === id ? { ...c, column } : c));
  write(cards);
}

export function deleteJobCard(id: string) {
  write(read().filter((c) => c.id !== id));
}