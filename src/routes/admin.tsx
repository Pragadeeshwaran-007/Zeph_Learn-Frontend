import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AdminSidebar } from "@/components/AdminSidebar";
import { useRequireAuth } from "@/hooks/useRequireAuth";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const { user, loading } = useRequireAuth("admin");
  if (loading || !user) return null;
  return (
    <div className="min-h-screen flex bg-background">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
