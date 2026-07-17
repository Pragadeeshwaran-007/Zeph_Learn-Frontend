import { Link } from "@tanstack/react-router";
import { LayoutDashboard, ListChecks, Users, Bell, LogOut } from "lucide-react";
import { Logo } from "./Logo";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "@tanstack/react-router";

export function AdminSidebar() {
  const { logout } = useAuth();
  const nav = useNavigate();

  const itemCls =
    "flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors";
  const activeCls = "bg-secondary text-foreground";

  return (
    <aside className="hidden md:flex md:w-60 md:flex-col border-r border-border bg-card/40 p-4">
      <div className="mb-6 px-1"><Logo /></div>
      <nav className="flex flex-1 flex-col gap-1">
        <Link to="/admin" className={itemCls} activeProps={{ className: `${itemCls} ${activeCls}` }} activeOptions={{ exact: true }}>
          <LayoutDashboard size={16} /> Dashboard
        </Link>
        <Link to="/admin/problems" className={itemCls} activeProps={{ className: `${itemCls} ${activeCls}` }}>
          <ListChecks size={16} /> Problems
        </Link>
        <Link to="/admin/users" className={itemCls} activeProps={{ className: `${itemCls} ${activeCls}` }}>
          <Users size={16} /> Users
        </Link>
        <Link to="/admin/notify" className={itemCls} activeProps={{ className: `${itemCls} ${activeCls}` }}>
          <Bell size={16} /> Notify
        </Link>
        <button
          onClick={() => { logout(); nav({ to: "/" }); }}
          className={`${itemCls} mt-auto text-left hover:text-destructive`}
        >
          <LogOut size={16} /> Logout
        </button>
      </nav>
    </aside>
  );
}
