# PROJECT_ANALYSIS

## 1) PROJECT OVERVIEW
CloudForge is a React + TypeScript frontend for visually designing cloud infrastructure (primarily AWS) on a React Flow canvas and generating Terraform code. Users can create and manage projects, configure infrastructure resources (including a detailed EC2 wizard), run mock Terraform workflows, and review project-level views (runs, code, security, variables, state, git). The app includes public marketing/auth pages and protected product pages behind a Zustand-backed auth gate. Current implementation is frontend-only with many mocked datasets/actions and no backend folder in this repository. The codebase mixes newer Tailwind-based UI with older inline-style legacy components.

## 2) TECH STACK
### Runtime / Build
- React `^19.2.0`
- React DOM `^19.2.0`
- TypeScript `~5.9.3`
- Vite `^8.0.0-beta.13`
- @vitejs/plugin-react `^5.1.1`

### Routing / State / Forms
- react-router-dom `^7.13.1`
- zustand `^5.0.11`
- react-hook-form `^7.71.2`
- @hookform/resolvers `^5.2.2`
- zod `^4.3.6`

### UI / Styling / DX
- tailwindcss `^4.2.1`
- @tailwindcss/vite `^4.2.1`
- @fontsource/inter `^5.2.8`
- lucide-react `^0.575.0`
- clsx `^2.1.1`
- tailwind-merge `^3.5.0`

### Canvas / Code / Utilities
- @xyflow/react `^12.10.1`
- @monaco-editor/react `^4.7.0`
- axios `^1.13.5`
- date-fns `^4.1.0`
- react-hot-toast `^2.6.0`

### Linting / Types (dev)
- eslint `^9.39.1`
- @eslint/js `^9.39.1`
- typescript-eslint `^8.48.0`
- eslint-plugin-react-hooks `^7.0.1`
- eslint-plugin-react-refresh `^0.4.24`
- @types/node `^24.10.1`
- @types/react `^19.2.7`
- @types/react-dom `^19.2.3`
- globals `^16.5.0`

### Python/backend requirements
- `requirements.txt`: not present

## 3) FILE COUNT
Count basis: excludes `.git` and `frontend/node_modules`.

- Total files in project: **2023**
- `frontend/src/components`: **104**
- `frontend/src/pages`: **14**
- `frontend/src/stores`: **8**
- `frontend/src/services`: **1**
- `frontend/src/hooks`: **3**
- `frontend/src/types`: **12**
- `frontend/src/utils`: **6**
- `frontend/src/constants`: **2**
- `backend`: **missing (0)**

## 4) ARCHITECTURE
- Entry: [`frontend/src/main.tsx`](./frontend/src/main.tsx) mounts `App` and global CSS.
- Routing: [`frontend/src/App.tsx`](./frontend/src/App.tsx) defines all routes directly (no `src/router.tsx` file). Protected routes use [`ProtectedRoute`](./frontend/src/components/layout/ProtectedRoute.tsx).
- Layout system:
  - Public pages use [`PublicLayout`](./frontend/src/components/layout/PublicLayout.tsx).
  - Authenticated pages use [`AppLayout`](./frontend/src/components/layout/AppLayout.tsx) with [`Sidebar`](./frontend/src/components/layout/Sidebar.tsx) + [`Header`](./frontend/src/components/layout/Header.tsx).
- State/data flow:
  - UI actions update Zustand stores (`useEditorStore`, `useAuthStore`, `useProjectStore`, `useTerraformStore`, etc.).
  - Canvas uses `useEditorStore` for nodes/edges/selection/history/settings.
  - API layer is generic Axios helpers in [`src/services/api.ts`](./frontend/src/services/api.ts); most pages currently use mocked data instead of endpoint-specific services.
- Terraform flow:
  - `useEditorStore` holds graph/settings.
  - `src/utils/terraform.ts` transforms supported node types + edges into `main.tf`, `variables.tf`, `outputs.tf`.

