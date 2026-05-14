import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/context/AuthContext";

export function useRequireAuth(role?: "admin" | "user") {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  useEffect(() => {
    if (loading) return;
    if (!user) nav({ to: "/login" });
    else if (role && user.role !== role) nav({ to: "/problems" });
  }, [user, loading, role, nav]);
  return { user, loading };
}
