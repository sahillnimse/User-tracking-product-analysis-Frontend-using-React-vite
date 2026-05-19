/**
 * CsvAnalysis.tsx
 *
 * ── PERSISTENCE ──────────────────────────────────────────────────────────────
 * Raw CSV text + filename are saved to localStorage so the file survives
 * page navigation and is auto-restored on mount.
 *
 * ── SHARED DATA (how other pages consume this) ────────────────────────────────
 *   localStorage.getItem("pulse_csv_stats")    → JSON string of ParsedStats
 *   localStorage.getItem("pulse_csv_quality")  → JSON string of QualitySummary
 *
 *   import { getPulseCSVStats, usePulseCSVStats,
 *            getPulseCSVQuality, usePulseCSVQuality } from "@/components/CsvAnalysis";
 *
 *   const stats   = usePulseCSVStats();   // reactive ParsedStats | null
 *   const quality = usePulseCSVQuality(); // reactive QualitySummary | null
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend, BarChart, Bar,
} from "recharts";
import {
  Upload, Users, CreditCard, Zap, TrendingUp, FileText,
  UserX, X, CheckCircle, AlertCircle, ChevronDown, Download, Database,
  Search, ArrowUp, ArrowDown, ArrowUpDown, ShieldAlert, AlertTriangle,
  Info, ChevronRight, Hash, Type, Calendar, Bug, Filter,
} from "lucide-react";

// ── Storage keys ──────────────────────────────────────────────────────────────
const SK = {
  RAW: "pulse_csv_raw",
  NAME: "pulse_csv_name",
  STATS: "pulse_csv_stats",
  QUALITY: "pulse_csv_quality",
} as const;

// ── Public types ─────────────────────────────────────────────────────────────
export interface UserRow { [key: string]: string }

export interface ParsedStats {
  totalUsers: number;
  subscribed: number;
  totalForSub: number;
  activation: number;
  conversion: number;
  draftsCreated: number;
  zeroEngagement: number;
  signupsByMonth: { month: string; signups: number; subs: number }[];
  engagementSegments: { name: string; value: number; color: string }[];
  topEvents: { event: string; count: number }[];
  detectedCols: Record<string, string>;
  columns: string[];
}

export interface QualitySummary {
  totalFlaws: number;
  critical: number;
  warning: number;
  info: number;
  duplicateRows: number;
  emptyRows: number;
  columnCount: number;
  rowCount: number;
}

export interface ColumnProfile {
  name: string;
  detectedType: "string" | "number" | "boolean" | "date" | "mixed";
  total: number;
  empty: number;
  emptyPct: number;
  unique: number;
  uniquePct: number;
  min?: number; max?: number; mean?: number; median?: number; p25?: number; p75?: number;
  minDate?: string; maxDate?: string;
  topValues: { value: string; count: number }[];
  samples: string[];
  whitespaceIssues: number;
  flawCount: number;
  worstSeverity: "critical" | "warning" | "info" | "none";
}

export interface DataFlaw {
  id: string;
  type: "missing" | "type_mismatch" | "duplicate_row" | "outlier" | "whitespace" | "empty_row" | "id_duplicate" | "null_like" | "future_date" | "negative_numeric";
  severity: "critical" | "warning" | "info";
  column?: string;
  rowIndex: number;
  message: string;
  currentValue?: string;
}

export interface DataQualityReport {
  flaws: DataFlaw[];
  profiles: ColumnProfile[];
  totalFlaws: number;
  bySeverity: { critical: number; warning: number; info: number };
  byType: Record<string, number>;
  duplicateRowIndices: Set<number>;
  emptyRowIndices: Set<number>;
  flawCellMap: Map<string, DataFlaw[]>;
}

// ── Public helpers ────────────────────────────────────────────────────────────
export function getPulseCSVStats(): ParsedStats | null {
  try { const r = localStorage.getItem(SK.STATS); return r ? JSON.parse(r) : null; } catch { return null; }
}
export function getPulseCSVQuality(): QualitySummary | null {
  try { const r = localStorage.getItem(SK.QUALITY); return r ? JSON.parse(r) : null; } catch { return null; }
}
export function usePulseCSVStats(): ParsedStats | null {
  const [s, setS] = useState<ParsedStats | null>(getPulseCSVStats);
  useEffect(() => {
    const onSt = (e: StorageEvent) => { if (e.key === SK.STATS) setS(e.newValue ? JSON.parse(e.newValue) : null); };
    const onCust = () => setS(getPulseCSVStats());
    window.addEventListener("storage", onSt);
    window.addEventListener("pulse_csv_updated", onCust);
    return () => { window.removeEventListener("storage", onSt); window.removeEventListener("pulse_csv_updated", onCust); };
  }, []);
  return s;
}
export function usePulseCSVQuality(): QualitySummary | null {
  const [q, setQ] = useState<QualitySummary | null>(getPulseCSVQuality);
  useEffect(() => {
    const onSt = (e: StorageEvent) => { if (e.key === SK.QUALITY) setQ(e.newValue ? JSON.parse(e.newValue) : null); };
    const onCust = () => setQ(getPulseCSVQuality());
    window.addEventListener("storage", onSt);
    window.addEventListener("pulse_csv_updated", onCust);
    return () => { window.removeEventListener("storage", onSt); window.removeEventListener("pulse_csv_updated", onCust); };
  }, []);
  return q;
}

// ── Internal helpers ──────────────────────────────────────────────────────────
function emitUpdate() { window.dispatchEvent(new Event("pulse_csv_updated")); }

function saveStats(stats: ParsedStats | null) {
  if (stats) { try { localStorage.setItem(SK.STATS, JSON.stringify(stats)); } catch { /* quota */ } } else { localStorage.removeItem(SK.STATS); }
  emitUpdate();
}

function saveQuality(report: DataQualityReport | null) {
  if (report) {
    const s: QualitySummary = {
      totalFlaws: report.totalFlaws, critical: report.bySeverity.critical,
      warning: report.bySeverity.warning, info: report.bySeverity.info,
      duplicateRows: report.duplicateRowIndices.size, emptyRows: report.emptyRowIndices.size,
      columnCount: report.profiles.length, rowCount: report.profiles[0]?.total ?? 0,
    };
    try { localStorage.setItem(SK.QUALITY, JSON.stringify(s)); } catch { /* quota */ }
  } else { localStorage.removeItem(SK.QUALITY); }
  emitUpdate();
}

function saveRaw(text: string, name: string) {
  try { localStorage.setItem(SK.RAW, text); localStorage.setItem(SK.NAME, name); }
  catch { localStorage.removeItem(SK.RAW); localStorage.removeItem(SK.NAME); }
}

function loadRaw(): { text: string; name: string } | null {
  try { const txt = localStorage.getItem(SK.RAW); const n = localStorage.getItem(SK.NAME); return txt && n ? { text: txt, name: n } : null; }
  catch { return null; }
}

// ── Theme hook ───────────────────────────────────────────────────────────────
function useIsDark(): boolean {
  const detect = () => document.documentElement.classList.contains("dark") || document.documentElement.getAttribute("data-theme") === "dark" || document.body.classList.contains("dark");
  const [d, setD] = useState(() => { try { return detect(); } catch { return false; } });
  useEffect(() => {
    setD(detect());
    const obs = new MutationObserver(() => setD(detect()));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme"] });
    obs.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);
  return d;
}

const t = (dark: boolean, d: string, l: string) => dark ? d : l;

// ── CSV Parser ───────────────────────────────────────────────────────────────
function parseCSV(text: string): UserRow[] {
  text = text.replace(/^\uFEFF/, "");
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  return lines.slice(1).map((line) => {
    const values: string[] = [];
    let cur = "", inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { inQ = !inQ; }
      else if (ch === "," && !inQ) { values.push(cur.trim()); cur = ""; }
      else { cur += ch; }
    }
    values.push(cur.trim());
    const row: UserRow = {};
    headers.forEach((h, i) => { row[h] = (values[i] ?? "").replace(/^"|"$/g, ""); });
    return row;
  }).filter(row => Object.values(row).some(v => v !== ""));
}

// ── Constants ────────────────────────────────────────────────────────────────
const NULL_LIKE = new Set(["", "null", "n/a", "na", "none", "undefined", "-", "--", "nil", "nan", ""]);
const MAX_DISPLAY_FLAWS = 600;

