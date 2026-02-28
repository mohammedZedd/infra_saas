import { useEffect, useRef } from "react"
import useEditorStore from "../stores/useEditorStore"

/**
 * Automatically saves the canvas at a regular interval when there are unsaved changes.
 * Also fires the save callback before the user navigates away (beforeunload).
 *
 * @param onSave - Async or sync callback that persists the canvas data.
 * @param intervalMs - How often to check and auto-save, in milliseconds. Default 30 000 (30 s).
 */
export function useAutoSave(
  onSave: () => void | Promise<void>,
  intervalMs = 30_000
): void {
  const isDirty = useEditorStore((s) => s.isDirty)
  const markSaved = useEditorStore((s) => s.markSaved)

  // Keep a stable ref to onSave so the interval closure always uses the latest version.
  const onSaveRef = useRef(onSave)
  useEffect(() => {
    onSaveRef.current = onSave
  }, [onSave])

  // Keep a ref to isDirty so the beforeunload handler can read it synchronously.
  const isDirtyRef = useRef(isDirty)
  useEffect(() => {
    isDirtyRef.current = isDirty
  }, [isDirty])

  // Periodic auto-save
  useEffect(() => {
    const timer = setInterval(async () => {
      if (!isDirtyRef.current) return
      try {
        await onSaveRef.current()
        markSaved()
      } catch {
        // Silently ignore save errors — the dirty flag remains set.
      }
    }, intervalMs)

    return () => clearInterval(timer)
  }, [intervalMs, markSaved])

  // Save before the user navigates away
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent): string | undefined {
      if (!isDirtyRef.current) return undefined
      // Fire save (best-effort, async won't complete but this is standard pattern)
      void onSaveRef.current()
      // Show the browser's "Leave site?" confirmation dialog
      e.preventDefault()
      const msg = "You have unsaved changes. Are you sure you want to leave?"
      e.returnValue = msg
      return msg
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [])
}

export default useAutoSave

