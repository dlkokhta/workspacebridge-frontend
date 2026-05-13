import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

interface UseWhiteboardCommentsResult {
  comments: WhiteboardComment[];
  commentsByElement: Map<string, WhiteboardComment[]>;
  loading: boolean;
  error: string | null;
  addComment: (elementId: string, body: string) => Promise<WhiteboardComment>;
  deleteComment: (commentId: string) => Promise<void>;
  applyRemoteCreated: (comment: WhiteboardComment) => void;
  applyRemoteDeleted: (commentId: string) => void;
}

export const useWhiteboardComments = (
  boardId: string,
): UseWhiteboardCommentsResult => {
  const [comments, setComments] = useState<WhiteboardComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const cancelRef = useRef(false);

  useEffect(() => {
    cancelRef.current = false;
    setComments([]);
    setError(null);
    setLoading(true);

    axiosInstance
      .get<WhiteboardComment[]>(`/whiteboards/${boardId}/comments`)
      .then(({ data }) => {
        if (cancelRef.current) return;
        setComments(data);
      })
      .catch(() => {
        if (cancelRef.current) return;
        setError("Could not load comments.");
      })
      .finally(() => {
        if (cancelRef.current) return;
        setLoading(false);
      });

    return () => {
      cancelRef.current = true;
    };
  }, [boardId]);

  const addComment = useCallback(
    async (elementId: string, body: string) => {
      const { data } = await axiosInstance.post<WhiteboardComment>(
        `/whiteboards/${boardId}/comments`,
        { elementId, body },
      );
      setComments((prev) =>
        prev.some((c) => c.id === data.id) ? prev : [...prev, data],
      );
      return data;
    },
    [boardId],
  );

  const deleteComment = useCallback(
    async (commentId: string) => {
      await axiosInstance.delete(
        `/whiteboards/${boardId}/comments/${commentId}`,
      );
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    },
    [boardId],
  );

  const applyRemoteCreated = useCallback((comment: WhiteboardComment) => {
    setComments((prev) =>
      prev.some((c) => c.id === comment.id) ? prev : [...prev, comment],
    );
  }, []);

  const applyRemoteDeleted = useCallback((commentId: string) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  }, []);

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
    loading,
    error,
    addComment,
    deleteComment,
    applyRemoteCreated,
    applyRemoteDeleted,
  };
};
