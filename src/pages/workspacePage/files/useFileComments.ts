import { useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance, useAuth } from "../../../context/AuthContext";
import { extractFilesError } from "./filesKeys";

export interface FileComment {
  id: string;
  // Present on socket payloads (and the REST row) so a workspace-wide broadcast
  // can be filtered down to the file this hook has open.
  fileId: string;
  body: string;
  createdAt: string;
  author: {
    id: string;
    firstname: string | null;
    lastname: string | null;
    email: string;
    picture: string | null;
  } | null;
}

const fileCommentsKey = (fileId: string) => ["file-comments", fileId] as const;

export const useFileComments = (fileId: string, workspaceId: string) => {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  const [actionError, setActionError] = useState<string | null>(null);

  const listQuery = useQuery({
    queryKey: fileCommentsKey(fileId),
    queryFn: async () => {
      const { data } = await axiosInstance.get<FileComment[]>(
        `/files/${fileId}/comments`,
      );
      return data;
    },
  });

  // Real-time sync: a comment added or removed by the other side appears in the
  // open modal without a refresh. Events broadcast to the whole workspace room,
  // so ignore any that aren't for this file. Dedup by id keeps the originator's
  // optimistic write and the echoed broadcast from doubling up.
  useEffect(() => {
    if (!accessToken || !workspaceId) return;

    const socket: Socket = io(`${import.meta.env.VITE_SOCKET_URL}/files`, {
      auth: { token: accessToken },
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      socket.emit("joinFilesRoom", { workspaceId });
    });

    socket.on("fileCommentCreated", (comment: FileComment) => {
      if (comment.fileId !== fileId) return;
      queryClient.setQueryData<FileComment[]>(fileCommentsKey(fileId), (prev) => {
        if (!prev) return [comment];
        if (prev.some((c) => c.id === comment.id)) return prev;
        return [...prev, comment];
      });
      // Keep the file card's comment-count badge accurate.
      void queryClient.invalidateQueries({ queryKey: ["files"] });
    });

    socket.on(
      "fileCommentDeleted",
      ({ id, fileId: targetFileId }: { id: string; fileId: string }) => {
        if (targetFileId !== fileId) return;
        queryClient.setQueryData<FileComment[]>(fileCommentsKey(fileId), (prev) =>
          prev ? prev.filter((c) => c.id !== id) : prev,
        );
        void queryClient.invalidateQueries({ queryKey: ["files"] });
      },
    );

    return () => {
      socket.disconnect();
    };
  }, [fileId, workspaceId, accessToken, queryClient]);

  const addMutation = useMutation({
    mutationFn: async (body: string) => {
      const { data } = await axiosInstance.post<FileComment>(
        `/files/${fileId}/comments`,
        { body },
      );
      return data;
    },
    onSuccess: (created) => {
      // Dedup by id: the echoed "fileCommentCreated" broadcast may land before
      // this resolves, so guard against adding the same comment twice.
      queryClient.setQueryData<FileComment[]>(fileCommentsKey(fileId), (prev) => {
        if (!prev) return [created];
        if (prev.some((c) => c.id === created.id)) return prev;
        return [...prev, created];
      });
      // Refresh the file list so the comment-count badge stays accurate.
      void queryClient.invalidateQueries({ queryKey: ["files"] });
    },
    onError: (err) =>
      setActionError(extractFilesError(err) ?? "Failed to add comment"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (commentId: string) => {
      await axiosInstance.delete(`/file-comments/${commentId}`);
      return commentId;
    },
    onSuccess: (commentId) => {
      queryClient.setQueryData<FileComment[]>(fileCommentsKey(fileId), (prev) =>
        prev ? prev.filter((comment) => comment.id !== commentId) : prev,
      );
      void queryClient.invalidateQueries({ queryKey: ["files"] });
    },
    onError: (err) =>
      setActionError(extractFilesError(err) ?? "Failed to delete comment"),
  });

  return {
    comments: listQuery.data ?? [],
    loading: listQuery.isLoading,
    loadError: extractFilesError(listQuery.error),
    actionError,
    clearActionError: () => setActionError(null),
    addComment: addMutation.mutate,
    adding: addMutation.isPending,
    deleteComment: deleteMutation.mutate,
  };
};
