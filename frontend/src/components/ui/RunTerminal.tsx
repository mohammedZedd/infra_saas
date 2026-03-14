import React, { useCallback, useId } from "react"
import {
  ArrowDownToLine,
  ChevronDown,
  Circle,
  Download,
  Trash2,
} from "lucide-react"
import { cn } from "../../utils/cn"
import { useRunTerminal } from "../../hooks/useRunTerminal"
import type { LogLevel, LogLine, TerminalSource } from "../../types/terminal.types"

// ---------------------------------------------------------------------------
// Constants / styling maps
// ---------------------------------------------------------------------------

/** Tailwind colour classes for each log level. */
const LEVEL_TEXT: Record<LogLevel, string> = {
  info: "text-gray-100",
  debug: "text-sky-400",
  success: "text-emerald-400",
  warn: "text-amber-400",
  error: "text-red-400",
}

/** Short uppercase badge shown before each message. */
const LEVEL_BADGE: Record<LogLevel, string> = {
  info: "INFO",
  debug: "DEBG",
  success: "DONE",
  warn: "WARN",
  error: "ERR!",
}

const BADGE_BG: Record<LogLevel, string> = {
  info: "bg-gray-700 text-gray-300",
  debug: "bg-sky-900/60 text-sky-300",
  success: "bg-emerald-900/60 text-emerald-300",
  warn: "bg-amber-900/60 text-amber-300",
  error: "bg-red-900/60 text-red-300",
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface WindowDotProps {
  colour: string
}

function WindowDot({ colour }: WindowDotProps): React.ReactElement {
  return <span className={cn("h-3 w-3 rounded-full", colour)} aria-hidden />
}

interface StatusDotProps {
  isConnected: boolean
  isComplete: boolean
}

function StatusDot({ isConnected, isComplete }: StatusDotProps): React.ReactElement {
  if (isComplete) {
    return (
      <span className="flex items-center gap-1.5 text-xs text-gray-400">
        <Circle className="h-2 w-2 fill-gray-500 text-gray-500" />
        Finished
      </span>
    )
  }
  if (isConnected) {
    return (
      <span className="flex items-center gap-1.5 text-xs text-emerald-400">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        Connected
      </span>
    )
  }
  return (
    <span className="flex items-center gap-1.5 text-xs text-yellow-400">
      <Circle className="h-2 w-2 fill-yellow-400 text-yellow-400" />
      Waiting…
    </span>
  )
}

interface LogRowProps {
  line: LogLine
  showTimestamps: boolean
}

const LogRow = React.memo(function LogRow({
  line,
  showTimestamps,
}: LogRowProps): React.ReactElement {
  return (
    <div
      className={cn(
        "flex min-w-0 gap-2 py-0.5 font-mono text-[0.78rem] leading-5",
        LEVEL_TEXT[line.level]
      )}
    >
      {/* Timestamp */}
      {showTimestamps && (
        <span className="shrink-0 select-none text-gray-500">
          {formatTimestamp(line.timestamp)}
        </span>
      )}

      {/* Level badge */}
      <span
        className={cn(
          "shrink-0 select-none rounded px-1 py-0 text-[0.68rem] font-semibold uppercase leading-5 tracking-wide",
          BADGE_BG[line.level]
        )}
      >
        {LEVEL_BADGE[line.level]}
      </span>

      {/* Message — preserve whitespace and allow wrapping */}
      <span className="min-w-0 break-words whitespace-pre-wrap">{line.message}</span>
    </div>
  )
})

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTimestamp(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  } catch {
    return iso
  }
}

function linesToText(lines: LogLine[], showTimestamps: boolean): string {
  return lines
    .map((l) => {
      const ts = showTimestamps ? `[${formatTimestamp(l.timestamp)}] ` : ""
      return `${ts}[${LEVEL_BADGE[l.level]}] ${l.message}`
    })
    .join("\n")
}

