export interface ProjectFile {
  path: string
  name: string
  type: "file" | "folder"
  content?: string
  language?: string
  children?: ProjectFile[]
  size?: number
  createdAt?: string
  updatedAt?: string
}

export interface FileListResponse {
  files: ProjectFile[]
  total: number
}

export interface FileContentResponse {
  path: string
  content: string
  language: string
  size: number
}

export interface FileSaveRequest {
  path: string
  content: string
  message?: string
}

export interface FileSaveResponse {
  path: string
  saved: boolean
  message: string
}
