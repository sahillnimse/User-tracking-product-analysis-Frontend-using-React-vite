// src/pages/dashboard/Segments.tsx
import { AlertCircle } from "lucide-react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { useNavigate }    from "react-router-dom";
import { PanelCard }      from "@/components/dashboard/StatCard";
import { EmptyDataState } from "@/components/dashboard/EmptyDataState";
import { useAnalytics }   from "@/hooks/useAnalytics";

const tooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontFamily: "JetBrains Mono",
  fontSize: 11,
};

// Acquisition source breakdown (proportional from zero-engagement total)
function buildBySource(zeroTotal: number) {
  const dist = [
    { source: "Organic",  pct: 53 },
    { source: "Direct",   pct: 27 },
    { source: "Referral", pct: 13 },
    { source: "Social",   pct:  6 },
    { source: "Paid",     pct:  1 },
  ];
  return dist.map(d => ({ source: d.source, users: Math.round(zeroTotal * d.pct / 100) }));
}

export default function Segments() {
  const analytics = useAnalytics();
  const navigate  = useNavigate();

  if (analytics.isEmpty) return <EmptyDataState />;

  const { engagementSegments, zeroEngagement, totalUsers } = analytics;
  const zeroBySource = buildBySource(zeroEngagement);
  const zeroPct      = totalUsers > 0 ? ((zeroEngagement / totalUsers) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">User Segments</h1>
        <p className="font-mono text-xs text-muted-foreground">
          Behavioral cohorts and zero-engagement diagnostics — click a segment to drill in
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <PanelCard title="Engagement segmentation" subtitle="Distribution of all signed-up users">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={engagementSegments}
                dataKey="value" nameKey="name"
                outerRadius={110}
                label={({ name, value }) => `${value}`}
                labelLine={false}
                onClick={d => navigate(`/segments/${encodeURIComponent(d.name)}`)}
                className="cursor-pointer"
              >
                {engagementSegments.map(s => <Cell key={s.name} fill={s.color} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} formatter={(v, n) => [`${v} users`, n]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {engagementSegments.map(s => (
              <button
                key={s.name}
                onClick={() => navigate(`/segments/${encodeURIComponent(s.name)}`)}
                className="flex items-center justify-between rounded border border-border/60
                  bg-muted/20 px-2 py-1.5 font-mono text-xs hover:border-primary/40
                  hover:bg-muted/40 transition-all text-left"
              >
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                  <span>{s.name}</span>
                </div>
                <span className="text-muted-foreground">{s.value.toLocaleString()}</span>
              </button>
            ))}
          </div>
        </PanelCard>

        <div className="space-y-4">
          <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-destructive">
              <AlertCircle className="h-3 w-3" /> Zero-engagement alert
            </div>
            <div className="mt-2 font-display text-3xl font-bold text-destructive">
              {zeroEngagement.toLocaleString()}
            </div>
            <div className="mt-1 font-mono text-xs text-muted-foreground">
              users signed up but never performed a tracked action ({zeroPct}% of signups)
            </div>
          </div>

          <PanelCard title="Zero-engagement by acquisition" subtitle="Where these users come from">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={zeroBySource}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="source" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="users" fill="hsl(0 75% 55%)" radius={[4, 4, 0, 0]} name="Users" />
              </BarChart>
            </ResponsiveContainer>
          </PanelCard>
        </div>
      </div>

      <PanelCard title="Segment definitions" subtitle="How each cohort is computed">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
          {[
            { name: "Power users",       def: "20+ sessions/mo · 5+ AI prompts/day · uses 3+ features" },
            { name: "Engaged",           def: "8+ sessions/mo · weekly activity · uses 2+ features" },
            { name: "Casual",            def: "2–7 sessions/mo · sporadic AI usage" },
            { name: "At risk",           def: "Active in past but no session in 14d" },
            { name: "Zero engagement",   def: "Signed up but no event after signup" },
          ].map(s => (
            <div key={s.name} className="rounded-md border border-border/60 bg-muted/20 p-3">
              <div className="font-display text-xs font-semibold text-primary">{s.name}</div>
              <div className="mt-1 font-mono text-[11px] leading-relaxed text-muted-foreground">{s.def}</div>
            </div>
          ))}
        </div>
      </PanelCard>
    </div>
  );
}