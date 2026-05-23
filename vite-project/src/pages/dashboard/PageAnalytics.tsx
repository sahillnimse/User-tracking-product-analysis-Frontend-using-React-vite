// src/pages/dashboard/PageAnalytics.tsx
// Google Analytics-style internal page tracking dashboard.
// Uses usePageTracking (already called in DashboardLayout) + usePageViews.

import { useState, useEffect, useRef } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, BarChart, Bar, LineChart, Line,
} from "recharts";
import {
  Eye, Clock, MousePointerClick, TrendingUp, ArrowUpRight, Circle,
} from "lucide-react";
import { PanelCard, StatCard } from "@/components/dashboard/StatCard";
import { usePageViews, clearPageViews, type PageView } from "@/hooks/usePageTracking";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number) => n.toLocaleString();
const fmtSec = (ms: number) => {
  const s = Math.round(ms / 1000);
  if (s < 60)  return `${s}s`;
  const m = Math.floor(s / 60);
  return `${m}m ${s % 60}s`;
};

const tooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontFamily: "JetBrains Mono",
  fontSize: 11,
};

// Page path → readable title
const PAGE_LABEL: Record<string, string> = {
  "/":           "Overview",
  "/events":     "Live Events",
  "/funnel":     "Activation Funnel",
  "/features":   "Feature Adoption",
  "/conversion": "Conversion",
  "/segments":   "User Segments",
  "/retention":  "Retention",
  "/csv":        "CSV Analysis",
  "/health":     "Product Health",
  "/pageflow":   "Page Flow",
  "/pageanalytics": "Page Analytics",
};

// Colour per page for the snake chart
const PAGE_COLORS: string[] = [
  "hsl(var(--primary))",
  "hsl(170 70% 45%)",
  "hsl(45 90% 55%)",
  "hsl(280 80% 65%)",
  "hsl(200 80% 60%)",
  "hsl(0 75% 55%)",
];

// Build a 60-point minute-by-minute "snake" time series from raw views
function buildSnakeSeries(views: PageView[], minutes = 60) {
  const now  = Date.now();
  const buckets: number[] = Array(minutes).fill(0);
  const msPerBucket = 60_000;

  views.forEach(v => {
    const diff = now - v.enteredAt;
    const idx  = Math.floor(diff / msPerBucket);
    if (idx >= 0 && idx < minutes) buckets[minutes - 1 - idx]++;
  });

  return buckets.map((count, i) => {
    const minutesAgo = minutes - 1 - i;
    const label = minutesAgo === 0 ? "now"
      : minutesAgo < 60 ? `${minutesAgo}m ago`
      : `${Math.floor(minutesAgo / 60)}h ago`;
    return { label, count };
  });
}

// Build hourly views for today
function buildHourlySeries(views: PageView[]) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const buckets: number[] = Array(24).fill(0);
  views.forEach(v => {
    if (v.enteredAt >= today.getTime()) {
      const hour = new Date(v.enteredAt).getHours();
      buckets[hour]++;
    }
  });
  return buckets.map((count, h) => ({
    label: `${String(h).padStart(2, "0")}:00`,
    count,
  }));
}

