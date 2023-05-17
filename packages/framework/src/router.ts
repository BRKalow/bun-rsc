import { FileSystemRouter } from "bun";
import { findPagesDir } from "./util";

let router: FileSystemRouter;

export function getRouter(): FileSystemRouter {
  if (!router) {
    router = new FileSystemRouter({
      style: "nextjs",
      dir: findPagesDir(),
      origin: "http://localhost:3000",
      assetPrefix: "/_basket/static/",
    });
  }

  return router;
}
