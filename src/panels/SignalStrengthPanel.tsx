import * as React from "react";
import { useRef, useEffect, useMemo, useState, useCallback } from "react";
import { XFrames } from "@xframes/node";
import { PlotBarImperativeHandle, CheckboxChangeEvent } from "@xframes/common";
import { useNavSat, SatInfo } from "../hooks/useNavSat";
import { themeColors } from "../themes";
import { GNSS_PREFIX, GNSS_NAME, GNSS_COLOR, GNSS_IDS } from "../utils/gnss";
import { getConfig, updateConfig } from "../connection/config";

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
  const [sortByCno, setSortByCno] = useState(getConfig().signalSortByCno ?? false);

  const handleSortToggle = useCallback((e: CheckboxChangeEvent) => {
    const val = e.nativeEvent.value;
    setSortByCno(val);
    updateConfig({ signalSortByCno: val });
  }, []);

  const stats = useMemo(() => {
    if (!satellites) return null;

    const tracked = satellites.filter((s) => s.cno > 0);
    const totalTracked = tracked.length;
    if (totalTracked === 0) return null;

    const totalUsed = tracked.filter((s) => s.svUsed).length;
    const meanCno = tracked.reduce((sum, s) => sum + s.cno, 0) / totalTracked;

    const byConstellation = new Map<number, { count: number; used: number; sumCno: number }>();
    for (const s of tracked) {
      let entry = byConstellation.get(s.gnssId);
      if (!entry) {
        entry = { count: 0, used: 0, sumCno: 0 };
        byConstellation.set(s.gnssId, entry);
      }
      entry.count++;
      if (s.svUsed) entry.used++;
      entry.sumCno += s.cno;
    }

    const constellations = GNSS_IDS
      .filter((id) => byConstellation.has(id))
      .map((id) => {
        const e = byConstellation.get(id)!;
        return {
          gnssId: id,
          name: GNSS_NAME[id] ?? `ID${id}`,
          color: GNSS_COLOR[id] ?? "#888888",
          count: e.count,
          used: e.used,
          meanCno: e.sumCno / e.count,
        };
      });

    return { totalTracked, totalUsed, meanCno, constellations };
  }, [satellites]);

  useEffect(() => {
    if (!satellites || !barRef.current) return;

    const sorted = satellites
      .filter((s) => s.cno > 0)
      .sort((a, b) =>
        sortByCno
          ? b.cno - a.cno
          : a.gnssId - b.gnssId || a.svid - b.svid
      );

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
  }, [satellites, sortByCno]);

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
    <XFrames.Node style={{ flex: 1, padding: { all: 8 }, gap: { row: 4 } }}>
      <XFrames.Node style={{ height: 28, flexDirection: "row", alignItems: "center", gap: { column: 12 } }}>
        {stats && (
          <XFrames.UnformattedText
            text={`${stats.totalTracked} sats, ${stats.totalUsed} used \u2014 Mean CNO: ${stats.meanCno.toFixed(1)} dB-Hz`}
            style={{ font: { name: "roboto-mono", size: 14 }, color: themeColors.silver }}
          />
        )}
        <XFrames.Checkbox
          label="Sort by CNO"
          defaultChecked={sortByCno}
          onChange={handleSortToggle}
        />
      </XFrames.Node>
      {stats && (
        <XFrames.Node style={{ gap: { row: 1 } }}>
          {stats.constellations.map((c) => (
            <XFrames.UnformattedText
              key={c.gnssId}
              text={`${c.name.padEnd(8)} ${String(c.count).padStart(2)} (${String(c.used).padStart(2)} used) \u00B7 ${c.meanCno.toFixed(1)} dB-Hz`}
              style={{ font: { name: "roboto-mono", size: 14 }, color: c.color }}
            />
          ))}
        </XFrames.Node>
      )}
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