## 5) COMPONENTS INVENTORY
Format: `path — description — status`

### auth
- `frontend/src/components/auth/AuthLayout.tsx` — legacy auth wrapper with inline styles — has issues (legacy/unused style system).
- `frontend/src/components/auth/LoginForm.tsx` — legacy login form — has issues (mock auth, likely unused).
- `frontend/src/components/auth/RegisterForm.tsx` — legacy register form — has issues (mock auth, likely unused).

### canvas (top-level)
- `frontend/src/components/canvas/Canvas.tsx` — React Flow canvas + EC2 modal wiring — mostly complete.
- `frontend/src/components/canvas/CloudSelector.tsx` — pre-editor cloud selector — complete.
- `frontend/src/components/canvas/ConnectionError.tsx` — invalid-edge banner — complete.
- `frontend/src/components/canvas/EditorNavbar.tsx` — top bar in editor — complete.
- `frontend/src/components/canvas/EditorTabs.tsx` — right-panel tab switcher — complete.
- `frontend/src/components/canvas/ExecutionPanel.tsx` — Terraform run simulation/history UI — complete (mocked behavior).
- `frontend/src/components/canvas/OutputsPanel.tsx` — output variable manager — complete.
- `frontend/src/components/canvas/PropertiesPanel.tsx` — selected-node property editor — complete.
- `frontend/src/components/canvas/SecretsPanel.tsx` — secrets CRUD panel — has issues (unused helper per TS errors).
- `frontend/src/components/canvas/SecurityPanel.tsx` — security findings panel — has issues (unused imported type per TS errors).
- `frontend/src/components/canvas/SettingsPanel.tsx` — provider/backend settings editor — complete.
- `frontend/src/components/canvas/Sidebar.tsx` — draggable component palette/search — complete.
- `frontend/src/components/canvas/SimulationOverlay.tsx` — animated overlay for packet simulation — has issues (unused imports/vars per TS errors).
- `frontend/src/components/canvas/SimulationPanel.tsx` — simulation controls/stats — has issues (unused imports/vars per TS errors).
- `frontend/src/components/canvas/Toolbar.tsx` — canvas-level actions (export/clear/etc.) — complete.
- `frontend/src/components/canvas/VariablesPanel.tsx` — Terraform variable manager — has issues (unused helper per TS errors).
- `frontend/src/components/canvas/WorkspaceSelector.tsx` — workspace dropdown/create/delete — complete.

### canvas/nodes
- `frontend/src/components/canvas/nodes/AwsIcon.tsx` — maps node types to AWS icon assets/fallbacks — complete.
- `frontend/src/components/canvas/nodes/AwsNode.tsx` — generic AWS node renderer — complete.
- `frontend/src/components/canvas/nodes/SubnetNode.tsx` — subnet container node — complete.
- `frontend/src/components/canvas/nodes/VpcNode.tsx` — VPC container node — complete.
- `frontend/src/components/canvas/nodes/nodeTypes.ts` — React Flow node type registry — complete.

### canvas/modals/ec2
- `frontend/src/components/canvas/modals/ec2/EC2Modal.tsx` — full EC2 launch-like wizard shell — has issues (unused import `EC2_STEPS`).
- `frontend/src/components/canvas/modals/ec2/EC2ModalSidebar.tsx` — section nav/completion/cost side rail — complete.
- `frontend/src/components/canvas/modals/ec2/EC2SummaryPanel.tsx` — live summary + cost panel — complete.
- `frontend/src/components/canvas/modals/ec2/steps/Step1NameTags.tsx` — name/tags step — complete.
- `frontend/src/components/canvas/modals/ec2/steps/Step2AMI.tsx` — AMI search/filter/select step — has issues (unused filter constants import).
- `frontend/src/components/canvas/modals/ec2/steps/Step3InstanceType.tsx` — instance type selection step — complete.
- `frontend/src/components/canvas/modals/ec2/steps/Step4KeyPair.tsx` — key pair step — complete.
- `frontend/src/components/canvas/modals/ec2/steps/Step5Network.tsx` — network/subnet/SG/IP step — complete.
- `frontend/src/components/canvas/modals/ec2/steps/Step6Storage.tsx` — storage device step — complete.
- `frontend/src/components/canvas/modals/ec2/steps/Step7Advanced.tsx` — advanced EC2 options — complete.
- `frontend/src/components/canvas/modals/ec2/steps/StepSummary.tsx` — final review/cost step — complete.

