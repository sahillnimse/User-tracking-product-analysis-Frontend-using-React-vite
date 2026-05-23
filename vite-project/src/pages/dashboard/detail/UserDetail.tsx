// src/pages/dashboard/detail/UserDetail.tsx
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, User, Zap, Calendar, BarChart2 } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { StatCard, PanelCard } from "@/components/dashboard/StatCard";
import { useAnalytics } from "@/hooks/useAnalytics";
import { conversionScores } from "@/hooks/useAnalytics";

const tooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontFamily: "JetBrains Mono",
  fontSize: 11,
};

export default function UserDetail() {
  const { userId } = useParams<{ userId: string }>();
  const navigate   = useNavigate();
  const data       = useAnalytics();

  // Find conversion candidate matching the userId (email slug)
  const candidate = conversionScores.find(
    (c) => encodeURIComponent(c.user) === userId || c.user === decodeURIComponent(userId ?? ""),
  ) ?? conversionScores[0];

  // Feature usage bar chart — derived from featureAdoption
  const featureUsage = data.featureAdoption.map((f) => ({
    name:  f.feature,
    uses:  f.totalUses,
    score: Math.round((f.totalUses / (data.draftsCreated || 1)) * 100),
  }));

  const signalLabels = candidate?.signals ?? [];

  return (
    <div className="space-y-6">
      {/* Back nav */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 font-mono text-xs text-muted-foreground
          hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back
      </button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full
            bg-primary/20 font-mono text-lg font-bold text-primary">
            {candidate.user[0].toUpperCase()}
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">{candidate.user}</h1>
            <p className="font-mono text-xs text-muted-foreground">
              Free trial · {candidate.days} days active
            </p>
          </div>
        </div>
        <div className="rounded-full bg-primary/15 px-3 py-1 font-mono text-xs
          font-semibold text-primary">
          Score: {candidate.score}/100
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Conversion score" value={`${candidate.score}`}    suffix="/100"  icon={Zap} />
        <StatCard label="Days active"       value={`${candidate.days}`}    suffix="days"  icon={Calendar} />
        <StatCard label="Drafts created"    value={`${data.draftsCreated}`}               icon={BarChart2} />
        <StatCard label="Plan"              value="Free trial"             note="Upgrade candidate" icon={User} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Conversion signals */}
        <PanelCard title="Conversion signals" subtitle="Behavioural indicators detected for this user">
          <div className="space-y-2 mt-1">
            {signalLabels.map((sig) => (
              <div
                key={sig}
                className="flex items-center gap-3 rounded-md border border-primary/20
                  bg-primary/5 px-3 py-2.5"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                <span className="font-mono text-xs text-foreground">{sig}</span>
              </div>
            ))}
            {signalLabels.length === 0 && (
              <p className="font-mono text-xs text-muted-foreground">No signals detected.</p>
            )}
          </div>
        </PanelCard>

        {/* Feature usage */}
        <PanelCard title="Feature usage across platform" subtitle="Total uses per feature">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={featureUsage} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                axisLine={false} tickLine={false}
              />
              <YAxis
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                axisLine={false} tickLine={false}
              />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "hsl(var(--muted)/0.3)" }} />
              <Bar dataKey="uses" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </PanelCard>
      </div>

      {/* Upgrade recommendation */}
      <PanelCard title="Upgrade recommendation" subtitle="Why this user is worth a targeted nudge">
        <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-4">
          <p className="font-mono text-xs text-foreground leading-relaxed">
            This user has a conversion score of{" "}
            <span className="text-primary font-semibold">{candidate.score}/100</span> —
            placing them in the top tier of upgrade candidates. With{" "}
            <span className="text-foreground font-semibold">{candidate.days} active days</span>{" "}
            and strong feature engagement, a targeted in-app prompt or personalised
            upgrade email is recommended within the next 24 hours.
          </p>
        </div>
      </PanelCard>
    </div>
  );
}