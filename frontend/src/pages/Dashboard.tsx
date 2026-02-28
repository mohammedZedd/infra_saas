import { useNavigate } from "react-router-dom"
import type { ElementType } from "react"
import { DollarSign, FolderPlus, LayoutGrid, Plus, Server } from "lucide-react"
import { AppLayout } from "../components/layout/AppLayout"
import { EmptyState } from "../components/ui/EmptyState"
import { Button } from "../components/ui/Button"
import useProjectStore from "../stores/useProjectStore"
import useUIStore from "../stores/useUIStore"
import { formatCurrency, formatRelativeTime, truncate } from "../utils/format"
import { getMockProjectStats } from "../data/mockProjects"
import { cn } from "../utils/cn"
import type { Project } from "../types/project.types"

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

function ProjectCard({ project, onClick }: { project: Project; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-white p-6 text-left shadow-sm transition-all duration-200 hover:border-gray-300 hover:shadow-md"
    >
      <h3 className="truncate text-base font-semibold text-gray-900">{project.name}</h3>
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

export default function Dashboard() {
  const navigate = useNavigate()
  const openModal = useUIStore((state) => state.openModal)
  const projects = useProjectStore((state) => state.projects)

  const stats = getMockProjectStats(projects)

  return (
    <AppLayout>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Projects</h1>
        <Button leftIcon={Plus} onClick={() => openModal("create-project")}>New Project</Button>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <StatCard icon={LayoutGrid} label="Total Projects" value={String(stats.total_projects)} />
        <StatCard icon={Server} label="Total Resources" value={String(stats.total_resources)} />
        <StatCard icon={DollarSign} label="Est. Monthly Cost" value={formatCurrency(stats.total_estimated_cost)} />
      </div>

      {projects.length === 0 ? (
        <EmptyState
          icon={FolderPlus}
          title="No projects yet"
          description="Create your first project to start building AWS infrastructure visually."
          action={{ label: "Create Project", onClick: () => openModal("create-project"), icon: Plus }}
        />
      ) : (
        <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} onClick={() => navigate(`/projects/${project.id}`)} />
          ))}
        </section>
      )}
    </AppLayout>
  )
}
