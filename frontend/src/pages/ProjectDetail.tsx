import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import {
  ChevronLeft,
  Code2,
  Copy,
  Ellipsis,
  ExternalLink,
  FolderX,
  Pencil,
  Plus,
  Settings,
  Trash2,
} from "lucide-react"
import toast from "react-hot-toast"
import { AppLayout } from "../components/layout/AppLayout"
import { Button } from "../components/ui/Button"
import { Card } from "../components/ui/Card"
import { ConfirmDialog } from "../components/ui/ConfirmDialog"
import { Dropdown } from "../components/ui/Dropdown"
import { EmptyState } from "../components/ui/EmptyState"
import { Tabs } from "../components/ui/Tabs"
import { Input } from "../components/ui/Input"
import { Select } from "../components/ui/Select"
import { ProjectCodeEditor } from "../components/project/ProjectCodeEditor"
import { ProjectRunHistory } from "../components/project/ProjectRunHistory"
import { ProjectArchitecturePreview } from "../components/project/ProjectArchitecturePreview"
import { RunDetailsModal } from "../components/project/RunDetailsModal"
import useProjectStore from "../stores/useProjectStore"
import useUIStore from "../stores/useUIStore"
import { AWS_REGIONS } from "../constants/regions"
import { formatCurrency, formatDate, formatRelativeTime } from "../utils/format"
import { cn } from "../utils/cn"

const STATUS_BADGE_CLASS: Record<string, string> = {
  deployed: "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20",
  active: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20",
  deploying: "bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-600/20",
  draft: "bg-gray-100 text-gray-700",
  failed: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20",
}

