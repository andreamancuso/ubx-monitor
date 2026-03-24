import { useEffect, useState, useRef } from "react";
import { serialManager } from "../connection";

const STALE_THRESHOLD_MS = 3000;
const TRACKED_EVENTS = [
  "rawdata",
  "message",
  "NAV-PVT",
  "NAV-SAT",
  "NAV-STATUS",
  "NAV-DOP",
  "MON-HW",
  "MON-HW3",
  "MON-RF",
] as const;

export function useDataActivity(): Record<string, boolean> {
  const lastSeen = useRef<Record<string, number>>({});
  const [activity, setActivity] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const handlers: Array<[string, () => void]> = TRACKED_EVENTS.map((evt) => {
      const handler = () => {
        lastSeen.current[evt] = Date.now();
      };
      serialManager.on(evt, handler);
      return [evt, handler];
    });

    const timer = setInterval(() => {
      const now = Date.now();
      const next: Record<string, boolean> = {};
      for (const evt of TRACKED_EVENTS) {
        next[evt] = now - (lastSeen.current[evt] ?? 0) < STALE_THRESHOLD_MS;
      }
      setActivity(next);
    }, 1000);

    return () => {
      for (const [evt, handler] of handlers) {
        serialManager.off(evt, handler);
      }
      clearInterval(timer);
    };
  }, []);

  return activity;
}
