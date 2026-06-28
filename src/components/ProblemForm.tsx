import { useState } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import type { Problem, TestCase, Difficulty } from "@/services/problemService";
import { problemService } from "@/services/problemService";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2, Loader2 } from "lucide-react";

const empty: Problem = {
  id: "",
  title: "",
  difficulty: "Easy",
  category: "Array",
  description: "",
  inputFormat: "",
  outputFormat: "",
  constraints: "",
  sampleTestCases: [{ input: "", expectedOutput: "" }],
  hiddenTestCases: [{ input: "", expectedOutput: "" }],
};

export function ProblemForm({ initial, mode }: { initial?: Problem; mode: "new" | "edit" }) {
  const nav = useNavigate();
  const [p, setP] = useState<Problem>(initial ?? empty);

  const update = <K extends keyof Problem>(k: K, v: Problem[K]) => setP((s) => ({ ...s, [k]: v }));

  const updateTC = (
    field: "sampleTestCases" | "hiddenTestCases",
    idx: number,
    key: keyof TestCase,
    value: string
  ) => {
    setP((s) => {
      const arr = [...s[field]];
      arr[idx] = { ...arr[idx], [key]: value };
      return { ...s, [field]: arr };
    });
  };

  const addTC = (field: "sampleTestCases" | "hiddenTestCases") =>
    setP((s) => ({ ...s, [field]: [...s[field], { input: "", expectedOutput: "" }] }));

  const removeTC = (field: "sampleTestCases" | "hiddenTestCases", idx: number) =>
    setP((s) => ({ ...s, [field]: s[field].filter((_, i) => i !== idx) }));

  const [saving, setSaving] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!p.title.trim()) return toast.error("Title is required");
    setSaving(true);
    try {
      await problemService.save(p);
      toast.success(mode === "new" ? "Problem created" : "Problem updated");
      nav({ to: "/admin/problems" });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <Link to="/admin/problems" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft size={14} /> Back
        </Link>
        <h1 className="mt-2 text-2xl font-bold">{mode === "new" ? "Add" : "Edit"} Problem</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Title" className="sm:col-span-2">
          <input className={inp} value={p.title} onChange={(e) => update("title", e.target.value)} required />
        </Field>
        <Field label="Category">
          <input className={inp} value={p.category} onChange={(e) => update("category", e.target.value)} />
        </Field>
        <Field label="Difficulty">
          <select className={inp} value={p.difficulty} onChange={(e) => update("difficulty", e.target.value as Difficulty)}>
            <option>Easy</option><option>Medium</option><option>Hard</option>
          </select>
        </Field>
      </div>

      <Field label="Description">
        <textarea rows={4} className={inp} value={p.description} onChange={(e) => update("description", e.target.value)} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Input Format">
          <textarea rows={3} className={inp} value={p.inputFormat} onChange={(e) => update("inputFormat", e.target.value)} />
        </Field>
        <Field label="Output Format">
          <textarea rows={3} className={inp} value={p.outputFormat} onChange={(e) => update("outputFormat", e.target.value)} />
        </Field>
      </div>
      <Field label="Constraints">
        <textarea rows={3} className={inp} value={p.constraints} onChange={(e) => update("constraints", e.target.value)} />
      </Field>

      <TCEditor title="Sample Test Cases (visible to users)" cases={p.sampleTestCases}
        onChange={(i, k, v) => updateTC("sampleTestCases", i, k, v)}
        onAdd={() => addTC("sampleTestCases")}
        onRemove={(i) => removeTC("sampleTestCases", i)}
      />
      <TCEditor title="Hidden Test Cases (used for judging)" cases={p.hiddenTestCases}
        onChange={(i, k, v) => updateTC("hiddenTestCases", i, k, v)}
        onAdd={() => addTC("hiddenTestCases")}
        onRemove={(i) => removeTC("hiddenTestCases", i)}
      />

      <div className="flex justify-end gap-2">
        <Link to="/admin/problems" className="rounded-md border border-border px-4 py-2 text-sm">Cancel</Link>
        <button disabled={saving} className="inline-flex items-center gap-2 rounded-md gradient-brand px-5 py-2 text-sm font-semibold text-white disabled:opacity-60">
          {saving ? <Loader2 size={14} className="animate-spin" /> : null}
          {mode === "new" ? "Create" : "Update"}
        </button>
      </div>
    </form>
  );
}

const inp = "w-full rounded-md border border-border bg-input px-3 py-2 text-sm outline-none focus:border-primary";

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function TCEditor({
  title, cases, onChange, onAdd, onRemove,
}: {
  title: string;
  cases: TestCase[];
  onChange: (i: number, k: keyof TestCase, v: string) => void;
  onAdd: () => void;
  onRemove: (i: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{title}</h3>
        <button type="button" onClick={onAdd} className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs hover:border-primary/50">
          <Plus size={12} /> Add
        </button>
      </div>
      <div className="mt-2 space-y-3">
        {cases.map((t, i) => (
          <div key={i} className="rounded-md border border-border bg-card p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Case #{i + 1}</span>
              {cases.length > 1 && (
                <button type="button" onClick={() => onRemove(i)} className="text-xs text-destructive hover:underline inline-flex items-center gap-1">
                  <Trash2 size={12} /> Remove
                </button>
              )}
            </div>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <textarea rows={3} placeholder="Input" className={`${inp} font-mono text-xs`} value={t.input} onChange={(e) => onChange(i, "input", e.target.value)} />
              <textarea rows={3} placeholder="Expected Output" className={`${inp} font-mono text-xs`} value={t.expectedOutput} onChange={(e) => onChange(i, "expectedOutput", e.target.value)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
