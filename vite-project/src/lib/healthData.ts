// Product health & page flow mock data (adapted from reference)

export type Trend = "↑" | "↓" | "→";

export const healthDimensions: { name: string; score: number; prev: number; t: Trend }[] = [
  { name: "Onboarding", score: 44, prev: 52, t: "↓" },
  { name: "Discoverability", score: 36, prev: 36, t: "→" },
  { name: "Core Engagement", score: 68, prev: 60, t: "↑" },
  { name: "Performance", score: 72, prev: 76, t: "↓" },
  { name: "Pricing Value", score: 51, prev: 59, t: "↓" },
  { name: "Mobile UX", score: 31, prev: 40, t: "↓" },
  { name: "Documentation", score: 49, prev: 47, t: "→" },
  { name: "AI Quality", score: 78, prev: 74, t: "↑" },
];

export type Severity = "Critical" | "High" | "Medium";
export const productIssues: {
  sev: Severity; area: string; impact: number; aff: number; title: string; rec: string;
}[] = [
  { sev: "Critical", area: "Onboarding", impact: 94, aff: 58, title: "67% of new users never complete a second action", rec: "Add 5 pre-filled prompts on the empty search/dashboard state to show what a good query looks like." },
  { sev: "High", area: "Pricing", impact: 81, aff: 42, title: "Free trial hard-block (pages=0) drives churn", rec: "Show an upgrade preview page with their work instead of a hard block. 73% of churned users had pages_left=0." },
  { sev: "High", area: "Discoverability", impact: 78, aff: 69, title: "AI Drafting used by only 31% — biggest revenue feature", rec: "Add a 'Draft this' CTA on every result page." },
  { sev: "High", area: "AI Quality", impact: 74, aff: 34, title: "Long-tail queries return irrelevant results", rec: "34% of support tickets mention poor results — retrain embeddings on the long-tail corpus." },
  { sev: "Medium", area: "Mobile UX", impact: 62, aff: 38, title: "Mobile sessions 78% shorter — PDF viewer broken on iOS", rec: "Replace iframe PDF render with native PDF.js viewer." },
  { sev: "Medium", area: "Discoverability", impact: 58, aff: 79, title: "Secondary search adopted by only 18% of Pro users", rec: "Add to main nav and include in Pro onboarding email." },
];

export const quickWins = [
  "Add 5 pre-filled prompts to empty search state",
  "Show 'Try AI Drafting' CTA on every result page",
  "Day-1 onboarding email with 3 role-based use cases",
  "Upgrade preview page instead of hard pages=0 block",
  "Fix iOS Safari PDF viewer crash",
];

export const strategicBets = [
  "Retrain embeddings for long-tail corpus",
  "Cross-feature CTAs on all result pages",
  "Dedicated Pro user onboarding flow",
  "Mobile-native PDF viewer (PDF.js integration)",
  "Weekly digest email to lift DAU",
];

export const pageFlows = [
  { from: "Landing", to: "Signup", users: 1755, pct: 100 },
  { from: "Signup", to: "Email Verify", users: 1490, pct: 84.9 },
  { from: "Email Verify", to: "Dashboard", users: 1280, pct: 85.9 },
  { from: "Dashboard", to: "Search", users: 1020, pct: 79.7 },
  { from: "Dashboard", to: "AI Drafting", users: 380, pct: 29.7 },
  { from: "Dashboard", to: "Exit", users: 260, pct: 20.3 },
  { from: "Search", to: "Result Detail", users: 520, pct: 51.0 },
  { from: "Search", to: "AI Drafting", users: 180, pct: 17.6 },
  { from: "Search", to: "Exit", users: 500, pct: 49.0 },
  { from: "AI Drafting", to: "Subscription", users: 190, pct: 50.0 },
  { from: "AI Drafting", to: "Exit", users: 190, pct: 50.0 },
  { from: "Result Detail", to: "Subscription", users: 80, pct: 15.4 },
  { from: "Result Detail", to: "Exit", users: 140, pct: 26.9 },
];

export const pageExitRates = [
  { page: "Pricing / Upgrade", exits: 188, sessions: 220, rate: 85.5 },
  { page: "AI Drafting", exits: 190, sessions: 380, rate: 50.0 },
  { page: "Search", exits: 500, sessions: 1020, rate: 49.0 },
  { page: "Document Analysis", exits: 98, sessions: 210, rate: 46.7 },
  { page: "Dashboard (first visit)", exits: 458, sessions: 1280, rate: 35.8 },
  { page: "Result Detail", exits: 140, sessions: 520, rate: 26.9 },
  { page: "Research", exits: 62, sessions: 280, rate: 22.1 },
  { page: "Statute Search", exits: 34, sessions: 190, rate: 17.9 },
  { page: "Signup Form", exits: 265, sessions: 1755, rate: 15.1 },
  { page: "Email Verify", exits: 210, sessions: 1490, rate: 14.1 },
];
