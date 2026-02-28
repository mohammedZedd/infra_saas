import { useCallback, useEffect } from "react"
import CloudSelector from "../components/canvas/CloudSelector"
import Canvas from "../components/canvas/Canvas"
import EditorNavbar from "../components/canvas/EditorNavbar"
import EditorTabs from "../components/canvas/EditorTabs"
import Sidebar from "../components/canvas/Sidebar"
import Toolbar from "../components/canvas/Toolbar"
import { useAutoSave } from "../hooks/useAutoSave"
import { useKeyboard } from "../hooks/useKeyboard"
import useEditorStore from "../stores/useEditorStore"
import { type CloudProvider } from "../types/cloud"

function EditorCanvas() {
  const nodes = useEditorStore((s) => s.nodes)
  const edges = useEditorStore((s) => s.edges)
  const markSaved = useEditorStore((s) => s.markSaved)

  useKeyboard()

  const handleSave = useCallback(() => {
    try {
      localStorage.setItem("cloudforge:canvas", JSON.stringify({ nodes, edges, savedAt: new Date().toISOString() }))
      markSaved()
    } catch {
      // localStorage may be unavailable
    }
  }, [nodes, edges, markSaved])

  useAutoSave(handleSave, 30_000)

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-50">
      <EditorNavbar />
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
  const cloudProvider = useEditorStore((s) => s.cloudProvider)
  const setCloudProvider = useEditorStore((s) => s.setCloudProvider)

  // debug logging to capture state transitions when reproducing blank-screen issues
  useEffect(() => {
    console.log("Editor cloud provider changed:", cloudProvider)
  }, [cloudProvider])

  const handleSelectCloud = (provider: CloudProvider) => {
    console.log("user selected cloud provider", provider)
    setCloudProvider(provider)
  }

  if (!cloudProvider) {
    return <CloudSelector onSelect={handleSelectCloud} />
  }

  return <EditorCanvas />
}
