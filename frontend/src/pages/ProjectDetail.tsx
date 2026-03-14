import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import {
  Activity,
  AlertCircle,
  Braces,
  ChevronDown,
  ChevronLeft,
  Code2,
  Copy,
  Database,
  DollarSign,
  Download,
  Ellipsis,
  ExternalLink,
  FileText,
  Folder,
  FolderX,
  GitBranch,
  Github,
  History,
  LayoutDashboard,
  MapPin,
  MessageCircle,
  Pencil,
  Play,
  Search,
  Server,
  Settings,
  Shield,
  Trash2,
  TrendingUp,
  X,
} from "lucide-react"
import toast from "react-hot-toast"
import { Button } from "../components/ui/Button"
import { ConfirmDialog } from "../components/ui/ConfirmDialog"
import { Dropdown, DropdownContent, DropdownDivider, DropdownItem, DropdownTrigger } from "../components/ui/Dropdown"
import { EmptyState } from "../components/ui/EmptyState"
import { ProjectTabs } from "../components/ProjectTabs"
import ProjectOverview from "../components/project/ProjectOverview"
import { ProjectCodeEditor } from "../components/project/ProjectCodeEditor"
import { ProjectRunHistory } from "../components/project/ProjectRunHistory"
import { RunDetailsModal } from "../components/project/RunDetailsModal"
import ProjectSecurity from "../components/project/ProjectSecurity"
import ProjectSettings from "../components/project/ProjectSettings"
import ProjectState from "../components/project/ProjectState"
import ProjectVariables from "../components/project/ProjectVariables"
import { AWS_REGIONS } from "../constants/regions"
import useProjectStore from "../stores/useProjectStore"
import { getProject as getProjectRequest } from "../services/projects"
import type { Project } from "../types/project.types"
import { useProjectRuns } from "../hooks/useProjectRuns"

