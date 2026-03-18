import { useState, useEffect } from "react";
import { serialManager } from "../connection";
import type { NavPvt } from "ubx-parser";

export interface NavPvtData {
  fixType: number;
  lat: number;
  lon: number;
  height: number;
  hMSL: number;
  hAcc: number;
  vAcc: number;
  numSV: number;
  year: number;
  month: number;
  day: number;
  hour: number;
  min: number;
  sec: number;
  tAcc: number;
}

export function useNavPvt() {
  const [data, setData] = useState<NavPvtData | null>(null);

  useEffect(() => {
    const onNavPvt = (msg: NavPvt) => {
      setData({
        fixType: msg.fixType,
        lat: msg.lat,
        lon: msg.lon,
        height: msg.height,
        hMSL: msg.hMSL,
        hAcc: msg.hAcc,
        vAcc: msg.vAcc,
        numSV: msg.numSV,
        year: msg.year,
        month: msg.month,
        day: msg.day,
        hour: msg.hour,
        min: msg.min,
        sec: msg.sec,
        tAcc: msg.tAcc,
      });
    };

    serialManager.on("NAV-PVT", onNavPvt);
    return () => {
      serialManager.off("NAV-PVT", onNavPvt);
    };
  }, []);

  return data;
}
