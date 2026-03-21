import * as React from "react";
import { XFrames } from "@xframes/node";
import { themeColors } from "../themes";

export const SectionHeader = ({ text }: { text: string }) => (
  <XFrames.UnformattedText
    text={text}
    style={{ color: themeColors.offWhite, font: { name: "roboto-regular", size: 18 } }}
  />
);
