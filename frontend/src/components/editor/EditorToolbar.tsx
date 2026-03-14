import React from "react"
import {
  Undo2,
  Redo2,
  Minus,
  Plus,
  Maximize2,
  Grid3X3,
  Save,
  Loader2,
} from "lucide-react"
import { cn } from "../../utils/cn"

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface EditorToolbarProps {
  /** Undo the last action */
  onUndo: () => void
  /** Redo the previously undone action */
  onRedo: () => void
  /** Zoom in on the canvas */
  onZoomIn: () => void
  /** Zoom out on the canvas */
  onZoomOut: () => void
  /** Fit the diagram to the visible viewport */
  onFitToScreen: () => void
  /** Toggle the background grid on/off */
  onToggleGrid: () => void
  /** Whether the background grid is currently visible */
  isGridEnabled: boolean
  /** Whether the undo stack has entries */
  canUndo: boolean
  /** Whether the redo stack has entries */
  canRedo: boolean
  /** Current zoom level expressed as an integer percentage (e.g. 100) */
  zoomPercent: number
  /** Save the current diagram */
  onSave: () => void
  /** When true the Save button shows a spinner and is disabled */
  isSaving?: boolean
}

// ---------------------------------------------------------------------------
// Shared sub-components
// ---------------------------------------------------------------------------

interface ToolbarButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** aria-label and title (tooltip) */
  label: string
  /** Visual emphasis variant */
  variant?: "default" | "active"
  children: React.ReactNode
}

function ToolbarButton({
  label,
  variant = "default",
  children,
  disabled,
  className,
  ...rest
}: ToolbarButtonProps): React.ReactElement {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      className={cn(
        "inline-flex h-8 items-center justify-center rounded-md border px-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
        variant === "active"
          ? "border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100"
          : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900",
        (disabled ?? false) && "cursor-not-allowed opacity-50",
        className
      )}
      {...rest}
    >
      {children}
    </button>
  )
}

/** Vertical rule separating toolbar groups */
function Divider(): React.ReactElement {
  return <div className="h-5 w-px bg-gray-200" aria-hidden />
}

// ---------------------------------------------------------------------------
// EditorToolbar
// ---------------------------------------------------------------------------

export function EditorToolbar({
  onUndo,
  onRedo,
  onZoomIn,
  onZoomOut,
  onFitToScreen,
  onToggleGrid,
  isGridEnabled,
  canUndo,
  canRedo,
  zoomPercent,
  onSave,
  isSaving = false,
}: EditorToolbarProps): React.ReactElement {
  return (
    <div className="sticky top-0 z-20 flex h-12 w-full items-center gap-2 border-b border-gray-200 bg-white px-4 shadow-sm">
      {/* ── Left group: History ── */}
      <div className="flex items-center gap-1">
        <ToolbarButton label="Undo" onClick={onUndo} disabled={!canUndo}>
          <Undo2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Redo" onClick={onRedo} disabled={!canRedo}>
          <Redo2 className="h-4 w-4" />
        </ToolbarButton>
      </div>

      <Divider />

      {/* ── Middle group: Zoom ── */}
      <div className="flex items-center gap-1">
        <ToolbarButton label="Zoom out" onClick={onZoomOut}>
          <Minus className="h-4 w-4" />
        </ToolbarButton>

        {/* Zoom percentage pill */}
        <span className="inline-flex h-8 min-w-[3.5rem] items-center justify-center rounded-md border border-gray-200 bg-white px-2 font-mono text-xs tabular-nums text-gray-700 select-none">
          {zoomPercent}%
        </span>

        <ToolbarButton label="Zoom in" onClick={onZoomIn}>
          <Plus className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton label="Fit to screen" onClick={onFitToScreen}>
          <Maximize2 className="h-4 w-4" />
        </ToolbarButton>
      </div>

      <Divider />

      {/* ── Right group: Grid + Save ── */}
      <div className="ml-auto flex items-center gap-2">
        <ToolbarButton
          label={isGridEnabled ? "Hide grid" : "Show grid"}
          variant={isGridEnabled ? "active" : "default"}
          onClick={onToggleGrid}
        >
          <Grid3X3 className="h-4 w-4" />
        </ToolbarButton>

        {/* Save — primary style */}
        <button
          type="button"
          aria-label={isSaving ? "Saving…" : "Save"}
          title="Save"
          onClick={onSave}
          disabled={isSaving}
          className={cn(
            "inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
            isSaving
              ? "cursor-not-allowed bg-blue-400 text-white"
              : "bg-blue-600 text-white hover:bg-blue-700"
          )}
        >
          {isSaving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
          ) : (
            <Save className="h-3.5 w-3.5" aria-hidden />
          )}
          {isSaving ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  )
}

export default EditorToolbar
