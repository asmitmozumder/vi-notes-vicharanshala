import { useEffect, useState } from "react";
import Editor from "./components/Editor";
import Auth from "./components/Auth";
import "./styles.css";

function App() {
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    const saved = localStorage.getItem("theme") as "dark" | "light" | null;
    if (saved) return saved;

    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    return prefersDark ? "dark" : "light";
  });

  const [isAuth, setIsAuth] = useState(!!localStorage.getItem("token"));

  useEffect(() => {
    if (theme === "light") {
      document.documentElement.setAttribute("data-theme", "light");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }

    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuth(false);
  };

  return (
    <div className="app">
      <div className="app-header">
        <h1>Vi-Notes Editor</h1>

        <label className="theme-switch">
          <input
            type="checkbox"
            checked={theme === "light"}
            onChange={toggleTheme}
          />
          <span className="slider" />
        </label>

        {isAuth && (
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        )}
      </div>

      {!isAuth ? (
        <Auth onAuth={() => setIsAuth(true)} />
      ) : (
        <Editor />
      )}
    </div>
  );
}

export default App;