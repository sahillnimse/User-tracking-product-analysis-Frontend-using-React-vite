// src/lib/csvParser.ts
// Pure functions — no React, no side-effects, fully testable.
// Handles the LawgicHub user-export CSV format exactly.

import type {
    UserRow, ParsedStats, MonthlySignup, EngagementSegment,
    FeatureAdoptionItem, CohortRow, PlanBreakdown,
  } from "@/types";
  
  // ── CSV text → rows ───────────────────────────────────────────────────────────
  export function parseCSV(text: string): UserRow[] {
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) return [];
  
    const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
  
    return lines.slice(1).map(line => {
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
  
  // ── Date parser: "12 May 2026, 07:27 pm" ─────────────────────────────────────
  function parseDate(s: string): Date | null {
    const str = s.trim();
    if (!str || str === "—") return null;
    // Format: "12 May 2026, 07:27 pm"
    const m = str.match(/^(\d{1,2})\s+(\w+)\s+(\d{4}),\s+(\d{1,2}):(\d{2})\s*(am|pm)$/i);
    if (m) {
      const [, day, mon, year, hr, min, ampm] = m;
      const months: Record<string, number> = {
        Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,
        Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11,
      };
      let hour = parseInt(hr);
      if (ampm.toLowerCase() === "pm" && hour !== 12) hour += 12;
      if (ampm.toLowerCase() === "am" && hour === 12) hour = 0;
      return new Date(parseInt(year), months[mon] ?? 0, parseInt(day), hour, parseInt(min));
    }
    // Fallback: native parse
    const d = new Date(str);
    return isNaN(d.getTime()) ? null : d;
  }
  
  // ── Feature engagement for a row ─────────────────────────────────────────────
  function engagementScore(r: UserRow): number {
    return (
      parseInt(r["Draft used"]        || "0") +
      parseInt(r["Research used"]     || "0") +
      parseInt(r["Contact review"]    || "0") +
      parseInt(r["Query"]             || "0") +
      parseInt(r["Judgment details"]  || "0")
    );
  }
  
  function featureCount(r: UserRow): number {
    return [
      "Draft used", "Research used", "Contact review", "Query", "Judgment details",
    ].filter(k => parseInt(r[k] || "0") > 0).length;
  }
  
  // ── Main analyser ─────────────────────────────────────────────────────────────
  export function analyzeData(
    rows: UserRow[],
    columns: string[],
    fileName: string,
  ): ParsedStats {
    const n = rows.length;
  
    // ── Column detection (with LawgicHub column names as primary) ──────────────
    const col = (primary: string, ...fallbacks: string[]) => {
      if (columns.includes(primary)) return primary;
      return columns.find(c =>
        fallbacks.some(k => c.toLowerCase().includes(k))
      ) ?? "";
    };
  
    const subCol  = col("Subscribed",       "subscri", "paid");
    const planCol = col("Plan",             "plan", "tier");
    const datCol  = col("Created",          "created", "signup", "joined", "registered");
    const loginCol= col("Last login",       "last login", "last_login", "login");
    const draftCol= col("Draft used",       "draft");
    const resCol  = col("Research used",    "research");
    const conCol  = col("Contact review",   "contact");
    const qryCol  = col("Query",            "query");
    const jdgCol  = col("Judgment details", "judgment");
  
    const detectedCols: Record<string, string> = {
      subscribed:  subCol  || "(not found)",
      plan:        planCol || "(not found)",
      date:        datCol  || "(not found)",
      lastLogin:   loginCol|| "(not found)",
      draft:       draftCol|| "(not found)",
      research:    resCol  || "(not found)",
      contact:     conCol  || "(not found)",
      query:       qryCol  || "(not found)",
      judgment:    jdgCol  || "(not found)",
    };
  
    // ── Subscribed rows ────────────────────────────────────────────────────────
    const subRows = subCol
      ? rows.filter(r => r[subCol]?.trim().toLowerCase() === "yes")
      : [];
  
    // ── Activation (used any feature) ──────────────────────────────────────────
    const activatedRows = rows.filter(r => engagementScore(r) > 0);
  
    // ── Feature totals & adoption ─────────────────────────────────────────────
    const FEATURES = [
      { feature: "Draft",           col: draftCol },
      { feature: "Research",        col: resCol   },
      { feature: "Query",           col: qryCol   },
      { feature: "Contact Review",  col: conCol   },
      { feature: "Judgment Details",col: jdgCol   },
    ];
  
    const featureAdoption: FeatureAdoptionItem[] = FEATURES.map(({ feature, col }) => {
      const users     = col ? rows.filter(r => parseInt(r[col] || "0") > 0).length : 0;
      const totalUses = col ? rows.reduce((a, r) => a + (parseInt(r[col] || "0") || 0), 0) : 0;
      return { feature, users, totalUses, pct: n > 0 ? parseFloat(((users / n) * 100).toFixed(1)) : 0 };
    });
  
    const draftsCreated = draftCol
      ? rows.reduce((a, r) => a + (parseInt(r[draftCol] || "0") || 0), 0)
      : 0;
  
    const zeroEngagement = rows.filter(r => engagementScore(r) === 0).length;
  
    // ── Signups by month ───────────────────────────────────────────────────────
    const monthMap: Record<string, MonthlySignup> = {};
    if (datCol) {
      rows.forEach(r => {
        const d = parseDate(r[datCol]);
        if (!d) return;
        const key = d.toLocaleString("default", { month: "short", year: "2-digit" });
        if (!monthMap[key]) monthMap[key] = { month: key, signups: 0, subs: 0 };
        monthMap[key].signups++;
        if (subCol && r[subCol]?.trim().toLowerCase() === "yes") monthMap[key].subs++;
      });
    }
    const signupsByMonth = Object.values(monthMap)
      .sort((a, b) => new Date("01 " + a.month).getTime() - new Date("01 " + b.month).getTime())
      .slice(-12);
  
    // ── Engagement segments ────────────────────────────────────────────────────
    const segBuckets = { power: 0, engaged: 0, casual: 0, atrisk: 0, zero: 0 };
    rows.forEach(r => {
      const e = engagementScore(r);
      if      (e >= 10) segBuckets.power++;
      else if (e >= 5)  segBuckets.engaged++;
      else if (e >= 2)  segBuckets.casual++;
      else if (e === 1) segBuckets.atrisk++;
      else              segBuckets.zero++;
    });
    const engagementSegments: EngagementSegment[] = [
      { name: "Power (10+)",   value: segBuckets.power,   color: "#3b82f6" },
      { name: "Engaged (5–9)", value: segBuckets.engaged, color: "#22c55e" },
      { name: "Casual (2–4)",  value: segBuckets.casual,  color: "#f59e0b" },
      { name: "At risk (1)",   value: segBuckets.atrisk,  color: "#f97316" },
      { name: "Zero",          value: segBuckets.zero,    color: "#ef4444" },
    ];
  
    // ── Plan breakdown ─────────────────────────────────────────────────────────
    const planMap: Record<string, number> = {};
    if (planCol) {
      rows.forEach(r => {
        const p = r[planCol]?.trim() || "Unknown";
        planMap[p] = (planMap[p] || 0) + 1;
      });
    }
    const PLAN_COLORS: Record<string, string> = {
      "Free Trial":      "#94a3b8",
      "Plus":            "#3b82f6",
      "Mini Pack (Pro)": "#8b5cf6",
      "Mini Pack (Plus)":"#22c55e",
    };
    const planBreakdown: PlanBreakdown[] = Object.entries(planMap)
      .sort((a, b) => b[1] - a[1])
      .map(([plan, count]) => ({ plan, count, color: PLAN_COLORS[plan] ?? "#64748b" }));
  
    // ── Feature depth funnel ───────────────────────────────────────────────────
    const featureDepthFunnel = [
      { label: "Signed up",        count: n },
      { label: "Used any feature", count: activatedRows.length },
      { label: "Used 2+ features", count: rows.filter(r => featureCount(r) >= 2).length },
      { label: "Used 3+ features", count: rows.filter(r => featureCount(r) >= 3).length },
      { label: "Subscribed",       count: subRows.length },
    ];
  
    // ── Cohort retention ───────────────────────────────────────────────────────
    const cohortMap: Record<string, { total: number; returned: number; activated: number }> = {};
    if (datCol) {
      rows.forEach(r => {
        const created = parseDate(r[datCol]);
        if (!created) return;
        const key = created.toLocaleString("default", { month: "short", year: "2-digit" });
        if (!cohortMap[key]) cohortMap[key] = { total: 0, returned: 0, activated: 0 };
        cohortMap[key].total++;
  
        const lastLogin = loginCol ? parseDate(r[loginCol]) : null;
        if (lastLogin && Math.abs(lastLogin.getTime() - created.getTime()) > 3_600_000) {
          cohortMap[key].returned++;
        }
        if (engagementScore(r) > 0) cohortMap[key].activated++;
      });
    }
    const cohortRetention: CohortRow[] = Object.entries(cohortMap)
      .sort((a, b) => new Date("01 " + a[0]).getTime() - new Date("01 " + b[0]).getTime())
      .map(([month, v]) => ({
        month,
        total:          v.total,
        returned:       v.returned,
        returnRate:     v.total > 0 ? parseFloat(((v.returned / v.total) * 100).toFixed(1)) : 0,
        activated:      v.activated,
        activationRate: v.total > 0 ? parseFloat(((v.activated / v.total) * 100).toFixed(1)) : 0,
      }));
  
    return {
      totalUsers: n,
      subscribed: subRows.length,
      totalForSub: n,
      activation:  n > 0 ? parseFloat(((activatedRows.length / n) * 100).toFixed(1)) : 0,
      conversion:  n > 0 ? parseFloat(((subRows.length / n) * 100).toFixed(2)) : 0,
      draftsCreated,
      zeroEngagement,
      featureAdoption,
      featureDepthFunnel,
      signupsByMonth,
      engagementSegments,
      planBreakdown,
      cohortRetention,
      detectedCols,
      columns,
      rows,
      uploadedAt: Date.now(),
      fileName,
    };
  }