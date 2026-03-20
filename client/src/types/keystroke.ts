export interface Keystroke {
  key: string;
  timestamp: number;
  action: "down" | "up" | "paste";
}