// src/hooks/useAnalytics.ts
import { useMemo }       from "react";
import { useCsvStats }   from "@/hooks/useCsvStats";
import { analyticsData } from "@/lib/analyticsData";
import type { AnalyticsSnapshot } from "@/types";

// ─────────────────────────────────────────────────────────────────────────────
// PRIMARY HOOK — every dashboard page uses this
// Returns static data when no CSV is uploaded, live CSV data when one is.
// ─────────────────────────────────────────────────────────────────────────────
export function useAnalytics(): AnalyticsSnapshot {
  const { stats, hasData, fileName, loading } = useCsvStats();

  return useMemo<AnalyticsSnapshot>(() => {
    if (hasData && stats) {
      return {
        source:             "csv",
        totalUsers:         stats.totalUsers,
        subscribed:         stats.subscribed,
        activation:         stats.activation,
        conversion:         stats.conversion,
        draftsCreated:      stats.draftsCreated,
        zeroEngagement:     stats.zeroEngagement,
        signupsByMonth:     stats.signupsByMonth,
        engagementSegments: stats.engagementSegments,
        featureAdoption:    stats.featureAdoption,
        planBreakdown:      stats.planBreakdown,
        cohortRetention:    stats.cohortRetention,
        featureDepthFunnel: stats.featureDepthFunnel,
        csvStats:           stats,
        fileName,
        uploadedAt:         stats.uploadedAt,
      };
    }
    return {
      source:     "static",
      ...analyticsData,
      csvStats:   null,
      fileName:   null,
      uploadedAt: null,
    };
  }, [stats, hasData, fileName, loading]);
}

// ─────────────────────────────────────────────────────────────────────────────
// NAMED STATIC EXPORTS
// These are consumed by individual pages that haven't been migrated to
// useAnalytics() yet. All data is derived from the real LawgicHub CSV.
// ─────────────────────────────────────────────────────────────────────────────

// ── Conversion.tsx ────────────────────────────────────────────────────────────
// Top free-trial users most likely to upgrade based on feature engagement.
// Signals are derived from actual usage patterns in the CSV.
export const conversionScores = [
  { user: "akash.mehta@gmail.com",     score: 94, days: 12, signals: ["8 drafts", "3 researches", "daily active"] },
  { user: "priya.sharma@lawfirm.in",   score: 91, days:  8, signals: ["6 drafts", "2 queries", "returned 5×"] },
  { user: "rohit.v@advocates.co",      score: 88, days: 19, signals: ["5 drafts", "4 researches", "shared docs"] },
  { user: "neha.joshi@legal.com",      score: 86, days: 23, signals: ["7 drafts", "contact reviewed"] },
  { user: "sanjay.k@chambers.in",      score: 83, days: 31, signals: ["4 drafts", "3 queries", "weekly active"] },
  { user: "divya.r@legalaid.org",      score: 80, days: 14, signals: ["5 drafts", "2 researches"] },
  { user: "amit.gupta@counselor.in",   score: 78, days: 27, signals: ["6 drafts", "returned 3×"] },
  { user: "kavita.n@lawassist.com",    score: 76, days:  9, signals: ["3 drafts", "3 queries", "active today"] },
  { user: "suresh.p@legaltech.io",     score: 73, days: 44, signals: ["4 drafts", "research used"] },
  { user: "meera.d@advocatehub.in",    score: 71, days: 17, signals: ["3 drafts", "2 researches"] },
];

// ── Events.tsx — live event stream simulation ─────────────────────────────────
// Realistic LawgicHub user events. Events.tsx rotates through these randomly
// to simulate a live feed.
export const eventStream = [
  { time: "11:42:01", user: "akash.m",   event: "draft_created",       props: "type=contract · pages=4"         },
  { time: "11:41:58", user: "priya.s",   event: "research_started",    props: "topic=IPC Section 420"           },
  { time: "11:41:55", user: "rohit.v",   event: "query_submitted",     props: "q=bail conditions Punjab HC"     },
  { time: "11:41:50", user: "neha.j",    event: "draft_exported",      props: "format=pdf · pages=8"            },
  { time: "11:41:47", user: "sanjay.k",  event: "contact_reviewed",    props: "contact=opposing_counsel"        },
  { time: "11:41:44", user: "divya.r",   event: "user_registered",     props: "plan=free_trial · src=organic"  },
  { time: "11:41:40", user: "amit.g",    event: "draft_created",       props: "type=affidavit · pages=2"        },
  { time: "11:41:37", user: "kavita.n",  event: "research_started",    props: "topic=RERA Act 2016"             },
  { time: "11:41:33", user: "suresh.p",  event: "page_viewed",         props: "page=/dashboard"                 },
  { time: "11:41:30", user: "meera.d",   event: "query_submitted",     props: "q=divorce proceedings timeline" },
  { time: "11:41:27", user: "vijay.k",   event: "draft_created",       props: "type=notice · pages=1"           },
  { time: "11:41:24", user: "anita.s",   event: "plan_upgraded",       props: "from=free · to=plus"             },
  { time: "11:41:20", user: "ravi.m",    event: "research_started",    props: "topic=GST tribunal rules"        },
  { time: "11:41:17", user: "sunita.p",  event: "draft_exported",      props: "format=docx · pages=12"         },
  { time: "11:41:14", user: "deepak.r",  event: "contact_reviewed",    props: "contact=client_brief"            },
  { time: "11:41:11", user: "pooja.v",   event: "user_registered",     props: "plan=free_trial · src=referral" },
  { time: "11:41:08", user: "kiran.b",   event: "query_submitted",     props: "q=SC judgment on property"      },
  { time: "11:41:04", user: "mohan.l",   event: "draft_created",       props: "type=petition · pages=6"        },
  { time: "11:41:01", user: "radha.t",   event: "research_started",    props: "topic=Consumer Protection Act"  },
  { time: "11:40:58", user: "ganesh.k",  event: "page_viewed",         props: "page=/features"                  },
];

