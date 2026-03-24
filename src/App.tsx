import * as React from "react";
import { XFrames } from "@xframes/node";
import { WidgetPropsMap } from "@xframes/common";
import { ConnectionPanel } from "./panels/ConnectionPanel";
import { ConsoleView } from "./panels/ConsoleView";
import { MessageView } from "./panels/MessageView";
import { NavigationStatus } from "./panels/NavigationStatus";
import { MapPanel } from "./panels/MapPanel";
import { PositionTrackingPanel } from "./panels/PositionTrackingPanel";
import { SkyViewPanel } from "./panels/SkyViewPanel";
import { SignalStrengthPanel } from "./panels/SignalStrengthPanel";
import { HardwareStatusPanel } from "./panels/HardwareStatusPanel";
import { StatusBar } from "./components/StatusBar";
import { useDataActivity } from "./hooks/useDataActivity";
import { useSerialConnection } from "./hooks/useSerialConnection";

const ACTIVE_COLOR = "#2ecc71";
const INACTIVE_COLOR = "#808080";
const DORMANT_COLOR = "#d0d0d0";

type Indicator = WidgetPropsMap["TabItem"]["indicator"];

export const App = () => {
  const activity = useDataActivity();
  const { status } = useSerialConnection();
  const connected = status === "connected";

  const dot = (active: boolean): Indicator =>
    ({ color: connected ? (active ? ACTIVE_COLOR : INACTIVE_COLOR) : DORMANT_COLOR });

  return (
    <XFrames.Node root style={{ height: "100%", padding: { all: 8 } }}>
      <XFrames.UnformattedText
        text="ubx-monitor"
        style={{ font: { name: "roboto-regular", size: 24 } }}
      />
      <XFrames.TabBar style={{ flex: 1, width: "100%" }}>
        <XFrames.TabItem
          label="Connection"
          indicator={{ color: connected ? ACTIVE_COLOR : DORMANT_COLOR }}
          style={{ flex: 1, width: "100%" }}
        >
          <ConnectionPanel />
        </XFrames.TabItem>
        <XFrames.TabItem
          label="Console"
          indicator={dot(activity["rawdata"])}
          style={{ flex: 1, width: "100%" }}
        >
          <ConsoleView />
        </XFrames.TabItem>
        <XFrames.TabItem
          label="Messages"
          indicator={dot(activity["message"])}
          style={{ flex: 1, width: "100%" }}
        >
          <MessageView />
        </XFrames.TabItem>
        <XFrames.TabItem
          label="Navigation"
          indicator={dot(activity["NAV-PVT"])}
          style={{ flex: 1, width: "100%" }}
        >
          <NavigationStatus />
        </XFrames.TabItem>
        <XFrames.TabItem
          label="Map"
          indicator={dot(activity["NAV-PVT"])}
          style={{ flex: 1, width: "100%" }}
        >
          <MapPanel />
        </XFrames.TabItem>
        <XFrames.TabItem
          label="Position"
          indicator={dot(activity["NAV-PVT"])}
          style={{ flex: 1, width: "100%" }}
        >
          <PositionTrackingPanel />
        </XFrames.TabItem>
        <XFrames.TabItem
          label="Sky View"
          indicator={dot(activity["NAV-SAT"])}
          style={{ flex: 1, width: "100%" }}
        >
          <SkyViewPanel />
        </XFrames.TabItem>
        <XFrames.TabItem
          label="Signals"
          indicator={dot(activity["NAV-SAT"])}
          style={{ flex: 1, width: "100%" }}
        >
          <SignalStrengthPanel />
        </XFrames.TabItem>
        <XFrames.TabItem
          label="Hardware"
          indicator={dot(activity["MON-HW"] || activity["MON-RF"])}
          style={{ flex: 1, width: "100%" }}
        >
          <HardwareStatusPanel />
        </XFrames.TabItem>
      </XFrames.TabBar>
      <StatusBar />
    </XFrames.Node>
  );
};
