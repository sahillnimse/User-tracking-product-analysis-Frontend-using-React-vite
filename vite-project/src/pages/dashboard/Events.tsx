import { useEffect, useRef, useState } from "react";
import { Circle } from "lucide-react";
import { PanelCard } from "@/components/dashboard/StatCard";
import { eventStream, topEvents } from "@/lib/analyticsData";
import { cn } from "@/lib/utils";

const categoryColor: Record<string, string> = {
  ai:         "text-primary border-primary/40 bg-primary/10",
  core:       "text-blue-300 border-blue-300/40 bg-blue-300/10",
  navigation: "text-muted-foreground border-border bg-muted/40",
  collab:     "text-sky-300 border-sky-300/40 bg-sky-300/10",
  billing:    "text-amber-400 border-amber-400/40 bg-amber-400/10",
};

// Stable ID counter so we never use array index as key
let _id = 0;
const withId = (ev: (typeof eventStream)[number]) => ({ ...ev, _key: ++_id });

export default function Events() {
  const [stream, setStream] = useState(() => eventStream.map(withId));
  // Use ref for interval cleanup
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const ev = eventStream[Math.floor(Math.random() * eventStream.length)];
      const now = new Date();
      const time = [
        now.getHours().toString().padStart(2, "0"),
        now.getMinutes().toString().padStart(2, "0"),
        now.getSeconds().toString().padStart(2, "0"),
      ].join(":");

      setStream((prev) => [withId({ ...ev, time }), ...prev].slice(0, 20));
    }, 2200);

    // ✅ Cleanup — prevents the leak react-doctor flagged
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []); // empty deps — interval is stable

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Live Event Stream</h1>
          <p className="font-mono text-xs text-muted-foreground">
            Real-time view of every tracked user action
          </p>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs text-primary">
          <Circle className="h-2 w-2 animate-pulse-glow fill-primary text-primary" />
          live · 1,284 events/min
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PanelCard title="Event stream" subtitle="Streaming the latest user events">
            <div className="overflow-hidden rounded-md border border-border/60 bg-background/40">
              <div className="grid grid-cols-12 border-b border-border/60 bg-muted/40 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                <div className="col-span-2">time</div>
                <div className="col-span-2">user</div>
                <div className="col-span-4">event</div>
                <div className="col-span-4">properties</div>
              </div>
              <div className="max-h-[460px] overflow-y-auto">
                {stream.map((e, idx) => (
                  // ✅ Stable key — uses incrementing _key, not array index
                  <div
                    key={e._key}
                    className={cn(
                      "grid grid-cols-12 border-b border-border/40 px-3 py-2 font-mono text-xs transition-colors hover:bg-muted/30",
                      idx === 0 && "bg-primary/5",
                    )}
                  >
                    <div className="col-span-2 text-muted-foreground">{e.time}</div>
                    <div className="col-span-2 text-primary">{e.user}</div>
                    <div className="col-span-4 text-foreground">{e.event}</div>
                    <div className="col-span-4 truncate text-muted-foreground">{e.props || "—"}</div>
                  </div>
                ))}
              </div>
            </div>
          </PanelCard>
        </div>

        <PanelCard title="Event catalog" subtitle="Tracked events by volume">
          <div className="space-y-2">
            {topEvents.map((e) => (
              // ✅ Stable key — using event name (unique in catalog)
              <div
                key={e.name}
                className="flex items-center justify-between rounded-md border border-border/60 bg-muted/30 p-2.5"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "rounded border px-1.5 py-0.5 font-mono text-[9px] uppercase",
                      categoryColor[e.category],
                    )}>
                      {e.category}
                    </span>
                    <span className="truncate font-mono text-xs text-foreground">{e.name}</span>
                  </div>
                  <div className="mt-1 font-mono text-[10px] text-muted-foreground">
                    {e.count.toLocaleString()} events
                  </div>
                </div>
                <span className={cn(
                  "font-mono text-xs",
                  e.change >= 0 ? "text-primary" : "text-destructive",
                )}>
                  {e.change >= 0 ? "+" : ""}{e.change}%
                </span>
              </div>
            ))}
          </div>
        </PanelCard>
      </div>
    </div>
  );
}