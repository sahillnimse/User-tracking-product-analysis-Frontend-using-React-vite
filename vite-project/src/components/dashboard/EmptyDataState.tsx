// src/components/dashboard/EmptyDataState.tsx
// Shown on every page when mode === "none" (no live API + no demo)

import { Database, Plug, BarChart2 } from "lucide-react";
import { useLiveData } from "@/context/AppContext";
import { useNavigate } from "react-router-dom";

export function EmptyDataState({
  title = "No data connected",
  description = "Connect a live API endpoint or enable demo mode to see analytics.",
}: {
  title?: string;
  description?: string;
}) {
  const { setMode } = useLiveData();
  const navigate    = useNavigate();

  return (
    <div className="flex flex-1 flex-col items-center justify-center min-h-[60vh] text-center gap-6 px-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl
        border border-primary/20 bg-primary/8">
        <Database className="h-8 w-8 text-primary/50" />
      </div>

      <div className="space-y-2">
        <h2 className="font-display text-xl font-semibold">{title}</h2>
        <p className="font-mono text-xs text-muted-foreground max-w-md">{description}</p>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        {/* Quick demo toggle */}
        <button
          onClick={() => setMode("demo")}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5
            font-mono text-xs text-primary-foreground hover:opacity-90 transition-opacity"
        >
          <BarChart2 className="h-3.5 w-3.5" />
          Enable demo data
        </button>

        {/* Upload CSV */}
        <button
          onClick={() => navigate("/csv")}
          className="flex items-center gap-2 rounded-lg border border-border/60
            bg-card px-4 py-2.5 font-mono text-xs text-foreground
            hover:border-primary/40 transition-colors"
        >
          <Plug className="h-3.5 w-3.5" />
          Upload CSV data
        </button>
      </div>
    </div>
  );
}