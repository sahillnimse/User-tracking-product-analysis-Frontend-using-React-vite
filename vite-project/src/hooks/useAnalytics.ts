// src/hooks/useAnalytics.ts
// Primary hook for all dashboard pages (except CSV Analysis).
// Returns live/demo data filtered by the selected date range.
// Returns isEmpty:true when mode === "none" so pages can show empty state.

import { useMemo }          from "react";
import { useLiveData, useDateRange } from "@/context/AppContext";
import { analyticsData }    from "@/lib/analyticsData";
import type {
  MonthlySignup, CohortRow,
  EngagementSegment, FeatureAdoptionItem, PlanBreakdown,
} from "@/types";

// ── Month label → Date (for range filtering) ──────────────────────────────────
const MONTH_IDX: Record<string, number> = {
  Jan:0, Feb:1, Mar:2, Apr:3, May:4, Jun:5,
  Jul:6, Aug:7, Sep:8, Oct:9, Nov:10, Dec:11,
};

function monthLabelToDate(label: string): Date {
  const [mon, yr] = label.split(" ");
  return new Date(2000 + parseInt(yr ?? "0"), MONTH_IDX[mon] ?? 0, 1);
}

function filterMonths<T extends { month: string }>(rows: T[], from: Date, to: Date): T[] {
  const fromMonth = new Date(from.getFullYear(), from.getMonth(), 1);
  const toMonth   = new Date(to.getFullYear(),   to.getMonth(),   1);
  return rows.filter(r => {
    const d = monthLabelToDate(r.month);
    return d >= fromMonth && d <= toMonth;
  });
}

// ── Return type ───────────────────────────────────────────────────────────────
export type AnalyticsEmpty = { isEmpty: true; source: "none" };

export type AnalyticsData = {
  isEmpty: false;
  source: "demo" | "live";
  // core KPIs
  totalUsers: number;
  subscribed: number;
  activation: number;
  conversion: number;
  draftsCreated: number;
  zeroEngagement: number;
  // charts — already filtered by date range
  signupsByMonth:     MonthlySignup[];
  cohortRetention:    CohortRow[];
  engagementSegments: EngagementSegment[];
  featureAdoption:    FeatureAdoptionItem[];
  planBreakdown:      PlanBreakdown[];
  featureDepthFunnel: { label: string; count: number }[];
  // filtered summary
  filteredSignups:    number;
  filteredSubscribed: number;
};

export type AnalyticsResult = AnalyticsEmpty | AnalyticsData;

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useAnalytics(): AnalyticsResult {
  const { snapshot, mode } = useLiveData();
  const { range }          = useDateRange();

  return useMemo<AnalyticsResult>(() => {
    if (!snapshot || mode === "none") {
      return { isEmpty: true, source: "none" };
    }

    const isAllTime = range.label === "All time";

    const signupsByMonth = isAllTime
      ? snapshot.signupsByMonth
      : filterMonths(snapshot.signupsByMonth, range.from, range.to);

    const cohortRetention = isAllTime
      ? snapshot.cohortRetention
      : filterMonths(snapshot.cohortRetention, range.from, range.to);

    const filteredSignups    = signupsByMonth.reduce((a, m) => a + m.signups, 0);
    const filteredSubscribed = signupsByMonth.reduce((a, m) => a + m.subs,    0);

    return {
      isEmpty: false,
      source: mode === "demo" ? "demo" : "live",
      totalUsers:         snapshot.totalUsers,
      subscribed:         snapshot.subscribed,
      activation:         snapshot.activation,
      conversion:         snapshot.conversion,
      draftsCreated:      snapshot.draftsCreated,
      zeroEngagement:     snapshot.zeroEngagement,
      engagementSegments: snapshot.engagementSegments,
      featureAdoption:    snapshot.featureAdoption,
      planBreakdown:      snapshot.planBreakdown,
      featureDepthFunnel: snapshot.featureDepthFunnel,
      signupsByMonth,
      cohortRetention,
      filteredSignups,
      filteredSubscribed,
    };
  }, [snapshot, mode, range]);
}

