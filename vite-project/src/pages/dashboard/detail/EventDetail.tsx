// src/pages/dashboard/detail/EventDetail.tsx
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Activity, Users, TrendingUp, Tag } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { StatCard, PanelCard } from "@/components/dashboard/StatCard";
import { topEvents, featureAdoption } from "@/hooks/useAnalytics";

const tooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontFamily: "JetBrains Mono",
  fontSize: 11,
};

const categoryColor: Record<string, string> = {
  ai:         "text-primary border-primary/40 bg-primary/10",
  core:       "text-blue-300 border-blue-300/40 bg-blue-300/10",
  navigation: "text-muted-foreground border-border bg-muted/40",
  billing:    "text-amber-400 border-amber-400/40 bg-amber-400/10",
};

// Synthetic sparkline from a seed value
function makeTrend(seed: number) {
  return Array.from({ length: 14 }, (_, i) => ({
    day:   `D-${13 - i}`,
    count: Math.max(0, Math.round(seed * (0.6 + Math.random() * 0.8))),
  }));
}

export default function EventDetail() {
  const { eventName } = useParams<{ eventName: string }>();
  const navigate = useNavigate();

  const decoded = decodeURIComponent(eventName ?? "");
  const event = topEvents.find((e) => e.name === decoded) ?? topEvents[0];

  // Related features — match event category to feature names
  const related = featureAdoption.filter((f) =>
    event.category === "ai" || event.category === "core"
      ? f.users > 0
      : false,
  ).slice(0, 3);

  const trend = makeTrend(event.count);

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 font-mono text-xs text-muted-foreground
          hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Events
      </button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`rounded border px-2 py-0.5 font-mono text-[10px] uppercase
              ${categoryColor[event.category] ?? "text-muted-foreground border-border bg-muted/40"}`}>
              {event.category}
            </span>
          </div>
          <h1 className="font-mono text-2xl font-bold">{event.name}</h1>
          <p className="font-mono text-xs text-muted-foreground mt-0.5">
            Event analytics · last 14 days
          </p>
        </div>
        <span className={`font-mono text-sm font-semibold ${
          event.change >= 0 ? "text-primary" : "text-destructive"
        }`}>
          {event.change >= 0 ? "+" : ""}{event.change}% trend
        </span>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Total fires"     value={event.count.toLocaleString()} icon={Activity} />
        <StatCard label="Unique users"    value={Math.round(event.count * 0.6).toLocaleString()} icon={Users} />
        <StatCard label="Avg / user"      value={(event.count / Math.max(1, Math.round(event.count * 0.6))).toFixed(1)} suffix="fires" icon={TrendingUp} />
        <StatCard label="Category"        value={event.category} icon={Tag} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Trend chart */}
        <div className="lg:col-span-2">
          <PanelCard title="Event volume · last 14 days" subtitle="Daily fire count">
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={trend} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                  axisLine={false} tickLine={false}
                />
                <YAxis
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                  axisLine={false} tickLine={false}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: "hsl(var(--primary))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </PanelCard>
        </div>

        {/* Related features */}
        <PanelCard title="Related features" subtitle="Features this event is associated with">
          <div className="space-y-2 mt-1">
            {related.length > 0 ? related.map((f) => (
              <div
                key={f.feature}
                className="rounded-md border border-border/60 bg-muted/30 p-3"
              >
                <div className="font-mono text-xs font-semibold text-foreground">{f.feature}</div>
                <div className="mt-1 font-mono text-[10px] text-muted-foreground">
                  {f.users} users · {f.adoption}% adoption
                </div>
              </div>
            )) : (
              <p className="font-mono text-xs text-muted-foreground">
                No feature associations for this event category.
              </p>
            )}
          </div>
        </PanelCard>
      </div>

      {/* Insight */}
      <PanelCard title="Analyst insight" subtitle="Auto-generated from event volume and trend">
        <div className="rounded-md border border-primary/20 bg-primary/5 p-4">
          <p className="font-mono text-xs text-foreground leading-relaxed">
            <span className="font-semibold text-primary font-mono">{event.name}</span> fired{" "}
            <span className="text-foreground font-semibold">{event.count.toLocaleString()}</span> times
            with a week-over-week trend of{" "}
            <span className={event.change >= 0 ? "text-primary font-semibold" : "text-destructive font-semibold"}>
              {event.change >= 0 ? "+" : ""}{event.change}%
            </span>.{" "}
            {event.change < 0
              ? "Declining volume warrants investigation — check for UX regressions or feature deprecation."
              : "Growing volume suggests healthy user engagement with this action path."}
          </p>
        </div>
      </PanelCard>
    </div>
  );
}