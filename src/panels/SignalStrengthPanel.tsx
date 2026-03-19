import * as React from "react";
import { useRef, useEffect } from "react";
import { XFrames } from "@xframes/node";
import { PlotBarImperativeHandle } from "@xframes/common";
import { useNavSat, SatInfo } from "../hooks/useNavSat";

const GNSS_PREFIX: Record<number, string> = {
  0: "G",   // GPS
  1: "S",   // SBAS
  2: "E",   // Galileo
  3: "C",   // BeiDou
  5: "Q",   // QZSS
  6: "R",   // GLONASS
};

function satLabel(sat: SatInfo): string {
  const prefix = GNSS_PREFIX[sat.gnssId] ?? "?";
  return `${prefix}${sat.svid}`;
}

export const SignalStrengthPanel = () => {
  const satellites = useNavSat();
  const barRef = useRef<PlotBarImperativeHandle>(null);

  useEffect(() => {
    if (!satellites || !barRef.current) return;

    const sorted = satellites
      .filter((s) => s.cno > 0)
      .sort((a, b) => a.gnssId - b.gnssId || a.svid - b.svid);

    const data = sorted.map((s, i) => ({ x: i, y: s.cno }));
    const labels = sorted.map(satLabel);

    barRef.current.setData(data, labels);
  }, [satellites]);

  if (!satellites) {
    return (
      <XFrames.Node style={{ padding: { all: 8 } }}>
        <XFrames.UnformattedText
          text="No data \u2014 connect to a receiver"
          style={{ color: "#7a7b9a" }}
        />
      </XFrames.Node>
    );
  }

  return (
    <XFrames.Node style={{ flex: 1, padding: { all: 8 } }}>
      <XFrames.PlotBar
        ref={barRef}
        axisAutoFit
        yAxisLabel="CNO (dB-Hz)"
        style={{ flex: 1, width: "100%" }}
      />
    </XFrames.Node>
  );
};
