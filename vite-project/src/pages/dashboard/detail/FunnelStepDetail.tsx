// src/pages/dashboard/detail/FunnelStepDetail.tsx
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Filter, Users, TrendingDown, ArrowRight } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
} from "recharts";
import { StatCard, PanelCard } from "@/components/dashboard/StatCard";
import { activationFunnel } from "@/hooks/useAnalytics";

const tooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontFamily: "JetBrains Mono",
  fontSize: 11,
};

const stepInsights: Record<string, { problem: string; fix: string }> = {
  "Signed up": {
    problem: "All users start here — focus is on activation, not acquisition.",
    fix: "Ensure onboarding email fires within 5 minutes of signup with a clear first action.",
  },
  "Returned (>1 hr)": {
    problem: "90.5% of users never return after signup — the biggest drop in the funnel.",
    fix: "Add a day-1 push notification / email with a pre-filled legal query to demonstrate value immediately.",
  },
  "Used any feature": {
    problem: "Only 11.9% of signups try a single feature — discovery is the core problem.",
    fix: "Replace the empty dashboard with 5 suggested actions. Show a 30-second onboarding video.",
  },
  "Used 2+ features": {
    problem: "Cross-feature usage is at 1.8% — users get stuck in the first feature they try.",
    fix: "After each draft, surface a 'Now try Research' prompt. Add cross-feature tooltips.",
  },
  "Used 3+ features": {
    problem: "Deep engagement is rare at 0.5% — these are your best upgrade candidates.",
    fix: "Identify this cohort in your CRM and trigger a personalised upgrade offer within 24 hours.",
  },
  "Subscribed": {
    problem: "0.4% conversion — industry benchmark for PLG is 2–5%.",
    fix: "Upgrade preview page instead of hard paywall. Show value at pages=0 rather than blocking.",
  },
};

export default function FunnelStepDetail() {
  const { stepName } = useParams<{ stepName: string }>();
  const navigate = useNavigate();

  const decoded = decodeURIComponent(stepName ?? "");
  const stepIdx = activationFunnel.findIndex((s) => s.step === decoded);
  const step    = activationFunnel[stepIdx] ?? activationFunnel[0];
  const prev    = activationFunnel[stepIdx - 1];
  const next    = activationFunnel[stepIdx + 1];

  const dropOffCount = prev ? prev.users - step.users : 0;
  const dropOffRate  = prev ? ((dropOffCount / prev.users) * 100).toFixed(1) : "0.0";

  const insight = stepInsights[step.step] ?? {
    problem: "No specific analysis for this step.",
    fix: "Review funnel data to identify drop-off patterns.",
  };

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 font-mono text-xs text-muted-foreground
          hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Funnel
      </button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg
            bg-primary/15 border border-primary/20">
            <Filter className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Funnel step {stepIdx + 1} of {activationFunnel.length}
            </p>
            <h1 className="font-display text-2xl font-bold">{step.step}</h1>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Users at step"  value={step.users.toLocaleString()}  icon={Users} />
        <StatCard label="Conversion rate" value={`${step.rate}%`}            icon={Filter} />
        <StatCard
          label="Dropped before step"
          value={dropOffCount > 0 ? dropOffCount.toLocaleString() : "—"}
          icon={TrendingDown}
        />
        <StatCard
          label="Drop-off rate"
          value={prev ? `${dropOffRate}%` : "—"}
          note={prev ? `from "${prev.step}"` : "Top of funnel"}
          icon={TrendingDown}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Full funnel with this step highlighted */}
        <PanelCard title="Activation funnel" subtitle="Users who reached each step">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={activationFunnel}
              layout="vertical"
              margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                axisLine={false} tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="step"
                width={130}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                axisLine={false} tickLine={false}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="users" radius={[0, 4, 4, 0]}>
                {activationFunnel.map((s) => (
                  <Cell
                    key={s.step}
                    fill={s.step === step.step
                      ? "hsl(var(--primary))"
                      : "hsl(var(--muted-foreground)/0.3)"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </PanelCard>

        {/* Step context */}
        <div className="space-y-3">
          {/* Prev → current → next breadcrumb */}
          <PanelCard title="Step context" subtitle="Surrounding steps in the funnel">
            <div className="flex items-center gap-2 flex-wrap mt-1">
              {prev && (
                <>
                  <div className="rounded-md border border-border/60 bg-muted/30 px-3 py-2 font-mono text-xs text-muted-foreground">
                    {prev.step}
                    <div className="text-[10px] mt-0.5">{prev.users.toLocaleString()} users</div>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                </>
              )}
              <div className="rounded-md border border-primary/40 bg-primary/10 px-3 py-2 font-mono text-xs text-primary">
                {step.step}
                <div className="text-[10px] mt-0.5">{step.users.toLocaleString()} users</div>
              </div>
              {next && (
                <>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <div className="rounded-md border border-border/60 bg-muted/30 px-3 py-2 font-mono text-xs text-muted-foreground">
                    {next.step}
                    <div className="text-[10px] mt-0.5">{next.users.toLocaleString()} users</div>
                  </div>
                </>
              )}
            </div>
          </PanelCard>

          {/* Problem + fix */}
          <PanelCard title="Drop-off analysis" subtitle="Why users leave at this step">
            <div className="space-y-3 mt-1">
              <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3">
                <div className="font-mono text-[10px] uppercase tracking-widest text-destructive mb-1.5">
                  Problem
                </div>
                <p className="font-mono text-xs text-foreground leading-relaxed">
                  {insight.problem}
                </p>
              </div>
              <div className="rounded-md border border-primary/20 bg-primary/5 p-3">
                <div className="font-mono text-[10px] uppercase tracking-widest text-primary mb-1.5">
                  Recommended fix
                </div>
                <p className="font-mono text-xs text-foreground leading-relaxed">
                  {insight.fix}
                </p>
              </div>
            </div>
          </PanelCard>
        </div>
      </div>
    </div>
  );
}