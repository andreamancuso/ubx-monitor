import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { XFrames } from "@xframes/node";
import { ClippedMultiLineTextRendererImperativeHandle } from "@xframes/common";
import { serialManager } from "../connection";
import { themeColors } from "../themes";

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
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    const onRawData = (chunk: Buffer) => {
      if (!hasData) setHasData(true);
      if (textRef.current) {
        textRef.current.appendTextToClippedMultiLineTextRenderer(
          formatHexDump(chunk, offsetRef.current),
        );
        offsetRef.current += chunk.length;
      }
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
