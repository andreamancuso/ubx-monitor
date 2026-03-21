import * as React from "react";
import { useRef, useEffect } from "react";
import { XFrames } from "@xframes/node";
import { PlotBarImperativeHandle } from "@xframes/common";
import { useNavSat, SatInfo } from "../hooks/useNavSat";
import { themeColors } from "../themes";

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

const SERIES_DEFS = [
  { label: "Weak (<20)" },
  { label: "Moderate (20-30)" },
  { label: "Good (30-40)" },
  { label: "Excellent (≥40)" },
];

function cnoSeriesIndex(cno: number): number {
  if (cno < 20) return 0;
  if (cno < 30) return 1;
  if (cno < 40) return 2;
  return 3;
}

export const SignalStrengthPanel = () => {
  const satellites = useNavSat();
  const barRef = useRef<PlotBarImperativeHandle>(null);

  useEffect(() => {
    if (!satellites || !barRef.current) return;

    const sorted = satellites
      .filter((s) => s.cno > 0)
      .sort((a, b) => a.gnssId - b.gnssId || a.svid - b.svid);

    const labels = sorted.map(satLabel);

    const seriesData: { data: { x: number; y: number }[]; tickLabels?: string[] }[] = [
      { data: [], tickLabels: labels },
      { data: [] },
      { data: [] },
      { data: [] },
    ];

    sorted.forEach((s, i) => {
      const idx = cnoSeriesIndex(s.cno);
      seriesData[idx].data.push({ x: i, y: s.cno });
    });

    barRef.current.setSeriesData(seriesData);
  }, [satellites]);

  if (!satellites) {
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
    <XFrames.Node style={{ flex: 1, padding: { all: 8 } }}>
      <XFrames.PlotBar
        ref={barRef}
        axisAutoFit
        showLegend
        yAxisLabel="CNO (dB-Hz)"
        series={SERIES_DEFS}
        style={{ flex: 1, width: "100%" }}
      />
    </XFrames.Node>
  );
};