// ── Column detection ─────────────────────────────────────────────────────────
function detectColumns(columns: string[]): Record<string, string> {
  const lo = (s: string) => s.toLowerCase();
  const find = (...kw: string[]) => columns.find((c) => kw.some((k) => lo(c).includes(k))) ?? "";
  return {
    subscribed: find("subscri", "plan", "paid", "tier", "premium"),
    activation: find("activat", "active", "onboard", "verified", "complete"),
    conversion: find("convert", "purchas", "bought", "checkout"),
    drafts: find("draft", "doc_count", "content_count", "items_created"),
    engagement: find("event_count", "events", "sessions", "session_count", "visits", "page_view", "actions", "engage"),
    date: find("created_at", "created", "signup_date", "joined_at", "joined", "registered_at", "registered", "date", "timestamp"),
  };
}

// ── Data Analyser ─────────────────────────────────────────────────────────────
function analyzeData(rows: UserRow[], columns: string[], overrides: Record<string, string> = {}): ParsedStats {
  const auto = detectColumns(columns);
  const m = { ...auto, ...overrides };
  const lo = (s: string) => s.toLowerCase();
  const isTrue = (v: string) => {
    const s2 = lo(v.trim());
    return s2 === "true" || s2 === "1" || s2 === "yes" || s2 === "y" || s2 === "active" || s2 === "subscribed" || s2 === "completed" || s2 === "pro" || s2 === "paid" || s2.includes("pro") || s2.includes("paid");
  };

  const subCol = m.subscribed, actCol = m.activation, cvrCol = m.conversion;
  const dftCol = m.drafts, engCol = m.engagement, datCol = m.date;
  const n = rows.length;
  const detected: Record<string, string> = {};
  (Object.keys(auto) as (keyof typeof auto)[]).forEach(k => { detected[k] = m[k] || "(not found)"; });

  const subRows = subCol ? rows.filter(r => isTrue(r[subCol] ?? "")) : [];
  const actRows = actCol ? rows.filter(r => isTrue(r[actCol] ?? "")) : [];
  const cvrRows = cvrCol ? rows.filter(r => isTrue(r[cvrCol] ?? "")) : subRows;
  const draftsCreated = dftCol ? rows.reduce((a, r) => a + (parseFloat(r[dftCol] ?? "0") || 0), 0) : 0;
  const zeroEngagement = engCol ? rows.filter(r => { const v = parseFloat(r[engCol] ?? "0"); return isNaN(v) || v === 0; }).length : 0;

  const monthMap: Record<string, { signups: number; subs: number }> = {};
  if (datCol) {
    rows.forEach(r => {
      const raw = r[datCol]; if (!raw || NULL_LIKE.has(lo(raw))) return;
      const d = new Date(raw.includes("T") || raw.includes("-") ? raw : raw.replace(/(\d{2})\/(\d{2})\/(\d{4})/, "$3-$2-$1"));
      if (isNaN(d.getTime())) return;
      const key = d.toLocaleString("default", { month: "short", year: "2-digit" });
      if (!monthMap[key]) monthMap[key] = { signups: 0, subs: 0 };
      monthMap[key].signups++;
      if (subCol && isTrue(r[subCol] ?? "")) monthMap[key].subs++;
    });
  }
  const signupsByMonth = Object.entries(monthMap)
    .sort((a, b) => new Date("1 " + a[0]).getTime() - new Date("1 " + b[0]).getTime())
    .slice(-12)
    .map(([month, v]) => ({ month, ...v }));

  const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];
  let engagementSegments: { name: string; value: number; color: string }[] = [];
  if (engCol) {
    const b = { p: 0, e: 0, c: 0, a: 0, z: 0 };
    rows.forEach(r => { const v = parseFloat(r[engCol] ?? "0") || 0; if (v >= 18) b.p++; else if (v >= 10) b.e++; else if (v >= 3) b.c++; else if (v >= 1) b.a++; else b.z++; });
    engagementSegments = [
      { name: "Power (18+)", value: b.p, color: COLORS[0] },
      { name: "Engaged (10-17)", value: b.e, color: COLORS[1] },
      { name: "Casual (3-9)", value: b.c, color: COLORS[2] },
      { name: "At risk (1-2)", value: b.a, color: COLORS[3] },
      { name: "Zero", value: b.z, color: COLORS[4] },
    ];
  } else {
    engagementSegments = [
      { name: "Power (18+)", value: Math.round(n * 0.15), color: COLORS[0] },
      { name: "Engaged (10-17)", value: Math.round(n * 0.25), color: COLORS[1] },
      { name: "Casual (3-9)", value: Math.round(n * 0.30), color: COLORS[2] },
      { name: "At risk (1-2)", value: Math.round(n * 0.20), color: COLORS[3] },
      { name: "Zero", value: Math.round(n * 0.10), color: COLORS[4] },
    ];
  }

  const topEvents: { event: string; count: number }[] = [];
  const evtCol = columns.find(c => lo(c).includes("event_name") || lo(c).includes("event_type") || lo(c).includes("action") || lo(c).includes("type"));
  if (evtCol) {
    const freq: Record<string, number> = {};
    rows.forEach(r => { const v = r[evtCol]; if (v && !NULL_LIKE.has(lo(v))) freq[v] = (freq[v] || 0) + 1; });
    Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 8).forEach(([event, count]) => topEvents.push({ event, count }));
  }

  return {
    totalUsers: n, subscribed: subRows.length, totalForSub: n,
    activation: n > 0 ? parseFloat(((actRows.length / n) * 100).toFixed(1)) : 0,
    conversion: n > 0 ? parseFloat(((cvrRows.length / n) * 100).toFixed(2)) : 0,
    draftsCreated: Math.round(draftsCreated), zeroEngagement,
    signupsByMonth, engagementSegments, topEvents, detectedCols: detected, columns,
  };
}

