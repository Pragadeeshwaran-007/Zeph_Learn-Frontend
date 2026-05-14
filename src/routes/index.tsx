import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { ArrowRight, Code2, Trophy, Zap } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Zephlearn — Learn at the speed of thought" },
      { name: "description", content: "Practice coding problems with an integrated editor, instant feedback and curated paths." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(600px circle at 20% 10%, oklch(0.65 0.20 285 / 0.35), transparent 60%), radial-gradient(500px circle at 80% 30%, oklch(0.78 0.16 220 / 0.30), transparent 60%)",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-24 sm:py-32 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary">
            <Zap size={12} fill="currentColor" /> Powered by Judge0
          </span>
          <h1 className="mt-6 text-5xl sm:text-7xl font-extrabold tracking-tight">
            Learn at the <span className="text-gradient">speed of thought</span>.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            A modern coding practice platform with an integrated editor, real test cases and instant verdicts. Sharpen your DSA. Ship faster.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 rounded-md gradient-brand px-6 py-3 text-base font-semibold text-white glow-primary hover:opacity-90"
            >
              Get Started <ArrowRight size={18} />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-md border border-border bg-card/50 px-6 py-3 text-base font-medium hover:border-primary/50"
            >
              I have an account
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 pb-16">
        <div className="grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-border bg-border">
          {[
            { v: "100+", l: "Problems", icon: Code2 },
            { v: "5k+", l: "Users", icon: Trophy },
            { v: "10+", l: "Categories", icon: Zap },
          ].map((s) => (
            <div key={s.l} className="flex flex-col items-center gap-2 bg-card px-4 py-8">
              <s.icon className="text-primary" size={20} />
              <div className="text-3xl sm:text-4xl font-bold text-gradient">{s.v}</div>
              <div className="text-sm text-muted-foreground">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-24">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { t: "Integrated editor", d: "Monaco-powered editor with C++, Java, Python and JavaScript." },
            { t: "Instant verdicts", d: "Run against samples and submit against hidden tests in real time." },
            { t: "Track progress", d: "Solved counts and difficulty breakdowns per profile." },
          ].map((f) => (
            <div key={f.t} className="rounded-xl border border-border bg-card p-6 hover:border-primary/40 transition">
              <h3 className="font-semibold text-lg">{f.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <span>© {new Date().getFullYear()} Zephlearn</span>
          <span>Built for learners who think fast.</span>
        </div>
      </footer>
    </div>
  );
}
