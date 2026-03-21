import * as React from "react";
import { XFrames } from "@xframes/node";
import { themeColors } from "../themes";

export const LabelRow = ({ label, value, color }: { label: string; value: string; color?: string }) => (
  <XFrames.Node style={{ flexDirection: "row", gap: { column: 8 }, height: 22 }}>
    <XFrames.UnformattedText
      text={label}
      style={{ width: 100, color: themeColors.lightSlate }}
    />
    <XFrames.UnformattedText
      text={value}
      style={color ? { color } : undefined}
    />
  </XFrames.Node>
);
