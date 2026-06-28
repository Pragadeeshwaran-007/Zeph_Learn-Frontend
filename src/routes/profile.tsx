import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { problemService, type Problem } from "@/services/problemService";
import { submissionService } from "@/services/submissionService";
import { useEffect, useMemo, useState } from "react";
import { CircularProgress } from "@/components/CircularProgress";
import { Flame, Trophy } from "lucide-react";
import { getLanguage } from "@/utils/languageMap";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — Zephlearn" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, loading, refresh } = useRequireAuth();
  const [problems, setProblems] = useState<Problem[] | null>(null);

  useEffect(() => {
    problemService
      .list()
      .then((data) => setProblems(data))
      .catch(() => setProblems([]));
  }, []);

  useEffect(() => {
    if (user) refresh();
  }, [user?.id, refresh]);

  const problemById = useMemo(() => {
    const map = new Map<string, Problem>();
    for (const p of problems ?? []) map.set(p.id, p);
    return map;
  }, [problems]);

  const data = useMemo(() => {
    if (!user || !problems) return null;
    const solvedIds = Array.isArray(user.solvedProblems) ? user.solvedProblems : [];
    const all = problems;
    const solved = all.filter((p) => solvedIds.includes(p.id));
    const subs = submissionService
      .list()
      .filter((s) => s.userId === user.id)
      .slice(0, 8);
    return {
      total: all.length,
      solved,
      easyTotal: all.filter((p) => p.difficulty === "Easy").length,
      mediumTotal: all.filter((p) => p.difficulty === "Medium").length,
      hardTotal: all.filter((p) => p.difficulty === "Hard").length,
      easy: solved.filter((p) => p.difficulty === "Easy").length,
      medium: solved.filter((p) => p.difficulty === "Medium").length,
      hard: solved.filter((p) => p.difficulty === "Hard").length,
      subs,
      rank: user.rank ?? 0,
    };
  }, [user, problems]);

  if (loading || !user || !data) return null;

  const streak = user.streak ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-6 grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* Profile card */}
        <aside className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-[#ff7a00] text-2xl font-bold text-black">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-semibold truncate">{user.name}</h1>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                <div className="mt-1 inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-primary">
                  {user.role}
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-md bg-secondary/50 p-3">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Trophy size={12} className="text-primary" /> Rank
                </div>
                <div className="mt-0.5 text-lg font-bold">#{data.rank || "—"}</div>
              </div>
              <div className="rounded-md bg-secondary/50 p-3">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Flame size={12} className="text-primary" /> Streak
                </div>
                <div className="mt-0.5 text-lg font-bold">
                  {streak}
                  <span className="ml-1 text-xs font-normal text-muted-foreground">days</span>
                </div>
              </div>
            </div>
          </div>

          {/* Solved progress */}
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center gap-5">
              <CircularProgress
                value={data.solved.length}
                total={data.total}
                size={120}
                stroke={8}
                color="var(--primary)"
                label="Solved"
              />
              <div className="flex-1 space-y-3">
                <ProgressBar
                  label="Easy"
                  value={data.easy}
                  total={data.easyTotal}
                  color="var(--easy)"
                />
                <ProgressBar
                  label="Medium"
                  value={data.medium}
                  total={data.mediumTotal}
                  color="var(--medium)"
                />
                <ProgressBar
                  label="Hard"
                  value={data.hard}
                  total={data.hardTotal}
                  color="var(--hard)"
                />
              </div>
            </div>
          </div>
        </aside>

        {/* Recent submissions */}
        <section>
          <h2 className="text-base font-semibold mb-3">Recent Submissions</h2>
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            {data.subs.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No submissions yet.{" "}
                <Link to="/problems" className="text-primary hover:underline">
                  Start practicing
                </Link>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-secondary/60 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2.5 text-left">Problem</th>
                    <th className="px-4 py-2.5 text-left">Status</th>
                    <th className="px-4 py-2.5 text-left">Language</th>
                    <th className="px-4 py-2.5 text-right">When</th>
                  </tr>
                </thead>
                <tbody>
                  {data.subs.map((s) => {
                    const p = problemById.get(s.problemId);
                    return (
                      <tr key={s.id} className="border-t border-border">
                        <td className="px-4 py-2.5">
                          {p ? (
                            <Link
                              to="/problems/$id"
                              params={{ id: p.id }}
                              className="font-medium hover:text-primary"
                            >
                              {p.title}
                            </Link>
                          ) : (
                            <span className="text-muted-foreground">Unknown</span>
                          )}
                        </td>
                        <td
                          className={`px-4 py-2.5 font-medium ${
                            s.verdict === "Accepted" ? "text-success" : "text-destructive"
                          }`}
                        >
                          {s.verdict}
                        </td>
                        <td className="px-4 py-2.5 text-muted-foreground">
                          {getLanguage(s.language).name}
                        </td>
                        <td className="px-4 py-2.5 text-right text-xs text-muted-foreground">
                          {new Date(s.submittedAt).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function ProgressBar({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span style={{ color }} className="font-medium">
          {label}
        </span>
        <span className="text-muted-foreground">
          {value} / {total}
        </span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-border">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}
