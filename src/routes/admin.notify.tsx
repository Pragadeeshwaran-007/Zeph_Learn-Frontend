import { createFileRoute } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  notificationService,
  type AdminNotification,
} from "@/services/notificationService";

export const Route = createFileRoute("/admin/notify")({
  component: AdminNotify,
});

function AdminNotify() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState<AdminNotification[] | null>(null);
  const [historyLoading, setHistoryLoading] = useState(true);

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const list = await notificationService.listSent();
      setHistory(list);
    } catch (e) {
      toast.error((e as Error).message);
      setHistory(null);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    void loadHistory();
  }, []);

  const onSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast.error("Title and message are required");
      return;
    }
    setBusy(true);
    try {
      await notificationService.sendBroadcast(title, message);
      toast.success("Notification sent to all users");
      setTitle("");
      setMessage("");
      if (history !== null) void loadHistory();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">Notify</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Broadcast a notification to all users on the platform.
      </p>

      <form
        onSubmit={onSend}
        className="mt-6 max-w-xl rounded-xl border border-border bg-card p-6"
      >
        <label className="block text-sm">Title</label>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. New problems added"
          className="mt-1 w-full rounded-md border border-border bg-input px-3 py-2 outline-none focus:border-primary"
        />

        <label className="mt-4 block text-sm">Message</label>
        <textarea
          required
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write your announcement…"
          className="mt-1 w-full resize-y rounded-md border border-border bg-input px-3 py-2 outline-none focus:border-primary"
        />

        <button
          type="submit"
          disabled={busy}
          className="mt-6 rounded-md gradient-brand px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60"
        >
          {busy ? "Sending…" : "Send"}
        </button>
      </form>

      {history !== null && (
        <div className="mt-10">
          <h2 className="text-lg font-semibold">Previously sent</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Recent broadcasts from this admin panel.
          </p>

          <div className="mt-4 overflow-hidden rounded-xl border border-border bg-card">
            {historyLoading && (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">Loading…</p>
            )}
            {!historyLoading && history.length === 0 && (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                No notifications sent yet.
              </p>
            )}
            {!historyLoading &&
              history.map((n) => (
                <div key={n.id} className="border-b border-border px-4 py-4 last:border-b-0">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium text-foreground">{n.title}</p>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{n.message}</p>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
