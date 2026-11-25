#!/usr/bin/env bash
# owner: @Kurkov1990 · why: reproducible evidence that guard-migrations blocks and allows the right calls · review-by: 2027-03-23
# Feeds sample PreToolUse payloads to the hook and prints stderr and the exit code. Usage: bash docs/ai/hook-samples.sh
cd "$(dirname "$0")/../.." || exit 1
export CLAUDE_PROJECT_DIR="$PWD"
M=db/migrations
run() {
  echo "\$ [$1]"
  printf '%s' "$2" | node .claude/hooks/guard-migrations.mjs
  echo "exit code: $?"
  echo
}
run "Edit an applied migration" "{\"tool_name\":\"Edit\",\"tool_input\":{\"file_path\":\"$M/001_create_tasks.sql\",\"old_string\":\"120\",\"new_string\":\"200\"}}"
run "Write over an applied migration (absolute path)" "{\"tool_name\":\"Write\",\"tool_input\":{\"file_path\":\"$PWD/$M/002_add_task_estimate.sql\",\"content\":\"x\"}}"
run "Bash: sed -i on a migration" "{\"tool_name\":\"Bash\",\"tool_input\":{\"command\":\"sed -i '' s/120/200/ $M/001_create_tasks.sql\"}}"
run "Bash: rm a migration" "{\"tool_name\":\"Bash\",\"tool_input\":{\"command\":\"npm test && rm $M/002_add_task_estimate.sql\"}}"
run "Bash: append via redirect" "{\"tool_name\":\"Bash\",\"tool_input\":{\"command\":\"echo 'alter table tasks add x' >> $M/002_add_task_estimate.sql\"}}"
run "Write a new migration with a skipped number" "{\"tool_name\":\"Write\",\"tool_input\":{\"file_path\":\"$M/005_add_description.sql\",\"content\":\"x\"}}"
run "Write the next migration (allowed)" "{\"tool_name\":\"Write\",\"tool_input\":{\"file_path\":\"$M/003_add_task_description.sql\",\"content\":\"x\"}}"
run "Bash: read-only ls + cat (allowed)" "{\"tool_name\":\"Bash\",\"tool_input\":{\"command\":\"ls $M && cat $M/001_create_tasks.sql\"}}"
run "Bash: heredoc that only mentions the folder (allowed)" "{\"tool_name\":\"Bash\",\"tool_input\":{\"command\":\"cat > notes.md <<'EOF'\\nnever rm $M files\\nEOF\"}}"
run "Edit a lib file (allowed)" "{\"tool_name\":\"Edit\",\"tool_input\":{\"file_path\":\"lib/tasks.ts\",\"old_string\":\"a\",\"new_string\":\"b\"}}"

# Review follow-ups: bypasses that used to exit 0, and repair paths that used to exit 2.
run "Bash: cd into the folder, then sed -i" "{\"tool_name\":\"Bash\",\"tool_input\":{\"command\":\"cd $M && sed -i '' s/40/80/ 002_add_task_estimate.sql\"}}"
run "Bash: session cwd is the folder" "{\"tool_name\":\"Bash\",\"cwd\":\"$PWD/$M\",\"tool_input\":{\"command\":\"rm 001_create_tasks.sql\"}}"
run "Bash: 1> redirect" "{\"tool_name\":\"Bash\",\"tool_input\":{\"command\":\"echo x 1>$M/001_create_tasks.sql\"}}"
run "Bash: &> redirect" "{\"tool_name\":\"Bash\",\"tool_input\":{\"command\":\"echo x &>$M/001_create_tasks.sql\"}}"
run "Edit with different case (same file on APFS)" "{\"tool_name\":\"Edit\",\"tool_input\":{\"file_path\":\"DB/Migrations/001_create_tasks.sql\",\"old_string\":\"a\",\"new_string\":\"b\"}}"
run "Bash: 2>&1 and a read (allowed)" "{\"tool_name\":\"Bash\",\"tool_input\":{\"command\":\"cat $M/001_create_tasks.sql 2>&1 | head\"}}"
run "Bash: repair from HEAD (allowed)" "{\"tool_name\":\"Bash\",\"tool_input\":{\"command\":\"git restore --source=HEAD --staged --worktree -- $M/001_create_tasks.sql\"}}"
run "Bash: restore from an older commit" "{\"tool_name\":\"Bash\",\"tool_input\":{\"command\":\"git restore --source=HEAD~1 -- $M/001_create_tasks.sql\"}}"

# A throwaway clone for cases that need real file changes: an uncommitted 003 and the PostToolUse backstop.
SRC="$PWD"
TMP="$(mktemp -d)"
git clone -q "$SRC" "$TMP/repo" && cp "$SRC/.claude/hooks/guard-migrations.mjs" "$TMP/repo/.claude/hooks/"
(
  cd "$TMP/repo" || exit 1
  export CLAUDE_PROJECT_DIR="$PWD"
  run() {
    echo "\$ [clone: $1]"
    printf '%s' "$2" | node .claude/hooks/guard-migrations.mjs $3
    echo "exit code: $?"
    echo
  }
  echo "-- 003 written but not committed --" && echo "select 1;" > "$M/003_add_task_description.sql"
  run "Edit the uncommitted 003 (allowed)" "{\"tool_name\":\"Edit\",\"tool_input\":{\"file_path\":\"$M/003_add_task_description.sql\",\"old_string\":\"1\",\"new_string\":\"2\"}}"
  run "Write the next one, 004 (allowed)" "{\"tool_name\":\"Write\",\"tool_input\":{\"file_path\":\"$M/004_add_owner.sql\",\"content\":\"x\"}}"
  run "Post check with only a new 003 (allowed)" '{"tool_name":"Bash","tool_input":{"command":"x"}}' post
  echo "-- something the parser missed rewrote 002 --" && printf -- '-- x\n' >> "$M/002_add_task_estimate.sql"
  run "Post check after 002 changed" '{"tool_name":"Bash","tool_input":{"command":"find db -name 002* -exec sh -c ..."}}' post
  rm "$M/001_create_tasks.sql"
  run "Post check after 001 deleted too" '{"tool_name":"Bash","tool_input":{"command":"x"}}' post
)
rm -rf "$TMP"
