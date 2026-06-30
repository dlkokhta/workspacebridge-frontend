import "./App.css";
import { AppRouter } from "./router";
import { SessionTimeoutWarning } from "./components/SessionTimeoutWarning";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { BugReportWidget } from "./components/bugReport/BugReportWidget";

function App() {
  return (
    <>
      <SessionTimeoutWarning />
      {/* Inner boundary keeps the providers/toasts mounted if a page crashes. */}
      <ErrorBoundary>
        <AppRouter />
      </ErrorBoundary>
      {/* Outside the boundary so testers can still report from a crashed page. */}
      <BugReportWidget />
    </>
  );
}

export default App;
