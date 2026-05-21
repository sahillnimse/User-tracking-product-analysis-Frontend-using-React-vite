import { Users, UserPlus, Zap, DollarSign, Activity, FileText } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts";
import { StatCard, PanelCard } from "@/components/dashboard/StatCard";
import { useAnalytics }        from "@/hooks/useAnalytics";

const fmt = (n: number) => n.toLocaleString();
const tooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontFamily: "JetBrains Mono",
  fontSize: 11,
};

export default function Overview() {
  const data = useAnalytics();

  const months     = data.signupsByMonth;
  const lastMonth  = months[months.length - 1];
  const prevMonth  = months[months.length - 2];

  // delta must be a NUMBER for StatCard (shows ↑↓ arrow)
  const signupDeltaNum: number | undefined =
    prevMonth && prevMonth.signups > 0
      ? parseFloat((((lastMonth?.signups ?? 0) - prevMonth.signups) / prevMonth.signups * 100).toFixed(1))
      : undefined;

  const activeUsers = data.totalUsers - data.zeroEngagement;
  const lastSignups = lastMonth?.signups ?? 0;
  const mrrEstimate = data.subscribed * 699;

  // Feature usage for bar chart
  const featureUsage = data.featureAdoption
    .filter(f => f.totalUses > 0)
    .map(f => ({ name: f.feature, count: f.totalUses }));

  // Signups area chart data
  const signupsChart = months.map(m => ({
    date: m.month,
    dau:  m.signups,
    wau:  Math.round(m.signups * 0.6),
    new:  m.subs,
  }));

  // Activation funnel bars
  const activationFunnel = data.featureDepthFunnel.map(step => ({
    step:  step.label,
    users: step.count,
    rate:  data.totalUsers > 0
      ? parseFloat(((step.count / data.totalUsers) * 100).toFixed(1))
      : 0,
  }));

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Product Overview</h1>
          <p className="font-mono text-xs text-muted-foreground">
            LawgicHub · {data.source === "csv" ? `live · ${data.fileName}` : "static snapshot · 1,756 users"}
          </p>
        </div>
        <span className={`rounded-full px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-widest
          ${data.source === "csv" ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
          {data.source === "csv" ? "Live CSV" : "Snapshot"}
        </span>
      </div>

      {/* KPI strip — delta is number|undefined, note is string */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Total users"  value={fmt(data.totalUsers)}  delta={signupDeltaNum} icon={Users} />
        <StatCard label="New signups"  value={fmt(lastSignups)}      delta={signupDeltaNum} icon={UserPlus} />
        <StatCard label="Activation"   value={`${data.activation}%`} note={`${fmt(activeUsers)} active`} icon={Zap} />
        <StatCard label="Conversion"   value={`${data.conversion}%`} note={`${data.subscribed} paid users`} icon={Activity} />
        <StatCard label="Est. MRR"     value={`₹${(mrrEstimate/1000).toFixed(1)}k`} note={`${data.subscribed} subscribers`} icon={DollarSign} />
        <StatCard label="Total drafts" value={fmt(data.draftsCreated)} note={`${data.featureAdoption[0]?.users ?? 0} users`} icon={FileText} />
      </div>

      {/* Charts row 1 */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PanelCard title="Signups over time" subtitle="Monthly signups · paid overlaid">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={signupsChart}>
                <defs>
                  <linearGradient id="dau" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="wau" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="hsl(170 70% 45%)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(170 70% 45%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                <YAxis                stroke="hsl(var(--muted-foreground))" fontSize={10} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="wau" stroke="hsl(170 70% 45%)"    fill="url(#wau)" strokeWidth={2} name="Est. WAU" />
                <Area type="monotone" dataKey="dau" stroke="hsl(var(--primary))" fill="url(#dau)" strokeWidth={2} name="Signups" />
                <Area type="monotone" dataKey="new" stroke="hsl(45 90% 55%)"     fill="transparent" strokeWidth={2} name="Paid" />
              </AreaChart>
            </ResponsiveContainer>
          </PanelCard>
        </div>

        <PanelCard title="User segments" subtitle="By feature engagement score">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={data.engagementSegments} dataKey="value" nameKey="name"
                innerRadius={55} outerRadius={90} paddingAngle={2}>
                {data.engagementSegments.map((s) => <Cell key={s.name} fill={s.color} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} formatter={(v, n) => [`${fmt(Number(v))} users`, n]} />
              <Legend wrapperStyle={{ fontFamily: "JetBrains Mono", fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </PanelCard>
      </div>

      {/* Charts row 2 */}
      <div className="grid gap-4 lg:grid-cols-2">
        <PanelCard title="Feature usage" subtitle="Total interactions per LawgicHub feature">
          {featureUsage.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={featureUsage} layout="vertical" margin={{ left: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))"
                  fontSize={10} width={130} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Uses" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[260px] items-center justify-center">
              <p className="text-xs text-muted-foreground">No feature usage data</p>
            </div>
          )}
        </PanelCard>

        <PanelCard title="Activation funnel" subtitle="From signup → subscription">
          <div className="space-y-3 pt-1">
            {activationFunnel.map((s, i) => (
              <div key={s.step}>
                <div className="mb-1 flex items-center justify-between font-mono text-xs">
                  <span className="text-muted-foreground">
                    <span className="mr-2 text-primary">{String(i + 1).padStart(2, "0")}</span>
                    {s.step}
                  </span>
                  <span className="text-foreground">
                    {fmt(s.users)} <span className="text-muted-foreground">({s.rate}%)</span>
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-emerald-400 transition-all duration-500"
                    style={{ width: `${Math.max(s.rate, 0.5)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </PanelCard>
      </div>
    </div>
  );
}