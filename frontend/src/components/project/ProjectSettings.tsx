// ─── AWS Credentials Types ───────────────────────────────────────────────

// Removed duplicate import of React hooks
import { useState, useEffect, useMemo, type ChangeEvent, type FormEvent } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Loader2, Lock, RefreshCw, Settings, Shield, Users } from "lucide-react"
import toast from "react-hot-toast"
import useProjectStore from "@/stores/useProjectStore"
import { AWS_REGIONS } from "@/constants/regions"

// ─── Types ─────────────────────────────────────────────────────────────────────

interface FormData {
  name: string
  description: string
  region: string
  environment: string
  visibility: "private" | "public"
  autoDeploy: boolean
}



interface FieldErrors {
  name?: string
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const ENVIRONMENTS = [
  { value: "",            label: "— None —" },
  { value: "production",  label: "Production" },
  { value: "staging",     label: "Staging" },
  { value: "development", label: "Development" },
  { value: "testing",     label: "Testing" },
]

// ─── Primitive helpers ─────────────────────────────────────────────────────────

function SectionCard({ title, icon, children }: {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-5">
        <span className="text-gray-400">{icon}</span>
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      </div>
      {children}
    </div>
  )
}

function FieldError({ message }: { message: string | undefined }) {
  if (!message) return null
  return <p className="mt-1 text-xs text-red-600">{message}</p>
}

function Toggle({ checked, onChange, disabled = false }: {
  checked: boolean
  onChange: (next: boolean) => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? "bg-blue-600" : "bg-gray-200"
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow ring-0 transition-transform ${
          checked ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  )
}

// ─── Modal ─────────────────────────────────────────────────────────────────────

function ConfirmModal({ title, description, dangerous, confirmLabel, onConfirm, onCancel, confirmDisabled, children }: {
  title: string
  description: string
  dangerous?: boolean
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
  confirmDisabled?: boolean
  children?: React.ReactNode
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        <p className="mt-2 text-sm text-gray-600">{description}</p>
        {children && <div className="mt-4">{children}</div>}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={confirmDisabled}
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              dangerous ? "bg-red-600 hover:bg-red-700" : "bg-amber-600 hover:bg-amber-700"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function ProjectSettings() {
  // ── Local form state ──────────────────────────────────────────────────────────
  const blankForm = (): FormData => ({
    name:        "",
    description: "",
    region:      "us-east-1",
    environment: "",
    visibility:  "private",
    autoDeploy:  false,
  })

  const [formData, setFormData] = useState<FormData>(blankForm)
  const [initialData, setInitialData] = useState<FormData>(blankForm)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [modal, setModal] = useState<"archive" | "delete" | null>(null)
  const [deleteInput, setDeleteInput] = useState("")

  // --- Project and store hooks ---
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const project        = useProjectStore((s) => s.projects.find((p) => p.id === projectId))
  const updateProject  = useProjectStore((s) => s.updateProject)
  const archiveProject = useProjectStore((s) => s.archiveProject)
  const deleteProject  = useProjectStore((s) => s.deleteProject)

  // Seed form from store when the project identity changes (mount or navigation).
  // NEVER update the store here — only copy store → local state.
  useEffect(() => {
    if (!project) return
    const seeded: FormData = {
      name:        project.name,
      description: project.description,
      region:      project.region,
      environment: project.environment ?? "",
      visibility:  "private",
      autoDeploy:  false,
    }
    setFormData(seeded)
    setInitialData(seeded)
    setFieldErrors({})
    setFormError(null)
  }, [project?.id])

    // ── Derived state ─────────────────────────────────────────────────────────────
      const isDirty = useMemo(() => (
      formData.name        !== initialData.name        ||
      formData.description !== initialData.description ||
      formData.region      !== initialData.region      ||
      formData.environment !== initialData.environment ||
      formData.visibility  !== initialData.visibility  ||
      formData.autoDeploy  !== initialData.autoDeploy
    ), [formData, initialData])

    const isNameInvalid = formData.name.trim() === ""

    // ── Field helpers ─────────────────────────────────────────────────────────────
    function setField<K extends keyof FormData>(key: K, value: FormData[K]) {
      setFormData((prev) => ({ ...prev, [key]: value }))
      if (key === "name") {
        setFieldErrors((prev) => ({ ...prev, name: undefined }))
      }
    }
  // ...existing code...







  // ── Save ──────────────────────────────────────────────────────────────────────

  async function handleSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (saving || !isDirty) return

    setFormError(null)

    const errors: FieldErrors = {}
    if (formData.name.trim() === "") errors.name = "Project name is required."
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setSaving(true)
    try {
      // TODO: replace setTimeout with real API call when backend /projects/:id is ready
      await new Promise<void>((r) => setTimeout(r, 600))
      updateProject(projectId!, {
        name:        formData.name.trim(),
        description: formData.description.trim(),
        region:      formData.region,
        environment: formData.environment || undefined,
      })
      const saved: FormData = {
        ...formData,
        name:        formData.name.trim(),
        description: formData.description.trim(),
      }
      setInitialData(saved)
      setFormData(saved)
      toast.success("Settings saved.")
    } catch {
      setFormError("Failed to save settings. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  // ── Archive ───────────────────────────────────────────────────────────────────

  function handleArchiveConfirm() {
    if (!projectId) return
    archiveProject(projectId)
    setModal(null)
    toast.success("Project archived.")
    navigate("/dashboard")
  }

  // ── Delete ────────────────────────────────────────────────────────────────────

  function openDeleteModal() {
    setDeleteInput("")
    setModal("delete")
  }

  function handleDeleteConfirm() {
    if (!projectId) return
    deleteProject(projectId)
    setModal(null)
    toast.success("Project deleted.")
    navigate("/dashboard")
  }

  // ── Not found ─────────────────────────────────────────────────────────────────

  if (!project) {
    return (
      <div className="flex items-center justify-center py-24 text-sm text-gray-500">
        Project not found.
      </div>
    )
  }

  const saveDisabled = saving || !isDirty || isNameInvalid

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <>
      <form onSubmit={handleSave} noValidate>
        <div className="max-w-4xl mx-auto py-6 space-y-6">

          {/* ── Save bar ──────────────────────────────────────────────────────── */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {isDirty
                ? <span className="text-amber-600 font-medium">You have unsaved changes.</span>
                : "Manage your project configuration."}
            </p>
            <button
              type="submit"
              disabled={saveDisabled}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>

          {/* Form-level error banner */}
          {formError !== null && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2.5 text-sm">
              {formError}
            </div>
          )}

          {/* ── Section 1: General ────────────────────────────────────────────── */}
          <SectionCard title="General" icon={<Settings className="w-4 h-4" />}>
            <div className="space-y-5">

              <div>
                <label htmlFor="ps-name" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Project name <span className="text-red-500">*</span>
                </label>
                <input
                  id="ps-name"
                  type="text"
                  value={formData.name}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setField("name", e.target.value)}
                  disabled={saving}
                  placeholder="My project"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none disabled:opacity-60 transition-colors"
                />
                <FieldError message={fieldErrors.name} />
              </div>

              <div>
                <label htmlFor="ps-description" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Description <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  id="ps-description"
                  rows={3}
                  value={formData.description}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setField("description", e.target.value)}
                  disabled={saving}
                  placeholder="A short description of this project."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none disabled:opacity-60 transition-colors resize-none"
                />
              </div>

              <div>
                <label htmlFor="ps-region" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Region
                </label>
                <select
                  id="ps-region"
                  value={formData.region}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => setField("region", e.target.value)}
                  disabled={saving}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none bg-white disabled:opacity-60 transition-colors"
                >
                  {AWS_REGIONS.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="ps-env" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Environment
                </label>
                <select
                  id="ps-env"
                  value={formData.environment}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => setField("environment", e.target.value)}
                  disabled={saving}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none bg-white disabled:opacity-60 transition-colors"
                >
                  {ENVIRONMENTS.map((env) => (
                    <option key={env.value} value={env.value}>{env.label}</option>
                  ))}
                </select>
              </div>

            </div>
          </SectionCard>

          {/* ── Section 2: Advanced ───────────────────────────────────────────── */}
          <SectionCard title="Advanced" icon={<RefreshCw className="w-4 h-4" />}>
            <div className="space-y-5">

              {/* Visibility */}
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-700">Visibility</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {formData.visibility === "public"
                      ? "Anyone with the link can view this project's architecture."
                      : "Only team members can access this project."}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-gray-500">
                    {formData.visibility === "public" ? "Public" : "Private"}
                  </span>
                  <Toggle
                    checked={formData.visibility === "public"}
                    onChange={(next) => setField("visibility", next ? "public" : "private")}
                    disabled={saving}
                  />
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* Auto-deploy */}
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-700">Auto-deploy</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Automatically trigger a deploy when the default branch receives a push.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-gray-500">
                    {formData.autoDeploy ? "On" : "Off"}
                  </span>
                  <Toggle
                    checked={formData.autoDeploy}
                    onChange={(next) => setField("autoDeploy", next)}
                    disabled={saving}
                  />
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* Project slug (read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Project identifier
                </label>
                <input
                  type="text"
                  readOnly
                  value={project.id}
                  className="w-full border border-gray-100 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500 outline-none cursor-default select-all"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Read-only. Used in API calls and URL routes.
                </p>
              </div>

            </div>
          </SectionCard>

          {/* ── Section 3: AWS Credentials ───────────────────────────────────── */}
          <SectionCard title="AWS Credentials" icon={<Lock className="w-4 h-4" />}>
              <div className="text-gray-500">AWS Credentials have been removed.</div>
          </SectionCard>

          {/* ── Section 4: Team access (placeholder) ─────────────────────────── */}
          <SectionCard title="Team access" icon={<Users className="w-4 h-4" />}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-sm text-gray-700">Control who can view and manage this project.</p>
                <p className="text-xs text-gray-500 mt-1">
                  Roles: <span className="font-medium">Owner</span>,{" "}
                  <span className="font-medium">Admin</span>,{" "}
                  <span className="font-medium">Viewer</span>. Full RBAC management coming soon.
                </p>
              </div>
              <button
                type="button"
                disabled
                title="Coming soon"
                className="shrink-0 flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-400 cursor-not-allowed"
              >
                <Shield className="w-4 h-4" />
                Manage access
              </button>
            </div>
          </SectionCard>

          {/* ── Section 4: Danger Zone ────────────────────────────────────────── */}
          <div className="bg-white border border-red-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-1">
              <Lock className="w-4 h-4 text-red-500" />
              <h2 className="text-base font-semibold text-red-700">Danger zone</h2>
            </div>
            <p className="text-sm text-gray-500 mb-5">
              These actions are irreversible. Please proceed with caution.
            </p>

            <div className="space-y-4">

              {/* Archive */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border border-gray-200 p-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800">Archive project</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Marks the project as inactive and hides it from active views. Data is preserved.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setModal("archive")}
                  className="shrink-0 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-100 transition-colors"
                >
                  Archive
                </button>
              </div>

              {/* Delete */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border border-red-200 bg-red-50/40 p-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-red-800">Delete project</p>
                  <p className="text-xs text-red-600 mt-0.5">
                    Permanently deletes the project, all infrastructure settings, code, and run history.
                    This cannot be undone.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openDeleteModal}
                  className="shrink-0 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
                >
                  Delete project
                </button>
              </div>

            </div>
          </div>

        </div>
      </form>

      {/* Archive confirmation modal */}
      {modal === "archive" && (
        <ConfirmModal
          title="Archive this project?"
          description={`"${project.name}" will be marked as inactive and hidden from your dashboard. You can restore it later.`}
          confirmLabel="Archive"
          onConfirm={handleArchiveConfirm}
          onCancel={() => setModal(null)}
        />
      )}

      {/* Delete confirmation modal — requires typing project name */}
      {modal === "delete" && (
        <ConfirmModal
          title="Delete this project?"
          description={`This will permanently delete "${project.name}" and all associated data. This action cannot be undone.`}
          dangerous
          confirmLabel="Delete project"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setModal(null)}
          confirmDisabled={deleteInput !== project.name}
        >
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Type <span className="font-bold text-gray-900">{project.name}</span> to confirm:
          </label>
          <input
            type="text"
            value={deleteInput}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setDeleteInput(e.target.value)}
            placeholder={project.name}
            autoFocus
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-200 focus:border-red-400 outline-none"
          />
        </ConfirmModal>
      )}
    </>
  )
}
