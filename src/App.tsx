import "./App.css";
import { AppRouter } from "./router";
import { SessionTimeoutWarning } from "./components/SessionTimeoutWarning";
import { ErrorBoundary } from "./components/ErrorBoundary";

function App() {
  return (
    <>
      <SessionTimeoutWarning />
      {/* Inner boundary keeps the providers/toasts mounted if a page crashes. */}
      <ErrorBoundary>
        <AppRouter />
      </ErrorBoundary>
    </>
  );
}

export default App;
