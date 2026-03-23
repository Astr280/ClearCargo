import type { AuthSession, LoginResponse } from "@shared/index";
import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";
import { fetchJson, requestJson } from "../lib/api";
import { clearStoredSession, loadStoredSession, saveStoredSession } from "./storage";

interface DemoAccount {
  email: string;
  name: string;
  role: string;
  tenantName: string;
}

interface AuthContextValue {
  session: AuthSession | null;
  loading: boolean;
  demoAccounts: DemoAccount[];
  login: (email: string, password: string, mfaCode?: string) => Promise<LoginResponse>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<AuthSession | null>(() => loadStoredSession());
  const [loading, setLoading] = useState(true);
  const [demoAccounts, setDemoAccounts] = useState<DemoAccount[]>([]);

  useEffect(() => {
    let cancelled = false;

    fetchJson<{ users: DemoAccount[] }>("/auth/demo-users")
      .then((result) => {
        if (!cancelled) {
          setDemoAccounts(result.users);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setDemoAccounts([]);
        }
      });

    if (!session?.token) {
      setLoading(false);
      return () => {
        cancelled = true;
      };
    }

    fetchJson<{ session: AuthSession | null }>("/auth/session", session.token)
      .then((result) => {
        if (cancelled) {
          return;
        }

        if (result.session) {
          setSession(result.session);
          saveStoredSession(result.session);
        } else {
          setSession(null);
          clearStoredSession();
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSession(null);
          clearStoredSession();
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function handleUnauthorized() {
      setSession(null);
      clearStoredSession();
    }

    window.addEventListener("cargoclear:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("cargoclear:unauthorized", handleUnauthorized);
  }, []);

  async function login(email: string, password: string, mfaCode?: string) {
    const result = await requestJson<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password, mfaCode })
    });

    if (result.session) {
      setSession(result.session);
      saveStoredSession(result.session);
    }

    return result;
  }

  async function logout() {
    if (session?.token) {
      try {
        await requestJson("/auth/logout", { method: "POST" }, session.token);
      } catch {
        // Best effort only, local session still needs to clear.
      }
    }

    setSession(null);
    clearStoredSession();
  }

  const value = useMemo(
    () => ({
      session,
      loading,
      demoAccounts,
      login,
      logout
    }),
    [demoAccounts, loading, session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
