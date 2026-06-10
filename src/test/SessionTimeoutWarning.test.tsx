import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";

const mocks = vi.hoisted(() => ({
  setAccessToken: vi.fn(),
  navigate: vi.fn(),
  post: vi.fn(),
  currentToken: "access-token" as string | null,
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => mocks.navigate,
}));

vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({
    accessToken: mocks.currentToken,
    setAccessToken: mocks.setAccessToken,
    isLoading: false,
  }),
  axiosInstance: { post: mocks.post },
}));

import { SessionTimeoutWarning } from "../components/SessionTimeoutWarning";

const IDLE_MS = 15 * 60 * 1000;
const COUNTDOWN_MS = 60 * 1000;

beforeEach(() => {
  vi.useFakeTimers();
  mocks.currentToken = "access-token";
  mocks.setAccessToken.mockClear();
  mocks.navigate.mockClear();
  mocks.post.mockReset();
  mocks.post.mockResolvedValue({ data: { accessToken: "fresh-token" } });
});

afterEach(() => {
  vi.useRealTimers();
});

describe("SessionTimeoutWarning", () => {
  it("renders nothing while the user is active", () => {
    render(<SessionTimeoutWarning />);
    act(() => {
      vi.advanceTimersByTime(IDLE_MS - 2000);
    });
    expect(screen.queryByText(/about to expire/i)).not.toBeInTheDocument();
  });

  it("renders nothing when logged out", () => {
    mocks.currentToken = null;
    render(<SessionTimeoutWarning />);
    act(() => {
      vi.advanceTimersByTime(IDLE_MS + 2000);
    });
    expect(screen.queryByText(/about to expire/i)).not.toBeInTheDocument();
  });

  it("shows the warning after the idle timeout elapses", () => {
    render(<SessionTimeoutWarning />);
    act(() => {
      vi.advanceTimersByTime(IDLE_MS + 1000);
    });
    expect(screen.getByText(/about to expire/i)).toBeInTheDocument();
  });

  it("resets the idle timer on user activity", () => {
    render(<SessionTimeoutWarning />);
    act(() => {
      vi.advanceTimersByTime(IDLE_MS - 5000);
    });
    fireEvent.mouseDown(window);
    act(() => {
      vi.advanceTimersByTime(10_000);
    });
    expect(screen.queryByText(/about to expire/i)).not.toBeInTheDocument();
  });

  it("refreshes the session when the user chooses to stay logged in", async () => {
    render(<SessionTimeoutWarning />);
    act(() => {
      vi.advanceTimersByTime(IDLE_MS + 1000);
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /stay logged in/i }));
    });

    expect(mocks.post).toHaveBeenCalledWith("/auth/refresh", {});
    expect(mocks.setAccessToken).toHaveBeenCalledWith("fresh-token");
  });

  it("logs out when the user chooses to log out now", async () => {
    render(<SessionTimeoutWarning />);
    act(() => {
      vi.advanceTimersByTime(IDLE_MS + 1000);
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /log out now/i }));
    });

    expect(mocks.post).toHaveBeenCalledWith("/auth/logout");
    expect(mocks.setAccessToken).toHaveBeenCalledWith(null);
    expect(mocks.navigate).toHaveBeenCalledWith("/login");
  });

  it("logs out automatically when the countdown runs out", async () => {
    render(<SessionTimeoutWarning />);
    act(() => {
      vi.advanceTimersByTime(IDLE_MS + 1000);
    });
    expect(screen.getByText(/about to expire/i)).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(COUNTDOWN_MS + 2000);
    });

    expect(mocks.post).toHaveBeenCalledWith("/auth/logout");
    expect(mocks.navigate).toHaveBeenCalledWith("/login");
  });

  it("does not dismiss the warning on stray mouse movement", () => {
    render(<SessionTimeoutWarning />);
    act(() => {
      vi.advanceTimersByTime(IDLE_MS + 1000);
    });
    fireEvent.mouseMove(window);
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.getByText(/about to expire/i)).toBeInTheDocument();
  });
});
