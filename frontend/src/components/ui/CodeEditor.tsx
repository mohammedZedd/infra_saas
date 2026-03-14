import { useCallback, useRef, useState } from "react"
import MonacoEditor, {
  type BeforeMount,
  type EditorProps,
  type OnMount,
} from "@monaco-editor/react"
import {
  Check,
  Clipboard,
  Maximize2,
  Minimize2,
  WrapText,
} from "lucide-react"
import toast from "react-hot-toast"
import { cn } from "../../utils/cn"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type MonacoOptions = NonNullable<EditorProps["options"]>

export interface CodeEditorProps {
  value: string
  onChange?: (value: string) => void
  /** Default: "hcl" */
  language?: string
  /** Default: "light" */
  theme?: "light" | "dark"
  /** CSS height value or "100%". Default: "320px" */
  height?: string
  readOnly?: boolean
  /** Text label rendered above the editor */
  label?: string
  className?: string
  /** Called when the editor finishes mounting */
  onMount?: OnMount
  /** Any additional Monaco editor construction options */
  options?: MonacoOptions
  /** Show copy / format / wrap / fullscreen toolbar. Default: false */
  toolbar?: boolean
  /** Show line/col + language status bar at the bottom. Default: false */
  statusBar?: boolean
  /** Called with (line, column) on every cursor position change */
  onCursorChange?: (line: number, column: number) => void
  /** Custom node rendered while Monaco is loading. Falls back to a skeleton. */
  loading?: React.ReactNode
}

// ---------------------------------------------------------------------------
// HCL language registration (runs once per Monaco instance)
// ---------------------------------------------------------------------------

const HCL_ID = "hcl"

