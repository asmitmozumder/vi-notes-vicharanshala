import { useState } from "react";
import axios from "axios";
import { useKeystrokeLogger } from "../hooks/useKeystrokeLogger";
import Toast from "./Toast";

const Editor = () => {
  const [text, setText] = useState("");
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const { keystrokes, handleKeyDown, handleKeyUp, logPaste } =
    useKeystrokeLogger();

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");

      console.log("TOKEN SENT:", token); // 🔍 debug

      await axios.post(
        "http://localhost:5000/api/session",
        {
          content: text,
          keystrokes,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // ✅ FIXED
          },
        }
      );

      setToast({
        message: "Session saved successfully",
        type: "success",
      });
    } catch (err) {
      console.error(err);

      setToast({
        message: "Unauthorized. Please login again.",
        type: "error",
      });
    }
  };

  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  };

  return (
    <div className="editor-wrapper">
      <textarea
        placeholder="Start writing..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onPaste={logPaste}
      />

      <button onClick={handleSave}>Save</button>

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