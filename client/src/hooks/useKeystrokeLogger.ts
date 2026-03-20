import { useState } from "react";
import type { Keystroke } from "../types/keystroke";

export const useKeystrokeLogger = () => {
  const [keystrokes, setKeystrokes] = useState<Keystroke[]>([]);

  const logEvent = (key: string, action: "down" | "up" | "paste") => {
    setKeystrokes((prev) => [
      ...prev,
      {
        key,
        timestamp: Date.now(),
        action,
      },
    ]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    logEvent(e.key, "down");
  };

  const handleKeyUp = (e: React.KeyboardEvent) => {
    logEvent(e.key, "up");
  };

  const logPaste = () => {
    logEvent("PASTE", "paste");
  };

  return { keystrokes, handleKeyDown, handleKeyUp, logPaste };
};