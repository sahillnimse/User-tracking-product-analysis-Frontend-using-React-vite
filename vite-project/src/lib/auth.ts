// src/lib/auth.ts
// ── Role-based access control for the analytics dashboard ────────────────────
// This is a LIGHTWEIGHT client-side guard. For production, ALWAYS back this
// with a proper server-side auth check (JWT / session cookie verified on the API).
//
// FIX moderate-7:  loginWithEmail / getCurrentUser now use localStorage instead
//   of sessionStorage so a second tab in the same browser stays authenticated.
//
// FIX minor-12: Real personal email removed from source. The third allowed user
//   is now loaded from the VITE_ADMIN_EMAIL env var (set in .env.local).
//   If the env var is absent the slot is simply omitted.
//   Add to .env.local:
//     VITE_ADMIN_EMAIL=sahil.nimse@xarka.in
//     VITE_ADMIN_NAME=Sahil
//     VITE_ADMIN_INITIALS=SN

export type Role = "admin" | "analyst" | "viewer";

export interface DashboardUser {
  id:      string;
  name:    string;
  email:   string;
  role:    Role;
  /** Initials shown in the avatar */
  initials: string;
}

// ── Allowed users ─────────────────────────────────────────────────────────────
// Static entries use only product-level addresses — no personal emails.
// Additional admins come from env vars (never committed to source).
const STATIC_USERS: DashboardUser[] = [
  { id: "u1", name: "Admin",   email: "admin@lawgichub.com",   role: "admin",   initials: "AD" },
  { id: "u2", name: "Analyst", email: "analyst@lawgichub.com", role: "analyst", initials: "AN" },
];

function buildAllowedUsers(): DashboardUser[] {
  const users = [...STATIC_USERS];

  // Inject from env vars — works in Vite (import.meta.env) and test environments
  const adminEmail    = import.meta.env?.VITE_ADMIN_EMAIL    as string | undefined;
  const adminName     = import.meta.env?.VITE_ADMIN_NAME     as string | undefined;
  const adminInitials = import.meta.env?.VITE_ADMIN_INITIALS as string | undefined;

  if (adminEmail) {
    users.push({
      id:       "u_env",
      name:     adminName ?? "Admin",
      email:    adminEmail,
      role:     "admin",
      initials: adminInitials ?? adminName?.slice(0, 2).toUpperCase() ?? "AD",
    });
  }

  return users;
}

const ALLOWED_USERS = buildAllowedUsers();

const SESSION_KEY = "pulse_auth_user";

// ── Read current user ─────────────────────────────────────────────────────────
export function getCurrentUser(): DashboardUser | null {
  try {
    // FIX: localStorage keeps the session alive across tabs and browser restarts
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as DashboardUser) : null;
  } catch {
    return null;
  }
}

// ── "Login" — validates email against allowed list ───────────────────────────
export function loginWithEmail(email: string): DashboardUser | null {
  const user = ALLOWED_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return null;
  try { localStorage.setItem(SESSION_KEY, JSON.stringify(user)); } catch { /* */ }
  return user;
}

export function logout(): void {
  try { localStorage.removeItem(SESSION_KEY); } catch { /* */ }
}

// ── Permission helpers ────────────────────────────────────────────────────────
export const canView    = (user: DashboardUser | null) => user !== null;
export const canAnalyse = (user: DashboardUser | null) =>
  user?.role === "admin" || user?.role === "analyst";
export const isAdmin    = (user: DashboardUser | null) => user?.role === "admin";