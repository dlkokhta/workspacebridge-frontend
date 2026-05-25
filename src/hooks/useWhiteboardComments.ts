import { useCallback, useEffect, useMemo } from "react";
import type { Socket } from "socket.io-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../context/AuthContext";

export interface CommentAuthor {
  id: string;
  firstname: string | null;
  lastname: string | null;
  email: string;
  picture: string | null;
}

export interface WhiteboardComment {
  id: string;
  whiteboardId: string;
  elementId: string;
  authorId: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  author: CommentAuthor;
}

interface CommentDeletedPayload {
  id: string;
  boardId: string;
}

interface UseWhiteboardCommentsResult {
  comments: WhiteboardComment[];
  commentsByElement: Map<string, WhiteboardComment[]>;
  loading: boolean;
  error: string | null;
  addComment: (elementId: string, body: string) => Promise<WhiteboardComment>;
  deleteComment: (commentId: string) => Promise<void>;
}

const keys = {
  list: (boardId: string) => ["whiteboard-comments", boardId] as const,
};

export const useWhiteboardComments = (
  boardId: string,
  socket: Socket | null,
): UseWhiteboardCommentsResult => {
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: keys.list(boardId),
    queryFn: async () => {
      const { data } = await axiosInstance.get<WhiteboardComment[]>(
        `/whiteboards/${boardId}/comments`,
      );
      return data;
    },
  });

  const addMutation = useMutation({
    mutationFn: async (vars: { elementId: string; body: string }) => {
      const { data } = await axiosInstance.post<WhiteboardComment>(
        `/whiteboards/${boardId}/comments`,
        { elementId: vars.elementId, body: vars.body },
      );
      return data;
    },
    onSuccess: (created) => {
      queryClient.setQueryData<WhiteboardComment[]>(
        keys.list(boardId),
        (prev) =>
          prev?.some((c) => c.id === created.id)
            ? prev
            : [...(prev ?? []), created],
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (commentId: string) => {
      await axiosInstance.delete(
        `/whiteboards/${boardId}/comments/${commentId}`,
      );
      return commentId;
    },
    onSuccess: (commentId) => {
      queryClient.setQueryData<WhiteboardComment[]>(
        keys.list(boardId),
        (prev) => prev?.filter((c) => c.id !== commentId),
      );
    },
  });

  // Real-time sync: socket events write directly into the React Query cache.
  useEffect(() => {
    if (!socket) return;
    const onCreated = (comment: WhiteboardComment) => {
      if (comment.whiteboardId !== boardId) return;
      queryClient.setQueryData<WhiteboardComment[]>(
        keys.list(boardId),
        (prev) =>
          prev?.some((c) => c.id === comment.id)
            ? prev
            : [...(prev ?? []), comment],
      );
    };
    const onDeleted = (payload: CommentDeletedPayload) => {
      if (payload.boardId !== boardId) return;
      queryClient.setQueryData<WhiteboardComment[]>(
        keys.list(boardId),
        (prev) => prev?.filter((c) => c.id !== payload.id),
      );
    };
    socket.on("commentCreated", onCreated);
    socket.on("commentDeleted", onDeleted);
    return () => {
      socket.off("commentCreated", onCreated);
      socket.off("commentDeleted", onDeleted);
    };
  }, [socket, boardId, queryClient]);

  const addComment = useCallback(
    (elementId: string, body: string) =>
      addMutation.mutateAsync({ elementId, body }),
    [addMutation],
  );

  const deleteComment = useCallback(
    async (commentId: string) => {
      await deleteMutation.mutateAsync(commentId);
    },
    [deleteMutation],
  );

  const comments = listQuery.data ?? [];

  const commentsByElement = useMemo(() => {
    const map = new Map<string, WhiteboardComment[]>();
    for (const comment of comments) {
      const list = map.get(comment.elementId);
      if (list) {
        list.push(comment);
      } else {
        map.set(comment.elementId, [comment]);
      }
    }
    return map;
  }, [comments]);

  return {
    comments,
    commentsByElement,
    loading: listQuery.isLoading,
    error: listQuery.error ? "Could not load comments." : null,
    addComment,
    deleteComment,
  };
};
