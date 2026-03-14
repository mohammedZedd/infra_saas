import { useCallback, useMemo, useState } from "react"
import { ChevronRight, File, FileText, Folder, FolderOpen } from "lucide-react"
import { cn } from "../../utils/cn"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FileNode {
  id: string
  name: string
  type: "folder" | "file"
  children?: FileNode[]
  path?: string
  icon?: React.ReactNode
}

export interface FileExplorerProps {
  tree: FileNode[]
  selectedId: string | null
  onSelect: (node: FileNode) => void
  defaultExpandedIds?: string[]
  className?: string
  /** When true, only file nodes trigger onSelect (folders only toggle expand). */
  showFilesOnlySelect?: boolean
  ariaLabel?: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Collect all folder ids from the tree for use as default expanded set. */
function allFolderIds(nodes: FileNode[]): string[] {
  const ids: string[] = []
  const walk = (ns: FileNode[]) => {
    for (const n of ns) {
      if (n.type === "folder") {
        ids.push(n.id)
        if (n.children) walk(n.children)
      }
    }
  }
  walk(nodes)
  return ids
}

// ---------------------------------------------------------------------------
// TreeRow — renders a single node row (no internal state)
// ---------------------------------------------------------------------------

interface TreeRowProps {
  node: FileNode
  depth: number
  isSelected: boolean
  isExpanded: boolean
  showFilesOnlySelect: boolean
  onSelect: (node: FileNode) => void
  onToggle: (id: string) => void
}

function TreeRow({
  node,
  depth,
  isSelected,
  isExpanded,
  showFilesOnlySelect,
  onSelect,
  onToggle,
}: TreeRowProps) {
  const isFolder = node.type === "folder"

  const handleClick = useCallback(() => {
    if (isFolder) {
      onToggle(node.id)
      if (!showFilesOnlySelect) onSelect(node)
    } else {
      onSelect(node)
    }
  }, [isFolder, node, onToggle, onSelect, showFilesOnlySelect])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault()
        handleClick()
      }
    },
    [handleClick],
  )

  // Default icon: folder open/closed or file
  const defaultIcon = isFolder ? (
    isExpanded ? (
      <FolderOpen size={15} className="shrink-0 text-yellow-400" aria-hidden="true" />
    ) : (
      <Folder size={15} className="shrink-0 text-yellow-500/80" aria-hidden="true" />
    )
  ) : (
    <FileText size={14} className="shrink-0 text-gray-400" aria-hidden="true" />
  )

  return (
    <div
      role="treeitem"
      aria-selected={isSelected}
      aria-expanded={isFolder ? isExpanded : undefined}
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      style={{ paddingLeft: `${depth * 12 + 8}px` }}
      className={cn(
        "flex cursor-pointer select-none items-center gap-2 py-1.5 pr-3 text-sm outline-none",
        "border-l-2 transition-colors",
        isSelected
          ? "border-blue-600 bg-blue-50 text-blue-700"
          : "border-transparent text-gray-700 hover:bg-gray-50",
        "focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-blue-300",
      )}
    >
      {/* Chevron — only folders */}
      <span className="flex w-3.5 shrink-0 items-center justify-center">
        {isFolder && (
          <ChevronRight
            size={13}
            className={cn(
              "text-gray-400 transition-transform duration-150",
              isExpanded && "rotate-90",
            )}
            aria-hidden="true"
          />
        )}
      </span>

      {/* Icon */}
      {node.icon ?? defaultIcon}

      {/* Name */}
      <span className="truncate">{node.name}</span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Recursive tree renderer
// ---------------------------------------------------------------------------

interface RenderTreeProps {
  nodes: FileNode[]
  depth: number
  expanded: Set<string>
  selectedId: string | null
  showFilesOnlySelect: boolean
  onSelect: (node: FileNode) => void
  onToggle: (id: string) => void
}

function RenderTree({
  nodes,
  depth,
  expanded,
  selectedId,
  showFilesOnlySelect,
  onSelect,
  onToggle,
}: RenderTreeProps) {
  return (
    <>
      {nodes.map((node) => (
        <div key={node.id} role="group">
          <TreeRow
            node={node}
            depth={depth}
            isSelected={node.id === selectedId}
            isExpanded={expanded.has(node.id)}
            showFilesOnlySelect={showFilesOnlySelect}
            onSelect={onSelect}
            onToggle={onToggle}
          />
          {node.type === "folder" &&
            expanded.has(node.id) &&
            node.children &&
            node.children.length > 0 && (
              <RenderTree
                nodes={node.children}
                depth={depth + 1}
                expanded={expanded}
                selectedId={selectedId}
                showFilesOnlySelect={showFilesOnlySelect}
                onSelect={onSelect}
                onToggle={onToggle}
              />
            )}
        </div>
      ))}
    </>
  )
}

// ---------------------------------------------------------------------------
// FileExplorer (root)
// ---------------------------------------------------------------------------

export default function FileExplorer({
  tree,
  selectedId,
  onSelect,
  defaultExpandedIds,
  className,
  showFilesOnlySelect = true,
  ariaLabel = "File explorer",
}: FileExplorerProps) {
  const initialExpanded = useMemo<Set<string>>(
    () => new Set(defaultExpandedIds ?? allFolderIds(tree)),
    // Only run on mount — intentionally omit `tree` and `defaultExpandedIds`
    // from the dep array so navigating files doesn't collapse the tree.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  const [expanded, setExpanded] = useState<Set<string>>(initialExpanded)

  const handleToggle = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-gray-200 bg-white",
        className,
      )}
    >
      {/* Header */}
      <div className="border-b border-gray-100 px-3 py-2">
        <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
          <File size={12} aria-hidden="true" />
          Files
        </span>
      </div>

      {/* Tree */}
      <div
        role="tree"
        aria-label={ariaLabel}
        className="py-1"
      >
        {tree.length === 0 ? (
          <p className="px-4 py-6 text-center text-xs text-gray-400">
            No files yet
          </p>
        ) : (
          <RenderTree
            nodes={tree}
            depth={0}
            expanded={expanded}
            selectedId={selectedId}
            showFilesOnlySelect={showFilesOnlySelect}
            onSelect={onSelect}
            onToggle={handleToggle}
          />
        )}
      </div>
    </div>
  )
}
