import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  useEffect(() => {
    // Read location.pathname inside the effect — not in deps array.
    // Mutable globals like location.pathname don't trigger re-renders,
    // so they must never appear in the dependency array (react-doctor rule).
    const path = window.location.pathname;
    console.warn(`[404] No route matched: ${path}`);
  }, []); // ← empty deps: runs once on mount only

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background text-foreground">
      <div className="text-center">
        <p className="font-mono text-sm text-muted-foreground">404</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-foreground">
          Page not found
        </h1>
        <p className="mt-2 font-mono text-sm text-muted-foreground">
          The page you're looking for doesn't exist.
        </p>
      </div>
      <button
        onClick={() => navigate("/")}
        className="rounded-md border border-border/60 bg-card px-4 py-2
          font-mono text-sm text-muted-foreground
          hover:border-primary/40 hover:text-primary transition-colors"
      >
        Go to dashboard
      </button>
    </div>
  );
}