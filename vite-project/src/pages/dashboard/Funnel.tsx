// src/pages/dashboard/Funnel.tsx
import { ArrowDown, AlertTriangle } from "lucide-react";
import { useNavigate }              from "react-router-dom";
import { PanelCard }                from "@/components/dashboard/StatCard";
import { EmptyDataState }           from "@/components/dashboard/EmptyDataState";
import { useAnalytics }             from "@/hooks/useAnalytics";
import { cn }                       from "@/lib/utils";

export default function Funnel() {
  const analytics = useAnalytics();
  const navigate  = useNavigate();

  if (analytics.isEmpty) return <EmptyDataState />;

  const { featureDepthFunnel, totalUsers } = analytics;

  const steps = featureDepthFunnel.map(s => ({
    step:  s.label,
    users: s.count,
    rate:  totalUsers > 0 ? parseFloat(((s.count / totalUsers) * 100).toFixed(1)) : 0,
  }));

  const drops = steps.map((s, i) => {
    if (i === 0) return { ...s, drop: 0, dropPct: 0 };
    const prev = steps[i - 1];
    const drop = prev.users - s.users;
    return { ...s, drop, dropPct: prev.users > 0 ? (drop / prev.users) * 100 : 0 };
  });

  const biggestDropIdx = drops.reduce(
    (max, s, i, arr) => (s.dropPct > arr[max].dropPct ? i : max),
    1
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Activation Funnel</h1>
        <p className="font-mono text-xs text-muted-foreground">
          Where users drop off in onboarding and feature usage
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-lg border border-border/60 bg-card p-4">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Top of funnel
          </div>
          <div className="mt-2 font-display text-2xl font-bold">
            {steps[0]?.users.toLocaleString() ?? 0}
          </div>
          <div className="mt-1 font-mono text-[11px] text-muted-foreground">total signups</div>
        </div>

        <div className="rounded-lg border border-border/60 bg-card p-4">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Activated (used any feature)
          </div>
          <div className="mt-2 font-display text-2xl font-bold text-primary text-glow-sm">
            {steps[1]?.rate ?? 0}%
          </div>
          <div className="mt-1 font-mono text-[11px] text-muted-foreground">
            {steps[1]?.users.toLocaleString() ?? 0} users reached activation
          </div>
        </div>

        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4">
          <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-destructive">
            <AlertTriangle className="h-3 w-3" /> Biggest drop-off
          </div>
          <div className="mt-2 font-display text-2xl font-bold text-destructive">
            -{drops[biggestDropIdx]?.dropPct.toFixed(1)}%
          </div>
          <div className="mt-1 font-mono text-[11px] text-muted-foreground">
            at "{drops[biggestDropIdx]?.step}"
          </div>
        </div>
      </div>

      <PanelCard
        title="Step-by-step funnel"
        subtitle="Click a step to drill into users at that stage"
      >
        <div className="space-y-3">
          {drops.map((s, i) => (
            <div key={s.step}>
              {i > 0 && (
                <div className="mb-2 ml-6 flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
                  <ArrowDown className="h-3 w-3" />
                  <span className={cn(s.dropPct > 30 && "text-destructive")}>
                    -{s.drop.toLocaleString()} users dropped ({s.dropPct.toFixed(1)}%)
                  </span>
                </div>
              )}
              <div
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/funnel/${encodeURIComponent(s.step)}`)}
                onKeyDown={e => e.key === "Enter" && navigate(`/funnel/${encodeURIComponent(s.step)}`)}
                className={cn(
                  "cursor-pointer rounded-lg border p-4 transition-all hover:border-primary/50 hover:bg-muted/20",
                  i === biggestDropIdx
                    ? "border-destructive/60 bg-destructive/5"
                    : "border-border/60 bg-card",
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md
                      border border-primary/30 bg-primary/10 font-mono text-xs text-primary">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <div>
                      <div className="font-display text-sm font-semibold">{s.step}</div>
                      <div className="font-mono text-[11px] text-muted-foreground">
                        {s.users.toLocaleString()} users · {s.rate}% of signups
                      </div>
                    </div>
                  </div>
                  <div className="font-display text-xl font-bold">{s.rate}%</div>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-300 transition-all duration-700"
                    style={{ width: `${Math.max(s.rate, 0.3)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </PanelCard>
    </div>
  );
}