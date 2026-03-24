import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { XFrames } from "@xframes/node";
import { ClippedMultiLineTextRendererImperativeHandle } from "@xframes/common";
import { serialManager } from "../connection";
import { themeColors } from "../themes";

const UBX_NAMES: Record<string, string> = {
  "01:07": "NAV-PVT",
  "01:35": "NAV-SAT",
  "01:04": "NAV-DOP",
  "01:03": "NAV-STATUS",
  "0a:09": "MON-HW",
  "0a:37": "MON-HW3",
  "0a:38": "MON-RF",
  "05:01": "ACK-ACK",
  "05:00": "ACK-NAK",
};

function ubxName(cls: number, id: number): string {
  const key = `${cls.toString(16).padStart(2, "0")}:${id.toString(16).padStart(2, "0")}`;
  return UBX_NAMES[key] ?? `UBX-${key.toUpperCase()}`;
}

function formatHexDump(chunk: Buffer, offset: number): string {
  let result = "";
  for (let i = 0; i < chunk.length; i += 16) {
    const addr = (offset + i).toString(16).padStart(8, "0");
    const bytes = chunk.subarray(i, Math.min(i + 16, chunk.length));

    let hex = "";
    let ascii = "";
    for (let j = 0; j < 16; j++) {
      if (j === 8) hex += " ";
      if (j < bytes.length) {
        hex += bytes[j].toString(16).padStart(2, "0") + " ";
        ascii += bytes[j] >= 0x20 && bytes[j] <= 0x7e ? String.fromCharCode(bytes[j]) : ".";
      } else {
        hex += "   ";
        ascii += " ";
      }
    }

    result += `${addr}  ${hex} |${ascii}|\n`;
  }
  return result;
}

export const ConsoleView = () => {
  const textRef = useRef<ClippedMultiLineTextRendererImperativeHandle>(null);
  const offsetRef = useRef(0);
  const frameBufferRef = useRef<Buffer>(Buffer.alloc(0));
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    const onRawData = (chunk: Buffer) => {
      if (!hasData) setHasData(true);
      if (!textRef.current) return;

      frameBufferRef.current = Buffer.concat([frameBufferRef.current, chunk]);
      const buf = frameBufferRef.current;
      let pos = 0;

      while (pos < buf.length) {
        // Find next UBX sync (0xB5 0x62)
        let syncPos = -1;
        for (let i = pos; i < buf.length - 1; i++) {
          if (buf[i] === 0xb5 && buf[i + 1] === 0x62) {
            syncPos = i;
            break;
          }
        }

        if (syncPos === -1) {
          // No sync found — dump remaining, keep last byte if it could be start of sync
          const keep = buf[buf.length - 1] === 0xb5 ? 1 : 0;
          if (buf.length - keep > pos) {
            textRef.current.appendTextToClippedMultiLineTextRenderer(
              formatHexDump(buf.subarray(pos, buf.length - keep), offsetRef.current),
            );
            offsetRef.current += buf.length - keep - pos;
          }
          pos = buf.length - keep;
          break;
        }

        // Dump non-UBX bytes before sync
        if (syncPos > pos) {
          textRef.current.appendTextToClippedMultiLineTextRenderer(
            formatHexDump(buf.subarray(pos, syncPos), offsetRef.current),
          );
          offsetRef.current += syncPos - pos;
          pos = syncPos;
        }

        // Need at least 6 bytes for header
        if (pos + 6 > buf.length) break;

        const cls = buf[pos + 2];
        const id = buf[pos + 3];
        const payloadLen = buf[pos + 4] | (buf[pos + 5] << 8);
        const frameLen = payloadLen + 8;

        // Need complete frame
        if (pos + frameLen > buf.length) break;

        // Complete frame — print separator header + hex dump
        const name = ubxName(cls, id);
        const separator = `\n──── ${name} [${cls.toString(16).padStart(2, "0")}:${id.toString(16).padStart(2, "0")}] ${payloadLen} bytes ────\n`;
        const frame = buf.subarray(pos, pos + frameLen);
        textRef.current.appendTextToClippedMultiLineTextRenderer(
          separator + formatHexDump(frame, offsetRef.current),
        );
        offsetRef.current += frameLen;
        pos += frameLen;
      }

      // Save unprocessed bytes
      frameBufferRef.current =
        pos < buf.length ? buf.subarray(pos) : Buffer.alloc(0);
    };

    serialManager.on("rawdata", onRawData);
    return () => {
      serialManager.off("rawdata", onRawData);
    };
  }, [hasData]);

  if (!hasData) {
    return (
      <XFrames.Node style={{ padding: { all: 8 } }}>
        <XFrames.UnformattedText
          text="No data received"
          style={{ color: themeColors.lightSlate }}
        />
      </XFrames.Node>
    );
  }

  return (
    <XFrames.Node style={{ padding: { all: 8 }, flex: 1 }}>
      <XFrames.ClippedMultiLineTextRenderer
        ref={textRef}
        style={{ flex: 1, font: { name: "roboto-mono", size: 14 } }}
      />
    </XFrames.Node>
  );
};