export default function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()

  const getProjectById = useProjectStore((state) => state.getProjectById)
  const updateProject = useProjectStore((state) => state.updateProject)
  const deleteProject = useProjectStore((state) => state.deleteProject)
  const addProject = useProjectStore((state) => state.addProject)
  const openModal = useUIStore((state) => state.openModal)

  const project = projectId ? getProjectById(projectId) : undefined
  const [activeTab, setActiveTab] = useState("overview")
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null)

  const [settingsName, setSettingsName] = useState(project?.name ?? "")
  const [settingsDescription, setSettingsDescription] = useState(project?.description ?? "")
  const [settingsRegion, setSettingsRegion] = useState(project?.region ?? "us-east-1")

  useEffect(() => {
    if (!project) return
    setSettingsName(project.name)
    setSettingsDescription(project.description)
    setSettingsRegion(project.region)
  }, [project])

  const regionLabel = useMemo(() => {
    if (!project) return ""
    return AWS_REGIONS.find((region) => region.value === project.region)?.label ?? project.region
  }, [project])

  if (!project) {
    return (
      <AppLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <EmptyState
            icon={FolderX}
            title="Project not found"
            description="The project you are trying to access does not exist."
            action={{ label: "Back to dashboard", onClick: () => navigate("/dashboard"), icon: ChevronLeft }}
          />
        </div>
      </AppLayout>
    )
  }

  const handleDeleteProject = () => {
    deleteProject(project.id)
    setShowDeleteConfirm(false)
    toast.success("Project deleted")
    navigate("/dashboard")
  }

  const handleDuplicateProject = () => {
    const now = new Date().toISOString()
    const newId = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Date.now().toString()
    addProject({
      ...project,
      id: newId,
      name: `${project.name}-copy`,
      status: "draft",
      node_count: 0,
      estimated_cost: 0,
      created_at: now,
      updated_at: now,
      last_deployed_at: null,
    })
    toast.success("Project duplicated")
    navigate(`/projects/${newId}`)
  }

  const handleSaveSettings = () => {
    updateProject(project.id, {
      name: settingsName,
      description: settingsDescription,
      region: settingsRegion,
      updated_at: new Date().toISOString(),
    })
    toast.success("Project updated")
  }

  const tabs = [
    {
      key: "overview",
      label: "Overview",
      content: (
        <div className="mt-6 space-y-6">
          <Card>
            <h3 className="text-base font-semibold text-gray-900">Description</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">{project.description}</p>
            <dl className="mt-5 grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
              <div>
                <dt className="text-gray-500">Created</dt>
                <dd className="mt-1 font-medium text-gray-900">{formatDate(project.created_at)}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Last Updated</dt>
                <dd className="mt-1 font-medium text-gray-900">{formatRelativeTime(project.updated_at)}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Last Deployed</dt>
                <dd className="mt-1 font-medium text-gray-900">
                  {project.last_deployed_at ? formatDate(project.last_deployed_at) : "Never"}
                </dd>
              </div>
            </dl>
          </Card>

          {/* Architecture Preview Section */}
          <div>
            <h3 className="mb-4 text-base font-semibold text-gray-900">Infrastructure Architecture</h3>
            <ProjectArchitecturePreview
              projectId={project.id}
              onOpenEditor={() => navigate(`/projects/${project.id}/editor`)}
              readOnly={true}
              compact={false}
            />
            {/* quick access editor button directly under the preview */}
            <div className="mt-3">
              <Button
                size="sm"
                variant="primary"
                onClick={() => navigate(`/projects/${project.id}/editor`)}
              >
                Open Editor
                <ExternalLink size={14} className="ml-1" />
              </Button>
            </div>
          </div>


          <Card className="border-indigo-100 bg-indigo-50">
            <h3 className="text-base font-semibold text-indigo-900">Continue building in the editor</h3>
            <p className="mt-1 text-sm text-indigo-700">Open the canvas editor to design, connect, and deploy your infrastructure.</p>
            <Button className="mt-4" rightIcon={ExternalLink} onClick={() => navigate(`/projects/${project.id}/editor`)}>
              Open Editor
            </Button>
          </Card>
        </div>
      ),
    },
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
    {
      key: "code",
      label: "Code",
      content: (
        <div className="mt-6 h-[620px]">
          <ProjectCodeEditor
            project={project}
            onEditInDesigner={() => navigate(`/projects/${project.id}/editor`)}
          />
        </div>
      ),
    },
    {
      key: "variables",
      label: "Variables",
      content: (
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">Environment Variables</h3>
            <Button variant="outline" size="sm" leftIcon={Plus}>Add Variable</Button>
          </div>
          <Card>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Key</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Value</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Sensitive</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                  </tr>
                </thead>
              </table>
            </div>
            <div className="p-6">
              <EmptyState
                icon={Code2}
                title="No variables defined yet"
                description="Add variables to parameterize your infrastructure configuration."
              />
            </div>
          </Card>
        </div>
      ),
    },
    {
      key: "settings",
      label: "Settings",
      icon: Settings,
      content: (
        <div className="mt-6 space-y-6">
          <Card>
            <h3 className="text-base font-semibold text-gray-900">Project Settings</h3>
            <div className="mt-4 space-y-4">
              <Input label="Name" value={settingsName} onChange={(event) => setSettingsName(event.target.value)} />
              <div>
                <label htmlFor="settings-description" className="mb-1.5 block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="settings-description"
                  rows={4}
                  value={settingsDescription}
                  onChange={(event) => setSettingsDescription(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <Select
                label="Region"
                options={AWS_REGIONS}
                value={settingsRegion}
                onChange={(event) => setSettingsRegion(event.target.value)}
              />
              <div className="pt-2">
                <Button onClick={handleSaveSettings}>Save Changes</Button>
              </div>
            </div>
          </Card>

          <Card className="border-red-200">
            <h3 className="text-base font-semibold text-red-700">Danger Zone</h3>
            <p className="mt-2 text-sm text-gray-600">Deleting a project permanently removes infrastructure settings, code, and history.</p>
            <Button className="mt-4" variant="danger" leftIcon={Trash2} onClick={() => setShowDeleteConfirm(true)}>
              Delete Project
            </Button>
          </Card>
        </div>
      ),
    },
  ]

  return (
    <AppLayout>
      <div className="mb-8 flex items-center justify-between">
        <div className="min-w-0">
          <Link to="/dashboard" className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-700">
            <ChevronLeft size={16} />
            Back to Dashboard
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="truncate text-2xl font-bold text-gray-900">{project.name}</h1>
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
                STATUS_BADGE_CLASS[project.status] ?? STATUS_BADGE_CLASS.draft
              )}
            >
              {project.status}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={() => navigate(`/projects/${project.id}/editor`)}>Open Editor</Button>
          <Dropdown
            trigger={
              <button className="rounded-lg border border-gray-200 bg-white p-2 text-gray-500 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-700">
                <Ellipsis size={16} />
              </button>
            }
            items={[
              { key: "edit", label: "Edit Project", icon: Pencil, onClick: () => openModal("edit-project", { projectId: project.id }) },
              { key: "duplicate", label: "Duplicate", icon: Copy, onClick: handleDuplicateProject },
              { key: "divider", label: "divider", divider: true },
              { key: "delete", label: "Delete", icon: Trash2, danger: true, onClick: () => setShowDeleteConfirm(true) },
            ]}
          />
        </div>
      </div>

      <section className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card>
          <p className="text-sm font-medium text-gray-500">Status</p>
          <span
            className={cn(
              "mt-3 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
              STATUS_BADGE_CLASS[project.status] ?? STATUS_BADGE_CLASS.draft
            )}
          >
            {project.status}
          </span>
        </Card>
        <Card>
          <p className="text-sm font-medium text-gray-500">Resources</p>
          <p className="mt-3 text-2xl font-bold text-gray-900">{project.node_count}</p>
        </Card>
        <Card>
          <p className="text-sm font-medium text-gray-500">Estimated Cost</p>
          <p className="mt-3 text-2xl font-bold text-gray-900">{formatCurrency(project.estimated_cost)}/mo</p>
        </Card>
        <Card>
          <p className="text-sm font-medium text-gray-500">Region</p>
          <p className="mt-3 text-sm font-semibold text-gray-900">{regionLabel}</p>
          <p className="text-xs text-gray-500">{project.region}</p>
        </Card>
      </section>

      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Run Details Modal */}
      {selectedRunId && project.runs && (
        <RunDetailsModal
          run={project.runs.find((r) => r.id === selectedRunId)!}
          isOpen={!!selectedRunId}
          onClose={() => setSelectedRunId(null)}
        />
      )}

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteProject}
        title="Delete project"
        message={`Are you sure you want to delete ${project.name}? This action cannot be undone. All resources, variables, and deployment history will be permanently removed.`}
        confirmLabel="Delete Project"
        variant="danger"
      />
    </AppLayout>
  )
}
