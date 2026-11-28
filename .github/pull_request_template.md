<!-- owner: @Kurkov1990 · why: anyone must walk back from a merge commit to the requirement, spec, tests, evidence and reviewer · review-by: 2027-03-23
     Title: "<KEY> <imperative summary>", e.g. "TASK-7 Whole-hour estimates". Branch: <KEY>-<slug>. Every commit: "Refs: <KEY>" (AGENTS.md → Commits).
     Use full links (https://github.com/Kurkov1990/2026-spd-ws1-homework-starter/blob/<branch>/<path>): a bare path does not open from a PR page.
     The trace gate (.github/workflows/trace-gate.yml) fails the PR without a key in the title, Refs on every commit, or evidence for the head. -->
## Requirement

- Ticket: <!-- full link, e.g. https://github.com/Kurkov1990/2026-spd-ws1-homework-starter/blob/main/docs/tickets/TASK-7.md -->
- Spec: <!-- full link to the committed spec (blob/<branch>/docs/specs/<KEY>.md): acceptance criteria, non-goals -->
- Spec approved by: <!-- @handle, and when -->

## Scope

<!-- What changes, in 1–3 lines. One purpose per PR. What is deliberately not in this PR. -->

## Verified, and how

- Revision: <!-- the full SHA the checks ran on -->
- Commands: <!-- e.g. npm test, npm run typecheck, node docs/ai/ci/trace-gate.mjs … — with exit codes -->
- Evidence: <!-- full link to docs/evidence/<KEY>/<slice>.md: commands, outputs, exit codes -->
- Tests that prove the acceptance criteria: <!-- file and test names -->

## Known gaps

<!-- What was not verified, and why. "None" only if you mean it. -->

## Rollback

<!-- How to undo: revert the merge commit (git revert -m 1 <merge-sha>)? data or config to restore? -->

## Agent involvement

<!-- None, or: tool and model, what it did (spec draft, code, tests, review). Matches the Assisted-by trailers. -->

## Accountable

- Author: <!-- @handle — answers for this change after merge -->
- Reviewer: <!-- @handle of the human who judged it; agent review findings linked or pasted below -->
