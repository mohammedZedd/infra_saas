import { create } from "zustand"
import type { GitRepository, GitCommit, GitBranch, GitConfig } from "../types/git"

interface GitState extends GitConfig {
  // Actions - Repository
  connectRepository: (repo: GitRepository) => void
  disconnectRepository: () => void

  // Actions - Branches
  switchBranch: (branch: string) => void
  createBranch: (name: string) => void

  // Actions - Push
  pushToGit: (message: string, branch: string, files: string[]) => Promise<void>

  // Actions - History
  getCommitDiff: (commitId: string) => GitCommit | null
}

// Mock commits pour démo
const MOCK_COMMITS: GitCommit[] = [
  {
    id: "c1",
    hash: "a3f2b1c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4",
    shortHash: "a3f2b1c",
    message: "Initial infrastructure setup — VPC, EC2, RDS",
    author: "John Doe",
    date: "2024-03-15T10:30:00Z",
    branch: "main",
    filesChanged: ["main.tf", "variables.tf", "outputs.tf", "backend.tf"],
    additions: 142,
    deletions: 0,
  },
  {
    id: "c2",
    hash: "b4e3c2d1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5",
    shortHash: "b4e3c2d",
    message: "Add security group rules for web traffic",
    author: "John Doe",
    date: "2024-03-16T14:22:00Z",
    branch: "main",
    filesChanged: ["main.tf"],
    additions: 28,
    deletions: 3,
  },
  {
    id: "c3",
    hash: "c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6",
    shortHash: "c5d4e3f",
    message: "Configure CloudFront distribution with S3 origin",
    author: "John Doe",
    date: "2024-03-17T09:15:00Z",
    branch: "main",
    filesChanged: ["main.tf", "outputs.tf"],
    additions: 45,
    deletions: 2,
  },
]

const MOCK_BRANCHES: GitBranch[] = [
  { name: "main", isDefault: true, lastCommit: "c5d4e3f" },
  { name: "staging", isDefault: false, lastCommit: "b4e3c2d" },
  { name: "feature/monitoring", isDefault: false, lastCommit: "a3f2b1c" },
]

const useGitStore = create<GitState>((set, get) => ({
  repository: null,
  branches: [],
  commits: [],
  currentBranch: "main",
  isPushing: false,
  lastPushedAt: null,

  connectRepository: (repo) => {
    set({
      repository: repo,
      branches: MOCK_BRANCHES,
      commits: MOCK_COMMITS,
      currentBranch: repo.defaultBranch,
    })
  },

  disconnectRepository: () => {
    set({
      repository: null,
      branches: [],
      commits: [],
      currentBranch: "main",
      lastPushedAt: null,
    })
  },

  switchBranch: (branch) => {
    set({ currentBranch: branch })
  },

  createBranch: (name) => {
    const newBranch: GitBranch = {
      name,
      isDefault: false,
      lastCommit: get().commits[0]?.shortHash || "",
    }
    set({ branches: [...get().branches, newBranch], currentBranch: name })
  },

  pushToGit: async (message, branch, files) => {
    set({ isPushing: true })

    // Simulate push delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const newCommit: GitCommit = {
      id: `c${Date.now()}`,
      hash: Array.from({ length: 40 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join(""),
      shortHash: Array.from({ length: 7 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join(""),
      message,
      author: "John Doe",
      date: new Date().toISOString(),
      branch,
      filesChanged: files,
      additions: Math.floor(Math.random() * 50) + 5,
      deletions: Math.floor(Math.random() * 15),
    }

    set({
      commits: [newCommit, ...get().commits],
      isPushing: false,
      lastPushedAt: new Date().toISOString(),
    })
  },

  getCommitDiff: (commitId) => {
    return get().commits.find((c) => c.id === commitId) || null
  },
}))

export default useGitStore