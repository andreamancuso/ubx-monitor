import { resolve } from "path";
import * as React from "react";
import { theme } from "./themes";
import { render, XFrames } from "@xframes/node";
import { App } from "./App";

const fontDefs = {
  defs: [{ name: "roboto-regular", sizes: [16, 18, 20, 24] }]
    .map(({ name, sizes }) => sizes.map((size) => ({ name, size })))
    .flat(),
};

const assetsBasePath = resolve("./assets");

render(App, assetsBasePath, fontDefs, theme);
