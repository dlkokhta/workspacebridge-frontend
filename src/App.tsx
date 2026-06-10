import "./App.css";
import { AppRouter } from "./router";
import { SessionTimeoutWarning } from "./components/SessionTimeoutWarning";

function App() {
  return (
    <>
      <SessionTimeoutWarning />
      <AppRouter />
    </>
  );
}

export default App;
