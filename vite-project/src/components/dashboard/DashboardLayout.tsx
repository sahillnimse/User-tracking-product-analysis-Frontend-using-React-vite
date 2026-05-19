import { Outlet } from "react-router-dom";
import { Bell, Search, Calendar, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";

export default function DashboardLayout() {
  const { theme, setTheme } = useTheme();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border/60 bg-background/80 px-4 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <div className="hidden items-center gap-2 rounded-md border border-border/60 bg-muted/40 px-3 py-1.5 md:flex">
                <Search className="h-3.5 w-3.5 text-muted-foreground" />
                <input
                  placeholder="Search events, users, properties…"
                  className="w-72 bg-transparent font-mono text-xs outline-none placeholder:text-muted-foreground"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 rounded-md border border-border/60 bg-muted/40 px-3 py-1.5 font-mono text-xs text-muted-foreground hover:text-foreground">
                <Calendar className="h-3.5 w-3.5" />
                Last 30 days
              </button>
              <button className="rounded-md border border-border/60 bg-muted/40 p-2 text-muted-foreground hover:text-foreground">
                <Bell className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="rounded-md border border-border/60 bg-muted/40 p-2 text-muted-foreground hover:text-foreground"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
              </button>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 font-mono text-xs text-primary">
                AK
              </div>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
