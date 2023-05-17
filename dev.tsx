import * as path from "path";
import { readFileSync, statSync, writeFileSync } from "fs";
import type { ServeOptions } from "bun";
import { fileURLToPath, pathToFileURL } from "url";

const PROJECT_ROOT = import.meta.dir;
const PUBLIC_DIR = path.resolve(PROJECT_ROOT, "public");
const BUILD_DIR = path.resolve(PROJECT_ROOT, "build", "client");

let clientManifest: any = {};

const out = await Bun.build({
  outdir: "./build/server",
  target: "node",
  entrypoints: ["./src/server.tsx"],
  plugins: [
    {
      name: "rsc-client",
      async setup(build) {
        function clientReferenceFactory(filepath: string) {
          return `const CLIENT_REFERENCE = Symbol.for('react.client.reference');

export default {
  $$typeof: CLIENT_REFERENCE,
  $$id: "${pathToFileURL(filepath)}",
  $$async: false
}`;
        }

        build.onLoad({ filter: /\.(js|ts|jsx|tsx)$/ }, (args) => {
          console.log("load", args.path);
          const text = readFileSync(args.path, "utf-8");

          let hasUseClientDirective = false;
          // TODO: ensure top of file
          if (text.match(/[\"\']use client[\"\'];/g)) {
            hasUseClientDirective = true;
          }

          if (hasUseClientDirective) {
            clientManifest[pathToFileURL(args.path).toString()] = {
              id: path.basename(args.path).split(".")[0] + ".js",
              chunks: [path.basename(args.path).split(".")[0] + ".js"],
              name: "default",
            };

            return {
              contents: clientReferenceFactory(args.path),
              loader: "js",
            };
          }

          return {
            contents: text,
          };
        });
      },
    },
  ],
});

/**
 * The client build, informed by the server build above
 */
await Bun.build({
  splitting: true,
  outdir: "./build/client",
  target: "browser",
  entrypoints: [
    "./src/index.tsx",
    ...Object.keys(clientManifest).map((value) => fileURLToPath(value)),
  ],
  sourcemap: "external",
});

writeFileSync(
  path.join(process.cwd(), "build", "react-client-manifest.json"),
  JSON.stringify(clientManifest, null, 2)
);

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

const { renderReactTree } = await import("./build/server/server");

export default {
  fetch(request) {
    let reqPath = new URL(request.url).pathname;
    console.log(request.method, reqPath);
    if (reqPath === "/") reqPath = "/index.html";
    if (reqPath === "/render") return new Response(renderReactTree());

    // check public
    const publicResponse = serveFromDir({
      directory: PUBLIC_DIR,
      path: reqPath,
    });
    if (publicResponse) return publicResponse;

    // check /.build
    const buildResponse = serveFromDir({ directory: BUILD_DIR, path: reqPath });
    if (buildResponse) return buildResponse;

    return new Response("File not found", {
      status: 404,
    });
  },
} satisfies ServeOptions;
