import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { useKeystrokeLogger } from "../hooks/useKeystrokeLogger";
import Toast from "./Toast";

const DEBOUNCE_MS = 500;

interface EditorProps {
  existingSessionId: string | null;
  initialContent: string;
  initialTitle: string;
  onBack: () => void;
}

const Editor = ({ existingSessionId, initialContent, initialTitle, onBack }: EditorProps) => {
  const [text, setText] = useState(initialContent);
  const [title, setTitle] = useState(initialTitle);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const { handleKeyDown, handleKeyUp, logPaste, flushKeystrokes } =
    useKeystrokeLogger();

  // session id for this writing session - may be pre-existing or created on first keystroke
  const sessionIdRef = useRef<string | null>(existingSessionId);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getToken = () => localStorage.getItem("token");

  // creates a session if one doesn't exist yet (keystroke-only, content is empty string)
  const ensureSession = useCallback(async () => {
    if (sessionIdRef.current) return sessionIdRef.current;

    const res = await axios.post(
      "http://localhost:5000/api/session",
      { content: "", keystrokes: [], title: "" },
      { headers: { Authorization: `Bearer ${getToken()}` } }
    );

    sessionIdRef.current = res.data.sessionId;
    return sessionIdRef.current;
  }, []);

  // flushes pending keystrokes to the server — does NOT save content
  const syncKeystrokes = useCallback(async (pendingKeystrokes: ReturnType<typeof flushKeystrokes>) => {
    if (pendingKeystrokes.length === 0) return;

    try {
      const id = await ensureSession();
      if (!id) return;

      await axios.patch(
        `http://localhost:5000/api/session/${id}`,
        { keystrokes: pendingKeystrokes },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
    } catch (err) {
      console.error("Keystroke sync failed", err);
    }
  }, [ensureSession]);

  const scheduleKeystrokeSync = useCallback(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(() => {
      const pending = flushKeystrokes();
      syncKeystrokes(pending);
    }, DEBOUNCE_MS);
  }, [flushKeystrokes, syncKeystrokes]);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    scheduleKeystrokeSync();
  };

  // saves content explicitly when the user clicks Save
  const handleSave = async () => {
    setSaving(true);
    try {
      const id = await ensureSession();
      if (!id) throw new Error("No session");

      // flush any remaining keystrokes along with the content save
      const pending = flushKeystrokes();
      if (debounceTimer.current) clearTimeout(debounceTimer.current);

      await axios.patch(
        `http://localhost:5000/api/session/${id}`,
        { content: text, keystrokes: pending, title },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );

      setToast({ message: "Saved.", type: "success" });
    } catch (err) {
      console.error(err);
      setToast({ message: "Failed to save.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="editor-wrapper">
      <div className="editor-topbar">
        <input
          className="title-input"
          type="text"
          placeholder="Untitled session"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
        />
        <button className="back-btn" onClick={onBack}>
          Back ←
        </button>
      </div>

      <textarea
        placeholder="Start writing…"
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onPaste={(e) => {
          logPaste(e);
          scheduleKeystrokeSync();
        }}
      />

      <div className="editor-footer">
        <button className="save-btn" onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </button>
      </div>

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