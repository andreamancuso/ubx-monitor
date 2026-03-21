import { useState, useEffect } from "react";
import { serialManager } from "../connection";
import type { MonHw, MonHw3, MonRf } from "ubx-parser";

export interface RfStatusData {
  noisePerMS: number;
  agcCnt: number;
  aStatus: number;
  aPower: number;
  jammingState: number;
  jamInd: number;
  rtcCalib?: boolean;
  safeBoot?: boolean;
  xtalAbsent?: boolean;
}

export interface HwStatusData {
  hwVersion: string;
  nPins: number;
  flags: number;
}

export function useRfStatus() {
  const [data, setData] = useState<RfStatusData | null>(null);

  useEffect(() => {
    const onMonHw = (msg: MonHw) => {
      if ("variant" in msg) return;
      setData({
        noisePerMS: msg.noisePerMS,
        agcCnt: msg.agcCnt,
        aStatus: msg.aStatus,
        aPower: msg.aPower,
        jammingState: msg.flags.jammingState,
        jamInd: msg.jamInd,
        rtcCalib: msg.flags.rtcCalib,
        safeBoot: msg.flags.safeBoot,
        xtalAbsent: msg.flags.xtalAbsent,
      });
    };

    const onMonRf = (msg: MonRf) => {
      if ("variant" in msg) return;
      if (!msg.list || msg.list.length === 0) return;
      const rf = msg.list[0];
      setData({
        noisePerMS: rf.noisePerMS,
        agcCnt: rf.agcCnt,
        aStatus: rf.antStatus,
        aPower: rf.antPower,
        jammingState: rf.flags.jammingState,
        jamInd: rf.jamInd,
      });
    };

    serialManager.on("MON-HW", onMonHw);
    serialManager.on("MON-RF", onMonRf);
    return () => {
      serialManager.off("MON-HW", onMonHw);
      serialManager.off("MON-RF", onMonRf);
    };
  }, []);

  return data;
}

export function useHwStatus() {
  const [data, setData] = useState<HwStatusData | null>(null);

  useEffect(() => {
    const onMonHw3 = (msg: MonHw3) => {
      if ("variant" in msg) return;
      setData({
        hwVersion: msg.hwVersion,
        nPins: msg.nPins,
        flags: msg.flags,
      });
    };

    serialManager.on("MON-HW3", onMonHw3);
    return () => {
      serialManager.off("MON-HW3", onMonHw3);
    };
  }, []);

  return data;
}
