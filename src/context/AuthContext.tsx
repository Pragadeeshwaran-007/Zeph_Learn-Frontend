import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { authService, type PublicUser } from "@/services/authService";

interface AuthCtx {
  user: PublicUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<PublicUser>;
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

  return (
    <Ctx.Provider
      value={{
        user,
        loading,
        login: async (e, p) => {
          const { user } = await authService.login(e, p);
          setUser(user);
          return user;
        },
        signup: async (n, e, p) => {
          const { user } = await authService.signup(n, e, p);
          setUser(user);
          return user;
        },
        logout: () => {
          authService.logout();
          setUser(null);
        },
        refresh: () => {
          const cur = authService.current();
          if (!cur) return;
          authService
            .fetchProfile(cur.id)
            .then((u) => setUser(u ?? cur))
            .catch(() => setUser(cur));
        },
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
