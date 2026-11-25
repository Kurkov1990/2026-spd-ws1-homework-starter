#!/usr/bin/env node
// owner: @Kurkov1990 · why: AGENTS.md rule 4 — no .env* access except .env.example; a `Read(./.env.*)` deny also blocked .env.example · review-by: 2027-03-23
// PreToolUse for Read/Edit/Write/MultiEdit. Blocks (exit 2) any file named .env or .env.<anything> except .env.example.
// settings.json denies the common names too; this catches the rest (.env.staging, nested folders, odd casing).
import { readFileSync } from "node:fs";
import { basename } from "node:path";

let payload;
try {
  payload = JSON.parse(readFileSync(0, "utf8"));
} catch {
  process.exit(0);
}
const file = String(payload.tool_input?.file_path ?? payload.tool_input?.notebook_path ?? "");
const name = basename(file).toLowerCase();
if ((name === ".env" || name.startsWith(".env.")) && name !== ".env.example") {
  process.stderr.write(`guard-env: ${basename(file)} may hold secrets; agents read and write only .env.example (AGENTS.md rule 4).\n`);
  process.exit(2);
}
process.exit(0);
