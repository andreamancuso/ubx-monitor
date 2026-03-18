import * as React from "react";
import { XFrames } from "@xframes/node";

export const ConnectionPanel = () => (
  <XFrames.Node style={{ padding: { all: 8 } }}>
    <XFrames.UnformattedText text="Serial port connection settings will go here." />
    <XFrames.UnformattedText text="Port selection, baud rate, connect/disconnect." />
  </XFrames.Node>
);
