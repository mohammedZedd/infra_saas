import { Copy, Download, RotateCcw, Save, Share2, Zap } from "lucide-react"
import { Button } from "./Button"

interface EditorToolbarProps {
  onSave?: () => void
  onCopy?: () => void
  onDownload?: () => void
  onShare?: () => void
  onEditInDesigner?: () => void
  onReset?: () => void
  isSaving?: boolean
  isDirty?: boolean
}

export function EditorToolbar({
  onSave,
  onCopy,
  onDownload,
  onShare,
  onEditInDesigner,
  onReset,
  isSaving = false,
  isDirty = false,
}: EditorToolbarProps) {
  return (
    <div className="flex items-center gap-2">
      {onCopy && (
        <Button
          size="sm"
          variant="outline"
          leftIcon={Copy}
          onClick={onCopy}
        >
          Copy
        </Button>
      )}

      {onDownload && (
        <Button
          size="sm"
          variant="outline"
          leftIcon={Download}
          onClick={onDownload}
        >
          Download
        </Button>
      )}

      {onShare && (
        <Button
          size="sm"
          variant="outline"
          leftIcon={Share2}
          onClick={onShare}
        >
          Share
        </Button>
      )}

      {onReset && (
        <Button
          size="sm"
          variant="outline"
          leftIcon={RotateCcw}
          onClick={onReset}
        >
          Reset
        </Button>
      )}

      {onEditInDesigner && (
        <Button
          size="sm"
          variant="primary"
          leftIcon={Zap}
          onClick={onEditInDesigner}
        >
          Edit in Designer
        </Button>
      )}

      {onSave && (
        <Button
          size="sm"
          variant="primary"
          leftIcon={Save}
          onClick={onSave}
          disabled={isSaving || !isDirty}
        >
          {isSaving ? "Saving..." : "Save"}
        </Button>
      )}
    </div>
  )
}

export default EditorToolbar
