/** GNSS system IDs per u-blox protocol (gnssId field in NAV-SAT).
 *  Keep in sync with src/scripts/sky-view.js COLORS/NAMES (QuickJS can't import TS). */

export const GNSS_PREFIX: Record<number, string> = {
  0: "G",   // GPS
  1: "S",   // SBAS
  2: "E",   // Galileo
  3: "C",   // BeiDou
  5: "Q",   // QZSS
  6: "R",   // GLONASS
};

export const GNSS_NAME: Record<number, string> = {
  0: "GPS",
  1: "SBAS",
  2: "Galileo",
  3: "BeiDou",
  5: "QZSS",
  6: "GLONASS",
};

export const GNSS_COLOR: Record<number, string> = {
  0: "#4285F4", // GPS — blue
  1: "#78909C", // SBAS — gray
  2: "#9B59B6", // Galileo — purple
  3: "#F39C12", // BeiDou — amber
  5: "#E91E63", // QZSS — pink
  6: "#34A853", // GLONASS — green
};

/** Ordered list of gnssId values for consistent display (GPS first, SBAS last) */
export const GNSS_IDS = [0, 6, 2, 3, 5, 1] as const;
