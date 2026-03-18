import { useState, useEffect, useCallback } from "react";
import { serialManager } from "../connection";
import type { ConnectionStatus, SerialPortInfo } from "../connection";

export function useSerialConnection() {
  const [ports, setPorts] = useState<SerialPortInfo[]>([]);
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    serialManager.listPorts().then(setPorts).catch(() => {});

    const onStatus = (s: ConnectionStatus) => {
      setStatus(s);
      if (s === "connected") setError(null);
    };
    const onError = (msg: string) => setError(msg);

    serialManager.on("status", onStatus);
    serialManager.on("error", onError);

    return () => {
      serialManager.off("status", onStatus);
      serialManager.off("error", onError);
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

  return { ports, status, error, connect, disconnect, refreshPorts, enableUbxOutput };
}
