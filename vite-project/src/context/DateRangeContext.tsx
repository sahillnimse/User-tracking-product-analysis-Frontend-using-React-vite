// src/context/DateRangeContext.tsx
import {
    createContext, useContext, useState, useCallback,
    type ReactNode,
  } from "react";
  
  // ── Types ─────────────────────────────────────────────────────────────────────
  export interface DateRange {
    from:  Date;
    to:    Date;
    label: string;
  }
  
  interface DateRangeContextValue {
    range:    DateRange;
    setRange: (r: DateRange) => void;
    presets:  DateRange[];
  }
  
  // ── Preset builder ────────────────────────────────────────────────────────────
  function daysAgo(n: number): Date {
    const d = new Date();
    d.setDate(d.getDate() - n);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  
  function today(): Date {
    const d = new Date();
    d.setHours(23, 59, 59, 999);
    return d;
  }
  
  export const DATE_PRESETS: DateRange[] = [
    { label: "Last 7 days",   from: daysAgo(7),   to: today() },
    { label: "Last 30 days",  from: daysAgo(30),  to: today() },
    { label: "Last 90 days",  from: daysAgo(90),  to: today() },
    { label: "Last 6 months", from: daysAgo(180), to: today() },
    { label: "Last 12 months",from: daysAgo(365), to: today() },
    { label: "All time",      from: new Date("2025-01-01"), to: today() },
  ];
  
  // ── Context ───────────────────────────────────────────────────────────────────
  const DateRangeContext = createContext<DateRangeContextValue | null>(null);
  
  export function useDateRange(): DateRangeContextValue {
    const ctx = useContext(DateRangeContext);
    if (!ctx) throw new Error("useDateRange must be used inside <DateRangeProvider>");
    return ctx;
  }
  
  export function DateRangeProvider({ children }: { children: ReactNode }) {
    // Default: Last 30 days
    const [range, setRangeState] = useState<DateRange>(DATE_PRESETS[1]);
  
    const setRange = useCallback((r: DateRange) => {
      setRangeState(r);
    }, []);
  
    return (
      <DateRangeContext.Provider value={{ range, setRange, presets: DATE_PRESETS }}>
        {children}
      </DateRangeContext.Provider>
    );
  }
  
  // ── Utility: format a Date as "DD MMM YYYY" ──────────────────────────────────
  export function fmtDate(d: Date): string {
    return d.toLocaleDateString("en-IN", {
      day:   "2-digit",
      month: "short",
      year:  "numeric",
    });
  }
  
  // ── Utility: format Date for <input type="date"> ──────────────────────────────
  export function toInputDate(d: Date): string {
    return d.toISOString().split("T")[0];
  }