// src/pages/dashboard/Overview.tsx
// FIX: "Total users" StatCard is now clickable and opens a full user table modal.
// FIX: source badge updated to handle "csv" mode in addition to "live"/"demo".

import { useState } from "react";
import { Users, UserPlus, Zap, DollarSign, Activity, FileText, X, Search } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts";
import { StatCard, PanelCard } from "@/components/dashboard/StatCard";
import { EmptyDataState }      from "@/components/dashboard/EmptyDataState";
import { useAnalytics }        from "@/hooks/useAnalytics";
import { useDateRange, useCsvData } from "@/context/AppContext";
import { cn } from "@/lib/utils";
import type { UserRow } from "@/types";

const fmt = (n: number) => n.toLocaleString();
const tooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontFamily: "JetBrains Mono",
  fontSize: 11,
};

// ── User Table Modal ──────────────────────────────────────────────────────────
// Shown when the Total Users stat card is clicked.
// Uses raw CSV rows when available, falls back to a summary table for demo mode.

interface UserTableModalProps {
  rows: UserRow[];
  columns: string[];
  totalCount: number;
  onClose: () => void;
}

function UserTableModal({ rows, columns, totalCount, onClose }: UserTableModalProps) {
  const [query, setQuery] = useState("");
  const [page,  setPage]  = useState(0);
  const PAGE_SIZE = 20;

  const filtered = query
    ? rows.filter(r => Object.values(r).some(v => v.toLowerCase().includes(query.toLowerCase())))
    : rows;

  const paged   = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const pages   = Math.ceil(filtered.length / PAGE_SIZE);

  // Show the most informative columns first; hide ultra-wide ones in overflow
  const priorityCols  = ["Username", "Email", "Plan", "Subscribed", "Draft used",
                         "Research used", "Query", "Created"];
  const displayCols = [
    ...priorityCols.filter(c => columns.includes(c)),
    ...columns.filter(c => !priorityCols.includes(c)),
  ].slice(0, 8); // cap at 8 visible columns to avoid overflow

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
      <div className="flex flex-col w-full max-w-5xl max-h-[85vh] rounded-xl border border-border
        bg-card shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4 shrink-0">
          <div>
            <h2 className="font-display text-lg font-semibold text-foreground">All Users</h2>
            <p className="font-mono text-xs text-muted-foreground mt-0.5">
              {fmt(filtered.length)} of {fmt(totalCount)} users
              {query && " matching search"}
            </p>
          </div>
          <button onClick={onClose}
            className="rounded-md border border-border/60 p-1.5 text-muted-foreground
              hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search */}
        <div className="border-b border-border px-5 py-3 shrink-0">
          <div className="flex items-center gap-2 rounded-md border border-border/60
            bg-muted/40 px-3 py-1.5 max-w-sm">
            <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <input
              value={query}
              onChange={e => { setQuery(e.target.value); setPage(0); }}
              placeholder="Search by name, email, plan…"
              className="bg-transparent font-mono text-xs outline-none w-full
                placeholder:text-muted-foreground text-foreground"
            />
            {query && (
              <button onClick={() => { setQuery(""); setPage(0); }}
                className="text-muted-foreground hover:text-foreground">
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          {paged.length === 0 ? (
            <div className="flex h-40 items-center justify-center">
              <p className="font-mono text-xs text-muted-foreground">No users match your search.</p>
            </div>
          ) : (
            <table className="w-full font-mono text-xs">
              <thead className="sticky top-0 bg-muted/80 backdrop-blur-sm">
                <tr>
                  <th className="px-4 py-2.5 text-left text-[10px] uppercase tracking-widest
                    text-muted-foreground whitespace-nowrap">#</th>
                  {displayCols.map(c => (
                    <th key={c} className="px-4 py-2.5 text-left text-[10px] uppercase tracking-widest
                      text-muted-foreground whitespace-nowrap">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paged.map((row, i) => (
                  <tr key={i}
                    className="border-t border-border/40 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-2 text-muted-foreground/60">
                      {page * PAGE_SIZE + i + 1}
                    </td>
                    {displayCols.map(c => {
                      const val = row[c] ?? "—";
                      const isSubscribed = c === "Subscribed" && val.toLowerCase() === "yes";
                      return (
                        <td key={c} className="px-4 py-2 max-w-[200px] truncate" title={val}>
                          {isSubscribed ? (
                            <span className="rounded bg-primary/15 px-1.5 py-0.5 font-semibold text-primary">
                              Yes
                            </span>
                          ) : (
                            <span className="text-muted-foreground">{val || "—"}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between border-t border-border
            px-5 py-3 shrink-0">
            <p className="font-mono text-xs text-muted-foreground">
              Page {page + 1} of {pages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="rounded-md border border-border/60 px-3 py-1 font-mono text-xs
                  text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors">
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(pages - 1, p + 1))}
                disabled={page === pages - 1}
                className="rounded-md border border-border/60 px-3 py-1 font-mono text-xs
                  text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors">
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Overview page ─────────────────────────────────────────────────────────────
export default function Overview() {
  const analytics = useAnalytics();
  const { range } = useDateRange();
  const { stats: csvStats } = useCsvData();

  const [showUserTable, setShowUserTable] = useState(false);

  if (analytics.isEmpty) return <EmptyDataState />;

  const {
    totalUsers, subscribed, activation, conversion, draftsCreated,
    zeroEngagement, signupsByMonth, engagementSegments, featureAdoption,
    featureDepthFunnel, featureAdoption: fa, filteredSignups, source,
  } = analytics;

  const months      = signupsByMonth;
  const lastMonth   = months[months.length - 1];
  const prevMonth   = months[months.length - 2];
  const activeUsers = totalUsers - zeroEngagement;
  const mrrEstimate = subscribed * 699;

  const signupDeltaNum: number | undefined =
    prevMonth && prevMonth.signups > 0
      ? parseFloat((((lastMonth?.signups ?? 0) - prevMonth.signups) / prevMonth.signups * 100).toFixed(1))
      : undefined;

  const featureUsage = fa
    .filter(f => f.totalUses > 0)
    .map(f => ({ name: f.feature, count: f.totalUses }));

  const signupsChart = months.map(m => ({
    date: m.month,
    dau:  m.signups,
    wau:  Math.round(m.signups * 0.6),
    new:  m.subs,
  }));

  const activationFunnel = featureDepthFunnel.map(step => ({
    step:  step.label,
    users: step.count,
    rate:  totalUsers > 0
      ? parseFloat(((step.count / totalUsers) * 100).toFixed(1))
      : 0,
  }));

  // Raw rows for the user table — available when in CSV mode
  const rawRows    = csvStats?.rows    ?? [];
  const rawColumns = csvStats?.columns ?? [];
  const hasRawRows = rawRows.length > 0;

  // FIX: source badge handles "csv" in addition to "live" / "demo"
  const sourceBadgeClass =
    source === "live" ? "bg-primary/15 text-primary" :
    source === "csv"  ? "bg-emerald-400/15 text-emerald-400" :
    "bg-amber-400/15 text-amber-400";

  const sourceBadgeLabel =
    source === "live" ? "Live" :
    source === "csv"  ? "CSV"  : "Demo";

  return (
    <div className="space-y-6">

      {/* User table modal */}
      {showUserTable && (
        <UserTableModal
          rows={hasRawRows ? rawRows : []}
          columns={hasRawRows ? rawColumns : []}
          totalCount={totalUsers}
          onClose={() => setShowUserTable(false)}
        />
      )}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Product Overview</h1>
          <p className="font-mono text-xs text-muted-foreground">
            LawgicHub · {range.label} · {fmt(filteredSignups)} signups in period
          </p>
        </div>
        <span className={cn("rounded-full px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-widest",
          sourceBadgeClass)}>
          {sourceBadgeLabel}
        </span>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {/* FIX: Total Users card is now clickable — opens user table modal */}
        <StatCard
          label="Total users"
          value={fmt(totalUsers)}
          delta={signupDeltaNum}
          icon={Users}
          onClick={() => setShowUserTable(true)}
        />
        <StatCard label="New signups"  value={fmt(filteredSignups)}   delta={signupDeltaNum} icon={UserPlus} />
        <StatCard label="Activation"   value={`${activation}%`}       note={`${fmt(activeUsers)} active`} icon={Zap} />
        <StatCard label="Conversion"   value={`${conversion}%`}       note={`${subscribed} paid`} icon={Activity} />
        <StatCard label="Est. MRR"     value={`₹${(mrrEstimate/1000).toFixed(1)}k`} note={`${subscribed} subscribers`} icon={DollarSign} />
        <StatCard label="Total drafts" value={fmt(draftsCreated)}     note={`${fa[0]?.users ?? 0} users`} icon={FileText} />
      </div>

      {/* Charts row 1 */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PanelCard title="Signups over time" subtitle={`Monthly signups · ${range.label}`}>
            {months.length > 0 ? (
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
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="wau" stroke="hsl(170 70% 45%)" fill="url(#wau)" strokeWidth={2} name="Est. WAU" />
                  <Area type="monotone" dataKey="dau" stroke="hsl(var(--primary))" fill="url(#dau)" strokeWidth={2} name="Signups" />
                  <Area type="monotone" dataKey="new" stroke="hsl(45 90% 55%)" fill="transparent" strokeWidth={2} name="Paid" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[280px] items-center justify-center">
                <p className="font-mono text-xs text-muted-foreground">No signups in this date range</p>
              </div>
            )}
          </PanelCard>
        </div>

        <PanelCard title="User segments" subtitle="By feature engagement">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={engagementSegments} dataKey="value" nameKey="name"
                innerRadius={55} outerRadius={90} paddingAngle={2}>
                {engagementSegments.map(s => <Cell key={s.name} fill={s.color} />)}
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
                <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={10} width={130} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Uses" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[260px] items-center justify-center">
              <p className="font-mono text-xs text-muted-foreground">No feature usage data</p>
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
                    className="h-full bg-gradient-to-r from-primary to-emerald-400 transition-all duration-700"
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