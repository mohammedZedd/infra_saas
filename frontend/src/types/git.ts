export interface GitRepository {
  id: string
  name: string
  fullName: string
  url: string
  provider: "github" | "gitlab" | "bitbucket"
  defaultBranch: string
  isConnected: boolean
}

export interface GitCommit {
  id: string
  hash: string
  shortHash: string
  message: string
  author: string
  date: string
  branch: string
  filesChanged: string[]
  additions: number
  deletions: number
}

export interface GitBranch {
  name: string
  isDefault: boolean
  lastCommit: string
}

export interface GitConfig {
  repository: GitRepository | null
  branches: GitBranch[]
  commits: GitCommit[]
  currentBranch: string
  isPushing: boolean
  lastPushedAt: string | null
}