import * as React from "react";
import { XFrames } from "@xframes/node";
import { useRfStatus, useHwStatus } from "../hooks/useMonHw";
import { themeColors } from "../themes";
import { SectionHeader } from "../components/SectionHeader";

const ANTENNA_STATUS: Record<number, string> = {
  0: "Init",
  1: "Unknown",
  2: "OK",
  3: "Short",
  4: "Open",
};

const ANTENNA_COLORS: Record<number, string> = {
  0: themeColors.lightSlate,
  1: themeColors.lightSlate,
  2: "#2ecc71",
  3: "#e74c3c",
  4: "#e74c3c",
};

const ANTENNA_POWER: Record<number, string> = {
  0: "Off",
  1: "On",
  2: "Unknown",
};

const JAMMING_STATE: Record<number, string> = {
  0: "Unknown",
  1: "OK",
  2: "Warning",
  3: "Critical",
};

const JAMMING_COLORS: Record<number, string> = {
  0: themeColors.lightSlate,
  1: "#2ecc71",
  2: "#f1c40f",
  3: "#e74c3c",
};

function jamIndColor(val: number): string {
  if (val < 50) return "#2ecc71";
  if (val < 150) return "#f1c40f";
  return "#e74c3c";
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

export const HardwareStatusPanel = () => {
  const rf = useRfStatus();
  const hw = useHwStatus();

  if (!rf && !hw) {
    return (
      <XFrames.Node style={{ padding: { all: 8 } }}>
        <XFrames.UnformattedText
          text="No data \u2014 connect to a receiver"
          style={{ color: themeColors.lightSlate }}
        />
      </XFrames.Node>
    );
  }

  return (
    <XFrames.Node style={{ padding: { all: 8 }, gap: { row: 4 } }}>
      {rf && (
        <>
          <SectionHeader text="RF Status" />
          <LabelRow
            label="Antenna:"
            value={ANTENNA_STATUS[rf.aStatus] ?? `Unknown (${rf.aStatus})`}
            color={ANTENNA_COLORS[rf.aStatus]}
          />
          <LabelRow
            label="Ant Power:"
            value={ANTENNA_POWER[rf.aPower] ?? `Unknown (${rf.aPower})`}
          />
          <LabelRow
            label="Jamming:"
            value={JAMMING_STATE[rf.jammingState] ?? `Unknown (${rf.jammingState})`}
            color={JAMMING_COLORS[rf.jammingState]}
          />
          <LabelRow
            label="Jam Index:"
            value={String(rf.jamInd)}
            color={jamIndColor(rf.jamInd)}
          />
          <LabelRow label="Noise:" value={`${rf.noisePerMS} counts/ms`} />
          <LabelRow label="AGC:" value={String(rf.agcCnt)} />
          {rf.rtcCalib !== undefined && (
            <LabelRow label="RTC Calib:" value={rf.rtcCalib ? "Yes" : "No"} />
          )}
          {rf.safeBoot !== undefined && (
            <LabelRow label="Safe Boot:" value={rf.safeBoot ? "Yes" : "No"} />
          )}
          {rf.xtalAbsent !== undefined && (
            <LabelRow
              label="XTAL:"
              value={rf.xtalAbsent ? "Absent" : "Present"}
              color={rf.xtalAbsent ? "#e74c3c" : undefined}
            />
          )}
        </>
      )}
      {hw && (
        <>
          <SectionHeader text="Hardware" />
          <LabelRow label="HW Version:" value={hw.hwVersion} />
          <LabelRow label="Pins:" value={String(hw.nPins)} />
          <LabelRow label="Flags:" value={`0x${hw.flags.toString(16).padStart(2, "0")}`} />
        </>
      )}
    </XFrames.Node>
  );
};
