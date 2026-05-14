import { createFileRoute } from "@tanstack/react-router";
import { ProblemForm } from "@/components/ProblemForm";

export const Route = createFileRoute("/admin/problems/new")({
  component: () => <ProblemForm mode="new" />,
});
