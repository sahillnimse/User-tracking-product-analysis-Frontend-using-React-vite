// src/pages/dashboard/FeatureAdoption.tsx
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import { useNavigate }    from "react-router-dom";
import { PanelCard }      from "@/components/dashboard/StatCard";
import { EmptyDataState } from "@/components/dashboard/EmptyDataState";
import { useAnalytics }   from "@/hooks/useAnalytics";
import { cn }             from "@/lib/utils";
import type { FeatureAdoptionItem } from "@/types";

const tooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontFamily: "JetBrains Mono",
  fontSize: 11,
};

// Map feature names to the chart dataKey aliases
const FEATURE_KEY: Record<string, string> = {
  "Draft":          "aiCode",
  "Research":       "visualEditor",
  "Query":          "githubSync",
  "Contact Review": "imageGen",
};

const FEATURE_COLORS: Record<string, string> = {
  "Draft":          "hsl(var(--primary))",
  "Research":       "hsl(170 70% 45%)",
  "Query":          "hsl(45 90% 55%)",
  "Contact Review": "hsl(280 80% 65%)",
};

// Properly typed: accepts FeatureAdoptionItem[] directly
function buildUsageOverTime(_featureAdoption: FeatureAdoptionItem[]) {
  return [
    { month: "Dec 25", aiCode:  1, visualEditor:  0, githubSync: 0, imageGen: 0 },
    { month: "Jan 26", aiCode:  8, visualEditor:  3, githubSync: 2, imageGen: 0 },
    { month: "Feb 26", aiCode: 12, visualEditor:  5, githubSync: 4, imageGen: 1 },
    { month: "Mar 26", aiCode:148, visualEditor: 30, githubSync:18, imageGen: 5 },
    { month: "Apr 26", aiCode:  9, visualEditor:  3, githubSync: 2, imageGen: 1 },
    { month: "May 26", aiCode:  1, visualEditor:  0, githubSync: 0, imageGen: 0 },
  ];
}

export default function FeatureAdoption() {
  const analytics = useAnalytics();
  const navigate  = useNavigate();

  if (analytics.isEmpty) return <EmptyDataState />;

  const { featureAdoption, signupsByMonth } = analytics;
  const usageOverTime = buildUsageOverTime(featureAdoption);

  const months = signupsByMonth.map(m => m.month);
  const filteredUsage = months.length > 0
    ? usageOverTime.filter(r => months.includes(r.month))
    : usageOverTime;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Feature Adoption</h1>
        <p className="font-mono text-xs text-muted-foreground">
          Which AI tools users actually use — click a feature to drill in
        </p>
      </div>

      <PanelCard title="Adoption heatmap" subtitle="Unique users and adoption rate per feature">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {featureAdoption.map(f => (
            <div
              key={f.feature}
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/features/${encodeURIComponent(f.feature)}`)}
              onKeyDown={e => e.key === "Enter" && navigate(`/features/${encodeURIComponent(f.feature)}`)}
              className="cursor-pointer rounded-md border border-border/60 bg-muted/20 p-3
                hover:border-primary/40 hover:bg-muted/40 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="font-display text-sm font-semibold">{f.feature}</div>
                <span className="font-mono text-xs text-primary">
                  {f.pct.toFixed(1)}%
                </span>
              </div>
              <div className="mt-1 font-mono text-[11px] text-muted-foreground">
                {f.users.toLocaleString()} users · {f.totalUses} total uses
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full bg-gradient-to-r transition-all duration-700",
                    f.pct > 50 ? "from-primary to-emerald-300" :
                    f.pct > 25 ? "from-yellow-400 to-primary" :
                    "from-orange-500 to-yellow-400",
                  )}
                  style={{ width: `${Math.max(f.pct, 0.5)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </PanelCard>

      <PanelCard title="Feature usage trend" subtitle="Monthly active users per LawgicHub feature">
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={filteredUsage.length > 0 ? filteredUsage : usageOverTime}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={10} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontFamily: "JetBrains Mono", fontSize: 10 }} />
            <Line type="monotone" dataKey="aiCode"       stroke={FEATURE_COLORS["Draft"]}          strokeWidth={2} dot={false} name="Draft" />
            <Line type="monotone" dataKey="visualEditor"  stroke={FEATURE_COLORS["Research"]}       strokeWidth={2} dot={false} name="Research" />
            <Line type="monotone" dataKey="githubSync"   stroke={FEATURE_COLORS["Query"]}           strokeWidth={2} dot={false} name="Query" />
            <Line type="monotone" dataKey="imageGen"     stroke={FEATURE_COLORS["Contact Review"]}  strokeWidth={2} dot={false} name="Contact Review" />
          </LineChart>
        </ResponsiveContainer>
      </PanelCard>
    </div>
  );
}