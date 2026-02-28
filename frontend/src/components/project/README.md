# components/project

Components for the project detail view (`/project/:projectId`).

Each tab of the project detail page has a dedicated component.

## Files

| File | Description |
|------|-------------|
| `GitConnectModal.tsx` | Modal for connecting a Git remote (GitHub, GitLab, Bitbucket) |
| `GitPushModal.tsx` | Modal for committing and pushing generated Terraform code to Git |
| `ProjectCode.tsx` | Code tab — syntax-highlighted Terraform HCL output |
| `ProjectGit.tsx` | Git tab — repository status, commit history, push controls |
| `ProjectHeader.tsx` | Project name, description, status badge, and action buttons |
| `ProjectOverview.tsx` | Overview tab — resource summary and quick stats |
| `ProjectRuns.tsx` | Runs tab — Terraform plan/apply/destroy execution history |
| `ProjectSecurity.tsx` | Security tab — findings list from the security scanner |
| `ProjectSettings.tsx` | Settings tab — project metadata and danger zone |
| `ProjectState.tsx` | State tab — raw Terraform state viewer |
| `ProjectVariables.tsx` | Variables tab — input variable values per workspace |
| `RunTerminal.tsx` | Simulated terminal output component used in the runs tab |
| `projectData.ts` | Static mock data used to populate project detail views |

