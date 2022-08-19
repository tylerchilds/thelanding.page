#!/usr/bin/env -S deno run -A --watch=static/,routes/

import dev from "$fresh/dev.ts";
import { config } from "dotenv";
config({
  export: true
})

await dev(import.meta.url, "./main.ts");
