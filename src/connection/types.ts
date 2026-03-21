export type ConnectionStatus = "disconnected" | "connecting" | "connected" | "reconnecting";

export interface SerialPortInfo {
  path: string;
  manufacturer?: string;
}
