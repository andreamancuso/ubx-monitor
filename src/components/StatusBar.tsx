import * as React from "react";
import { XFrames } from "@xframes/node";
import { useSerialConnection } from "../hooks/useSerialConnection";
import { useUbxMessages } from "../hooks/useUbxMessages";
import { useNavPvt } from "../hooks/useNavPvt";
import { themeColors } from "../themes";

const STATUS_COLORS: Record<string, string> = {
  disconnected: "#e74c3c",
  connecting: "#f1c40f",
  connected: "#2ecc71",
};

const FIX_TYPES: Record<number, string> = {
  0: "No Fix",
  1: "Dead Reckoning",
  2: "2D",
  3: "3D",
  4: "3D+DR",
  5: "Time Only",
};

const FIX_COLORS: Record<number, string> = {
  0: "#e74c3c",
  1: "#e67e22",
  2: "#f1c40f",
  3: "#2ecc71",
  4: "#27ae60",
  5: "#3498db",
};

const dividerStyle = { color: themeColors.slate };
const labelStyle = { color: themeColors.lightSlate };

export const StatusBar = () => {
  const { status } = useSerialConnection();
  const { messageRate } = useUbxMessages();
  const data = useNavPvt();

  const fixLabel = data ? (FIX_TYPES[data.fixType] ?? `Unknown (${data.fixType})`) : "\u2014";
  const fixColor = data ? (FIX_COLORS[data.fixType] ?? themeColors.lightSlate) : themeColors.lightSlate;
  const satCount = data?.numSV ?? 0;

  return (
    <XFrames.Node
      style={{
        flexDirection: "row",
        height: 28,
        alignItems: "center",
        gap: { column: 12 },
        padding: { left: 8, right: 8 },
      }}
    >
      <XFrames.ColorIndicator
        color={STATUS_COLORS[status] ?? themeColors.lightSlate}
        shape="circle"
        style={{ width: 12, height: 12 }}
      />
      <XFrames.UnformattedText text={status} style={labelStyle} />

      <XFrames.UnformattedText text="\u2502" style={dividerStyle} />

      <XFrames.UnformattedText text={`${messageRate} msg/s`} style={labelStyle} />

      <XFrames.UnformattedText text="\u2502" style={dividerStyle} />

      <XFrames.UnformattedText text={fixLabel} style={{ color: fixColor }} />
      <XFrames.UnformattedText text={`${satCount} sats`} style={labelStyle} />
    </XFrames.Node>
  );
};