### dashboard
- `frontend/src/components/dashboard/EmptyState.tsx` — legacy empty-state card — has issues (unused in modern pages, inline styles).
- `frontend/src/components/dashboard/NewProjectModal.tsx` — legacy create modal — has issues (mocked + inline styles).
- `frontend/src/components/dashboard/ProjectCard.tsx` — legacy dashboard card — has issues (inline styles/likely unused).

### landing
- `frontend/src/components/landing/Hero.tsx` — legacy hero section — has issues (inline styles/likely unused).
- `frontend/src/components/landing/Features.tsx` — legacy feature section — has issues (inline styles/likely unused).
- `frontend/src/components/landing/CTA.tsx` — legacy CTA section — has issues (inline styles/likely unused).
- `frontend/src/components/landing/CanvasNode.tsx` — legacy helper node visual — has issues (legacy path).

### layout
- `frontend/src/components/layout/AppLayout.tsx` — authenticated app shell — complete.
- `frontend/src/components/layout/Header.tsx` — top nav/user menu/search — has issues (unused `React` import).
- `frontend/src/components/layout/Sidebar.tsx` — app sidebar/nav/projects list — has issues (unused `React` import).
- `frontend/src/components/layout/PublicLayout.tsx` — marketing/auth shell — complete.
- `frontend/src/components/layout/ProtectedRoute.tsx` — auth gate + redirect — complete.
- `frontend/src/components/layout/DashboardNavbar.tsx` — legacy dashboard navbar — has issues (legacy/likely unused).
- `frontend/src/components/layout/DashboardSidebar.tsx` — legacy dashboard sidebar — has issues (legacy/likely unused).
- `frontend/src/components/layout/Footer.tsx` — legacy footer — has issues (legacy/likely unused).
- `frontend/src/components/layout/Navbar.tsx` — legacy public navbar — has issues (legacy/likely unused).

### project
- `frontend/src/components/project/ProjectHeader.tsx` — project detail top section/tabs — complete.
- `frontend/src/components/project/ProjectOverview.tsx` — overview tab with miniature canvas/stats — complete.
- `frontend/src/components/project/ProjectRuns.tsx` — execution history tab — complete.
- `frontend/src/components/project/RunTerminal.tsx` — terminal renderer for run logs — complete.
- `frontend/src/components/project/ProjectCode.tsx` — code explorer and git actions — complete.
- `frontend/src/components/project/ProjectVariables.tsx` — variables/secrets tab — complete (mock-driven).
- `frontend/src/components/project/ProjectState.tsx` — Terraform state tab — complete (mock-driven).
- `frontend/src/components/project/ProjectSecurity.tsx` — security tab — complete.
- `frontend/src/components/project/ProjectGit.tsx` — git tab — has issues (unused prop `project`).
- `frontend/src/components/project/GitConnectModal.tsx` — connect repo modal — complete (mock-driven).
- `frontend/src/components/project/GitPushModal.tsx` — push modal — complete (mock-driven).
- `frontend/src/components/project/ProjectSettings.tsx` — project settings tab — complete.
- `frontend/src/components/project/projectData.ts` — mock dataset/helpers for project tabs — has issues (mock-heavy, not API-backed).

