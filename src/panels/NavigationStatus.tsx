import * as React from "react";
import { XFrames } from "@xframes/node";
import { useNavPvt } from "../hooks/useNavPvt";

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

function formatCoord(deg: number): string {
  return deg.toFixed(7);
}

function formatMeters(mm: number): string {
  return (mm / 1000).toFixed(3);
}

function formatAlt(mm: number): string {
  return (mm / 1000).toFixed(1);
}

function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}

const LabelRow = ({ label, value, color }: { label: string; value: string; color?: string }) => (
  <XFrames.Node style={{ flexDirection: "row", gap: { column: 8 }, height: 22 }}>
    <XFrames.UnformattedText
      text={label}
      style={{ width: 100, color: "#7a7b9a" }}
    />
    <XFrames.UnformattedText
      text={value}
      style={color ? { color } : undefined}
    />
  </XFrames.Node>
);

export const NavigationStatus = () => {
  const data = useNavPvt();

  if (!data) {
    return (
      <XFrames.Node style={{ padding: { all: 8 } }}>
        <XFrames.UnformattedText
          text="No data \u2014 connect to a receiver"
          style={{ color: "#7a7b9a" }}
        />
      </XFrames.Node>
    );
  }

  const fixLabel = FIX_TYPES[data.fixType] ?? `Unknown (${data.fixType})`;
  const fixColor = FIX_COLORS[data.fixType] ?? "#7a7b9a";
  const utc = `${data.year}-${pad2(data.month)}-${pad2(data.day)} ${pad2(data.hour)}:${pad2(data.min)}:${pad2(data.sec)}`;

  return (
    <XFrames.Node style={{ padding: { all: 8 }, gap: { row: 4 } }}>
      <LabelRow label="Fix:" value={fixLabel} color={fixColor} />
      <LabelRow label="Latitude:" value={`${formatCoord(data.lat)}\u00B0`} />
      <LabelRow label="Longitude:" value={`${formatCoord(data.lon)}\u00B0`} />
      <LabelRow label="Altitude:" value={`${formatAlt(data.hMSL)} m (MSL)`} />
      <LabelRow label="H Accuracy:" value={`${formatMeters(data.hAcc)} m`} />
      <LabelRow label="V Accuracy:" value={`${formatMeters(data.vAcc)} m`} />
      <LabelRow label="Satellites:" value={String(data.numSV)} />
      <LabelRow label="UTC Time:" value={utc} />
    </XFrames.Node>
  );
};
