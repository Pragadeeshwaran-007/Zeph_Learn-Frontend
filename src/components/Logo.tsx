import { Zap } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const text = size === "lg" ? "text-2xl" : size === "sm" ? "text-base" : "text-lg";
  const icon = size === "lg" ? 22 : size === "sm" ? 16 : 18;
  return (
    <Link to="/" className="flex items-center gap-1.5 font-semibold tracking-tight">
      <Zap size={icon} className="text-primary" fill="currentColor" />
      <span className={`${text} text-foreground`}>
        Zeph<span className="text-primary">learn</span>
      </span>
    </Link>
  );
}
