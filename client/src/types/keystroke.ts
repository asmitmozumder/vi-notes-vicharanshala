export interface Keystroke {
  action: "down" | "up" | "paste";
  timestamp: number;
  duration?: number;
  pasteLength?: number;
}