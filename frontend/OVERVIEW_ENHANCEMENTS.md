# Project Overview Enhancements

## Overview

This document describes the new features added to the Project Overview page and adjacent areas, including architecture visualization and deployment controls. Terraform run history has been moved out of the overview into its own dedicated 'Runs' tab to keep the overview clean.

## Features Added

### 1. Architecture Visualization in Overview

**Component:** `ProjectArchitecturePreview`  
**Location:** Overview tab, above Terraform Run History

The Architecture Preview allows users to see a real-time visual representation of their infrastructure directly in the Overview page.

#### Features:
- **Synchronized Canvas**: Displays the same visual representation as the Designer
- **Read-only Mode**: Safe viewing without risk of accidental modifications
- **Interactive Nodes**: Click on nodes to see details (in full view)
- **Resource Count**: Shows the number of resources and connections
- **Open Editor Button**: Quick link to open the full Designer
- **Status Indicator**: Shows sync status with the editor

#### Visual Elements:
- Resource count in footer
- Connection/relationship count
- Sync status indicator
- "Full View" button for expanded canvas
- Node selection info panel (full view only)

#### Usage:
```tsx
<ProjectArchitecturePreview
  projectId={project.id}
  onOpenEditor={() => navigate(`/projects/${project.id}/editor`)}
/>
```

#### Empty State:
When no architecture has been designed yet, the component shows:
- Empty state icon
- "No architecture yet" message
- CTA button to open the editor

---

### 2. Terraform Run History

**Component:** `ProjectRunHistory`  
**Location:** Dedicated "Runs" tab (separate from Overview)

The Run History table provides a complete audit trail of all Terraform operations performed on the infrastructure.

#### Columns:
| Column | Description | Values |
|--------|-------------|--------|
| **ID** | Unique run identifier | 8-char shortened ID |
| **Command** | Terraform command type | plan, apply, destroy, init |
| **Status** | Operation outcome | success, failed, running, cancelled |
| **Summary** | Resource change summary | +X -X ~X format |
| **Triggered By** | User who initiated run | Email address |
| **Date** | When the run started | Date and time |
| **Actions** | Available actions | "View Details" link |

#### Status Indicators:
- **Success** (Green): Operation completed successfully
- **Failed** (Red): Operation encountered errors
- **Running** (Blue): Operation in progress
- **Cancelled** (Gray): Operation was cancelled

#### Command Types:
- **plan** (Purple): Terraform plan - previews changes
- **apply** (Green): Terraform apply - applies changes
- **destroy** (Red): Terraform destroy - destroys resources
- **init** (Blue): Terraform init - initializes backend

#### Features:
- Sortable columns by clicking headers (client‑side)
- Search/filter textbox to quickly locate runs by ID, user, or command
- Quick view of resource change summaries

The table is now isolated within its own tab so the overview remains focused solely on high‑level project information.
- "View Details" button for each run
- Empty state when no runs exist

---

### 3. Run Details Modal

**Component:** `RunDetailsModal`  
**Triggered by:** "View Details" button in run table

Detailed view of a specific Terraform run with execution logs and metadata.

#### Sections:

##### Overview Cards:
- **Status**: Current status of the run
- **Command**: Type of command (plan/apply/destroy)
- **Triggered By**: User email who initiated
- **Start Time**: When the run began

##### Plan Summary:
When applicable, shows:
- Resources to Add (+N)
- Resources to Change (~N)
- Resources to Destroy (-N)

##### Error Message:
Displays only if run failed with specific error message.

##### Execution Logs:
- Full Terraform output
- **Copy Button**: Copy logs to clipboard
- **Download Button**: Download logs as .log file
- Pre-formatted text (monospace)

#### Mock Data:
The modal includes sample Terraform logs showing:
- Configuration loading
- Syntax validation
- Plan output with resources
- Change summary
- Success/error statuses

---

### 4. Deployment Panel

**Component:** `DeploymentPanel`  
**Location:** Can be added to Overview or Editor (not currently integrated)

Control panel for triggering Terraform operations with safety confirmations.