// ── Shared empty-state component (used by every page) ────────────────────────
export { EmptyDataState } from "@/components/dashboard/EmptyDataState";

// ── Static event stream data (used by Events page) ───────────────────────────
export const eventStream: {
  time: string;
  user: string;
  event: string;
  props: string;
  category: "ai" | "core" | "navigation" | "collab" | "billing";
}[] = [
  { time:"14:21:03", user:"u_8f2a", event:"draft.created",          props:"feature=AI, words=342",        category:"ai" },
  { time:"14:21:01", user:"u_3c7b", event:"research.searched",       props:"query=contract law",           category:"ai" },
  { time:"14:20:58", user:"u_9d1e", event:"page.viewed",             props:"path=/dashboard",              category:"navigation" },
  { time:"14:20:55", user:"u_2a4f", event:"query.submitted",         props:"type=statute, results=12",     category:"core" },
  { time:"14:20:51", user:"u_7b8c", event:"subscription.upgraded",   props:"plan=Plus, mrr=₹699",          category:"billing" },
  { time:"14:20:48", user:"u_1d3e", event:"contact.reviewed",        props:"contacts=3",                   category:"core" },
  { time:"14:20:44", user:"u_5f6a", event:"draft.exported",          props:"format=docx",                  category:"ai" },
  { time:"14:20:40", user:"u_4c2b", event:"page.viewed",             props:"path=/features",               category:"navigation" },
  { time:"14:20:36", user:"u_6e9d", event:"session.started",         props:"referrer=google.com",          category:"navigation" },
  { time:"14:20:33", user:"u_0a7f", event:"research.bookmarked",     props:"case=AIR 2024 SC 118",         category:"collab" },
  { time:"14:20:29", user:"u_8f2a", event:"draft.ai_suggestion",     props:"accepted=true",                category:"ai" },
  { time:"14:20:25", user:"u_3c7b", event:"query.submitted",         props:"type=case, results=5",         category:"core" },
  { time:"14:20:21", user:"u_9d1e", event:"page.viewed",             props:"path=/search",                 category:"navigation" },
  { time:"14:20:18", user:"u_2a4f", event:"draft.created",           props:"feature=manual, words=210",    category:"ai" },
  { time:"14:20:14", user:"u_7b8c", event:"session.ended",           props:"duration=420s",                category:"navigation" },
];

export const topEvents: {
  name: string;
  category: "ai" | "core" | "navigation" | "collab" | "billing";
  count: number;
  change: number;
}[] = [
  { name:"draft.created",        category:"ai",         count:4821, change:+12.3 },
  { name:"research.searched",     category:"ai",         count:3102, change: +8.7 },
  { name:"page.viewed",           category:"navigation", count:9840, change: +2.1 },
  { name:"query.submitted",       category:"core",       count:2670, change: -3.4 },
  { name:"session.started",       category:"navigation", count:1756, change: +5.2 },
  { name:"contact.reviewed",      category:"core",       count: 843, change:-11.0 },
  { name:"draft.exported",        category:"ai",         count: 620, change:+21.4 },
  { name:"research.bookmarked",   category:"collab",     count: 390, change: +9.8 },
  { name:"subscription.upgraded", category:"billing",    count:   7, change:-12.5 },
  { name:"draft.ai_suggestion",   category:"ai",         count:2109, change:+17.6 },
];

