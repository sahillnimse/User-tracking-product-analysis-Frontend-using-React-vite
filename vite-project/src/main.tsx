// src/main.tsx
// FIX architecture-5: MUI ThemeProvider now reads resolvedTheme from next-themes
// so toggling the theme toggle in the header affects BOTH Tailwind/CSS-var
// components AND MUI components consistently.
//
// Implementation: a tiny <MuiThemeSync> wrapper reads next-themes' resolvedTheme
// and rebuilds the MUI theme object on every toggle, then feeds it to
// MuiThemeProvider. This keeps main.tsx clean and avoids putting hook logic
// at module root level.

import { createRoot }                                     from "react-dom/client";
import { ThemeProvider as NextThemesProvider, useTheme }  from "next-themes";
import { ThemeProvider as MuiThemeProvider, CssBaseline } from "@mui/material";
import { createTheme }                                    from "@mui/material/styles";
import type { ReactNode }                                 from "react";

import App   from "./App.tsx";
import "./index.css";

// ── MUI palette tokens — keep in sync with index.css / tailwind theme ─────────
const DARK_PALETTE = {
  primary:    { main: "#2563eb" },
  secondary:  { main: "#7c3aed" },
  background: { default: "#0f172a", paper: "#111827" },
};
const LIGHT_PALETTE = {
  primary:    { main: "#1d4ed8" },
  secondary:  { main: "#6d28d9" },
  background: { default: "#f8fafc", paper: "#ffffff" },
};

// Reads resolvedTheme from next-themes (must be inside NextThemesProvider)
function MuiThemeSync({ children }: { children: ReactNode }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== "light";

  const muiTheme = createTheme({
    palette: {
      mode: isDark ? "dark" : "light",
      ...(isDark ? DARK_PALETTE : LIGHT_PALETTE),
    },
    shape:      { borderRadius: 12 },
    typography: { fontFamily: `"Inter", sans-serif` },
  });

  return (
    <MuiThemeProvider theme={muiTheme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <NextThemesProvider attribute="class" defaultTheme="dark" enableSystem>
    <MuiThemeSync>
      <App />
    </MuiThemeSync>
  </NextThemesProvider>
);