# components/canvas

The visual infrastructure canvas editor — the core of CloudForge.

## Files

| File | Description |
|------|-------------|
| `Canvas.tsx` | Main React Flow canvas: drag-drop, node placement, EC2 modal wiring |
| `CloudSelector.tsx` | Cloud-provider selection screen shown before the canvas |
| `ConnectionError.tsx` | Toast/banner shown when an invalid node connection is attempted |
| `EditorNavbar.tsx` | Top navigation bar inside the editor (save, deploy, share) |
| `EditorTabs.tsx` | Tab bar switching between Canvas, Code, Variables, State, etc. |
| `ExecutionPanel.tsx` | Terraform plan/apply/destroy execution log panel |
| `OutputsPanel.tsx` | Terraform outputs manager |
| `PropertiesPanel.tsx` | Right-side panel showing selected node properties |
| `SecretsPanel.tsx` | Sensitive variable / secret management panel |
| `SecurityPanel.tsx` | Security scanning results panel with findings and recommendations |
| `SettingsPanel.tsx` | Project-level Terraform settings (version, backend, providers) |
| `Sidebar.tsx` | Left-side AWS component palette for dragging nodes onto the canvas |
| `SimulationOverlay.tsx` | SVG packet-animation overlay rendered on top of the canvas |
| `SimulationPanel.tsx` | Network simulation controls and latency percentile display |
| `Toolbar.tsx` | Canvas toolbar (zoom, fit, clear, export) |
| `VariablesPanel.tsx` | Terraform input variables manager |
| `WorkspaceSelector.tsx` | Dropdown for switching between Terraform workspaces |

## Sub-directories

| Directory | Description |
|-----------|-------------|
| `modals/` | Configuration modals opened from the canvas |
| `nodes/` | Custom React Flow node components (AWS, VPC, Subnet) |

