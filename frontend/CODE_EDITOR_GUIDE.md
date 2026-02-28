# Code Editor Integration Guide

This document explains the new embedded code editor functionality integrated into CloudForge Infrastructure Designer.

## Overview

The code editor allows users to:
- View and edit generated Terraform code directly within the project interface
- Browse project files in a file explorer
- Copy, download, or share code snippets
- Switch between different Terraform files (main.tf, variables.tf, outputs.tf)
- Edit code and sync changes with the infrastructure design

## Components

### 1. `CodeEditor` Component
**Location:** `src/components/ui/CodeEditor.tsx`

A reusable component powered by Monaco Editor (VS Code engine).

**Props:**
```typescript
interface CodeEditorProps {
  value: string                      // Current code content
  onChange?: (value: string) => void // Called when code changes
  language?: string                  // Language (default: "hcl")
  theme?: "light" | "dark"          // Editor theme (default: "light")
  height?: string                    // Editor height (default: "320px")
  readOnly?: boolean                 // Read-only mode (default: false)
  label?: string                     // Optional label above editor
  className?: string                 // Custom CSS classes
  options?: Record<string, any>      // Monaco editor options
  onMount?: OnMount                  // Called when editor initializes
}
```

**Example Usage:**
```tsx
import { CodeEditor } from "@/components/ui/CodeEditor"

export function MyComponent() {
  const [code, setCode] = useState("")
  
  return (
    <CodeEditor
      value={code}
      language="hcl"
      theme="dark"
      height="500px"
      onChange={setCode}
      label="Terraform Configuration"
    />
  )
}
```

### 2. `FileExplorer` Component
**Location:** `src/components/ui/FileExplorer.tsx`

A tree-based file browser with expand/collapse functionality.

**Props:**
```typescript
interface FileExplorerProps {
  files: FileNode[]
  onSelectFile: (path: string, language?: string) => void
  selectedPath?: string              // Currently selected file
  className?: string                 // Custom CSS classes
}

interface FileNode {
  name: string
  path: string
  type: "file" | "folder"
  children?: FileNode[]
  language?: string                  // File language (hcl, json, etc)
}
```

**Example Usage:**
```tsx
import { FileExplorer } from "@/components/ui/FileExplorer"

export function MyComponent() {
  const files = [
    {
      name: "terraform",
      path: "terraform",
      type: "folder",
      children: [
        { name: "main.tf", path: "main.tf", type: "file", language: "hcl" },
        { name: "variables.tf", path: "variables.tf", type: "file", language: "hcl" }
      ]
    }
  ]
  
  return (
    <FileExplorer
      files={files}
      onSelectFile={(path, language) => console.log(path, language)}
    />
  )
}
```

### 3. `ProjectCodeEditor` Component
**Location:** `src/components/project/ProjectCodeEditor.tsx`

The main code editor component integrated into the Project Detail page. Combines FileExplorer and CodeEditor with Terraform file generation.

**Props:**
```typescript
interface ProjectCodeEditorProps {
  project: Project
  onEditInDesigner?: () => void      // Navigate to visual editor
}
```

**Features:**
- Auto-generates Terraform configuration files from project
- Syntax highlighting for HCL
- Copy to clipboard functionality
- Download as file
- Line count and file size display
- Dark theme for code editing
- Status bar with encoding and line info

### 4. `EditorToolbar` Component
**Location:** `src/components/ui/EditorToolbar.tsx`

A reusable toolbar with common editor actions.

**Props:**
```typescript
interface EditorToolbarProps {
  onSave?: () => void
  onCopy?: () => void
  onDownload?: () => void
  onShare?: () => void
  onEditInDesigner?: () => void
  onReset?: () => void
  isSaving?: boolean
  isDirty?: boolean              // Show dirty indicator
}
```

## Hooks

### `useFileEditor` Hook
**Location:** `src/hooks/useFileEditor.ts`

Manages file editing state including dirty tracking and save operations.

**Returns:**
```typescript
{
  currentFile: FileState | null      // Current file being edited
  isDirty: boolean                    // Has unsaved changes
  isSaving: boolean                   // Save in progress
  loadFile(path, content, language)   // Load a file
  updateContent(newContent)           // Update file content
  saveFile(onSave?)                   // Save file (with optional callback)
  resetContent()                      // Reset to original content
  downloadFile()                      // Download as file
  copyToClipboard()                   // Copy content to clipboard
}
```

**Example Usage:**
```tsx
import { useFileEditor } from "@/hooks/useFileEditor"

export function MyComponent() {
  const {
    currentFile,
    isDirty,
    updateContent,
    saveFile,
  } = useFileEditor()

  return (
    <>
      <button onClick={() => saveFile()}>Save</button>
      <span>{isDirty ? "Unsaved" : "Saved"}</span>
    </>
  )
}
```

## API Integration

### File Management Endpoints
**Location:** `src/services/api.ts`

