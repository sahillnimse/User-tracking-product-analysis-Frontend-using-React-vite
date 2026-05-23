import { createRoot } from "react-dom/client";
import { ThemeProvider as MuiThemeProvider, CssBaseline } from "@mui/material";
import { ThemeProvider as NextThemesProvider } from "next-themes";

import App from "./App.tsx";
import theme from "./theme";

import "./index.css";

createRoot(document.getElementById("root")!).render(
  <NextThemesProvider
    attribute="class"
    defaultTheme="dark"
    enableSystem
  >
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </MuiThemeProvider>
  </NextThemesProvider>
);