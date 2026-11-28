# Homework 1.2 — Traceability, from ticket to merge

**Effort:** 90–120 min · **Deadline:** Wed 02.12.2026, 23:59 (Kyiv) · **Works on any Claude plan**

Deliver one small ticket so that anyone can walk back from the merged commit to the requirement, the spec, the tests
and the person who judged the change. Then make CI enforce that trail. Work in **the same fork** (or own repo) as
HW 1.1, on top of your HW 1.1 harness.

## Deliverables

**Convention**
1. A **PR template with traceability fields**: `.github/pull_request_template.md` in your fork. Start from
   [the template](docs/ai/templates/pull-request.md). It needs a requirement link, scope, what was verified and
   how (commands, revision), known gaps, rollback, agent involvement and the accountable person.
2. A **commit-trailer convention** in your rules: your `AGENTS.md` or a `.claude/rules/` file, with the rule
   header. Start from [the template](docs/ai/templates/trailers.md). It covers `Refs:`, `Assisted-by:` and
   `Evidence:`.

**Gate**
3. A **CI trace check**: copy [`docs/ai/ci/trace-gate.yml`](docs/ai/ci/README.md) to `.github/workflows/`. You may
   adapt the provided scripts; say what you changed and why.

**Delivery**
4. Deliver the supplied ticket [**TASK-7 — Estimates in whole hours**](docs/tickets/TASK-7.md) from ticket to
   merge, in a PR inside your fork. It needs:
   - a **spec**: `docs/specs/TASK-7.md`, with acceptance criteria and non-goals, approved by you;
   - **trailers** on every commit, `Refs: TASK-7` at least;
   - an **evidence file** for the head: `docs/evidence/TASK-7/<slice>.md`, with commands, outputs, exit codes and
     the SHA they ran on ([template](docs/ai/templates/evidence.md));
   - a **recorded reviewer**: a human who judged the change, visible on the PR.
5. **Proof that the gate bites**: one red trace-gate run on a change without a key or without evidence, and the
   green run on the final PR.

**Optional**
6. The diff-size gate ([`docs/ai/ci/diff-size.yml`](docs/ai/ci/README.md)), or a `Stop` hook that runs the
   tests before the agent may finish.

## Trace gate rules

The PR fails when:

- the PR title has no key matching `TASK-[0-9]+`;
- any non-merge commit has no `Refs:` trailer with that key;
- the newest commit with an `Evidence:` trailer names a file that is missing at the head;
- or none of the files it names contains a **verified revision**: a commit of the PR (full SHA or at least 7 hex
  characters) after which only evidence files changed.

So: commit the code, run the checks, write the evidence with that SHA, commit the evidence. Details:
[docs/ai/ci/README.md](docs/ai/ci/README.md).

## How to submit — same fork as HW 1.1

1. **Sync your fork** with upstream `main` (the **Sync fork** button) to get this brief, the ticket and the CI
   files.
2. **Bring in your HW 1.1 harness.** Merge your `hw1-1/<your-github-handle>` branch into your fork's `main`. Your
   HW 1.1 PR to upstream stays open; we don't merge it.
3. **Enable Actions in your fork:** open the **Actions** tab and confirm. Forks start with workflows off.
4. Add deliverables 1–3. They can go in a first PR of their own with their own key, or in the TASK-7 PR.
5. Branch **`TASK-7-<slug>`**. Open the PR **inside your fork**: base `<you>/2026-spd-ws1-homework-starter` `main`.
   Title `TASK-7 <summary>`.
6. Get a **human review** on the PR. GitHub doesn't let you approve your own PR, so ask a colleague or another
   participant; any GitHub user can leave a review on a public repo. Agent review findings are welcome as well,
   not instead.
7. **Merge with "Create a merge commit"** so the SHAs in your evidence stay on `main`.
8. Open an issue here with the **«HW 1.2 submission»** template: your name, the merged PR, the red run and the green
   run.

Your own public repo instead (as in HW 1.1)? Copy `HOMEWORK-1.2.md`, `docs/tickets/`, `docs/ai/ci/` and the new
templates from this repo, do the same steps there, and submit the same issue.

Never use client code, secrets or anything under NDA. Public repos only.

## Rules of the road

- **Any Claude plan works.** Everything is in the repo and in GitHub Actions on your public fork.
- **Commands are single-line** and work in PowerShell, cmd and Git Bash. Commit with trailers:
  `git commit -m "Reject fractional estimates" --trailer "Refs: TASK-7"` (git 2.32+; add one `--trailer` per line).
- **Run the gate locally** before pushing:
  `node docs/ai/ci/trace-gate.mjs --base origin/main --head HEAD --title "TASK-7 Whole-hour estimates" --key-pattern "TASK-[0-9]+"`
- **A red run is a deliverable.** The easiest one: push the code commit and open the PR before you commit the
  evidence.
- **Fixing a title** re-runs the gate (the workflow listens to `edited`). **Fixing a commit** means amending or
  rebasing it and force-pushing your branch. That is fine before merge.
- **No `CLAUDE.md`**, as in HW 1.1.

## Acceptance criteria (self-check)

1. **Another engineer**, starting from `git log -1` of the merge commit on your `main`, finds the requirement, the
   spec, the tests and the reviewer without asking you.
2. **CI fails** on a change without a key or evidence, and **passes** on the correct one.
3. **The evidence matches the merged revision**: the SHA in the evidence file is on `main`, and only evidence
   files changed after it.

## Rubric

Each line is 0, 1 or 2 points. 14+ of 20 is a pass; we comment on every submission either way.

| # | Criterion | 0 | 1 | 2 |
|---|---|---|---|---|
| 1 | PR template | missing | some fields, or no verification field | requirement, scope, verified how (commands, revision), gaps, rollback, agent involvement, accountable |
| 2 | Trailer convention | missing | trailers listed, no example or no rule header | in `AGENTS.md` or a rule, with an example and a header |
| 3 | Spec | missing | restates the ticket | acceptance criteria, test list and non-goals; approval recorded |
| 4 | Key end to end | missing | in some places | branch, PR title and every commit's `Refs:` carry `TASK-7` |
| 5 | Evidence | missing or a summary | raw output, but no SHA or a stale SHA | commands, outputs and exit codes for a SHA on `main` with only evidence after it |
| 6 | Tests | none | happy path only | each acceptance case, boundaries 1 and 40 included, green in the evidence |
| 7 | Trace gate installed | missing | present, never ran | runs on every PR in the fork, adaptations explained |
| 8 | Red run | missing | red for an unrelated reason | red on a missing key or missing evidence, link in the submission |
| 9 | Reviewer and merge | no review, squash or rebase | agent review only, or self-judged | a human review on the PR, merged with a merge commit |
| 10 | Walk-back | can't be done | needs the author's help | from the merge commit to ticket, spec, tests, evidence and reviewer, links only |

The optional diff-size gate or `Stop` hook earns no points; we review it and comment.

## Feedback

Review comments on your submission issue, and anonymised common patterns at the start of the next session.
