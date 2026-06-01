import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../../context/AuthContext";
import { extractFilesError } from "./filesKeys";

export interface FileComment {
  id: string;
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

export const useFileComments = (fileId: string) => {
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

  const addMutation = useMutation({
    mutationFn: async (body: string) => {
      const { data } = await axiosInstance.post<FileComment>(
        `/files/${fileId}/comments`,
        { body },
      );
      return data;
    },
    onSuccess: (created) => {
      queryClient.setQueryData<FileComment[]>(fileCommentsKey(fileId), (prev) =>
        prev ? [...prev, created] : [created],
      );
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
