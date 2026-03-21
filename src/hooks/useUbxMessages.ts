import { useState, useEffect, useRef } from "react";
import { serialManager } from "../connection";
import type { ConnectionStatus } from "../connection";
import type { UbxMessage } from "ubx-parser";

interface MessageRow {
  timestamp: string;
  name: string;
  length: string;
}

const MAX_MESSAGES = 500;

export function useUbxMessages() {
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [messageRate, setMessageRate] = useState(0);
  const [timeSinceLastMessage, setTimeSinceLastMessage] = useState(0);
  const [bytesPerSec, setBytesPerSec] = useState(0);
  const [baudRate, setBaudRate] = useState<number | null>(null);
  const timestampsRef = useRef<number[]>([]);
  const lastMessageTimeRef = useRef(0);
  const byteChunksRef = useRef<{ time: number; bytes: number }[]>([]);

  useEffect(() => {
    const onMessage = (msg: UbxMessage) => {
      const now = Date.now();
      lastMessageTimeRef.current = now;
      const ts = new Date(now);
      const timeStr =
        ts.getHours().toString().padStart(2, "0") +
        ":" +
        ts.getMinutes().toString().padStart(2, "0") +
        ":" +
        ts.getSeconds().toString().padStart(2, "0") +
        "." +
        ts.getMilliseconds().toString().padStart(3, "0");

      const row: MessageRow = {
        timestamp: timeStr,
        name: msg.name,
        length: String(JSON.stringify(msg).length),
      };

      setMessages((prev) => {
        const next = [...prev, row];
        if (next.length > MAX_MESSAGES) {
          return next.slice(next.length - MAX_MESSAGES);
        }
        return next;
      });

      // Track message rate (rolling 1s window)
      timestampsRef.current.push(now);
      const cutoff = now - 1000;
      timestampsRef.current = timestampsRef.current.filter((t) => t > cutoff);
      setMessageRate(timestampsRef.current.length);
    };

    const onRawData = (chunk: Buffer) => {
      const now = Date.now();
      byteChunksRef.current.push({ time: now, bytes: chunk.length });
      const cutoff = now - 1000;
      byteChunksRef.current = byteChunksRef.current.filter((c) => c.time > cutoff);
      const total = byteChunksRef.current.reduce((sum, c) => sum + c.bytes, 0);
      setBytesPerSec(total);
    };

    const onStatus = (s: ConnectionStatus) => {
      if (s === "disconnected") {
        lastMessageTimeRef.current = 0;
        setTimeSinceLastMessage(0);
        byteChunksRef.current = [];
        setBytesPerSec(0);
      }
    };

    const onBaudRate = (rate: number | null) => {
      setBaudRate(rate);
    };

    const interval = setInterval(() => {
      if (lastMessageTimeRef.current > 0) {
        setTimeSinceLastMessage(Math.floor((Date.now() - lastMessageTimeRef.current) / 1000));
      }
      // Decay bytes/sec when no data arrives
      const now = Date.now();
      const cutoff = now - 1000;
      byteChunksRef.current = byteChunksRef.current.filter((c) => c.time > cutoff);
      setBytesPerSec(byteChunksRef.current.reduce((sum, c) => sum + c.bytes, 0));
    }, 1000);

    serialManager.on("message", onMessage);
    serialManager.on("rawdata", onRawData);
    serialManager.on("status", onStatus);
    serialManager.on("baudrate", onBaudRate);

    return () => {
      serialManager.off("message", onMessage);
      serialManager.off("rawdata", onRawData);
      serialManager.off("status", onStatus);
      serialManager.off("baudrate", onBaudRate);
      clearInterval(interval);
    };
  }, []);

  return { messages, messageRate, timeSinceLastMessage, bytesPerSec, baudRate };
}
