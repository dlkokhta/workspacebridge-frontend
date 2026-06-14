import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import type { ComponentProps, ReactNode } from "react";

// Strip framer-motion's enter/exit animations so toast removal is synchronous
// under fake timers (AnimatePresence would otherwise keep exiting nodes mounted).
vi.mock("framer-motion", () => ({
  AnimatePresence: ({ children }: { children: ReactNode }) => children,
  motion: {
    div: ({
      children,
      initial: _initial,
      animate: _animate,
      exit: _exit,
      transition: _transition,
      layout: _layout,
      ...rest
    }: ComponentProps<"div"> & Record<string, unknown>) => (
      <div {...(rest as ComponentProps<"div">)}>{children}</div>
    ),
  },
}));

import { ToastProvider } from "../context/ToastContext";
import { toast } from "../components/toast/toast";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("Toast system", () => {
  it("renders a toast raised via the imperative API", () => {
    render(<ToastProvider>app</ToastProvider>);

    act(() => {
      toast.error("Upload failed");
    });

    expect(screen.getByText("Upload failed")).toBeInTheDocument();
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("auto-dismisses after the default duration", () => {
    render(<ToastProvider>app</ToastProvider>);

    act(() => {
      toast.success("Saved");
    });
    expect(screen.getByText("Saved")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.queryByText("Saved")).not.toBeInTheDocument();
  });

  it("persists when duration is 0 and can be dismissed manually", () => {
    render(<ToastProvider>app</ToastProvider>);

    act(() => {
      toast.info("Heads up", { duration: 0 });
    });

    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(screen.getByText("Heads up")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Dismiss notification"));
    expect(screen.queryByText("Heads up")).not.toBeInTheDocument();
  });

  it("caps the number of visible toasts at four", () => {
    render(<ToastProvider>app</ToastProvider>);

    act(() => {
      for (let i = 0; i < 6; i++) toast.info(`msg-${i}`, { duration: 0 });
    });

    expect(screen.getAllByRole("status")).toHaveLength(4);
    expect(screen.queryByText("msg-0")).not.toBeInTheDocument();
    expect(screen.getByText("msg-5")).toBeInTheDocument();
  });
});
