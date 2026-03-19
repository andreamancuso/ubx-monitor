import { useState, useEffect } from "react";
import { serialManager } from "../connection";
import type { NavDop } from "ubx-parser";

export interface NavDopData {
  gDOP: number;
  pDOP: number;
  tDOP: number;
  vDOP: number;
  hDOP: number;
  nDOP: number;
  eDOP: number;
}

export function useNavDop() {
  const [data, setData] = useState<NavDopData | null>(null);

  useEffect(() => {
    const onNavDop = (msg: NavDop) => {
      setData({
        gDOP: msg.gDOP,
        pDOP: msg.pDOP,
        tDOP: msg.tDOP,
        vDOP: msg.vDOP,
        hDOP: msg.hDOP,
        nDOP: msg.nDOP,
        eDOP: msg.eDOP,
      });
    };

    serialManager.on("NAV-DOP", onNavDop);
    return () => {
      serialManager.off("NAV-DOP", onNavDop);
    };
  }, []);

  return data;
}
