# ubx-monitor Roadmap

## 1. NAV-STATUS + TTFF display
Add dedicated NAV-STATUS listener, `useNavStatus` hook, and display TTFF (time to first fix), uptime (msss), fix flags, and spoof detection state in the Navigation panel. Complements the Cold/Warm/Hot Start feature.

## 2. Signal strength bar chart (CNO)
PlotBar-based SNR bar chart showing per-satellite carrier-to-noise ratio, colored by constellation. Data already available via `useNavSat`.

## 3. NAV-DOP visualization
Wire up NAV-DOP messages (enabled on receiver but unwired). Display PDOP/HDOP/VDOP/GDOP/TDOP in the Navigation panel.

## 4. Console hex dump
Replace raw UTF-8 byte dump in ConsoleView with a proper hex dump view for binary UBX data.

## 5. MON-HW display
Wire up MON-HW with dedicated listener/hook. Display antenna status, noise floor, jamming indicator.
