import { create } from "zustand"

// ── Types ────────────────────────────────────────────────────────────────────

export interface GitConnection {
  id: string
  provider: string
  repoUrl: string
  repoName: string
  branch: string
  username: string
  connectedAt: string
  status: "connected" | "disconnected" | "error"
}

export interface SyncEntry {
  id: string
  action: "pull" | "push"
  filesCount: number
  message: string
  date: string
}

interface GitState {
  connections: GitConnection[]
  isLoading: boolean
  lastPulledAt: string | null
  lastPushedAt: string | null
  pendingPullFiles: string[]
  pendingPushFiles: string[]
  syncHistory: SyncEntry[]
  commitMessage: string
  addConnection: (connection: GitConnection) => void
  updateConnection: (id: string, data: Partial<GitConnection>) => void
  removeConnection: (id: string) => void
  setLoading: (loading: boolean) => void
  setCommitMessage: (message: string) => void
  simulatePull: () => void
  simulatePush: () => void
}

// ── Mock initial sync history ────────────────────────────────────────────────

const MOCK_SYNC_HISTORY: SyncEntry[] = [
  {
    id: "s1",
    action: "push",
    filesCount: 3,
    message: "Update EC2 config",
    date: "Oct 28, 2025 at 14:32",
  },
  {
    id: "s2",
    action: "pull",
    filesCount: 1,
    message: "Sync from remote",
    date: "Oct 27, 2025 at 11:45",
  },
  {
    id: "s3",
    action: "push",
    filesCount: 5,
    message: "Add RDS module",
    date: "Oct 26, 2025 at 16:20",
  },
  {
    id: "s4",
    action: "pull",
    filesCount: 2,
    message: "Fetch latest changes",
    date: "Oct 25, 2025 at 09:15",
  },
  {
    id: "s5",
    action: "push",
    filesCount: 1,
    message: "Fix subnet config",
    date: "Oct 24, 2025 at 13:50",
  },
]

// ── Store ────────────────────────────────────────────────────────────────────

const useGitStore = create<GitState>((set) => ({
  connections: [],
  isLoading: false,
  lastPulledAt: "Oct 28, 2025 at 14:32",
  lastPushedAt: "Oct 27, 2025 at 09:15",
  pendingPullFiles: ["main.tf", "variables.tf", "outputs.tf"],
  pendingPushFiles: ["main.tf", "variables.tf"],
  syncHistory: MOCK_SYNC_HISTORY,
  commitMessage: "Update infrastructure config",

  addConnection: (connection) =>
    set((state) => ({ connections: [...state.connections, connection] })),

  updateConnection: (id, data) =>
    set((state) => ({
      connections: state.connections.map((c) =>
        c.id === id ? { ...c, ...data } : c
      ),
    })),

  removeConnection: (id) =>
    set((state) => ({
      connections: state.connections.filter((c) => c.id !== id),
    })),

  setLoading: (loading) => set({ isLoading: loading }),

  setCommitMessage: (message) => set({ commitMessage: message }),

  simulatePull: () => {
    set((state) => ({
      lastPulledAt: new Date().toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      pendingPullFiles: [],
      syncHistory: [
        {
          id: `sync-${Date.now()}`,
          action: "pull",
          filesCount: state.pendingPullFiles.length,
          message: "Pulled from remote",
          date: new Date().toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
        ...state.syncHistory,
      ],
    }))
  },

  simulatePush: () => {
    set((state) => ({
      lastPushedAt: new Date().toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      pendingPushFiles: [],
      syncHistory: [
        {
          id: `sync-${Date.now()}`,
          action: "push",
          filesCount: state.pendingPushFiles.length,
          message: state.commitMessage || "Pushed to remote",
          date: new Date().toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
        ...state.syncHistory,
      ],
    }))
  },
}))

export default useGitStore