import { formatCurrency } from "../utils/format"
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
  const projects = useProjectStore((s) => s.projects)
  const fetchProjects = useProjectStore((s) => s.fetchProjects)
  const setProjects = useProjectStore((s) => s.setProjects)
  const deleteProject = useProjectStore((s) => s.deleteProject)
  const isLoading = useProjectStore((s) => s.isLoading)
  const [fallbackProject, setFallbackProject] = useState<Project | null>(null)

  const project = projects.find((p) => p.id === projectId) ?? fallbackProject
  const [activeTab, setActiveTab] = useState("overview")
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null)

  const [showModal, setShowModal] = useState(false)
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [showAuthError, setShowAuthError] = useState(false)
  const [selectedDiffFile, setSelectedDiffFile] = useState<string | null>(null)

  const {
    runs: fetchedRuns,
    isLoading: runsLoading,
    isTriggering,
    triggerPlan,
    triggerApply,
    triggerDestroy,
  } = useProjectRuns(projectId ?? "")

  useEffect(() => {
    void fetchProjects()
  }, [fetchProjects, projectId])

  useEffect(() => {
    let cancelled = false
    if (!projectId || project) return

    void (async () => {
      try {
        const fetched = await getProjectRequest(projectId)
        if (cancelled) return
        setFallbackProject(fetched)
        if (!projects.some((item) => item.id === fetched.id)) {
          setProjects([fetched, ...projects])
        }
      } catch {
        if (!cancelled) setFallbackProject(null)
      }
    })()

    return () => { cancelled = true }
  }, [projectId, project, projects, setProjects])

  const regionLabel = useMemo(() => {
    if (!project) return ""
    return AWS_REGIONS.find((region) => region.value === project.region)?.label ?? project.region
  }, [project])


  if (!project) {
    if (isLoading) {
      return (
        <div className="p-6 lg:p-8">
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
            Loading project...
          </div>
        </div>
      )
    }

    return (
      <div className="p-6 lg:p-8">
        <div className="flex min-h-[60vh] items-center justify-center">
          <EmptyState
            icon={FolderX}
            title="Project not found"
            description="The project you are trying to access does not exist."
            action={{ label: "Back to dashboard", onClick: () => navigate("/dashboard"), icon: ChevronLeft }}
          />
        </div>
      </div>
    )
  }

  const handleDeleteProject = async () => {
    setShowDeleteConfirm(false)
    await deleteProject(project.id)
    toast.success("Project deleted")
    navigate("/dashboard")
  }

  const handleDuplicateProject = () => toast("Duplicate flow pending backend endpoint", { icon: "ℹ️" })

  const tabs = [
    {
      key: "overview",
      label: "Overview",
      content: (
        <ProjectOverview
          projectId={project.id}
          onNavigateToEditor={() => navigate(`/projects/${project.id}/editor`)}
          onNavigateToRuns={() => setActiveTab("runs")}
          onTriggerPlan={triggerPlan}
          onTriggerApply={triggerApply}
          onTriggerDestroy={triggerDestroy}
          isTriggering={isTriggering}
          runs={fetchedRuns}
          onRefreshRuns={() => void fetchProjects()}
          architectureNodes={(project.architecture_data?.nodes ?? []) as any}
          architectureEdges={(project.architecture_data?.edges ?? []) as any}
        />
      ),
    },
    {
      key: "runs",
      label: "Runs",
      content: (
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {runsLoading ? "Loading runs…" : `${(fetchedRuns?.length ?? 0)} run${(fetchedRuns?.length ?? 0) !== 1 ? "s" : ""}`}
            </p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={isTriggering}
                onClick={() => void triggerPlan()}
              >
                Plan
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={isTriggering}
                onClick={() => void triggerApply()}
              >
                Apply
              </Button>
              <Button
                variant="danger"
                size="sm"
                disabled={isTriggering}
                onClick={() => void triggerDestroy()}
              >
                Destroy
              </Button>
            </div>
          </div>
          <ProjectRunHistory
            projectId={project.id}
            runs={fetchedRuns}
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
        <div className="mt-6">
          <ProjectVariables />
        </div>
      ),
    },
    {
      key: "git",
      label: "Git",
      content: (
        <div className="mt-6 space-y-8">

          {/* ── Modal: Create Git folder ── */}
          {showModal && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-xl relative">
                <button
                  onClick={() => setShowModal(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Git folder</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1">Git repository URL</label>
                    <input
                      type="text"
                      placeholder="https://example.com/organization/project.git"
                      className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1">Git provider &#x24D8;</label>
                    <select className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Select a Git provider</option>
                      <option value="github">GitHub</option>
                      <option value="github-enterprise">GitHub Enterprise Server</option>
                      <option value="bitbucket">Bitbucket Cloud</option>
                      <option value="bitbucket-server">Bitbucket Server</option>
                      <option value="gitlab">GitLab</option>
                      <option value="gitlab-enterprise">GitLab Enterprise Edition</option>
                      <option value="azure-devops">Azure DevOps</option>
                      <option value="aws-codecommit">AWS CodeCommit</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-semibold text-gray-900 mb-1">Git folder name</label>
                  <input
                    type="text"
                    className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <input type="checkbox" className="w-4 h-4 accent-blue-600" />
                  <span className="text-sm text-gray-700">Sparse checkout mode &#x24D8;</span>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setShowModal(false)}
                    className="border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {}}
                    className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700"
                  >
                    Create Git folder
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Section 1: Git Integration Header ── */}
          <section>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Git Integration</h2>
                <p className="text-sm text-gray-500 mt-1 max-w-2xl">
                  CloudForge Git folders allow you to clone a remote Git repo using added Git credentials. Set up your Git provider credentials.
                </p>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors shrink-0"
              >
                Add Git credential
              </button>
            </div>

            {/* Credential cards */}
            <div className="space-y-3">
              {/* Card 1 — Azure DevOps */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-50 p-1.5 rounded-lg shrink-0">
                    <GitBranch className="w-8 h-8 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm">
                      <span className="font-semibold text-gray-900">Azure DevOps Services credential</span>
                      <span className="text-gray-500 ml-1">(pioufkir@msp.amadeus.net)</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Azure DevOps (Personal access token)
                      <span className="bg-gray-100 text-gray-600 text-xs rounded px-2 py-0.5 ml-2">Azure DevOps default</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => {}} className="text-gray-400 hover:text-gray-600 p-1 text-lg leading-none">⋮</button>
                  <button onClick={() => {}} className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50">
                    Edit
                  </button>
                </div>
              </div>

              {/* Card 2 — GitHub */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 p-1.5 rounded-lg shrink-0">
                    <Github className="w-8 h-8 text-gray-900" />
                  </div>
                  <div>
                    <p className="text-sm">
                      <span className="font-semibold text-gray-900">GitHub 2025-10-28 1...</span>
                      <span className="text-gray-500 ml-1">(ikram.oufkir+amadeus@ama...)</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      GitHub (Linked)
                      <span className="bg-gray-100 text-gray-600 text-xs rounded px-2 py-0.5 ml-2">GitHub default</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => {}} className="text-gray-400 hover:text-gray-600 p-1 text-lg leading-none">⋮</button>
                  <button onClick={() => {}} className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-1">
                    Configure in GitHub
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* ── Section 2: Repository Contents ── */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 mt-8 mb-1">Repository Contents</h3>
            <p className="text-sm text-gray-500 mb-3">Files synced from the connected repository</p>

            {/* Filter bar */}
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search"
                  className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button onClick={() => {}} className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">Type ▾</button>
              <button onClick={() => {}} className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">Owner ▾</button>
              <button onClick={() => {}} className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">Last modified ▾</button>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              {/* Table header */}
              <div className="grid grid-cols-4 bg-gray-50 border-b border-gray-200 px-4 py-3">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Name ↕</span>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</span>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Owner</span>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Modified</span>
              </div>
              {/* Rows */}
              {([
                { icon: "folder",  name: "Curate_PRs_and_commits",     type: "Folder",     owner: "pioufkir", date: "Oct 02, 2025, 02:37" },
                { icon: "file",   name: "Calculate_parameters...",     type: "Notebook",   owner: "pioufkir", date: "Oct 02, 2025, 02:35" },
                { icon: "file",   name: "Calculate_parameters_annex",  type: "Notebook",   owner: "pioufkir", date: "Oct 02, 2025, 02:35" },
                { icon: "file",   name: "Feed Git Scanner Hive Table", type: "Notebook",   owner: "pioufkir", date: "Oct 02, 2025, 02:35" },
                { icon: "file",   name: "Feed Git Scanner Snowflake",  type: "Notebook",   owner: "pioufkir", date: "Oct 02, 2025, 02:35" },
                { icon: "file",   name: "Transfer GitScanner files",   type: "Notebook",   owner: "pioufkir", date: "Oct 02, 2025, 02:35" },
                { icon: "git",    name: "modules/",                    type: "Git folder", owner: "pioufkir", date: "Oct 01, 2025, 14:20" },
              ] as const).map((row) => (
                <div key={row.name} onClick={() => { setSelectedFile(row.name); setShowAuthError(false); setSelectedDiffFile(null) }} className="grid grid-cols-4 px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 text-sm cursor-pointer">
                  <div className="flex items-center gap-2">
                    {row.icon === "folder" && <Folder className="w-4 h-4 text-yellow-500 shrink-0" />}
                    {row.icon === "file"   && <FileText className="w-4 h-4 text-gray-400 shrink-0" />}
                    {row.icon === "git"    && <GitBranch className="w-4 h-4 text-blue-400 shrink-0" />}
                    <span className="text-blue-600 font-medium hover:underline cursor-pointer">{row.name}</span>
                  </div>
                  <span className="text-gray-600 self-center">{row.type}</span>
                  <span className="text-gray-600 self-center">{row.owner}</span>
                  <span className="text-gray-400 self-center">{row.date}</span>
                </div>
              ))}
            </div>
          </section>
          {/* ── File Click Modal (Git Changes Panel) ── */}
          {selectedFile !== null && (
            <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4 py-4" onClick={() => setSelectedFile(null)}>
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-[95vw] max-w-[1400px] h-[90vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
                  <div className="flex items-center flex-wrap gap-2">
                    <span className="text-lg font-semibold text-gray-900">{selectedFile}</span>
                    <a
                      href="#"
                      onClick={(e) => e.preventDefault()}
                      className="text-blue-600 text-sm flex items-center gap-1 ml-2 hover:underline"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Send feedback
                    </a>
                    <button
                      onClick={() => setShowAuthError((v) => !v)}
                      className="bg-yellow-50 border border-yellow-200 text-yellow-700 text-xs rounded-full px-2 py-0.5 cursor-pointer ml-1"
                    >
                      Simulate auth error
                    </button>
                  </div>
                  <button onClick={() => setSelectedFile(null)} className="text-gray-400 hover:text-gray-600 shrink-0">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {showAuthError ? (
                  /* CASE 1 — Auth Error */
                  <div className="flex-1 overflow-y-auto">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mx-6 mt-4">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                        <span className="font-semibold text-red-700 text-sm flex-1">Authentication error on Git status</span>
                        <button onClick={() => setShowAuthError(false)} className="text-red-400 hover:text-red-600">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-sm text-red-600 mt-2 leading-relaxed">
                        Cannot open Git folder (Repo) with Git provider{" "}
                        <strong>GitHub</strong>:{" "}
                        <strong>https://github.com/cloudforge/production-network.git</strong>
                      </p>
                      <p className="text-sm text-red-600 mt-1 leading-relaxed">
                        Linked Git provider credentials expired after 6 months of inactivity.
                      </p>
                      <div className="mt-3">
                        <p className="font-semibold text-red-700 text-sm">✅ How to fix</p>
                        <p className="text-sm text-red-600 mt-1">
                          Try relinking your GitHub git credential to try again. Alternatively, you can try creating a new GitHub App credential using a Personal Access Token (PAT) below.
                        </p>
                      </div>
                      <div className="mt-3 flex items-center gap-4 flex-wrap">
                        <span className="text-xs text-red-400 font-mono">Request ID: 84459db4-4eaa-488f...</span>
                        <button onClick={() => {}} className="text-blue-600 text-xs hover:underline">Show error details</button>
                        <button onClick={() => {}} className="text-blue-600 text-xs hover:underline flex items-center gap-1">
                          View / edit your Git credentials
                          <ExternalLink className="w-3 h-3" />
                        </button>
                        <button onClick={() => {}} className="text-blue-600 text-xs hover:underline flex items-center gap-1">
                          Configure git credentials docs
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 mt-5 mx-6">Git credential &#x24D8;</p>
                    <div className="mx-6 mt-2">
                      <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>GitHub credential (pioufkir_amadeus)</option>
                      </select>
                    </div>
                    <div className="mx-6 mt-3">
                      <button onClick={() => {}} className="border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        Reload Git status
                      </button>
                    </div>
                  </div>
                ) : (
                  /* CASE 2 — Normal Git changes panel */
                  <>
                    {/* Sub-header */}
                    <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 bg-gray-50 shrink-0">
                      <div className="flex items-center gap-3">
                        <button onClick={() => {}} className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-700 flex items-center gap-2">
                          <GitBranch className="w-4 h-4 text-gray-500" />
                          Branch: main
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        <button onClick={() => {}} className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50">
                          Create Branch
                        </button>
                        <button onClick={() => {}} className="text-blue-600 text-sm hover:underline flex items-center gap-1">
                          cc875d0
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => {}} className="text-gray-400 p-1 text-lg leading-none">⋮</button>
                        <button onClick={() => {}} className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm flex items-center gap-1">
                          <History className="w-4 h-4" />
                          History
                        </button>
                        <button onClick={() => {}} className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm flex items-center gap-1">
                          <Download className="w-4 h-4" />
                          Pull
                          <span className="bg-gray-200 rounded-full px-1.5 text-xs ml-1">10</span>
                        </button>
                      </div>
                    </div>

                    {/* Tab bar */}
                    <div className="flex border-b border-gray-200 px-6 shrink-0">
                      <button className="text-blue-600 border-b-2 border-blue-600 font-medium text-sm py-2.5 px-1 mr-4">Changes</button>
                      <button className="text-gray-500 hover:text-gray-700 text-sm py-2.5 px-1">Settings</button>
                    </div>

                    {/* Main split */}
                    <div className="flex-1 overflow-hidden flex">
                      {/* Left — file list + commit form */}
                      <div className="w-96 border-r border-gray-200 flex flex-col h-full">
                        <div className="flex-1 overflow-y-auto p-4">
                          <p className="text-xs font-semibold text-gray-400 tracking-wider mb-2">CHANGED (2)</p>
                          {(["main.tf", "variables.tf"] as const).map((f) => (
                            <div
                              key={f}
                              onClick={() => setSelectedDiffFile(f)}
                              className={cn(
                                "flex items-center gap-2 py-1.5 px-2 rounded hover:bg-gray-50 cursor-pointer text-sm",
                                selectedDiffFile === f && "bg-blue-50"
                              )}
                            >
                              <span className="bg-orange-100 text-orange-600 text-xs font-mono rounded px-1">M</span>
                              <span className="text-gray-700 flex-1">{f}</span>
                              <FileText className="w-3.5 h-3.5 text-gray-400" />
                            </div>
                          ))}
                        </div>
                        <div className="border-t border-gray-200 p-4 shrink-0">
                          <input
                            type="text"
                            placeholder="Commit message (required)"
                            className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                          />
                          <textarea
                            placeholder="Description (optional)"
                            rows={2}
                            className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full bg-gray-50 mt-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                          />
                          <button
                            disabled
                            className="w-full mt-3 bg-gray-200 text-gray-400 rounded-lg py-2 text-sm font-medium cursor-not-allowed"
                          >
                            Commit &amp; Push
                          </button>
                        </div>
                      </div>

                      {/* Right — diff view */}
                      <div className="flex-1 flex flex-col h-full overflow-auto bg-gray-50">
                        {selectedDiffFile === null ? (
                          <div className="flex flex-1 items-center justify-center h-full">
                            <p className="text-sm text-gray-400">Select a file to view changes</p>
                          </div>
                        ) : (
                          <div className="bg-white h-full w-full overflow-auto p-4 font-mono text-xs leading-relaxed">
                            <div className="text-red-500">--- a/main.tf</div>
                            <div className="text-green-500">+++ b/main.tf</div>
                            <div className="text-blue-400 mt-2">@@ -12,7 +12,7 @@</div>
                            <div className="text-gray-600 px-3 py-0.5">{"  resource \"aws_instance\" \"web\" {"}</div>
                            <div className="text-red-500 bg-red-50 px-3 py-0.5">{"-   instance_type = \"t2.micro\""}</div>
                            <div className="text-green-600 bg-green-50 px-3 py-0.5">{"+   instance_type = \"t3.medium\""}</div>
                            <div className="text-gray-600 px-3 py-0.5">{"    ami           = \"ami-0c55b159cbfafe1f0\""}</div>
                            <div className="text-gray-600 px-3 py-0.5">{"  }"}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "state",
      label: "State",
      content: (
        <div className="mt-6">
          <ProjectState />
        </div>
      ),
    },
    {
      key: "security",
      label: "Security",
      content: (
        <div className="mt-6">
          <ProjectSecurity />
        </div>
      ),
    },
    {
      key: "settings",
      label: "Settings",
      icon: Settings,
      content: (
        <div className="mt-6">
          <ProjectSettings />
        </div>
      ),
    },
  ]

  const TAB_DEFS = [
    { key: "overview",  label: "Overview",  icon: LayoutDashboard },
    { key: "runs",      label: "Runs",      icon: Play },
    { key: "code",      label: "Code",      icon: Code2 },
    { key: "variables", label: "Variables", icon: Braces },
    { key: "git",       label: "Git",       icon: GitBranch },
    { key: "state",     label: "State",     icon: Database },
    { key: "security",  label: "Security",  icon: Shield },
    { key: "settings",  label: "Settings",  icon: Settings },
  ] as const

  return (
    <div className="p-6 lg:p-8">
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
          <Dropdown>
            <DropdownTrigger>
              <button className="rounded-lg border border-gray-200 bg-white p-2 text-gray-500 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-700">
                <Ellipsis size={16} />
              </button>
            </DropdownTrigger>
            <DropdownContent>
              <DropdownItem label="Edit Project" icon={<Pencil size={14} />} onSelect={() => {}} />
              <DropdownItem label="Duplicate" icon={<Copy size={14} />} onSelect={handleDuplicateProject} />
              <DropdownDivider />
              <DropdownItem label="Delete" icon={<Trash2 size={14} />} variant="danger" onSelect={() => setShowDeleteConfirm(true)} />
            </DropdownContent>
          </Dropdown>
        </div>
      </div>

      <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">

        {/* Status */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-500">Status</p>
              <span
                className={cn(
                  "mt-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
                  STATUS_BADGE_CLASS[project.status] ?? STATUS_BADGE_CLASS.draft
                )}
              >
                {project.status}
              </span>
              <p className="text-xs text-gray-400 mt-1.5">Infrastructure state</p>
            </div>
          </div>
        </div>

        {/* Resources */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <Server className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Resources</p>
              <p className="mt-1 text-2xl font-bold text-gray-900 leading-none">{project.node_count}</p>
              <p className="text-xs text-gray-400 mt-1.5">8 services · 4 networking</p>
            </div>
          </div>
        </div>

        {/* Estimated Cost */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-500">Est. Cost</p>
              <p className="mt-1 text-2xl font-bold text-gray-900 leading-none">
                {formatCurrency(project.estimated_cost)}<span className="text-sm font-normal text-gray-500">/mo</span>
              </p>
              <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />+$49.50 vs last month
              </p>
            </div>
          </div>
        </div>

        {/* Region */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-purple-600" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-500">Region</p>
              <p className="mt-1 text-base font-bold text-gray-900 truncate">{regionLabel}</p>
              <p className="text-xs text-gray-400 mt-0.5 font-mono">{project.region}</p>
            </div>
          </div>
        </div>

      </section>

      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <ProjectTabs
          tabs={TAB_DEFS}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
        <div className="px-6 pb-6">
          {tabs.find((t) => t.key === activeTab)?.content}
        </div>
      </div>

      {/* Run Details Modal */}
      {selectedRunId && project.runs && project.runs.find((r) => r.id === selectedRunId) && (
        <RunDetailsModal
          run={project.runs.find((r) => r.id === selectedRunId)!}
          isOpen={!!selectedRunId}
          onClose={() => setSelectedRunId(null)}
        />
      )}

      <ConfirmDialog
        open={showDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteProject}
        title="Delete project"
        description={`Are you sure you want to delete ${project.name}? This action cannot be undone. All resources, variables, and deployment history will be permanently removed.`}
        confirmText="Delete Project"
        variant="danger"
      />
    </div>
  )
}
