// src/context/AppContext.tsx
// Unified context — replaces CsvDataContext.tsx + DateRangeContext.tsx
//
// FIX: added "csv" to LiveMode so the data-source toggle can select CSV data.
// FIX: persisted apiUrl and mode to localStorage so "Live API" survives refresh.
// FIX: DATE_PRESETS built inside lazy initialiser (avoids midnight-cache drift).

import {
  createContext, useContext, useState, useEffect, useCallback,
  useRef, useMemo, type ReactNode,
} from "react";
import type { ParsedStats, AnalyticsSnapshot } from "@/types";
import { parseCSV, analyzeData }                          from "@/lib/csvParser";
import { saveRawCSV, saveStats, loadRawCSV, clearCSVStorage } from "@/lib/storage";
import { analyticsData }                                  from "@/lib/analyticsData";

// ═════════════════════════════════════════════════════════════════════════════
// 1. DATE RANGE
// ═════════════════════════════════════════════════════════════════════════════

export interface DateRange { from: Date; to: Date; label: string }

function daysAgo(n: number): Date {
  const d = new Date(); d.setDate(d.getDate() - n); d.setHours(0, 0, 0, 0); return d;
}
function endOfDay(): Date {
  const d = new Date(); d.setHours(23, 59, 59, 999); return d;
}

function buildPresets(): DateRange[] {
  return [
    { label: "Last 7 days",    from: daysAgo(7),   to: endOfDay() },
    { label: "Last 30 days",   from: daysAgo(30),  to: endOfDay() },
    { label: "Last 90 days",   from: daysAgo(90),  to: endOfDay() },
    { label: "Last 6 months",  from: daysAgo(180), to: endOfDay() },
    { label: "Last 12 months", from: daysAgo(365), to: endOfDay() },
    { label: "All time",       from: new Date("2025-01-01"), to: endOfDay() },
  ];
}

export const DATE_PRESETS = buildPresets();

interface DateRangeCtx { range: DateRange; setRange: (r: DateRange) => void; presets: DateRange[] }
const DateRangeContext = createContext<DateRangeCtx | null>(null);

export function useDateRange() {
  const ctx = useContext(DateRangeContext);
  if (!ctx) throw new Error("useDateRange must be used inside <AppProvider>");
  return ctx;
}

