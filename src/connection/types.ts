export type ConnectionStatus = "disconnected" | "connecting" | "connected";

export interface SerialPortInfo {
  path: string;
  manufacturer?: string;
}
