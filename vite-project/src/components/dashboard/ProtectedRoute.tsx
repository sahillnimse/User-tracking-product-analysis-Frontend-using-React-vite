// src/components/dashboard/ProtectedRoute.tsx
// Wraps any route. If user is not in the allowed list, shows a login gate.
// ⚠️  This is a CLIENT-SIDE gate only. Always enforce auth on the server too.

import { useState } from "react";
import { Scale, Lock } from "lucide-react";
import { getCurrentUser, loginWithEmail, type DashboardUser } from "@/lib/auth";

interface Props {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: Props) {
  const [user, setUser]       = useState<DashboardUser | null>(getCurrentUser);
  const [email, setEmail]     = useState("");
  const [error, setError]     = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (user) return <>{children}</>;

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    // Simulate a brief async check (replace with real API call)
    await new Promise(r => setTimeout(r, 400));
    const result = loginWithEmail(email);
    setLoading(false);
    if (result) {
      setUser(result);
    } else {
      setError("Access denied. Your email is not on the approved list.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl
            border border-primary/30 bg-primary/10">
            <Scale className="h-6 w-6 text-primary" />
          </div>
          <div className="text-center">
            <div className="font-display text-xl font-bold text-foreground">LawgicHub Analytics</div>
            <div className="font-mono text-xs text-muted-foreground">Internal access only</div>
          </div>
        </div>

        {/* Login card */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-lg space-y-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Lock className="h-3.5 w-3.5" />
            <span className="font-mono text-xs">Enter your company email to continue</span>
          </div>

          <div className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              placeholder="you@lawgichub.com"
              className="w-full rounded-md border border-border bg-muted/30 px-3 py-2.5
                font-mono text-xs text-foreground outline-none
                focus:border-primary placeholder:text-muted-foreground"
              autoFocus
            />

            {error && (
              <div className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2
                font-mono text-xs text-destructive">
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading || !email}
              className="w-full rounded-md bg-primary px-4 py-2.5 font-mono text-xs
                text-primary-foreground hover:opacity-90 transition-opacity
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Checking…" : "Access dashboard →"}
            </button>
          </div>
        </div>

        <p className="text-center font-mono text-[10px] text-muted-foreground/60">
          Not an approved member? Contact your admin.
        </p>
      </div>
    </div>
  );
}