#### List Files
```typescript
listProjectFiles<T>(projectId: string): Promise<T>
// GET /api/projects/{projectId}/files
```

#### Get File Content
```typescript
getFileContent<T>(projectId: string, filePath: string): Promise<T>
// GET /api/projects/{projectId}/files/content?path={filePath}
```

#### Save File
```typescript
saveFile<T>(projectId: string, filePath: string, content: string, message?: string): Promise<T>
// POST /api/projects/{projectId}/files/save
// Body: { path, content, message }
```

#### Download File
```typescript
downloadFile(projectId: string, filePath: string): Promise<void>
// GET /api/projects/{projectId}/files/download?path={filePath}
// Returns file blob
```

## Type Definitions

### Files Type
**Location:** `src/types/files.ts`

```typescript
interface ProjectFile {
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

interface FileListResponse {
  files: ProjectFile[]
  total: number
}
```

## Integration in ProjectDetail

The code editor is integrated in the "Code" tab of the Project Detail page:

```tsx
import { ProjectCodeEditor } from "@/components/project/ProjectCodeEditor"

// In ProjectDetail.tsx tabs configuration:
{
  key: "code",
  label: "Code",
  content: (
    <ProjectCodeEditor
      project={project}
      onEditInDesigner={() => navigate(`/projects/${project.id}/editor`)}
    />
  ),
}
```

## Styling Features

- **Dark Theme Editor:** Uses `vs-dark` Monaco theme for better readability
- **File Explorer:** Dark sidebar (bg-gray-800) with hover states
- **Status Bar:** Shows file info (language, encoding, lines, size)
- **Toolbar:** Action buttons with consistent styling
- **Responsive:** Works on mobile with scrollable panels

## Performance Optimizations

1. **Memoization:** `CodeEditor` uses `React.memo` to prevent unnecessary re-renders
2. **Lazy Loading:** File content loads only when selected
3. **Debouncing:** Potential integration with auto-save (30s debounce)
4. **Local Storage:** Can be enhanced to cache file states

## Backend Requirements

To fully enable file management, implement these API endpoints:

```
GET    /api/projects/{projectId}/files
GET    /api/projects/{projectId}/files/content?path={path}
POST   /api/projects/{projectId}/files/save
GET    /api/projects/{projectId}/files/download?path={path}
PUT    /api/projects/{projectId}/files/{filePath}
DELETE /api/projects/{projectId}/files/{filePath}
```

## Future Enhancements

- [ ] Git integration for version control
- [ ] Collaborative editing with WebSockets
- [ ] Diff view for changes
- [ ] Code formatting with terraform fmt
- [ ] Syntax validation with terraform validate
- [ ] Code snippets and templates
- [ ] Search across files
- [ ] Multi-file editing with tabs
- [ ] Code review comments
- [ ] Integration with CI/CD pipelines

## Security Considerations

- All API requests include JWT authentication via interceptors
- File content is validated on the backend
- Sensitive variables are marked as such and not exposed
- XSS protection through Monaco Editor's built-in sanitization
- CSRF protection via secure cookies

## Examples

### Full Code Editor Page
```tsx
import { useState } from "react"
import { ProjectCodeEditor } from "@/components/project/ProjectCodeEditor"
import { useProjectStore } from "@/stores/useProjectStore"

export function CodePage({ projectId }) {
  const project = useProjectStore(s => s.getProjectById(projectId))
  
  if (!project) return <div>Project not found</div>
  
  return (
    <div className="h-screen">
      <ProjectCodeEditor
        project={project}
        onEditInDesigner={() => navigateToEditor(projectId)}
      />
    </div>
  )
}
```

### Custom Code Editor
```tsx
import { CodeEditor } from "@/components/ui/CodeEditor"
import { FileExplorer } from "@/components/ui/FileExplorer"

export function CustomEditor() {
  const [selectedFile, setSelectedFile] = useState("main.tf")
  const [code, setCode] = useState("")
  const files = [/* ... */]
  
  return (
    <div className="flex">
      <FileExplorer files={files} onSelectFile={setSelectedFile} />
      <CodeEditor value={code} onChange={setCode} />
    </div>
  )
}
```

## Troubleshooting

### Editor not rendering
- Ensure Monaco Editor is properly installed: `npm ls @monaco-editor/react`
- Check console for errors
- Verify height is set (not auto)

### File explorer not showing
- Verify `files` prop is an array
- Check paths don't contain special characters
- Ensure at least one file exists

### Changes not saving
- Check backend API endpoints are implemented
- Verify auth token is valid
- Check network tab for API errors
- Ensure `onSave` callback is provided if using hook

## Contributing

To extend the code editor:
1. Create new components in `src/components/ui/`
2. Add hooks in `src/hooks/`
3. Update API endpoints in `src/services/api.ts`
4. Add types in `src/types/`
5. Document changes in this README
