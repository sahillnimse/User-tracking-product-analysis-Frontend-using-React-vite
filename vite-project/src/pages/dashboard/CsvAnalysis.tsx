// src/pages/dashboard/CsvAnalysis.tsx
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar,
  // ✅ FIX: FunnelChart/Funnel/LabelList were removed in recharts v2.
  // They caused the white screen. Replaced with a custom bar-based funnel below.
} from "recharts";
import {
  Users, CreditCard, Zap, TrendingUp, FileText, UserX, Download,
  Search, MessageSquare, Gavel, Database, ChevronDown, Upload,
  CheckCircle, AlertCircle, X, BookOpen,
} from "lucide-react";
import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useCsvData }   from "@/context/AppContext";
import { analyticsData } from "@/lib/analyticsData";
import { cn }           from "@/lib/utils";
import type { FeatureAdoptionItem } from "@/types";

// ─── Feature icon map ────────────────────────────────────────────────────────
const FEATURE_ICONS: Record<string, React.ElementType> = {
  "Draft":             FileText,
  "Research":          Search,
  "Query":             MessageSquare,
  "Contact Review":    Users,
  "Judgment Details":  Gavel,
};

const tooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border:          "1px solid hsl(var(--border))",
  borderRadius:    8,
  fontFamily:      "JetBrains Mono",
  fontSize:        11,
  color:           "hsl(var(--foreground))",
};

// ─── Reusable KPI card (local, uses CSS vars — no hardcoded colours) ─────────
function KpiCard({ label, value, sub, icon: Icon, alert }: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; alert?: boolean;
}) {
  return (
    <div className={cn(
      "relative overflow-hidden rounded-lg border p-4 flex flex-col gap-2 transition-all group",
      alert
        ? "border-destructive/30 bg-destructive/5"
        : "border-border/60 bg-card hover:border-primary/40 hover:box-glow-sm",
    )}>
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-primary/30
        to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
        <div className={cn(
          "flex h-7 w-7 items-center justify-center rounded-lg",
          alert ? "bg-destructive/10" : "bg-primary/10",
        )}>
          <Icon className={cn("h-3.5 w-3.5", alert ? "text-destructive" : "text-primary")} />
        </div>
      </div>
      <div className="flex items-end gap-1.5">
        <span className="font-display text-2xl font-semibold text-foreground">{value}</span>
        {sub && <span className="mb-0.5 text-sm text-muted-foreground">{sub}</span>}
      </div>
    </div>
  );
}

// ─── Upload zone ──────────────────────────────────────────────────────────────
function UploadZone({ onFile, fileName, onClear, oversized }: {
  onFile: (t: string, n: string) => void;
  fileName: string | null; onClear: () => void; oversized?: boolean;
}) {
  const [dragging, setDragging] = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const ref = useRef<HTMLInputElement>(null);

  const handle = (file: File) => {
    setError(null);
    if (!file.name.endsWith(".csv")) { setError("Only .csv files are supported."); return; }
    const r = new FileReader();
    r.onload = e => onFile(e.target?.result as string, file.name);
    r.readAsText(file);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0]; if (f) handle(f);
  }, []);

  if (fileName) return (
    <div className="space-y-1.5">
      <div className="flex w-fit items-center gap-3 rounded-md border border-primary/30
        bg-primary/5 px-4 py-2">
        <CheckCircle className="h-3.5 w-3.5 shrink-0 text-primary" />
        <span className="font-mono text-sm text-primary">{fileName}</span>
        <button onClick={onClear}
          className="ml-1 text-muted-foreground hover:text-destructive transition-colors">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      {oversized && (
        <p className="flex items-center gap-1.5 font-mono text-xs text-amber-500">
          <AlertCircle className="h-3 w-3" />
          File too large to cache — available this session only.
        </p>
      )}
    </div>
  );

  return (
    <div className="space-y-2">
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => ref.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-3",
          "rounded-lg border-2 border-dashed px-6 py-8 transition-all duration-200",
          dragging
            ? "border-primary bg-primary/5"
            : "border-border/60 hover:border-primary/40 hover:bg-primary/3",
        )}
      >
        <div className={cn(
          "flex h-10 w-10 items-center justify-center rounded-lg border transition-colors",
          dragging ? "border-primary/30 bg-primary/10" : "border-border/60 bg-muted/30",
        )}>
          <Upload className={cn("h-4 w-4", dragging ? "text-primary" : "text-muted-foreground")} />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">
            {dragging ? "Drop CSV here" : "Upload user export CSV"}
          </p>
          <p className="mt-0.5 font-mono text-xs text-muted-foreground">
            Drag & drop or click · .csv only
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-md border border-primary/20
          bg-primary/10 px-3 py-1.5">
          <FileText className="h-3 w-3 text-primary" />
          <span className="font-mono text-xs text-primary">LawgicHub user export format</span>
        </div>
        <input ref={ref} type="file" accept=".csv" className="hidden"
          onChange={e => e.target.files?.[0] && handle(e.target.files[0])} />
      </div>
      {error && (
        <p className="flex items-center gap-2 font-mono text-xs text-destructive">
          <AlertCircle className="h-3 w-3" />{error}
        </p>
      )}
    </div>
  );
}

