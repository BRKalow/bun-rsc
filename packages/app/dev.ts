import { ServeOptions } from "bun";
import { makeHandleRequest } from "bun-basket/server";

export default {
  fetch: makeHandleRequest(),
} satisfies ServeOptions;
