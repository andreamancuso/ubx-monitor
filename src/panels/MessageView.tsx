import * as React from "react";
import { XFrames } from "@xframes/node";

export const MessageView = () => (
  <XFrames.Node style={{ padding: { all: 8 } }}>
    <XFrames.UnformattedText text="Live UBX message table will go here." />
    <XFrames.UnformattedText text="Columns: timestamp, name, length, summary." />
  </XFrames.Node>
);