#### Features:

##### Workflow Actions:
- **Plan**: Preview changes without applying
- **Apply**: Execute the infrastructure changes
- **Destroy**: Destroy all infrastructure (requires confirmation)

##### Status Display:
- Shows last run status with color coding
- Error message display (if last run failed)
- Loading indicator while operation in progress

##### Plan Summary Integration:
- Displays the latest plan summary
- Shows add/change/destroy counts
- Visual breakdown of changes

##### Safety Features:
- Destroy action requires double-click
- Toast confirmation message on first click
- Clear warning message
- Disabled state during operations

#### Usage:
```tsx
const runs = useProjectRuns(projectId)

<DeploymentPanel
  projectId={projectId}
  lastRun={runs.runs[0]}
  isLoading={runs.isLoading}
  isTriggering={runs.isTriggering}
  onTriggerPlan={runs.triggerPlan}
  onTriggerApply={runs.triggerApply}
  onTriggerDestroy={runs.triggerDestroy}
/>
```

---

## Data Types

### TerraformRun

```typescript
interface TerraformRun {
  id: string                              // Unique run ID
  projectId: string                       // Associated project
  command: "plan" | "apply" | "destroy" | "init"  // Command type
  status: "success" | "failed" | "running" | "cancelled"  // Outcome
  triggeredBy: string                     // User email
  triggeredAt: string                     // ISO datetime
  completedAt?: string                    // ISO datetime (if complete)
  planSummary?: {
    add: number                           // Resources to add
    change: number                        // Resources to change
    destroy: number                       // Resources to destroy
  }
  errorMessage?: string                   // Error if failed
  logUrl?: string                         // Link to provider console
}
```

### TerriformPlanSummary

```typescript
interface TerriformPlanSummary {
  add: number      // Resources to add
  change: number   // Resources to modify
  destroy: number  // Resources to remove
}
```

---

## API Integration

The following API endpoints support the new features:

### Run Management

```typescript
// List all runs for a project
GET /api/projects/{projectId}/runs
Response: TerraformRun[]

// Get specific run details
GET /api/projects/{projectId}/runs/{runId}
Response: TerraformRun

// Get run logs
GET /api/projects/{projectId}/runs/{runId}/logs
Response: string (logs content)

// Trigger plan
POST /api/projects/{projectId}/runs/plan
Body: { options?: {...} }
Response: TerraformRun

// Trigger apply
POST /api/projects/{projectId}/runs/apply
Body: { options?: {...} }
Response: TerraformRun

// Trigger destroy
POST /api/projects/{projectId}/runs/destroy
Body: { options?: {...} }
Response: TerraformRun

// Cancel run
POST /api/projects/{projectId}/runs/{runId}/cancel
Response: TerraformRun

// Retry run
POST /api/projects/{projectId}/runs/{runId}/retry
Response: TerraformRun
```

---

## Hooks

### useProjectRuns

Custom hook for managing Terraform runs and operations.

```typescript
const runs = useProjectRuns(projectId)

// State
runs.runs              // TerraformRun[]
runs.isLoading         // boolean
runs.isTriggering      // boolean
runs.selectedRun       // TerraformRun | null
runs.runLogs           // string | null
runs.error             // string | null

// Methods
runs.fetchRuns()       // Fetch all runs
runs.selectRun(run)    // Select a run
runs.clearSelection()  // Clear selection
runs.fetchRunLogs(id)  // Fetch logs for run
runs.triggerPlan()     // Trigger Terraform plan
runs.triggerApply()    // Trigger Terraform apply
runs.triggerDestroy()  // Trigger Terraform destroy
runs.cancelRun(id)     // Cancel a running run
runs.retryRun(id)      // Retry a failed run
```

#### Features:
- Automatic run fetching on mount
- Error handling with toast notifications
- Async state management
- Loading and triggering states

---

## Usage Examples

### Example 1: Display Run History in Overview

