import { Activity, AlertTriangle, Gauge, Smartphone } from "lucide-react";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip,
} from "recharts";
import { StatCard, PanelCard } from "@/components/dashboard/StatCard";
import {
  healthDimensions, productIssues, quickWins, strategicBets, type Severity,
} from "@/lib/healthData";

const tooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontFamily: "JetBrains Mono",
  fontSize: 11,
};

const scoreColor = (s: number) =>
  s < 40 ? "hsl(var(--destructive))" : s < 65 ? "hsl(45 90% 55%)" : "hsl(var(--primary))";

const sevTone: Record<Severity, string> = {
  Critical: "border-destructive/50 bg-destructive/10 text-destructive",
  High: "border-amber-500/50 bg-amber-500/10 text-amber-400",
  Medium: "border-primary/50 bg-primary/10 text-primary",
};

export default function ProductHealth() {
  const overall = Math.round(
    healthDimensions.reduce((s, d) => s + d.score, 0) / healthDimensions.length,
  );
  const critical = productIssues.filter((i) => i.sev === "Critical").length;
  const high = productIssues.filter((i) => i.sev === "High").length;
  const weakest = [...healthDimensions].sort((a, b) => a.score - b.score)[0];
  const sorted = [...productIssues].sort((a, b) => b.impact - a.impact);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Product Health</h1>
        <p className="font-mono text-xs text-muted-foreground">
          Friction points, declining scores, and improvement opportunities
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Health score" value={`${overall}/100`} icon={Gauge} />
        <StatCard label="Critical issues" value={String(critical)} icon={AlertTriangle} />
        <StatCard label="High issues" value={String(high)} icon={Activity} />
        <StatCard label="Weakest area" value={weakest.name} suffix={`${weakest.score}/100`} icon={Smartphone} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <PanelCard title="Health radar" subtitle="8 product dimensions">
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={healthDimensions} outerRadius={100}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
              <PolarRadiusAxis domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }} stroke="hsl(var(--border))" />
              <Radar
                dataKey="score"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.25}
                strokeWidth={2}
              />
              <Tooltip contentStyle={tooltipStyle} />
            </RadarChart>
          </ResponsiveContainer>
        </PanelCard>

        <PanelCard title="Dimension scores" subtitle="prev → now">
          <div className="space-y-3">
            {healthDimensions.map((d) => (
              <div key={d.name}>
                <div className="flex items-center justify-between font-mono text-xs">
                  <span>{d.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{d.prev} →</span>
                    <span className="font-bold" style={{ color: scoreColor(d.score) }}>{d.score}</span>
                    <span className={d.t === "↑" ? "text-primary" : d.t === "↓" ? "text-destructive" : "text-muted-foreground"}>
                      {d.t}
                    </span>
                  </div>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full" style={{ width: `${d.score}%`, background: scoreColor(d.score) }} />
                </div>
              </div>
            ))}
          </div>
        </PanelCard>
      </div>

      <PanelCard title="Product issues" subtitle="Ranked by impact">
        <div className="space-y-3">
          {sorted.map((issue) => (
            <div key={issue.title} className="rounded-lg border border-border/60 bg-card/50 p-3">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`rounded border px-2 py-0.5 font-mono text-[10px] uppercase ${sevTone[issue.sev]}`}>
                    {issue.sev}
                  </span>
                  <span className="text-sm font-medium">{issue.title}</span>
                </div>
                <span className="rounded bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                  {issue.area}
                </span>
              </div>
              <div className="mb-2 flex flex-wrap gap-4 font-mono text-[11px] text-muted-foreground">
                <span>Affects <span className="font-bold text-destructive">{issue.aff}%</span> of users</span>
                <span>Impact <span className="font-bold" style={{ color: issue.impact > 80 ? "hsl(var(--destructive))" : "hsl(45 90% 55%)" }}>{issue.impact}/100</span></span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full" style={{ width: `${issue.impact}%`, background: issue.impact > 80 ? "hsl(var(--destructive))" : "hsl(45 90% 55%)" }} />
              </div>
              <div className="mt-2 rounded bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">💡 Rec: </span>{issue.rec}
              </div>
            </div>
          ))}
        </div>
      </PanelCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <PanelCard title="⚡ Quick wins" subtitle="0–4 weeks">
          <ul className="divide-y divide-border/60">
            {quickWins.map((w) => (
              <li key={w} className="py-2 font-mono text-xs text-muted-foreground">→ {w}</li>
            ))}
          </ul>
        </PanelCard>
        <PanelCard title="🗺 Strategic bets" subtitle="1–3 months">
          <ul className="divide-y divide-border/60">
            {strategicBets.map((w) => (
              <li key={w} className="py-2 font-mono text-xs text-muted-foreground">→ {w}</li>
            ))}
          </ul>
        </PanelCard>
      </div>
    </div>
  );
}
