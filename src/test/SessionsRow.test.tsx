import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionsRow } from "../pages/profilePage/sections/security/SessionsRow";
import { axiosInstance } from "../context/AuthContext";

vi.mock("../context/AuthContext", () => ({
  axiosInstance: {
    get: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockedGet = vi.mocked(axiosInstance.get);
const mockedDelete = vi.mocked(axiosInstance.delete);

const SESSIONS = [
  {
    id: "session-current",
    ip: "1.2.3.4",
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
    isCurrent: true,
  },
  {
    id: "session-other",
    ip: "5.6.7.8",
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Mobile Safari/604.1",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
    isCurrent: false,
  },
];

const renderRow = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <SessionsRow onSuccess={vi.fn()} />
    </QueryClientProvider>,
  );
};

describe("SessionsRow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not fetch sessions until expanded", () => {
    renderRow();
    expect(mockedGet).not.toHaveBeenCalled();
  });

  it("lists sessions with device labels after clicking Manage", async () => {
    mockedGet.mockResolvedValue({ data: SESSIONS });
    renderRow();

    fireEvent.click(screen.getByText("Manage"));

    expect(await screen.findByText("Chrome · Windows")).toBeInTheDocument();
    expect(screen.getByText("Safari · iOS")).toBeInTheDocument();
    expect(mockedGet).toHaveBeenCalledWith("/user/sessions");
  });

  it("marks the current session and offers Revoke only on others", async () => {
    mockedGet.mockResolvedValue({ data: SESSIONS });
    renderRow();

    fireEvent.click(screen.getByText("Manage"));

    expect(await screen.findByText("This device")).toBeInTheDocument();
    expect(screen.getAllByText("Revoke")).toHaveLength(1);
  });

  it("revokes a single session via DELETE /user/sessions/:id", async () => {
    mockedGet.mockResolvedValue({ data: SESSIONS });
    mockedDelete.mockResolvedValue({ data: { message: "Session revoked" } });
    renderRow();

    fireEvent.click(screen.getByText("Manage"));
    fireEvent.click(await screen.findByText("Revoke"));

    await waitFor(() =>
      expect(mockedDelete).toHaveBeenCalledWith("/user/sessions/session-other"),
    );
  });

  it("signs out all other devices via DELETE /user/sessions", async () => {
    mockedGet.mockResolvedValue({ data: SESSIONS });
    mockedDelete.mockResolvedValue({
      data: { message: "Other sessions revoked", count: 1 },
    });
    renderRow();

    fireEvent.click(screen.getByText("Manage"));
    fireEvent.click(await screen.findByText("Sign out all other devices"));

    await waitFor(() =>
      expect(mockedDelete).toHaveBeenCalledWith("/user/sessions"),
    );
  });

  it("shows an error message when loading sessions fails", async () => {
    mockedGet.mockRejectedValue(new Error("network"));
    renderRow();

    fireEvent.click(screen.getByText("Manage"));

    expect(
      await screen.findByText("Could not load your sessions."),
    ).toBeInTheDocument();
  });
});
