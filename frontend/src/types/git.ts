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
  isProtected?: boolean
  lastCommit: string
  ahead?: number
  behind?: number
  parentBranch?: string    // For branch graph visualization
  parentNodeId?: string    // The specific node from which this branch was created
  branchType?: 'main' | 'staging' | 'feature' // For visual categorization
  lastPublishAt?: string   // ISO timestamp of last push
  lastPullAt?: string      // ISO timestamp of last pull
}

/** A single clickable dot on the Branch Timeline */
export interface TimelineNode {
  id: string
  branchName: string
  date: string   // ISO
  kind?: 'commit' | 'pull' | 'publish' | 'checkpoint'
  label?: string
}

/** Filters for Branch Timeline display */
export interface GitFilters {
  dateFrom: string | null  // YYYY-MM-DD or null
  dateTo: string | null    // YYYY-MM-DD or null
}

export interface BranchSync {
  ahead: number
  behind: number
}

export interface GitChange {
  path: string
  type: 'added' | 'modified' | 'deleted'
  staged: boolean
}

export interface GitPR {
  id: string
  title: string
  description: string
  baseBranch: string
  compareBranch: string
  status: 'draft' | 'open' | 'closed' | 'merged'
  createdAt: string
  author: string
}

export type ActivityDetails = {
  [key: string]: string | boolean | number | null
}

export interface GitActivityLog {
  id: string
  type: 'connect' | 'checkout' | 'commit' | 'pull' | 'push' | 'branch-create' | 'branch-delete' | 'disconnect' | 'pull-request'
  date: string
  message: string
  details?: string | Record<string, any>
}

export interface GitConfig {
  repository: GitRepository | null
  branches: GitBranch[]
  commits: GitCommit[]
  currentBranch: string
  isPushing: boolean
  lastPushedAt: string | null
}