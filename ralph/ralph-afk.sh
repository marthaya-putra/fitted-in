#!/bin/bash
set -e

if [ -z "$1" ]; then
  echo "Usage: $0 <iterations>"
  exit 1
fi

for ((i=1; i<=$1; i++)); do
echo "Starting iteration $i"

  result=$(claude --permission-mode bypassPermissions "@ralph/PRD.json   @ralph/progress.txt \\
1. Read the PRD and progress file. \\
2. Find the next incomplete task (pending) and implement it. \\
3. Check typing with ``npm run typecheck``, fix if there's any error \\
4. Check if the app is built successfully with ``npm run build``, fix if there's any error \\
5. Commit your changes. \\
6. Append progress.txt with what you did with format [yyyy-MM-dd hh:mm:ss] <details>. \\
7. Update the target PRD status to "done" \\
ONLY WORK ON A SINGLE TASK.
If ALL the tasks in PRD is complete, output <promise>COMPLETE</promise>.")

  echo "$result"

  if [[ "$result" == *"<promise>COMPLETE</promise>"* ]]; then
    echo "PRD complete after $i iterations."
    exit 0
  fi
done