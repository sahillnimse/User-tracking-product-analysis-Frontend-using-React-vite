// src/hooks/usePageTracking.ts
//
// Google Analytics-style page tracking — works in-app without any external SDK.
// Records page views, time on page, and session data in memory + localStorage.
// DashboardLayout calls this once; any page can call usePageViews() to read data.

import { useEffect, useRef }    from "react";
import { useLocation }          from "react-router-dom";

const STORAGE_KEY = "pulse_page_views";
const SESSION_KEY = "pulse_session_id";
const MAX_STORED  = 500; // cap stored events

export interface PageView {
  path:       string;
  title:      string;
  enteredAt:  number;    // unix ms
  duration:   number;    // ms spent on page (0 while on page)
  sessionId:  string;
}

// Page title map
const PAGE_TITLES: Record<string, string> = {
  "/":           "Overview",
  "/events":     "Live Events",
  "/funnel":     "Activation Funnel",
  "/features":   "Feature Adoption",
  "/conversion": "Conversion Readiness",
  "/segments":   "User Segments",
  "/retention":  "Retention Cohorts",
  "/csv":        "CSV Analysis",
  "/health":     "Product Health",
  "/pageflow":   "Page Flow",
};

// ── Session ID ────────────────────────────────────────────────────────────────
function getSessionId(): string {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return `s_${Date.now().toString(36)}`;
  }
}

// ── Storage helpers ───────────────────────────────────────────────────────────
function loadViews(): PageView[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveViews(views: PageView[]): void {
  try {
    // Keep only most recent MAX_STORED events
    const trimmed = views.slice(-MAX_STORED);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch { /* quota */ }
}

// ── Track hook (used in DashboardLayout) ─────────────────────────────────────
export function usePageTracking(): void {
  const location   = useLocation();
  const sessionId  = useRef(getSessionId());
  const enteredAt  = useRef(Date.now());
  const prevPath   = useRef<string | null>(null);

  useEffect(() => {
    const path = location.pathname;

    // Finalise previous page duration
    if (prevPath.current !== null) {
      const duration = Date.now() - enteredAt.current;
      const views    = loadViews();
      // Update last entry for prevPath with real duration
      for (let i = views.length - 1; i >= 0; i--) {
        if (views[i].path === prevPath.current && views[i].duration === 0) {
          views[i].duration = duration;
          break;
        }
      }
      saveViews(views);
    }

    // Record new page view
    const view: PageView = {
      path,
      title:     PAGE_TITLES[path] ?? path,
      enteredAt: Date.now(),
      duration:  0,
      sessionId: sessionId.current,
    };
    const views = loadViews();
    views.push(view);
    saveViews(views);

    prevPath.current = path;
    enteredAt.current = Date.now();

    // Update document title
    document.title = `${PAGE_TITLES[path] ?? "Page"} · Pulse Analytics`;

    // Finalise on unmount / tab close
    const handleUnload = () => {
      const d = Date.now() - enteredAt.current;
      const v = loadViews();
      for (let i = v.length - 1; i >= 0; i--) {
        if (v[i].path === path && v[i].duration === 0) { v[i].duration = d; break; }
      }
      saveViews(v);
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [location.pathname]);
}

// ── Read hook (used in Overview or any page) ──────────────────────────────────
export function usePageViews(): {
  views:        PageView[];
  topPages:     { path: string; title: string; views: number; avgDuration: number }[];
  totalSessions: number;
  todayViews:   number;
} {
  const views = loadViews();

  // Aggregate by path
  const agg: Record<string, { views: number; totalDuration: number }> = {};
  views.forEach(v => {
    if (!agg[v.path]) agg[v.path] = { views: 0, totalDuration: 0 };
    agg[v.path].views++;
    agg[v.path].totalDuration += v.duration;
  });

  const topPages = Object.entries(agg)
    .sort((a, b) => b[1].views - a[1].views)
    .map(([path, d]) => ({
      path,
      title:       PAGE_TITLES[path] ?? path,
      views:       d.views,
      avgDuration: d.views > 0 ? Math.round(d.totalDuration / d.views / 1000) : 0,
    }));

  const sessions = new Set(views.map(v => v.sessionId)).size;
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const todayViews = views.filter(v => v.enteredAt >= todayStart.getTime()).length;

  return { views, topPages, totalSessions: sessions, todayViews };
}

// ── Clear (for dev / reset) ───────────────────────────────────────────────────
export function clearPageViews(): void {
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* */ }
}