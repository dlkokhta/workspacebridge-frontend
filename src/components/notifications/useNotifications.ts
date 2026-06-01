import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../context/AuthContext";
import {
  extractNotificationError,
  notificationKeys,
  type NotificationItem,
} from "./notificationKeys";

// `open` gates the list fetch so we only load the full list when the dropdown
// is actually shown; the unread count stays live for the badge.
export const useNotifications = (open: boolean) => {
  const queryClient = useQueryClient();

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: notificationKeys.list() });
    void queryClient.invalidateQueries({ queryKey: notificationKeys.unread() });
  };

  const unreadQuery = useQuery({
    queryKey: notificationKeys.unread(),
    queryFn: async () => {
      const { data } = await axiosInstance.get<{ count: number }>(
        "/notifications/unread-count",
      );
      return data.count;
    },
    refetchOnWindowFocus: true,
  });

  const listQuery = useQuery({
    queryKey: notificationKeys.list(),
    queryFn: async () => {
      const { data } =
        await axiosInstance.get<NotificationItem[]>("/notifications");
      return data;
    },
    enabled: open,
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.patch(`/notifications/${id}/read`);
    },
    onSuccess: invalidate,
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await axiosInstance.patch("/notifications/read-all");
    },
    onSuccess: invalidate,
  });

  return {
    notifications: listQuery.data ?? [],
    unreadCount: unreadQuery.data ?? 0,
    listLoading: listQuery.isLoading,
    listError: extractNotificationError(listQuery.error),
    markRead: markReadMutation.mutate,
    markAllRead: markAllReadMutation.mutate,
  };
};
