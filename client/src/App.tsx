import { useEffect, useState } from "react";
import Editor from "./components/Editor";
import Auth from "./components/Auth";
import Home from "./components/Home";
import "./styles.css";

type View =
  | { name: "auth" }
  | { name: "home" }
  | { name: "editor"; sessionId: string | null; initialContent: string; initialTitle: string };

function App() {
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    const saved = localStorage.getItem("theme") as "dark" | "light" | null;
    if (saved) return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  const [view, setView] = useState<View>(() =>
    localStorage.getItem("token")
      ? { name: "home" }
      : { name: "auth" }
  );

  useEffect(() => {
    if (theme === "light") {
      document.documentElement.setAttribute("data-theme", "light");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    setView({ name: "auth" });
  };

  const isAuth = view.name !== "auth";

  return (
    <div className="app">
      <div className="app-header">
        <div className="header-inner">
          <div className="header-left">
            <label className="theme-switch">
              <input
                type="checkbox"
                checked={theme === "light"}
                onChange={toggleTheme}
              />
              <span className="slider" />
            </label>
          </div>

          <h1
            className="header-title"
            style={{ cursor: isAuth ? "pointer" : "default" }}
            onClick={() => isAuth && setView({ name: "home" })}
          >
            Vi-Notes
          </h1>

          <div className="header-right">
            {isAuth && (
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="app-content">
        {view.name === "auth" && (
          <Auth onAuth={() => setView({ name: "home" })} />
        )}

        {view.name === "home" && (
          <Home
            onOpen={(sessionId, content, title) =>
              setView({ name: "editor", sessionId, initialContent: content, initialTitle: title })
            }
            onNew={() =>
              setView({ name: "editor", sessionId: null, initialContent: "", initialTitle: "" })
            }
          />
        )}

        {view.name === "editor" && (
          <Editor
            key={view.sessionId ?? "new"}
            existingSessionId={view.sessionId}
            initialContent={view.initialContent}
            initialTitle={view.initialTitle}
            onBack={() => setView({ name: "home" })}
          />
        )}
      </div>
    </div>
  );
}

export default App;