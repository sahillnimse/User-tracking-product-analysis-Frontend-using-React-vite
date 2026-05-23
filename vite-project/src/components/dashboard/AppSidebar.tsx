// src/components/dashboard/AppSidebar.tsx
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Activity, Filter, Sparkles, Target,
  Users, Repeat, FileSpreadsheet, HeartPulse, Route, Scale, LineChart,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, useSidebar,
} from "@/components/ui/sidebar";
import { usePageViews } from "@/hooks/usePageTracking";

const items = [
  { title: "Overview",            url: "/",               icon: LayoutDashboard },
  { title: "Live Events",         url: "/events",         icon: Activity },
  { title: "Page Analytics",      url: "/pageanalytics",  icon: LineChart },
  { title: "Page Flow",           url: "/pageflow",       icon: Route },
  { title: "Activation Funnel",   url: "/funnel",         icon: Filter },
  { title: "Product Health",      url: "/health",         icon: HeartPulse },
  { title: "Feature Adoption",    url: "/features",       icon: Sparkles },
  { title: "Conversion Readiness",url: "/conversion",     icon: Target },
  { title: "User Segments",       url: "/segments",       icon: Users },
  { title: "Retention",           url: "/retention",      icon: Repeat },
  { title: "CSV Analysis",        url: "/csv",            icon: FileSpreadsheet },
];

export function AppSidebar() {
  const { state }    = useSidebar();
  const collapsed    = state === "collapsed";
  const { pathname } = useLocation();
  const { todayViews } = usePageViews();

  return (
    <Sidebar collapsible="icon" className="border-r border-border/60">
      <SidebarHeader className="border-b border-border/60 p-4">
        <div className="flex items-center gap-2.5 font-mono text-primary">
          <Scale className="h-5 w-5 shrink-0" />
          {!collapsed && (
            <div className="leading-tight">
              <div className="text-[11px] font-bold text-foreground tracking-tight">
                Lawgichub
              </div>
              <div className="text-[9px] text-muted-foreground tracking-widest uppercase">
                User Analysis
              </div>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="font-mono text-[10px] uppercase tracking-widest">
            Insights
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <NavLink to={item.url} end className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      {!collapsed && (
                        <span className="font-mono text-xs flex-1">{item.title}</span>
                      )}
                      {/* Live badge for Page Analytics */}
                      {!collapsed && item.url === "/pageanalytics" && todayViews > 0 && (
                        <span className="ml-auto rounded-full bg-primary/15 px-1.5 py-0.5
                          font-mono text-[9px] text-primary tabular-nums">
                          {todayViews}
                        </span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Page Analytics mini summary in sidebar (expanded only) */}
        {!collapsed && (
          <SidebarGroup>
            <SidebarGroupLabel className="font-mono text-[10px] uppercase tracking-widest">
              Live Tracking
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <PageTrackingMini />
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}

// ── Mini page tracking widget in sidebar ──────────────────────────────────────
function PageTrackingMini() {
  const { topPages, todayViews, totalSessions } = usePageViews();
  const top3 = topPages.slice(0, 4);

  const pageName: Record<string, string> = {
    "/":               "Overview",
    "/events":         "Live Events",
    "/pageanalytics":  "Page Analytics",
    "/pageflow":       "Page Flow",
    "/funnel":         "Funnel",
    "/features":       "Features",
    "/conversion":     "Conversion",
    "/segments":       "Segments",
    "/retention":      "Retention",
    "/csv":            "CSV Analysis",
    "/health":         "Health",
  };

  return (
    <div className="mx-2 rounded-lg border border-border/60 bg-card/50 p-3 space-y-3">
      {/* KPI row */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-md bg-muted/40 px-2 py-1.5 text-center">
          <div className="font-display text-base font-bold text-primary">{todayViews}</div>
          <div className="font-mono text-[9px] text-muted-foreground leading-none mt-0.5">today</div>
        </div>
        <div className="rounded-md bg-muted/40 px-2 py-1.5 text-center">
          <div className="font-display text-base font-bold text-foreground">{totalSessions}</div>
          <div className="font-mono text-[9px] text-muted-foreground leading-none mt-0.5">sessions</div>
        </div>
      </div>

      {/* Top pages mini list */}
      {top3.length > 0 ? (
        <div className="space-y-1.5">
          <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
            Top pages
          </div>
          {top3.map((p, i) => (
            <div key={p.path} className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 min-w-0">
                <div
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ background: ["hsl(var(--primary))", "hsl(170 70% 45%)", "hsl(45 90% 55%)", "hsl(280 80% 65%)"][i] }}
                />
                <span className="truncate font-mono text-[10px] text-muted-foreground">
                  {pageName[p.path] ?? p.path}
                </span>
              </div>
              <span className="ml-1 shrink-0 font-mono text-[10px] font-semibold text-foreground">
                {p.views}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="font-mono text-[10px] text-muted-foreground/60 text-center py-1">
          No page views yet
        </div>
      )}
    </div>
  );
}