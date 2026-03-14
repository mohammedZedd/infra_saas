import { useCallback, useEffect, useRef, useState } from "react"
import type {
  LogLevel,
  LogLine,
  UseRunTerminalOptions,
  UseRunTerminalReturn,
} from "../types/terminal.types"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let _idCounter = 0

function nextId(): string {
  return `log-${Date.now()}-${++_idCounter}`
}

function buildLine(message: string, level: LogLevel = "info"): LogLine {
  return {
    id: nextId(),
    timestamp: new Date().toISOString(),
    level,
    message,
  }
}

function stampLine(partial: Omit<LogLine, "id">): LogLine {
  return { ...partial, id: nextId() }
}

/**
 * Attempt to parse a raw WebSocket / SSE message string as JSON.
 * Expected JSON shape: `{ level?: string, message: string, timestamp?: string }`.
 * Falls back to treating the entire string as a plain "info" line.
 */
function parseRawMessage(data: string): LogLine {
  try {
    const parsed: unknown = JSON.parse(data)
    if (
      parsed !== null &&
      typeof parsed === "object" &&
      "message" in parsed &&
      typeof (parsed as Record<string, unknown>).message === "string"
    ) {
      const obj = parsed as Record<string, unknown>
      const level =
        typeof obj.level === "string" &&
        ["info", "warn", "error", "success", "debug"].includes(obj.level)
          ? (obj.level as LogLevel)
          : "info"
      const timestamp =
        typeof obj.timestamp === "string" ? obj.timestamp : new Date().toISOString()
      return { id: nextId(), timestamp, level, message: obj.message as string }
    }
  } catch {
    // not JSON – fall through
  }
  return buildLine(data)
}

// ---------------------------------------------------------------------------
// Scroll helpers — isolated so they never cause re-renders
// ---------------------------------------------------------------------------

/** How many pixels from the bottom counts as "at the bottom". */
const SCROLL_THRESHOLD = 40

function isAtBottom(el: HTMLDivElement): boolean {
  return el.scrollHeight - el.scrollTop - el.clientHeight <= SCROLL_THRESHOLD
}

function scrollToBottom(el: HTMLDivElement): void {
  el.scrollTop = el.scrollHeight
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useRunTerminal({
  source,
  initialLines = [],
}: UseRunTerminalOptions = {}): UseRunTerminalReturn {
  const [lines, setLines] = useState<LogLine[]>(() =>
    initialLines.map((l) => stampLine(l))
  )
  const [isConnected, setIsConnected] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [isAutoScroll, setAutoScroll] = useState(true)

  const containerRef = useRef<HTMLDivElement>(null)

  // ------------------------------------------------------------------
  // Stable append helpers
  // ------------------------------------------------------------------

  const appendLine = useCallback((line: Omit<LogLine, "id">): void => {
    setLines((prev) => [...prev, stampLine(line)])
  }, [])

  const appendRaw = useCallback((message: string, level: LogLevel = "info"): void => {
    setLines((prev) => [...prev, buildLine(message, level)])
  }, [])

  const clearLines = useCallback((): void => {
    setLines([])
  }, [])

  // ------------------------------------------------------------------
  // Auto-scroll: scroll to bottom whenever lines change
  // ------------------------------------------------------------------

  useEffect(() => {
    if (!isAutoScroll) return
    const el = containerRef.current
    if (el) scrollToBottom(el)
  }, [lines, isAutoScroll])

  // ------------------------------------------------------------------
  // Scroll-spy: disable auto-scroll when user scrolls up
  // ------------------------------------------------------------------

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    function handleScroll(): void {
      if (!el) return
      setAutoScroll(isAtBottom(el))
    }

    el.addEventListener("scroll", handleScroll, { passive: true })
    return () => el.removeEventListener("scroll", handleScroll)
  }, [])

  // ------------------------------------------------------------------
  // Source connection
  // ------------------------------------------------------------------

  useEffect(() => {
    if (!source) return

    let cleanup: (() => void) | undefined

    if (source.type === "websocket") {
      const ws = new WebSocket(source.url)
      setIsConnected(false)
      setIsComplete(false)

      ws.addEventListener("open", () => setIsConnected(true))

      ws.addEventListener("message", (event: MessageEvent<string>) => {
        const line = source.parseMessage
          ? source.parseMessage(event)
          : parseRawMessage(event.data)
        if (line) {
          setLines((prev) => [...prev, stampLine(line)])
        }
      })

      ws.addEventListener("close", () => {
        setIsConnected(false)
        setIsComplete(true)
      })

      ws.addEventListener("error", () => {
        setLines((prev) => [
          ...prev,
          buildLine("WebSocket connection error", "error"),
        ])
        setIsConnected(false)
        setIsComplete(true)
      })

      cleanup = () => {
        ws.close()
      }
    } else if (source.type === "sse") {
      const es = new EventSource(source.url)
      setIsConnected(true)
      setIsComplete(false)

      es.addEventListener("message", (event: MessageEvent<string>) => {
        const line = source.parseEvent
          ? source.parseEvent(event)
          : parseRawMessage(event.data)
        if (line) {
          setLines((prev) => [...prev, stampLine(line)])
        }
      })

      es.addEventListener("error", () => {
        setLines((prev) => [
          ...prev,
          buildLine("SSE connection error", "error"),
        ])
        setIsConnected(false)
        setIsComplete(true)
        es.close()
      })

      cleanup = () => {
        es.close()
        setIsConnected(false)
      }
    } else if (source.type === "polling") {
      const intervalMs = source.intervalMs ?? 2000
      const controller = new AbortController()
      setIsConnected(true)
      setIsComplete(false)

      const run = async (): Promise<void> => {
        if (controller.signal.aborted) return
        try {
          const newLines = await source.fetchFn(controller.signal)
          if (newLines.length > 0) {
            setLines((prev) => [
              ...prev,
              ...newLines.map((l) => stampLine(l)),
            ])
          }
        } catch (err) {
          if (err instanceof DOMException && err.name === "AbortError") return
          setLines((prev) => [
            ...prev,
            buildLine(
              err instanceof Error ? err.message : "Polling error",
              "error"
            ),
          ])
        }
      }

      // Run immediately, then on each interval tick
      void run()
      const timer = window.setInterval(() => void run(), intervalMs)

      cleanup = () => {
        window.clearInterval(timer)
        controller.abort()
        setIsConnected(false)
      }
    }

    return cleanup
  }, [source])

  return {
    lines,
    isConnected,
    isComplete,
    appendLine,
    appendRaw,
    clearLines,
    containerRef,
    isAutoScroll,
    setAutoScroll,
  }
}
