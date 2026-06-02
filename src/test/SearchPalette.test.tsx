import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import type { SearchResponse, SearchResult } from "../hooks/useSearch";

// Mock the data hook so the palette renders deterministic results without
// hitting the network, React Query, or the debounce timer.
const mockUseSearch = vi.fn();
vi.mock("../hooks/useSearch", () => ({
  MIN_SEARCH_LENGTH: 2,
  useSearch: (opts: unknown) => mockUseSearch(opts),
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

import { SearchPalette } from "../components/search/SearchPalette";

const makeResult = (over: Partial<SearchResult> = {}): SearchResult => ({
  type: "message",
  id: "m1",
  workspaceId: "ws-1",
  workspaceName: "Acme",
  title: "Message",
  snippet: "hello world",
  rank: 0.5,
  createdAt: "2026-01-01T00:00:00Z",
  author: null,
  ...over,
});

const setSearch = (data: SearchResponse | undefined, isFetching = false) =>
  mockUseSearch.mockReturnValue({ data, isFetching });

const renderPalette = (props: Partial<React.ComponentProps<typeof SearchPalette>> = {}) =>
  render(
    <MemoryRouter>
      <SearchPalette open onClose={vi.fn()} {...props} />
    </MemoryRouter>,
  );

const type = (text: string) =>
  userEvent.type(screen.getByPlaceholderText(/search messages/i), text);

describe("SearchPalette", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setSearch(undefined);
  });

  it("renders nothing when closed", () => {
    const { container } = render(
      <MemoryRouter>
        <SearchPalette open={false} onClose={vi.fn()} />
      </MemoryRouter>,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("shows the minimum-length hint before enough characters are typed", () => {
    renderPalette();
    expect(screen.getByText(/at least 2 characters/i)).toBeInTheDocument();
  });

  it("renders results with title, snippet and workspace name", async () => {
    setSearch({ query: "hello", total: 1, results: [makeResult()] });
    renderPalette();
    await type("hello");
    expect(screen.getByText("hello world")).toBeInTheDocument();
    expect(screen.getByText("Acme")).toBeInTheDocument();
  });

  it("shows an empty state when there are no results", async () => {
    setSearch({ query: "zzz", total: 0, results: [] });
    renderPalette();
    await type("zzz");
    expect(screen.getByText(/no results/i)).toBeInTheDocument();
  });

  it("navigates to the matching workspace tab on Enter", async () => {
    setSearch({ query: "hello", total: 1, results: [makeResult()] });
    renderPalette();
    await type("hello");
    await userEvent.keyboard("{Enter}");
    expect(mockNavigate).toHaveBeenCalledWith(
      "/workspace/ws-1?tab=messages&focus=m1",
    );
  });

  it("uses onNavigate override instead of routing when provided", async () => {
    const onNavigate = vi.fn();
    setSearch({ query: "hello", total: 1, results: [makeResult()] });
    renderPalette({ onNavigate });
    await type("hello");
    await userEvent.keyboard("{Enter}");
    expect(onNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("moves the selection with the arrow keys before opening", async () => {
    setSearch({
      query: "hello",
      total: 2,
      results: [
        makeResult({ id: "first" }),
        makeResult({ id: "second", title: "Second" }),
      ],
    });
    renderPalette();
    await type("hello");
    await userEvent.keyboard("{ArrowDown}{Enter}");
    expect(mockNavigate).toHaveBeenCalledWith(
      "/workspace/ws-1?tab=messages&focus=second",
    );
  });
});