```tsx
import { ProjectRunHistory } from '../components/project/ProjectRunHistory'

export function ProjectOverview({ project }) {
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null)

  if (!project.runs || project.runs.length === 0) {
    return <div>No runs yet</div>
  }

  return (
    <ProjectRunHistory
      projectId={project.id}
      runs={project.runs}
      onViewDetails={(runId) => setSelectedRunId(runId)}
    />
  )
}
```

### Example 2: Using Deployment Panel with Hook

```tsx
import { useProjectRuns } from '../hooks/useProjectRuns'
import { DeploymentPanel } from '../components/project/DeploymentPanel'

export function ProjectEditor({ projectId }) {
  const runs = useProjectRuns(projectId)

  return (
    <div className="grid grid-cols-4 gap-6">
      <aside>
        <DeploymentPanel
          projectId={projectId}
          lastRun={runs.runs[0]}
          isLoading={runs.isLoading}
          isTriggering={runs.isTriggering}
          onTriggerPlan={runs.triggerPlan}
          onTriggerApply={runs.triggerApply}
          onTriggerDestroy={runs.triggerDestroy}
        />
      </aside>
      {/* Main editor content */}
    </div>
  )
}
```

### Example 3: Architecture Preview with Link to Editor

The overview version of the canvas is a **read‑only, full‑view snapshot**. It uses the same
node shapes and colors as the designer so the diagram stays visually consistent, but the
background switches to white and all editing helpers are removed so it reads like a
presentation.

Key behaviours:

- always calls `fitView` to scale the entire graph into the available space
- zooming, panning, dragging, selecting and connecting are disabled
- the grid/background lines and any control widgets (mini‑map, zoom buttons) are
  hidden when `readOnly` is true
- optional hover tooltip shows a resource label/type, but nothing is clickable
- metrics bar below the canvas displays resource/connection counts and sync status
- a prominent “Open Editor” button sits directly under the diagram (and is also available in the general
  call‑to‑action card further down the page) so users can easily switch into edit mode

```tsx
import { ProjectArchitecturePreview } from '../components/project/ProjectArchitecturePreview'

export function ProjectOverview({ project }) {
  const navigate = useNavigate()

  return (
    <ProjectArchitecturePreview
      projectId={project.id}
      onOpenEditor={() => navigate(`/projects/${project.id}/editor`)}
      readOnly={true}
      compact={false}
    />
  )
}
```

### Example 4: Adding a Dedicated Runs/History Tab

The `ProjectDetail` page now separates run history into its own tab. The `tabs` array
includes the following entry (placed before the code editor tab):

```tsx
{
  key: "runs",
  label: "Runs",
  content: (
    <div className="mt-6">
      <ProjectRunHistory
        projectId={project.id}
        runs={project.runs || []}
        onViewDetails={(runId) => setSelectedRunId(runId)}
      />
    </div>
  ),
},
```

The `ProjectRunHistory` component renders a sortable, searchable table and falls back to an
empty state when no runs exist. This tab keeps the overview clean and focused on high‑level
architecture and metrics.

---

## Styling & Theming

