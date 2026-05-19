import { PanelCard, StatCard } from "@/components/dashboard/StatCard";
import { LogOut, MousePointerClick, Route, TrendingDown } from "lucide-react";
import { pageExitRates, pageFlows } from "@/lib/healthData";

const sevFor = (rate: number) => {
  if (rate >= 60) return { label: "Critical", color: "hsl(var(--destructive))" };
  if (rate >= 40) return { label: "High", color: "hsl(25 90% 55%)" };
  if (rate >= 20) return { label: "Medium", color: "hsl(45 90% 55%)" };
  return { label: "Low", color: "hsl(var(--primary))" };
};

export default function PageFlow() {
  const sortedExits = [...pageExitRates].sort((a, b) => b.rate - a.rate);
  const maxUsers = Math.max(...pageFlows.map((f) => f.users));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Page Flow & Drop-off</h1>
        <p className="font-mono text-xs text-muted-foreground">
          Where users go, where they abort, and the highest-leverage fixes
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Highest exit page" value="Pricing" suffix="85.5%" icon={LogOut} />
        <StatCard label="Biggest drop" value="Dashboard→Exit" suffix="260" icon={TrendingDown} />
        <StatCard label="Best path" value="AI→Sub" suffix="50%" icon={Route} />
        <StatCard label="Avg pages / session" value="3.2" icon={MousePointerClick} />
      </div>

      <PanelCard title="Drop-off heatmap" subtitle="Exit rate by page">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-b border-border/60 text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                <th className="py-2">Page</th>
                <th>Sessions</th>
                <th>Exits</th>
                <th>Exit rate</th>
                <th className="w-40">Bar</th>
                <th>Severity</th>
              </tr>
            </thead>
            <tbody>
              {sortedExits.map((row) => {
                const sev = sevFor(row.rate);
                return (
                  <tr key={row.page} className="border-b border-border/40">
                    <td className="py-2 font-medium">{row.page}</td>
                    <td className="font-mono">{row.sessions.toLocaleString()}</td>
                    <td className="font-mono" style={{ color: sev.color }}>{row.exits.toLocaleString()}</td>
                    <td className="font-mono font-bold" style={{ color: sev.color }}>{row.rate}%</td>
                    <td>
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                        <div className="h-full" style={{ width: `${row.rate}%`, background: sev.color }} />
                      </div>
                    </td>
                    <td>
                      <span className="rounded border px-2 py-0.5 font-mono text-[10px]" style={{ borderColor: sev.color, color: sev.color }}>
                        {sev.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </PanelCard>

      <PanelCard title="User flow transitions" subtitle="From → To">
        <div className="space-y-2">
          {pageFlows.map((f, i) => {
            const isExit = f.to === "Exit";
            const isWin = f.to === "Subscription";
            const color = isExit ? "hsl(var(--destructive))" : isWin ? "hsl(var(--primary))" : "hsl(210 80% 60%)";
            return (
              <div key={i} className="flex items-center gap-3 text-xs">
                <span className="w-32 truncate text-muted-foreground">{f.from}</span>
                <span className="text-muted-foreground">→</span>
                <span className="w-32 truncate font-medium" style={{ color: isExit || isWin ? color : undefined }}>{f.to}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div className="h-full" style={{ width: `${(f.users / maxUsers) * 100}%`, background: color }} />
                </div>
                <span className="w-16 text-right font-mono text-muted-foreground">{f.users.toLocaleString()}</span>
                <span className="w-12 text-right font-mono" style={{ color }}>{f.pct}%</span>
              </div>
            );
          })}
        </div>
      </PanelCard>
    </div>
  );
}
