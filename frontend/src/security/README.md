# security

Security scanning rule definitions for the infrastructure security analyser.

## Files

| File | Description |
|------|-------------|
| `rules.ts` | Array of `SecurityRule` objects; each rule has an `id`, `title`, `severity`, `category`, and a `check` function that receives the canvas nodes and returns a list of findings |

## How It Works

`SecurityPanel.tsx` imports `rules` from this directory and runs every rule's `check`
function against the current Zustand node list. Findings are rendered as a severity-sorted
list with remediation guidance.

