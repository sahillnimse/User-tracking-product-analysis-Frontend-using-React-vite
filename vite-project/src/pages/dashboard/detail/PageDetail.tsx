// src/pages/dashboard/detail/PageDetail.tsx
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Route, Eye, LogOut, Clock, ArrowRight } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { StatCard, PanelCard } from "@/components/dashboard/StatCard";
import { pageFlows, pageExitRates } from "@/lib/healthData";

const tooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontFamily: "JetBrains Mono",
  fontSize: 11,
};

export default function PageDetail() {
  const { pageName } = useParams<{ pageName: string }>();
  const navigate = useNavigate();

  const decoded  = decodeURIComponent(pageName ?? "");
  const exitData = pageExitRates.find((p) => p.page === decoded) ?? pageExitRates[0];

  // Flows that start from this page
  const outFlows = pageFlows.filter((f) => f.from === exitData.page);
  // Flows that arrive at this page
  const inFlows  = pageFlows.filter((f) => f.to === exitData.page);

  const avgTime    = Math.round(exitData.sessions * 0.4); // synthetic avg time on page (seconds)
  const retainRate = (100 - exitData.rate).toFixed(1);

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 font-mono text-xs text-muted-foreground
          hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Page Flow
      </button>

      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg
          bg-primary/15 border border-primary/20 shrink-0">
          <Route className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="font-mono text-2xl font-bold">{exitData.page}</h1>
          <p className="font-mono text-xs text-muted-foreground mt-0.5">
            Page analytics · user journey analysis
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Sessions"       value={exitData.sessions.toLocaleString()} icon={Eye} />
        <StatCard label="Exits"          value={exitData.exits.toLocaleString()}    icon={LogOut} />
        <StatCard label="Exit rate"      value={`${exitData.rate}%`}               icon={LogOut} />
        <StatCard label="Retention rate" value={`${retainRate}%`}                  icon={Clock} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Exit rate vs other pages */}
        <PanelCard title="Exit rate comparison" subtitle="This page vs top-exit pages across the platform">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={pageExitRates.slice(0, 6)}
              margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="page"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }}
                axisLine={false} tickLine={false}
                interval={0}
                angle={-20}
                textAnchor="end"
                height={48}
              />
              <YAxis
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                axisLine={false} tickLine={false}
                unit="%"
              />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, "Exit rate"]} />
              <Bar
                dataKey="rate"
                radius={[4, 4, 0, 0]}
                fill="hsl(var(--muted-foreground)/0.4)"
              />
            </BarChart>
          </ResponsiveContainer>
        </PanelCard>

        {/* User flow */}
        <PanelCard title="User flow" subtitle="Where users come from and go next">
          <div className="space-y-4 mt-2">
            {inFlows.length > 0 && (
              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest
                  text-muted-foreground mb-2">
                  Incoming from
                </div>
                <div className="space-y-1.5">
                  {inFlows.map((f) => (
                    <div key={f.from}
                      className="flex items-center justify-between rounded-md border
                        border-border/60 bg-muted/20 px-3 py-2">
                      <div className="flex items-center gap-2 font-mono text-xs">
                        <ArrowRight className="h-3 w-3 text-primary rotate-180" />
                        <span className="text-foreground">{f.from}</span>
                      </div>
                      <span className="font-mono text-xs text-muted-foreground">
                        {f.users.toLocaleString()} users ({f.pct}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {outFlows.length > 0 && (
              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest
                  text-muted-foreground mb-2">
                  Exits to
                </div>
                <div className="space-y-1.5">
                  {outFlows.map((f) => (
                    <div key={f.to}
                      className="flex items-center justify-between rounded-md border
                        border-border/60 bg-muted/20 px-3 py-2">
                      <div className="flex items-center gap-2 font-mono text-xs">
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <span className="text-foreground">{f.to}</span>
                      </div>
                      <span className="font-mono text-xs text-muted-foreground">
                        {f.users.toLocaleString()} users ({f.pct}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {inFlows.length === 0 && outFlows.length === 0 && (
              <p className="font-mono text-xs text-muted-foreground">
                No flow data available for this page.
              </p>
            )}
          </div>
        </PanelCard>
      </div>

      {/* Alert for high exit rate */}
      {exitData.rate > 50 && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4">
          <div className="font-mono text-[10px] uppercase tracking-widest text-destructive mb-2">
            High exit rate detected
          </div>
          <p className="font-mono text-xs text-foreground leading-relaxed">
            <strong>{exitData.rate}%</strong> of sessions on{" "}
            <strong className="font-mono">{exitData.page}</strong> end here without progressing
            further. Review the page's CTA placement, loading time, and content relevance
            for the users reaching it.
          </p>
        </div>
      )}
    </div>
  );
}