### ui
- `frontend/src/components/ui/Badge.tsx` — status badge primitive — complete.
- `frontend/src/components/ui/Button.tsx` — button primitive — complete.
- `frontend/src/components/ui/Card.tsx` — card primitive — complete.
- `frontend/src/components/ui/CodeEditor.tsx` — Monaco editor wrapper — has issues (unused `React` import).
- `frontend/src/components/ui/ConfirmDialog.tsx` — confirm modal wrapper — has issues (unused `React` import).
- `frontend/src/components/ui/Dropdown.tsx` — dropdown primitive — complete.
- `frontend/src/components/ui/EmptyState.tsx` — empty-state primitive — has issues (unused `React` import).
- `frontend/src/components/ui/FeatureCard.tsx` — legacy feature card — has issues (inline-style legacy pattern).
- `frontend/src/components/ui/FileUpload.tsx` — file uploader — has issues (unused `React` import).
- `frontend/src/components/ui/Input.tsx` — input primitive — complete.
- `frontend/src/components/ui/Modal.tsx` — accessible modal primitive — complete.
- `frontend/src/components/ui/ProgressBar.tsx` — progress primitive — has issues (unused `React` import).
- `frontend/src/components/ui/SearchInput.tsx` — search input primitive — has issues (unused `React` import).
- `frontend/src/components/ui/Select.tsx` — select primitive — complete.
- `frontend/src/components/ui/Skeleton.tsx` — skeleton primitive — has issues (unused `React` import).
- `frontend/src/components/ui/StepWizard.tsx` — wizard primitive — complete.
- `frontend/src/components/ui/Table.tsx` — table primitive — complete.
- `frontend/src/components/ui/Tabs.tsx` — tabs primitive — complete.
- `frontend/src/components/ui/TagsInput.tsx` — tags input — has issues (incorrect `KeyboardEvent` import style + unused `React`).
- `frontend/src/components/ui/Toggle.tsx` — toggle primitive — has issues (unused `React` import).
- `frontend/src/components/ui/Tooltip.tsx` — tooltip primitive — has issues (typing around `React.cloneElement`).

## 6) PAGES INVENTORY
Format: `file — route — layout — status`

- `frontend/src/pages/Landing.tsx` — `/` — `PublicLayout` — complete.
- `frontend/src/pages/Login.tsx` — `/login` — `PublicLayout` — complete (mock auth).
- `frontend/src/pages/Register.tsx` — `/register` — `PublicLayout` — complete (mock auth).
- `frontend/src/pages/ForgotPassword.tsx` — `/forgot-password` — `PublicLayout` — complete (mock submission).
- `frontend/src/pages/ResetPassword.tsx` — `/reset-password` — `PublicLayout` — complete (mock submission).
- `frontend/src/pages/Pricing.tsx` — `/pricing` — `PublicLayout` — complete.
- `frontend/src/pages/NotFound.tsx` — `*` — standalone — complete.
- `frontend/src/pages/Dashboard.tsx` — `/dashboard` — `AppLayout` via `ProtectedRoute` — has issues (unused `setSearch`).
- `frontend/src/pages/ProjectDetail.tsx` — `/projects/:projectId` — `AppLayout` via `ProtectedRoute` — complete.
- `frontend/src/pages/Editor.tsx` — `/editor/:projectId` — editor shell/canvas via `ProtectedRoute` — complete.
- `frontend/src/pages/Profile.tsx` — `/profile` — `AppLayout` via `ProtectedRoute` — complete (mock save).
- `frontend/src/pages/Billing.tsx` — `/billing` — `AppLayout` via `ProtectedRoute` — complete (mock billing action).
- `frontend/src/pages/Marketplace.tsx` — `/marketplace` — `AppLayout` via `ProtectedRoute` — complete (mock templates).

