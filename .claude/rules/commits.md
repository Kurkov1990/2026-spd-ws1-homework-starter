<!-- owner: @Kurkov1990 · why: a merged commit must lead back to its ticket, the agent that helped and the evidence it was checked on; CI (.github/workflows/trace-gate.yml) enforces it · review-by: 2027-03-23 -->

# Commits — traceability trailers

Every commit of a traced change ends with trailers (last paragraph, one per line):

- `Refs: <KEY>` — always, e.g. `Refs: TASK-7`. The branch is `<KEY>-<slug>`, the PR title starts with `<KEY>`.
- `Assisted-by: <tool> (<model>)` — when an agent wrote or changed any part of the commit; omit for human-only commits.
- `Evidence: docs/evidence/<KEY>/<slice>.md` — on the commit that adds the evidence file: commands, outputs, exit
  codes and the SHA they ran on.

Order of work: commit the code → run `npm test` and `npm run typecheck` → write the evidence with that SHA
(`git rev-parse HEAD`) → commit the evidence. A code commit after the evidence makes it stale and the gate red.
Merge PRs with **Create a merge commit** (no squash, no rebase), so the SHA in the evidence stays on `main`.

Example:

```text
Reject fractional estimates

estimateHours must be a whole number 1..40; the API answers 422 otherwise.

Refs: TASK-7
Assisted-by: Claude Code (claude-opus-5-5)
```

Single-line form (git 2.32+; PowerShell, cmd and Git Bash):

```bash
git commit -m "Reject fractional estimates" --trailer "Refs: TASK-7" --trailer "Assisted-by: Claude Code (claude-opus-5-5)"
```

Evidence commit:

```bash
git commit -m "Add evidence for whole-hour estimates" --trailer "Refs: TASK-7" --trailer "Evidence: docs/evidence/TASK-7/whole-hours.md"
```

Check what git parsed: `git log -1 --format="%(trailers)"`. Check the gate before pushing:
`node docs/ai/ci/trace-gate.mjs --base origin/main --head HEAD --title "TASK-7 Whole-hour estimates" --key-pattern "TASK-[0-9]+"`.
