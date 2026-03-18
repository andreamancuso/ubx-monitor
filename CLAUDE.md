# CLAUDE.md

## Project Overview

ubx-monitor is a lightweight u-blox GPS/GNSS monitor built on [XFrames](https://github.com/xframes-project/xframes). It serves as the flagship showcase app for XFrames, demonstrating that a React-driven, DOM-free, ImGui-based framework can replace Electron for real-time data-heavy desktop applications.

## Architecture

**GUI:** XFrames (`@xframes/node` + `@xframes/common`) — React/TypeScript components rendered via Dear ImGui through a custom React Native Fabric renderer.

**UBX Parsing:** `ubx-parser` — native Node.js addon wrapping cc.ublox.generated for sub-millisecond UBX binary protocol parsing. Supports 315+ message types. Streaming API via `UbxParser.feed(chunk)` with EventEmitter-based message dispatch.

**Serial Port:** `serialport` — serial port connection to GPS/GNSS receivers.

**Data flow:**
```
SerialPort.on('data') → UbxParser.feed(chunk) → emit('message', msg)
                                                → emit('NavPvt', msg)
                                                → emit('NavSat', msg)
React hooks subscribe to events → setState → XFrames re-render
```

## Build & Run

```bash
npm install
npm start
```

## Key Dependencies

- `@xframes/node` (0.1.1) + `@xframes/common` (0.1.1) — GUI framework
- `ubx-parser` (0.2.3) — UBX binary protocol parsing (MPL-2.0)
- `serialport` (12.x) — serial port I/O
- `react` (18.x) — component model

## License

MPL-2.0 (aligned with ubx-parser)

## Project Structure

```
src/
├── index.tsx          # Entry point — render(App, ...)
├── App.tsx            # Main app layout (TabBar with panels)
├── themes.ts          # XFrames themes
├── connection/        # Serial port management
├── panels/            # UI panels (Connection, Messages, Navigation)
└── hooks/             # React hooks for serial/UBX state
```
