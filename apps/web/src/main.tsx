import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { CssBaseline, ThemeProvider, alpha, createTheme } from "@mui/material";
import App from "./App";
import "./styles.css";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#0f4fbf" },
    secondary: { main: "#16a4c9" },
    success: { main: "#179d66" },
    warning: { main: "#d88a1d" },
    error: { main: "#d14e48" },
    background: {
      default: "#eef4fb",
      paper: "#ffffff"
    }
  },
  shape: { borderRadius: 20 },
  typography: {
    fontFamily: "'Bahnschrift', 'Trebuchet MS', 'Segoe UI', sans-serif",
    h3: { fontWeight: 700, letterSpacing: "-0.04em" },
    h4: { fontWeight: 700, letterSpacing: "-0.03em" },
    h5: { fontWeight: 700, letterSpacing: "-0.02em" },
    h6: { fontWeight: 700, letterSpacing: "-0.02em" },
    button: { textTransform: "none", fontWeight: 700 }
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background:
            "radial-gradient(circle at top left, rgba(31,162,196,0.16), transparent 28%), radial-gradient(circle at 88% 8%, rgba(15,79,191,0.16), transparent 24%), linear-gradient(180deg, #f6faff 0%, #eef4fb 52%, #e4eef8 100%)",
          minHeight: "100vh"
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none"
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: "1px solid rgba(18, 65, 138, 0.08)",
          boxShadow: "0 22px 50px rgba(18, 48, 97, 0.08)"
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999
        },
        containedPrimary: {
          background: "linear-gradient(135deg, #16a4c9 0%, #0f4fbf 100%)",
          boxShadow: "0 18px 34px rgba(15, 79, 191, 0.24)"
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: alpha("#0f4fbf", 0.04),
          color: "#16305c",
          fontWeight: 700
        }
      }
    }
  }
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);
