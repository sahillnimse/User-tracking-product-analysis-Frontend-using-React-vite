// Mock analytics data for the product analytics dashboard

export const kpis = {
  activeUsers: { value: 24813, delta: 12.4 },
  newSignups: { value: 1842, delta: 8.1 },
  activationRate: { value: 47.3, delta: -2.1 },
  conversionRate: { value: 6.8, delta: 1.4 },
  mrr: { value: 184230, delta: 15.2 },
  avgSession: { value: 8.4, delta: 4.6 },
};

export const dailyActiveUsers = Array.from({ length: 30 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (29 - i));
  const base = 1800 + Math.sin(i / 3) * 250 + i * 18;
  return {
    date: d.toISOString().slice(5, 10),
    dau: Math.round(base + Math.random() * 200),
    wau: Math.round(base * 3.2 + Math.random() * 400),
    new: Math.round(80 + Math.random() * 60 + i * 1.2),
  };
});

export const topEvents = [
  { name: "page_view", count: 184320, change: 8.2, category: "navigation" },
  { name: "ai_prompt_submitted", count: 42180, change: 24.6, category: "ai" },
  { name: "project_created", count: 8430, change: 12.1, category: "core" },
  { name: "file_uploaded", count: 6210, change: -3.4, category: "core" },
  { name: "code_export", count: 4820, change: 18.9, category: "core" },
  { name: "team_invited", count: 1240, change: 6.7, category: "collab" },
  { name: "billing_viewed", count: 980, change: 41.2, category: "billing" },
  { name: "subscription_started", count: 312, change: 22.4, category: "billing" },
];

export const eventStream = [
  { time: "12:42:18", user: "u_8a3f", event: "ai_prompt_submitted", props: "model=claude-sonnet" },
  { time: "12:42:11", user: "u_4c1b", event: "page_view", props: "/dashboard" },
  { time: "12:42:05", user: "u_91de", event: "project_created", props: "template=blank" },
  { time: "12:41:58", user: "u_22a7", event: "subscription_started", props: "plan=pro" },
  { time: "12:41:49", user: "u_8a3f", event: "code_export", props: "format=zip" },
  { time: "12:41:33", user: "u_5fb2", event: "signup", props: "source=organic" },
  { time: "12:41:20", user: "u_71cc", event: "file_uploaded", props: "type=image" },
  { time: "12:41:08", user: "u_4c1b", event: "ai_prompt_submitted", props: "model=gpt-5" },
  { time: "12:40:55", user: "u_3d99", event: "team_invited", props: "count=3" },
  { time: "12:40:41", user: "u_22a7", event: "billing_viewed", props: "" },
];

export const activationFunnel = [
  { step: "Signed up", users: 10000, rate: 100 },
  { step: "Verified email", users: 7820, rate: 78.2 },
  { step: "Completed onboarding", users: 5410, rate: 54.1 },
  { step: "First project created", users: 3920, rate: 39.2 },
  { step: "First AI prompt", users: 2840, rate: 28.4 },
  { step: "Invited teammate", users: 1310, rate: 13.1 },
  { step: "Activated (day-7 retention)", users: 980, rate: 9.8 },
];

export const featureAdoption = [
  { feature: "AI Code Generation", users: 18420, adoption: 74, trend: 12 },
  { feature: "Visual Editor", users: 14210, adoption: 57, trend: 8 },
  { feature: "GitHub Sync", users: 9810, adoption: 39, trend: 22 },
  { feature: "Custom Domains", users: 4120, adoption: 16, trend: 5 },
  { feature: "Team Collaboration", users: 6230, adoption: 25, trend: 18 },
  { feature: "AI Image Gen", users: 11340, adoption: 45, trend: 31 },
  { feature: "Edge Functions", users: 3210, adoption: 12, trend: -2 },
  { feature: "Analytics", users: 2110, adoption: 8, trend: 14 },
];

export const featureUsageOverTime = Array.from({ length: 12 }, (_, i) => {
  const d = new Date();
  d.setMonth(d.getMonth() - (11 - i));
  return {
    month: d.toLocaleString("en", { month: "short" }),
    aiCode: 4000 + i * 1200 + Math.random() * 500,
    visualEditor: 6000 + i * 700 + Math.random() * 400,
    githubSync: 1000 + i * 800 + Math.random() * 300,
    imageGen: 800 + i * 950 + Math.random() * 400,
  };
});

export const conversionScores = [
  { user: "alex.kim@northwind.io", score: 94, signals: ["3+ projects", "team invited", "viewed pricing 2x"], plan: "Free", days: 6 },
  { user: "priya.s@brightlabs.com", score: 91, signals: ["AI export", "domain connected", "billing viewed"], plan: "Free", days: 11 },
  { user: "marco@studiomint.co", score: 88, signals: ["daily active 7d", "5+ AI prompts/day"], plan: "Free", days: 9 },
  { user: "sasha.dev@orbital.app", score: 85, signals: ["GitHub synced", "team invited"], plan: "Free", days: 14 },
  { user: "lena@fjord.studio", score: 82, signals: ["pricing viewed 3x", "support contact"], plan: "Free", days: 4 },
  { user: "tom@helix.io", score: 78, signals: ["consistent weekly use", "shared project"], plan: "Free", days: 21 },
  { user: "ravi@pixelroot.dev", score: 74, signals: ["custom domain", "AI prompts 50+"], plan: "Free", days: 17 },
];

export const segmentBreakdown = [
  { name: "Power users", value: 12, color: "hsl(142 72% 50%)" },
  { name: "Engaged", value: 28, color: "hsl(170 70% 45%)" },
  { name: "Casual", value: 24, color: "hsl(45 85% 55%)" },
  { name: "At risk", value: 14, color: "hsl(25 90% 55%)" },
  { name: "Zero engagement", value: 22, color: "hsl(0 75% 55%)" },
];

export const zeroEngagement = {
  total: 5460,
  pctOfSignups: 22,
  bySource: [
    { source: "Organic search", users: 1820, pct: 33 },
    { source: "Paid ads", users: 1640, pct: 30 },
    { source: "Referral", users: 920, pct: 17 },
    { source: "Social", users: 720, pct: 13 },
    { source: "Direct", users: 360, pct: 7 },
  ],
};

export const retentionCohort = [
  { cohort: "Apr W1", w0: 100, w1: 62, w2: 48, w3: 41, w4: 36 },
  { cohort: "Apr W2", w0: 100, w1: 65, w2: 51, w3: 44, w4: 38 },
  { cohort: "Apr W3", w0: 100, w1: 58, w2: 44, w3: 38, w4: 33 },
  { cohort: "Apr W4", w0: 100, w1: 67, w2: 53, w3: 47, w4: 0 },
  { cohort: "May W1", w0: 100, w1: 70, w2: 56, w3: 0, w4: 0 },
  { cohort: "May W2", w0: 100, w1: 64, w2: 0, w3: 0, w4: 0 },
];
