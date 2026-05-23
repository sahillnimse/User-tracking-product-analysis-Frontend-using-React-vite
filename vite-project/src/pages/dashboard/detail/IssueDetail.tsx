// src/pages/dashboard/detail/IssueDetail.tsx
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, AlertTriangle, Users, Activity, Gauge } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
} from "recharts";
import { StatCard, PanelCard } from "@/components/dashboard/StatCard";
import { productIssues, healthDimensions, type Severity } from "@/lib/healthData";

const tooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontFamily: "JetBrains Mono",
  fontSize: 11,
};

const sevTone: Record<Severity, string> = {
  Critical: "border-destructive/50 bg-destructive/10 text-destructive",
  High:     "border-amber-500/50 bg-amber-500/10 text-amber-400",
  Medium:   "border-primary/50 bg-primary/10 text-primary",
};

// Synthetic trend data based on impact score
function makeTrend(seed: number) {
  return Array.from({ length: 14 }, (_, i) => ({
    day:   `D-${13 - i}`,
    score: Math.max(0, Math.min(100, Math.round(seed * (0.7 + Math.random() * 0.6)))),
  }));
}

export default function IssueDetail() {
  const { issueTitle } = useParams<{ issueTitle: string }>();
  const navigate = useNavigate();

  const decoded = decodeURIComponent(issueTitle ?? "");
  const issue   = productIssues.find((i) => i.title === decoded) ?? productIssues[0];

  const dimension = healthDimensions.find((d) => d.name === issue.area);
  const trend     = makeTrend(issue.impact);

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 font-mono text-xs text-muted-foreground
          hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Product Health
      </button>

      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg
          bg-destructive/15 border border-destructive/20 shrink-0 mt-0.5">
          <AlertTriangle className="h-5 w-5 text-destructive" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`rounded border px-2 py-0.5 font-mono text-[10px] uppercase
              font-semibold ${sevTone[issue.sev]}`}>
              {issue.sev}
            </span>
            <span className="rounded border border-border/60 bg-muted/40 px-2 py-0.5
              font-mono text-[10px] text-muted-foreground">
              {issue.area}
            </span>
          </div>
          <h1 className="font-display text-xl font-bold leading-snug">{issue.title}</h1>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Impact score"      value={`${issue.impact}/100`}          icon={Gauge} />
        <StatCard label="Affected users"    value={`${issue.aff}%`}               icon={Users} />
        <StatCard label="Health dimension"  value={issue.area}                     icon={Activity} />
        <StatCard
          label="Dimension score"
          value={dimension ? `${dimension.score}/100` : "—"}
          note={dimension ? `Trend: ${dimension.t}` : undefined}
          icon={Gauge}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Impact trend */}
        <div className="lg:col-span-2">
          <PanelCard title="Impact signal over time" subtitle="Estimated user-impact score — last 14 days">
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={trend} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                  axisLine={false} tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                  axisLine={false} tickLine={false}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <ReferenceLine
                  y={60}
                  stroke="hsl(var(--muted-foreground))"
                  strokeDasharray="4 4"
                  label={{ value: "Target", fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke={
                    issue.sev === "Critical"
                      ? "hsl(var(--destructive))"
                      : issue.sev === "High"
                      ? "hsl(45 90% 55%)"
                      : "hsl(var(--primary))"
                  }
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </PanelCard>
        </div>

        {/* Health dimension scorecard */}
        <PanelCard title="Health dimension" subtitle={`${issue.area} scores and context`}>
          {dimension ? (
            <div className="space-y-3 mt-2">
              <div>
                <div className="flex items-center justify-between font-mono text-xs mb-1">
                  <span className="text-muted-foreground">Current score</span>
                  <span className="text-foreground font-semibold">{dimension.score}/100</span>
                </div>
                <div className="h-2.5 rounded-full bg-muted/40">
                  <div
                    className="h-2.5 rounded-full transition-all"
                    style={{
                      width: `${dimension.score}%`,
                      backgroundColor: dimension.score < 40
                        ? "hsl(var(--destructive))"
                        : dimension.score < 65
                        ? "hsl(45 90% 55%)"
                        : "hsl(var(--primary))",
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between font-mono text-xs mb-1">
                  <span className="text-muted-foreground">Previous score</span>
                  <span className="text-foreground">{dimension.prev}/100</span>
                </div>
                <div className="h-2 rounded-full bg-muted/40">
                  <div
                    className="h-2 rounded-full bg-muted-foreground/40 transition-all"
                    style={{ width: `${dimension.prev}%` }}
                  />
                </div>
              </div>
              <div className={`rounded-md border px-3 py-2 font-mono text-xs mt-2 ${sevTone[issue.sev]}`}>
                Trend: {dimension.t === "↓" ? "Declining" : dimension.t === "↑" ? "Improving" : "Stable"}{" "}
                ({dimension.prev} → {dimension.score})
              </div>
            </div>
          ) : (
            <p className="font-mono text-xs text-muted-foreground mt-2">
              Dimension data not available.
            </p>
          )}
        </PanelCard>
      </div>

      {/* Recommendation */}
      <PanelCard title="Recommended fix" subtitle="Highest-leverage action to resolve this issue">
        <div className="rounded-md border border-primary/20 bg-primary/5 p-4">
          <p className="font-mono text-xs text-foreground leading-relaxed">{issue.rec}</p>
        </div>
      </PanelCard>
    </div>
  );
}