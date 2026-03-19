import * as React from "react";
import { useRef, useEffect } from "react";
import { XFrames } from "@xframes/node";
import type { JsCanvasImperativeHandle } from "@xframes/common";
import { useNavSat } from "../hooks/useNavSat";

export const SkyViewPanel = () => {
  const canvasRef = useRef<JsCanvasImperativeHandle>(null);
  const satellites = useNavSat();
  const scriptLoaded = useRef(false);

  useEffect(() => {
    if (!canvasRef.current) return;
    canvasRef.current.setScriptFile("./src/scripts/sky-view.js");
    scriptLoaded.current = true;
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !scriptLoaded.current || !satellites) return;
    canvasRef.current.setData(satellites);
  }, [satellites]);

  return (
    <XFrames.JsCanvas
      ref={canvasRef}
      style={{ flex: 1, width: "100%" }}
      onScriptError={(e: any) => console.error("[sky-view]", e.nativeEvent)}
    />
  );
};