// ── Data Quality Profiler ────────────────────────────────────────────────────
function profileData(rows: UserRow[], columns: string[]): DataQualityReport {
  const flaws: DataFlaw[] = [];
  const profiles: ColumnProfile[] = [];
  const flawCellMap = new Map<string, DataFlaw[]>();
  const duplicateRowIndices = new Set<number>();
  const emptyRowIndices = new Set<number>();
  const lo = (s: string) => s.toLowerCase();
  let totalCounted = 0;

  const addFlaw = (f: DataFlaw) => {
    totalCounted++;
    if (f.column && f.rowIndex >= 0) {
      const key = `${f.rowIndex}-${f.column}`;
      const arr = flawCellMap.get(key) || [];
      arr.push(f);
      flawCellMap.set(key, arr);
    }
    if (f.rowIndex === -1 || flaws.length < MAX_DISPLAY_FLAWS) flaws.push(f);
  };

  // Empty rows
  rows.forEach((row, i) => {
    if (columns.every(c => !row[c] || row[c].trim() === "")) {
      emptyRowIndices.add(i);
      addFlaw({ id: `er-${i}`, type: "empty_row", severity: "info", rowIndex: i, message: `Row ${i + 2} is completely empty` });
    }
  });

  // Duplicate rows
  const seen = new Map<string, number[]>();
  rows.forEach((row, i) => {
    const key = columns.map(c => (row[c] ?? "").trim()).join("|||");
    const list = seen.get(key) || [];
    if (list.length > 0) {
      duplicateRowIndices.add(i);
      list.forEach(j => duplicateRowIndices.add(j));
      addFlaw({ id: `dr-${i}`, type: "duplicate_row", severity: "warning", rowIndex: i, message: `Row ${i + 2} duplicates row ${list[0] + 2}` });
    }
    list.push(i);
    seen.set(key, list);
  });

  // Per-column profiling
  columns.forEach(col => {
    const values = rows.map(r => r[col] ?? "");
    const nonEmpty = values.filter(v => v.trim() !== "" && !NULL_LIKE.has(lo(v.trim())));
    const emptyCount = values.length - nonEmpty.length;
    const uniqueVals = new Set(nonEmpty.map(v => v.trim()));

    let numOk = 0, boolOk = 0, dateOk = 0;
    nonEmpty.forEach(v => {
      const s = v.trim();
      if (!isNaN(Number(s)) && s !== "") numOk++;
      if (["true", "false", "1", "0", "yes", "no", "y", "n"].includes(lo(s))) boolOk++;
      if (!isNaN(new Date(s.includes("T") || s.includes("-") ? s : s.replace(/(\d{2})\/(\d{2})\/(\d{4})/, "$3-$2-$1")).getTime())) dateOk++;
    });
    const threshold = nonEmpty.length * 0.8 || 1;
    let detectedType: ColumnProfile["detectedType"] = "string";
    if (numOk >= threshold) detectedType = "number";
    else if (boolOk >= threshold) detectedType = "boolean";
    else if (dateOk >= threshold) detectedType = "date";
    else if (numOk + boolOk + dateOk > nonEmpty.length * 0.3) detectedType = "mixed";

    const profile: ColumnProfile = {
      name: col, detectedType, total: values.length, empty: emptyCount,
      emptyPct: values.length > 0 ? parseFloat(((emptyCount / values.length) * 100).toFixed(1)) : 0,
      unique: uniqueVals.size, uniquePct: nonEmpty.length > 0 ? parseFloat(((uniqueVals.size / nonEmpty.length) * 100).toFixed(1)) : 0,
      topValues: [], samples: nonEmpty.slice(0, 3), whitespaceIssues: 0, flawCount: 0, worstSeverity: "none",
    };

    // Missing values
    if (emptyCount > 0) {
      const sev = emptyCount / values.length > 0.5 ? "critical" : emptyCount / values.length > 0.15 ? "warning" : "info";
      addFlaw({ id: `ms-${col}`, type: "missing", severity: sev, column: col, rowIndex: -1, message: `"${col}": ${emptyCount} missing values (${profile.emptyPct}%)` });
      let shown = 0;
      values.forEach((v, i) => {
        if ((v.trim() === "" || NULL_LIKE.has(lo(v.trim()))) && shown < 30) {
          addFlaw({ id: `mc-${i}-${col}-${shown}`, type: "missing", severity: sev, column: col, rowIndex: i, message: `Missing in "${col}"`, currentValue: v || "(empty)" });
          shown++;
        }
      });
      let nlShown = 0;
      values.forEach((v, i) => {
        if (NULL_LIKE.has(lo(v.trim())) && v.trim() !== "" && nlShown < 5) {
          addFlaw({ id: `nl-${i}-${col}-${nlShown}`, type: "null_like", severity: "info", column: col, rowIndex: i, message: `Null-like value "${v}" in "${col}"`, currentValue: v });
          nlShown++;
        }
      });
    }

    // Whitespace
    values.forEach((v, i) => {
      if (v !== v.trim() && v.trim() !== "") {
        profile.whitespaceIssues++;
        addFlaw({ id: `ws-${i}-${col}-${profile.whitespaceIssues}`, type: "whitespace", severity: "info", column: col, rowIndex: i, message: `Whitespace issue in "${col}"`, currentValue: JSON.stringify(v) });
      }
    });

    // Numeric stats & outliers
    if (detectedType === "number" || detectedType === "mixed") {
      const nums = nonEmpty.map(v => Number(v.trim())).filter(n2 => !isNaN(n2));
      if (nums.length > 0) {
        nums.sort((a, b) => a - b);
        profile.min = nums[0];
        profile.max = nums[nums.length - 1];
        profile.mean = nums.reduce((a, b) => a + b, 0) / nums.length;
        profile.median = nums.length % 2 === 0 ? (nums[nums.length / 2 - 1] + nums[nums.length / 2]) / 2 : nums[Math.floor(nums.length / 2)];
        profile.p25 = nums[Math.floor(nums.length * 0.25)];
        profile.p75 = nums[Math.floor(nums.length * 0.75)];

        let negShown = 0;
        values.forEach((v, i) => { const n2 = Number(v.trim()); if (!isNaN(n2) && n2 < 0 && negShown < 10) { addFlaw({ id: `neg-${i}-${col}-${negShown}`, type: "negative_numeric", severity: "warning", column: col, rowIndex: i, message: `Negative value ${n2} in "${col}"`, currentValue: v }); negShown++; } });

        if (nums.length > 10) {
          const iqr = profile.p75! - profile.p25!;
          if (iqr > 0) {
            const lo2 = profile.p25! - 1.5 * iqr;
            const hi = profile.p75! + 1.5 * iqr;
            let oShown = 0;
            values.forEach((v, i) => { const n2 = Number(v.trim()); if (!isNaN(n2) && (n2 < lo2 || n2 > hi) && oShown < 20) { addFlaw({ id: `out-${i}-${col}-${oShown}`, type: "outlier", severity: "warning", column: col, rowIndex: i, message: `Outlier in "${col}": ${n2} (ok: ${lo2.toFixed(1)}-${hi.toFixed(1)})`, currentValue: v }); oShown++; } });
          }
        }

        if (detectedType === "mixed") {
          let tmShown = 0;
          values.forEach((v, i) => { if (v.trim() !== "" && !NULL_LIKE.has(lo(v.trim())) && isNaN(Number(v.trim())) && tmShown < 20) { addFlaw({ id: `tm-${i}-${col}-${tmShown}`, type: "type_mismatch", severity: "warning", column: col, rowIndex: i, message: `Expected number in "${col}", got "${v}"`, currentValue: v }); tmShown++; } });
        }
      }
    }

    // Date stats
    if (detectedType === "date") {
      const dates: Date[] = [];
      nonEmpty.forEach(v => {
        const s = v.trim();
        const d = new Date(s.includes("T") || s.includes("-") ? s : s.replace(/(\d{2})\/(\d{2})\/(\d{4})/, "$3-$2-$1"));
        if (!isNaN(d.getTime())) dates.push(d);
      });
      if (dates.length > 0) {
        dates.sort((a, b) => a.getTime() - b.getTime());
        profile.minDate = dates[0].toISOString().split("T")[0];
        profile.maxDate = dates[dates.length - 1].toISOString().split("T")[0];
        const now = new Date();
        now.setHours(23, 59, 59, 999);
        let fShown = 0;
        dates.forEach((d, idx) => {
          if (d > now && fShown < 10) {
            const rowIdx = idx;
            addFlaw({ id: `fd-${rowIdx}-${col}-${fShown}`, type: "future_date", severity: "warning", column: col, rowIndex: rowIdx, message: `Future date in "${col}"`, currentValue: d.toISOString().split("T")[0] });
            fShown++;
          }
        });
      }
    }

    // Top values
    const freq: Record<string, number> = {};
    nonEmpty.forEach(v => { const s = v.trim(); freq[s] = (freq[s] || 0) + 1; });
    profile.topValues = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([value, count]) => ({ value, count }));

    // Suspected ID column duplicates
    const idKw = ["id", "uuid", "user_id", "email", "phone", "username"];
    if (idKw.some(k => lo(col).includes(k)) && profile.uniquePct < 99 && nonEmpty.length > 1) {
      addFlaw({ id: `id-${col}`, type: "id_duplicate", severity: "critical", column: col, rowIndex: -1, message: `"${col}" looks like ID but has ${profile.total - profile.unique} duplicates (${(100 - profile.uniquePct).toFixed(1)}% dup)` });
    }

    profiles.push(profile);
  });

  // Recount per-column flaw counts from cell map
  profiles.forEach(p => {
    let cnt = 0;
    let worst: "critical" | "warning" | "info" | "none" = "none";
    for (let i = 0; i < rows.length; i++) {
      const cellFlaws = flawCellMap.get(`${i}-${p.name}`);
      if (cellFlaws) {
        cnt += cellFlaws.length;
        cellFlaws.forEach(f => {
          if (f.severity === "critical") worst = "critical";
          else if (f.severity === "warning" && worst !== "critical") worst = "warning";
          else if (f.severity === "info" && worst === "none") worst = "info";
        });
      }
    }
    p.flawCount = cnt;
    p.worstSeverity = worst;
  });

  const bySeverity = { critical: 0, warning: 0, info: 0 };
  flaws.forEach(f => { bySeverity[f.severity]++; });
  const byType: Record<string, number> = {};
  flaws.forEach(f => { byType[f.type] = (byType[f.type] || 0) + 1; });

  return { flaws, profiles, totalFlaws: totalCounted, bySeverity, byType, duplicateRowIndices, emptyRowIndices, flawCellMap };
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, icon: Icon, trend, dark }: {
  label: string; value: string | number; sub?: string; icon: React.ElementType; trend?: string; dark: boolean;
}) {
  return (
    <div className={`relative rounded-xl border p-4 flex flex-col gap-2 transition-all duration-200 group overflow-hidden ${t(dark, "border-zinc-800 bg-[#111318] hover:border-emerald-500/50", "border-gray-200 bg-white shadow-sm hover:border-emerald-300 hover:shadow-md")}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="flex items-center justify-between">
        <span className={`text-[10px] font-semibold tracking-widest uppercase ${t(dark, "text-zinc-400", "text-gray-400")}`}>{label}</span>
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${t(dark, "bg-emerald-500/10", "bg-emerald-50")}`}>
          <Icon size={13} className={t(dark, "text-emerald-400", "text-emerald-600")} />
        </div>
      </div>
      <div className="flex items-end gap-1.5">
        <span className={`text-2xl font-bold font-mono ${t(dark, "text-white", "text-gray-900")}`}>{value}</span>
        {sub && <span className={`text-sm mb-0.5 ${t(dark, "text-zinc-500", "text-gray-400")}`}>{sub}</span>}
      </div>
      {trend && <span className={`text-[11px] font-medium ${trend.startsWith("-") ? "text-red-400" : t(dark, "text-emerald-400", "text-emerald-600")}`}>{trend}</span>}
    </div>
  );
}

