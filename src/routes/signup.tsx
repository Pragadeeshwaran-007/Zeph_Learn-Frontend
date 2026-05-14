import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/Logo";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Sign up — Zephlearn" }] }),
  component: SignupPage,
});

function SignupPage() {
  const { signup } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return toast.error("Password must be at least 6 characters");
    setBusy(true);
    try {
      const u = await signup(name.trim(), email.trim(), password);
      toast.success(`Welcome, ${u.name}!`);
      nav({ to: "/problems" });
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
        <h1 className="text-2xl font-bold">Create your account</h1>
        <p className="mt-1 text-sm text-muted-foreground">Free forever. Start solving in seconds.</p>

        <label className="mt-6 block text-sm">Name</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-md border border-border bg-input px-3 py-2 outline-none focus:border-primary"
        />

        <label className="mt-4 block text-sm">Email</label>
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
          {busy ? "Creating…" : "Create account"}
        </button>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline">Sign in</Link>
        </p>
      </form>
    </div>
  );
}
