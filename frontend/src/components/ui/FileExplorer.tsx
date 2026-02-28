import { ChevronRight, File, Folder, FolderOpen } from "lucide-react"
import { useState } from "react"
import { cn } from "../../utils/cn"

export interface FileNode {
  name: string
  path: string
  type: "file" | "folder"
  children?: FileNode[]
  language?: string
}

interface FileExplorerProps {
  files: FileNode[]
  onSelectFile: (path: string, language?: string) => void
  selectedPath?: string
  className?: string
}

function FileTreeNode({
  node,
  onSelectFile,
  selectedPath,
  level = 0,
}: {
  node: FileNode
  onSelectFile: (path: string, language?: string) => void
  selectedPath?: string
  level?: number
}) {
  const [isOpen, setIsOpen] = useState(level === 0)
  const isSelected = node.path === selectedPath && node.type === "file"

  if (node.type === "file") {
    return (
      <button
        onClick={() => onSelectFile(node.path, node.language)}
        className={cn(
          "flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors whitespace-nowrap",
          "text-gray-300 hover:bg-gray-700 hover:text-gray-100",
          isSelected && "bg-indigo-600 text-white hover:bg-indigo-700"
        )}
        style={{ paddingLeft: `${level * 16 + 12}px` }}
        title={node.name}
      >
        <File size={14} className="flex-shrink-0" />
        <span className="truncate text-xs">{node.name}</span>
      </button>
    )
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex w-full items-center gap-1 px-3 py-2 text-left text-sm font-medium transition-colors",
          "text-gray-300 hover:bg-gray-700 hover:text-gray-100"
        )}
        style={{ paddingLeft: `${level * 16 + 12}px` }}
      >
        <ChevronRight
          size={14}
          className={cn(
            "flex-shrink-0 transition-transform",
            isOpen && "rotate-90"
          )}
        />
        {isOpen ? (
          <FolderOpen size={14} className="flex-shrink-0" />
        ) : (
          <Folder size={14} className="flex-shrink-0" />
        )}
        <span className="truncate text-xs">{node.name}</span>
      </button>
      {isOpen &&
        node.children?.map((child) => (
          <FileTreeNode
            key={child.path}
            node={child}
            onSelectFile={onSelectFile}
            selectedPath={selectedPath}
            level={level + 1}
          />
        ))}
    </>
  )
}

export function FileExplorer({
  files,
  onSelectFile,
  selectedPath,
  className,
}: FileExplorerProps) {
  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden border-r border-gray-700 bg-gray-800",
        className
      )}
    >
      <div className="border-b border-gray-700 px-3 py-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          Explorer
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto">
        {files.length === 0 ? (
          <div className="px-3 py-8 text-center text-xs text-gray-500">
            No files
          </div>
        ) : (
          files.map((file) => (
            <FileTreeNode
              key={file.path}
              node={file}
              onSelectFile={onSelectFile}
              selectedPath={selectedPath}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default FileExplorer
