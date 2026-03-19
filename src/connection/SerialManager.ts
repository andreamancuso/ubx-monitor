import { EventEmitter } from "events";
import { SerialPort } from "serialport";
import { UbxParser } from "ubx-parser";
import type { ConnectionStatus, SerialPortInfo } from "./types";
import { enableUbxNavMessages, coldStart, warmStart, hotStart } from "./ubx-commands";

class SerialManager extends EventEmitter {
  private port: SerialPort | null = null;
  private parser: UbxParser | null = null;
  private status: ConnectionStatus = "disconnected";

  async listPorts(): Promise<SerialPortInfo[]> {
    const ports = await SerialPort.list();
    return ports.map((p) => ({
      path: p.path,
      manufacturer: p.manufacturer || undefined,
    }));
  }

  connect(path: string, baudRate: number): void {
    if (this.port) {
      this.disconnect();
    }

    this.status = "connecting";
    this.emit("status", this.status);

    this.port = new SerialPort({ path, baudRate }, (err) => {
      if (err) {
        this.status = "disconnected";
        this.emit("status", this.status);
        this.emit("error", err.message);
        this.port = null;
        return;
      }

      this.status = "connected";
      this.emit("status", this.status);
    });

    this.parser = new UbxParser();

    this.port.on("data", (chunk: Buffer) => {
      this.emit("rawdata", chunk);
      this.parser!.feed(chunk);
    });

    this.parser.on("message", (msg) => {
      this.emit("message", msg);
    });

    this.parser.on("NAV-PVT", (msg) => {
      this.emit("NAV-PVT", msg);
    });

    this.parser.on("ACK-ACK", (msg) => {
      this.emit("message", msg);
    });

    this.parser.on("ACK-NAK", (msg) => {
      this.emit("message", msg);
    });

    this.parser.on("MON-HW", (msg) => {
      this.emit("message", msg);
    });

    this.parser.on("NAV-STATUS", (msg) => {
      this.emit("message", msg);
    });

    this.parser.on("NAV-SAT", (msg) => {
      this.emit("NAV-SAT", msg);
    });

    this.port.on("close", () => {
      this.status = "disconnected";
      this.emit("status", this.status);
    });

    this.port.on("error", (err) => {
      this.status = "disconnected";
      this.emit("status", this.status);
      this.emit("error", err.message);
    });
  }

  disconnect(): void {
    if (this.port && this.port.isOpen) {
      this.port.close();
    }
    this.port = null;
    this.parser = null;
    this.status = "disconnected";
    this.emit("status", this.status);
  }

  sendRaw(data: Buffer): void {
    if (this.port && this.port.isOpen) {
      this.port.write(data);
    }
  }

  enableUbxOutput(): void {
    this.sendRaw(enableUbxNavMessages());
  }

  coldStart(): void { this.sendRaw(coldStart()); }
  warmStart(): void { this.sendRaw(warmStart()); }
  hotStart(): void { this.sendRaw(hotStart()); }

  getStatus(): ConnectionStatus {
    return this.status;
  }
}

export const serialManager = new SerialManager();
