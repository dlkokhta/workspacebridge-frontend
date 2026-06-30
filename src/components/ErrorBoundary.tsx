import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { logClientError } from "../utils/errorLogger";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * App-level safety net: catches render/runtime errors thrown anywhere below it
 * so a single broken component degrades to a recoverable screen instead of a
 * blank white page. Error boundaries must be class components.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Surface to the console for debugging, and forward to the backend (best
    // effort) so a render crash a tester hit is visible in the admin panel.
    console.error("Unhandled UI error:", error, info.componentStack);
    logClientError({
      source: "react-error-boundary",
      message: error.message || "Render error",
      stack: error.stack,
      componentStack: info.componentStack ?? undefined,
    });
  }

  private handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-[#fafaf7] px-6 text-center dark:bg-[#10130f]">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#c25a4a]/10 text-[#c25a4a] dark:bg-[#e07b6b]/10 dark:text-[#e07b6b]">
          <AlertTriangle size={26} />
        </span>
        <div className="space-y-1.5">
          <h1 className="text-[18px] font-semibold text-[#1a201c] dark:text-[#e8ece9]">
            Something went wrong
          </h1>
          <p className="max-w-sm text-[13px] leading-[1.5] text-[#5a625e] dark:text-[#a0a8a3]">
            An unexpected error broke this page. Reloading usually fixes it. If it
            keeps happening, please try again later.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            onClick={this.handleReload}
            className="h-10 cursor-pointer rounded-lg bg-[#5a8a6b] px-5 text-[13px] font-medium text-white transition-colors hover:bg-[#4f7a5e]"
          >
            Reload page
          </button>
          <a
            href="/"
            className="flex h-10 cursor-pointer items-center justify-center rounded-lg border border-black/[0.08] bg-white px-5 text-[13px] font-medium text-[#1a201c] transition-colors hover:bg-[#f6f6f1] dark:border-white/[0.07] dark:bg-[#1c221e] dark:text-[#e8ece9] dark:hover:bg-[#222b26]"
          >
            Go home
          </a>
        </div>
      </div>
    );
  }
}
