import { useRef, useState } from "react";
import type { Keystroke } from "../types/keystroke";

export const useKeystrokeLogger = () => {
  const [keystrokes, setKeystrokes] = useState<Keystroke[]>([]);
  const downTimestamps = useRef<Map<string, number>>(new Map());

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const now = Date.now();
    downTimestamps.current.set(e.code, now);

    setKeystrokes((prev) => [
      ...prev,
      { action: "down", timestamp: now },
    ]);
  };

  const handleKeyUp = (e: React.KeyboardEvent) => {
    const now = Date.now();
    const downAt = downTimestamps.current.get(e.code);
    downTimestamps.current.delete(e.code);

    const duration = downAt !== undefined ? now - downAt : undefined;

    setKeystrokes((prev) => [
      ...prev,
      { action: "up", timestamp: now, ...(duration !== undefined && { duration }) },
    ]);
  };

  const logPaste = (e: React.ClipboardEvent) => {
    const pasteLength = e.clipboardData.getData("text").length;

    setKeystrokes((prev) => [
      ...prev,
      { action: "paste", timestamp: Date.now(), pasteLength },
    ]);
  };

  const flushKeystrokes = (): Keystroke[] => {
    const pending = keystrokes;
    setKeystrokes([]);
    return pending;
  };

  return { keystrokes, handleKeyDown, handleKeyUp, logPaste, flushKeystrokes };
};