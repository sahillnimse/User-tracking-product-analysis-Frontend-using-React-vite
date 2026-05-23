// src/lib/auth.ts
// ── Role-based access control for the analytics dashboard ────────────────────
// This is a LIGHTWEIGHT client-side guard. For production, ALWAYS back this
// with a proper server-side auth check (JWT / session cookie verified on the API).

export type Role = "admin" | "analyst" | "viewer";

export interface DashboardUser {
  id:    string;
  name:  string;
  email: string;
  role:  Role;
  /** Initials shown in the avatar */
  initials: string;
}

// ── Allowed emails / roles ────────────────────────────────────────────────────
// Replace or extend this list. In production, fetch this from your backend.
const ALLOWED_USERS: DashboardUser[] = [
  { id: "u1", name: "Admin",    email: "admin@lawgichub.com",   role: "admin",   initials: "AD" },
  { id: "u2", name: "Analyst",  email: "analyst@lawgichub.com", role: "analyst", initials: "AN" },
  { id: "u3", name: "Sahil",    email: "sahil.nimse@xarka.in",  role: "admin",   initials: "SN"},
  // Add more as needed
];

const SESSION_KEY = "pulse_auth_user";

// ── Read current user ─────────────────────────────────────────────────────────
export function getCurrentUser(): DashboardUser | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as DashboardUser) : null;
  } catch {
    return null;
  }
}

// ── "Login" — validates email against allowed list ───────────────────────────
// In production, replace with your real auth flow (Google SSO, SAML, etc.)
export function loginWithEmail(email: string): DashboardUser | null {
  const user = ALLOWED_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return null;
  try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(user)); } catch { /* */ }
  return user;
}

export function logout(): void {
  try { sessionStorage.removeItem(SESSION_KEY); } catch { /* */ }
}

// ── Permission helpers ────────────────────────────────────────────────────────
export const canView    = (user: DashboardUser | null) => user !== null;
export const canAnalyse = (user: DashboardUser | null) =>
  user?.role === "admin" || user?.role === "analyst";
export const isAdmin    = (user: DashboardUser | null) => user?.role === "admin";