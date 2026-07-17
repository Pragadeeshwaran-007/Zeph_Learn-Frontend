import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { authService, type PublicUser } from "@/services/authService";

interface AuthCtx {
  user: PublicUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<PublicUser>;
  loginWithGoogle: (idToken: string) => Promise<PublicUser>;
  signup: (name: string, email: string, password: string) => Promise<PublicUser>;
  logout: () => void;
  refresh: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cur = authService.current();
    if (!cur) {
      setLoading(false);
      return;
    }
    authService
      .fetchProfile(cur.id)
      .then((u) => setUser(u ?? cur))
      .catch(() => setUser(cur))
      .finally(() => setLoading(false));
  }, []);

  const refresh = useCallback(() => {
    const cur = authService.current();
    if (!cur) {
      setUser(null);
      return;
    }
    authService
      .fetchProfile(cur.id)
      .then((u) => setUser(u ?? cur))
      .catch(() => setUser(cur));
  }, []);

  return (
    <Ctx.Provider
      value={{
        user,
        loading,
        login: async (e, p) => {
          const { user } = await authService.login(e, p);
          const synced = (await authService.fetchProfile(user.id)) ?? user;
          setUser(synced);
          return synced;
        },
        loginWithGoogle: async (idToken) => {
          const { user } = await authService.loginWithGoogle(idToken);
          const synced = (await authService.fetchProfile(user.id)) ?? user;
          setUser(synced);
          return synced;
        },
        signup: async (n, e, p) => {
          const { user } = await authService.signup(n, e, p);
          const synced = (await authService.fetchProfile(user.id)) ?? user;
          setUser(synced);
          return synced;
        },
        logout: () => {
          authService.logout();
          setUser(null);
        },
        refresh,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
