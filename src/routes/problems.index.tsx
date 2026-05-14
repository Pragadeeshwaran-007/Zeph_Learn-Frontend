import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import { CircularProgress } from "@/components/CircularProgress";
import { problemService, type Problem, type Difficulty } from "@/services/problemService";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { CheckCircle2, Search } from "lucide-react";
import { acceptanceFor } from "@/utils/problemMeta";

export const Route = createFileRoute("/problems/")({
  head: () => ({ meta: [{ title: "Problems — Zephlearn" }] }),
  component: ProblemsList,
});

type Status = "All" | "Solved" | "Todo";

function ProblemsList() {
  const { user, loading } = useRequireAuth();
  const [problems, setProblems] = useState<Problem[] | null>(null);
  const [search, setSearch] = useState("");
  const [diffSel, setDiffSel] = useState<Record<Difficulty, boolean>>({ Easy: false, Medium: false, Hard: false });
  const [status, setStatus] = useState<Status>("All");
  const [catSel, setCatSel] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setTimeout(() => setProblems(problemService.list()), 200);
  }, []);

  const solved = useMemo(() => new Set(user?.solvedProblems ?? []), [user]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    (problems ?? []).forEach((p) => set.add(p.category));
    return Array.from(set).sort();
  }, [problems]);

  const filtered = useMemo(() => {
    if (!problems) return [];
    const diffActive = Object.values(diffSel).some(Boolean);
    const catActive = Object.values(catSel).some(Boolean);
    return problems.filter((p) => {
      if (diffActive && !diffSel[p.difficulty]) return false;
      if (catActive && !catSel[p.category]) return false;
      if (status === "Solved" && !solved.has(p.id)) return false;
      if (status === "Todo" && solved.has(p.id)) return false;
      if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [problems, diffSel, catSel, status, search, solved]);

  const stats = useMemo(() => {
    const all = problems ?? [];
    const s = all.filter((p) => solved.has(p.id));
    return {
      total: all.length,
      solved: s.length,
      easyTotal: all.filter((p) => p.difficulty === "Easy").length,
      mediumTotal: all.filter((p) => p.difficulty === "Medium").length,
      hardTotal: all.filter((p) => p.difficulty === "Hard").length,
      easy: s.filter((p) => p.difficulty === "Easy").length,
      medium: s.filter((p) => p.difficulty === "Medium").length,
      hard: s.filter((p) => p.difficulty === "Hard").length,
    };
  }, [problems, solved]);

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-[1400px] px-4 sm:px-6 py-6">
        {/* Stats bar */}
        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatRing label="Total Solved" value={stats.solved} total={stats.total} color="var(--primary)" />
          <StatRing label="Easy" value={stats.easy} total={stats.easyTotal} color="var(--easy)" />
          <StatRing label="Medium" value={stats.medium} total={stats.mediumTotal} color="var(--medium)" />
          <StatRing label="Hard" value={stats.hard} total={stats.hardTotal} color="var(--hard)" />
        </div>

        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          {/* Sidebar filters */}
          <aside className="rounded-lg border border-border bg-secondary/40 p-4 h-fit">
            <FilterGroup title="Status">
              {(["All", "Solved", "Todo"] as Status[]).map((s) => (
                <label key={s} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    checked={status === s}
                    onChange={() => setStatus(s)}
                    className="accent-[#FFA116]"
                  />
                  <span className="text-foreground/90">{s}</span>
                </label>
              ))}
            </FilterGroup>

            <FilterGroup title="Difficulty">
              {(["Easy", "Medium", "Hard"] as Difficulty[]).map((d) => (
                <label key={d} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={diffSel[d]}
                    onChange={(e) => setDiffSel((p) => ({ ...p, [d]: e.target.checked }))}
                    className="accent-[#FFA116]"
                  />
                  <DifficultyBadge difficulty={d} />
                </label>
              ))}
            </FilterGroup>

            <FilterGroup title="Category">
              <div className="max-h-56 overflow-auto pr-1 space-y-2">
                {categories.map((c) => (
                  <label key={c} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!catSel[c]}
                      onChange={(e) => setCatSel((p) => ({ ...p, [c]: e.target.checked }))}
                      className="accent-[#FFA116]"
                    />
                    <span className="text-foreground/90">{c}</span>
                  </label>
                ))}
              </div>
            </FilterGroup>
          </aside>

          {/* Main */}
          <div>
            <div className="mb-4 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search questions"
                className="w-full rounded-md border border-border bg-secondary/60 pl-9 pr-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>

            <div className="overflow-hidden rounded-lg border border-border bg-card">
              <table className="w-full text-sm">
                <thead className="bg-secondary/60 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-center w-14">Status</th>
                    <th className="px-4 py-3 text-left w-14">#</th>
                    <th className="px-4 py-3 text-left">Title</th>
                    <th className="px-4 py-3 text-right w-32">Acceptance</th>
                    <th className="px-4 py-3 text-left w-28">Difficulty</th>
                  </tr>
                </thead>
                <tbody>
                  {!problems &&
                    Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i} className="border-t border-border">
                        <td colSpan={5} className="p-4">
                          <div className="h-6 animate-pulse rounded bg-secondary/60" />
                        </td>
                      </tr>
                    ))}
                  {problems && filtered.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-muted-foreground">
                        No problems match.
                      </td>
                    </tr>
                  )}
                  {filtered.map((p, i) => {
                    const isSolved = solved.has(p.id);
                    const acc = acceptanceFor(p.id);
                    return (
                      <tr
                        key={p.id}
                        className={`border-t border-border transition ${
                          i % 2 === 0 ? "bg-transparent" : "bg-secondary/20"
                        } hover:bg-secondary/40`}
                      >
                        <td className="px-4 py-3 text-center">
                          {isSolved ? (
                            <CheckCircle2 size={16} className="inline text-success" />
                          ) : (
                            <span className="inline-block h-2 w-2 rounded-full bg-muted-foreground/30" />
                          )}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                        <td className="px-4 py-3">
                          <Link
                            to="/problems/$id"
                            params={{ id: p.id }}
                            className="font-medium text-foreground hover:text-primary"
                          >
                            {p.title}
                          </Link>
                          <span className="ml-2 text-xs text-muted-foreground">{p.category}</span>
                        </td>
                        <td className="px-4 py-3 text-right text-muted-foreground">{acc.toFixed(1)}%</td>
                        <td className="px-4 py-3">
                          <DifficultyBadge difficulty={p.difficulty} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5 last:mb-0">
      <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">{title}</h4>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function StatRing({
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
  return (
    <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-4">
      <CircularProgress value={value} total={total} color={color} />
      <div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="mt-1 text-2xl font-bold text-foreground">
          {value} <span className="text-sm font-normal text-muted-foreground">/ {total}</span>
        </div>
      </div>
    </div>
  );
}
