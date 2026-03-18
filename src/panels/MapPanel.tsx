import * as React from "react";
import { useRef, useEffect } from "react";
import { XFrames } from "@xframes/node";
import type { MapImperativeHandle } from "@xframes/common";
import { useNavPvt } from "../hooks/useNavPvt";

const FIX_COLORS: Record<number, string> = {
  0: "#e74c3c",
  1: "#e67e22",
  2: "#f1c40f",
  3: "#2ecc71",
  4: "#27ae60",
  5: "#3498db",
};

export const MapPanel = () => {
  const mapRef = useRef<MapImperativeHandle>(null);
  const data = useNavPvt();
  const hasCentered = useRef(false);
  const polylineReady = useRef(false);

  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.setPolylines([
      { points: [], color: "#FF8800", thickness: 2, pointsLimit: 1000 },
    ]);
    polylineReady.current = true;
  }, []);

  useEffect(() => {
    if (!mapRef.current || !data || data.fixType < 2) return;

    if (!hasCentered.current) {
      mapRef.current.render(data.lon, data.lat, 15);
      hasCentered.current = true;
    }

    const color = FIX_COLORS[data.fixType] ?? "#7a7b9a";

    mapRef.current.setMarkers([
      { lat: data.lat, lon: data.lon, color, label: "Position", radius: 8 },
    ]);

    mapRef.current.setOverlays([
      {
        lat: data.lat,
        lon: data.lon,
        radiusMeters: data.hAcc / 1000,
        fillColor: "rgba(0,128,255,0.15)",
        strokeColor: "rgba(0,128,255,0.5)",
      },
    ]);

    if (polylineReady.current) {
      mapRef.current.appendPolylinePoint(0, data.lat, data.lon);
    }
  }, [data]);

  return (
    <XFrames.MapView
      ref={mapRef}
      style={{ flex: 1, width: "100%" }}
      minZoom={3}
      maxZoom={18}
      cachePath="./tile_cache"
    />
  );
};
