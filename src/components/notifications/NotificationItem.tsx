import type { NotificationItem as Notification, NotificationType } from "./notificationKeys";

interface NotificationItemProps {
  notification: Notification;
  onSelect: (notification: Notification) => void;
}

const LABELS: Record<NotificationType, string> = {
  NEW_MESSAGE: "New message",
  FILE_COMMENT: "File comment",
  TASK_ASSIGNED: "Task assigned",
  WHITEBOARD_COMMENT: "Whiteboard comment",
};

export const NotificationItem = ({ notification, onSelect }: NotificationItemProps) => (
  <button
    onClick={() => onSelect(notification)}
    className={`w-full text-left px-4 py-3 border-b border-black/[0.05] dark:border-white/[0.05] hover:bg-[#f6f6f1] dark:hover:bg-[#222b26] transition-colors cursor-pointer ${
      notification.isRead ? "" : "bg-[#5a8a6b]/[0.06] dark:bg-[#5a8a6b]/[0.12]"
    }`}
  >
    <div className="flex items-center gap-2">
      {!notification.isRead && (
        <span className="w-1.5 h-1.5 rounded-full bg-[#5a8a6b] shrink-0" />
      )}
      <span className="text-[12px] font-semibold text-[#1a201c] dark:text-[#e8ece9]">
        {LABELS[notification.type]}
      </span>
      <span className="ml-auto text-[11px] text-[#858c87] dark:text-[#6e7672] truncate max-w-[40%]">
        {notification.workspace.name}
      </span>
    </div>
    {notification.data?.preview && (
      <p className="mt-1 text-[12px] text-[#5a625e] dark:text-[#a0a8a3] truncate">
        {notification.data.senderName ? `${notification.data.senderName}: ` : ""}
        {notification.data.preview}
      </p>
    )}
  </button>
);