## 7) STORES INVENTORY
- `useAuthStore` (`frontend/src/stores/useAuthStore.ts`)
  - State: `user`, `accessToken`, `isAuthenticated`, `isLoading`
  - Actions: `setUser`, `setAccessToken`, `logout`, `setLoading`
  - Persisted key: `cloudforge-auth` (partialized).
- `useEditorStore` (`frontend/src/stores/useEditorStore.ts`)
  - State: provider, `nodes`, `edges`, selection ids, connectionError, history stack/index, dirty flag, Terraform settings/workspaces.
  - Actions: canvas change handlers, connect validation, add/delete/select/update node/edge, undo/redo, workspace CRUD/switch/rename/update vars, variable/output/provider/backend/version mutations.
- `useProjectStore` (`frontend/src/stores/useProjectStore.ts`)
  - State: `projects`, `currentProject`, `isLoading`
  - Actions: set/add/update/delete project, loading flag.
- `useGitStore` (`frontend/src/stores/useGitStore.ts`)
  - State: repository, branches, commits, current branch, push status
  - Actions: connect/disconnect repo, switch/create branch, simulated `pushToGit`, `getCommitDiff`.
- `useSimulationStore` (`frontend/src/stores/useSimulationStore.ts`)
  - State: run/pause flags, current flow, flow list, active hops, stats, speed, selected scenario
  - Actions: set flags, add/remove hops/flows, update/reset stats, speed/scenario/reset.
- `useTerraformStore` (`frontend/src/stores/useTerraformStore.ts`)
  - State: variables, secrets, executions/currentExecution, generatedCode, generating/executing flags
  - Actions: CRUD for vars/secrets/executions + set code/flags.
- `useUIStore` (`frontend/src/stores/useUIStore.ts`)
  - State: `sidebarCollapsed`, `activeModal`, `modalData`
  - Actions: toggle/set sidebar, open/close modal
  - Persisted key: `cloudforge-ui` (sidebar only).

## 8) SERVICES INVENTORY
- `frontend/src/services/api.ts`
  - Defines Axios client with base URL `VITE_API_URL ?? http://localhost:8000/api`.
  - Request interceptor: injects Bearer token from `useAuthStore`.
  - Response interceptor: handles `401/403/422/5xx` with logout/redirect and toasts.
  - Exposes generic helpers: `apiGet`, `apiPost`, `apiPut`, `apiPatch`, `apiDelete`.
  - Explicit endpoint-specific service modules are currently missing.

## 9) CANVAS SYSTEM
- Core graph editor uses `@xyflow/react` in [`Canvas.tsx`](./frontend/src/components/canvas/Canvas.tsx).
- Node types:
  - `awsNode` -> [`AwsNode.tsx`](./frontend/src/components/canvas/nodes/AwsNode.tsx)
  - `vpcNode` -> [`VpcNode.tsx`](./frontend/src/components/canvas/nodes/VpcNode.tsx)
  - `subnetNode` -> [`SubnetNode.tsx`](./frontend/src/components/canvas/nodes/SubnetNode.tsx)
- Edge behavior:
  - Default animated edges are set directly in `Canvas`.
  - Connection validation enforced in `useEditorStore.onConnect` via [`validateConnection`](./frontend/src/types/connections.ts).
  - No custom edge component files currently exist.
- Drag/drop:
  - Left palette [`canvas/Sidebar.tsx`](./frontend/src/components/canvas/Sidebar.tsx) sets `dataTransfer` type `application/awstype`.
  - Canvas computes flow coordinates with `screenToFlowPosition` and adds node through store.
- Node configuration:
  - Double-click opens EC2-specific wizard (`EC2Modal`) for EC2 nodes.
  - Other nodes open a generic fallback modal rendering read-only properties.
- Terraform generation:
  - [`src/utils/terraform.ts`](./frontend/src/utils/terraform.ts) converts supported types (`vpc`, `subnet`, `sg`, `ec2`, `s3`) into `main.tf` plus provider/var/output files.
  - Resource linking is inferred by graph adjacency (e.g., subnet->vpc, ec2->subnet/sg).

