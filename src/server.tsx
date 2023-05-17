import { readFileSync } from "fs";
import path from "path";
import React from "react";
import { renderToReadableStream } from "react-server-dom-webpack/server.browser";

import App from "./App";

export function renderReactTree() {
  const manifest = readFileSync(
    path.join(process.cwd(), "build", "react-client-manifest.json"),
    "utf-8"
  );

  const moduleMap = JSON.parse(manifest);

  const stream = renderToReadableStream(
    <div>
      <App />
    </div>,
    moduleMap
  );

  return stream;
}
