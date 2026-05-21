import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label:   string;
  value:   string;
  delta?:  number;   // numeric % change → shows ↑↓ arrow + "vs last period"
  note?:   string;   // plain text below value, no arrow (use this for strings)
  icon?:   LucideIcon;
  suffix?: string;
}

export function StatCard({ label, value, delta, note, icon: Icon, suffix }: StatCardProps) {
  const positive = (delta ?? 0) >= 0;

  return (
    <div className="group relative overflow-hidden rounded-lg border border-border/60 bg-card p-4
      transition-all hover:border-primary/40 hover:box-glow-sm">

      {/* Top accent line on hover */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-primary/40
        via-primary/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {label}
          </div>
          <div className="mt-2 font-display text-2xl font-semibold text-foreground">
            {value}
            {suffix && (
              <span className="ml-1 text-sm font-normal text-muted-foreground">{suffix}</span>
            )}
          </div>
        </div>

        {Icon && (
          <div className="ml-3 shrink-0 rounded-md border border-primary/20 bg-primary/8 p-1.5">
            <Icon className="h-3.5 w-3.5 text-primary" />
          </div>
        )}
      </div>

      {/* Numeric delta with arrow */}
      {delta !== undefined && (
        <div className={cn(
          "mt-3 inline-flex items-center gap-1 font-mono text-xs",
          positive ? "text-primary" : "text-destructive",
        )}>
          {positive
            ? <ArrowUpRight className="h-3 w-3" />
            : <ArrowDownRight className="h-3 w-3" />}
          {Math.abs(delta).toFixed(1)}% vs last period
        </div>
      )}

      {/* Plain text note (no arrow, no delta needed) */}
      {note && delta === undefined && (
        <div className="mt-3 font-mono text-xs text-muted-foreground">
          {note}
        </div>
      )}
    </div>
  );
}

export function PanelCard({
  title, subtitle, children, action,
}: {
  title:     string;
  subtitle?: string;
  children:  React.ReactNode;
  action?:   React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-card p-4">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-display text-sm font-semibold text-foreground">{title}</h3>
          {subtitle && (
            <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {children}
    </div>
  );
}