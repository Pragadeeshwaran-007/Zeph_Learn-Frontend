import { createFileRoute, useParams, Link } from "@tanstack/react-router";
import { ProblemForm } from "@/components/ProblemForm";
import { problemService } from "@/services/problemService";

export const Route = createFileRoute("/admin/problems/$id")({
  component: EditProblem,
});

function EditProblem() {
  const { id } = useParams({ from: "/admin/problems/$id" });
  const p = problemService.get(id);
  if (!p)
    return (
      <div>
        <p>Problem not found.</p>
        <Link to="/admin/problems" className="text-primary hover:underline">Back</Link>
      </div>
    );
  return <ProblemForm mode="edit" initial={p} />;
}
