import * as React from "react";
import { XFrames } from "@xframes/node";
import { useNavPvt } from "../hooks/useNavPvt";
import { useNavStatus } from "../hooks/useNavStatus";
import { useNavDop } from "../hooks/useNavDop";
import { themeColors } from "../themes";

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
      style={{ width: 100, color: themeColors.lightSlate }}
    />
    <XFrames.UnformattedText
      text={value}
      style={color ? { color } : undefined}
    />
  </XFrames.Node>
);

const SPOOF_LABELS: Record<number, string> = {
  0: "Unknown",
  1: "OK",
  2: "Indicated",
  3: "Multiple",
};

const SPOOF_COLORS: Record<number, string> = {
  0: themeColors.lightSlate,
  1: "#2ecc71",
  2: "#f1c40f",
  3: "#e74c3c",
};

function dopColor(val: number): string {
  if (val < 2) return "#2ecc71";   // excellent
  if (val <= 5) return "#f1c40f";  // moderate
  return "#e74c3c";                // poor
}

function formatUptime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}:${pad2(m)}:${pad2(s)}`;
  return `${m}:${pad2(s)}`;
}

export const NavigationStatus = () => {
  const data = useNavPvt();
  const navStatus = useNavStatus();
  const dop = useNavDop();

  if (!data) {
    return (
      <XFrames.Node style={{ padding: { all: 8 } }}>
        <XFrames.UnformattedText
          text="No data \u2014 connect to a receiver"
          style={{ color: themeColors.lightSlate }}
        />
      </XFrames.Node>
    );
  }

  const fixLabel = FIX_TYPES[data.fixType] ?? `Unknown (${data.fixType})`;
  const fixColor = FIX_COLORS[data.fixType] ?? themeColors.lightSlate;
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
      {navStatus && (
        <>
          {navStatus.ttff > 0 && (
            <LabelRow label="TTFF:" value={`${(navStatus.ttff / 1000).toFixed(1)}s`} />
          )}
          <LabelRow label="Uptime:" value={formatUptime(navStatus.msss)} />
          <LabelRow
            label="Spoof:"
            value={SPOOF_LABELS[navStatus.spoofDetState] ?? `Unknown (${navStatus.spoofDetState})`}
            color={SPOOF_COLORS[navStatus.spoofDetState]}
          />
          <LabelRow label="DGPS:" value={navStatus.diffCorr ? "Yes" : "No"} />
        </>
      )}
      {dop && (
        <>
          <LabelRow label="PDOP:" value={dop.pDOP.toFixed(1)} color={dopColor(dop.pDOP)} />
          <LabelRow label="HDOP:" value={dop.hDOP.toFixed(1)} color={dopColor(dop.hDOP)} />
          <LabelRow label="VDOP:" value={dop.vDOP.toFixed(1)} color={dopColor(dop.vDOP)} />
          <LabelRow label="GDOP:" value={dop.gDOP.toFixed(1)} color={dopColor(dop.gDOP)} />
          <LabelRow label="TDOP:" value={dop.tDOP.toFixed(1)} color={dopColor(dop.tDOP)} />
        </>
      )}
    </XFrames.Node>
  );
};
