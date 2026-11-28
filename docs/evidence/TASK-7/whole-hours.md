# Evidence — TASK-7 whole-hours

<!-- owner: @Kurkov1990 · why: proof that the merged revision passes the checks for docs/specs/TASK-7.md · review-by: 2027-03-23 -->

- Revision: `3d6b1746fc1b3bf5e7fe10708b5f79b6488e12bd` (`git rev-parse HEAD` before this file was written; only this file changes after it)
- Ran: 2026-11-28 13:59 UTC, macOS 27.2.1 (Darwin), Node v23.6.0, vitest 5.1.0
- Who ran it: Claude Code (claude-opus-5-5), driven by @Kurkov1990, in the local checkout of `TASK-7-whole-hour-estimates`
- Spec: [docs/specs/TASK-7.md](https://github.com/Kurkov1990/2026-spd-ws1-homework-starter/blob/TASK-7-whole-hour-estimates/docs/specs/TASK-7.md)

## `npm test -- --reporter=verbose`

```text

> ws1-homework-starter@0.1.0 test
> vitest run --reporter=verbose


 RUN  v5.1.0 /Users/andrii/IdeaProjects/2026-spd-ws1-homework-starter

(node:19623) ExperimentalWarning: SQLite is an experimental feature and might change at any time
(Use `node --trace-warnings ...` to show where the warning was created)
(node:19622) ExperimentalWarning: SQLite is an experimental feature and might change at any time
(Use `node --trace-warnings ...` to show where the warning was created)
 ✓ lib/tasks.test.ts > tasks > creates a task in todo 2ms
 ✓ lib/tasks.test.ts > tasks > rejects an empty title 1ms
 ✓ lib/tasks.test.ts > tasks > follows todo → doing → done and keeps done final 0ms
 ✓ lib/tasks.test.ts > tasks > does not skip doing 1ms
 ✓ lib/tasks.test.ts > estimateHours > accepts 1 (lower boundary) 0ms
 ✓ lib/tasks.test.ts > estimateHours > accepts 40 (upper boundary) 0ms
 ✓ lib/tasks.test.ts > estimateHours > rejects 0 with the message and stores nothing 0ms
 ✓ lib/tasks.test.ts > estimateHours > rejects 41 with the message and stores nothing 0ms
 ✓ lib/tasks.test.ts > estimateHours > rejects 1.5 with the message and stores nothing 0ms
 ✓ lib/tasks.test.ts > estimateHours > rejects "3" with the message and stores nothing 0ms
 ✓ lib/tasks.test.ts > estimateHours > rejects "abc" with the message and stores nothing 0ms
 ✓ lib/tasks.test.ts > estimateHours > rejects null with the message (D1–D3) 0ms
 ✓ lib/tasks.test.ts > estimateHours > rejects true with the message (D1–D3) 0ms
 ✓ lib/tasks.test.ts > estimateHours > rejects "40" with the message (D1–D3) 0ms
 ✓ lib/tasks.test.ts > estimateHours > creates a task without estimateHours with estimateHours: null 0ms
 ✓ app/api/tasks/route.test.ts > POST /api/tasks estimateHours > returns 422 for 1.5 10ms
 ✓ app/api/tasks/route.test.ts > POST /api/tasks estimateHours > returns 422 for "abc" 0ms
 ✓ app/api/tasks/route.test.ts > POST /api/tasks estimateHours > returns 201 for a whole-hour estimate 1ms
 ✓ app/api/tasks/route.test.ts > POST /api/tasks estimateHours > returns 201 with estimateHours: null when the field is absent 1ms

 Test Files  2 passed (2)
      Tests  19 passed (19)
   Start at  15:59:49
   Duration  79ms (tests 53%, import 25%, transform 14%, worker 8%)
```

Exit code: 0

Every row of the spec's test list is green, boundaries 1 and 40 included:

| Acceptance criterion | Green tests above |
|---|---|
| AC1 accept 1, 40; reject 0, 41, 1.5, "3", "abc" with the message | `accepts 1`, `accepts 40`, `rejects 0` … `rejects "abc"` |
| AC2 POST → 422 / 201 | `returns 422 for 1.5`, `returns 422 for "abc"`, `returns 201 …` (2) |
| AC3 absent → `estimateHours: null` | `creates a task without estimateHours …`, `returns 201 with estimateHours: null …` |
| AC4 unit test per case in `lib/tasks.test.ts` | the 7 AC1 rows are in `lib/tasks.test.ts` |
| AC5 nothing stored on rejection | `… and stores nothing` rows |
| AC6 null, true, "40" rejected | `rejects null`, `rejects true`, `rejects "40"` |

## `npm run typecheck`

```text

> ws1-homework-starter@0.1.0 typecheck
> tsc --noEmit
```

Exit code: 0

## Red first — `npm test -- --reporter=verbose` on the tests-only commit

Revision: `4e29b19c96e673e826832055b933f377f2e4698d` (new tests, `lib/tasks.ts` not yet changed), run in a temporary `git worktree` of that commit.
The rejection rows fail and the regression rows pass, as the spec's "On `main`" column predicts (`AGENTS.md` rule 3).

```text

> ws1-homework-starter@0.1.0 test
> vitest run --reporter=verbose


 RUN  v5.1.0 /private/tmp/claude-501/-Users-andrii-IdeaProjects-2026-spd-ws1-homework-starter/01f3dc95-fe6d-468e-8e7c-5c6039a736e7/scratchpad/red-wt

(node:19652) ExperimentalWarning: SQLite is an experimental feature and might change at any time
(Use `node --trace-warnings ...` to show where the warning was created)
(node:19651) ExperimentalWarning: SQLite is an experimental feature and might change at any time
(Use `node --trace-warnings ...` to show where the warning was created)
 ✓ lib/tasks.test.ts > tasks > creates a task in todo 2ms
 ✓ lib/tasks.test.ts > tasks > rejects an empty title 0ms
 ✓ lib/tasks.test.ts > tasks > follows todo → doing → done and keeps done final 0ms
 ✓ lib/tasks.test.ts > tasks > does not skip doing 0ms
 ✓ lib/tasks.test.ts > estimateHours > accepts 1 (lower boundary) 0ms
 ✓ lib/tasks.test.ts > estimateHours > accepts 40 (upper boundary) 0ms
 × lib/tasks.test.ts > estimateHours > rejects 0 with the message and stores nothing 3ms
   → expected a thrown error to be Error: estimateHours must be a whole numb…
 × lib/tasks.test.ts > estimateHours > rejects 41 with the message and stores nothing 1ms
   → expected a thrown error to be Error: estimateHours must be a whole numb…
 × lib/tasks.test.ts > estimateHours > rejects 1.5 with the message and stores nothing 1ms
   → expected function to throw an error, but it didn't
 × lib/tasks.test.ts > estimateHours > rejects "3" with the message and stores nothing 0ms
   → expected function to throw an error, but it didn't
 × lib/tasks.test.ts > estimateHours > rejects "abc" with the message and stores nothing 1ms
   → expected a thrown error to be Error: estimateHours must be a whole numb…
 × lib/tasks.test.ts > estimateHours > rejects null with the message (D1–D3) 0ms
   → expected a thrown error to be Error: estimateHours must be a whole numb…
 × lib/tasks.test.ts > estimateHours > rejects true with the message (D1–D3) 0ms
   → expected a thrown error to be Error: estimateHours must be a whole numb…
 × lib/tasks.test.ts > estimateHours > rejects "40" with the message (D1–D3) 0ms
   → expected function to throw an error, but it didn't
 ✓ lib/tasks.test.ts > estimateHours > creates a task without estimateHours with estimateHours: null 0ms
 × app/api/tasks/route.test.ts > POST /api/tasks estimateHours > returns 422 for 1.5 12ms
   → expected 201 to be 422 // Object.is equality
 × app/api/tasks/route.test.ts > POST /api/tasks estimateHours > returns 422 for "abc" 1ms
   → CHECK constraint failed: estimate_hours between 1 and 40
 ✓ app/api/tasks/route.test.ts > POST /api/tasks estimateHours > returns 201 for a whole-hour estimate 1ms
 ✓ app/api/tasks/route.test.ts > POST /api/tasks estimateHours > returns 201 with estimateHours: null when the field is absent 0ms


[… 10 failure diffs (expected vs received) omitted for length; rerun the command below to see them …]

 Test Files  2 failed (2)
      Tests  10 failed | 9 passed (19)
   Start at  15:59:49
   Duration  110ms (tests 43%, transform 37%, import 15%, worker 4%)
```

Exit code: 1

## `node docs/ai/ci/trace-gate.mjs --base origin/main --head HEAD --title "TASK-7 Whole-hour estimates" --key-pattern "TASK-[0-9]+"`

Run on `3d6b174`, **before** this evidence file existed, so exit 1 is the expected result: the gate passes only once
this file is committed with an `Evidence:` trailer. The same failure in CI is the red run
https://github.com/Kurkov1990/2026-spd-ws1-homework-starter/actions/runs/46152287235.

```text
key TASK-7 (from the PR title)
4 commit(s), 4 with Assisted-by
::error::no commit carries an Evidence: trailer (e.g. Evidence: docs/evidence/<KEY>/<slice>.md)
trace gate: FAIL (1 error(s))
```

Exit code: 1

## Not verified

- The UI and a manual `npm run dev` run: out of scope for TASK-7 (no UI change); `app/api/tasks/route.test.ts` covers
  the HTTP status codes through the real route handler.
- CI ran the trace gate only; `npm test` and `npm run typecheck` ran locally (no CI workflow runs them in this repo).
- Node 24 (the version CI uses for the gate) was not used for the tests; they ran on Node v23.6.0 (`AGENTS.md`: Node >= 22.13).
