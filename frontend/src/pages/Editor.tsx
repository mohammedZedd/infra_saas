import useEditorStore from "../stores/useEditorStore"
import { type CloudProvider } from "../types/cloud"
import CloudSelector from "../components/editor/CloudSelector"
import EditorNavbar from "../components/editor/EditorNavbar"
import Sidebar from "../components/editor/Sidebar"
import Canvas from "../components/editor/Canvas"
import EditorTabs from "../components/editor/EditorTabs"
import Toolbar from "../components/editor/Toolbar"

export default function Editor() {
  const cloudProvider = useEditorStore((s) => s.cloudProvider)
  const setCloudProvider = useEditorStore((s) => s.setCloudProvider)

  const handleSelectCloud = (provider: CloudProvider) => {
    setCloudProvider(provider)
  }

  if (!cloudProvider) {
    return <CloudSelector onSelect={handleSelectCloud} />
  }

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <EditorNavbar />

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Left sidebar - 260px */}
        <Sidebar />

        {/* Canvas center */}
        <div style={{ flex: 1, position: "relative" }}>
          <Canvas />
          <Toolbar />
        </div>

        {/* Right panel - 320px */}
        <div
          style={{
            width: "320px",
            backgroundColor: "white",
            borderLeft: "1px solid #E5E7EB",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <EditorTabs />
        </div>
      </div>
    </div>
  )
}