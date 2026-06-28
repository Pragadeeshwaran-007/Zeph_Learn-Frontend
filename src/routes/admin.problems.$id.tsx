import { createFileRoute, useParams, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ProblemForm } from "@/components/ProblemForm";
import { problemService, type Problem } from "@/services/problemService";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/problems/$id")({
  component: EditProblem,
});

function EditProblem() {
  const { id } = useParams({ from: "/admin/problems/$id" });
  const [problem, setProblem] = useState<Problem | null | undefined>(undefined);

  useEffect(() => {
    problemService.get(id).then((p) => setProblem(p ?? null));
  }, [id]);

  if (problem === undefined)
    return (
      <div className="flex items-center justify-center gap-2 p-8 text-muted-foreground">
        <Loader2 size={18} className="animate-spin" /> Loading…
      </div>
    );

  if (problem === null)
    return (
      <div>
        <p>Problem not found.</p>
        <Link to="/admin/problems" className="text-primary hover:underline">Back</Link>
      </div>
    );

  return <ProblemForm mode="edit" initial={problem} />;
}
