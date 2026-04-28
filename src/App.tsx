import "./App.css";
import { AppRouter } from "./router";
import { ThemeToggle } from "./components/ThemeToggle";

function App() {
  return (
    <>
      <AppRouter />
      <ThemeToggle />
    </>
  );
}

export default App;
