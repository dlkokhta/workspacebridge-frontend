import { useInfiniteQuery } from "@tanstack/react-query";
import { axiosInstance } from "../../../../context/AuthContext";

export interface ActivityEvent {
  id: string;
  action: string;
  createdAt: string;
  context: {
    ip?: string;
    userAgent?: string;
    device?: string;
    provider?: string;
  };
}

interface ActivityPage {
  items: ActivityEvent[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

const PAGE_SIZE = 20;

// Paginated security activity timeline (the user's own auth.* audit events),
// fetched page by page via "Load more".
export const useActivity = () =>
  useInfiniteQuery({
    queryKey: ["activity"],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const { data } = await axiosInstance.get<ActivityPage>(
        "/user/me/activity",
        { params: { page: pageParam, limit: PAGE_SIZE } },
      );
      return data;
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.page + 1 : undefined,
  });