function UploadZone({ onFile, fileName, onClear, dark }: {
  onFile: (text: string, name: string) => void; fileName: string | null; onClear: () => void; dark: boolean;
}) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLInputElement>(null);

  const handle = (file: File) => {
    setError(null);
    if (!file.name.endsWith(".csv")) { setError("Only .csv files are supported."); return; }
    const r = new FileReader();
    r.onload = (e) => onFile(e.target?.result as string, file.name);
    r.readAsText(file);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handle(f);
  }, []);

  if (fileName) return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border w-fit ${t(dark, "border-emerald-500/30 bg-emerald-500/10", "border-emerald-300 bg-emerald-50")}`}>
      <CheckCircle size={16} className={t(dark, "text-emerald-400", "text-emerald-600")} />
      <span className={`text-sm font-mono ${t(dark, "text-emerald-300", "text-emerald-700")}`}>{fileName}</span>
      <button onClick={onClear} className={`ml-1 transition-colors ${t(dark, "text-zinc-500 hover:text-red-400", "text-gray-400 hover:text-red-500")}`}>
        <X size={14} />
      </button>
    </div>
  );

  return (
    <div className="space-y-2">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => ref.current?.click()}
        className={`relative cursor-pointer rounded-xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center gap-3 py-8 px-6 ${dragging ? t(dark, "border-emerald-400 bg-emerald-500/10", "border-emerald-400 bg-emerald-50") : t(dark, "border-zinc-700 bg-transparent hover:border-emerald-500/50 hover:bg-emerald-500/5", "border-gray-200 bg-gray-50/80 hover:border-emerald-300 hover:bg-emerald-50/60")}`}
      >
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${dragging ? t(dark, "bg-emerald-500/20", "bg-emerald-100") : t(dark, "bg-zinc-800", "bg-white shadow-sm")}`}>
          <Upload size={22} className={dragging ? t(dark, "text-emerald-400", "text-emerald-600") : t(dark, "text-zinc-400", "text-gray-400")} />
        </div>
        <div className="text-center">
          <p className={`text-sm font-medium ${t(dark, "text-zinc-200", "text-gray-700")}`}>{dragging ? "Drop your CSV here" : "Upload CSV file"}</p>
          <p className={`text-xs mt-0.5 ${t(dark, "text-zinc-500", "text-gray-400")}`}>Drag and drop or click to browse</p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${t(dark, "bg-emerald-500/10 border-emerald-500/20", "bg-emerald-50 border-emerald-200")}`}>
          <FileText size={12} className={t(dark, "text-emerald-400", "text-emerald-600")} />
          <span className={`text-xs font-mono ${t(dark, "text-emerald-400", "text-emerald-700")}`}>.csv files only</span>
        </div>
        <input ref={ref} type="file" accept=".csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handle(f); }} />
      </div>
      {error && <div className="flex items-center gap-2 text-red-400 text-xs"><AlertCircle size={12} />{error}</div>}
    </div>
  );
}

function ColumnMappingPanel({ detected, columns, dark, onOverride }: {
  detected: Record<string, string>; columns: string[]; dark: boolean; onOverride: (metric: string, col: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const labels: Record<string, string> = { subscribed: "Subscribed", activation: "Activation", conversion: "Conversion", drafts: "Drafts", engagement: "Engagement", date: "Date" };
  return (
    <div className={`rounded-xl border overflow-hidden ${t(dark, "border-zinc-800 bg-[#111318]", "border-gray-200 bg-white shadow-sm")}`}>
      <button onClick={() => setOpen(!open)} className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors ${t(dark, "text-zinc-300 hover:bg-zinc-800/60", "text-gray-700 hover:bg-gray-50")}`}>
        <span className="flex items-center gap-2 font-medium">
          <Database size={13} className={t(dark, "text-zinc-400", "text-gray-400")} />
          Column Mapping
          <span className={`text-xs font-normal ${t(dark, "text-zinc-500", "text-gray-400")}`}>(click to override auto-detection)</span>
        </span>
        <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""} ${t(dark, "text-zinc-500", "text-gray-400")}`} />
      </button>
      {open && (
        <div className={`border-t px-4 py-3 space-y-2 ${t(dark, "border-zinc-800", "border-gray-100")}`}>
          {Object.entries(detected).map(([metric, col]) => (
            <div key={metric} className={`flex items-center gap-3 p-2 rounded-lg ${t(dark, "bg-zinc-800/50", "bg-gray-50")}`}>
              <span className={`text-xs font-medium w-24 shrink-0 ${t(dark, "text-zinc-300", "text-gray-600")}`}>{labels[metric] || metric}</span>
              <select
                value={col}
                onChange={(e) => onOverride(metric, e.target.value)}
                className={`flex-1 text-xs font-mono px-2 py-1.5 rounded-lg border appearance-none cursor-pointer ${col.startsWith("(") ? t(dark, "border-amber-500/40 bg-amber-500/5 text-amber-400", "border-amber-300 bg-amber-50 text-amber-700") : t(dark, "border-zinc-700 bg-zinc-900 text-emerald-400", "border-gray-200 bg-white text-emerald-600")}`}
              >
                <option value="">(not found)</option>
                {columns.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FlawSummaryBar({ report, dark, activeFilter, onFilterChange }: {
  report: DataQualityReport; dark: boolean; activeFilter: string; onFilterChange: (f: string) => void;
}) {
  const { bySeverity, totalFlaws, duplicateRowIndices, emptyRowIndices, profiles } = report;
  const filters = [
    { key: "all", label: "All Rows", count: profiles[0]?.total ?? 0 },
    { key: "issues", label: "Issues Only", count: totalFlaws },
    { key: "critical", label: "Critical", count: bySeverity.critical },
    { key: "warning", label: "Warnings", count: bySeverity.warning },
    { key: "info", label: "Info", count: bySeverity.info },
  ];
  return (
    <div className={`rounded-xl border p-4 space-y-3 ${totalFlaws > 0 ? t(dark, "border-red-500/20 bg-red-500/5", "border-red-200 bg-red-50/50") : t(dark, "border-emerald-500/20 bg-emerald-500/5", "border-emerald-200 bg-emerald-50/50")}`}>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          {totalFlaws > 0 ? <ShieldAlert size={16} className="text-red-400" /> : <CheckCircle size={16} className="text-emerald-400" />}
          <span className={`text-sm font-semibold ${totalFlaws > 0 ? "text-red-400" : t(dark, "text-emerald-400", "text-emerald-600")}`}>
            {totalFlaws > 0 ? `${totalFlaws.toLocaleString()} data issues detected` : "No data issues detected"}
          </span>
        </div>
        <div className="flex items-center gap-1.5 ml-auto flex-wrap">
          {filters.map((f) => (
            <button key={f.key} onClick={() => onFilterChange(f.key)} className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all border ${activeFilter === f.key ? t(dark, "bg-zinc-700 border-zinc-600 text-white", "bg-white border-gray-300 text-gray-900 shadow-sm") : t(dark, "border-transparent text-zinc-500 hover:text-zinc-300", "border-transparent text-gray-400 hover:text-gray-600")}`}>
              {f.label} <span className="ml-1 opacity-70">{f.count.toLocaleString()}</span>
            </button>
          ))}
        </div>
      </div>
      {totalFlaws > 0 && (
        <div className="flex flex-wrap gap-2">
          {bySeverity.critical > 0 && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/15 text-red-400 border border-red-500/20"><AlertCircle size={10} />{bySeverity.critical} critical</span>}
          {bySeverity.warning > 0 && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/20"><AlertTriangle size={10} />{bySeverity.warning} warnings</span>}
          {bySeverity.info > 0 && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/20"><Info size={10} />{bySeverity.info} info</span>}
          {duplicateRowIndices.size > 0 && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/15 text-purple-400 border border-purple-500/20"><Bug size={10} />{duplicateRowIndices.size} dup rows</span>}
          {emptyRowIndices.size > 0 && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-500/15 text-zinc-400 border border-zinc-500/20"><FileText size={10} />{emptyRowIndices.size} empty</span>}
        </div>
      )}
    </div>
  );
}

function ColumnProfilerGrid({ profiles, dark, onSelectCol }: {
  profiles: ColumnProfile[]; dark: boolean; onSelectCol: (col: string) => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const typeIcon = (type: ColumnProfile["detectedType"]) => {
    switch (type) {
      case "number": return <Hash size={11} />;
      case "date": return <Calendar size={11} />;
      case "boolean": return <span className="text-[10px] font-bold">T/F</span>;
      default: return <Type size={11} />;
    }
  };

  const typeColor = (type: ColumnProfile["detectedType"]) => {
    switch (type) {
      case "number": return "text-blue-400";
      case "date": return "text-purple-400";
      case "boolean": return "text-amber-400";
      case "mixed": return "text-red-400";
      default: return "text-zinc-400";
    }
  };

  const sevBorder = (sev: ColumnProfile["worstSeverity"]) => {
    switch (sev) {
      case "critical": return "border-l-red-500";
      case "warning": return "border-l-amber-500";
      case "info": return "border-l-blue-500";
      default: return "border-l-transparent";
    }
  };

  return (
    <div className={`rounded-xl border overflow-hidden ${t(dark, "border-zinc-800 bg-[#111318]", "border-gray-200 bg-white shadow-sm")}`}>
      <div className={`px-4 py-3 flex items-center gap-2 border-b ${t(dark, "border-zinc-800", "border-gray-100")}`}>
        <Filter size={13} className={t(dark, "text-zinc-400", "text-gray-400")} />
        <span className="text-sm font-semibold">Column Profiles</span>
        <span className={`text-xs ${t(dark, "text-zinc-500", "text-gray-400")}`}>({profiles.length} columns)</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-px bg-zinc-800/30">
        {profiles.map((p) => (
          <div key={p.name} className={`border-l-2 ${sevBorder(p.worstSeverity)} ${t(dark, "bg-[#111318]", "bg-white")}`}>
            <button onClick={() => setExpanded(expanded === p.name ? null : p.name)} className={`w-full text-left px-3 py-2.5 flex items-start gap-2 transition-colors ${t(dark, "hover:bg-zinc-800/50", "hover:bg-gray-50")}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs font-mono font-semibold truncate ${t(dark, "text-zinc-200", "text-gray-800")}`}>{p.name}</span>
                  <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-semibold ${typeColor(p.detectedType)} ${t(dark, "bg-zinc-800", "bg-gray-100")}`}>{typeIcon(p.detectedType)} {p.detectedType}</span>
                  {p.flawCount > 0 && <span className="text-[9px] font-bold text-red-400">{p.flawCount}</span>}
                </div>
                <div className={`flex gap-3 mt-1 text-[10px] ${t(dark, "text-zinc-500", "text-gray-400")}`}>
                  <span>{p.emptyPct > 0 ? <span className="text-red-400">{p.emptyPct}% empty</span> : "0% empty"}</span>
                  <span>{p.uniquePct}% unique</span>
                  {p.detectedType === "number" && p.min !== undefined && <span>{p.min} - {p.max}</span>}
                  {p.detectedType === "date" && p.minDate && <span>{p.minDate} to {p.maxDate}</span>}
                </div>
              </div>
              <ChevronRight size={12} className={`mt-0.5 shrink-0 transition-transform ${expanded === p.name ? "rotate-90" : ""} ${t(dark, "text-zinc-600", "text-gray-300")}`} />
            </button>
            {expanded === p.name && (
              <div className={`px-3 pb-3 pt-1 border-t space-y-2 ${t(dark, "border-zinc-800/60", "border-gray-100")}`}>
                <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                  <div className={`p-1.5 rounded ${t(dark, "bg-zinc-800/50", "bg-gray-50")}`}><span className={t(dark, "text-zinc-500", "text-gray-400")}>Total</span><div className={`font-mono font-semibold ${t(dark, "text-zinc-200", "text-gray-700")}`}>{p.total}</div></div>
                  <div className={`p-1.5 rounded ${t(dark, "bg-zinc-800/50", "bg-gray-50")}`}><span className={t(dark, "text-zinc-500", "text-gray-400")}>Unique</span><div className={`font-mono font-semibold ${t(dark, "text-zinc-200", "text-gray-700")}`}>{p.unique} ({p.uniquePct}%)</div></div>
                  {p.detectedType === "number" && (
                    <>
                      <div className={`p-1.5 rounded ${t(dark, "bg-zinc-800/50", "bg-gray-50")}`}><span className={t(dark, "text-zinc-500", "text-gray-400")}>Mean</span><div className="font-mono font-semibold text-blue-400">{p.mean?.toFixed(2)}</div></div>
                      <div className={`p-1.5 rounded ${t(dark, "bg-zinc-800/50", "bg-gray-50")}`}><span className={t(dark, "text-zinc-500", "text-gray-400")}>Median</span><div className="font-mono font-semibold text-blue-400">{p.median?.toFixed(2)}</div></div>
                      <div className={`p-1.5 rounded ${t(dark, "bg-zinc-800/50", "bg-gray-50")}`}><span className={t(dark, "text-zinc-500", "text-gray-400")}>P25</span><div className="font-mono font-semibold text-zinc-300">{p.p25}</div></div>
                      <div className={`p-1.5 rounded ${t(dark, "bg-zinc-800/50", "bg-gray-50")}`}><span className={t(dark, "text-zinc-500", "text-gray-400")}>P75</span><div className="font-mono font-semibold text-zinc-300">{p.p75}</div></div>
                    </>
                  )}
                </div>
                {p.whitespaceIssues > 0 && <div className="text-[10px] text-blue-400">{p.whitespaceIssues} cells have leading/trailing whitespace</div>}
                {p.samples.length > 0 && (
                  <div>
                    <span className={`text-[10px] ${t(dark, "text-zinc-500", "text-gray-400")}`}>Samples:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {p.samples.map((s, i) => <span key={i} className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${t(dark, "bg-zinc-800 text-zinc-300", "bg-gray-100 text-gray-600")}`}>{s.length > 30 ? s.slice(0, 30) + "..." : s}</span>)}
                    </div>
                  </div>
                )}
                {p.topValues.length > 0 && (
                  <div>
                    <span className={`text-[10px] ${t(dark, "text-zinc-500", "text-gray-400")}`}>Top values:</span>
                    <div className="space-y-0.5 mt-1">
                      {p.topValues.map((v, i) => (
                        <div key={i} className={`flex items-center justify-between text-[10px] ${t(dark, "text-zinc-400", "text-gray-500")}`}>
                          <span className="font-mono truncate max-w-[140px]">{v.value.length > 25 ? v.value.slice(0, 25) + "..." : v.value}</span>
                          <span className="font-mono">{v.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <button onClick={() => onSelectCol(p.name)} className={`text-[10px] font-medium ${t(dark, "text-emerald-400 hover:text-emerald-300", "text-emerald-600 hover:text-emerald-700")}`}>
                  View in data table
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function FlawList({ report, dark, onSelectFlaw }: {
  report: DataQualityReport; dark: boolean; onSelectFlaw: (rowIndex: number, col?: string) => void;
}) {
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const typeLabels: Record<string, string> = { missing: "Missing", type_mismatch: "Type Mismatch", duplicate_row: "Duplicate Row", outlier: "Outlier", whitespace: "Whitespace", empty_row: "Empty Row", id_duplicate: "ID Duplicate", null_like: "Null-like", future_date: "Future Date", negative_numeric: "Negative" };
  const types = [...new Set(report.flaws.map((f) => f.type))];
  const filtered = typeFilter === "all" ? report.flaws : report.flaws.filter((f) => f.type === typeFilter);

  return (
    <div className={`rounded-xl border overflow-hidden ${t(dark, "border-zinc-800 bg-[#111318]", "border-gray-200 bg-white shadow-sm")}`}>
      <div className={`px-4 py-3 flex items-center justify-between border-b ${t(dark, "border-zinc-800", "border-gray-100")}`}>
        <div className="flex items-center gap-2">
          <Bug size={13} className={t(dark, "text-zinc-400", "text-gray-400")} />
          <span className="text-sm font-semibold">Issue Log</span>
          <span className={`text-xs ${t(dark, "text-zinc-500", "text-gray-400")}`}>({Math.min(filtered.length, MAX_DISPLAY_FLAWS)} of {report.totalFlaws})</span>
        </div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className={`text-[11px] px-2 py-1 rounded-lg border ${t(dark, "bg-zinc-800 border-zinc-700 text-zinc-300", "bg-gray-50 border-gray-200 text-gray-600")}`}>
          <option value="all">All types</option>
          {types.map((tp) => <option key={tp} value={tp}>{typeLabels[tp] || tp} ({report.byType[tp] || 0})</option>)}
        </select>
      </div>
      <div className="max-h-[320px] overflow-y-auto divide-y divide-zinc-800/30">
        {filtered.length === 0 && <div className={`px-4 py-6 text-center text-xs ${t(dark, "text-zinc-600", "text-gray-400")}`}>No issues match this filter</div>}
        {filtered.map((f) => {
          const SevIcon = f.severity === "critical" ? ShieldAlert : f.severity === "warning" ? AlertTriangle : Info;
          const sevColor = f.severity === "critical" ? "text-red-400" : f.severity === "warning" ? "text-amber-400" : "text-blue-400";
          return (
            <button key={f.id} onClick={() => onSelectFlaw(f.rowIndex, f.column)} className={`w-full text-left px-4 py-2 flex items-start gap-2.5 transition-colors ${t(dark, "hover:bg-zinc-800/40", "hover:bg-gray-50")}`}>
              <SevIcon size={13} className={`${sevColor} mt-0.5 shrink-0`} />
              <div className="flex-1 min-w-0">
                <p className={`text-[11px] leading-relaxed ${t(dark, "text-zinc-300", "text-gray-600")}`}>{f.message}</p>
                <div className={`flex gap-2 mt-0.5 text-[10px] ${t(dark, "text-zinc-600", "text-gray-400")}`}>
                  <span className={`px-1 rounded ${t(dark, "bg-zinc-800", "bg-gray-100")}`}>{typeLabels[f.type] || f.type}</span>
                  {f.column && <span className="font-mono">{f.column}</span>}
                  {f.rowIndex >= 0 && <span>Row {f.rowIndex + 2}</span>}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function EnhancedDataTable({ rows, columns, dark, flawCellMap, duplicateRowIndices, emptyRowIndices, flawFilter, searchQuery, scrollToRow, highlightCol }: {
  rows: UserRow[]; columns: string[]; dark: boolean; flawCellMap: Map<string, DataFlaw[]>;
  duplicateRowIndices: Set<number>; emptyRowIndices: Set<number>;
  flawFilter: string; searchQuery: string; scrollToRow: number | null; highlightCol: string | null;
}) {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc" | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setPage(0); }, [flawFilter, searchQuery]);

  useEffect(() => {
    if (scrollToRow !== null && tableRef.current) {
      const targetPage = Math.floor(scrollToRow / pageSize);
      setPage(targetPage);
      setTimeout(() => {
        const rowEl = tableRef.current?.querySelector(`[data-row="${scrollToRow}"]`);
        if (rowEl) { rowEl.scrollIntoView({ behavior: "smooth", block: "center" }); rowEl.classList.add("ring-2", "ring-emerald-500"); setTimeout(() => rowEl.classList.remove("ring-2", "ring-emerald-500"), 2000); }
      }, 50);
    }
  }, [scrollToRow, pageSize]);

  const filtered = useMemo(() => {
    let result = rows.map((r, i) => ({ row: r, idx: i }));
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(({ row }) => columns.some((c) => (row[c] ?? "").toLowerCase().includes(q)));
    }
    if (flawFilter === "issues") {
      result = result.filter(({ idx }) => columns.some((c) => flawCellMap.has(`${idx}-${c}`)) || duplicateRowIndices.has(idx) || emptyRowIndices.has(idx));
    } else if (flawFilter !== "all") {
      result = result.filter(({ idx }) => {
        if (emptyRowIndices.has(idx) && flawFilter === "info") return true;
        if (duplicateRowIndices.has(idx) && flawFilter === "warning") return true;
        return columns.some((c) => { const cellFlaws = flawCellMap.get(`${idx}-${c}`); return cellFlaws?.some((f) => f.severity === flawFilter); });
      });
    }
    return result;
  }, [rows, columns, searchQuery, flawFilter, flawCellMap, duplicateRowIndices, emptyRowIndices]);

  const sorted = useMemo(() => {
    if (!sortCol || !sortDir) return filtered;
    return [...filtered].sort((a, b) => {
      const va = a.row[sortCol] ?? "";
      const vb = b.row[sortCol] ?? "";
      const na = Number(va);
      const nb = Number(vb);
      if (!isNaN(na) && !isNaN(nb)) return sortDir === "asc" ? na - nb : nb - na;
      return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
    });
  }, [filtered, sortCol, sortDir]);

  const totalPages = Math.ceil(sorted.length / pageSize);
  const pageRows = sorted.slice(page * pageSize, (page + 1) * pageSize);

  const handleSort = (col: string) => {
    if (sortCol === col) {
      if (sortDir === "asc") setSortDir("desc");
      else if (sortDir === "desc") { setSortCol(null); setSortDir(null); }
    } else { setSortCol(col); setSortDir("asc"); }
  };

  const getCellSev = (rowIdx: number, col: string) => {
    const cellFlaws = flawCellMap.get(`${rowIdx}-${col}`);
    if (!cellFlaws || cellFlaws.length === 0) return null;
    if (cellFlaws.some((f) => f.severity === "critical")) return "critical";
    if (cellFlaws.some((f) => f.severity === "warning")) return "warning";
    return "info";
  };

  const cellBg = (sev: string | null) => {
    if (!sev) return "";
    if (sev === "critical") return t(dark, "bg-red-500/10", "bg-red-50");
    if (sev === "warning") return t(dark, "bg-amber-500/8", "bg-amber-50/70");
    return t(dark, "bg-blue-500/5", "bg-blue-50/50");
  };

  const getRowBorder = (rowIdx: number) => {
    if (emptyRowIndices.has(rowIdx)) return "border-l-zinc-500";
    if (duplicateRowIndices.has(rowIdx)) return "border-l-purple-500";
    const worst = columns.reduce<(string | null)>((w, c) => {
      const s = getCellSev(rowIdx, c);
      if (s === "critical") return "critical";
      if (s === "warning" && w !== "critical") return "warning";
      if (s === "info" && !w) return "info";
      return w;
    }, null);
    if (worst === "critical") return "border-l-red-500";
    if (worst === "warning") return "border-l-amber-500";
    if (worst === "info") return "border-l-blue-500";
    return "border-l-transparent";
  };

  return (
    <div className={`rounded-xl border overflow-hidden ${t(dark, "border-zinc-800 bg-[#111318]", "border-gray-200 bg-white shadow-sm")}`}>
      <div className={`px-4 py-3 flex items-center justify-between border-b ${t(dark, "border-zinc-800", "border-gray-100")}`}>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">Data Table</span>
          <span className={`text-xs font-mono ${t(dark, "text-zinc-500", "text-gray-400")}`}>{sorted.length.toLocaleString()} of {rows.length.toLocaleString()} rows</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] ${t(dark, "text-zinc-500", "text-gray-400")}`}>Rows:</span>
          <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0); }} className={`text-[11px] px-1.5 py-0.5 rounded border ${t(dark, "bg-zinc-800 border-zinc-700 text-zinc-300", "bg-gray-50 border-gray-200 text-gray-600")}`}>
            {[10, 25, 50, 100].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <div ref={tableRef} className="overflow-x-auto overflow-y-auto max-h-[500px]">
        <table className="w-full text-xs">
          <thead className="sticky top-0 z-10">
            <tr className={t(dark, "bg-zinc-900", "bg-gray-50")}>
              <th className={`px-2 py-2 text-left font-mono font-medium w-12 sticky left-0 z-20 ${t(dark, "text-zinc-500 bg-zinc-900", "text-gray-400 bg-gray-50")}`}>#</th>
              {columns.map((c) => (
                <th key={c} onClick={() => handleSort(c)} className={`px-2 py-2 text-left font-mono font-medium whitespace-nowrap cursor-pointer select-none transition-colors ${highlightCol === c ? t(dark, "text-emerald-400", "text-emerald-600") : t(dark, "text-zinc-400 hover:text-zinc-200", "text-gray-500 hover:text-gray-700")} ${t(dark, "bg-zinc-900", "bg-gray-50")}`}>
                  <span className="flex items-center gap-1">
                    {c.length > 20 ? c.slice(0, 20) + "..." : c}
                    {sortCol === c && sortDir === "asc" && <ArrowUp size={10} className="text-emerald-400" />}
                    {sortCol === c && sortDir === "desc" && <ArrowDown size={10} className="text-emerald-400" />}
                    {sortCol !== c && <ArrowUpDown size={9} className="opacity-30" />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 && (
              <tr><td colSpan={columns.length + 1} className={`px-4 py-8 text-center ${t(dark, "text-zinc-600", "text-gray-400")}`}>No rows match current filters</td></tr>
            )}
            {pageRows.map(({ row, idx }) => (
              <tr key={idx} data-row={idx} className={`border-l-2 ${getRowBorder(idx)} ${t(dark, "border-b border-zinc-800/40 hover:bg-zinc-800/20", "border-b border-gray-100 hover:bg-gray-50")} transition-colors`}>
                <td className={`px-2 py-1.5 font-mono sticky left-0 z-10 ${t(dark, "text-zinc-600 bg-[#111318]", "text-gray-400 bg-white")}`}>{idx + 2}</td>
                {columns.map((c) => {
                  const sev = getCellSev(idx, c);
                  const cellFlaws = flawCellMap.get(`${idx}-${c}`);
                  const title = cellFlaws?.map((f) => f.message).join("; ") || "";
                  return (
                    <td key={c} title={title} className={`px-2 py-1.5 font-mono whitespace-nowrap max-w-[200px] truncate ${cellBg(sev)} ${sev === "critical" ? "text-red-300" : sev === "warning" ? "text-amber-300" : t(dark, "text-zinc-300", "text-gray-600")} ${highlightCol === c ? t(dark, "bg-emerald-500/5", "bg-emerald-50/30") : ""}`}>
                      {row[c] && row[c].trim() !== "" ? (row[c].length > 30 ? row[c].slice(0, 30) + "..." : row[c]) : <span className="text-zinc-600 italic">null</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className={`px-4 py-2.5 flex items-center justify-between border-t text-[11px] ${t(dark, "border-zinc-800 bg-zinc-900/50", "border-gray-100 bg-gray-50")} ${t(dark, "text-zinc-400", "text-gray-500")}`}>
          <span>Page {page + 1} of {totalPages}</span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(0)} disabled={page === 0} className={`px-2 py-1 rounded border disabled:opacity-30 ${t(dark, "border-zinc-700 hover:bg-zinc-800", "border-gray-200 hover:bg-gray-100")}`}>First</button>
            <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className={`px-2 py-1 rounded border disabled:opacity-30 ${t(dark, "border-zinc-700 hover:bg-zinc-800", "border-gray-200 hover:bg-gray-100")}`}>Prev</button>
            <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className={`px-2 py-1 rounded border disabled:opacity-30 ${t(dark, "border-zinc-700 hover:bg-zinc-800", "border-gray-200 hover:bg-gray-100")}`}>Next</button>
            <button onClick={() => setPage(totalPages - 1)} disabled={page >= totalPages - 1} className={`px-2 py-1 rounded border disabled:opacity-30 ${t(dark, "border-zinc-700 hover:bg-zinc-800", "border-gray-200 hover:bg-gray-100")}`}>Last</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function CsvAnalysis() {
  const dark = useIsDark();
  const [rows, setRows] = useState<UserRow[]>([]);
  const [cols, setCols] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [colOverrides, setColOverrides] = useState<Record<string, string>>({});
  const [restored, setRestored] = useState(false);
  const [flawFilter, setFlawFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [scrollToRow, setScrollToRow] = useState<number | null>(null);
  const [highlightCol, setHighlightCol] = useState<string | null>(null);

  useEffect(() => {
    const saved = loadRaw();
    if (saved) {
      const parsed = parseCSV(saved.text);
      const columns = parsed.length > 0 ? Object.keys(parsed[0]) : [];
      setRows(parsed);
      setCols(columns);
      setFileName(saved.name);
      setRestored(true);
    }
  }, []);

  const stats = useMemo(() => analyzeData(rows, cols, colOverrides), [rows, cols, colOverrides]);
  const quality = useMemo(() => (rows.length > 0 ? profileData(rows, cols) : null), [rows, cols]);

  useEffect(() => { saveStats(stats); }, [stats]);
  useEffect(() => { saveQuality(quality); }, [quality]);

  const handleFile = (text: string, name: string) => {
    saveRaw(text, name);
    const parsed = parseCSV(text);
    const columns = parsed.length > 0 ? Object.keys(parsed[0]) : [];
    setRows(parsed);
    setCols(columns);
    setFileName(name);
    setColOverrides({});
    setRestored(false);
    setFlawFilter("all");
    setSearchQuery("");
    setScrollToRow(null);
    setHighlightCol(null);
  };

  const handleClear = () => {
    localStorage.removeItem(SK.RAW);
    localStorage.removeItem(SK.NAME);
    saveStats(null);
    saveQuality(null);
    setRows([]);
    setCols([]);
    setFileName(null);
    setColOverrides({});
    setRestored(false);
    setFlawFilter("all");
    setSearchQuery("");
    setScrollToRow(null);
    setHighlightCol(null);
  };

  const handleOverride = (metric: string, col: string) => {
    setColOverrides((prev) => ({ ...prev, [metric]: col }));
  };

  const handleSelectFlaw = (rowIndex: number, col?: string) => {
    if (rowIndex >= 0) {
      setScrollToRow(rowIndex);
      if (col) setHighlightCol(col);
    }
  };

  const handleSelectCol = (col: string) => {
    setHighlightCol(col);
    setFlawFilter("all");
    setScrollToRow(null);
    setTimeout(() => {
      const el = document.getElementById("data-table-section");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  const s = stats;
  const grid = t(dark, "#27272a", "#f3f4f6");
  const axis = t(dark, "#71717a", "#9ca3af");
  const ttS = dark ? { background: "#18181b", border: "1px solid #3f3f46", borderRadius: 8, fontSize: 12, color: "#fff" } : { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 12, color: "#111827" };
  const ttL = dark ? { color: "#fff" } : { color: "#111827" };
  const lgC = t(dark, "#a1a1aa", "#6b7280");
  const card = `rounded-2xl border p-5 ${t(dark, "border-zinc-800 bg-[#111318]", "border-gray-200 bg-white shadow-sm")}`;

  return (
    <div className={`min-h-screen p-6 space-y-6 font-sans transition-colors duration-200 ${t(dark, "bg-[#0a0d0f] text-white", "bg-gray-50 text-gray-900")}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold tracking-tight ${t(dark, "text-white", "text-gray-900")}`}>CSV Analysis</h1>
          <p className={`text-sm mt-0.5 font-mono ${t(dark, "text-zinc-500", "text-gray-400")}`}>
            {fileName ? `Analyzing ${fileName} / ${rows.length} users / ${cols.length} cols${restored ? " / restored" : ""}` : "Upload a CSV to begin / data persists across navigation"}
          </p>
        </div>
        {s && (
          <div className="flex items-center gap-2">
            <button onClick={() => {
              const blob = new Blob([["Metric,Value", `Total Users,${s.totalUsers}`, `Subscribed,${s.subscribed}`, `Activation,${s.activation}%`, `Conversion,${s.conversion}%`, `Drafts Created,${s.draftsCreated}`, `Zero Engagement,${s.zeroEngagement}`].join("\n")], { type: "text/csv" });
              const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "analysis-summary.csv"; a.click();
            }} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${t(dark, "border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700", "border-gray-200 bg-white text-gray-600 hover:bg-gray-50 shadow-sm")}`}>
              <Download size={13} /> Summary
            </button>
            {quality && quality.flaws.length > 0 && (
              <button onClick={() => {
                const blob = new Blob([["Severity,Type,Column,Row,Message", ...quality.flaws.map((f) => `${f.severity},${f.type},${f.column ?? ""},${f.rowIndex >= 0 ? f.rowIndex + 2 : ""},"${f.message}"`)].join("\n")], { type: "text/csv" });
                const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "flaws-report.csv"; a.click();
              }} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${t(dark, "border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20", "border-red-200 bg-red-50 text-red-600 hover:bg-red-100")}`}>
                <Bug size={13} /> Export Flaws
              </button>
            )}
          </div>
        )}
      </div>

      {/* Upload */}
      <div className={`${card} space-y-3`}>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className={`text-xs font-semibold tracking-widest uppercase ${t(dark, "text-zinc-400", "text-gray-400")}`}>Data Source</span>
        </div>
        <UploadZone onFile={handleFile} fileName={fileName} onClear={handleClear} dark={dark} />
        {!fileName && (
          <p className={`text-xs ${t(dark, "text-zinc-600", "text-gray-400")}`}>
            Expected columns: <span className={`font-mono ${t(dark, "text-zinc-500", "text-gray-500")}`}>created_at, subscribed, activated, event_count, plan, ...</span>
          </p>
        )}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Total Users" value={s?.totalUsers ?? 0} icon={Users} dark={dark} />
        <StatCard label="Subscribed" value={s?.subscribed ?? 0} icon={CreditCard} dark={dark} sub={s ? `/${s.totalForSub}` : "/0"} />
        <StatCard label="Activation" value={s ? `${s.activation}%` : "0.0%"} icon={Zap} dark={dark} trend={s && s.activation > 0 ? `+${s.activation}% activated` : undefined} />
        <StatCard label="Conversion" value={s ? `${s.conversion}%` : "0.00%"} icon={TrendingUp} dark={dark} trend={s && s.conversion > 0 ? `+${s.conversion}% converted` : undefined} />
        <StatCard label="Drafts Created" value={s?.draftsCreated.toLocaleString() ?? 0} icon={FileText} dark={dark} />
        <StatCard label="Zero Engagement" value={s?.zeroEngagement ?? 0} icon={UserX} dark={dark} />
      </div>

      {/* Column Mapping */}
      {s && <ColumnMappingPanel detected={s.detectedCols} columns={cols} dark={dark} onOverride={handleOverride} />}

      {/* Flaw Summary */}
      {quality && <FlawSummaryBar report={quality} dark={dark} activeFilter={flawFilter} onFilterChange={setFlawFilter} />}

      {/* Search + Data Table */}
      {quality && rows.length > 0 && (
        <div id="data-table-section" className="space-y-3">
          <div className="relative">
            <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${t(dark, "text-zinc-500", "text-gray-400")}`} />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search across all columns..." className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm font-mono placeholder:font-sans ${t(dark, "bg-[#111318] border-zinc-800 text-zinc-200 placeholder:text-zinc-600 focus:border-emerald-500/50", "bg-white border-gray-200 text-gray-700 placeholder:text-gray-400 focus:border-emerald-300")} outline-none transition-colors`} />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className={`absolute right-3 top-1/2 -translate-y-1/2 ${t(dark, "text-zinc-500 hover:text-zinc-300", "text-gray-400 hover:text-gray-600")}`}>
                <X size={14} />
              </button>
            )}
          </div>
          <EnhancedDataTable rows={rows} columns={cols} dark={dark} flawCellMap={quality.flawCellMap} duplicateRowIndices={quality.duplicateRowIndices} emptyRowIndices={quality.emptyRowIndices} flawFilter={flawFilter} searchQuery={searchQuery} scrollToRow={scrollToRow} highlightCol={highlightCol} />
        </div>
      )}

      {/* Column Profiles + Flaw List */}
      {quality && quality.profiles.length > 0 && (
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
          <div className="xl:col-span-3">
            <ColumnProfilerGrid profiles={quality.profiles} dark={dark} onSelectCol={handleSelectCol} />
          </div>
          <div className="xl:col-span-2">
            <FlawList report={quality} dark={dark} onSelectFlaw={handleSelectFlaw} />
          </div>
        </div>
      )}

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className={`${card} lg:col-span-3`}>
          <p className={`text-sm font-semibold ${t(dark, "text-zinc-200", "text-gray-800")}`}>Signups and subscriptions over time</p>
          <p className={`text-xs mt-0.5 mb-4 font-mono ${t(dark, "text-zinc-500", "text-gray-400")}`}>By month from Created date</p>
          {s && s.signupsByMonth.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={s.signupsByMonth} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gS" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} /><stop offset="95%" stopColor="#22c55e" stopOpacity={0} /></linearGradient>
                  <linearGradient id="gB" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} /><stop offset="95%" stopColor="#3b82f6" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={grid} />
                <XAxis dataKey="month" tick={{ fill: axis, fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: axis, fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={ttS} labelStyle={ttL} />
                <Area type="monotone" dataKey="signups" stroke="#22c55e" fill="url(#gS)" strokeWidth={2} name="Signups" />
                <Area type="monotone" dataKey="subs" stroke="#3b82f6" fill="url(#gB)" strokeWidth={2} name="Subscriptions" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex flex-col items-center justify-center gap-2">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${t(dark, "bg-zinc-800", "bg-gray-100")}`}>
                <TrendingUp size={20} className={t(dark, "text-zinc-600", "text-gray-300")} />
              </div>
              <p className={`text-xs text-center ${t(dark, "text-zinc-600", "text-gray-400")}`}>
                {s ? `No date column detected: "${s.detectedCols.date}"` : "Upload a CSV with a date column to see trends"}
              </p>
            </div>
          )}
          <div className="flex gap-4 mt-2">
            <div className={`flex items-center gap-1.5 text-xs ${t(dark, "text-zinc-400", "text-gray-500")}`}><div className="w-3 h-0.5 rounded bg-emerald-500" /> signups</div>
            <div className={`flex items-center gap-1.5 text-xs ${t(dark, "text-zinc-400", "text-gray-500")}`}><div className="w-3 h-0.5 rounded bg-blue-500" /> subs</div>
          </div>
        </div>

        <div className={`${card} lg:col-span-2`}>
          <p className={`text-sm font-semibold ${t(dark, "text-zinc-200", "text-gray-800")}`}>Engagement segments</p>
          <p className={`text-xs mt-0.5 mb-4 font-mono ${t(dark, "text-zinc-500", "text-gray-400")}`}>By total feature interactions</p>
          {s && s.engagementSegments.some((e) => e.value > 0) ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={s.engagementSegments} innerRadius={55} outerRadius={85} paddingAngle={2} dataKey="value">
                  {s.engagementSegments.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={ttS} />
                <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ color: lgC, fontSize: 11 }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex flex-col items-center justify-center gap-2">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${t(dark, "bg-zinc-800", "bg-gray-100")}`}>
                <Users size={20} className={t(dark, "text-zinc-600", "text-gray-300")} />
              </div>
              <p className={`text-xs text-center ${t(dark, "text-zinc-600", "text-gray-400")}`}>Upload CSV with an engagement or sessions column</p>
            </div>
          )}
        </div>
      </div>

      {/* Top Events */}
      {s && s.topEvents.length > 0 && (
        <div className={card}>
          <p className={`text-sm font-semibold ${t(dark, "text-zinc-200", "text-gray-800")}`}>Top Events</p>
          <p className={`text-xs mt-0.5 mb-4 font-mono ${t(dark, "text-zinc-500", "text-gray-400")}`}>Highest volume events in the period</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={s.topEvents} margin={{ top: 0, right: 5, left: -20, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
              <XAxis dataKey="event" tick={{ fill: axis, fontSize: 10 }} axisLine={false} tickLine={false} angle={-30} textAnchor="end" />
              <YAxis tick={{ fill: axis, fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={ttS} labelStyle={ttL} />
              <Bar dataKey="count" fill="#22c55e" radius={[4, 4, 0, 0]} name="Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Empty state */}
      {!s && (
        <div className={`rounded-2xl border-2 border-dashed p-10 flex flex-col items-center justify-center gap-3 text-center ${t(dark, "border-zinc-800 bg-transparent", "border-gray-200 bg-white shadow-sm")}`}>
          <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center ${t(dark, "bg-emerald-500/10 border-emerald-500/20", "bg-emerald-50 border-emerald-200")}`}>
            <FileText size={24} className={t(dark, "text-emerald-400", "text-emerald-600")} />
          </div>
          <p className={`text-sm font-medium ${t(dark, "text-zinc-300", "text-gray-700")}`}>No data loaded</p>
          <p className={`text-xs max-w-sm ${t(dark, "text-zinc-600", "text-gray-400")}`}>
            Upload any CSV with user records. The file is cached locally so it survives page navigation. Other pages in the app can read the parsed stats via <span className={`font-mono ${t(dark, "text-zinc-400", "text-emerald-600")}`}>usePulseCSVStats()</span> and quality via <span className={`font-mono ${t(dark, "text-zinc-400", "text-emerald-600")}`}>usePulseCSVQuality()</span>.
          </p>
        </div>
      )}
    </div>
  );
}