// ─── Column mapping panel ─────────────────────────────────────────────────────
function ColumnMapping({ detected }: { detected: Record<string, string> }) {
  const [open, setOpen]   = useState(false);
  const missing           = Object.values(detected).filter(v => v === "(not found)").length;

  return (
    <div className="overflow-hidden rounded-lg border border-border/60 bg-card">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 text-sm
          text-foreground hover:bg-muted/30 transition-colors"
      >
        <span className="flex items-center gap-2 font-medium">
          <Database className="h-3.5 w-3.5 text-muted-foreground" />
          Column mapping
          {missing > 0 && (
            <span className="rounded bg-amber-500/15 px-1.5 py-0.5 font-mono
              text-[10px] font-semibold text-amber-500">
              {missing} not detected
            </span>
          )}
        </span>
        <ChevronDown className={cn(
          "h-3.5 w-3.5 text-muted-foreground transition-transform",
          open && "rotate-180",
        )} />
      </button>
      {open && (
        <div className="grid grid-cols-2 gap-2 border-t border-border/60 px-4 py-3 sm:grid-cols-3">
          {Object.entries(detected).map(([metric, col]) => (
            <div key={metric} className="flex flex-col gap-0.5 rounded-md bg-muted/40 p-2">
              <span className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
                {metric}
              </span>
              <span className={cn(
                "truncate font-mono text-xs",
                col === "(not found)" ? "text-amber-500" : "text-primary",
              )}>
                {col}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Feature adoption bar ─────────────────────────────────────────────────────
function FeatureBar({ item, max }: { item: FeatureAdoptionItem; max: number }) {
  const Icon = FEATURE_ICONS[item.feature] ?? FileText;
  const pct  = max > 0 ? (item.users / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-3.5 w-3.5 text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs font-medium text-foreground">{item.feature}</span>
          <span className="font-mono text-xs text-muted-foreground">
            {item.users.toLocaleString()} users · {item.totalUses} uses
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <span className="w-10 text-right font-mono text-xs text-muted-foreground">{item.pct}%</span>
    </div>
  );
}

// ─── Custom funnel (replaces removed recharts FunnelChart) ────────────────────
function FunnelViz({ steps }: { steps: { label: string; count: number }[] }) {
  const top = steps[0]?.count ?? 1;
  return (
    <div className="space-y-2">
      {steps.map((step, i) => {
        const pct   = top > 0 ? (step.count / top) * 100 : 0;
        const isEnd = i === steps.length - 1;
        return (
          <div key={step.label} className="flex items-center gap-3">
            <span className="w-32 shrink-0 text-right font-mono text-xs text-muted-foreground">
              {step.label}
            </span>
            <div className="relative flex-1">
              {/* Funnel taper: centre-aligned bar */}
              <div className="flex h-7 items-center justify-center overflow-hidden rounded-md bg-muted">
                <div
                  className={cn(
                    "flex h-full items-center justify-center rounded-md px-2 transition-all duration-500",
                    isEnd ? "bg-primary/60" : "bg-primary",
                  )}
                  style={{ width: `${Math.max(pct, 2)}%` }}
                />
              </div>
            </div>
            <span className="w-28 font-mono text-xs text-foreground">
              {step.count.toLocaleString()}{" "}
              <span className="text-muted-foreground">({pct.toFixed(1)}%)</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Raw data preview ─────────────────────────────────────────────────────────
function DataPreview({ rows, columns }: {
  rows: Record<string, string>[]; columns: string[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-lg border border-border/60 bg-card">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 text-sm
          font-medium text-foreground hover:bg-muted/30 transition-colors"
      >
        <span>
          Raw data preview{" "}
          <span className="font-mono text-xs font-normal text-muted-foreground">
            ({rows.length.toLocaleString()} rows · {columns.length} cols)
          </span>
        </span>
        <ChevronDown className={cn(
          "h-3.5 w-3.5 text-muted-foreground transition-transform",
          open && "rotate-180",
        )} />
      </button>
      {open && (
        <div className="overflow-x-auto border-t border-border/60">
          <table className="w-full font-mono text-xs">
            <thead>
              <tr className="bg-muted/40">
                {columns.map(c => (
                  <th key={c} className="px-3 py-2 text-left text-[10px] uppercase
                    tracking-widest text-muted-foreground whitespace-nowrap">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 5).map((row, i) => (
                <tr key={i} className="border-t border-border/40 hover:bg-muted/20">
                  {columns.map(c => (
                    <td key={c} className="max-w-[160px] truncate px-3 py-2
                      text-muted-foreground whitespace-nowrap" title={row[c]}>
                      {row[c] || "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function CsvAnalysis() {
  const { stats, fileName, uploadCSV, clearCSV, oversized } = useCsvData();

  const data = useMemo(() => {
    if (stats) {
      return {
        source:             "csv" as const,
        fileName:           fileName ?? stats.fileName,
        csvStats:           stats,
        totalUsers:         stats.totalUsers,
        subscribed:         stats.subscribed,
        activation:         stats.activation,
        conversion:         stats.conversion,
        draftsCreated:      stats.draftsCreated,
        zeroEngagement:     stats.zeroEngagement,
        signupsByMonth:     stats.signupsByMonth,
        engagementSegments: stats.engagementSegments,
        featureAdoption:    stats.featureAdoption,
        planBreakdown:      stats.planBreakdown,
        featureDepthFunnel: stats.featureDepthFunnel,
        cohortRetention:    stats.cohortRetention,
      };
    }
    return {
      source:             "static" as const,
      fileName:           null as string | null,
      csvStats:           null,
      totalUsers:         analyticsData.totalUsers,
      subscribed:         analyticsData.subscribed,
      activation:         analyticsData.activation,
      conversion:         analyticsData.conversion,
      draftsCreated:      analyticsData.draftsCreated,
      zeroEngagement:     analyticsData.zeroEngagement,
      signupsByMonth:     analyticsData.signupsByMonth,
      engagementSegments: analyticsData.engagementSegments,
      featureAdoption:    analyticsData.featureAdoption,
      planBreakdown:      analyticsData.planBreakdown,
      featureDepthFunnel: analyticsData.featureDepthFunnel,
      cohortRetention:    analyticsData.cohortRetention,
    };
  }, [stats, fileName]);

  const s = data.csvStats;

  // Auto-load /public/users-export.csv if no file is loaded yet
  useEffect(() => {
    if (fileName) return;
    fetch("/users-export.csv")
      .then(r => { if (!r.ok) throw new Error("not found"); return r.text(); })
      .then(text => uploadCSV(text, "users-export.csv"))
      .catch(() => { /* File absent — wait for manual upload */ });
  }, [fileName, uploadCSV]);

  const exportSummary = () => {
    const csv = [
      "Metric,Value",
      `Total Users,${data.totalUsers}`,
      `Subscribed,${data.subscribed}`,
      `Activation Rate,${data.activation}%`,
      `Conversion Rate,${data.conversion}%`,
      `Total Drafts,${data.draftsCreated}`,
      `Zero Engagement,${data.zeroEngagement}`,
      `Data Source,${data.source}`,
    ].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "lawgichub-analysis.csv";
    a.click();
  };

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-semibold text-foreground">
              CSV Analysis
            </h1>
            <span className={cn(
              "rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide",
              data.source === "csv"
                ? "bg-primary/15 text-primary"
                : "bg-muted text-muted-foreground",
            )}>
              {data.source === "csv" ? "Live data" : "Static snapshot"}
            </span>
          </div>
          <p className="mt-1 font-mono text-sm text-muted-foreground">
            {data.fileName
              ? `${data.fileName} · ${data.totalUsers.toLocaleString()} users`
              : "users-export-2026-05-19.csv · 1,756 users · snapshot"}
          </p>
        </div>
        <button
          onClick={exportSummary}
          className="flex items-center gap-2 rounded-md border border-border/60 bg-card
            px-3 py-2 font-mono text-sm text-muted-foreground
            hover:border-primary/40 hover:text-primary transition-colors"
        >
          <Download className="h-3.5 w-3.5" /> Export Summary
        </button>
      </div>

      {/* ── Upload ── */}
      <div className="rounded-lg border border-border/60 bg-card p-5 space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
          <span className="font-mono text-xs font-semibold uppercase tracking-widest
            text-muted-foreground">
            Data Source
          </span>
        </div>
        <UploadZone
          onFile={uploadCSV}
          fileName={data.fileName}
          onClear={clearCSV}
          oversized={oversized}
        />
        {!data.fileName && (
          <p className="font-mono text-xs text-muted-foreground">
            Supports LawgicHub user export format ·{" "}
            <span className="text-foreground/50">
              Username, Email, Subscribed, Plan, Draft used, Research used …
            </span>
          </p>
        )}
      </div>

      {/* ── KPI cards ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <KpiCard label="Total Users"     value={data.totalUsers.toLocaleString()}    icon={Users} />
        <KpiCard label="Subscribed"      value={data.subscribed}                     icon={CreditCard}
          sub={`/${data.totalUsers.toLocaleString()}`} />
        <KpiCard label="Activation"      value={`${data.activation}%`}               icon={Zap}
          sub={`${(data.totalUsers - data.zeroEngagement)} active`} />
        <KpiCard label="Total Drafts"    value={data.draftsCreated.toLocaleString()} icon={BookOpen} />
        <KpiCard label="Zero Engagement" value={data.zeroEngagement.toLocaleString()} icon={UserX} alert
          sub={`${((data.zeroEngagement / data.totalUsers) * 100).toFixed(1)}% of users`} />
        <KpiCard
          label="Plans Active"
          value={data.planBreakdown.filter(p => p.plan !== "Free Trial").reduce((a,p) => a + p.count, 0)}
          icon={TrendingUp} sub="paid"
        />
      </div>

      {/* ── Insight banner ── */}
      <div className="flex items-start gap-3 rounded-lg border border-amber-500/20
        bg-amber-500/5 px-4 py-3">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
        <div className="space-y-0.5 text-xs text-amber-700 dark:text-amber-400">
          <p className="font-semibold">Key insight: 88.1% of users never used any feature</p>
          <p className="text-amber-600 dark:text-amber-500">
            Feb 2026 brought 877 signups but only 0.6% activated. Mar 2026 (790 signups) was far
            better at 23.9%. Draft is the primary engagement driver — focus onboarding here.
          </p>
        </div>
      </div>

      {/* ── Signups + Plan breakdown ── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3 rounded-lg border border-border/60 bg-card p-5">
          <p className="font-display text-sm font-semibold text-foreground">Signups over time</p>
          <p className="mb-4 mt-0.5 font-mono text-xs text-muted-foreground">
            Monthly · peak Feb–Mar 2026
          </p>
          {data.signupsByMonth.length > 0 ? (
            <ResponsiveContainer width="100%" height={210}>
              <AreaChart data={data.signupsByMonth} margin={{ top:5, right:5, left:-20, bottom:0 }}>
                <defs>
                  <linearGradient id="gSU" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))"/>
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={10} axisLine={false} tickLine={false}/>
                <YAxis                 stroke="hsl(var(--muted-foreground))" fontSize={10} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={tooltipStyle}/>
                <Area type="monotone" dataKey="signups" stroke="hsl(var(--primary))"
                  fill="url(#gSU)" strokeWidth={2} name="Signups" dot={false}/>
                <Area type="monotone" dataKey="subs" stroke="hsl(199 80% 55%)"
                  fill="none" strokeWidth={2} strokeDasharray="4 2" name="Paid" dot={false}/>
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[210px] items-center justify-center">
              <p className="font-mono text-xs text-muted-foreground">No date column detected</p>
            </div>
          )}
          <div className="mt-2 flex gap-4">
            {[["Signups","hsl(var(--primary))"],["Paid","hsl(199 80% 55%)"]].map(([l,c]) => (
              <div key={l} className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                <div className="h-px w-4 rounded" style={{ background: c }}/>
                {l}
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 rounded-lg border border-border/60 bg-card p-5">
          <p className="font-display text-sm font-semibold text-foreground">Plan distribution</p>
          <p className="mb-4 mt-0.5 font-mono text-xs text-muted-foreground">By subscription plan</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={data.planBreakdown} innerRadius={50} outerRadius={75}
                paddingAngle={2} dataKey="count" nameKey="plan">
                {data.planBreakdown.map((p, i) => <Cell key={i} fill={p.color}/>)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} formatter={(v, n) => [`${v} users`, n]}/>
              <Legend iconType="circle" iconSize={8}
                wrapperStyle={{ fontFamily: "JetBrains Mono", fontSize: 10 }}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Feature adoption + Segments ── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3 rounded-lg border border-border/60 bg-card p-5 space-y-4">
          <div>
            <p className="font-display text-sm font-semibold text-foreground">Feature adoption</p>
            <p className="mt-0.5 font-mono text-xs text-muted-foreground">
              Unique users who used each feature at least once
            </p>
          </div>
          <div className="space-y-4">
            {data.featureAdoption.map(item => (
              <FeatureBar
                key={item.feature}
                item={item}
                max={Math.max(...data.featureAdoption.map(f => f.users))}
              />
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 rounded-lg border border-border/60 bg-card p-5">
          <p className="font-display text-sm font-semibold text-foreground">Engagement segments</p>
          <p className="mb-2 mt-0.5 font-mono text-xs text-muted-foreground">
            By total feature interactions
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={data.engagementSegments} innerRadius={52} outerRadius={78}
                paddingAngle={2} dataKey="value">
                {data.engagementSegments.map((e, i) => <Cell key={i} fill={e.color}/>)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} formatter={(v, n) => [`${v} users`, n]}/>
              <Legend iconType="circle" iconSize={8}
                wrapperStyle={{ fontFamily: "JetBrains Mono", fontSize: 10 }}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── User journey funnel (custom — no recharts FunnelChart) ── */}
      <div className="rounded-lg border border-border/60 bg-card p-5">
        <p className="font-display text-sm font-semibold text-foreground">User journey funnel</p>
        <p className="mb-4 mt-0.5 font-mono text-xs text-muted-foreground">
          From signup to activation to subscription
        </p>
        <FunnelViz steps={data.featureDepthFunnel} />
      </div>

      {/* ── Cohort retention table ── */}
      <div className="rounded-lg border border-border/60 bg-card p-5">
        <p className="font-display text-sm font-semibold text-foreground">Cohort retention</p>
        <p className="mb-4 mt-0.5 font-mono text-xs text-muted-foreground">
          Return rate and feature activation by signup month
        </p>
        <div className="overflow-x-auto">
          <table className="w-full font-mono text-xs">
            <thead>
              <tr className="border-b border-border/60">
                {["Cohort","Users","Returned","Return %","Activated","Activation %"].map(h => (
                  <th key={h} className="pb-2 pr-6 text-left font-semibold text-muted-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.cohortRetention.map((row, i) => (
                <tr key={i} className="border-b border-border/40 hover:bg-muted/20 transition-colors">
                  <td className="py-2.5 pr-6 font-medium text-foreground">{row.month}</td>
                  <td className="py-2.5 pr-6 text-foreground">{row.total.toLocaleString()}</td>
                  <td className="py-2.5 pr-6 text-foreground">{row.returned}</td>
                  <td className="py-2.5 pr-6">
                    <span className={cn("font-semibold", row.returnRate >= 20
                      ? "text-primary" : row.returnRate >= 10 ? "text-amber-500" : "text-destructive")}>
                      {row.returnRate}%
                    </span>
                  </td>
                  <td className="py-2.5 pr-6 text-foreground">{row.activated}</td>
                  <td className="py-2.5">
                    <span className={cn("font-semibold", row.activationRate >= 20
                      ? "text-primary" : row.activationRate >= 10 ? "text-amber-500" : "text-destructive")}>
                      {row.activationRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Column mapping + raw preview (only when CSV uploaded) ── */}
      {s && (
        <>
          <ColumnMapping detected={s.detectedCols} />
          {s.rows.length > 0 && <DataPreview rows={s.rows} columns={s.columns} />}
        </>
      )}

      {/* ── Empty state ── */}
      {!data.fileName && (
        <div className="flex flex-col items-center gap-3 rounded-lg border-2 border-dashed
          border-border/60 bg-card p-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl
            border border-primary/20 bg-primary/10">
            <Gavel className="h-6 w-6 text-primary" />
          </div>
          <p className="font-display text-sm font-semibold text-foreground">
            Showing static snapshot
          </p>
          <p className="max-w-xs font-mono text-xs text-muted-foreground">
            Upload a fresh user export from LawgicHub to see live data. The snapshot above
            reflects{" "}
            <span className="text-foreground/60">users-export-2026-05-19.csv</span>.
          </p>
        </div>
      )}
    </div>
  );
}