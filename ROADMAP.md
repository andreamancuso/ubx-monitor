# ubx-monitor Roadmap

## Done

- **NAV-STATUS + TTFF display** — Dedicated NAV-STATUS listener, `useNavStatus` hook, TTFF, uptime, spoof detection, DGPS in Navigation panel.
- **Signal strength bar chart (CNO)** — PlotBar-based SNR bar chart in "Signals" tab with per-satellite labels. Added `tickLabels` support to PlotBar in XFrames. Color-coded by quality band (Weak/Moderate/Good/Excellent) using multi-series PlotBar.
- **NAV-DOP visualization** — NAV-DOP listener, `useNavDop` hook, PDOP/HDOP/VDOP/GDOP/TDOP with color-coded quality indicators in Navigation panel.
- **Console hex dump** — Hex dump view with monospace font (Roboto Mono), continuous offset, hex bytes + ASCII column.

- **MON-HW/RF/HW3 hardware status** — Separate `useRfStatus` (MON-HW + MON-RF) and `useHwStatus` (MON-HW3) hooks. Hardware tab with two sections: RF Status (antenna, jamming, noise, AGC, RTC/XTAL) and Hardware (HW version, pins, flags). Color-coded indicators.

---

## Polish Pass

### Phase 1: Consistency & Foundation

1. ~~**Standardize no-data states**~~ — Done. Console shows "No data received", Map shows "Awaiting fix..." above tiles until 2D+ fix. Sky View kept as-is (polar grid is a good empty state).
2. ~~**Status bar**~~ — Done. Bottom bar with connection dot, message rate, fix type (color-coded), satellite count. Visible on all tabs.
3. ~~**Theme-aware disabled states**~~ — Done. All 8 files now import `themeColors` instead of hardcoding hex values. 25 occurrences replaced.
4. ~~**Consistent section headers**~~ — Done. Shared `SectionHeader` component in `components/`. Used by HardwareStatusPanel and PositionTrackingPanel.
5. ~~**Font & spacing audit**~~ — Done. Spacing already consistent. Extracted shared `LabelRow` component (was duplicated in NavigationStatus and HardwareStatusPanel).

### Phase 2: Connection Experience

6. ~~**Remember last connection**~~ — Done. Persists port path + baud rate to `./config.json`. Auto-selects on launch; falls back to first available if saved port is gone.
7. ~~**Port detail display**~~ — Done. Port dropdown already shows "COM3 (u-blox AG)" when manufacturer metadata is available.
8. ~~**Auto-reconnect**~~ — Done. On unexpected disconnect, retries every 2s (max 5 attempts) with "Reconnecting (N/5)..." state. Cancel button to abort. Intentional disconnects do not trigger reconnect.
9. ~~**Connection quality indicator**~~ — Done. Message rate in status bar turns amber with "(stale Ns)" when no messages for >3s while connected. Resets on disconnect and on message resumption.

### Phase 3: Panel Polish

10. ~~**Navigation: formatting**~~ — Done. Uptime/TTFF as "Xh Ym Zs", degree symbol (already present), DGPS color-coded green/gray.
11. **Navigation: coordinate format toggle** — Combo to switch DD / DMS / DDM. Persist choice.
12. **Map: awaiting fix overlay + zoom display** — "Awaiting fix..." before first fix. Zoom level and center lat/lon in corner.
13. **Position Tracking: reset button** — Manual reset button, prominent sample count + elapsed time, horizontal accuracy plot.
14. **Signal Strength: aggregate stats** — Summary line: "24 sats, 18 used — Mean CNO: 34.2 dB-Hz". Constellation breakdown.
15. **Signal Strength: sort toggle** — Toggle between sort by constellation (default) or by CNO descending.
16. **Hardware: decode flags + RF trend** — Parse MON-HW3 flags into readable bits. Jamming indicator sparkline/trend.
17. **Console: packet boundaries** — Visual separators between UBX packets. Inline message class/ID header.

### Phase 4: Visual Refinement

18. **Tab indicators** — Colored dot on tabs with active data. Gray = no data, green = receiving.
19. **Window title** — Dynamic: "ubx-monitor — COM3 @ 38400 — 3D Fix (12 sats)" or "ubx-monitor — Disconnected".
20. **Color palette refinement** — Colorblind-friendly review. Shape indicators alongside color (✓/✗ icons).
21. **Loading/transition states** — "Configuring..." on Enable UBX. No stale data flash on tab switch.

### Phase 5: Data & Export

22. **NMEA sentence display** — NMEA tab or Console section showing decoded GGA, RMC, GSV sentences.
23. **Data logging** — Record button writes raw UBX binary to `.ubx` file. Start/stop with file path display.
24. **Snapshot export** — Capture current state (position, sats, signals, DOP) as JSON. Useful for sharing/debugging.
25. **About / info panel** — App version, receiver model (MON-VER), firmware version, protocol version, GitHub link.
