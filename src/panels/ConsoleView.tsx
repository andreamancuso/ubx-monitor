import * as React from "react";
import { useEffect, useRef } from "react";
import { XFrames } from "@xframes/node";
import { ClippedMultiLineTextRendererImperativeHandle } from "@xframes/common";
import { serialManager } from "../connection";

export const ConsoleView = () => {
  const textRef = useRef<ClippedMultiLineTextRendererImperativeHandle>(null);

  useEffect(() => {
    const onRawData = (chunk: Buffer) => {
      if (textRef.current) {
        textRef.current.appendTextToClippedMultiLineTextRenderer(
          chunk.toString("utf-8"),
        );
      }
    };

    serialManager.on("rawdata", onRawData);
    return () => {
      serialManager.off("rawdata", onRawData);
    };
  }, []);

  return (
    <XFrames.Node style={{ padding: { all: 8 }, flex: 1 }}>
      <XFrames.ClippedMultiLineTextRenderer
        ref={textRef}
        style={{ flex: 1 }}
      />
    </XFrames.Node>
  );
};
