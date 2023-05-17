import path from "path";

const BUILD_DIR = path.join(process.cwd(), "build");

const CLI_ENTRY = path.join(process.cwd(), "src", "basket.ts");
const SERVER_ENTRY = path.join(process.cwd(), "src", "server.tsx");
const CLIENT_ENTRY = path.join(process.cwd(), "src", "client.tsx");

console.log("building basket...");

const serverBuild = Bun.build({
  entrypoints: [CLI_ENTRY, SERVER_ENTRY],
  target: "bun",
  outdir: BUILD_DIR,
});

const clientBuild = Bun.build({
  entrypoints: [CLIENT_ENTRY],
  target: "browser",
  outdir: BUILD_DIR,
  external: ["react", "react-dom", "scheduler"],
});

const [serverOut, clientOut] = await Promise.all([serverBuild, clientBuild]);

console.log(serverOut.logs, clientOut.logs);

console.log("Done!");