All components use Tailwind CSS and support:
- Dark/light theme (via VS Code theme)
- Responsive design
- Accessibility features
- Consistent color scheme:
  - Success: Green (#22c55e)
  - Error: Red (#ef4444)
  - Warning: Yellow (#eab308)
  - Info: Blue (#3b82f6)
  - Primary: Indigo (#6366f1)

---

## Frontend Features Checklist

- ✅ Architecture Preview Component (overview tab)
- ✅ Separate "Runs" tab with sortable/searchable historical table
- ✅ Separate "Runs" tab with sortable/searchable historical table
- ✅ Run History Table Component
- ✅ Run Details Modal
- ✅ Deployment Panel
- ✅ useProjectRuns Hook
- ✅ API Integration Layer
- ✅ Type Definitions (TerraformRun)
- ✅ Mock Data (projectRunHistory)
- ✅ Empty States
- ✅ Error Handling
- ✅ Loading States
- ✅ Responsive Design
- ✅ Accessibility

---

## Backend Requirements

The following backend features are needed to fully support these components:

### 1. Database Schema for Runs
- Store Terraform run history with all metadata
- Track status changes over time
- Store plan summaries and outputs
- Log retention (30+ days recommended)

### 2. API Endpoints
- [x] `GET /api/projects/{projectId}/runs` - List runs
- [x] `GET /api/projects/{projectId}/runs/{runId}` - Get run details
- [x] `GET /api/projects/{projectId}/runs/{runId}/logs` - Get logs
- [x] `POST /api/projects/{projectId}/runs/plan` - Trigger plan
- [x] `POST /api/projects/{projectId}/runs/apply` - Trigger apply
- [x] `POST /api/projects/{projectId}/runs/destroy` - Trigger destroy
- [x] `POST /api/projects/{projectId}/runs/{runId}/cancel` - Cancel run
- [x] `POST /api/projects/{projectId}/runs/{runId}/retry` - Retry run

### 3. Terraform Integration
- Execute Terraform commands (plan, apply, destroy)
- Capture and store output/logs
- Track status transitions
- Handle errors gracefully

### 4. State Management
- Update project status on deployment
- Update architecture state from Terraform state
- Keep run history in sync

---

## Performance Considerations

### Frontend
- **List Pagination**: For projects with 100+ runs, implement pagination
- **Virtual Scrolling**: For large tables, consider virtualizing rows
- **Lazy Loading**: Load run logs on demand, not by default
- **Caching**: Cache recent runs in memory

### Backend
- **Query Optimization**: Index on projectId, status, triggeredAt
- **Log Truncation**: Store only recent logs (last 1MB)
- **Async Execution**: Run Terraform operations asynchronously
- **Webhook Updates**: Notify frontend of run status changes in real-time

---

## Future Enhancements

### Phase 2
- [ ] Run filtering by status/command/date
- [ ] Run search functionality
- [ ] Cost projection based on plan summary
- [ ] GitHub/GitLab integration for automated deployments
- [ ] Slack/email notifications on run completion
- [ ] Approval workflow for apply operations

### Phase 3
- [ ] Real-time WebSocket updates for run status
- [ ] Detailed resource-level change view
- [ ] Drift detection (manual vs. actual state)
- [ ] Rollback to previous run capability
- [ ] Run comparison (compare two runs side-by-side)

---

## Troubleshooting

### Issue: "No runs yet" message appears but runs exist

**Solution**: Check that:
1. Project has `runs` property populated from backend
2. `runs` is an array and not null/undefined
3. Run status matches one of: success, failed, running, cancelled

### Issue: Run Details Modal shows mock data

**Solution**: 
1. This is intentional in the frontend implementation
2. Backend needs to implement log storage and retrieval
3. Replace mock logs with actual Terraform command output

### Issue: Destroy button requires two clicks

**Solution**: This is intentional for safety. First click:
1. Shows confirmation toast
2. Sets internal state to require confirmation
3. Second click executes the destroy

---

## Files Summary

| Component | Path | Purpose |
|-----------|------|---------|
| ProjectRunHistory | src/components/project/ProjectRunHistory.tsx | Run history table display |
| ProjectArchitecturePreview | src/components/project/ProjectArchitecturePreview.tsx | Interactive architecture canvas |
| RunDetailsModal | src/components/project/RunDetailsModal.tsx | Detailed run information modal |
| DeploymentPanel | src/components/project/DeploymentPanel.tsx | Deployment action controls |
| useProjectRuns | src/hooks/useProjectRuns.ts | Run state management hook |
| TerraformRun type | src/types/project.types.ts | TypeScript type definition |
| API functions | src/services/api.ts | Backend API integration (7 new endpoints) |
| Mock data | src/data/mockProjects.ts | Sample run history data |

---

## Integration Notes

### Current Status
- Frontend: ✅ Complete and integrated into ProjectDetail.tsx
- Backend: ⏳ Pending implementation
- Styling: ✅ Fully styled with Tailwind CSS
- Types: ✅ Fully typed with TypeScript

### Next Steps for Backend Team
1. Review this documentation
2. Implement the 7 API endpoints
3. Set up Terraform command execution
4. Create database schema for runs
5. Test with provided curl examples

---
