import { Bell } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/hooks/useNotifications";

export function NotificationBell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { notifications, loading, unreadCount, refresh, markRead, markAllRead } = useNotifications(
    !!user,
  );

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const toggleOpen = () => {
    setOpen((v) => {
      const next = !v;
      if (next) void refresh();
      return next;
    });
  };

  const onMarkAllRead = async () => {
    try {
      await markAllRead();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const onNotificationClick = async (id: string, read: boolean) => {
    if (read) return;
    try {
      await markRead(id);
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        id="notification-bell-btn"
        aria-label="Notifications"
        aria-expanded={open}
        onClick={toggleOpen}
        className="relative inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
        )}
      </button>

      {open && (
        <div
          id="notification-dropdown"
          className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-border bg-card shadow-xl z-50 overflow-hidden"
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <span className="text-sm font-semibold text-foreground">Notifications</span>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <>
                  <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium text-primary">
                    {unreadCount} new
                  </span>
                  <button
                    type="button"
                    onClick={() => void onMarkAllRead()}
                    className="text-[10px] font-medium text-muted-foreground hover:text-primary transition"
                  >
                    Mark all read
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading && notifications.length === 0 && (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">Loading…</p>
            )}

            {!loading && notifications.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-3 px-4 py-10 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/60">
                  <Bell size={22} className="text-muted-foreground/50" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">No notifications yet</p>
                <p className="text-xs text-muted-foreground/60">
                  You'll see announcements and activity here.
                </p>
              </div>
            )}

            {notifications.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => void onNotificationClick(n.id, n.read)}
                className={`w-full border-b border-border px-4 py-3 text-left transition hover:bg-secondary/40 ${
                  n.read ? "opacity-70" : "bg-primary/5"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm ${n.read ? "text-foreground" : "font-semibold text-foreground"}`}>
                    {n.title}
                  </p>
                  {!n.read && (
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  )}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                <p className="mt-1 text-[10px] text-muted-foreground/70">
                  {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
