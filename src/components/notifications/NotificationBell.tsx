import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "./useNotifications";
import { NotificationItem } from "./NotificationItem";
import type { NotificationItem as Notification } from "./notificationKeys";

export const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    listLoading,
    listError,
    markRead,
    markAllRead,
  } = useNotifications(open);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  const handleSelect = (notification: Notification) => {
    if (!notification.isRead) markRead(notification.id);
    setOpen(false);
    navigate(`/workspace/${notification.workspace.id}`);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen((value) => !value)}
        className="relative w-8 h-8 flex items-center justify-center rounded-lg border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#1c221e] text-[#5a625e] dark:text-[#a0a8a3] hover:bg-[#f6f6f1] dark:hover:bg-[#222b26] transition-colors cursor-pointer"
        aria-label="Notifications"
      >
        <Bell size={14} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full bg-[#c25a4a] text-white text-[10px] font-semibold">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-xl border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#1c221e] shadow-lg z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-black/[0.06] dark:border-white/[0.05]">
            <span className="text-[13px] font-semibold text-[#1a201c] dark:text-[#e8ece9]">
              Notifications
            </span>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllRead()}
                className="text-[11px] font-medium text-[#5a8a6b] hover:underline cursor-pointer"
              >
                Mark all read
              </button>
            )}
          </div>

          {listLoading ? (
            <p className="px-4 py-6 text-center text-[12px] text-[#858c87] dark:text-[#6e7672]">
              Loading…
            </p>
          ) : listError ? (
            <p className="px-4 py-6 text-center text-[12px] text-[#c25a4a]">
              {listError}
            </p>
          ) : notifications.length === 0 ? (
            <p className="px-4 py-6 text-center text-[12px] text-[#858c87] dark:text-[#6e7672]">
              No notifications yet
            </p>
          ) : (
            notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onSelect={handleSelect}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};
