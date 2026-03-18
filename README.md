# ubx-monitor

Lightweight u-blox GPS/GNSS monitor built on [XFrames](https://github.com/xframes-project/xframes) — a DOM-free GUI framework powered by Dear ImGui.

Real-time UBX message monitoring, navigation status, and satellite visualization without Electron overhead.

**Windows-only for now.** Linux and macOS support will follow once @xframes/node ships platform-specific packages.

## Quick Start

```bash
npm install
npm start
```

## Dependencies

- [@xframes/node](https://www.npmjs.com/package/@xframes/node) + [@xframes/common](https://www.npmjs.com/package/@xframes/common) — GUI framework
- [ubx-parser](https://www.npmjs.com/package/ubx-parser) — UBX binary protocol parsing
- [serialport](https://www.npmjs.com/package/serialport) — serial port I/O

## License

MPL-2.0
