import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../context/AuthContext";
import { useDebounce } from "./useDebounce";

export type SearchResultType =
  | "message"
  | "file"
  | "file_comment"
  | "shared_task"
  | "private_task"
  | "shared_link"
  | "whiteboard_comment";

export interface SearchResultAuthor {
  id: string;
  firstname: string | null;
  lastname: string | null;
  email: string | null;
}

export interface SearchResult {
  type: SearchResultType;
  id: string;
  parentId?: string;
  workspaceId: string | null;
  workspaceName: string | null;
  title: string;
  snippet: string;
  rank: number;
  createdAt: string;
  author: SearchResultAuthor | null;
}

export interface SearchResponse {
  query: string;
  total: number;
  results: SearchResult[];
}

interface UseSearchOptions {
  q: string;
  /** When set, search is scoped to this workspace; otherwise it is global. */
  workspaceId?: string;
  types?: SearchResultType[];
  limit?: number;
  enabled?: boolean;
}

export const MIN_SEARCH_LENGTH = 2;

export const searchKey = (
  scope: string,
  q: string,
  types: SearchResultType[] | undefined,
  limit: number,
) => ["search", scope, q, types ?? null, limit] as const;

export const useSearch = ({
  q,
  workspaceId,
  types,
  limit = 20,
  enabled = true,
}: UseSearchOptions) => {
  const debouncedQ = useDebounce(q.trim(), 250);
  const active = enabled && debouncedQ.length >= MIN_SEARCH_LENGTH;

  return useQuery({
    queryKey: searchKey(workspaceId ?? "global", debouncedQ, types, limit),
    queryFn: async () => {
      const path = workspaceId
        ? `/workspace/${workspaceId}/search`
        : "/search";
      const { data } = await axiosInstance.get<SearchResponse>(path, {
        params: {
          q: debouncedQ,
          ...(types?.length ? { types: types.join(",") } : {}),
          limit,
        },
      });
      return data;
    },
    enabled: active,
    placeholderData: keepPreviousData,
  });
};
