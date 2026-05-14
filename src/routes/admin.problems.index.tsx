import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { problemService, type Problem } from "@/services/problemService";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import { Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/problems/")({
  component: ManageProblems,
});

function ManageProblems() {
  const [list, setList] = useState<Problem[]>([]);
  useEffect(() => setList(problemService.list()), []);

  const onDelete = (id: string) => {
    if (!confirm("Delete this problem?")) return;
    problemService.remove(id);
    setList(problemService.list());
    toast.success("Problem deleted");
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Problems</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your problem set.</p>
        </div>
        <Link
          to="/admin/problems/new"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-black hover:opacity-90"
        >
          <Plus size={16} /> Add Problem
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-secondary/40 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">Title</th>
              <th className="px-4 py-3 text-left">Difficulty</th>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.id} className="border-t border-border hover:bg-secondary/30">
                <td className="px-4 py-3 font-medium">{p.title}</td>
                <td className="px-4 py-3"><DifficultyBadge difficulty={p.difficulty} /></td>
                <td className="px-4 py-3 text-muted-foreground">{p.category}</td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex gap-1">
                    <Link
                      to="/admin/problems/$id"
                      params={{ id: p.id }}
                      title="Edit"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-primary"
                    >
                      <Pencil size={14} />
                    </Link>
                    <button
                      onClick={() => onDelete(p.id)}
                      title="Delete"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
