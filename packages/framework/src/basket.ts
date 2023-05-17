#!/usr/bin/env bun
import { Serve } from "bun";
import { build } from "./build";
import { makeHandleRequest } from "./server";

console.log("Welcome to basket!");

await build();

export default {
  fetch: makeHandleRequest(),
} satisfies Serve;
