#!/usr/bin/env node
// owner: @Kurkov1990 · why: an applied migration was edited, so existing DBs silently diverged from fresh ones · review-by: 2027-03-23
// PreToolUse hook. Blocks (exit 2) any change to an existing db/migrations/*.sql file:
//   Edit/Write/MultiEdit on an existing file, or a Bash segment that writes, moves or deletes inside db/migrations/.
// New migrations are allowed only as NNN_snake_case.sql with the next free number.
import { appendFileSync, existsSync, readFileSync, readdirSync } from "node:fs";
import { basename, dirname, join, relative, resolve } from "node:path";

const root = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();
const migrationsDir = join(root, "db", "migrations");
const logFile = join(root, ".claude", "hooks", "guard-migrations.log");

function log(decision, detail) {
  try {
    appendFileSync(logFile, `${new Date().toISOString()} ${decision} ${detail}\n`);
  } catch {}
}

function block(reason, detail) {
  log("BLOCK", detail);
  process.stderr.write(`guard-migrations: ${reason}\n`);
  process.exit(2);
}

let payload;
try {
  payload = JSON.parse(readFileSync(0, "utf8"));
} catch {
  process.exit(0); // a malformed payload is not a migration change; don't break the session
}
const tool = payload.tool_name ?? "";
const input = payload.tool_input ?? {};

const existing = existsSync(migrationsDir) ? readdirSync(migrationsDir).filter((f) => f.endsWith(".sql")) : [];
const nextNumber = String(Math.max(0, ...existing.map((f) => parseInt(f, 10) || 0)) + 1).padStart(3, "0");

if (["Edit", "Write", "MultiEdit", "NotebookEdit"].includes(tool)) {
  const target = resolve(root, input.file_path ?? input.notebook_path ?? "");
  if (dirname(target) !== migrationsDir) process.exit(0);
  const rel = relative(root, target);
  const name = basename(target);
  if (existsSync(target)) {
    block(
      `${rel} is an applied migration and must not change. Create db/migrations/${nextNumber}_<what>.sql instead.`,
      `${tool} ${rel}`,
    );
  }
  if (!/^\d{3}_[a-z0-9_]+\.sql$/.test(name) || !name.startsWith(`${nextNumber}_`)) {
    block(`new migration must be named ${nextNumber}_snake_case.sql (got ${name}).`, `${tool} ${rel}`);
  }
  log("ALLOW", `${tool} ${rel}`);
  process.exit(0);
}

if (tool === "Bash") {
  const cmd = String(input.command ?? "");
  const bad = writingSegment(cmd);
  if (bad) {
    block(
      `shell command would modify db/migrations/ ("${bad.slice(0, 120)}"). Applied migrations are immutable; ` +
        `add db/migrations/${nextNumber}_<what>.sql with the Write tool instead.`,
      `Bash ${JSON.stringify(bad.slice(0, 200))}`,
    );
  }
}
process.exit(0);

/** Returns the first shell segment that writes into db/migrations/, or undefined. Heredoc bodies are data, not commands. */
function writingSegment(cmd) {
  const withoutHeredocs = cmd.replace(/<<-?\s*(['"]?)(\w+)\1([^\n]*)\n[\s\S]*?\n\s*\2\s*(?=\n|$)/g, "<<$2$3");
  for (const raw of withoutHeredocs.split(/\n|;|&&|\|\||\|/)) {
    const seg = raw.trim();
    if (!/db\/migrations/.test(seg)) continue;
    const words = seg.split(/\s+/).filter((w) => !/^\w+=/.test(w) && w !== "sudo" && w !== "command");
    const [bin, sub] = [basename(words[0] ?? ""), words[1]];
    const lastArg = words.at(-1) ?? "";
    if (/>>?\s*['"]?[^\s'"]*db\/migrations/.test(seg.replace(/\d>&?\d?/g, ""))) return seg; // redirect into it
    if (["rm", "rmdir", "truncate", "unlink", "shred"].includes(bin)) return seg;
    if (["mv", "cp", "ln", "install", "rsync"].includes(bin) && lastArg.includes("db/migrations")) return seg;
    if (bin === "mv") return seg; // moving a migration out also breaks history
    if (bin === "tee" || bin === "dd") return seg;
    if ((bin === "sed" || bin === "perl") && words.some((w) => /^-[a-zA-Z]*i/.test(w))) return seg;
    if (bin === "git" && ["checkout", "restore", "rm", "mv", "apply"].includes(sub)) return seg;
  }
  return undefined;
}
