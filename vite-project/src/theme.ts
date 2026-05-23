import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#2563eb",
    },
    secondary: {
      main: "#7c3aed",
    },
    background: {
      default: "#0f172a",
      paper: "#111827",
    },
  },

  shape: {
    borderRadius: 12,
  },

  typography: {
    fontFamily: `"Inter", sans-serif`,
  },
});

export default theme;