import { useState, useEffect, useRef, useCallback } from "react";
import { useNavPvt } from "./useNavPvt";

const MAX_SAMPLES = 3000;
const DEG_TO_M = 111320;

interface PositionSample {
  lat: number;
  lon: number;
  hMSL: number;
  gSpeed: number;
  elapsedSec: number;
}

export interface CepStats {
  cep50: number;
  cep95: number;
  meanHAcc: number;
  sampleCount: number;
}

export interface PositionHistory {
  scatterPoints: { x: number; y: number }[];
  latestAltitude: { x: number; y: number } | null;
  latestSpeed: { x: number; y: number } | null;
  cepStats: CepStats | null;
  sampleCount: number;
  resetCounter: number;
}

export function usePositionHistory() {
  const pvt = useNavPvt();
  const samplesRef = useRef<PositionSample[]>([]);
  const startTimeRef = useRef<number | null>(null);

  const [history, setHistory] = useState<PositionHistory>({
    scatterPoints: [],
    latestAltitude: null,
    latestSpeed: null,
    cepStats: null,
    sampleCount: 0,
    resetCounter: 0,
  });

  const reset = useCallback(() => {
    samplesRef.current = [];
    startTimeRef.current = null;
    setHistory((prev) => ({
      scatterPoints: [],
      latestAltitude: null,
      latestSpeed: null,
      cepStats: null,
      sampleCount: 0,
      resetCounter: prev.resetCounter + 1,
    }));
  }, []);

  useEffect(() => {
    if (!pvt || pvt.fixType < 2) return;

    const now = Date.now();
    if (startTimeRef.current === null) startTimeRef.current = now;
    const elapsedSec = (now - startTimeRef.current) / 1000;

    const samples = samplesRef.current;
    samples.push({
      lat: pvt.lat,
      lon: pvt.lon,
      hMSL: pvt.hMSL,
      gSpeed: pvt.gSpeed,
      elapsedSec,
    });
    if (samples.length > MAX_SAMPLES) {
      samples.splice(0, samples.length - MAX_SAMPLES);
    }

    // Compute mean lat/lon
    let sumLat = 0;
    let sumLon = 0;
    for (const s of samples) {
      sumLat += s.lat;
      sumLon += s.lon;
    }
    const meanLat = sumLat / samples.length;
    const meanLon = sumLon / samples.length;

    // Convert to East/North offsets in meters
    const cosLat = Math.cos(meanLat * (Math.PI / 180));
    const scatterPoints = samples.map((s) => ({
      x: (s.lon - meanLon) * cosLat * DEG_TO_M,
      y: (s.lat - meanLat) * DEG_TO_M,
    }));

    // CEP computation
    const distances = scatterPoints.map((p) =>
      Math.sqrt(p.x * p.x + p.y * p.y),
    );
    distances.sort((a, b) => a - b);
    const cep50 = distances[Math.floor(distances.length * 0.5)] ?? 0;
    const cep95 = distances[Math.floor(distances.length * 0.95)] ?? 0;

    setHistory((prev) => ({
      scatterPoints,
      latestAltitude: { x: elapsedSec, y: pvt.hMSL / 1000 },
      latestSpeed: { x: elapsedSec, y: pvt.gSpeed * 0.0036 },
      cepStats: {
        cep50,
        cep95,
        meanHAcc: pvt.hAcc / 1000,
        sampleCount: samples.length,
      },
      sampleCount: samples.length,
      resetCounter: prev.resetCounter,
    }));
  }, [pvt]);

  return { ...history, reset };
}
