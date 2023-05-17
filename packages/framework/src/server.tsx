import { readFileSync, statSync } from "fs";
import path from "path";
import { type ServeOptions } from "bun";
import { renderToReadableStream } from "react-server-dom-webpack/server.browser";
import { getRouter } from "./router";
import { BUILD_DIR, CLIENT_BUILD_DIR, SERVER_BUILD_DIR } from "./constants";
import { findPagesDir } from "./util";

function serveFromDir(config: {
  directory: string;
  path: string;
}): Response | null {
  let basePath = path.join(config.directory, config.path);
  const suffixes = ["", ".html", "index.html"];

  for (const suffix of suffixes) {
    try {
      const pathWithSuffix = path.join(basePath, suffix);
      const stat = statSync(pathWithSuffix);
      if (stat && stat.isFile()) {
        return new Response(Bun.file(pathWithSuffix));
      }
    } catch (err) {}
  }

  return null;
}

function readClientManifest() {
  const manifest = readFileSync(
    path.join(process.cwd(), BUILD_DIR, "react-client-manifest.json"),
    "utf-8"
  );

  const moduleMap = JSON.parse(manifest);

  return moduleMap;
}

export function renderReactTree(markup: any) {
  const moduleMap = readClientManifest();

  const stream = renderToReadableStream(markup, moduleMap);

  return stream;
}

export const makeHandleRequest: (opts?: {
  cwd?: string;
}) => ServeOptions["fetch"] =
  ({ cwd = process.cwd() } = {}) =>
  async (request) => {
    const reqUrl = new URL(request.url);
    const reqPath = reqUrl.pathname;
    const router = getRouter();

    if (reqPath.startsWith("/_basket/static")) {
      console.log("asset", reqPath);
      const assetResponse = serveFromDir({
        directory: path.join(cwd, CLIENT_BUILD_DIR),
        path: reqPath.replace("/_basket/static/", ""),
      });

      if (assetResponse) return assetResponse;
    }

    if (reqPath === "/rsc") {
      const match = router.match(reqUrl.searchParams.get("path") ?? "/");

      if (match) {
        const pageName = match.filePath
          .replace(findPagesDir(), "")
          .replace(".tsx", ".js");
        const modulePath = path.join(cwd, SERVER_BUILD_DIR, pageName);

        const mod = await import(modulePath);

        return new Response(renderReactTree(<mod.default />));
      }
    }

    // check public
    const publicResponse = serveFromDir({
      directory: path.join(cwd, "public"),
      path: reqPath,
    });
    if (publicResponse) return publicResponse;

    return new Response("", { status: 200 });
  };
