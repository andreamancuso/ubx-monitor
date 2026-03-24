import * as React from "react";
import { useRef, useEffect } from "react";
import { XFrames } from "@xframes/node";
import type {
  PlotScatterImperativeHandle,
  PlotLineImperativeHandle,
} from "@xframes/common";
import { usePositionHistory } from "../hooks/usePositionHistory";
import { formatDuration } from "../utils/format";
import { themeColors } from "../themes";
import { SectionHeader } from "../components/SectionHeader";

export const PositionTrackingPanel = () => {
  const scatterRef = useRef<PlotScatterImperativeHandle>(null);
  const altitudeRef = useRef<PlotLineImperativeHandle>(null);
  const speedRef = useRef<PlotLineImperativeHandle>(null);
  const hAccRef = useRef<PlotLineImperativeHandle>(null);

  const {
    scatterPoints,
    latestAltitude,
    latestSpeed,
    latestHAcc,
    cepStats,
    sampleCount,
    elapsedSec,
    resetCounter,
    reset,
  } = usePositionHistory();

  // Reset plots when history is cleared
  const prevResetRef = useRef(resetCounter);
  useEffect(() => {
    if (resetCounter !== prevResetRef.current) {
      prevResetRef.current = resetCounter;
      scatterRef.current?.resetData();
      altitudeRef.current?.resetData();
      speedRef.current?.resetData();
      hAccRef.current?.resetData();
    }
  }, [resetCounter]);

  // Update scatter plot (full setData — points shift with mean)
  useEffect(() => {
    if (!scatterRef.current || scatterPoints.length === 0) return;
    scatterRef.current.setData(scatterPoints);
  }, [scatterPoints]);

  // Append to altitude plot
  useEffect(() => {
    if (!altitudeRef.current || !latestAltitude) return;
    altitudeRef.current.appendData(latestAltitude.x, latestAltitude.y);
  }, [latestAltitude]);

  // Append to speed plot
  useEffect(() => {
    if (!speedRef.current || !latestSpeed) return;
    speedRef.current.appendData(latestSpeed.x, latestSpeed.y);
  }, [latestSpeed]);

  // Append to hAcc plot
  useEffect(() => {
    if (!hAccRef.current || !latestHAcc) return;
    hAccRef.current.appendData(latestHAcc.x, latestHAcc.y);
  }, [latestHAcc]);

  if (sampleCount === 0) {
    return (
      <XFrames.Node style={{ padding: { all: 8 } }}>
        <XFrames.UnformattedText
          text="No data \u2014 connect to a receiver"
          style={{ color: themeColors.lightSlate }}
        />
      </XFrames.Node>
    );
  }

  const statsText = cepStats
    ? [
        `Samples: ${cepStats.sampleCount}`,
        `CEP\u2085\u2080: ${cepStats.cep50.toFixed(2)} m`,
        `CEP\u2089\u2085: ${cepStats.cep95.toFixed(2)} m`,
        `H Acc:  ${cepStats.meanHAcc.toFixed(2)} m`,
      ].join("\n")
    : "";

  const headerText = `${sampleCount} samples \u00B7 ${formatDuration(elapsedSec)}`;

  return (
    <XFrames.Node style={{ flex: 1, padding: { all: 8 }, gap: { row: 8 } }}>
      {/* Header row: Reset + stats summary */}
      <XFrames.Node
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: { column: 12 },
          height: 28,
        }}
      >
        <XFrames.Button label="Reset" onClick={reset} />
        <XFrames.UnformattedText
          text={headerText}
          style={{
            font: { name: "roboto-mono", size: 14 },
            color: themeColors.silver,
          }}
        />
      </XFrames.Node>

      {/* Top row: Scatter + Stats */}
      <XFrames.Node
        style={{ flex: 1, flexDirection: "row", gap: { column: 8 } }}
      >
        <XFrames.PlotScatter
          ref={scatterRef}
          axisAutoFit
          dataPointsLimit={3000}
          xAxisLabel="East (m)"
          yAxisLabel="North (m)"
          legendLabel="Position"
          style={{ flex: 3 }}
        />
        <XFrames.Node style={{ flex: 1, padding: { all: 8 }, gap: { row: 8 } }}>
          <SectionHeader text="Position Statistics" />
          <XFrames.UnformattedText
            text={statsText}
            style={{
              font: { name: "roboto-mono", size: 14 },
              color: themeColors.silver,
            }}
          />
        </XFrames.Node>
      </XFrames.Node>

      {/* Bottom row: Altitude + Speed + H Accuracy */}
      <XFrames.Node
        style={{ flex: 1, flexDirection: "row", gap: { column: 8 } }}
      >
        <XFrames.PlotLine
          ref={altitudeRef}
          axisAutoFit
          dataPointsLimit={3000}
          xAxisLabel="Time (s)"
          yAxisLabel="Altitude (m)"
          legendLabel="MSL"
          style={{ flex: 1 }}
        />
        <XFrames.PlotLine
          ref={speedRef}
          axisAutoFit
          dataPointsLimit={3000}
          xAxisLabel="Time (s)"
          yAxisLabel="Speed (km/h)"
          legendLabel="Ground Speed"
          style={{ flex: 1 }}
        />
        <XFrames.PlotLine
          ref={hAccRef}
          axisAutoFit
          dataPointsLimit={3000}
          xAxisLabel="Time (s)"
          yAxisLabel="H Accuracy (m)"
          legendLabel="H Accuracy"
          style={{ flex: 1 }}
        />
      </XFrames.Node>
    </XFrames.Node>
  );
};