// ── Conversion scores data (used by Conversion page) ─────────────────────────
export const conversionScores: {
  user: string;
  score: number;
  signals: string[];
  days: number;
}[] = [
  { user: "arjun.mehta@gmail.com",    score: 96, signals: ["5 drafts",  "daily login", "viewed pricing 3×"], days: 12 },
  { user: "priya.sharma@outlook.com", score: 93, signals: ["AI query",  "shared doc",  "trial expiring"],    days:  8 },
  { user: "rahul.v@lawfirm.in",       score: 91, signals: ["3 exports", "team invite",  "Pro page visit"],    days: 21 },
  { user: "sneha.k@advocates.com",    score: 88, signals: ["Research",  "daily login",  "support ticket"],    days:  5 },
  { user: "vikram.d@legalco.in",      score: 85, signals: ["Draft+",    "2 features",   "pricing hover"],     days: 17 },
  { user: "ananya.r@firm.com",        score: 83, signals: ["Query ×8",  "bookmark",     "long session"],      days:  3 },
  { user: "karthik.n@legal.io",       score: 81, signals: ["Research",  "export docx",  "return visit"],      days: 30 },
  { user: "deepa.m@advocates.in",     score: 80, signals: ["AI draft",  "contact scan", "mobile active"],     days: 14 },
];

// ── Static exports for pages not yet on useAnalytics() ───────────────────────
// Derived from analyticsData (LawgicHub CSV snapshot).

const { totalUsers, featureDepthFunnel, zeroEngagement: zeroCount } = analyticsData;

/** Detail pages + FeatureAdoption heatmap (% of activated users). */
export const featureAdoption = [
  { feature: "Draft",            users: 181, adoption: 86.6, trend:  12 },
  { feature: "Research",         users:  41, adoption: 19.6, trend:   8 },
  { feature: "Query",            users:  19, adoption:  9.1, trend:  22 },
  { feature: "Contact Review",   users:   7, adoption:  3.3, trend:  -5 },
  { feature: "Judgment Details", users:   0, adoption:  0.0, trend:   0 },
];

export const featureUsageOverTime = [
  { month: "Dec 25", aiCode:  1, visualEditor:  0, githubSync: 0, imageGen: 0 },
  { month: "Jan 26", aiCode:  8, visualEditor:  3, githubSync: 2, imageGen: 0 },
  { month: "Feb 26", aiCode: 12, visualEditor:  5, githubSync: 4, imageGen: 1 },
  { month: "Mar 26", aiCode:148, visualEditor: 30, githubSync:18, imageGen: 5 },
  { month: "Apr 26", aiCode:  9, visualEditor:  3, githubSync: 2, imageGen: 1 },
  { month: "May 26", aiCode:  1, visualEditor:  0, githubSync: 0, imageGen: 0 },
];

export const activationFunnel = featureDepthFunnel.map((step) => ({
  step:  step.label,
  users: step.count,
  rate:  totalUsers > 0
    ? parseFloat(((step.count / totalUsers) * 100).toFixed(1))
    : 0,
}));

export const retentionCohort = [
  { cohort: "Dec '25", w0: 100, w1: 25, w2: 25, w3: 25, w4:  0 },
  { cohort: "Jan '26", w0: 100, w1: 28, w2: 18, w3: 12, w4:  8 },
  { cohort: "Feb '26", w0: 100, w1:  9, w2:  4, w3:  2, w4:  1 },
  { cohort: "Mar '26", w0: 100, w1: 24, w2: 15, w3:  8, w4:  4 },
  { cohort: "Apr '26", w0: 100, w1: 44, w2: 33, w3:  0, w4:  0 },
  { cohort: "May '26", w0: 100, w1:  0, w2:  0, w3:  0, w4:  0 },
];

export const segmentBreakdown = [
  { name: "Power (10+)",   value:  0.1, color: "#3b82f6" },
  { name: "Engaged (5–9)", value:  0.9, color: "#22c55e" },
  { name: "Casual (2–4)",  value:  4.3, color: "#f59e0b" },
  { name: "At risk (1)",   value:  6.6, color: "#f97316" },
  { name: "Zero",          value: 88.1, color: "#ef4444" },
];

export const zeroEngagement = {
  total:        zeroCount,
  pctOfSignups: parseFloat(((zeroCount / totalUsers) * 100).toFixed(1)),
  bySource: [
    { source: "Organic",  users: 820 },
    { source: "Direct",   users: 412 },
    { source: "Referral", users: 198 },
    { source: "Social",   users:  87 },
    { source: "Paid",     users:  30 },
  ],
};
