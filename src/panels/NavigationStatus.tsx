import * as React from "react";
import { XFrames } from "@xframes/node";

export const NavigationStatus = () => (
  <XFrames.Node style={{ padding: { all: 8 } }}>
    <XFrames.UnformattedText text="Navigation status panel will go here." />
    <XFrames.UnformattedText text="Fix type, position, accuracy, time, satellites." />
  </XFrames.Node>
);