const registerHCL: BeforeMount = (monaco) => {
  const already = monaco.languages.getLanguages().some((l: { id: string }) => l.id === HCL_ID)
  if (already) return

  monaco.languages.register({
    id: HCL_ID,
    extensions: [".tf", ".tfvars", ".hcl"],
    aliases: ["HCL", "Terraform", "hcl"],
  })

  monaco.languages.setMonarchTokensProvider(HCL_ID, {
    defaultToken: "",
    tokenPostfix: ".hcl",

    keywords: [
      "variable", "resource", "data", "provider", "module", "output",
      "locals", "terraform", "required_providers", "backend", "for_each",
      "count", "depends_on", "lifecycle", "provisioner", "connection",
      "dynamic", "content", "moved", "check",
    ],
    typeKeywords: [
      "string", "number", "bool", "list", "map", "set", "object", "tuple",
      "any", "null", "true", "false",
    ],
    operators: [
      "=", "!=", ">=", "<=", ">", "<", "&&", "||", "!", "+", "-",
      "*", "/", "%", "?", ":",
    ],
    symbols: /[=><!~?:+\-*/^%&|]+/,
    escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,

    tokenizer: {
      root: [
        // Line comments
        [/#.*$/, "comment"],
        [/\/\/.*$/, "comment"],
        // Block comments
        [/\/\*/, "comment", "@blockComment"],
        // Identifiers / keywords
        [/[a-z_$][\w$]*/, {
          cases: {
            "@keywords": "keyword",
            "@typeKeywords": "type",
            "@default": "identifier",
          },
        }],
        // Double-quoted strings
        [/"/, { token: "string.quote", bracket: "@open", next: "@string" }],
        // Numbers
        [/\d*\.\d+([eE][-+]?\d+)?/, "number.float"],
        [/0x[0-9a-fA-F]+/, "number.hex"],
        [/\d+/, "number"],
        // Brackets
        [/[{}()[\]]/, "@brackets"],
        // Operators
        [/@symbols/, {
          cases: {
            "@operators": "operator",
            "@default": "",
          },
        }],
        // Whitespace
        [/\s+/, "white"],
      ],
      blockComment: [
        [/[^/*]+/, "comment"],
        [/\*\//, "comment", "@pop"],
        [/[/*]/, "comment"],
      ],
      string: [
        [/[^\\"$]+/, "string"],
        [/@escapes/, "string.escape"],
        [/\\./, "string.escape.invalid"],
        // Template expressions ${…}
        [/\$\{/, { token: "delimiter.bracket", bracket: "@open", next: "@templateExpr" }],
        [/"/, { token: "string.quote", bracket: "@close", next: "@pop" }],
      ],
      templateExpr: [
        [/\}/, { token: "delimiter.bracket", bracket: "@close", next: "@pop" }],
        { include: "root" },
      ],
    },
  })

  monaco.languages.setLanguageConfiguration(HCL_ID, {
    comments: { lineComment: "#", blockComment: ["/*", "*/"] },
    brackets: [
      ["{", "}"],
      ["[", "]"],
      ["(", ")"],
    ],
    autoClosingPairs: [
      { open: "{", close: "}" },
      { open: "[", close: "]" },
      { open: "(", close: ")" },
      { open: '"', close: '"' },
    ],
    surroundingPairs: [
      { open: "{", close: "}" },
      { open: "[", close: "]" },
      { open: "(", close: ")" },
      { open: '"', close: '"' },
    ],
    indentationRules: {
      increaseIndentPattern: /^.*\{[^}"']*$/,
      decreaseIndentPattern: /^\s*\}/,
    },
  })
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

function EditorSkeleton({ height, dark }: { height: string; dark: boolean }) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl",
        dark ? "bg-[#1e1e1e]" : "bg-gray-50",
      )}
      style={{ height }}
      aria-busy="true"
      aria-label="Loading editor"
    >
      <div className="flex h-full flex-col gap-2 p-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-3 animate-pulse rounded",
              dark ? "bg-white/10" : "bg-gray-200",
            )}
            style={{ width: `${40 + ((i * 37) % 45)}%` }}
          />
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Toolbar button helper
// ---------------------------------------------------------------------------

interface ToolbarBtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
  label: string
}

function ToolbarBtn({ active, label, className, children, ...rest }: ToolbarBtnProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "flex h-6 w-6 items-center justify-center rounded transition-colors",
        active
          ? "bg-blue-100 text-blue-600"
          : "text-gray-400 hover:bg-gray-100 hover:text-gray-600",
        rest.disabled && "cursor-not-allowed opacity-40",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}

// ---------------------------------------------------------------------------
// CodeEditor
// ---------------------------------------------------------------------------

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
  toolbar = false,
  statusBar = false,
  onCursorChange,
  loading,
}: CodeEditorProps) {
  const isDark = theme === "dark"
  const monacoTheme = isDark ? "vs-dark" : "vs"

  const editorRef = useRef<Parameters<OnMount>[0] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCopied, setIsCopied] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [wordWrap, setWordWrap] = useState<boolean>(
    options.wordWrap !== "off",
  )
  const [cursorPos, setCursorPos] = useState<{ line: number; col: number }>({
    line: 1,
    col: 1,
  })

  const handleMount: OnMount = useCallback(
    (editor, monaco) => {
      editorRef.current = editor
      setIsLoading(false)

      // Cursor tracking
      editor.onDidChangeCursorPosition((e) => {
        const { lineNumber: line, column: col } = e.position
        setCursorPos({ line, col })
        onCursorChange?.(line, col)
      })

      onMount?.(editor, monaco)
    },
    [onMount, onCursorChange],
  )

  const handleCopy = useCallback(() => {
    const text = editorRef.current?.getValue() ?? value
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setIsCopied(true)
        toast.success("Copied to clipboard")
        setTimeout(() => setIsCopied(false), 2000)
      })
      .catch(() => toast.error("Copy failed"))
  }, [value])

  const handleFormat = useCallback(() => {
    editorRef.current
      ?.getAction("editor.action.formatDocument")
      ?.run()
      .catch(() => {})
  }, [])

  const handleToggleWrap = useCallback(() => {
    setWordWrap((prev) => {
      const next = !prev
      editorRef.current?.updateOptions({ wordWrap: next ? "on" : "off" })
      return next
    })
  }, [])

  const resolvedOptions: MonacoOptions = {
    readOnly,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    fontSize: 13,
    lineNumbers: "on",
    wordWrap: wordWrap ? "on" : "off",
    tabSize: 2,
    automaticLayout: true,
    padding: { top: 12, bottom: 12 },
    formatOnPaste: true,
    formatOnType: true,
    ...options,
  }

  const containerCls = cn(
    "flex flex-col gap-1.5",
    isFullscreen && "fixed inset-0 z-50 bg-black/60 p-8",
    className,
  )

  const panelCls = cn(
    "flex flex-1 flex-col overflow-hidden rounded-xl border",
    isDark
      ? "border-gray-800 bg-[#1e1e1e]"
      : "border-gray-200 bg-white shadow-sm",
  )

  return (
    <div className={containerCls}>
      {label && (
        <span className="text-sm font-medium text-gray-700">{label}</span>
      )}

      <div
        className={panelCls}
        style={isFullscreen ? undefined : { height }}
      >
        {/* ── Toolbar ──────────────────────────────────────────────── */}
        {toolbar && (
          <div
            className={cn(
              "flex shrink-0 items-center justify-end gap-1 border-b px-2 py-1",
              isDark
                ? "border-gray-700 bg-[#252526]"
                : "border-gray-100 bg-gray-50",
            )}
          >
            <ToolbarBtn
              label={isCopied ? "Copied!" : "Copy code"}
              onClick={handleCopy}
              active={isCopied}
            >
              {isCopied ? <Check size={13} /> : <Clipboard size={13} />}
            </ToolbarBtn>

            <ToolbarBtn
              label="Format document"
              onClick={handleFormat}
              disabled={readOnly}
              className={isDark ? "text-gray-400 hover:bg-white/10 hover:text-gray-200" : undefined}
            >
              {/* Format icon — reuse WrapText as stand-in */}
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 10H3M21 6H3M21 14H3M21 18H3" />
              </svg>
            </ToolbarBtn>

            <ToolbarBtn
              label={wordWrap ? "Disable word wrap" : "Enable word wrap"}
              onClick={handleToggleWrap}
              active={wordWrap}
            >
              <WrapText size={13} />
            </ToolbarBtn>

            <ToolbarBtn
              label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
              onClick={() => setIsFullscreen((v) => !v)}
            >
              {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            </ToolbarBtn>
          </div>
        )}

        {/* ── Editor ───────────────────────────────────────────────── */}
        <div className="relative min-h-0 flex-1">
          {isLoading && (
            <div className="absolute inset-0 z-10">
              {loading ?? <EditorSkeleton height="100%" dark={isDark} />}
            </div>
          )}
          <MonacoEditor
            height="100%"
            language={language}
            theme={monacoTheme}
            value={value}
            options={resolvedOptions}
            beforeMount={registerHCL}
            onChange={(val) => onChange?.(val ?? "")}
            onMount={handleMount}
          />
        </div>

        {/* ── Status bar ───────────────────────────────────────────── */}
        {statusBar && (
          <div
            className={cn(
              "flex shrink-0 items-center justify-between border-t px-3 py-0.5 text-xs",
              isDark
                ? "border-gray-700 bg-[#007acc] text-white"
                : "border-gray-100 bg-gray-50 text-gray-500",
            )}
          >
            <span>
              Ln {cursorPos.line}, Col {cursorPos.col}
            </span>
            <div className="flex items-center gap-3">
              {readOnly && (
                <span
                  className={cn(
                    "rounded px-1.5 py-px text-[10px] font-medium uppercase tracking-wide",
                    isDark
                      ? "bg-white/20 text-white"
                      : "bg-gray-200 text-gray-600",
                  )}
                >
                  Read Only
                </span>
              )}
              <span className="uppercase">{language}</span>
              <span>UTF-8</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CodeEditor
