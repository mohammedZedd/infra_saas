# Code Editor - Quick Start Guide

Get started using the new code editor components in CloudForge in 5 minutes.

## Table of Contents
1. [Basic Usage](#basic-usage)
2. [Common Patterns](#common-patterns)
3. [API Integration](#api-integration)
4. [Troubleshooting](#troubleshooting)

## Basic Usage

### 1. Using ProjectCodeEditor (Simplest)

This is already integrated in the Project Detail page! Just navigate to any project and click the "Code" tab.

```tsx
// This is already done in ProjectDetail.tsx
<ProjectCodeEditor
  project={project}
  onEditInDesigner={() => navigate(`/projects/${project.id}/editor`)}
/>
```

### 2. Using CodeEditor Component Only

```tsx
import { useState } from "react"
import { CodeEditor } from "@/components/ui/CodeEditor"

export function MyEditor() {
  const [code, setCode] = useState("resource \"aws_s3_bucket\" \"example\" {\n}")

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

### 3. Using FileExplorer + CodeEditor

```tsx
import { useState } from "react"
import { CodeEditor } from "@/components/ui/CodeEditor"
import { FileExplorer, type FileNode } from "@/components/ui/FileExplorer"

export function FileBrowser() {
  const [selectedFile, setSelectedFile] = useState("main.tf")
  const [fileContents, setFileContents] = useState({
    "main.tf": "# Terraform code here",
    "variables.tf": "# Variables here",
  })

  const files: FileNode[] = [
    {
      name: "main.tf",
      path: "main.tf",
      type: "file",
      language: "hcl",
    },
    {
      name: "variables.tf",
      path: "variables.tf",
      type: "file",
      language: "hcl",
    },
  ]

  return (
    <div className="flex gap-4">
      <div className="w-48">
        <FileExplorer
          files={files}
          onSelectFile={setSelectedFile}
          selectedPath={selectedFile}
        />
      </div>
      <div className="flex-1">
        <CodeEditor
          value={fileContents[selectedFile] || ""}
          language="hcl"
          theme="dark"
          height="500px"
          onChange={(value) =>
            setFileContents({ ...fileContents, [selectedFile]: value })
          }
        />
      </div>
    </div>
  )
}
```

### 4. Using useFileEditor Hook

```tsx
import { useFileEditor } from "@/hooks/useFileEditor"
import { CodeEditor } from "@/components/ui/CodeEditor"
import { Button } from "@/components/ui/Button"

export function FileEditor() {
  const {
    currentFile,
    isDirty,
    updateContent,
    saveFile,
    downloadFile,
    copyToClipboard,
  } = useFileEditor({
    path: "main.tf",
    content: "# Initial content",
    language: "hcl",
  })

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          onClick={() => copyToClipboard()}
          disabled={!currentFile}
        >
          Copy
        </Button>
        <Button
          onClick={() => downloadFile()}
          disabled={!currentFile}
        >
          Download
        </Button>
        <Button
          onClick={() => saveFile()}
          disabled={!isDirty}
        >
          Save
        </Button>
      </div>

      {currentFile && (
        <CodeEditor
          value={currentFile.content}
          language={currentFile.language}
          onChange={updateContent}
        />
      )}
    </div>
  )
}
```

## Common Patterns

### Pattern 1: Editor with Save Button

```tsx
import { useState } from "react"
import { CodeEditor } from "@/components/ui/CodeEditor"
import { Button } from "@/components/ui/Button"
import toast from "react-hot-toast"

export function EditorWithSave() {
  const [code, setCode] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  async function handleSave() {
    setIsSaving(true)
    try {
      // Call your API here
      // await saveFileAPI(code)
      toast.success("Saved!")
    } catch (error) {
      toast.error("Failed to save")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <Button onClick={handleSave} disabled={isSaving}>
        {isSaving ? "Saving..." : "Save"}
      </Button>
      <CodeEditor value={code} onChange={setCode} theme="dark" />
    </>
  )
}
```

### Pattern 2: Read-Only Code Display

```tsx
<CodeEditor
  value={readOnlyCode}
  language="hcl"
  theme="dark"
  readOnly={true}
  label="Generated Terraform Code"
/>
```

### Pattern 3: Multi-File Editor

```tsx
import { useState } from "react"
import { FileExplorer, type FileNode } from "@/components/ui/FileExplorer"
import { CodeEditor } from "@/components/ui/CodeEditor"

const FILES: { [key: string]: { content: string; language: string } } = {
  "main.tf": { content: "resource ...", language: "hcl" },
  "variables.tf": { content: "variable ...", language: "hcl" },
  "outputs.tf": { content: "output ...", language: "hcl" },
  "package.json": { content: "{...}", language: "json" },
}

export function MultiFileEditor() {
  const [selected, setSelected] = useState("main.tf")

  const fileNodes: FileNode[] = Object.entries(FILES).map(([path]) => ({
    name: path,
    path,
    type: "file",
    language: FILES[path].language,
  }))

  return (
    <div className="flex">
      <FileExplorer
        files={fileNodes}
        onSelectFile={setSelected}
        selectedPath={selected}
        className="w-56"
      />
      <CodeEditor
        value={FILES[selected].content}
        language={FILES[selected].language}
        className="flex-1"
      />
    </div>
  )
}
```

### Pattern 4: Diff/Compare View (Future)

```tsx
// Coming soon: Side-by-side diff view
<div className="flex gap-4">
  <div className="flex-1">
    <h3>Original</h3>
    <CodeEditor value={originalCode} readOnly theme="light" />
  </div>
  <div className="flex-1">
    <h3>Modified</h3>
    <CodeEditor value={modifiedCode} readOnly theme="light" />
  </div>
</div>
```

## API Integration

### Fetching and Editing Files

```tsx
import { useEffect, useState } from "react"
import { listProjectFiles, getFileContent, saveFile } from "@/services/api"
import { CodeEditor } from "@/components/ui/CodeEditor"
import { FileExplorer, type FileNode } from "@/components/ui/FileExplorer"

export function ProjectEditor({ projectId }: { projectId: string }) {
  const [files, setFiles] = useState<FileNode[]>([])
  const [selectedFile, setSelectedFile] = useState<string>("")
  const [content, setContent] = useState("")

  // Load files
  useEffect(() => {
    listProjectFiles(projectId).then((data) => {
      setFiles(data.files)
    })
  }, [projectId])

  // Load file content
  useEffect(() => {
    if (!selectedFile) return

    getFileContent(projectId, selectedFile)
      .then((data) => {
        setContent(data.content)
      })
      .catch((error) => console.error(error))
  }, [selectedFile, projectId])

  // Save file
  async function handleSave() {
    try {
      await saveFile(projectId, selectedFile, content, "Updated file")
      console.log("Saved!")
    } catch (error) {
      console.error("Save failed:", error)
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="p-4">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Save
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <FileExplorer
          files={files}
          onSelectFile={setSelectedFile}
          selectedPath={selectedFile}
          className="w-56"
        />
        <CodeEditor
          value={content}
          onChange={setContent}
          className="flex-1"
        />
      </div>
    </div>
  )
}
```

## Troubleshooting

### Issue: Editor not showing

**Solution:**
1. Ensure `height` prop is set (not `auto`)
2. Check parent container has defined height
3. Verify Monaco Editor is installed: `npm ls @monaco-editor/react`

```tsx
// ❌ Wrong
<CodeEditor value={code} />

// ✅ Correct
<CodeEditor value={code} height="500px" />
```

### Issue: Can't copy code

**Solution:**
```tsx
// Using clipboard API directly
text="Copy"
onClick={() => navigator.clipboard.writeText(code)}
```

### Issue: Large files are slow

**Solution:**
1. Use `readOnly` for large files
2. Implement code splitting
3. Virtualize large file trees

```tsx
<CodeEditor value={largeCode} readOnly theme="dark" />
```

### Issue: File explorer not expanding

**Solution:**
```tsx
// Ensure children array exists
const files: FileNode[] = [
  {
    name: "folder",
    path: "folder",
    type: "folder",
    children: [], // Must have this
  },
]
```

### Issue: Theme not applying

**Solution:**
```tsx
// Use correct color values
<CodeEditor theme="dark" /> // vs-dark
<CodeEditor theme="light" /> // vs
```

## Tips & Tricks

### 1. Custom Editor Options
```tsx
<CodeEditor
  value={code}
  options={{
    fontSize: 14,
    fontFamily: "'Fira Code', monospace",
    tabSize: 4,
    wordWrap: "on",
    minimap: { enabled: false },
  }}
/>
```

### 2. Syntax Highlighting for Custom Languages
```tsx
// HCL is already supported
// For custom languages:
<CodeEditor language="terraform" value={code} />
```

### 3. Keyboard Shortcuts
- `Ctrl/Cmd + S` - Save (if implemented)
- `Ctrl/Cmd + /` - Toggle comment
- `Alt + Shift + F` - Format document
- `Ctrl/Cmd + F` - Find
- `Ctrl/Cmd + H` - Find and replace

### 4. Integration with Forms
```tsx
import { useForm, Controller } from "react-hook-form"
import { CodeEditor } from "@/components/ui/CodeEditor"

export function CodeForm() {
  const { control } = useForm()

  return (
    <Controller
      name="terraformCode"
      control={control}
      render={({ field }) => <CodeEditor {...field} />}
    />
  )
}
```

## Performance Best Practices

1. **Memoize large code blocks:**
   ```tsx
   const code = useMemo(() => generateCode(data), [data])
   ```

2. **Lazy load file content:**
   ```tsx
   useEffect(() => {
     if (selectedFile) {
       loadFile(selectedFile)
     }
   }, [selectedFile])
   ```

3. **Debounce onChange:**
   ```tsx
   const debouncedOnChange = useCallback(
     debounce((value) => setCode(value), 300),
     []
   )
   ```

## Next Steps

- ✅ Explored examples and patterns
- ➡️ Integrate with your backend API
- ➡️ Add auto-save functionality
- ➡️ Implement syntax validation
- ➡️ Add code snippets/templates

## Need Help?

- Check `CODE_EDITOR_GUIDE.md` for full reference
- Read component source code for props
- See `ProjectDetail.tsx` for real example
- Check `useFileEditor.ts` for hook usage

Happy coding! 🚀
