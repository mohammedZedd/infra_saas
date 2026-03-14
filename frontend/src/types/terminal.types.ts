/** Log level tags supported by the terminal. */
export type LogLevel = "info" | "warn" | "error" | "success" | "debug"

/** A single line of terminal output. */
export interface LogLine {
  /** Stable unique identifier for React keying. */
  id: string
  /** ISO 8601 timestamp string. */
  timestamp: string
  level: LogLevel
  message: string
}

// ---------------------------------------------------------------------------
// Source configuration
// ---------------------------------------------------------------------------

/** A WebSocket-backed streaming source. */
export interface TerminalWebSocketSource {
  type: "websocket"
  url: string
  /**
   * Optional custom parser for incoming messages.
   * Return `null` to discard a message.
   * Defaults to treating the raw message data as plain "info" text.
   */
  parseMessage?: (event: MessageEvent) => LogLine | null
}

/** A Server-Sent Events (SSE) streaming source. */
export interface TerminalSSESource {
  type: "sse"
  url: string
  /**
   * Optional custom parser for incoming SSE events.
   * Return `null` to discard an event.
   * Defaults to treating event.data as plain "info" text.
   */
  parseEvent?: (event: MessageEvent) => LogLine | null
}

/** A polling-based source that calls a fetch function on a fixed interval. */
export interface TerminalPollingSource {
  type: "polling"
  /** Called on each tick. Should return only *new* lines to append. */
  fetchFn: (signal: AbortSignal) => Promise<LogLine[]>
  /** Polling interval in milliseconds. Defaults to 2000. */
  intervalMs?: number
}

export type TerminalSource =
  | TerminalWebSocketSource
  | TerminalSSESource
  | TerminalPollingSource

// ---------------------------------------------------------------------------
// Hook options / return
// ---------------------------------------------------------------------------

export interface UseRunTerminalOptions {
  /** Streaming source configuration. Omit to use the hook in manual / controlled mode. */
  source?: TerminalSource
  /** Pre-populate the terminal with historical log lines. */
  initialLines?: LogLine[]
}

export interface UseRunTerminalReturn {
  /** Current log lines in display order. */
  lines: LogLine[]
  /** True while a WebSocket / SSE connection is open or a poll is running. */
  isConnected: boolean
  /**
   * True after a WebSocket / SSE connection closes cleanly
   * or a polling source is externally stopped.
   */
  isComplete: boolean
  /** Append a single structured log line. */
  appendLine: (line: Omit<LogLine, "id">) => void
  /** Append a plain-text message with an optional level (defaults to "info"). */
  appendRaw: (message: string, level?: LogLevel) => void
  /** Remove all log lines from state. */
  clearLines: () => void
  /** Attach this ref to the scrollable terminal container. */
  containerRef: React.RefObject<HTMLDivElement | null>
  /** Whether auto-scroll-to-bottom is active. */
  isAutoScroll: boolean
  /** Manually enable or disable auto-scroll. */
  setAutoScroll: React.Dispatch<React.SetStateAction<boolean>>
}
