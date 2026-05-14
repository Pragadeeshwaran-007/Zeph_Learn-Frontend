import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "./Logo";
import { LogOut, Bell, Trophy, Flame } from "lucide-react";
import { authService } from "@/services/authService";
import { useMemo } from "react";

function deriveStreak(id: string) {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return (h % 30) + 1;
}

export function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  const rank = useMemo(() => {
    if (!user) return 0;
    const all = authService.listUsers();
    const sorted = [...all].sort((a, b) => b.solvedProblems.length - a.solvedProblems.length);
    return sorted.findIndex((u) => u.id === user.id) + 1;
  }, [user]);

  const streak = user ? deriveStreak(user.id) : 0;

  const onLogout = () => {
    logout();
    nav({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-[#1a1a1a]">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Logo />
          {user && (
            <nav className="hidden md:flex items-center gap-5 text-sm">
              <Link
                to="/problems"
                className="text-muted-foreground hover:text-foreground transition"
                activeProps={{ className: "text-foreground" }}
              >
                Problems
              </Link>
              {user.role === "admin" && (
                <Link
                  to="/admin"
                  className="text-muted-foreground hover:text-foreground transition"
                  activeProps={{ className: "text-foreground" }}
                >
                  Admin
                </Link>
              )}
            </nav>
          )}
        </div>

        {user && (
          <div className="hidden md:flex items-center gap-2 rounded-md bg-secondary/60 px-3 py-1.5 text-xs">
            <Flame size={14} className="text-primary" />
            <span className="font-semibold text-foreground">{streak}</span>
            <span className="text-muted-foreground">day streak</span>
          </div>
        )}

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <button
                aria-label="Notifications"
                className="relative inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition"
              >
                <Bell size={16} />
                <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
              </button>
              <div
                className="hidden sm:inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-1 text-xs"
                title="Global rank"
              >
                <Trophy size={12} className="text-primary" />
                <span className="text-muted-foreground">Rank</span>
                <span className="font-semibold text-foreground">#{rank || "—"}</span>
              </div>
              <Link
                to="/profile"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-[#ff7a00] text-xs font-bold text-black hover:opacity-90"
                title={user.name}
              >
                {user.name.charAt(0).toUpperCase()}
              </Link>
              <button
                onClick={onLogout}
                aria-label="Logout"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-destructive transition"
              >
                <LogOut size={15} />
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-md px-3 py-1.5 text-sm text-foreground hover:text-primary"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-black hover:opacity-90"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
