# Hook evidence — `guard-migrations`

<!-- owner: @Kurkov1990 · why: proof that the PreToolUse hook blocks violations with exit 2 and a readable reason · review-by: 2027-03-23 -->

Hook: `.claude/hooks/guard-migrations.mjs`, wired in `.claude/settings.json` as `PreToolUse` on
`Edit|Write|MultiEdit|NotebookEdit|Bash`. Every decision is appended to `.claude/hooks/guard-migrations.log` (git-ignored).

## 1. Live session (Claude Code 2.1.330, macOS)

The agent tried to edit an applied migration with the Edit tool. The tool call was blocked:

```text
Edit db/migrations/002_add_task_estimate.sql  ("between 1 and 40" → "between 1 and 80")

PreToolUse:Edit hook error: [node "$CLAUDE_PROJECT_DIR/.claude/hooks/guard-migrations.mjs"]:
guard-migrations: db/migrations/002_add_task_estimate.sql is an applied migration and must not change.
Create db/migrations/003_<what>.sql instead.
```

`git status` afterwards: no change under `db/migrations/`.

**A false positive found live, and the fix.** The first version matched `rm|mv|cp|…` anywhere in a Bash command that
mentioned `db/migrations`. It blocked a harmless `cat > next.config.ts <<'EOF' … EOF` whose heredoc *text* mentioned the
folder. Now the hook ignores heredoc bodies, splits the command on `; && || |` and newlines, and checks only segments
that write into the folder. The heredoc case below covers this.

## 2. Manual run (`bash docs/ai/hook-samples.sh`)

```text
$ [Edit an applied migration]
guard-migrations: db/migrations/001_create_tasks.sql is an applied migration and must not change. Create db/migrations/003_<what>.sql instead.
exit code: 2

$ [Write over an applied migration (absolute path)]
guard-migrations: db/migrations/002_add_task_estimate.sql is an applied migration and must not change. Create db/migrations/003_<what>.sql instead.
exit code: 2

$ [Bash: sed -i on a migration]
guard-migrations: shell command would modify db/migrations/ ("sed -i '' s/120/200/ db/migrations/001_create_tasks.sql"). Applied migrations are immutable; add db/migrations/003_<what>.sql with the Write tool instead.
exit code: 2

$ [Bash: rm a migration]
guard-migrations: shell command would modify db/migrations/ ("rm db/migrations/002_add_task_estimate.sql"). Applied migrations are immutable; add db/migrations/003_<what>.sql with the Write tool instead.
exit code: 2

$ [Bash: append via redirect]
guard-migrations: shell command would modify db/migrations/ ("echo 'alter table tasks add x' >> db/migrations/002_add_task_estimate.sql"). Applied migrations are immutable; add db/migrations/003_<what>.sql with the Write tool instead.
exit code: 2

$ [Write a new migration with a skipped number]
guard-migrations: new migration must be named 003_snake_case.sql (got 005_add_description.sql).
exit code: 2

$ [Write the next migration (allowed)]
exit code: 0

$ [Bash: read-only ls + cat (allowed)]
exit code: 0

$ [Bash: heredoc that only mentions the folder (allowed)]
exit code: 0

$ [Edit a lib file (allowed)]
exit code: 0
```

## 3. Log (`.claude/hooks/guard-migrations.log`)

```text
2026-11-23T17:19:45.956Z BLOCK Edit db/migrations/001_create_tasks.sql
2026-11-23T17:19:45.982Z BLOCK Write db/migrations/002_add_task_estimate.sql
2026-11-23T17:19:46.009Z BLOCK Bash "sed -i '' s/120/200/ db/migrations/001_create_tasks.sql"
2026-11-23T17:19:46.035Z BLOCK Bash "rm db/migrations/002_add_task_estimate.sql"
2026-11-23T17:19:46.061Z BLOCK Bash "echo 'alter table tasks add x' >> db/migrations/002_add_task_estimate.sql"
2026-11-23T17:19:46.088Z BLOCK Write db/migrations/005_add_description.sql
2026-11-23T17:19:46.114Z ALLOW Write db/migrations/003_add_task_description.sql
```
