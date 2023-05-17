import * as path from "path";
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath, pathToFileURL } from "url";
import {
  BUILD_DIR,
  CLIENT_BUILD_DIR,
  CLIENT_MANIFEST_FILE,
  SERVER_BUILD_DIR,
} from "./constants";
import { getRouter } from "./router";

const pages = getRouter().routes;

const PROJECT_ROOT = import.meta.dir;
const PUBLIC_DIR = path.resolve(PROJECT_ROOT, "public");

export async function build({ production = false, cwd = process.cwd() } = {}) {
  let clientManifest: any = {};

  const pages = getRouter().routes;

  const out = await Bun.build({
    outdir: path.join(cwd, SERVER_BUILD_DIR),
    naming: "[dir]/[name].[ext]",
    target: "node",
    entrypoints: [...Object.values(pages)],
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

  console.log(out.logs);

  /**
   * The client build, informed by the server build above
   */
  await Bun.build({
    splitting: true,
    outdir: path.join(cwd, CLIENT_BUILD_DIR),
    target: "browser",
    entrypoints: [
      await import.meta.resolve("bun-basket/client"),
      ...Object.keys(clientManifest).map((value) => fileURLToPath(value)),
    ],
    sourcemap: "external",
  });

  writeFileSync(
    path.join(cwd, BUILD_DIR, CLIENT_MANIFEST_FILE),
    JSON.stringify(clientManifest, null, 2)
  );
}
