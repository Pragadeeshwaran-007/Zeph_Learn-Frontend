import { ls, STORAGE_KEYS } from "@/utils/storage";

const BASE = import.meta.env.VITE_API_BASE_URL || "https://zeph-learn-backend.onrender.com";

export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
}

function storedToken(): string | null {
  const raw = ls.get<string | null>(STORAGE_KEYS.token, null);
  return typeof raw === "string" && raw.length > 0 ? raw : null;
}

function authHeaders(): HeadersInit {
  const t = storedToken();
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(t ? { Authorization: `Bearer ${t}` } : {}),
  };
}

function authReadHeaders(): HeadersInit {
  const t = storedToken();
  return {
    Accept: "application/json",
    ...(t ? { Authorization: `Bearer ${t}` } : {}),
  };
}

async function apiError(response: Response, fallback: string): Promise<never> {
  try {
    const data = (await response.json()) as { error?: string; message?: string };
    const msg = data?.error ?? data?.message;
    if (msg) throw new Error(msg);
  } catch (e) {
    if (e instanceof Error && e.message !== fallback) throw e;
  }
  throw new Error(fallback);
}

function parseNotification(row: Record<string, unknown>): Notification | null {
  const id = row.id ?? row.notificationId;
  if (id == null || id === "") return null;
  const readRaw = row.read ?? row.isRead ?? row.is_read;
  const created =
    (typeof row.createdAt === "string" && row.createdAt) ||
    (typeof row.created_at === "string" && row.created_at) ||
    (typeof row.sentAt === "string" && row.sentAt) ||
    new Date().toISOString();
  return {
    id: String(id),
    title: String(row.title ?? ""),
    message: String(row.message ?? row.body ?? ""),
    read: readRaw === true || readRaw === "true" || readRaw === 1,
    createdAt: created,
  };
}

function parseAdminNotification(row: Record<string, unknown>): AdminNotification | null {
  const id = row.id ?? row.notificationId;
  if (id == null || id === "") return null;
  const created =
    (typeof row.createdAt === "string" && row.createdAt) ||
    (typeof row.created_at === "string" && row.created_at) ||
    (typeof row.sentAt === "string" && row.sentAt) ||
    new Date().toISOString();
  return {
    id: String(id),
    title: String(row.title ?? ""),
    message: String(row.message ?? row.body ?? ""),
    createdAt: created,
  };
}

function parseList<T>(
  raw: unknown,
  mapper: (row: Record<string, unknown>) => T | null,
): T[] {
  const rows: unknown[] = Array.isArray(raw)
    ? raw
    : raw && typeof raw === "object" && Array.isArray((raw as { content?: unknown }).content)
      ? ((raw as { content: unknown[] }).content as unknown[])
      : raw && typeof raw === "object" && Array.isArray((raw as { notifications?: unknown }).notifications)
        ? ((raw as { notifications: unknown[] }).notifications as unknown[])
        : raw && typeof raw === "object" && Array.isArray((raw as { data?: unknown }).data)
          ? ((raw as { data: unknown[] }).data as unknown[])
          : [];
  return rows
    .filter((r): r is Record<string, unknown> => r != null && typeof r === "object" && !Array.isArray(r))
    .map(mapper)
    .filter((n): n is T => n != null);
}

export const notificationService = {
  async list(): Promise<Notification[]> {
    const response = await fetch(`${BASE}/api/notifications`, {
      method: "GET",
      headers: authReadHeaders(),
    });
    if (!response.ok) return apiError(response, "Failed to load notifications");
    const raw: unknown = await response.json();
    return parseList(raw, parseNotification);
  },

  async markRead(id: string): Promise<void> {
    const response = await fetch(`${BASE}/api/notifications/${encodeURIComponent(id)}/read`, {
      method: "PATCH",
      headers: authHeaders(),
    });
    if (!response.ok) return apiError(response, "Failed to mark notification as read");
  },

  async sendBroadcast(title: string, message: string): Promise<void> {
    const response = await fetch(`${BASE}/api/admin/notifications`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ title: title.trim(), message: message.trim() }),
    });
    if (!response.ok) return apiError(response, "Failed to send notification");
  },

  /** Returns null when the backend does not expose a list endpoint. */
  async listSent(): Promise<AdminNotification[] | null> {
    const response = await fetch(`${BASE}/api/admin/notifications`, {
      method: "GET",
      headers: authReadHeaders(),
    });
    if (response.status === 404 || response.status === 405 || response.status === 501) {
      return null;
    }
    if (!response.ok) return apiError(response, "Failed to load sent notifications");
    const raw: unknown = await response.json();
    return parseList(raw, parseAdminNotification);
  },
};