export function fmtDate(d: Date): string {
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
export function toInputDate(d: Date): string { return d.toISOString().split("T")[0]; }

// ═════════════════════════════════════════════════════════════════════════════
// 2. CSV DATA
// ═════════════════════════════════════════════════════════════════════════════

interface CsvDataCtx {
  stats: ParsedStats | null;
  fileName: string | null;
  loading: boolean;
  oversized: boolean;
  uploadCSV: (text: string, name: string) => void;
  clearCSV: () => void;
}
const CsvDataContext = createContext<CsvDataCtx | null>(null);

export function useCsvData() {
  const ctx = useContext(CsvDataContext);
  if (!ctx) throw new Error("useCsvData must be used inside <AppProvider>");
  return ctx;
}

// ═════════════════════════════════════════════════════════════════════════════
// 3. LIVE DATA
// ═════════════════════════════════════════════════════════════════════════════

// FIX: added "csv" — lets all dashboard pages show uploaded CSV data.
export type LiveMode = "demo" | "api" | "none" | "csv";

type LiveSnapshot = Omit<AnalyticsSnapshot, "source" | "csvStats" | "fileName" | "uploadedAt">;

interface LiveDataCtx {
  snapshot: LiveSnapshot | null;
  mode: LiveMode;
  apiUrl: string;
  setApiUrl: (u: string) => void;
  setMode: (m: LiveMode) => void;
  lastUpdated: Date | null;
  isPolling: boolean;
  refresh: () => void;
}
const LiveDataContext = createContext<LiveDataCtx | null>(null);

export function useLiveData() {
  const ctx = useContext(LiveDataContext);
  if (!ctx) throw new Error("useLiveData must be used inside <AppProvider>");
  return ctx;
}

// ─── localStorage keys ────────────────────────────────────────────────────────
const LS_API_URL = "pulse_api_url";
const LS_MODE    = "pulse_mode";

// ═════════════════════════════════════════════════════════════════════════════
// 4. UNIFIED PROVIDER
// ═════════════════════════════════════════════════════════════════════════════

export function AppProvider({ children }: { children: ReactNode }) {
  // ── Date Range ─────────────────────────────────────────────────────────────
  const presets = useMemo(() => buildPresets(), []);
  const [range, setRangeState] = useState<DateRange>(() => presets[1]);
  const setRange = useCallback((r: DateRange) => setRangeState(r), []);

  // ── CSV ────────────────────────────────────────────────────────────────────
  const [csvStats,    setCsvStats]    = useState<ParsedStats | null>(null);
  const [csvFileName, setCsvFileName] = useState<string | null>(null);
  const [csvLoading,  setCsvLoading]  = useState(true);
  const [oversized,   setOversized]   = useState(false);

  useEffect(() => {
    const saved = loadRawCSV();
    if (saved) {
      const rows = parseCSV(saved.text);
      const cols = rows.length > 0 ? Object.keys(rows[0]) : [];
      setCsvStats(analyzeData(rows, cols, saved.name));
      setCsvFileName(saved.name);
    }
    setCsvLoading(false);
  }, []);

  useEffect(() => { if (!csvLoading) saveStats(csvStats); }, [csvStats, csvLoading]);

  const uploadCSV = useCallback((text: string, name: string) => {
    const persisted = saveRawCSV(text, name);
    setOversized(!persisted);
    const rows = parseCSV(text);
    const cols = rows.length > 0 ? Object.keys(rows[0]) : [];
    setCsvStats(analyzeData(rows, cols, name));
    setCsvFileName(name);
  }, []);

  const clearCSV = useCallback(() => {
    clearCSVStorage();
    setCsvStats(null);
    setCsvFileName(null);
    setOversized(false);
  }, []);

  // ── Live Data ──────────────────────────────────────────────────────────────
  const [mode, setModeState] = useState<LiveMode>(() => {
    const stored = localStorage.getItem(LS_MODE) as LiveMode | null;
    // FIX: accept "csv" as a valid persisted mode
    return (stored === "demo" || stored === "api" || stored === "none" || stored === "csv")
      ? stored : "demo";
  });

  const [apiUrl, setApiUrlState] = useState<string>(
    () => localStorage.getItem(LS_API_URL) ?? "",
  );

  const setMode = useCallback((m: LiveMode) => {
    setModeState(m);
    localStorage.setItem(LS_MODE, m);
  }, []);

  const setApiUrl = useCallback((u: string) => {
    setApiUrlState(u);
    localStorage.setItem(LS_API_URL, u);
  }, []);

  const [snapshot,    setSnapshot]    = useState<LiveSnapshot | null>(analyticsData);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(new Date());
  const [isPolling,   setIsPolling]   = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchApi = useCallback(async () => {
    if (!apiUrl) return;
    setIsPolling(true);
    try {
      const res = await fetch(apiUrl, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: LiveSnapshot = await res.json();
      setSnapshot(data);
      setLastUpdated(new Date());
    } catch {
      // keep stale snapshot
    } finally {
      setIsPolling(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current);

    if (mode === "demo") {
      setSnapshot(analyticsData);
      setLastUpdated(new Date());
      pollRef.current = setInterval(() => setLastUpdated(new Date()), 30_000);
    } else if (mode === "api" && apiUrl) {
      fetchApi();
      pollRef.current = setInterval(fetchApi, 30_000);
    } else {
      // "none" or "csv" — no live snapshot needed; useAnalytics reads csvStats directly
      setSnapshot(null);
    }

    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [mode, apiUrl, fetchApi]);

  const refresh = useCallback(() => {
    if (mode === "demo") setLastUpdated(new Date());
    else if (mode === "api") fetchApi();
  }, [mode, fetchApi]);

  return (
    <DateRangeContext.Provider value={{ range, setRange, presets }}>
      <CsvDataContext.Provider value={{
        stats: csvStats, fileName: csvFileName, loading: csvLoading,
        oversized, uploadCSV, clearCSV,
      }}>
        <LiveDataContext.Provider value={{
          snapshot, mode, apiUrl, setApiUrl, setMode,
          lastUpdated, isPolling, refresh,
        }}>
          {children}
        </LiveDataContext.Provider>
      </CsvDataContext.Provider>
    </DateRangeContext.Provider>
  );
}