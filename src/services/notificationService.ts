import { ls, STORAGE_KEYS } from "@/utils/storage";

const BASE = import.meta.env.VITE_API_BASE_URL || "https://zeph-learn-backend.onrender.com";

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

export interface Notification {
  id: number;
  title: string;
  message: string;
  createdByAdminId: number;
  createdAt: string;
  isRead: boolean;
  readAt: string | null;
}

export const notificationService = {
  async list(): Promise<Notification[]> {
    const res = await fetch(`${BASE}/api/notifications`, {
      headers: authHeaders(),
    });
    if (!res.ok) return [];
    return await res.json();
  },

  async markAsRead(id: number): Promise<Notification | null> {
    const res = await fetch(`${BASE}/api/notifications/${id}/read`, {
      method: "PATCH",
      headers: authHeaders(),
    });
    if (!res.ok) return null;
    return await res.json();
  },

  async send(title: string, message: string): Promise<boolean> {
    const res = await fetch(`${BASE}/api/admin/notifications`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ title, message }),
    });
    return res.ok;
  },
};
