# stores

Zustand global state stores.

## Files

| File | Description |
|------|-------------|
| `useEditorStore.ts` | Primary editor state: canvas nodes, edges, connection validation, project settings (workspaces, variables, outputs, backend, providers) |
| `useGitStore.ts` | Git integration state: connected repository, branch, commit history, push status |
| `useSimulationStore.ts` | Network simulation state: active scenarios, packet animation, latency results |
| `useTerraformStore.ts` | Terraform execution state: plan output, apply status, run history |

## Pattern

Each store is created with `zustand`'s `create()` and exported as a custom hook.
Components subscribe to only the slices they need to avoid unnecessary re-renders.

