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
