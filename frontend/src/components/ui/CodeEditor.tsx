import MonacoEditor, { type OnMount } from "@monaco-editor/react"
import { cn } from "../../utils/cn"

export interface CodeEditorProps {
  value: string
  onChange?: (value: string) => void
  language?: string
  theme?: "light" | "dark"
  height?: string
  readOnly?: boolean
  label?: string
  className?: string
  onMount?: OnMount
  options?: Record<string, any>
}

export function CodeEditor({
  value,
  onChange,
  language = "hcl",
  theme = "light",
  height = "320px",
  readOnly = false,
  label,
  className,
  onMount,
  options = {},
}: CodeEditorProps) {
  const monacoTheme = theme === "dark" ? "vs-dark" : "vs"

  return (
    <div className={cn("flex flex-col gap-1.5 h-full", className)}>
      {label && <span className="text-sm font-medium text-gray-700">{label}</span>}

      <div
        className={cn(
          "overflow-hidden rounded-xl border h-full",
          theme === "dark"
            ? "border-gray-800 bg-[#1e1e1e]"
            : "border-gray-200 shadow-sm bg-white"
        )}
        style={{ height }}
      >
        <MonacoEditor
          height="100%"
          language={language}
          theme={monacoTheme}
          value={value}
          options={{
            readOnly,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 13,
            lineNumbers: "on",
            wordWrap: "on",
            tabSize: 2,
            automaticLayout: true,
            padding: { top: 12, bottom: 12 },
            formatOnPaste: true,
            formatOnType: true,
            ...options,
          }}
          onChange={(val) => onChange?.(val ?? "")}
          onMount={onMount}
        />
      </div>
    </div>
  )
}

export default CodeEditor