// ── Sub-components ────────────────────────────────────────────────────────────
function SnakeChart({ views }: { views: PageView[] }) {
  const [tick, setTick] = useState(0);
  const data = buildSnakeSeries(views, 60);
  const max  = Math.max(...data.map(d => d.count), 1);

  // Refresh every 5 seconds so the snake "moves"
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 5_000);
    return () => clearInterval(id);
  }, []);

  return (
    <ResponsiveContainer width="100%" height={160}>
      <AreaChart data={data} margin={{ left: -20, right: 4, top: 4, bottom: 0 }}>
        <defs>
          <linearGradient id="snakeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="hsl(var(--primary))" stopOpacity={0.5} />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis
          dataKey="label"
          stroke="hsl(var(--muted-foreground))"
          fontSize={9}
          tickLine={false}
          interval={9}
        />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          fontSize={9}
          tickLine={false}
          domain={[0, max + 1]}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(v: number) => [`${v} view${v !== 1 ? "s" : ""}`, "Page views"]}
        />
        <Area
          type="monotone"
          dataKey="count"
          stroke="hsl(var(--primary))"
          fill="url(#snakeGrad)"
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function RealTimeStrip({ views }: { views: PageView[] }) {
  // Show last 5 page views in a live strip
  const recent = [...views].sort((a, b) => b.enteredAt - a.enteredAt).slice(0, 8);
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 2_000);
    return () => clearInterval(id);
  }, []);

  const ago = (ms: number) => {
    const s = Math.round((Date.now() - ms) / 1000);
    if (s < 5)  return "just now";
    if (s < 60) return `${s}s ago`;
    return `${Math.floor(s / 60)}m ago`;
  };

  return (
    <div className="space-y-0 overflow-hidden rounded-md border border-border/60 bg-background/40">
      <div className="grid grid-cols-12 border-b border-border/60 bg-muted/40 px-3 py-2
        font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        <div className="col-span-2">When</div>
        <div className="col-span-4">Page</div>
        <div className="col-span-3">Session</div>
        <div className="col-span-3">Duration</div>
      </div>
      <div className="max-h-[280px] overflow-y-auto">
        {recent.length === 0 ? (
          <div className="flex h-20 items-center justify-center font-mono text-xs text-muted-foreground">
            Navigate around to record page views
          </div>
        ) : (
          recent.map((v, i) => (
            <div
              key={`${v.sessionId}-${v.enteredAt}`}
              className={cn(
                "grid grid-cols-12 border-b border-border/40 px-3 py-2 font-mono text-xs",
                i === 0 && "bg-primary/5",
              )}
            >
              <div className="col-span-2 text-muted-foreground">{ago(v.enteredAt)}</div>
              <div className="col-span-4 truncate text-foreground">
                {PAGE_LABEL[v.path] ?? v.path}
              </div>
              <div className="col-span-3 truncate text-primary/70">{v.sessionId.slice(0, 10)}</div>
              <div className="col-span-3 text-muted-foreground">
                {v.duration > 0 ? fmtSec(v.duration) : (
                  <span className="flex items-center gap-1">
                    <Circle className="h-1.5 w-1.5 animate-pulse fill-primary text-primary" />
                    live
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function PageAnalytics() {
  const { views, topPages, totalSessions, todayViews } = usePageViews();
  const navigate  = useNavigate();
  const [cleared, setCleared] = useState(false);

  const hourly   = buildHourlySeries(views);
  const totalViews = views.length;
  const avgDurationAll = views.length > 0
    ? Math.round(views.filter(v => v.duration > 0).reduce((a, v) => a + v.duration, 0)
      / Math.max(views.filter(v => v.duration > 0).length, 1))
    : 0;

  // Bar chart data: top pages by views
  const pageBarData = topPages.slice(0, 8).map((p, i) => ({
    name:  PAGE_LABEL[p.path] ?? p.path,
    views: p.views,
    fill:  PAGE_COLORS[i % PAGE_COLORS.length],
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Page Analytics</h1>
          <p className="font-mono text-xs text-muted-foreground">
            Internal session tracking · this dashboard only · real-time, no external SDK
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-mono text-xs text-primary">
            <Circle className="h-2 w-2 animate-pulse fill-primary text-primary" />
            live
          </div>
          <button
            onClick={() => { clearPageViews(); setCleared(true); setTimeout(() => setCleared(false), 2000); }}
            className="rounded-md border border-border/60 px-3 py-1.5 font-mono text-[11px]
              text-muted-foreground hover:border-destructive/40 hover:text-destructive transition-colors"
          >
            {cleared ? "Cleared ✓" : "Clear history"}
          </button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Total page views"  value={fmt(totalViews)}    icon={Eye} />
        <StatCard label="Today's views"     value={fmt(todayViews)}    icon={TrendingUp} />
        <StatCard label="Sessions recorded" value={fmt(totalSessions)} icon={MousePointerClick} />
        <StatCard label="Avg time on page"  value={fmtSec(avgDurationAll)} icon={Clock} />
      </div>

      {/* Snake / real-time sparkline */}
      <PanelCard
        title="Real-time activity"
        subtitle="Page views in the last 60 minutes · updates every 5 seconds"
      >
        <SnakeChart views={views} />
      </PanelCard>

      {/* Main grid */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Live stream */}
        <div className="lg:col-span-2">
          <PanelCard title="Live page stream" subtitle="Most recent views in this session">
            <RealTimeStrip views={views} />
          </PanelCard>
        </div>

        {/* Top pages list */}
        <PanelCard title="Top pages" subtitle="By total views">
          <div className="space-y-2">
            {topPages.length === 0 ? (
              <div className="flex h-32 items-center justify-center font-mono text-xs text-muted-foreground">
                No views yet — browse around!
              </div>
            ) : (
              topPages.slice(0, 8).map((p, i) => (
                <div
                  key={p.path}
                  className="flex items-center justify-between rounded-md border border-border/60
                    bg-muted/20 px-3 py-2 hover:border-primary/30 hover:bg-muted/40
                    transition-all cursor-pointer"
                  onClick={() => navigate(p.path)}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ background: PAGE_COLORS[i % PAGE_COLORS.length] }}
                      />
                      <span className="truncate font-mono text-xs text-foreground">
                        {PAGE_LABEL[p.path] ?? p.path}
                      </span>
                    </div>
                    <div className="mt-0.5 pl-4 font-mono text-[10px] text-muted-foreground">
                      avg {fmtSec(p.avgDuration * 1000)} on page
                    </div>
                  </div>
                  <div className="ml-2 shrink-0 text-right">
                    <div className="font-mono text-xs font-semibold text-foreground">{p.views}</div>
                    <div className="font-mono text-[9px] text-muted-foreground">views</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </PanelCard>
      </div>

      {/* Hourly bar chart */}
      <PanelCard title="Today by hour" subtitle="Page view distribution across today's hours">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={hourly} margin={{ left: -20, right: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="label"
              stroke="hsl(var(--muted-foreground))"
              fontSize={9}
              tickLine={false}
              interval={2}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={9}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v} views`, "Views"]} />
            <Bar dataKey="count" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} name="Views" />
          </BarChart>
        </ResponsiveContainer>
      </PanelCard>

      {/* Top pages bar */}
      <PanelCard title="Page view breakdown" subtitle="Top 8 pages by view count">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={pageBarData} layout="vertical" margin={{ left: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              type="number"
              stroke="hsl(var(--muted-foreground))"
              fontSize={9}
              tickLine={false}
              allowDecimals={false}
            />
            <YAxis
              dataKey="name"
              type="category"
              stroke="hsl(var(--muted-foreground))"
              fontSize={9}
              tickLine={false}
              width={120}
            />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="views" radius={[0, 4, 4, 0]} name="Views">
              {pageBarData.map((entry, i) => (
                <rect key={i} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </PanelCard>

      {/* How it works box */}
      <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
        <div className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          How this works
        </div>
        <div className="grid gap-3 md:grid-cols-3 font-mono text-[11px] text-muted-foreground">
          <div>
            <span className="text-primary font-semibold">Zero external SDK.</span>{" "}
            All tracking is client-side via <code>usePageTracking</code> in DashboardLayout.
            Data lives in <code>localStorage</code> under <code>pulse_page_views</code>.
          </div>
          <div>
            <span className="text-primary font-semibold">What's captured.</span>{" "}
            Path, page title, session ID, entry timestamp, and time-on-page (measured on route change or tab close).
          </div>
          <div>
            <span className="text-primary font-semibold">Live data integration.</span>{" "}
            When you connect the live API, replace <code>loadViews()</code> with
            your endpoint — the chart components are already data-agnostic.
          </div>
        </div>
      </div>
    </div>
  );
}