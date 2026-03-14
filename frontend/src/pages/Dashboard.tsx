import { useEffect, useMemo, useState } from "react"
import type { ElementType } from "react"
import { useNavigate } from "react-router-dom"
import { DollarSign, FolderPlus, LayoutGrid, Pencil, Plus, Search, Server, SlidersHorizontal, Trash2, X } from "lucide-react"
import { EmptyState } from "../components/ui/EmptyState"
import { Button } from "../components/ui/Button"
import { ConfirmDialog } from "../components/ui/ConfirmDialog"
import EditProjectModal from "../components/modals/EditProjectModal"
import { formatCurrency, formatRelativeTime, truncate } from "../utils/format"
import { cn } from "../utils/cn"
import useProjectStore from "../stores/useProjectStore"
import useUIStore from "../stores/useUIStore"
import type { Project } from "../types/project.types"

// ─── Filter types ─────────────────────────────────────────────────────────────

type Environment = "Development" | "Staging" | "Production"
type RegionFilter = "All" | string
type EnvFilter = "All" | Environment

const ENVIRONMENTS: Environment[] = ["Development", "Staging", "Production"]

const STATUS_BADGE_CLASS: Record<string, string> = {
  deployed: "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20",
  active: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20",
  deploying: "bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-600/20",
  draft: "bg-gray-100 text-gray-700",
  failed: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20",
}

function StatCard({ icon: Icon, label, value }: { icon: ElementType; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
        <Icon size={18} />
      </div>
      <p className="mt-4 text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
    </div>
  )
}

