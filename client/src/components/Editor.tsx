import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { useKeystrokeLogger } from "../hooks/useKeystrokeLogger";
import Toast from "./Toast";

const DEBOUNCE_MS = 500;

const Editor = () => {
  const [text, setText] = useState("");
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const { handleKeyDown, handleKeyUp, logPaste, flushKeystrokes } =
    useKeystrokeLogger();

  const sessionIdRef = useRef<string | null>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getToken = () => localStorage.getItem("token");

  const ensureSession = useCallback(async (content: string, initialKeystrokes: ReturnType<typeof flushKeystrokes>) => {
    if (sessionIdRef.current) return sessionIdRef.current;

    const res = await axios.post(
      "http://localhost:5000/api/session",
      { content, keystrokes: initialKeystrokes },
      { headers: { Authorization: `Bearer ${getToken()}` } }
    );

    sessionIdRef.current = res.data.sessionId;
    return sessionIdRef.current;
  }, []);

  const syncToServer = useCallback(async (content: string, pendingKeystrokes: ReturnType<typeof flushKeystrokes>) => {
    try {
      const id = await ensureSession(content, pendingKeystrokes);

      if (id && sessionIdRef.current) {
        await axios.patch(
          `http://localhost:5000/api/session/${id}`,
          { content, keystrokes: pendingKeystrokes },
          { headers: { Authorization: `Bearer ${getToken()}` } }
        );
      }
    } catch (err) {
      console.error(err);
      setToast({ message: "Failed to sync session.", type: "error" });
    }
  }, [ensureSession]);

  const scheduleSync = useCallback((content: string) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(() => {
      const pending = flushKeystrokes();
      syncToServer(content, pending);
    }, DEBOUNCE_MS);
  }, [flushKeystrokes, syncToServer]);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setText(value);
    scheduleSync(value);
  };

  return (
    <div className="editor-wrapper">
      <textarea
        placeholder="Start writing..."
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onPaste={(e) => {
          logPaste(e);
          scheduleSync(text);
        }}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default Editor;