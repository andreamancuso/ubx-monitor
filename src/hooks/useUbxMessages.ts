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
  const timestampsRef = useRef<number[]>([]);
  const lastMessageTimeRef = useRef(0);

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

    const onStatus = (s: ConnectionStatus) => {
      if (s === "disconnected") {
        lastMessageTimeRef.current = 0;
        setTimeSinceLastMessage(0);
      }
    };

    const interval = setInterval(() => {
      if (lastMessageTimeRef.current > 0) {
        setTimeSinceLastMessage(Math.floor((Date.now() - lastMessageTimeRef.current) / 1000));
      }
    }, 1000);

    serialManager.on("message", onMessage);
    serialManager.on("status", onStatus);

    return () => {
      serialManager.off("message", onMessage);
      serialManager.off("status", onStatus);
      clearInterval(interval);
    };
  }, []);

  return { messages, messageRate, timeSinceLastMessage };
}
