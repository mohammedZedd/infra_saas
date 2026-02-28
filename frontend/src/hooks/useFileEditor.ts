import { useState, useCallback, useRef } from "react"

interface FileState {
  path: string
  content: string
  language: string
}

export function useFileEditor(initialFile?: FileState) {
  const [currentFile, setCurrentFile] = useState<FileState | null>(
    initialFile || null
  )
  const [isDirty, setIsDirty] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const originalContentRef = useRef<string>("")

  const loadFile = useCallback((path: string, content: string, language = "hcl") => {
    setCurrentFile({ path, content, language })
    originalContentRef.current = content
    setIsDirty(false)
  }, [])

  const updateContent = useCallback((newContent: string) => {
    if (!currentFile) return
    setCurrentFile((prev) => prev ? { ...prev, content: newContent } : null)
    setIsDirty(newContent !== originalContentRef.current)
  }, [currentFile])

  const saveFile = useCallback(async (onSave?: (content: string) => Promise<void>) => {
    if (!currentFile || !isDirty) return

    try {
      setIsSaving(true)
      if (onSave) {
        await onSave(currentFile.content)
      }
      originalContentRef.current = currentFile.content
      setIsDirty(false)
    } finally {
      setIsSaving(false)
    }
  }, [currentFile, isDirty])

  const resetContent = useCallback(() => {
    if (!currentFile) return
    setCurrentFile((prev) => 
      prev ? { ...prev, content: originalContentRef.current } : null
    )
    setIsDirty(false)
  }, [currentFile])

  const downloadFile = useCallback(() => {
    if (!currentFile) return

    const element = document.createElement("a")
    element.setAttribute(
      "href",
      `data:text/plain;charset=utf-8,${encodeURIComponent(
        currentFile.content
      )}`
    )
    element.setAttribute("download", currentFile.path.split("/").pop() || "file")
    element.style.display = "none"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }, [currentFile])

  const copyToClipboard = useCallback(async () => {
    if (!currentFile) return
    await navigator.clipboard.writeText(currentFile.content)
  }, [currentFile])

  return {
    currentFile,
    isDirty,
    isSaving,
    loadFile,
    updateContent,
    saveFile,
    resetContent,
    downloadFile,
    copyToClipboard,
  }
}

export default useFileEditor
