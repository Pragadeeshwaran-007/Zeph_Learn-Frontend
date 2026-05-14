import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/Logo";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Login — Zephlearn" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("user@zephlearn.com");
  const [password, setPassword] = useState("user123");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const u = await login(email, password);
      toast.success(`Welcome back, ${u.name}`);
      nav({ to: u.role === "admin" ? "/admin" : "/problems" });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="mb-8"><Logo size="lg" /></div>
      <form onSubmit={submit} className="w-full max-w-md rounded-2xl border border-border bg-card p-8 glow-primary">
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">Sign in to continue your practice.</p>

        <label className="mt-6 block text-sm">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-md border border-border bg-input px-3 py-2 outline-none focus:border-primary"
        />

        <label className="mt-4 block text-sm">Password</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-md border border-border bg-input px-3 py-2 outline-none focus:border-primary"
        />

        <button
          disabled={busy}
          className="mt-6 w-full rounded-md gradient-brand py-2.5 font-medium text-white disabled:opacity-60"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          New here?{" "}
          <Link to="/signup" className="text-primary hover:underline">Create an account</Link>
        </p>

        <div className="mt-6 rounded-md border border-border/50 bg-secondary/40 p-3 text-xs text-muted-foreground">
          <div><b className="text-foreground">Admin:</b> admin@zephlearn.com / admin123</div>
          <div><b className="text-foreground">User:</b> user@zephlearn.com / user123</div>
        </div>
      </form>
    </div>
  );
}
