import { Users, UserPlus, Zap, DollarSign, Activity, Clock } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts";
import { StatCard, PanelCard } from "@/components/dashboard/StatCard";
import {
  kpis, dailyActiveUsers, topEvents, segmentBreakdown, activationFunnel,
} from "@/lib/analyticsData";

const fmt = (n: number) => n.toLocaleString();
const tooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontFamily: "JetBrains Mono",
  fontSize: 11,
};

export default function Overview() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Product Overview</h1>
        <p className="font-mono text-xs text-muted-foreground">
          Real-time pulse of your AI SaaS — last 30 days
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Active users" value={fmt(kpis.activeUsers.value)} delta={kpis.activeUsers.delta} icon={Users} />
        <StatCard label="New signups" value={fmt(kpis.newSignups.value)} delta={kpis.newSignups.delta} icon={UserPlus} />
        <StatCard label="Activation" value={`${kpis.activationRate.value}%`} delta={kpis.activationRate.delta} icon={Zap} />
        <StatCard label="Conversion" value={`${kpis.conversionRate.value}%`} delta={kpis.conversionRate.delta} icon={Activity} />
        <StatCard label="MRR" value={`$${(kpis.mrr.value / 1000).toFixed(1)}k`} delta={kpis.mrr.delta} icon={DollarSign} />
        <StatCard label="Avg session" value={`${kpis.avgSession.value}m`} delta={kpis.avgSession.delta} icon={Clock} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PanelCard title="Active users over time" subtitle="DAU vs WAU vs new users">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={dailyActiveUsers}>
                <defs>
                  <linearGradient id="dau" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="wau" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(170 70% 45%)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(170 70% 45%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="wau" stroke="hsl(170 70% 45%)" fill="url(#wau)" strokeWidth={2} />
                <Area type="monotone" dataKey="dau" stroke="hsl(var(--primary))" fill="url(#dau)" strokeWidth={2} />
                <Area type="monotone" dataKey="new" stroke="hsl(45 90% 55%)" fill="transparent" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </PanelCard>
        </div>

        <PanelCard title="User segments" subtitle="Engagement distribution">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={segmentBreakdown} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                {segmentBreakdown.map((s) => <Cell key={s.name} fill={s.color} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontFamily: "JetBrains Mono", fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </PanelCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <PanelCard title="Top events" subtitle="Highest volume events in the period">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={topEvents} layout="vertical" margin={{ left: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={10} />
              <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={10} width={140} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </PanelCard>

        <PanelCard title="Activation funnel snapshot" subtitle="From signup to day-7 activation">
          <div className="space-y-2">
            {activationFunnel.map((s, i) => (
              <div key={s.step}>
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="text-muted-foreground">
                    <span className="mr-2 text-primary">{String(i + 1).padStart(2, "0")}</span>
                    {s.step}
                  </span>
                  <span className="text-foreground">{fmt(s.users)} <span className="text-muted-foreground">({s.rate}%)</span></span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-emerald-300"
                    style={{ width: `${s.rate}%` }}
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