## 10) STYLING ASSESSMENT
- Styling system is inconsistent:
  - Newer pages/components use Tailwind utility classes and reusable UI primitives.
  - Many legacy components still use large inline-style objects (`auth/*`, `landing/*`, `dashboard/*`, several `layout/*`, many `canvas/*` panels).
- Visual consistency risks:
  - Mixed brand names (`CloudForge` vs `InfraDesigner`) and mixed UI language.
  - Duplicate/legacy components likely unused but still in source increase drift.
- Tailwind config posture:
  - Tailwind v4 is loaded from CSS via `@import "tailwindcss"` and Vite plugin; no standalone `tailwind.config.*` exists.
- Potential layout/overflow risk areas:
  - Complex fixed-height/fixed-width inline layouts in editor/canvas side panels/modals may behave inconsistently on narrow viewports.
- Overall:
  - Product direction is SaaS-like and modern in some pages (Landing/Pricing/Dashboard), but codebase contains substantial legacy styling debt.

## 11) PROBLEMS FOUND
### A) TypeScript build errors (from `npm run build`)
1. `frontend/src/components/canvas/modals/ec2/EC2Modal.tsx:5` — `EC2_STEPS` imported but unused.
2. `frontend/src/components/canvas/modals/ec2/steps/Step2AMI.tsx:6` — `AMI_PLATFORM_FILTERS` unused.
3. `frontend/src/components/canvas/modals/ec2/steps/Step2AMI.tsx:6` — `AMI_ARCHITECTURE_FILTERS` unused.
4. `frontend/src/components/canvas/SecretsPanel.tsx:40` — `getType` unused.
5. `frontend/src/components/canvas/SecurityPanel.tsx:4` — `SecurityFinding` import unused.
6. `frontend/src/components/canvas/SimulationOverlay.tsx:2` — `useReactFlow` unused.
7. `frontend/src/components/canvas/SimulationOverlay.tsx:27` — `edges` unused.
8. `frontend/src/components/canvas/SimulationPanel.tsx:1` — `useRef` unused.
9. `frontend/src/components/canvas/SimulationPanel.tsx:165` — local `label` unused.
10. `frontend/src/components/canvas/VariablesPanel.tsx:36` — `getType` unused.
11. `frontend/src/components/layout/Sidebar.tsx:1` — `React` import unused.
12. `frontend/src/components/project/ProjectGit.tsx:11` — `project` prop unused.
13. `frontend/src/components/ui/CodeEditor.tsx:1` — `React` import unused.
14. `frontend/src/components/ui/ConfirmDialog.tsx:1` — `React` import unused.
15. `frontend/src/components/ui/EmptyState.tsx:1` — `React` import unused.
16. `frontend/src/components/ui/FileUpload.tsx:1` — `React` import unused.
17. `frontend/src/components/ui/ProgressBar.tsx:1` — `React` import unused.
18. `frontend/src/components/ui/SearchInput.tsx:1` — `React` import unused.
19. `frontend/src/components/ui/Skeleton.tsx:1` — `React` import unused.
20. `frontend/src/components/ui/TagsInput.tsx:1` — `React` import unused.
21. `frontend/src/components/ui/TagsInput.tsx:1` — `KeyboardEvent` must be type-only import under `verbatimModuleSyntax`.
22. `frontend/src/components/ui/Toggle.tsx:1` — `React` import unused.
23. `frontend/src/components/ui/Tooltip.tsx:45` — `cloneElement` typing mismatch (`aria-describedby` not assignable due `unknown` props).
24. `frontend/src/components/ui/Tooltip.tsx:48` — `children.props` is `unknown`.
25. `frontend/src/components/ui/Tooltip.tsx:52` — `children.props` is `unknown`.
26. `frontend/src/components/ui/Tooltip.tsx:56` — `children.props` is `unknown`.
27. `frontend/src/components/ui/Tooltip.tsx:60` — `children.props` is `unknown`.
28. `frontend/src/pages/Dashboard.tsx:71` — `setSearch` unused.

