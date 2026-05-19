import { Sparkles, Mail } from "lucide-react";
import { PanelCard } from "@/components/dashboard/StatCard";
import { conversionScores } from "@/lib/analyticsData";
import { cn } from "@/lib/utils";

const scoreTier = (s: number) =>
  s >= 90 ? { label: "Hot", color: "text-primary border-primary/40 bg-primary/10" }
  : s >= 80 ? { label: "Warm", color: "text-yellow-300 border-yellow-300/40 bg-yellow-300/10" }
  : { label: "Promising", color: "text-emerald-300 border-emerald-300/40 bg-emerald-300/10" };

export default function Conversion() {
  const avg = Math.round(conversionScores.reduce((a, c) => a + c.score, 0) / conversionScores.length);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Conversion Readiness</h1>
        <p className="font-mono text-xs text-muted-foreground">
          AI-scored free users most likely to upgrade to paid
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <div className="rounded-lg border border-border/60 bg-card p-4">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">High-intent users</div>
          <div className="mt-2 font-display text-2xl font-bold text-primary text-glow-sm">412</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card p-4">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Avg score</div>
          <div className="mt-2 font-display text-2xl font-bold">{avg}</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card p-4">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Predicted MRR lift</div>
          <div className="mt-2 font-display text-2xl font-bold">$12.4k</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card p-4">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Model confidence</div>
          <div className="mt-2 font-display text-2xl font-bold">87%</div>
        </div>
      </div>

      <PanelCard
        title="Top conversion-ready users"
        subtitle="Free-tier users with the highest probability of converting"
        action={
          <button className="flex items-center gap-1.5 rounded-md border border-primary/40 bg-primary/10 px-3 py-1.5 font-mono text-xs text-primary hover:box-glow-sm">
            <Sparkles className="h-3 w-3" /> Trigger campaign
          </button>
        }
      >
        <div className="overflow-hidden rounded-md border border-border/60">
          <div className="grid grid-cols-12 border-b border-border/60 bg-muted/40 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            <div className="col-span-4">user</div>
            <div className="col-span-1">score</div>
            <div className="col-span-1">tier</div>
            <div className="col-span-4">strongest signals</div>
            <div className="col-span-1">days</div>
            <div className="col-span-1 text-right">action</div>
          </div>
          {conversionScores.map((u) => {
            const tier = scoreTier(u.score);
            return (
              <div key={u.user} className="grid grid-cols-12 items-center border-b border-border/40 px-3 py-3 font-mono text-xs hover:bg-muted/30">
                <div className="col-span-4 truncate text-foreground">{u.user}</div>
                <div className="col-span-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-primary">{u.score}</span>
                    <div className="h-1 w-12 overflow-hidden rounded-full bg-muted">
                      <div className="h-full bg-primary" style={{ width: `${u.score}%` }} />
                    </div>
                  </div>
                </div>
                <div className="col-span-1">
                  <span className={cn("rounded border px-1.5 py-0.5 text-[9px] uppercase", tier.color)}>
                    {tier.label}
                  </span>
                </div>
                <div className="col-span-4 truncate text-muted-foreground">
                  {u.signals.join(" · ")}
                </div>
                <div className="col-span-1 text-muted-foreground">{u.days}d</div>
                <div className="col-span-1 text-right">
                  <button className="rounded border border-border/60 p-1 text-muted-foreground hover:border-primary/40 hover:text-primary">
                    <Mail className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </PanelCard>
    </div>
  );
}
