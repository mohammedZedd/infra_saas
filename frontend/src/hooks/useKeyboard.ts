import { useEffect } from "react"
import useEditorStore from "../stores/useEditorStore"

/** Returns true if the currently focused element is a text input. */
function isTypingTarget(): boolean {
  const el = document.activeElement
  if (!el) return false
  const tag = el.tagName.toLowerCase()
  if (tag === "input" || tag === "textarea") return true
  if ((el as HTMLElement).isContentEditable) return true
  return false
}

/**
 * Registers global keyboard shortcuts for the canvas editor.
 * Must be called inside a component that is mounted while the canvas is visible.
 *
 * Shortcuts:
 *   Ctrl/Cmd + Z          → undo
 *   Ctrl/Cmd + Shift + Z  → redo
 *   Ctrl/Cmd + Y          → redo
 *   Delete / Backspace    → delete selected node or edge (not in text inputs)
 *   Ctrl/Cmd + S          → prevent browser save, mark saved
 *   Ctrl/Cmd + A          → select all nodes (not in text inputs)
 *   Escape                → deselect
 */
export function useKeyboard(): void {
  const undo = useEditorStore((s) => s.undo)
  const redo = useEditorStore((s) => s.redo)
  const markSaved = useEditorStore((s) => s.markSaved)
  const selectedNodeId = useEditorStore((s) => s.selectedNodeId)
  const selectedEdgeId = useEditorStore((s) => s.selectedEdgeId)
  const deleteNode = useEditorStore((s) => s.deleteNode)
  const deleteEdge = useEditorStore((s) => s.deleteEdge)
  const selectNode = useEditorStore((s) => s.selectNode)
  const selectEdge = useEditorStore((s) => s.selectEdge)
  const nodes = useEditorStore((s) => s.nodes)
  const onNodesChange = useEditorStore((s) => s.onNodesChange)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent): void {
      const meta = e.metaKey || e.ctrlKey

      // Ctrl/Cmd + S — prevent browser save dialog, mark saved
      if (meta && e.key === "s") {
        e.preventDefault()
        markSaved()
        return
      }

      // Ctrl/Cmd + Z — undo
      if (meta && !e.shiftKey && e.key === "z") {
        e.preventDefault()
        undo()
        return
      }

      // Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y — redo
      if ((meta && e.shiftKey && e.key === "z") || (meta && e.key === "y")) {
        e.preventDefault()
        redo()
        return
      }

      // Ctrl/Cmd + A — select all nodes
      if (meta && e.key === "a" && !isTypingTarget()) {
        e.preventDefault()
        onNodesChange(
          nodes.map((n) => ({ type: "select" as const, id: n.id, selected: true }))
        )
        return
      }

      // Escape — deselect everything
      if (e.key === "Escape") {
        selectNode(null)
        selectEdge(null)
        return
      }

      // Delete / Backspace — delete selected node or edge
      if ((e.key === "Delete" || e.key === "Backspace") && !isTypingTarget()) {
        e.preventDefault()
        if (selectedNodeId) {
          deleteNode(selectedNodeId)
        } else if (selectedEdgeId) {
          deleteEdge(selectedEdgeId)
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [
    undo,
    redo,
    markSaved,
    selectedNodeId,
    selectedEdgeId,
    deleteNode,
    deleteEdge,
    selectNode,
    selectEdge,
    nodes,
    onNodesChange,
  ])
}

export default useKeyboard

