import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Activity, Filter, Sparkles, Target, Users, Repeat, Terminal, FileSpreadsheet,
  HeartPulse, Route,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Overview", url: "/", icon: LayoutDashboard },
  { title: "Live Events", url: "/events", icon: Activity },
  { title: "Page Flow", url: "/pageflow", icon: Route },
  { title: "Activation Funnel", url: "/funnel", icon: Filter },
  { title: "Product Health", url: "/health", icon: HeartPulse },
  { title: "Feature Adoption", url: "/features", icon: Sparkles },
  { title: "Conversion Readiness", url: "/conversion", icon: Target },
  { title: "User Segments", url: "/segments", icon: Users },
  { title: "Retention", url: "/retention", icon: Repeat },
  { title: "CSV Analysis", url: "/csv", icon: FileSpreadsheet },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { pathname } = useLocation();

  return (
    <Sidebar collapsible="icon" className="border-r border-border/60">
      <SidebarHeader className="border-b border-border/60 p-4">
        <div className="flex items-center gap-2 font-mono text-primary">
          <Terminal className="h-5 w-5" />
          {!collapsed && <span className="text-sm font-bold text-glow-sm">pulse.analytics</span>}
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
                      {!collapsed && <span className="font-mono text-xs">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
