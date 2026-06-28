import { createFileRoute, useParams, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import { CodeEditor } from "@/components/CodeEditor";
import { problemService, type Problem } from "@/services/problemService";
import { judge0Service, verdictFromStatusId } from "@/services/judge0Service";
import { submissionService } from "@/services/submissionService";
import { authService } from "@/services/authService";
import { useAuth } from "@/context/AuthContext";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { getLanguage } from "@/utils/languageMap";
import { Play, Send, ArrowLeft, Loader2, CheckCircle2, XCircle, X } from "lucide-react";
import { toast } from "sonner";
import { tagsFor } from "@/utils/problemMeta";

export const Route = createFileRoute("/problems/$id")({
  component: ProblemSolver,
});

type Tab = "Description" | "Submissions" | "Discussion";

function ProblemSolver() {
  const { id } = useParams({ from: "/problems/$id" });
  const { user, loading } = useRequireAuth();
  const { refresh } = useAuth();
  const [problem, setProblem] = useState<Problem | undefined>();
  const [languageId, setLanguageId] = useState<number>(71);
  const [code, setCode] = useState<string>("");
  const [tab, setTab] = useState<Tab>("Description");
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  const [output, setOutput] = useState<{
    verdict: string;
    stdout?: string | null;
    stderr?: string | null;
    time?: string | null;
    memory?: number | null;
    cases?: { idx: number; pass: boolean; expected: string; got: string; verdict: string }[];
  } | null>(null);

  useEffect(() => {
    problemService.get(id).then((p) => setProblem(p));
  }, [id]);

  useEffect(() => {
    setCode(getLanguage(languageId).boilerplate);
  }, [languageId]);

  const [submissions, setSubmissions] = useState<any[]>([]);

  useEffect(() => {
    if (user && problem) {
      submissionService.list(user.id).then((all) => {
        setSubmissions(all.filter((s) => s.problemId === problem.id));
      });
    }
  }, [user, problem, output]);

  if (loading || !user) return null;
  if (!problem)
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="mx-auto max-w-3xl px-4 py-20 text-center">
          <h1 className="text-2xl font-bold">Problem not found</h1>
          <Link to="/problems" className="mt-4 inline-block text-primary hover:underline">
            Back to problems
          </Link>
        </div>
      </div>
    );

  const onRun = async () => {
    setRunning(true);
    setOutput(null);
    setShowOutput(true);
    try {
      const cases = problem.sampleTestCases;
      const results: NonNullable<typeof output>["cases"] = [];
      let allPass = true;
      let lastTime = "";
      let lastMem = 0;
      for (let i = 0; i < cases.length; i++) {
        const t = cases[i];
        const r = await judge0Service.submit({
          source_code: code,
          language_id: languageId,
          stdin: t.input,
          expected_output: t.expectedOutput,
        });
        const got = (r.stdout ?? "").trim();
        const exp = t.expectedOutput.trim();
        const pass = r.status.id === 3 || got === exp;
        if (!pass) allPass = false;
        lastTime = r.time ?? lastTime;
        lastMem = r.memory ?? lastMem;
        results.push({
          idx: i + 1,
          pass,
          expected: exp,
          got,
          verdict: verdictFromStatusId(r.status.id),
        });
        // Stop early on first compile/runtime error
        if (r.stderr || r.compile_output) {
          setOutput({
            verdict: verdictFromStatusId(r.status.id),
            stdout: r.stdout,
            stderr: r.stderr ?? r.compile_output,
            time: r.time,
            memory: r.memory,
            cases: results,
          });
          return;
        }
      }
      setOutput({
        verdict: allPass ? "Accepted" : "Wrong Answer",
        cases: results,
        time: lastTime,
        memory: lastMem,
      });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setRunning(false);
    }
  };

  const onSubmit = async () => {
    setSubmitting(true);
    setOutput(null);
    setShowOutput(true);
    try {
      const languageStr = getLanguage(languageId).monaco;
      const res = await submissionService.submit(problem.id, code, languageStr);

      const pass = res.verdict === "Accepted";
      
      setOutput({
        verdict: res.verdict,
        time: res.executionTime ?? "",
        memory: res.memory ? Number(res.memory) : 0,
        cases: res.results ? res.results.map((r, i) => ({
          idx: i + 1,
          pass: r.passed,
          expected: r.expectedOutput,
          got: r.actualOutput,
          verdict: r.passed ? "Passed" : "Wrong Answer"
        })) : []
      });

      if (pass) {
        toast.success(`Accepted (${res.passedCount}/${res.totalCount} cases passed)`);
        authService.markSolved(user.id, problem.id);
        refresh();
      } else {
        toast.error(`${res.verdict} (${res.passedCount}/${res.totalCount} cases passed)`);
      }
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const tags = tagsFor(problem.category);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex-1 mx-auto w-full max-w-[1500px] px-3 sm:px-4 py-3">
        <Link to="/problems" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-2">
          <ArrowLeft size={12} /> Problem List
        </Link>

        <div className="grid gap-3 lg:grid-cols-[2fr_3fr] h-[calc(100vh-110px)]">
          {/* Left panel — 40% */}
          <div className="rounded-lg border border-border bg-card flex flex-col overflow-hidden">
            <div className="flex border-b border-border bg-secondary/40">
              {(["Description", "Submissions", "Discussion"] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-2.5 text-xs font-medium transition border-b-2 -mb-px ${
                    tab === t
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {tab === "Description" && (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-xl font-semibold">{problem.title}</h1>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <DifficultyBadge difficulty={problem.difficulty} />
                    {tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-muted-foreground"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="mt-5 text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                    {problem.description}
                  </div>

                  {problem.sampleTestCases.map((t, i) => (
                    <div key={i} className="mt-5">
                      <h3 className="text-sm font-semibold">Example {i + 1}:</h3>
                      <div className="mt-2 rounded-md bg-[#0f0f0f] border border-border p-3 font-mono text-xs">
                        <div className="text-muted-foreground">Input:</div>
                        <pre className="whitespace-pre-wrap text-foreground">{t.input}</pre>
                        <div className="mt-2 text-muted-foreground">Output:</div>
                        <pre className="whitespace-pre-wrap text-foreground">{t.expectedOutput}</pre>
                      </div>
                    </div>
                  ))}

                  <Section title="Input Format">{problem.inputFormat}</Section>
                  <Section title="Output Format">{problem.outputFormat}</Section>
                  <Section title="Constraints">{problem.constraints}</Section>
                </>
              )}

              {tab === "Submissions" && (
                <div className="space-y-2">
                  {submissions.length === 0 && (
                    <p className="text-sm text-muted-foreground">No submissions yet.</p>
                  )}
                  {submissions.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between rounded-md border border-border bg-secondary/30 px-3 py-2 text-sm"
                    >
                      <span
                        className={`font-medium ${
                          s.verdict === "Accepted" ? "text-success" : "text-destructive"
                        }`}
                      >
                        {s.verdict}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {s.language} · {new Date(s.submittedAt).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {tab === "Discussion" && (
                <div className="text-sm text-muted-foreground">
                  Discussion threads will appear here. Be respectful — no spoilers in titles.
                </div>
              )}
            </div>
          </div>

          {/* Right panel — 60% */}
          <div className="flex flex-col gap-3 min-h-0">
            <div className="flex-1 min-h-0">
              <CodeEditor value={code} onChange={setCode} languageId={languageId} onLanguageChange={setLanguageId} />
            </div>

            {showOutput && (
              <div className="rounded-lg border border-border bg-card overflow-hidden max-h-[40vh] flex flex-col">
                <div className="flex items-center justify-between border-b border-border bg-secondary/40 px-3 py-2">
                  <span className="text-xs font-semibold uppercase text-muted-foreground">
                    {output?.cases ? "Test Result" : "Run Result"}
                  </span>
                  <button
                    onClick={() => setShowOutput(false)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X size={14} />
                  </button>
                </div>
                <div className="flex-1 overflow-auto p-3 text-xs">
                  {(running || submitting) && !output && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 size={14} className="animate-spin" /> Judging…
                    </div>
                  )}

                  {output && (
                    <>
                      <div
                        className={`rounded-md px-3 py-2 mb-3 ${
                          output.verdict === "Accepted"
                            ? "bg-success/10 text-success"
                            : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold inline-flex items-center gap-2">
                            {output.verdict === "Accepted" ? (
                              <CheckCircle2 size={16} />
                            ) : (
                              <XCircle size={16} />
                            )}
                            {output.verdict}
                          </span>
                          <span className="text-[11px] opacity-80">
                            {output.time ? `Runtime: ${output.time}s` : ""}
                            {output.memory ? ` · Memory: ${(output.memory / 1024).toFixed(1)} MB` : ""}
                          </span>
                        </div>
                      </div>

                      {output.stdout != null && (
                        <div className="mb-2">
                          <div className="text-muted-foreground">stdout</div>
                          <pre className="mt-1 whitespace-pre-wrap rounded bg-[#0f0f0f] p-2 text-foreground">
                            {output.stdout || "(empty)"}
                          </pre>
                        </div>
                      )}
                      {output.stderr && (
                        <div className="mb-2">
                          <div className="text-destructive">stderr</div>
                          <pre className="mt-1 whitespace-pre-wrap rounded bg-[#0f0f0f] p-2 text-destructive/90">
                            {output.stderr}
                          </pre>
                        </div>
                      )}
                      {output.cases && (
                        <div className="space-y-2">
                          {output.cases.map((c) => (
                            <div key={c.idx} className="rounded border border-border p-2">
                              <div className="flex items-center justify-between">
                                <span className="font-medium">Test #{c.idx}</span>
                                {c.pass ? (
                                  <span className="inline-flex items-center gap-1 text-success">
                                    <CheckCircle2 size={14} /> Passed
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-destructive">
                                    <XCircle size={14} /> {c.verdict}
                                  </span>
                                )}
                              </div>
                              {!c.pass && (
                                <div className="mt-2 grid gap-1 text-muted-foreground">
                                  <div>
                                    Expected:{" "}
                                    <code className="text-foreground">{c.expected.slice(0, 200)}</code>
                                  </div>
                                  <div>
                                    Got:{" "}
                                    <code className="text-foreground">
                                      {c.got.slice(0, 200) || "(empty)"}
                                    </code>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={onRun}
                disabled={running || submitting}
                className="inline-flex items-center gap-2 rounded-md bg-secondary px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary/70 disabled:opacity-50"
              >
                {running ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
                Run
              </button>
              <button
                onClick={onSubmit}
                disabled={running || submitting}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-black hover:opacity-90 disabled:opacity-50"
              >
                {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <h3 className="text-sm font-semibold">{title}</h3>
      <pre className="mt-1 whitespace-pre-wrap text-sm text-foreground/80 font-sans">{children}</pre>
    </div>
  );
}
