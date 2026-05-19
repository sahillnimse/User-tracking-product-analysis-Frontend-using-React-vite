import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import { PanelCard } from "@/components/dashboard/StatCard";
import { featureAdoption, featureUsageOverTime } from "@/lib/analyticsData";
import { cn } from "@/lib/utils";

const tooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontFamily: "JetBrains Mono",
  fontSize: 11,
};

export default function FeatureAdoption() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Feature Adoption</h1>
        <p className="font-mono text-xs text-muted-foreground">
          Which AI tools and features users actually use
        </p>
      </div>

      <PanelCard title="Adoption heatmap" subtitle="% of active users using each feature">
        <div className="grid gap-3 md:grid-cols-2">
          {featureAdoption.map((f) => (
            <div key={f.feature} className="rounded-md border border-border/60 bg-muted/20 p-3">
              <div className="flex items-center justify-between">
                <div className="font-display text-sm font-semibold">{f.feature}</div>
                <span
                  className={cn(
                    "font-mono text-xs",
                    f.trend >= 0 ? "text-primary" : "text-destructive",
                  )}
                >
                  {f.trend >= 0 ? "+" : ""}{f.trend}%
                </span>
              </div>
              <div className="mt-1 font-mono text-[11px] text-muted-foreground">
                {f.users.toLocaleString()} users · {f.adoption}% adoption
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full bg-gradient-to-r",
                    f.adoption > 50 ? "from-primary to-emerald-300" :
                    f.adoption > 25 ? "from-yellow-400 to-primary" :
                    "from-orange-500 to-yellow-400",
                  )}
                  style={{ width: `${f.adoption}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </PanelCard>

      <PanelCard title="Feature usage trend" subtitle="Monthly active users per feature (last 12 months)">
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={featureUsageOverTime}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={10} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontFamily: "JetBrains Mono", fontSize: 10 }} />
            <Line type="monotone" dataKey="aiCode" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="AI Code Gen" />
            <Line type="monotone" dataKey="visualEditor" stroke="hsl(170 70% 45%)" strokeWidth={2} dot={false} name="Visual Editor" />
            <Line type="monotone" dataKey="githubSync" stroke="hsl(45 90% 55%)" strokeWidth={2} dot={false} name="GitHub Sync" />
            <Line type="monotone" dataKey="imageGen" stroke="hsl(280 80% 65%)" strokeWidth={2} dot={false} name="AI Image Gen" />
          </LineChart>
        </ResponsiveContainer>
      </PanelCard>
    </div>
  );
}
