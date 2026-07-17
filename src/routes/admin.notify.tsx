import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { notificationService } from "@/services/notificationService";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/notify")({
  component: NotifyPage,
});

function NotifyPage() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast.error("Title and message are required.");
      return;
    }
    setSending(true);
    try {
      const ok = await notificationService.send(title.trim(), message.trim());
      if (ok) {
        toast.success("Notification sent to all users!");
        setTitle("");
        setMessage("");
      } else {
        toast.error("Failed to send notification.");
      }
    } catch {
      toast.error("An error occurred while sending.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-lg">
      <h1 className="text-xl font-semibold mb-1">Notify</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Broadcast a notification to all users on the platform.
      </p>
      <form onSubmit={handleSend} className="space-y-4 rounded-xl border border-border bg-card p-6">
        <div>
          <label htmlFor="notify-title" className="block text-sm font-medium mb-1.5">
            Title
          </label>
          <input
            id="notify-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter title..."
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div>
          <label htmlFor="notify-message" className="block text-sm font-medium mb-1.5">
            Message
          </label>
          <textarea
            id="notify-message"
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter message..."
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
          />
        </div>
        <button
          type="submit"
          disabled={sending}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2 text-sm font-semibold text-black hover:opacity-90 disabled:opacity-50 transition"
        >
          {sending ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
}
