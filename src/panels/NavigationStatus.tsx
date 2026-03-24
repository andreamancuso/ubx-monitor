import * as React from "react";
import { XFrames } from "@xframes/node";
import { ComboChangeEvent } from "@xframes/common";
import { useNavPvt } from "../hooks/useNavPvt";
import { useNavStatus } from "../hooks/useNavStatus";
import { useNavDop } from "../hooks/useNavDop";
import { themeColors } from "../themes";
import { LabelRow } from "../components/LabelRow";
import { getConfig, updateConfig } from "../connection/config";
import { formatDuration } from "../utils/format";

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

const COORD_FORMATS = ["DD", "DMS", "DDM"];

function formatDD(deg: number): string {
  return `${deg.toFixed(7)}\u00B0`;
}

function formatDMS(deg: number, isLat: boolean): string {
  const abs = Math.abs(deg);
  const d = Math.floor(abs);
  const minFloat = (abs - d) * 60;
  const m = Math.floor(minFloat);
  const s = ((minFloat - m) * 60).toFixed(2);
  const dir = isLat ? (deg >= 0 ? "N" : "S") : (deg >= 0 ? "E" : "W");
  return `${d}\u00B0 ${m}' ${s}" ${dir}`;
}

function formatDDM(deg: number, isLat: boolean): string {
  const abs = Math.abs(deg);
  const d = Math.floor(abs);
  const m = ((abs - d) * 60).toFixed(5);
  const dir = isLat ? (deg >= 0 ? "N" : "S") : (deg >= 0 ? "E" : "W");
  return `${d}\u00B0 ${m}' ${dir}`;
}

function formatLat(deg: number, fmt: number): string {
  if (fmt === 1) return formatDMS(deg, true);
  if (fmt === 2) return formatDDM(deg, true);
  return formatDD(deg);
}

function formatLon(deg: number, fmt: number): string {
  if (fmt === 1) return formatDMS(deg, false);
  if (fmt === 2) return formatDDM(deg, false);
  return formatDD(deg);
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
  return formatDuration(Math.floor(ms / 1000));
}

export const NavigationStatus = () => {
  const data = useNavPvt();
  const navStatus = useNavStatus();
  const dop = useNavDop();
  const [coordFormat, setCoordFormat] = React.useState(getConfig().coordFormat ?? 0);

  const handleCoordFormatChange = React.useCallback((e: ComboChangeEvent) => {
    const idx = e.nativeEvent.value;
    setCoordFormat(idx);
    updateConfig({ coordFormat: idx });
  }, []);

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
      <XFrames.Node style={{ flexDirection: "row", gap: { column: 8 }, height: 22, alignItems: "center" }}>
        <XFrames.UnformattedText text="Coord:" style={{ width: 100, color: themeColors.lightSlate }} />
        <XFrames.Combo
          options={COORD_FORMATS}
          initialSelectedIndex={coordFormat}
          onChange={handleCoordFormatChange}
          style={{ width: 100 }}
        />
      </XFrames.Node>
      <LabelRow label="Fix:" value={fixLabel} color={fixColor} />
      <LabelRow label="Latitude:" value={formatLat(data.lat, coordFormat)} />
      <LabelRow label="Longitude:" value={formatLon(data.lon, coordFormat)} />
      <LabelRow label="Altitude:" value={`${formatAlt(data.hMSL)} m (MSL)`} />
      <LabelRow label="H Accuracy:" value={`${formatMeters(data.hAcc)} m`} />
      <LabelRow label="V Accuracy:" value={`${formatMeters(data.vAcc)} m`} />
      <LabelRow label="Satellites:" value={String(data.numSV)} />
      <LabelRow label="UTC Time:" value={utc} />
      {navStatus && (
        <>
          {navStatus.ttff > 0 && (
            <LabelRow label="TTFF:" value={formatUptime(navStatus.ttff)} />
          )}
          <LabelRow label="Uptime:" value={formatUptime(navStatus.msss)} />
          <LabelRow
            label="Spoof:"
            value={SPOOF_LABELS[navStatus.spoofDetState] ?? `Unknown (${navStatus.spoofDetState})`}
            color={SPOOF_COLORS[navStatus.spoofDetState]}
          />
          <LabelRow label="DGPS:" value={navStatus.diffCorr ? "Yes" : "No"} color={navStatus.diffCorr ? "#2ecc71" : themeColors.lightSlate} />
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
