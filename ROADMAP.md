# ubx-monitor Roadmap

## Done

- **NAV-STATUS + TTFF display** — Dedicated NAV-STATUS listener, `useNavStatus` hook, TTFF, uptime, spoof detection, DGPS in Navigation panel.
- **Signal strength bar chart (CNO)** — PlotBar-based SNR bar chart in "Signals" tab with per-satellite labels. Added `tickLabels` support to PlotBar in XFrames.
- **NAV-DOP visualization** — NAV-DOP listener, `useNavDop` hook, PDOP/HDOP/VDOP/GDOP/TDOP with color-coded quality indicators in Navigation panel.
- **Console hex dump** — Hex dump view with monospace font (Roboto Mono), continuous offset, hex bytes + ASCII column.

## 5. MON-HW display
Wire up MON-HW with dedicated listener/hook. Display antenna status, noise floor, jamming indicator.
