import * as React from "react";
import { XFrames } from "@xframes/node";
import { ConnectionPanel } from "./panels/ConnectionPanel";
import { ConsoleView } from "./panels/ConsoleView";
import { MessageView } from "./panels/MessageView";
import { NavigationStatus } from "./panels/NavigationStatus";
import { MapPanel } from "./panels/MapPanel";

export const App = () => (
  <XFrames.Node root style={{ height: "100%", padding: { all: 8 } }}>
    <XFrames.UnformattedText
      text="ubx-monitor"
      style={{ font: { name: "roboto-regular", size: 24 } }}
    />
    <XFrames.TabBar style={{ flex: 1, width: "100%" }}>
      <XFrames.TabItem label="Connection" style={{ flex: 1, width: "100%" }}>
        <ConnectionPanel />
      </XFrames.TabItem>
      <XFrames.TabItem label="Console" style={{ flex: 1, width: "100%" }}>
        <ConsoleView />
      </XFrames.TabItem>
      <XFrames.TabItem label="Messages" style={{ flex: 1, width: "100%" }}>
        <MessageView />
      </XFrames.TabItem>
      <XFrames.TabItem label="Navigation" style={{ flex: 1, width: "100%" }}>
        <NavigationStatus />
      </XFrames.TabItem>
      <XFrames.TabItem label="Map" style={{ flex: 1, width: "100%" }}>
        <MapPanel />
      </XFrames.TabItem>
    </XFrames.TabBar>
  </XFrames.Node>
);
