# Spec — TASK-7 Estimates in whole hours

- Ticket: [docs/tickets/TASK-7.md](https://github.com/Kurkov1990/2026-spd-ws1-homework-starter/blob/main/docs/tickets/TASK-7.md)
- Branch: `TASK-7-whole-hour-estimates` · PR title: `TASK-7 Whole-hour estimates`
- Status: **approved** by @Kurkov1990, 2026-11-28
- Drafted by: Claude Code (claude-opus-5-5) · Owner and approver: @Kurkov1990

## Problem

`createTask` checks only `estimateHours < 1 || estimateHours > 40`. So `1.5` is stored as `1.5`, the string `"3"`
passes (JS compares it as a number), and `"abc"` passes the check, reaches SQLite, fails the column `check` and the
client gets a **500** instead of a validation error.

## Behaviour

`estimateHours` in the `createTask` input, and so in the `POST /api/tasks` body:

| Input | Today | After TASK-7 |
|---|---|---|
| field absent | created, `estimateHours: null` | unchanged |
| integer `1`..`40` | created | unchanged |
| `0`, `41` | 422 `estimateHours must be 1..40` | 422 with the new message |
| `1.5` | created, stored as `1.5` | 422 with the new message |
| `"3"`, `"40"` | created | 422 with the new message |
| `"abc"` | **500** (SQLite `check` fails) | 422 with the new message |
| `true` | created (`true` compares as `1`) | 422 with the new message |
| `null` | 422 `estimateHours must be 1..40` (`null` compares as `0`) | 422 with the new message |

- New message, exactly: `estimateHours must be a whole number 1..40`.
- Rule: when `estimateHours` is not `undefined`, it must satisfy
  `typeof v === "number" && Number.isInteger(v) && v >= 1 && v <= 40`. The check lives in `lib/tasks.ts` only.
- On a violation nothing is written: the check runs before the `insert`.
- `POST /api/tasks` already maps `RuleViolation` → **422** `{ "error": "<message>" }` and success → **201**; the route
  does not change.
- Only the **input** type of `estimateHours` in `createTask` widens to `unknown`, because the route passes the parsed
  JSON body as is. The `Task` interface keeps `estimateHours: number | null`.

## Acceptance criteria

From the ticket, unchanged:

1. `1` and `40` are accepted; `0`, `41`, `1.5`, `"3"` and `"abc"` are rejected with the message above.
2. `POST /api/tasks` returns 422 for a rejected estimate and 201 for an accepted one, as today for other rules.
3. A task without `estimateHours` is still created with `estimateHours: null`.
4. Every case in (1) has a unit test in `lib/tasks.test.ts`.

Added by this spec:

5. A rejected estimate stores nothing (`listTasks` stays empty).
6. `null`, `true` and `"40"` are rejected with the same message (decisions D1–D3).

## Tests

`lib/tasks.test.ts`, `describe("estimateHours")`:

| Test | Covers | On `main` (before the change) |
|---|---|---|
| accepts 1 (lower boundary) | AC1 | passes — regression guard |
| accepts 40 (upper boundary) | AC1 | passes — regression guard |
| `it.each` rejects `0`, `41`, `1.5`, `"3"`, `"abc"` with the exact message and stores nothing | AC1, AC4, AC5 | **fails**: `0`/`41` give the old message, `1.5`/`"3"`/`"abc"` don't throw |
| `it.each` rejects `null`, `true`, `"40"` with the exact message | AC6 | **fails**: old message or no throw |
| creates a task without estimateHours with `estimateHours: null` | AC3 | passes — regression guard |

`app/api/tasks/route.test.ts`:

| Test | Covers | On `main` |
|---|---|---|
| POST `{ title, estimateHours: 1.5 }` → 422 and the message | AC2 | **fails** (201) |
| POST `{ title, estimateHours: "abc" }` → 422 and the message | AC2 | **fails** (500 / thrown) |
| POST `{ title, estimateHours: 3 }` → 201 with `estimateHours: 3` | AC2 | passes |
| POST `{ title }` → 201 with `estimateHours: null` | AC2, AC3 | passes |

Route test setup: `vi.stubEnv("DB_FILE", ":memory:")` before the first request, because `db()` in `lib/db.ts` is a
singleton that reads `DB_FILE` once. All route tests share that one in-memory DB, so each test asserts only its own
response, never a row count. `data/tasks.db` is never opened (`.claude/rules/business-rules.md`).

## Decisions the ticket leaves open

- **D1 — `null`.** Rejected, as today; only the message changes. The ticket says "anything else is a validation
  error" and allows only *omitting* the field, so accepting `null` would be a behaviour change nobody asked for.
- **D2 — numeric strings.** `"3"` and `"40"` are rejected, not coerced. The ticket lists `"3"` as invalid.
- **D3 — booleans, arrays, objects.** Rejected by `typeof v === "number"`; `true` is tested as the representative,
  because today it is silently stored as `1`.
- **D4 — `40.0`.** `JSON.parse("40.0")` is the number `40`, so the API accepts it; it can't be told apart from `40`.
  Not tested separately.
- **D5 — `NaN`, `Infinity`.** Not expressible in JSON; a direct `createTask` call with them fails `Number.isInteger`.
  Not tested separately.
- **D6 — route test.** The ticket requires lib tests only. A small route test is added because AC2 is about HTTP
  status codes, and `"abc"` → 500 is the reported bug. `vitest.config.ts` gets `resolve.alias` for `@/` (the same
  mapping as `tsconfig.json` `paths`), so the route's `@/lib/...` imports resolve in tests. No new dependency.
- **D7 — docs.** The rule line in `README.md` and in `AGENTS.md` ("Where things live") becomes
  "estimate whole 1..40 h", so the three places from `.claude/rules/business-rules.md` agree.

## Non-goals

- No database migration; `check (estimate_hours between 1 and 40)` in `002_add_task_estimate.sql` stays.
  Existing rows with a fractional estimate are not migrated or cleaned up.
- No UI change.
- No change to titles, assignee or status transitions.
- No change to how the route parses the body: a missing title or malformed JSON stays 400.
- No coercion of strings to numbers.

## Verification

- Evidence file: `docs/evidence/TASK-7/whole-hours.md`, committed after the last code commit, with an
  `Evidence: docs/evidence/TASK-7/whole-hours.md` trailer.
- It records the full SHA (`git rev-parse HEAD`), date, OS and Node version, and for each command the raw output and
  exit code:
  - `npm test` — all tests green, including every row above;
  - `npm run typecheck` — clean;
  - `node docs/ai/ci/trace-gate.mjs --base origin/main --head HEAD --title "TASK-7 Whole-hour estimates" --key-pattern "TASK-[0-9]+"`.
- **Red first:** the evidence also shows `npm test` on the commit with the new tests and without the `lib/tasks.ts`
  change, with the failing rows from the "On `main`" column (`AGENTS.md` rule 3).
- Not verified: the UI and a manual `npm run dev` run (out of scope; the route test covers the HTTP behaviour).

Expected size: well under 100 changed lines, excluding this spec and the evidence.

## Rollback

Revert the merge commit (`git revert -m 1 <merge-sha>`). No data or schema to restore.
