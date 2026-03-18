import { useState, useEffect, useRef } from "react";
import { serialManager } from "../connection";
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
  const timestampsRef = useRef<number[]>([]);

  useEffect(() => {
    const onMessage = (msg: UbxMessage) => {
      const now = Date.now();
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

    serialManager.on("message", onMessage);
    return () => {
      serialManager.off("message", onMessage);
    };
  }, []);

  return { messages, messageRate };
}
