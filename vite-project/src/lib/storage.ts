// src/lib/storage.ts
import type { ParsedStats } from "@/types";

const KEYS = {
  RAW:   "pulse_csv_raw",
  NAME:  "pulse_csv_name",
  STATS: "pulse_csv_stats",
} as const;

export const CSV_UPDATED_EVENT = "pulse_csv_updated";

export function saveRawCSV(text: string, name: string): boolean {
  try {
    localStorage.setItem(KEYS.RAW, text);
    localStorage.setItem(KEYS.NAME, name);
    return true;
  } catch {
    localStorage.removeItem(KEYS.RAW);
    localStorage.removeItem(KEYS.NAME);
    return false;
  }
}

export function saveStats(stats: ParsedStats | null): void {
  try {
    if (stats) {
      localStorage.setItem(KEYS.STATS, JSON.stringify({ ...stats, rows: [] }));
    } else {
      localStorage.removeItem(KEYS.STATS);
    }
  } catch { /* quota */ }
  window.dispatchEvent(new Event(CSV_UPDATED_EVENT));
}

export function loadRawCSV(): { text: string; name: string } | null {
  try {
    const text = localStorage.getItem(KEYS.RAW);
    const name = localStorage.getItem(KEYS.NAME);
    return text && name ? { text, name } : null;
  } catch { return null; }
}

export function getStoredStats(): ParsedStats | null {
  try {
    const raw = localStorage.getItem(KEYS.STATS);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function clearCSVStorage(): void {
  localStorage.removeItem(KEYS.RAW);
  localStorage.removeItem(KEYS.NAME);
  saveStats(null);
}