// src/pages/dashboard/detail/SegmentDetail.tsx
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Zap, TrendingDown, AlertCircle } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
} from "recharts";
import { StatCard, PanelCard } from "@/components/dashboard/StatCard";
import { segmentBreakdown, zeroEngagement } from "@/hooks/useAnalytics";
import { useAnalytics } from "@/hooks/useAnalytics";

const tooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontFamily: "JetBrains Mono",
  fontSize: 11,
};

const recommendations: Record<string, string[]> = {
  "Power (10+)": [
    "Offer a dedicated Power User community or Slack channel",
    "Recruit as beta testers for upcoming features",
    "Personalised outreach for testimonials or case studies",
  ],
  "Engaged (5–9)": [
    "Introduce cross-feature CTAs to push toward Power tier",
    "Send a weekly usage digest to maintain momentum",
    "Offer a limited-time upgrade discount",
  ],
  "Casual (2–4)": [
    "Trigger a re-engagement email on day 7 of inactivity",
    "Show in-app tooltip for the next feature to try",
    "Send a 'top use case' guide matching their role",
  ],
  "At risk (1)": [
    "One-feature users are highest churn risk — send onboarding tip immediately",
    "Surface pre-filled prompts on their next login",
    "Alert CSM team for high-value accounts in this bucket",
  ],
  "Zero": [
    "88.1% of signups — biggest growth lever in the product",
    "Add 5 pre-filled prompts to the empty dashboard state",
    "Day-1 onboarding email with 3 role-based quick wins",
    "In-app guide triggered on first login",
  ],
};

export default function SegmentDetail() {
  const { segmentName } = useParams<{ segmentName: string }>();
  const navigate = useNavigate();

  const decoded = decodeURIComponent(segmentName ?? "");
  const segment = segmentBreakdown.find((s) => s.name === decoded) ?? segmentBreakdown[0];
  const data    = useAnalytics();

  const rawCount = Math.round((segment.value / 100) * data.totalUsers);
  const recs     = recommendations[segment.name] ?? ["No specific recommendations available."];

  // Source breakdown for zero segment, feature bar for engaged segments
  const sourceData = segment.name === "Zero"
    ? zeroEngagement.bySource.map((s) => ({ name: s.source, count: s.users }))
    : data.featureAdoption.map((f) => ({ name: f.feature, count: f.users }));

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 font-mono text-xs text-muted-foreground
          hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Segments
      </button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="h-4 w-4 rounded-full shrink-0"
            style={{ backgroundColor: segment.color }}
          />
          <div>
            <h1 className="font-display text-2xl font-bold">{segment.name}</h1>
            <p className="font-mono text-xs text-muted-foreground">Segment drill-down</p>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Users in segment" value={rawCount.toLocaleString()}            icon={Users} />
        <StatCard label="Share of total"   value={`${segment.value}%`}                 icon={Zap} />
        <StatCard label="Total users"      value={data.totalUsers.toLocaleString()}     icon={Users} />
        <StatCard
          label="Engagement risk"
          value={segment.name === "Zero" || segment.name === "At risk (1)" ? "High" : "Low"}
          icon={AlertCircle}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Chart */}
        <PanelCard
          title={segment.name === "Zero" ? "Zero-engagement by signup source" : "Feature reach within segment"}
          subtitle={segment.name === "Zero" ? "Users who never took an action, by acquisition channel" : "Unique users who used each feature"}
        >
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={sourceData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                axisLine={false} tickLine={false}
              />
              <YAxis
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                axisLine={false} tickLine={false}
              />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "hsl(var(--muted)/0.3)" }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {sourceData.map((_, i) => (
                  <Cell
                    key={i}
                    fill={i === 0 ? segment.color : "hsl(var(--muted-foreground)/0.4)"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </PanelCard>

        {/* Recommendations */}
        <PanelCard title="Recommended actions" subtitle="Tactics to move users up the engagement ladder">
          <div className="space-y-2 mt-1">
            {recs.map((r, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-md border border-border/60
                  bg-muted/20 px-3 py-2.5"
              >
                <div className="mt-1 h-1.5 w-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: segment.color }} />
                <span className="font-mono text-xs text-foreground leading-relaxed">{r}</span>
              </div>
            ))}
          </div>
        </PanelCard>
      </div>

      {/* Alert panel for zero / at-risk */}
      {(segment.name === "Zero" || segment.name === "At risk (1)") && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase
            tracking-widest text-destructive mb-2">
            <TrendingDown className="h-3 w-3" />
            High-priority segment
          </div>
          <p className="font-mono text-xs text-foreground leading-relaxed">
            Users in the <strong>{segment.name}</strong> bucket represent your single
            largest growth opportunity. Even a 5% lift here adds{" "}
            <strong>{Math.round(rawCount * 0.05).toLocaleString()} engaged users</strong>{" "}
            without any new acquisition spend.
          </p>
        </div>
      )}
    </div>
  );
}