import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BackupCodesRow } from "../pages/profilePage/sections/security/BackupCodesRow";
import { axiosInstance } from "../context/AuthContext";

vi.mock("../context/AuthContext", () => ({
  axiosInstance: {
    post: vi.fn(),
  },
}));

const mockedPost = vi.mocked(axiosInstance.post);

const CODES = [
  "a1b2-c3d4",
  "e5f6-a7b8",
  "c9d0-e1f2",
  "1234-5678",
  "9abc-def0",
  "0fed-cba9",
  "8765-4321",
  "2f1e-0d9c",
  "b8a7-6f5e",
  "4d3c-2b1a",
];

const renderRow = (onSuccess = vi.fn()) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <QueryClientProvider client={queryClient}>
      <BackupCodesRow onSuccess={onSuccess} />
    </QueryClientProvider>,
  );
  return onSuccess;
};

const typeCodeAndSubmit = (totp: string) => {
  fireEvent.change(screen.getByPlaceholderText("000000"), {
    target: { value: totp },
  });
  fireEvent.click(screen.getByText("Generate new codes"));
};

describe("BackupCodesRow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("asks for the current TOTP code before regenerating", () => {
    renderRow();

    fireEvent.click(screen.getByText("Regenerate"));

    expect(
      screen.getByText(/Enter the current 6-digit code/),
    ).toBeInTheDocument();
    expect(mockedPost).not.toHaveBeenCalled();
  });

  it("shows the new one-time codes after a valid TOTP code", async () => {
    mockedPost.mockResolvedValue({ data: { backupCodes: CODES } });
    renderRow();

    fireEvent.click(screen.getByText("Regenerate"));
    typeCodeAndSubmit("123456");

    expect(await screen.findByText("a1b2-c3d4")).toBeInTheDocument();
    expect(screen.getByText("4d3c-2b1a")).toBeInTheDocument();
    expect(mockedPost).toHaveBeenCalledWith(
      "/auth/2fa/backup-codes/regenerate",
      { code: "123456" },
    );
  });

  it("fires the success banner once the user confirms they saved the codes", async () => {
    mockedPost.mockResolvedValue({ data: { backupCodes: CODES } });
    const onSuccess = renderRow();

    fireEvent.click(screen.getByText("Regenerate"));
    typeCodeAndSubmit("123456");
    fireEvent.click(await screen.findByText("I've saved them"));

    expect(onSuccess).toHaveBeenCalledWith(
      expect.stringContaining("New backup codes generated"),
    );
    // the one-time display is gone
    expect(screen.queryByText("a1b2-c3d4")).not.toBeInTheDocument();
  });

  it("surfaces the API error for an invalid TOTP code", async () => {
    mockedPost.mockRejectedValue({
      response: { data: { message: "Invalid authentication code" } },
    });
    renderRow();

    fireEvent.click(screen.getByText("Regenerate"));
    typeCodeAndSubmit("000000");

    await waitFor(() =>
      expect(
        screen.getByText("Invalid authentication code"),
      ).toBeInTheDocument(),
    );
  });
});
