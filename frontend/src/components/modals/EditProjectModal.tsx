import { useEffect, useState } from "react"
import { Loader2, X } from "lucide-react"
import useProjectStore from "../../stores/useProjectStore"
import { cn } from "../../utils/cn"

// ─── Static data ──────────────────────────────────────────────────────────────

const REGIONS = [
  { value: "us-east-1",      label: "US East (N. Virginia)" },
  { value: "us-east-2",      label: "US East (Ohio)" },
  { value: "us-west-2",      label: "US West (Oregon)" },
  { value: "eu-west-1",      label: "Europe (Ireland)" },
  { value: "eu-central-1",   label: "Europe (Frankfurt)" },
  { value: "ap-southeast-1", label: "Asia Pacific (Singapore)" },
  { value: "ap-northeast-1", label: "Asia Pacific (Tokyo)" },
  { value: "sa-east-1",      label: "South America (São Paulo)" },
] as const

const ENVIRONMENTS = ["Development", "Staging", "Production"] as const

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormData {
  name: string
  region: string
  environment: string
  description: string
}

interface FormErrors {
  name?: string
}

export interface EditProjectModalProps {
  open: boolean
  projectId: string | null
  onClose: () => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function EditProjectModal({ open, projectId, onClose }: EditProjectModalProps) {
  // Select stable primitives — no side-effects inside selectors
  const project      = useProjectStore((state) => state.projects.find((p) => p.id === projectId))
  const updateProject = useProjectStore((state) => state.updateProject)

  const [formData,   setFormData]   = useState<FormData>({ name: "", region: "us-east-1", environment: "Development", description: "" })
  const [errors,     setErrors]     = useState<FormErrors>({})
  const [isSaving,   setIsSaving]   = useState(false)

  // Sync store → local state when the modal opens or the target project changes.
  // This effect only reads from the store; it never writes back.
  useEffect(() => {
    if (!open || !project) return
    setFormData({
      name:        project.name,
      region:      project.region,
      environment: "Development", // Project type has no environment field; default to Development
      description: project.description ?? "",
    })
    setErrors({})
    setIsSaving(false)
  }, [open, project])

  if (!open || !project) return null

  const patch = (updates: Partial<FormData>) =>
    setFormData((prev) => ({ ...prev, ...updates }))

  const handleSave = () => {
    // Client-side validation — no store access
    const next: FormErrors = {}
    if (!formData.name.trim()) {
      next.name = "Project name is required."
    } else if (formData.name.trim().length < 3) {
      next.name = "Name must be at least 3 characters."
    }
    setErrors(next)
    if (Object.keys(next).length > 0) return

    // Write to store exactly once, from an event handler — never from render
    setIsSaving(true)
    updateProject(project.id, {
      name:        formData.name.trim(),
      description: formData.description,
      region:      formData.region,
      updated_at:  new Date().toISOString(),
    })

    // Simulate async save feel while keeping store update synchronous
    setTimeout(() => {
      setIsSaving(false)
      onClose()
    }, 400)
  }

  const handleOverlayClick = () => {
    if (!isSaving) onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4"
      onClick={handleOverlayClick}
    >
      <div
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          disabled={isSaving}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-40"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Edit Project</h2>

        <div className="space-y-5">
          {/* Project Name */}
          <div>
            <label htmlFor="ep-name" className="block text-sm font-medium text-gray-700 mb-1.5">
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              id="ep-name"
              type="text"
              value={formData.name}
              onChange={(e) => patch({ name: e.target.value })}
              placeholder="e.g. production-network"
              className={cn(
                "w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                errors.name ? "border-red-400 bg-red-50" : "border-gray-300 bg-white"
              )}
            />
            {errors.name && <p className="mt-1.5 text-xs text-red-600">{errors.name}</p>}
          </div>

          {/* Region */}
          <div>
            <label htmlFor="ep-region" className="block text-sm font-medium text-gray-700 mb-1.5">
              AWS Region
            </label>
            <select
              id="ep-region"
              value={formData.region}
              onChange={(e) => patch({ region: e.target.value })}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {REGIONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          {/* Environment */}
          <div>
            <label htmlFor="ep-env" className="block text-sm font-medium text-gray-700 mb-1.5">
              Environment
            </label>
            <select
              id="ep-env"
              value={formData.environment}
              onChange={(e) => patch({ environment: e.target.value })}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {ENVIRONMENTS.map((env) => (
                <option key={env} value={env}>{env}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="ep-description" className="block text-sm font-medium text-gray-700 mb-1.5">
              Description <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <div className="relative">
              <textarea
                id="ep-description"
                rows={4}
                maxLength={200}
                value={formData.description}
                onChange={(e) => patch({ description: e.target.value })}
                placeholder="Describe what this infrastructure does..."
                className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="pointer-events-none absolute bottom-2 right-3 text-xs text-gray-400">
                {formData.description.length}/200
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className={cn(
              "flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-medium text-white transition-colors",
              isSaving ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            )}
          >
            {isSaving && <Loader2 size={14} className="animate-spin" />}
            {isSaving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  )
}
