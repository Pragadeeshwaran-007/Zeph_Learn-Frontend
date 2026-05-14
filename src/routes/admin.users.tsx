import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { authService, type PublicUser } from "@/services/authService";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/users")({
  component: ManageUsers,
});

function ManageUsers() {
  const [users, setUsers] = useState<PublicUser[]>([]);
  useEffect(() => setUsers(authService.listUsers()), []);

  const onDelete = (id: string) => {
    if (!confirm("Delete this user?")) return;
    authService.deleteUser(id);
    setUsers(authService.listUsers());
    toast.success("User deleted");
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">Users</h1>
      <p className="mt-1 text-sm text-muted-foreground">Manage platform users.</p>
      <div className="mt-6 overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-secondary/40 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-left">Joined</th>
              <th className="px-4 py-3 text-center">Solved</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-border hover:bg-secondary/30">
                <td className="px-4 py-3 font-medium">{u.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full border px-2 py-0.5 text-xs ${u.role === "admin" ? "border-primary/40 text-primary" : "border-border text-muted-foreground"}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-center">{u.solvedProblems.length}</td>
                <td className="px-4 py-3 text-right">
                  {u.role !== "admin" && (
                    <button
                      onClick={() => onDelete(u.id)}
                      className="inline-flex items-center gap-1 rounded-md border border-destructive/40 px-2 py-1 text-xs text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
