// src/components/dashboard/DashboardLayout.tsx
import { useState, useRef, useEffect } from "react";
import { Outlet, useNavigate }         from "react-router-dom";
import {
  Bell, Search, Moon, Sun, Calendar, ChevronDown, Check, X,
  Circle, RefreshCw, Settings2, Scale,
} from "lucide-react";
import { useTheme }                     from "next-themes";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar }   from "./AppSidebar";
import { AppProvider, useDateRange, useLiveData, DATE_PRESETS, fmtDate, toInputDate, type DateRange } from "@/context/AppContext";
import { usePageTracking } from "@/hooks/usePageTracking";

// ── Date Range Picker ─────────────────────────────────────────────────────────
function DateRangePicker() {
  const { range, setRange, presets } = useDateRange();
  const [open,    setOpen]    = useState(false);
  const [custom,  setCustom]  = useState(false);
  const [fromVal, setFromVal] = useState(toInputDate(range.from));
  const [toVal,   setToVal]   = useState(toInputDate(range.to));
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false); setCustom(false);
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // Sync input vals when range changes externally
  useEffect(() => {
    setFromVal(toInputDate(range.from));
    setToVal(toInputDate(range.to));
  }, [range]);

  const applyCustom = () => {
    if (!fromVal || !toVal) return;
    const from = new Date(fromVal);
    const to   = new Date(toVal); to.setHours(23, 59, 59, 999);
    if (from > to) return;
    setRange({ from, to, label: `${fmtDate(from)} – ${fmtDate(to)}` });
    setOpen(false); setCustom(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => { setOpen(o => !o); setCustom(false); }}
        className="flex items-center gap-2 rounded-md border border-border/60 bg-muted/40
          px-3 py-1.5 font-mono text-xs text-muted-foreground transition-colors
          hover:border-primary/40 hover:text-foreground"
      >
        <Calendar className="h-3.5 w-3.5" />
        {range.label}
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border border-border
          bg-card shadow-2xl overflow-hidden">
          {!custom ? (
            <>
              <div className="px-3 py-2 font-mono text-[10px] uppercase tracking-widest
                text-muted-foreground border-b border-border">
                Quick select
              </div>
              <div className="py-1">
                {presets.map(p => (
                  <button
                    key={p.label}
                    onClick={() => { setRange(p); setOpen(false); }}
                    className="flex w-full items-center justify-between px-4 py-2.5
                      font-mono text-xs hover:bg-muted/50 transition-colors"
                  >
                    <span className={range.label === p.label ? "text-primary font-semibold" : "text-foreground"}>
                      {p.label}
                    </span>
                    {range.label === p.label && <Check className="h-3 w-3 text-primary" />}
                  </button>
                ))}
              </div>
              <div className="border-t border-border p-2">
                <button
                  onClick={() => setCustom(true)}
                  className="w-full rounded-md border border-border/60 px-3 py-2
                    font-mono text-xs text-muted-foreground hover:border-primary/40
                    hover:text-foreground transition-colors text-center"
                >
                  Custom range…
                </button>
              </div>
            </>
          ) : (
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-foreground">Custom range</span>
                <button onClick={() => setCustom(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="space-y-2">
                <div>
                  <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">From</label>
                  <input type="date" value={fromVal} onChange={e => setFromVal(e.target.value)} max={toVal}
                    className="mt-1 w-full rounded-md border border-border bg-muted/30 px-3 py-1.5
                      font-mono text-xs text-foreground outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">To</label>
                  <input type="date" value={toVal} onChange={e => setToVal(e.target.value)} min={fromVal}
                    className="mt-1 w-full rounded-md border border-border bg-muted/30 px-3 py-1.5
                      font-mono text-xs text-foreground outline-none focus:border-primary" />
                </div>
              </div>
              <button onClick={applyCustom}
                className="w-full rounded-md bg-primary px-3 py-2 font-mono text-xs
                  text-primary-foreground hover:opacity-90 transition-opacity">
                Apply range
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Live Data Status Indicator ────────────────────────────────────────────────
function LiveStatus() {
  const { mode, lastUpdated, isPolling, refresh, setMode, apiUrl, setApiUrl } = useLiveData();
  const [showConfig, setShowConfig] = useState(false);
  const [urlDraft,   setUrlDraft]   = useState(apiUrl);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setShowConfig(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const statusLabel = mode === "demo" ? "demo" : mode === "api" ? "live" : "no data";
  const statusColor = mode === "none"
    ? "text-muted-foreground" : mode === "demo"
    ? "text-amber-400" : "text-primary";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setShowConfig(s => !s)}
        className="flex items-center gap-1.5 rounded-md border border-border/60 bg-muted/40
          px-2.5 py-1.5 font-mono text-xs transition-colors hover:border-primary/40"
      >
        {isPolling
          ? <RefreshCw className="h-3 w-3 animate-spin text-primary" />
          : <Circle className={`h-2 w-2 fill-current ${mode !== "none" ? "animate-pulse" : ""} ${statusColor}`} />}
        <span className={statusColor}>{statusLabel}</span>
        <Settings2 className="h-3 w-3 text-muted-foreground" />
      </button>

      {showConfig && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-border
          bg-card shadow-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <p className="font-mono text-xs font-semibold text-foreground">Data Source</p>
            {lastUpdated && (
              <p className="font-mono text-[10px] text-muted-foreground mt-0.5">
                Updated {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>

          <div className="p-3 space-y-1.5 border-b border-border">
            {(["demo","api","none"] as const).map(m => (
              <button key={m} onClick={() => setMode(m)}
                className={`flex w-full items-center justify-between rounded-md px-3 py-2
                  font-mono text-xs transition-colors
                  ${mode === m ? "bg-primary/10 text-primary" : "hover:bg-muted/50 text-foreground"}`}
              >
                <span className="capitalize">
                  {m === "demo" ? "Demo mode (sample data)" : m === "api" ? "Live API" : "No data"}
                </span>
                {mode === m && <Check className="h-3 w-3" />}
              </button>
            ))}
          </div>

          {mode === "api" && (
            <div className="p-3 space-y-2">
              <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                API Endpoint (GET)
              </label>
              <input
                value={urlDraft}
                onChange={e => setUrlDraft(e.target.value)}
                placeholder="https://your-api.com/analytics/snapshot"
                className="w-full rounded-md border border-border bg-muted/30 px-3 py-1.5
                  font-mono text-xs text-foreground outline-none focus:border-primary"
              />
              <button
                onClick={() => { setApiUrl(urlDraft); setShowConfig(false); }}
                className="w-full rounded-md bg-primary px-3 py-2 font-mono text-xs
                  text-primary-foreground hover:opacity-90 transition-opacity"
              >
                Save & connect
              </button>
            </div>
          )}

          <div className="px-3 pb-3">
            <button onClick={() => { refresh(); setShowConfig(false); }}
              className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground
                hover:text-foreground transition-colors">
              <RefreshCw className="h-3 w-3" /> Refresh now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Global Search ─────────────────────────────────────────────────────────────
function GlobalSearch() {
  const navigate     = useNavigate();
  const [q, setQ]    = useState("");
  const [open, setOpen] = useState(false);

  const PAGES = [
    { label: "Overview",            path: "/" },
    { label: "Live Events",         path: "/events" },
    { label: "Activation Funnel",   path: "/funnel" },
    { label: "Feature Adoption",    path: "/features" },
    { label: "Conversion Readiness",path: "/conversion" },
    { label: "User Segments",       path: "/segments" },
    { label: "Retention",           path: "/retention" },
    { label: "CSV Analysis",        path: "/csv" },
    { label: "Product Health",      path: "/health" },
    { label: "Page Flow",           path: "/pageflow" },
  ];

  const results = q.length > 0
    ? PAGES.filter(p => p.label.toLowerCase().includes(q.toLowerCase()))
    : [];

  return (
    <div className="relative hidden md:block">
      <div className="flex items-center gap-2 rounded-md border border-border/60 bg-muted/40 px-3 py-1.5">
        <Search className="h-3.5 w-3.5 text-muted-foreground" />
        <input
          value={q}
          onChange={e => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Search pages, events, users…"
          className="w-64 bg-transparent font-mono text-xs outline-none
            placeholder:text-muted-foreground text-foreground"
        />
        {q && (
          <button onClick={() => setQ("")} className="text-muted-foreground hover:text-foreground">
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
      {open && results.length > 0 && (
        <div className="absolute left-0 top-full z-50 mt-2 w-full rounded-xl border
          border-border bg-card shadow-2xl overflow-hidden">
          {results.map(r => (
            <button
              key={r.path}
              onMouseDown={() => { navigate(r.path); setQ(""); setOpen(false); }}
              className="flex w-full items-center gap-3 px-4 py-2.5 font-mono text-xs
                text-foreground hover:bg-muted/50 transition-colors"
            >
              <Search className="h-3 w-3 text-muted-foreground" />
              {r.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Inner layout ──────────────────────────────────────────────────────────────
function Layout() {
  usePageTracking();
  const { theme, setTheme } = useTheme();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="sticky top-0 z-30 flex h-14 items-center justify-between
            border-b border-border/60 bg-background/80 px-4 backdrop-blur-xl gap-4">

            <div className="flex items-center gap-3 flex-1">
              <SidebarTrigger />
              <GlobalSearch />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <LiveStatus />
              <DateRangePicker />

              <button className="rounded-md border border-border/60 bg-muted/40 p-2
                text-muted-foreground hover:text-foreground transition-colors relative">
                <Bell className="h-3.5 w-3.5" />
                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary" />
              </button>

              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="rounded-md border border-border/60 bg-muted/40 p-2
                  text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
              </button>

              <div className="flex h-8 w-8 items-center justify-center rounded-full
                bg-primary/20 font-mono text-xs text-primary font-semibold cursor-pointer
                hover:bg-primary/30 transition-colors">
                AK
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

// ── Root export ───────────────────────────────────────────────────────────────
export default function DashboardLayout() {
  return (
    <AppProvider>
      <Layout />
    </AppProvider>
  );
}