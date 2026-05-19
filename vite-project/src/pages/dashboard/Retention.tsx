import { PanelCard } from "@/components/dashboard/StatCard";
import { retentionCohort } from "@/lib/analyticsData";
import { cn } from "@/lib/utils";

const cellColor = (v: number) => {
  if (v === 0) return "bg-muted/20 text-muted-foreground";
  if (v >= 60) return "bg-primary/40 text-foreground";
  if (v >= 45) return "bg-primary/25 text-foreground";
  if (v >= 30) return "bg-primary/15 text-foreground";
  return "bg-primary/5 text-muted-foreground";
};

export default function Retention() {
  const weeks = ["w0", "w1", "w2", "w3", "w4"] as const;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Retention Cohorts</h1>
        <p className="font-mono text-xs text-muted-foreground">
          How often users come back, broken down by signup week
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-lg border border-border/60 bg-card p-4">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Week-1 retention</div>
          <div className="mt-2 font-display text-2xl font-bold text-primary">64.3%</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card p-4">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Week-4 retention</div>
          <div className="mt-2 font-display text-2xl font-bold">35.7%</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card p-4">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Stickiness (DAU/MAU)</div>
          <div className="mt-2 font-display text-2xl font-bold">42%</div>
        </div>
      </div>

      <PanelCard title="Cohort retention heatmap" subtitle="% of users from each signup cohort still active each week">
        <div className="overflow-x-auto">
          <table className="w-full font-mono text-xs">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="px-3 py-2 text-[10px] uppercase tracking-widest">Cohort</th>
                {weeks.map((w) => (
                  <th key={w} className="px-3 py-2 text-center text-[10px] uppercase tracking-widest">
                    {w}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {retentionCohort.map((row) => (
                <tr key={row.cohort} className="border-t border-border/40">
                  <td className="px-3 py-2 text-foreground">{row.cohort}</td>
                  {weeks.map((w) => (
                    <td key={w} className="p-1">
                      <div
                        className={cn(
                          "flex h-10 items-center justify-center rounded",
                          cellColor(row[w]),
                        )}
                      >
                        {row[w] > 0 ? `${row[w]}%` : "—"}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PanelCard>
    </div>
  );
}
