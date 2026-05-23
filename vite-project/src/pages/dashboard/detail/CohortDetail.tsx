// src/pages/dashboard/detail/CohortDetail.tsx
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Repeat, Users, TrendingUp, Calendar } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line,
} from "recharts";
import { StatCard, PanelCard } from "@/components/dashboard/StatCard";
import { retentionCohort } from "@/hooks/useAnalytics";
import { useAnalytics } from "@/hooks/useAnalytics";

const tooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontFamily: "JetBrains Mono",
  fontSize: 11,
};

const cohortSize: Record<string, number> = {
  "Dec '25":  4,
  "Jan '26": 74,
  "Feb '26": 877,
  "Mar '26": 790,
  "Apr '26":   9,
  "May '26":   2,
};

export default function CohortDetail() {
  const { cohort } = useParams<{ cohort: string }>();
  const navigate   = useNavigate();
  const data       = useAnalytics();

  const decoded   = decodeURIComponent(cohort ?? "");
  const cohortRow = retentionCohort.find((c) => c.cohort === decoded) ?? retentionCohort[0];

  const size     = cohortSize[cohortRow.cohort] ?? 0;
  const w1Return = cohortRow.w1;
  const w4Return = cohortRow.w4;

  // Build week-by-week bar data
  const weekData = [
    { week: "Week 0", pct: cohortRow.w0, users: size },
    { week: "Week 1", pct: cohortRow.w1, users: Math.round(size * cohortRow.w1 / 100) },
    { week: "Week 2", pct: cohortRow.w2, users: Math.round(size * cohortRow.w2 / 100) },
    { week: "Week 3", pct: cohortRow.w3, users: Math.round(size * cohortRow.w3 / 100) },
    { week: "Week 4", pct: cohortRow.w4, users: Math.round(size * cohortRow.w4 / 100) },
  ];

  // Compare with avg retention across all cohorts
  const avgRetention = {
    w0: 100,
    w1: Math.round(retentionCohort.reduce((s, c) => s + c.w1, 0) / retentionCohort.length),
    w2: Math.round(retentionCohort.reduce((s, c) => s + c.w2, 0) / retentionCohort.length),
    w3: Math.round(retentionCohort.reduce((s, c) => s + c.w3, 0) / retentionCohort.length),
    w4: Math.round(retentionCohort.reduce((s, c) => s + c.w4, 0) / retentionCohort.length),
  };

  const compareData = weekData.map((w, i) => ({
    week:    w.week,
    cohort:  w.pct,
    average: Object.values(avgRetention)[i],
  }));

  const signupMonth = data.signupsByMonth.find(
    (m) => m.month === cohortRow.cohort,
  );

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 font-mono text-xs text-muted-foreground
          hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Retention
      </button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg
            bg-primary/15 border border-primary/20">
            <Repeat className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Cohort · {cohortRow.cohort}
            </p>
            <h1 className="font-display text-2xl font-bold">
              {cohortRow.cohort} signups
            </h1>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Cohort size"  value={size.toLocaleString()}     icon={Users} />
        <StatCard label="Week-1 return" value={`${w1Return}%`}           icon={Repeat} />
        <StatCard label="Week-4 return" value={`${w4Return}%`}           icon={TrendingUp} />
        <StatCard
          label="Subscriptions"
          value={signupMonth ? signupMonth.subs.toString() : "—"}
          note="from this cohort"
          icon={Calendar}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Weekly retention bars */}
        <PanelCard title="Weekly retention" subtitle="% of cohort still active each week">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={weekData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="week"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                axisLine={false} tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                axisLine={false} tickLine={false}
                unit="%"
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v, name) => [`${v}%`, name === "pct" ? "Retention" : name]}
              />
              <Bar dataKey="pct" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </PanelCard>

        {/* vs average */}
        <PanelCard title="vs. platform average" subtitle="This cohort compared to all-cohort mean">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={compareData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="week"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                axisLine={false} tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                axisLine={false} tickLine={false}
                unit="%"
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Line
                type="monotone"
                dataKey="cohort"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ r: 3, fill: "hsl(var(--primary))" }}
                name="This cohort"
              />
              <Line
                type="monotone"
                dataKey="average"
                stroke="hsl(var(--muted-foreground))"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={false}
                name="Platform avg"
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-2 font-mono text-[10px] text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className="h-0.5 w-5 bg-primary" />
              <span>This cohort</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-0.5 w-5 bg-muted-foreground" style={{ backgroundImage: "repeating-linear-gradient(90deg, currentColor 0, currentColor 4px, transparent 4px, transparent 8px)" }} />
              <span>Platform avg</span>
            </div>
          </div>
        </PanelCard>
      </div>

      {/* Analysis */}
      <PanelCard title="Cohort analysis" subtitle="Why this cohort behaves the way it does">
        <div className="rounded-md border border-primary/20 bg-primary/5 p-4">
          <p className="font-mono text-xs text-foreground leading-relaxed">
            The <strong>{cohortRow.cohort}</strong> cohort had{" "}
            <strong>{size.toLocaleString()} signups</strong> with a week-1 return rate of{" "}
            <strong>{w1Return}%</strong>.{" "}
            {w1Return < avgRetention.w1
              ? `This is below the platform average of ${avgRetention.w1}%, indicating weaker early engagement. ` +
                "Focus on day-1 activation: a targeted onboarding email and pre-filled use cases could lift this significantly."
              : `This is above the platform average of ${avgRetention.w1}%, suggesting this cohort had a strong first experience. ` +
                "Identify what drove this and replicate it for future cohorts."}
          </p>
        </div>
      </PanelCard>
    </div>
  );
}