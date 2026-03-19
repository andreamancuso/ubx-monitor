import { useState, useEffect } from "react";
import { serialManager } from "../connection";

export interface SatInfo {
  gnssId: number;
  svid: number;
  cno: number;
  elev: number;
  azim: number;
  svUsed: boolean;
}

export function useNavSat(): SatInfo[] | null {
  const [satellites, setSatellites] = useState<SatInfo[] | null>(null);

  useEffect(() => {
    const onNavSat = (msg: any) => {
      setSatellites(
        msg.list.map((sv: any) => ({
          gnssId: sv.gnssId,
          svid: sv.svid,
          cno: sv.cno,
          elev: sv.elev,
          azim: sv.azim,
          svUsed: sv.flags.svUsed,
        })),
      );
    };

    serialManager.on("NAV-SAT", onNavSat);
    return () => {
      serialManager.off("NAV-SAT", onNavSat);
    };
  }, []);

  return satellites;
}
