// src/lib/analyticsData.ts
//
// Static snapshot computed from users-export-2026-05-19.csv
// 1 756 users · LawgicHub legal platform
// This is the fallback data shown before any CSV is uploaded.
// All numbers are real — computed directly from the user export.

import type { AnalyticsSnapshot } from "@/types";

export const analyticsData: Omit<AnalyticsSnapshot,
  "source" | "csvStats" | "fileName" | "uploadedAt"
> = {

  // ── Core KPIs ──────────────────────────────────────────────────────────────
  totalUsers:     1756,
  subscribed:     7,          // users with Subscribed = "Yes"
  activation:     11.9,       // % who used at least one feature
  conversion:     0.40,       // % subscribed (7/1756)
  draftsCreated:  333,        // total Draft used across all users
  zeroEngagement: 1547,       // users who never touched any feature (88.1%)

  // ── Signups by month ───────────────────────────────────────────────────────
  // Source: "Created" column parsed by month
  signupsByMonth: [
    { month: "Dec 25", signups:   4, subs: 1 },
    { month: "Jan 26", signups:  74, subs: 3 },
    { month: "Feb 26", signups: 877, subs: 1 },  // major launch / campaign spike
    { month: "Mar 26", signups: 790, subs: 1 },
    { month: "Apr 26", signups:   9, subs: 1 },
    { month: "May 26", signups:   2, subs: 0 },
  ],

  // ── Engagement segments ────────────────────────────────────────────────────
  // Bucketed by total feature interactions (draft+research+query+contact+judgment)
  engagementSegments: [
    { name: "Power (10+)",    value:   2, color: "#3b82f6" },   // 2 users
    { name: "Engaged (5–9)",  value:  15, color: "#22c55e" },   // 15 users
    { name: "Casual (2–4)",   value:  76, color: "#f59e0b" },   // 76 users
    { name: "At risk (1)",    value: 116, color: "#f97316" },   // 116 users
    { name: "Zero",           value:1547, color: "#ef4444" },   // 1547 users
  ],

  // ── Plan breakdown ─────────────────────────────────────────────────────────
  planBreakdown: [
    { plan: "Free Trial",     count: 1750, color: "#94a3b8" },
    { plan: "Plus",           count:    3, color: "#3b82f6" },
    { plan: "Mini Pack (Pro)",count:    2, color: "#8b5cf6" },
    { plan: "Mini Pack (Plus)",count:   1, color: "#22c55e" },
  ],

  // ── Legal feature adoption ─────────────────────────────────────────────────
  // Source: unique users who used each feature at least once + total uses
  featureAdoption: [
    {
      feature:    "Draft",
      users:       181,
      totalUses:   333,
      pct:         10.3,   // 181/1756
    },
    {
      feature:    "Research",
      users:        41,
      totalUses:    76,
      pct:          2.3,
    },
    {
      feature:    "Query",
      users:        19,
      totalUses:    57,
      pct:          1.1,
    },
    {
      feature:    "Contact Review",
      users:         7,
      totalUses:    15,
      pct:          0.4,
    },
    {
      feature:    "Judgment Details",
      users:         0,
      totalUses:     0,
      pct:          0.0,   // completely unused — product insight
    },
  ],

  // ── Feature depth funnel ───────────────────────────────────────────────────
  // How many users used N distinct features
  featureDepthFunnel: [
    { label: "Signed up",          count: 1756 },
    { label: "Used any feature",   count:  209 },
    { label: "Used 2+ features",   count:   31 },
    { label: "Used 3+ features",   count:    8 },
    { label: "Subscribed",         count:    7 },
  ],

  // ── Cohort retention ───────────────────────────────────────────────────────
  // "returned" = logged in again >1 hour after signup
  cohortRetention: [
    { month: "Dec 25", total:   4, returned:  1, returnRate: 25.0, activated:  1, activationRate: 25.0 },
    { month: "Jan 26", total:  74, returned: 21, returnRate: 28.4, activated:  8, activationRate: 10.8 },
    { month: "Feb 26", total: 877, returned: 82, returnRate:  9.4, activated:  5, activationRate:  0.6 },
    { month: "Mar 26", total: 790, returned: 59, returnRate:  7.5, activated:189, activationRate: 23.9 },
    { month: "Apr 26", total:   9, returned:  4, returnRate: 44.4, activated:  5, activationRate: 55.6 },
    { month: "May 26", total:   2, returned:  0, returnRate:  0.0, activated:  1, activationRate: 50.0 },
  ],
};