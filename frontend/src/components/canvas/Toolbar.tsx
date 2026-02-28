import useEditorStore from "../../stores/useEditorStore"

export default function Toolbar() {
  const nodes = useEditorStore((s) => s.nodes)
  const edges = useEditorStore((s) => s.edges)

  const handleExport = () => {
    const data = { nodes, edges }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "project.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleClear = () => {
    if (window.confirm("Clear all components?")) {
      useEditorStore.setState({ nodes: [], edges: [], selectedNodeId: null })
    }
  }

  return (
    <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
      <button
        onClick={handleExport}
        className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
      >
        Export JSON
      </button>
      <div className="h-6 w-px bg-gray-200" />
      <button
        onClick={handleClear}
        className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
      >
        Clear
      </button>
    </div>
  )
}
