import { useState, useEffect } from "react";
import { serialManager } from "../connection";
import type { NavStatus } from "ubx-parser";

export interface NavStatusData {
  gpsFix: number;
  ttff: number;
  msss: number;
  spoofDetState: number;
  diffCorr: boolean;
  carrSoln: number;
}

export function useNavStatus() {
  const [data, setData] = useState<NavStatusData | null>(null);

  useEffect(() => {
    const onNavStatus = (msg: NavStatus) => {
      setData({
        gpsFix: msg.gpsFix,
        ttff: msg.ttff,
        msss: msg.msss,
        spoofDetState: msg.flags2.spoofDetState,
        diffCorr: msg.fixStat.diffCorr,
        carrSoln: msg.flags2.carrSoln,
      });
    };

    serialManager.on("NAV-STATUS", onNavStatus);
    return () => {
      serialManager.off("NAV-STATUS", onNavStatus);
    };
  }, []);

  return data;
}
