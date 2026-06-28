import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { problemService } from "@/services/problemService";
import { authService } from "@/services/authService";
import { submissionService } from "@/services/submissionService";
import { ListChecks, Users, Send } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: AdminHome,
});

function AdminHome() {
  const [stats, setStats] = useState({ problems: 0, users: 0, submissions: 0 });
  useEffect(() => {
    let cancelled = false;
    Promise.all([
      problemService.list().catch(() => []),
      authService.listUsers().catch(() => []),
    ]).then(([problems, users]) => {
      if (!cancelled) setStats({ problems: problems.length, users: users.length, submissions: 0 }); // Submissions not fetchable globally in current backend
    });
    return () => { cancelled = true; };
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">Overview of your platform.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card
          icon={<ListChecks className="text-primary" />}
          label="Total Problems"
          value={stats.problems}
        />
        <Card icon={<Users className="text-accent" />} label="Total Users" value={stats.users} />
        <Card
          icon={<Send className="text-success" />}
          label="Total Submissions"
          value={stats.submissions}
        />
      </div>
    </div>
  );
}

function Card({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5 border-l-4 border-l-primary">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
        {icon}
      </div>
      <div className="mt-3 text-3xl font-bold text-foreground">{value}</div>
    </div>
  );
}