### B) Data/model bugs
1. `frontend/src/types/security.ts:56` — `SecurityScanResult` uses property name `bySerenity`; likely typo for `bySeverity`.
2. `frontend/src/security/rules.ts:74` — S3 encryption rule checks `node.data.encryption`, while canvas stores most settings under `node.data.properties`; may create false positives.

### C) Documentation/architecture drift
1. `frontend/src/pages/README.md:13` documents `/project/:projectId`, but router uses `/projects/:projectId` in `frontend/src/App.tsx:41`.
2. `frontend/CLEANUP.md:10-11,40-41,47` says `Login/Pricing` and routes were removed, but they currently exist in `frontend/src/pages` and `App.tsx`.
3. `frontend/README.md:1` remains default Vite template, not project-specific documentation.
4. Multiple READMEs/comments still reference `components/editor/...` paths while current directory is `components/canvas/...`.

### D) Legacy/empty artifacts
1. `frontend/components/editor/*.tsx`, `frontend/components/landing/*.tsx`, `frontend/components/ui/FeatureCard.tsx` are zero-byte files (duplicate stale tree).
2. Legacy inline-style components remain in `src/components/{auth,dashboard,landing,layout}` and appear largely superseded by newer Tailwind implementations.

### E) Placeholder/mock implementation risks
1. Auth, billing, git, run-execution, and project data paths are largely mocked (examples: `src/pages/Login.tsx`, `src/pages/Register.tsx`, `src/components/project/projectData.ts`, `src/stores/useGitStore.ts`).
2. Security rules file itself marks missing rules (`src/security/rules.ts:102-104`).

## 12) MISSING PIECES
1. `src/router.tsx` does not exist (routing is embedded in `App.tsx`).
2. No backend folder (`backend/`, `app/main.py`, routes/models/services/tests) exists in this repository.
3. No endpoint-specific frontend service modules exist (only generic `api.ts`).
4. `src/components/modals/` (top-level) does not exist; modal implementation is nested under `src/components/canvas/modals/` only.
5. `src/components/marketplace/` and `src/components/budget/` directories are missing (logic is in pages/ui instead).
6. No `.env` or `.env.example` checked in.
7. No `tailwind.config.*` / `postcss.config.*` files (valid for Tailwind v4 CSS-first, but absent relative to classic setup expectations).

## 13) DEPENDENCY CHECK
Method used:
- TypeScript module resolution via `npm run build` (`tsc -b` phase).
- Import scan of `src/**`.

Result:
- **No unresolved/broken import paths detected** by TypeScript (no `Cannot find module` diagnostics).
- Build still fails due unused imports/variables and strict typing errors (listed in Section 11A).

## 14) SUGGESTED PRIORITIES (TOP 10)
1. Fix all TypeScript build errors in Section 11A to restore green builds.
2. Fix `Tooltip` typing (`cloneElement`/`children.props` unknown) since it is a real type-safety/runtime-risk area.
3. Correct `SecurityScanResult.bySerenity` typo in `src/types/security.ts` and align consumers.
4. Fix security rule data access (`node.data.properties` vs `node.data`) to avoid incorrect findings.
5. Remove or archive zero-byte duplicate `frontend/components/*` tree to reduce confusion.
6. Decide canonical component set and remove/retire legacy inline-style components not used by routes.
7. Reconcile documentation drift (`CLEANUP.md`, page route docs, editor/canvas path references).
8. Replace root Vite template README with actual project onboarding and architecture docs.
9. Split API logic into domain services (auth/projects/editor/git/terraform/security) and replace mock workflows incrementally.
10. Add environment/config hygiene (`.env.example`, API URL docs, optional runtime validation for required env vars).
