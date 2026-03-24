import React, { useMemo } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { CssBaseline, ThemeProvider, alpha, createTheme } from "@mui/material";
import App from "./App";
import "./styles.css";
import { AuthProvider, useAuth } from "./auth/AuthContext";

function createCargoTheme(primaryColor = "#0f4fbf", secondaryColor = "#16a4c9", accentColor = "#0b1d3a") {
  return createTheme({
    palette: {
      mode: "light",
      primary: { main: primaryColor },
      secondary: { main: secondaryColor },
      success: { main: "#179d66" },
      warning: { main: "#d88a1d" },
      error: { main: "#d14e48" },
      background: {
        default: "#eef3f8",
        paper: "#ffffff"
      }
    },
    shape: { borderRadius: 4 },
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
            background: `linear-gradient(180deg, #f7fafe 0%, ${alpha(primaryColor, 0.045)} 100%)`,
            minHeight: "100vh",
            color: accentColor
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
            border: `1px solid ${alpha(primaryColor, 0.08)}`,
            boxShadow: `0 10px 24px ${alpha(accentColor, 0.06)}`
          }
        }
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 10
          },
          containedPrimary: {
            background: `linear-gradient(135deg, ${secondaryColor} 0%, ${primaryColor} 100%)`,
            boxShadow: `0 10px 22px ${alpha(primaryColor, 0.18)}`
          }
        }
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            height: 30,
            fontWeight: 600
          }
        }
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 10
          }
        }
      },
      MuiTableCell: {
        styleOverrides: {
          head: {
            backgroundColor: alpha(primaryColor, 0.04),
            color: accentColor,
            fontWeight: 700
          }
        }
      }
    }
  });
}

function ThemedApp() {
  const { session } = useAuth();
  const theme = useMemo(
    () =>
      createCargoTheme(
        session?.tenant.branding.primaryColor,
        session?.tenant.branding.secondaryColor,
        session?.tenant.branding.accentColor
      ),
    [session]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <ThemedApp />
    </AuthProvider>
  </React.StrictMode>
);
