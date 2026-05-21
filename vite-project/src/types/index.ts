// src/types/index.ts

export interface UserRow { [key: string]: string }

export interface MonthlySignup {
  month: string;
  signups: number;
  subs: number;
}

export interface EngagementSegment {
  name: string;
  value: number;
  color: string;
}

export interface FeatureAdoptionItem {
  feature: string;
  users: number;       // unique users who used it at least once
  totalUses: number;   // sum of all uses
  pct: number;         // % of total users
}

export interface CohortRow {
  month: string;
  total: number;
  returned: number;
  returnRate: number;   // %
  activated: number;
  activationRate: number; // %
}

export interface PlanBreakdown {
  plan: string;
  count: number;
  color: string;
}

export interface ParsedStats {
  // Core KPIs
  totalUsers: number;
  subscribed: number;
  totalForSub: number;
  activation: number;       // % who used any feature
  conversion: number;       // % subscribed
  draftsCreated: number;    // total draft actions
  zeroEngagement: number;   // users with 0 feature uses

  // Legal-specific feature metrics
  featureAdoption: FeatureAdoptionItem[];
  featureDepthFunnel: { label: string; count: number }[];

  // Charts
  signupsByMonth: MonthlySignup[];
  engagementSegments: EngagementSegment[];
  planBreakdown: PlanBreakdown[];
  cohortRetention: CohortRow[];

  // Meta
  detectedCols: Record<string, string>;
  columns: string[];
  rows: UserRow[];
  uploadedAt: number;
  fileName: string;
}

export interface AnalyticsSnapshot {
  source: "static" | "csv";

  // KPIs
  totalUsers: number;
  subscribed: number;
  activation: number;
  conversion: number;
  draftsCreated: number;
  zeroEngagement: number;

  // Charts
  signupsByMonth: MonthlySignup[];
  engagementSegments: EngagementSegment[];
  featureAdoption: FeatureAdoptionItem[];
  planBreakdown: PlanBreakdown[];
  cohortRetention: CohortRow[];
  featureDepthFunnel: { label: string; count: number }[];

  // CSV extras
  csvStats: ParsedStats | null;
  fileName: string | null;
  uploadedAt: number | null;
}