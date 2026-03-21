import { useState, useEffect, useCallback } from "react";
import { serialManager } from "../connection";
import type { ConnectionStatus, SerialPortInfo } from "../connection";

export function useSerialConnection() {
  const [ports, setPorts] = useState<SerialPortInfo[]>([]);
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [error, setError] = useState<string | null>(null);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);

  useEffect(() => {
    serialManager.listPorts().then(setPorts).catch(() => {});

    const onStatus = (s: ConnectionStatus) => {
      setStatus(s);
      if (s === "connected") {
        setError(null);
        setReconnectAttempt(0);
      }
      if (s === "disconnected") {
        setReconnectAttempt(0);
      }
    };
    const onError = (msg: string) => setError(msg);
    const onReconnectAttempt = (attempt: number) => setReconnectAttempt(attempt);

    serialManager.on("status", onStatus);
    serialManager.on("error", onError);
    serialManager.on("reconnect_attempt", onReconnectAttempt);

    return () => {
      serialManager.off("status", onStatus);
      serialManager.off("error", onError);
      serialManager.off("reconnect_attempt", onReconnectAttempt);
    };
  }, []);

  const connect = useCallback((path: string, baudRate: number) => {
    setError(null);
    serialManager.connect(path, baudRate);
  }, []);

  const disconnect = useCallback(() => {
    serialManager.disconnect();
  }, []);

  const refreshPorts = useCallback(() => {
    serialManager.listPorts().then(setPorts).catch(() => {});
  }, []);

  const enableUbxOutput = useCallback(() => {
    serialManager.enableUbxOutput();
  }, []);

  const coldStart = useCallback(() => { serialManager.coldStart(); }, []);
  const warmStart = useCallback(() => { serialManager.warmStart(); }, []);
  const hotStart = useCallback(() => { serialManager.hotStart(); }, []);

  return { ports, status, error, reconnectAttempt, connect, disconnect, refreshPorts, enableUbxOutput, coldStart, warmStart, hotStart };
}
