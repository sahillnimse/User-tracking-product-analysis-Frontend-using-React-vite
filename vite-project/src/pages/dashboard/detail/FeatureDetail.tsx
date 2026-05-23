// src/pages/dashboard/detail/FeatureDetail.tsx
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, Users, BarChart2, TrendingUp } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { StatCard, PanelCard } from "@/components/dashboard/StatCard";
import { featureAdoption, featureUsageOverTime } from "@/hooks/useAnalytics";

const tooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontFamily: "JetBrains Mono",
  fontSize: 11,
};

// Map feature names to chart keys used in featureUsageOverTime
const featureKeyMap: Record<string, keyof typeof featureUsageOverTime[0]> = {
  "Draft":          "aiCode",
  "Research":       "visualEditor",
  "Query":          "githubSync",
  "Contact Review": "imageGen",
};

const insights: Record<string, string> = {
  "Draft":
    "Draft is the flagship feature with 86.6% adoption among activated users. " +
    "The steep Mar '26 spike correlates with the launch campaign — sustaining this requires cross-linking from Search and Research result pages.",
  "Research":
    "Research has 19.6% adoption — well below Draft. Adding a 'Research this' CTA on every Draft output page " +
    "could drive cross-feature usage and increase retention.",
  "Query":
    "Query is used by only 9.1% of activated users despite being a core legal workflow. " +
    "Consider adding Query as a prominent action on the dashboard empty state.",
  "Contact Review":
    "Contact Review has 3.3% adoption — the lowest of all active features. " +
    "A dedicated onboarding prompt for legal professionals could surface this underutilised capability.",
  "Judgment Details":
    "Judgment Details has zero recorded uses. This feature may need a UX re-evaluation " +
    "or a guided discovery flow before re-launch.",
};

export default function FeatureDetail() {
  const { featureName } = useParams<{ featureName: string }>();
  const navigate = useNavigate();

  const decoded = decodeURIComponent(featureName ?? "");
  const feature = featureAdoption.find((f) => f.feature === decoded) ?? featureAdoption[0];

  const chartKey = featureKeyMap[feature.feature];
  const trendData = featureUsageOverTime.map((m) => ({
    month: m.month,
    users: chartKey ? (m[chartKey] as number) : 0,
  }));

  const adoptionAmongActive = feature.adoption.toFixed(1);

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 font-mono text-xs text-muted-foreground
          hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Feature Adoption
      </button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg
            bg-primary/15 border border-primary/20">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-mono text-2xl font-bold">{feature.feature}</h1>
            <p className="font-mono text-xs text-muted-foreground">
              Feature analytics · LawgicHub
            </p>
          </div>
        </div>
        {feature.users === 0 && (
          <span className="rounded-full border border-destructive/40 bg-destructive/10
            px-3 py-1 font-mono text-xs text-destructive">
            Unused
          </span>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Unique users"    value={feature.users.toLocaleString()}       icon={Users} />
        <StatCard label="Adoption rate"   value={`${feature.adoption}%`}              icon={BarChart2} />
        <StatCard label="% of all users"  value={`${feature.adoption}%`}              icon={TrendingUp} />
        <StatCard
          label="Trend"
          value={feature.trend >= 0 ? `+${feature.trend}%` : `${feature.trend}%`}
          icon={Sparkles}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Trend chart */}
        <div className="lg:col-span-2">
          <PanelCard title={`Monthly active users · ${feature.feature}`} subtitle="Unique users who used the feature each month">
            {feature.users === 0 ? (
              <div className="flex h-48 items-center justify-center">
                <p className="font-mono text-xs text-muted-foreground">
                  No usage data recorded for this feature.
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={trendData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="featureGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                    axisLine={false} tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                    axisLine={false} tickLine={false}
                  />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area
                    type="monotone"
                    dataKey="users"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#featureGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </PanelCard>
        </div>

        {/* Adoption breakdown */}
        <PanelCard title="Adoption breakdown" subtitle="Share of total user base">
          <div className="space-y-4 mt-2">
            <div>
              <div className="flex items-center justify-between font-mono text-xs mb-1">
                <span className="text-muted-foreground">Used feature</span>
                <span className="text-foreground">{adoptionAmongActive}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted/40">
                <div
                  className="h-2 rounded-full bg-primary transition-all"
                  style={{ width: `${Math.min(100, parseFloat(adoptionAmongActive))}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between font-mono text-xs mb-1">
                <span className="text-muted-foreground">Never used</span>
                <span className="text-foreground">{(100 - parseFloat(adoptionAmongActive)).toFixed(1)}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted/40">
                <div
                  className="h-2 rounded-full bg-muted-foreground/40 transition-all"
                  style={{ width: `${Math.min(100, 100 - parseFloat(adoptionAmongActive))}%` }}
                />
              </div>
            </div>
            <div className="rounded-md border border-border/60 bg-muted/20 p-3 mt-4">
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                Untapped users
              </div>
              <div className="font-mono text-xl font-semibold text-foreground">
                {(1756 - feature.users).toLocaleString()}
              </div>
              <div className="font-mono text-[10px] text-muted-foreground mt-0.5">
                signed-up users who haven't tried this feature
              </div>
            </div>
          </div>
        </PanelCard>
      </div>

      {/* Insight */}
      <PanelCard title="Product insight" subtitle="Analysis and recommended next steps">
        <div className="rounded-md border border-primary/20 bg-primary/5 p-4">
          <p className="font-mono text-xs text-foreground leading-relaxed">
            {insights[feature.feature] ?? "No specific insights available for this feature."}
          </p>
        </div>
      </PanelCard>
    </div>
  );
}