function ProjectCard({ project, onClick, onEdit, onDelete }: { project: Project; onClick: () => void; onEdit: () => void; onDelete: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-white p-6 text-left shadow-sm transition-all duration-200 hover:border-blue-400 hover:shadow-md hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="truncate text-base font-semibold text-gray-900">{project.name}</h3>
        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit() }}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-500 transition-colors"
            aria-label="Edit project"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete() }}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
            aria-label="Delete project"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <p className="mt-1 line-clamp-2 text-sm text-gray-500">{truncate(project.description, 120)}</p>

      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4 text-sm text-gray-500">
        <span>{project.node_count} resources</span>
        <span>{formatCurrency(project.estimated_cost)}/mo</span>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
            STATUS_BADGE_CLASS[project.status] ?? STATUS_BADGE_CLASS.draft
          )}
        >
          {project.status}
        </span>
        <p className="text-xs text-gray-400">Updated {formatRelativeTime(project.updated_at)}</p>
      </div>
    </button>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const navigate = useNavigate()

  // Store selectors — each is a stable primitive/reference, no side-effects
  const projects        = useProjectStore((state) => state.projects)
  const fetchProjects   = useProjectStore((state) => state.fetchProjects)
  const deleteProjectFn = useProjectStore((state) => state.deleteProject)
  const isLoading       = useProjectStore((state) => state.isLoading)
  const error           = useProjectStore((state) => state.error)
  const openModal       = useUIStore((state) => state.openModal)

  // Fetch (seed) once on mount — never inside render or selector
  useEffect(() => {
    void fetchProjects()
  }, [fetchProjects])

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [isDeleteOpen,      setIsDeleteOpen]       = useState(false)
  const [editProjectId,     setEditProjectId]      = useState<string | null>(null)
  const [isEditOpen,        setIsEditOpen]         = useState(false)

  // ─── Search + Filter state (local only — never touches the store) ───────────
  const [searchQuery,      setSearchQuery]      = useState("")
  const [regionFilter,     setRegionFilter]     = useState<RegionFilter>("All")
  const [environmentFilter, setEnvironmentFilter] = useState<EnvFilter>("All")

  // Sorted unique regions derived from the current project list
  const availableRegions = useMemo(
    () => [...new Set(projects.map((p) => p.region))].sort(),
    [projects]
  )

  // Pure filter — no store mutations, no side-effects
  const filteredProjects = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return projects.filter((p) => {
      if (q && !p.name.toLowerCase().includes(q) && !(p.description ?? "").toLowerCase().includes(q)) return false
      if (regionFilter !== "All" && p.region !== regionFilter) return false
      if (environmentFilter !== "All" && p.environment !== environmentFilter) return false
      return true
    })
  }, [projects, searchQuery, regionFilter, environmentFilter])

  const hasActiveFilters = searchQuery !== "" || regionFilter !== "All" || environmentFilter !== "All"

  const handleClearFilters = () => {
    setSearchQuery("")
    setRegionFilter("All")
    setEnvironmentFilter("All")
  }

  const stats = useMemo(() => ({
    total_projects: projects.length,
    total_resources: projects.reduce((sum, project) => sum + (project.node_count ?? 0), 0),
    total_estimated_cost: projects.reduce((sum, project) => sum + (project.estimated_cost ?? 0), 0),
  }), [projects])

  const handleDeleteClick = (id: string) => {
    setSelectedProjectId(id)
    setIsDeleteOpen(true)
  }

  const handleEditClick = (id: string) => {
    setEditProjectId(id)
    setIsEditOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (selectedProjectId) await deleteProjectFn(selectedProjectId)
    setIsDeleteOpen(false)
    setSelectedProjectId(null)
  }

  const handleCancelDelete = () => {
    setIsDeleteOpen(false)
    setSelectedProjectId(null)
  }

  const selectedProject = projects.find((p) => p.id === selectedProjectId)

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Projects</h1>
        <Button leftIcon={Plus} onClick={() => openModal("create-project")}>New Project</Button>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <StatCard icon={LayoutGrid} label="Total Projects" value={String(stats.total_projects)} />
        <StatCard icon={Server} label="Total Resources" value={String(stats.total_resources)} />
        <StatCard icon={DollarSign} label="Est. Monthly Cost" value={formatCurrency(stats.total_estimated_cost)} />
      </div>

      {/* ─── Search + Filter bar ──────────────────────────────────────────── */}
      {projects.length > 0 && (
        <div className="mb-6 space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Search input */}
            <div className="relative flex-1">
              <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects…"
                className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Clear search"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Region filter */}
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={15} className="shrink-0 text-gray-400" />
              <select
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value as RegionFilter)}
                className="rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All regions</option>
                {availableRegions.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>

              {/* Environment filter */}
              <select
                value={environmentFilter}
                onChange={(e) => setEnvironmentFilter(e.target.value as EnvFilter)}
                className="rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All environments</option>
                {ENVIRONMENTS.map((env) => (
                  <option key={env} value={env}>{env}</option>
                ))}
              </select>

              {/* Clear all */}
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <X size={13} />
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Results count */}
          <p className="text-xs text-gray-500">
            {filteredProjects.length === projects.length
              ? `${projects.length} project${projects.length !== 1 ? "s" : ""}`
              : `${filteredProjects.length} of ${projects.length} project${projects.length !== 1 ? "s" : ""}`}
          </p>
        </div>
      )}

      {isLoading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
          Loading projects...
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FolderPlus}
          title="No projects yet"
          description="Create your first project to start building AWS infrastructure visually."
          action={{ label: "Create Project", onClick: () => openModal("create-project"), icon: Plus }}
        />
      ) : filteredProjects.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No matching projects"
          description="No projects match your current search or filters."
          action={{ label: "Clear filters", onClick: handleClearFilters }}
        />
      ) : (
        <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => navigate(`/projects/${project.id}`)}
              onEdit={() => handleEditClick(project.id)}
              onDelete={() => handleDeleteClick(project.id)}
            />
          ))}
        </section>
      )}

      {!isLoading && error && (
        <p className="mt-4 text-sm text-red-600">{error}</p>
      )}

      <ConfirmDialog
        open={isDeleteOpen}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete project"
        description={`Are you sure you want to delete "${selectedProject?.name ?? "this project"}"? This action cannot be undone.`}
        confirmText="Delete Project"
        variant="danger"
      />

      <EditProjectModal
        open={isEditOpen}
        projectId={editProjectId}
        onClose={() => { setIsEditOpen(false); setEditProjectId(null) }}
      />
    </div>
  )
}
