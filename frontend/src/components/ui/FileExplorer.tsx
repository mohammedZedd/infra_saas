import {
  Fragment,
  useCallback,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import {
  AlignLeft,
  Box,
  Braces,
  ChevronRight,
  Code2,
  File,
  FileText,
  Folder,
  FolderOpen,
  Image,
  Lock,
  Terminal,
} from "lucide-react"
import { cn } from "../../utils/cn"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FileNode {
  name: string
  path: string
  type: "file" | "folder"
  children?: FileNode[]
  language?: string
  /** Optional badge rendered at the right side of the row (e.g. unsaved dot) */
  badge?: React.ReactNode
  /** Override the auto-detected file icon with any React node */
  icon?: React.ReactNode
}

export interface FileExplorerProps {
  files: FileNode[]
  onSelectFile: (path: string, language?: string) => void
  selectedPath?: string
  /** Controlled set of expanded folder paths */
  expandedPaths?: Set<string>
  onExpandedChange?: (paths: Set<string>) => void
  /**
   * Initial expanded folder paths for uncontrolled mode.
   * Default: all top-level folders are expanded.
   */
  defaultExpandedPaths?: Set<string>
  /** Called when a node receives a right-click */
  onContextMenu?: (node: FileNode, e: React.MouseEvent) => void
  /** "dark" (default) = gray-800 background; "light" = white */
  variant?: "dark" | "light"
  /** Top header label. Default: "Explorer" */
  headerTitle?: string
  /** Whether to render the header bar. Default: true */
  showHeader?: boolean
  className?: string
}

// ---------------------------------------------------------------------------
// File-type icon map
// ---------------------------------------------------------------------------

type IconComp = React.ElementType

const EXT_ICON_MAP: Record<string, IconComp> = {
  // Terraform / HCL
  tf: Box,
  hcl: Box,
  tfvars: Box,
  // TypeScript / JavaScript
  ts: Code2,
  tsx: Code2,
  js: Braces,
  jsx: Braces,
  mjs: Braces,
  cjs: Braces,
  // Data / config
  json: Braces,
  yaml: AlignLeft,
  yml: AlignLeft,
  toml: AlignLeft,
  ini: AlignLeft,
  // Docs
  md: FileText,
  mdx: FileText,
  txt: FileText,
  // Shell
  sh: Terminal,
  bash: Terminal,
  zsh: Terminal,
  // Secrets / config
  env: Lock,
  gitignore: Lock,
  // Images
  png: Image,
  jpg: Image,
  jpeg: Image,
  svg: Image,
  webp: Image,
}

function resolveFileIcon(name: string): IconComp {
  const parts = name.split(".")
  // Handle dotfiles like .gitignore → ext = "gitignore"
  const ext = parts.length > 1 ? parts[parts.length - 1].toLowerCase() : ""
  return EXT_ICON_MAP[ext] ?? File
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build the default expanded set: all top-level folders. */
function topLevelFolders(files: FileNode[]): Set<string> {
  const set = new Set<string>()
  for (const node of files) {
    if (node.type === "folder") set.add(node.path)
  }
  return set
}

/**
 * Flatten all *visible* nodes into a stable ordered list so keyboard
 * navigation can move between them without recursion at event time.
 */
function flattenVisible(nodes: FileNode[], expanded: Set<string>): FileNode[] {
  const result: FileNode[] = []
  const walk = (ns: FileNode[]) => {
    for (const n of ns) {
      result.push(n)
      if (n.type === "folder" && expanded.has(n.path) && n.children) {
        walk(n.children)
      }
    }
  }
  walk(nodes)
  return result
}

// ---------------------------------------------------------------------------
// FileTreeNode (presentational — no internal state)
// ---------------------------------------------------------------------------

interface FileTreeNodeProps {
  node: FileNode
  level: number
  isSelected: boolean
  isExpanded: boolean
  isFocused: boolean
  variant: "dark" | "light"
  onSelect: (node: FileNode) => void
  onToggle: (path: string) => void
  onFocus: (path: string) => void
  onContextMenu?: (node: FileNode, e: React.MouseEvent) => void
}

function FileTreeNode({
  node,
  level,
  isSelected,
  isExpanded,
  isFocused,
  variant,
  onSelect,
  onToggle,
  onFocus,
  onContextMenu,
}: FileTreeNodeProps) {
  const dark = variant === "dark"
  const basePad = level * 14 + 6

  const sharedClass = cn(
    "group flex w-full cursor-pointer select-none items-center gap-1.5 py-1 text-xs outline-none transition-colors",
    isFocused && "ring-1 ring-inset",
    dark
      ? ["hover:bg-white/5", isFocused && "ring-white/25"]
      : ["hover:bg-gray-100", isFocused && "ring-blue-300"],
  )

  const handleClick = useCallback(() => {
    onFocus(node.path)
    if (node.type === "folder") {
      onToggle(node.path)
    } else {
      onSelect(node)
    }
  }, [node, onToggle, onSelect, onFocus])

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      onFocus(node.path)
      onContextMenu?.(node, e)
    },
    [node, onFocus, onContextMenu],
  )

  if (node.type === "folder") {
    return (
      <div
        role="treeitem"
        aria-expanded={isExpanded}
        aria-selected={false}
        tabIndex={isFocused ? 0 : -1}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        className={cn(
          sharedClass,
          "font-medium",
          dark ? "text-gray-300" : "text-gray-700",
        )}
        style={{ paddingLeft: basePad }}
      >
        <ChevronRight
          size={12}
          className={cn(
            "shrink-0 transition-transform duration-150",
            isExpanded && "rotate-90",
            dark ? "text-gray-500" : "text-gray-400",
          )}
          aria-hidden="true"
        />
        {isExpanded ? (
          <FolderOpen size={13} className="shrink-0 text-yellow-400" aria-hidden="true" />
        ) : (
          <Folder size={13} className="shrink-0 text-yellow-500/70" aria-hidden="true" />
        )}
        <span className="truncate">{node.name}</span>
        {node.badge != null && (
          <span className="ml-auto shrink-0 pr-2">{node.badge}</span>
        )}
      </div>
    )
  }

  // File — indent an extra 14px to align text with folder text (past chevron)
  const IconComp = resolveFileIcon(node.name)

  return (
    <div
      role="treeitem"
      aria-selected={isSelected}
      tabIndex={isFocused ? 0 : -1}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      title={node.name}
      className={cn(
        sharedClass,
        isSelected
          ? dark
            ? "bg-blue-600/30 text-white"
            : "bg-blue-50 font-medium text-blue-700"
          : dark
            ? "text-gray-400"
            : "text-gray-600",
      )}
      style={{ paddingLeft: basePad + 14 }}
    >
      {node.icon ?? (
        <IconComp
          size={13}
          className={cn(
            "shrink-0",
            isSelected
              ? dark ? "text-blue-300" : "text-blue-500"
              : dark ? "text-gray-500" : "text-gray-400",
          )}
          aria-hidden="true"
        />
      )}
      <span className="truncate">{node.name}</span>
      {node.badge != null && (
        <span className="ml-auto shrink-0 pr-2">{node.badge}</span>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// FileExplorer (root)
// ---------------------------------------------------------------------------

export function FileExplorer({
  files,
  onSelectFile,
  selectedPath,
  expandedPaths: controlledExpanded,
  onExpandedChange,
  defaultExpandedPaths,
  onContextMenu,
  variant = "dark",
  headerTitle = "Explorer",
  showHeader = true,
  className,
}: FileExplorerProps) {
  const isControlled = controlledExpanded !== undefined
  const [internalExpanded, setInternalExpanded] = useState<Set<string>>(
    () => defaultExpandedPaths ?? topLevelFolders(files),
  )
  const expanded = isControlled ? (controlledExpanded as Set<string>) : internalExpanded

  const [focusedPath, setFocusedPath] = useState<string | null>(
    selectedPath ?? null,
  )

  const treeRef = useRef<HTMLDivElement>(null)

  const setExpanded = useCallback(
    (next: Set<string>) => {
      if (!isControlled) setInternalExpanded(next)
      onExpandedChange?.(next)
    },
    [isControlled, onExpandedChange],
  )

  const handleToggle = useCallback(
    (path: string) => {
      const next = new Set(expanded)
      if (next.has(path)) {
        next.delete(path)
      } else {
        next.add(path)
      }
      setExpanded(next)
    },
    [expanded, setExpanded],
  )

  const handleSelect = useCallback(
    (node: FileNode) => {
      onSelectFile(node.path, node.language)
    },
    [onSelectFile],
  )

  const handleFocus = useCallback((path: string) => {
    setFocusedPath(path)
  }, [])

  /** Flat ordered list of visible items — recomputed when tree or expand state changes */
  const visibleNodes = useMemo(
    () => flattenVisible(files, expanded),
    [files, expanded],
  )

  // Keyboard navigation at the tree level
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const idx = focusedPath
        ? visibleNodes.findIndex((n) => n.path === focusedPath)
        : -1

      switch (e.key) {
        case "ArrowDown": {
          e.preventDefault()
          const next = visibleNodes[idx + 1]
          if (next) setFocusedPath(next.path)
          break
        }
        case "ArrowUp": {
          e.preventDefault()
          const prev = visibleNodes[idx - 1]
          if (prev) setFocusedPath(prev.path)
          break
        }
        case "ArrowRight": {
          e.preventDefault()
          const cur = visibleNodes[idx]
          if (cur?.type === "folder" && !expanded.has(cur.path)) {
            handleToggle(cur.path)
          } else if (cur?.type === "folder" && cur.children?.[0]) {
            // If already open, move focus into first child
            setFocusedPath(cur.children[0].path)
          }
          break
        }
        case "ArrowLeft": {
          e.preventDefault()
          const cur = visibleNodes[idx]
          if (cur?.type === "folder" && expanded.has(cur.path)) {
            handleToggle(cur.path)
          }
          break
        }
        case "Enter":
        case " ": {
          e.preventDefault()
          const cur = visibleNodes[idx]
          if (!cur) break
          if (cur.type === "folder") {
            handleToggle(cur.path)
          } else {
            handleSelect(cur)
          }
          break
        }
      }
    },
    [focusedPath, visibleNodes, expanded, handleToggle, handleSelect],
  )

  // When focused path changes, move browser focus to that DOM node
  const dark = variant === "dark"

  /** Recursively render nodes tracking depth */
  const renderNodes = (nodes: FileNode[], level = 0): ReactNode =>
    nodes.map((node) => (
      <Fragment key={node.path}>
        <FileTreeNode
          node={node}
          level={level}
          isSelected={node.path === selectedPath && node.type === "file"}
          isExpanded={expanded.has(node.path)}
          isFocused={node.path === focusedPath}
          variant={variant}
          onSelect={handleSelect}
          onToggle={handleToggle}
          onFocus={handleFocus}
          onContextMenu={onContextMenu}
        />
        {node.type === "folder" &&
          expanded.has(node.path) &&
          node.children &&
          renderNodes(node.children, level + 1)}
      </Fragment>
    ))

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden",
        dark
          ? "border-r border-gray-700 bg-gray-800"
          : "border-r border-gray-200 bg-white",
        className,
      )}
    >
      {showHeader && (
        <div
          className={cn(
            "shrink-0 border-b px-3 py-2",
            dark ? "border-gray-700" : "border-gray-200",
          )}
        >
          <h3
            className={cn(
              "text-xs font-semibold uppercase tracking-wider",
              dark ? "text-gray-500" : "text-gray-400",
            )}
          >
            {headerTitle}
          </h3>
        </div>
      )}

      <div
        ref={treeRef}
        role="tree"
        aria-label={headerTitle}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          // Seed focus on mount if nothing focused yet
          if (!focusedPath && visibleNodes[0]) {
            setFocusedPath(visibleNodes[0].path)
          }
        }}
        className="flex-1 overflow-y-auto outline-none"
      >
        {files.length === 0 ? (
          <p
            className={cn(
              "px-3 py-8 text-center text-xs",
              dark ? "text-gray-500" : "text-gray-400",
            )}
          >
            No files
          </p>
        ) : (
          renderNodes(files)
        )}
      </div>
    </div>
  )
}

export default FileExplorer
