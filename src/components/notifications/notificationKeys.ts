import { isAxiosError } from "axios";

export type NotificationType =
  | "NEW_MESSAGE"
  | "FILE_COMMENT"
  | "TASK_ASSIGNED"
  | "WHITEBOARD_COMMENT";

export interface NotificationData {
  senderId?: string;
  senderName?: string;
  preview?: string;
}

export interface NotificationItem {
  id: string;
  type: NotificationType;
  data: NotificationData | null;
  isRead: boolean;
  createdAt: string;
  workspace: { id: string; name: string };
}

export const notificationKeys = {
  list: () => ["notifications"] as const,
  unread: () => ["notifications-unread"] as const,
};

export const extractNotificationError = (err: unknown): string | null => {
  if (isAxiosError(err)) {
    const data = err.response?.data as
      | { message?: string | string[] }
      | undefined;
    const msg = data?.message;
    if (Array.isArray(msg)) return msg.join(", ");
    return msg ?? null;
  }
  return null;
};