function triggerDownload(text: string, filename: string): void {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface RunTerminalProps {
  /**
   * **Controlled mode**: pass a `lines` array and the component renders those
   * directly without managing its own streaming state.
   */
  lines?: LogLine[]
  /**
   * **Uncontrolled / streaming mode**: provide a source configuration and the
   * component wires up WebSocket, SSE, or polling internally.
   */
  source?: TerminalSource
  /** Seed the internal log state before the source connects. */
  initialLines?: LogLine[]
  /** Label rendered in the terminal header.  Default: "Terminal" */
  title?: string
  /** Show human-readable timestamps before each log message.  Default: false */
  showTimestamps?: boolean
  /**
   * Override the "connected" indicator when in controlled mode.
   * Ignored when `source` is provided (hook owns the state).
   */
  isConnected?: boolean
  /**
   * Override the "complete" indicator when in controlled mode.
   * Ignored when `source` is provided.
   */
  isComplete?: boolean
  /**
   * Called when the user clicks "Clear".
   * In controlled mode the parent is responsible for emptying `lines`.
   * In uncontrolled mode the internal state is cleared automatically;
   * this callback lets the parent react (e.g. notify the server).
   */
  onClear?: () => void
  /**
   * Called when the user clicks "Download".
   * Receives the formatted plaintext of all visible lines so the parent can
   * save it however it likes. If omitted, the component triggers a browser
   * file download automatically.
   */
  onDownload?: (text: string) => void
  /** Extra CSS classes for the outermost container. */
  className?: string
  /** Tailwind height class for the scrollable log area.  Default: `"h-96"` */
  heightClass?: string
  /**
   * Filename used for the automatic browser download (ignored when
   * `onDownload` is provided).  Default: `"terminal-logs.txt"`
   */
  downloadFilename?: string
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function RunTerminal({
  lines: controlledLines,
  source,
  initialLines,
  title = "Terminal",
  showTimestamps = false,
  isConnected: controlledConnected,
  isComplete: controlledComplete,
  onClear,
  onDownload,
  className,
  heightClass = "h-96",
  downloadFilename = "terminal-logs.txt",
}: RunTerminalProps): React.ReactElement {
  const labelId = useId()

  // Run the hook unconditionally — in controlled mode source is undefined so
  // the hook stays idle; we just use its scroll helpers.
  const {
    lines: internalLines,
    isConnected: hookConnected,
    isComplete: hookComplete,
    clearLines: hookClear,
    containerRef,
    isAutoScroll,
    setAutoScroll,
  } = useRunTerminal({ source, initialLines })

  // Decide which data source wins
  const isControlled = controlledLines !== undefined
  const lines = isControlled ? controlledLines : internalLines
  const isConnected = isControlled ? (controlledConnected ?? false) : hookConnected
  const isComplete = isControlled ? (controlledComplete ?? false) : hookComplete

  // ------------------------------------------------------------------
  // Actions
  // ------------------------------------------------------------------

  const handleClear = useCallback((): void => {
    if (!isControlled) hookClear()
    onClear?.()
  }, [isControlled, hookClear, onClear])

  const handleDownload = useCallback((): void => {
    const text = linesToText(lines, showTimestamps)
    if (onDownload) {
      onDownload(text)
    } else {
      triggerDownload(text, downloadFilename)
    }
  }, [lines, showTimestamps, onDownload, downloadFilename])

  const handleJumpToBottom = useCallback((): void => {
    const el = containerRef.current
    if (el) {
      el.scrollTop = el.scrollHeight
      setAutoScroll(true)
    }
  }, [containerRef, setAutoScroll])

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------

  return (
    <section
      aria-labelledby={labelId}
      className={cn(
        "flex flex-col overflow-hidden rounded-lg border border-gray-700 bg-gray-900 shadow-lg",
        className
      )}
    >
      {/* ---- Header bar ---- */}
      <header className="flex items-center gap-3 border-b border-gray-700 bg-gray-800 px-4 py-2.5">
        {/* macOS-style window dots */}
        <div className="flex items-center gap-1.5" aria-hidden>
          <WindowDot colour="bg-red-500" />
          <WindowDot colour="bg-yellow-500" />
          <WindowDot colour="bg-green-500" />
        </div>

        {/* Title */}
        <span
          id={labelId}
          className="flex-1 truncate text-center text-xs font-medium text-gray-300"
        >
          {title}
        </span>

        {/* Status indicator */}
        <StatusDot isConnected={isConnected} isComplete={isComplete} />

        {/* Actions */}
        <div className="ml-2 flex items-center gap-1">
          <button
            type="button"
            onClick={handleDownload}
            disabled={lines.length === 0}
            title="Download logs"
            className={cn(
              "rounded p-1 text-gray-400 transition-colors",
              lines.length > 0
                ? "hover:bg-gray-700 hover:text-gray-200"
                : "cursor-not-allowed opacity-40"
            )}
          >
            <Download className="h-3.5 w-3.5" aria-hidden />
            <span className="sr-only">Download logs</span>
          </button>

          <button
            type="button"
            onClick={handleClear}
            disabled={lines.length === 0}
            title="Clear logs"
            className={cn(
              "rounded p-1 text-gray-400 transition-colors",
              lines.length > 0
                ? "hover:bg-gray-700 hover:text-red-400"
                : "cursor-not-allowed opacity-40"
            )}
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden />
            <span className="sr-only">Clear logs</span>
          </button>
        </div>
      </header>

      {/* ---- Log area ---- */}
      <div className="relative flex-1">
        <div
          ref={containerRef}
          role="log"
          aria-live="polite"
          aria-label="Terminal output"
          className={cn(
            "overflow-y-auto scroll-smooth px-4 py-3",
            heightClass
          )}
        >
          {lines.length === 0 ? (
            <p className="select-none font-mono text-xs text-gray-600">
              {isConnected ? "Waiting for output…" : "No logs yet."}
            </p>
          ) : (
            lines.map((line) => (
              <LogRow key={line.id} line={line} showTimestamps={showTimestamps} />
            ))
          )}
        </div>

        {/* Jump-to-bottom pill */}
        {!isAutoScroll && lines.length > 0 && (
          <button
            type="button"
            onClick={handleJumpToBottom}
            className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-gray-600 bg-gray-800/90 px-3 py-1 text-xs text-gray-300 shadow-lg backdrop-blur transition-colors hover:bg-gray-700 hover:text-white"
          >
            <ArrowDownToLine className="h-3 w-3" aria-hidden />
            Jump to bottom
          </button>
        )}
      </div>

      {/* ---- Status bar ---- */}
      <footer className="flex items-center justify-between border-t border-gray-700 bg-gray-800/60 px-4 py-1.5">
        <span className="text-[0.7rem] text-gray-500 tabular-nums">
          {lines.length} line{lines.length !== 1 ? "s" : ""}
        </span>

        {!isAutoScroll && (
          <button
            type="button"
            onClick={handleJumpToBottom}
            className="flex items-center gap-1 text-[0.7rem] text-indigo-400 hover:text-indigo-300"
          >
            <ChevronDown className="h-3 w-3" aria-hidden />
            Scroll to bottom
          </button>
        )}

        <span className="text-[0.7rem] text-gray-500">
          {isComplete ? "● Done" : isConnected ? "● Live" : "○ Idle"}
        </span>
      </footer>
    </section>
  )
}
