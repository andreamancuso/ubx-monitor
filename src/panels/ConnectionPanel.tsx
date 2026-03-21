import * as React from "react";
import { useState, useCallback, useEffect, useRef } from "react";
import { XFrames } from "@xframes/node";
import { ComboChangeEvent } from "@xframes/common";
import { useSerialConnection } from "../hooks/useSerialConnection";
import { loadConfig, saveConfig } from "../connection/config";
import { themeColors } from "../themes";

const BAUD_RATES = ["9600", "38400", "115200", "921600"];
const DEFAULT_BAUD_INDEX = 1; // 38400

const savedConfig = loadConfig();

const statusColors: Record<string, string> = {
  disconnected: "#e74c3c",
  connecting: "#f1c40f",
  connected: "#2ecc71",
};

const disabledComboStyle = {
  width: 250,
  color: themeColors.slate,
  backgroundColor: themeColors.deepNavy,
};

export const ConnectionPanel = () => {
  const { ports, status, error, connect, disconnect, refreshPorts, enableUbxOutput, coldStart, warmStart, hotStart } =
    useSerialConnection();
  const savedBaudIndex = savedConfig.baudRate
    ? BAUD_RATES.indexOf(String(savedConfig.baudRate))
    : -1;
  const [selectedPortIndex, setSelectedPortIndex] = useState(0);
  const [selectedBaudIndex, setSelectedBaudIndex] = useState(
    savedBaudIndex >= 0 ? savedBaudIndex : DEFAULT_BAUD_INDEX
  );

  const configApplied = useRef(false);
  useEffect(() => {
    if (configApplied.current || ports.length === 0 || !savedConfig.portPath) return;
    configApplied.current = true;
    const idx = ports.findIndex((p) => p.path === savedConfig.portPath);
    if (idx >= 0) {
      setSelectedPortIndex(idx);
    }
  }, [ports]);

  const isConnected = status === "connected" || status === "connecting";

  const portOptions = ports.length > 0
    ? ports.map((p) => p.manufacturer ? `${p.path} (${p.manufacturer})` : p.path)
    : ["No ports found"];

  const handlePortChange = useCallback((e: ComboChangeEvent) => {
    setSelectedPortIndex(e.nativeEvent.value);
  }, []);

  const handleBaudChange = useCallback((e: ComboChangeEvent) => {
    setSelectedBaudIndex(e.nativeEvent.value);
  }, []);

  const handleConnectDisconnect = useCallback(() => {
    if (isConnected) {
      disconnect();
    } else if (ports.length > 0) {
      const port = ports[selectedPortIndex];
      const baudRate = parseInt(BAUD_RATES[selectedBaudIndex], 10);
      saveConfig({ portPath: port.path, baudRate });
      connect(port.path, baudRate);
    }
  }, [isConnected, ports, selectedPortIndex, selectedBaudIndex, connect, disconnect]);

  return (
    <XFrames.Node style={{ padding: { all: 8 }, gap: { row: 8 } }}>
      <XFrames.Node style={{ flexDirection: "row", gap: { column: 8 }, alignItems: "center" }}>
        <XFrames.UnformattedText text="Port:" />
        <XFrames.Combo
          options={portOptions}
          initialSelectedIndex={selectedPortIndex}
          onChange={isConnected ? undefined : handlePortChange}
          style={isConnected ? disabledComboStyle : { width: 250 }}
        />
        {!isConnected && (
          <XFrames.Button label="Refresh" onClick={refreshPorts} />
        )}
      </XFrames.Node>

      <XFrames.Node style={{ flexDirection: "row", gap: { column: 8 }, alignItems: "center" }}>
        <XFrames.UnformattedText text="Baud:" />
        <XFrames.Combo
          options={BAUD_RATES}
          initialSelectedIndex={selectedBaudIndex}
          onChange={isConnected ? undefined : handleBaudChange}
          style={isConnected
            ? { ...disabledComboStyle, width: 150 }
            : { width: 150 }
          }
        />
      </XFrames.Node>

      <XFrames.Node style={{ flexDirection: "row", gap: { column: 8 }, alignItems: "center" }}>
        <XFrames.Button
          label={isConnected ? "Disconnect" : "Connect"}
          onClick={handleConnectDisconnect}
        />
        <XFrames.Button
          label="Enable UBX"
          onClick={status === "connected" ? enableUbxOutput : undefined}
        />
        <XFrames.ColorIndicator
          color={statusColors[status]}
          shape="circle"
          style={{ width: 16, height: 16 }}
        />
        <XFrames.UnformattedText text={status} />
      </XFrames.Node>

      {status === "connected" && (
        <XFrames.Node style={{ flexDirection: "row", gap: { column: 8 }, alignItems: "center" }}>
          <XFrames.Button label="Cold Start" onClick={coldStart} />
          <XFrames.Button label="Warm Start" onClick={warmStart} />
          <XFrames.Button label="Hot Start" onClick={hotStart} />
        </XFrames.Node>
      )}

      {error && (
        <XFrames.UnformattedText
          text={`Error: ${error}`}
          style={{ color: "#e74c3c" }}
        />
      )}
    </XFrames.Node>
  );
};
