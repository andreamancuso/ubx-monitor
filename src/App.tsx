import * as React from "react";
import { XFrames } from "@xframes/node";
import { ConnectionPanel } from "./panels/ConnectionPanel";
import { MessageView } from "./panels/MessageView";
import { NavigationStatus } from "./panels/NavigationStatus";

export const App = () => (
  <XFrames.Node root style={{ height: "100%", padding: { all: 8 } }}>
    <XFrames.UnformattedText
      text="ubx-monitor"
      style={{ font: { name: "roboto-regular", size: 24 } }}
    />
    <XFrames.TabBar>
      <XFrames.TabItem label="Connection">
        <ConnectionPanel />
      </XFrames.TabItem>
      <XFrames.TabItem label="Messages">
        <MessageView />
      </XFrames.TabItem>
      <XFrames.TabItem label="Navigation">
        <NavigationStatus />
      </XFrames.TabItem>
    </XFrames.TabBar>
  </XFrames.Node>
);