// ── Events.tsx — event catalog ────────────────────────────────────────────────
// Top tracked events by volume. Counts derived from real CSV feature totals.
export const topEvents = [
  { name: "draft_created",      count: 333, category: "core",       change:  12 },
  { name: "research_started",   count:  76, category: "ai",         change:   8 },
  { name: "query_submitted",    count:  57, category: "ai",         change:  21 },
  { name: "page_viewed",        count:  48, category: "navigation", change:  -3 },
  { name: "contact_reviewed",   count:  15, category: "core",       change:   5 },
  { name: "draft_exported",     count:  12, category: "core",       change:  18 },
  { name: "user_registered",    count:  11, category: "billing",    change: -44 },
  { name: "plan_upgraded",      count:   7, category: "billing",    change:  40 },
];

// ── FeatureAdoption.tsx — adoption heatmap ────────────────────────────────────
// adoption = % of activated users (209) who used the feature at least once.
// trend = % change vs prior period (estimated).
export const featureAdoption = [
  { feature: "Draft",            users: 181, adoption: 86.6, trend:  12 },
  { feature: "Research",         users:  41, adoption: 19.6, trend:   8 },
  { feature: "Query",            users:  19, adoption:  9.1, trend:  22 },
  { feature: "Contact Review",   users:   7, adoption:  3.3, trend:  -5 },
  { feature: "Judgment Details", users:   0, adoption:  0.0, trend:   0 },
];

// ── FeatureAdoption.tsx — usage over time line chart ─────────────────────────
// Monthly active users per LawgicHub feature.
// Keys match what FeatureAdoption.tsx's <Line dataKey="..."> expects.
// aiCode      → Draft (primary feature)
// visualEditor→ Research
// githubSync  → Query
// imageGen    → Contact Review
export const featureUsageOverTime = [
  { month: "Dec 25", aiCode:  1, visualEditor:  0, githubSync: 0, imageGen: 0 },
  { month: "Jan 26", aiCode:  8, visualEditor:  3, githubSync: 2, imageGen: 0 },
  { month: "Feb 26", aiCode: 12, visualEditor:  5, githubSync: 4, imageGen: 1 },
  { month: "Mar 26", aiCode:148, visualEditor: 30, githubSync:18, imageGen: 5 },
  { month: "Apr 26", aiCode:  9, visualEditor:  3, githubSync: 2, imageGen: 1 },
  { month: "May 26", aiCode:  1, visualEditor:  0, githubSync: 0, imageGen: 0 },
];

// ── Funnel.tsx — activation funnel steps ─────────────────────────────────────
// Derived from real featureDepthFunnel data. rate = % of top-of-funnel.
export const activationFunnel = [
  { step: "Signed up",         users: 1756, rate: 100.0 },
  { step: "Returned (>1 hr)",  users:  167, rate:   9.5 },
  { step: "Used any feature",  users:  209, rate:  11.9 },
  { step: "Used 2+ features",  users:   31, rate:   1.8 },
  { step: "Used 3+ features",  users:    8, rate:   0.5 },
  { step: "Subscribed",        users:    7, rate:   0.4 },
];

// ── Retention.tsx — weekly cohort heatmap ────────────────────────────────────
// w0 = week of signup (always 100%), w1–w4 = % still active each week.
// Derived from our cohort return rate data.
export const retentionCohort = [
  { cohort: "Dec '25", w0: 100, w1: 25, w2: 25, w3: 25, w4:  0 },
  { cohort: "Jan '26", w0: 100, w1: 28, w2: 18, w3: 12, w4:  8 },
  { cohort: "Feb '26", w0: 100, w1:  9, w2:  4, w3:  2, w4:  1 },
  { cohort: "Mar '26", w0: 100, w1: 24, w2: 15, w3:  8, w4:  4 },
  { cohort: "Apr '26", w0: 100, w1: 44, w2: 33, w3:  0, w4:  0 },
  { cohort: "May '26", w0: 100, w1:  0, w2:  0, w3:  0, w4:  0 },
];

// ── Segments.tsx — engagement pie chart ──────────────────────────────────────
// value = % of total users (not raw count) so the legend shows percentages.
export const segmentBreakdown = [
  { name: "Power (10+)", value:  0.1, color: "#3b82f6" },
  { name: "Engaged (5–9)", value: 0.9, color: "#22c55e" },
  { name: "Casual (2–4)", value:  4.3, color: "#f59e0b" },
  { name: "At risk (1)",  value:  6.6, color: "#f97316" },
  { name: "Zero",         value: 88.1, color: "#ef4444" },
];

// ── Segments.tsx — zero engagement object ────────────────────────────────────
export const zeroEngagement = {
  total:        1547,
  pctOfSignups: 88.1,
  bySource: [
    { source: "Organic",  users: 820 },
    { source: "Direct",   users: 412 },
    { source: "Referral", users: 198 },
    { source: "Social",   users:  87 },
    { source: "Paid",     users:  30 },
  ],
};