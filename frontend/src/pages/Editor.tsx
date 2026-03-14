import { useCallback, useEffect, useMemo, useState } from "react"
import { useParams } from "react-router-dom"
import toast from "react-hot-toast"
import CloudSelector from "../components/canvas/CloudSelector"
import Canvas from "../components/canvas/Canvas"
import EditorNavbar from "../components/canvas/EditorNavbar"
import EditorTabs from "../components/canvas/EditorTabs"
import Sidebar from "../components/canvas/Sidebar"
import Toolbar from "../components/canvas/Toolbar"
import { useAutoSave } from "../hooks/useAutoSave"
import { useKeyboard } from "../hooks/useKeyboard"
import { getProject as getProjectRequest } from "../services/projects"
import useEditorStore from "../stores/useEditorStore"
import useProjectStore from "../stores/useProjectStore"
import { type CloudProvider } from "../types/cloud"

function EditorCanvas() {
  const { projectId } = useParams<{ projectId: string }>()
  const nodes = useEditorStore((s) => s.nodes)
  const edges = useEditorStore((s) => s.edges)
  const cloudProvider = useEditorStore((s) => s.cloudProvider)
  const markSaved = useEditorStore((s) => s.markSaved)
  const updateProject = useProjectStore((s) => s.updateProject)
  const [isSaving, setIsSaving] = useState(false)

  useKeyboard()

  const architecturePayload = useMemo(
    () => ({
      nodes,
      edges,
      viewport: { x: 0, y: 0, zoom: 1 },
      ...(cloudProvider ? { cloudProvider } : {}),
    }),
    [nodes, edges, cloudProvider]
  )

  const persistArchitecture = useCallback(
    async (silent = false) => {
      if (!projectId) return
      setIsSaving(true)
      try {
        await updateProject(projectId, { architecture_data: architecturePayload })
        markSaved()
        if (!silent) toast.success("Architecture saved")
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to save architecture"
        if (!silent) toast.error(message)
      } finally {
        setIsSaving(false)
      }
    },
    [projectId, architecturePayload, updateProject, markSaved]
  )

  const handleSave = useCallback(() => {
    void persistArchitecture(false)
  }, [persistArchitecture])

  useAutoSave(
    () => {
      void persistArchitecture(true)
    }
  , 30_000)

  // Debounced save: 3s after any change
  const isDirty = useEditorStore((s) => s.isDirty)
  useEffect(() => {
    if (!isDirty) return
    const timer = setTimeout(() => {
      void persistArchitecture(true)
    }, 3_000)
    return () => clearTimeout(timer)
  }, [isDirty, persistArchitecture])

  const canSave = Boolean(projectId) && !isSaving

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-50">
      <EditorNavbar onSave={canSave ? handleSave : undefined} isSaving={isSaving} />
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <Sidebar />
        <div className="relative min-w-0 flex-1">
          <Canvas />
          <Toolbar />
        </div>
        <div className="hidden w-80 flex-col overflow-hidden border-l border-gray-200 bg-white lg:flex">
          <EditorTabs />
        </div>
      </div>
    </div>
  )
}

// Page responsible for rendering the canvas or the pre‑editor provider selector

export default function Editor() {
  const { projectId } = useParams<{ projectId: string }>()
  const cloudProvider = useEditorStore((s) => s.cloudProvider)
  const setCloudProvider = useEditorStore((s) => s.setCloudProvider)
  const getProjectById = useProjectStore((state) => state.getProjectById)
  const setCurrentProject = useProjectStore((state) => state.setCurrentProject)
  const updateProjectList = useProjectStore((state) => state.setProjects)
  const projects = useProjectStore((state) => state.projects)
  const markSaved = useEditorStore((state) => state.markSaved)
  const [isHydrating, setIsHydrating] = useState(false)

  useEffect(() => {
    if (!projectId) {
      setCurrentProject(null)
      return
    }

    const project = getProjectById(projectId)
    setCurrentProject(project ?? null)
  }, [projectId, getProjectById, setCurrentProject])

  // debug logging to capture state transitions when reproducing blank-screen issues
  useEffect(() => {
    console.log("Editor cloud provider changed:", cloudProvider)
  }, [cloudProvider])

  useEffect(() => {
    if (!projectId) return

    let cancelled = false
    setIsHydrating(true)

    void (async () => {
      try {
        const inStore = getProjectById(projectId)
        const project = inStore ?? (await getProjectRequest(projectId))
        if (cancelled) return

        if (!inStore && !projects.some((item) => item.id === project.id)) {
          updateProjectList([project, ...projects])
        }

        const architecture = project.architecture_data
        const restoredNodes = Array.isArray(architecture?.nodes) ? architecture.nodes : []
        const restoredEdges = Array.isArray(architecture?.edges) ? architecture.edges : []

        if (!cloudProvider && architecture?.cloudProvider) {
          setCloudProvider(architecture.cloudProvider as CloudProvider)
        }

        useEditorStore.setState({
          nodes: restoredNodes as any,
          edges: restoredEdges as any,
          selectedNodeId: null,
          selectedEdgeId: null,
          history: [{ nodes: restoredNodes as any, edges: restoredEdges as any }],
          historyIndex: 0,
        })
        markSaved()
      } catch {
        if (!cancelled) {
          useEditorStore.setState({
            nodes: [],
            edges: [],
            selectedNodeId: null,
            selectedEdgeId: null,
            history: [{ nodes: [], edges: [] }],
            historyIndex: 0,
            isDirty: false,
          })
        }
      } finally {
        if (!cancelled) {
          setIsHydrating(false)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [projectId, cloudProvider, setCloudProvider, markSaved, getProjectById, projects, updateProjectList])

  const handleSelectCloud = (provider: CloudProvider) => {
    console.log("user selected cloud provider", provider)
    setCloudProvider(provider)
  }

  if (!cloudProvider) {
    return <CloudSelector onSelect={handleSelectCloud} />
  }

  if (isHydrating) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 text-sm text-gray-600">
        Loading project architecture...
      </div>
    )
  }

  return <EditorCanvas />
}
