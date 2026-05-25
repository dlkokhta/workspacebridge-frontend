import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../../../../context/AuthContext";
import {
  boardsKeys,
  bootstrapDefaultBoard,
  type BoardSummary,
} from "./boardsKeys";

// Owns the list query + selection state. Selection lives here because
// the list arrival drives the default selection, and a workspace switch
// must reset both together.
export const useBoardsList = (workspaceId: string) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const listQuery = useQuery({
    queryKey: boardsKeys.list(workspaceId),
    queryFn: async () => {
      const { data } = await axiosInstance.get<BoardSummary[]>(
        `/workspace/${workspaceId}/whiteboards`,
      );
      if (data.length === 0) {
        const created = await bootstrapDefaultBoard(workspaceId);
        return [created];
      }
      return data;
    },
  });

  // Reset selection on workspace switch so we don't carry a stale id over.
  useEffect(() => {
    setSelectedId(null);
  }, [workspaceId]);

  // First board becomes the default selection once the list arrives.
  useEffect(() => {
    if (listQuery.data && listQuery.data.length > 0) {
      setSelectedId((prev) => prev ?? listQuery.data![0].id);
    }
  }, [listQuery.data]);

  return {
    boards: listQuery.data ?? null,
    loadError: listQuery.error ? "Could not load whiteboards." : null,
    selectedId,
    setSelectedId,
  };
};
