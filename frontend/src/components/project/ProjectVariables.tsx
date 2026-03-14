import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plus,
  Pencil,
  Trash2,
  Lock,
  Info,
  Braces,
  X,
  ChevronDown,
  Copy,
  Check,
} from "lucide-react"

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

interface TerraformVariable {
  id: string
  name: string
  type: "string" | "number" | "bool" | "list" | "map"
  value: string
  default: string
  description: string
  sensitive: boolean
  required: boolean
}

type VarType = TerraformVariable["type"]

interface FormState {
  name: string
  type: VarType
  value: string
  default: string
  description: string
  sensitive: boolean
  required: boolean
}

interface FormErrors {
  name?: string
  value?: string
  default?: string
}

// ═══════════════════════════════════════════════════════════════
// SEED DATA
// ═══════════════════════════════════════════════════════════════

const SEED_VARIABLES: TerraformVariable[] = [
  {
    id: "1",
    name: "aws_region",
    type: "string",
    value: "us-east-1",
    default: "us-east-1",
    description: "AWS region to deploy resources into",
    sensitive: false,
    required: false,
  },
  {
    id: "2",
    name: "instance_type",
    type: "string",
    value: "t3.micro",
    default: "t3.micro",
    description: "EC2 instance type",
    sensitive: false,
    required: false,
  },
  {
    id: "3",
    name: "db_password",
    type: "string",
    value: "s3cur3P@ss!",
    default: "",
    description: "RDS master password",
    sensitive: true,
    required: true,
  },
  {
    id: "4",
    name: "enable_https",
    type: "bool",
    value: "true",
    default: "true",
    description: "Enable HTTPS on the load balancer",
    sensitive: false,
    required: false,
  },
]

const EMPTY_FORM: FormState = {
  name: "",
  type: "string",
  value: "",
  default: "",
  description: "",
  sensitive: false,
  required: false,
}

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

function getPlaceholder(type: VarType): string {
  switch (type) {
    case "string":
      return 'e.g. "t3.micro"'
    case "number":
      return "e.g. 8080"
    case "bool":
      return "true or false"
    case "list":
      return '["us-east-1", "us-west-2"]'
    case "map":
      return '{ key = "value" }'
  }
}

function validateName(
  name: string,
  existing: TerraformVariable[],
  editingId?: string
): string | undefined {
  if (!name) return "Name is required"
  if (/^\d/.test(name)) return "Cannot start with a number"
  if (!/^[a-z_][a-z0-9_]*$/.test(name))
    return "Lowercase letters, numbers, and underscores only"
  const duplicate = existing.find((v) => v.name === name && v.id !== editingId)
  if (duplicate) return "A variable with this name already exists"
  return undefined
}

function validateValue(value: string, type: VarType): string | undefined {
  if (!value) return undefined
  if (type === "bool" && value !== "true" && value !== "false")
    return 'Must be "true" or "false"'
  if (type === "number" && isNaN(Number(value))) return "Must be a valid number"
  return undefined
}

function generateVariablesTf(variables: TerraformVariable[]): string {
  return variables
    .map((v) => {
      const lines: string[] = [`variable "${v.name}" {`]
      lines.push(`  type        = ${v.type}`)
      if (v.default && !v.required) {
        const quoted = v.type === "string" ? `"${v.default}"` : v.default
        lines.push(`  default     = ${quoted}`)
      }
      if (v.description) lines.push(`  description = "${v.description}"`)
      if (v.sensitive) lines.push(`  sensitive   = true`)
      lines.push("}")
      return lines.join("\n")
    })
    .join("\n\n")
}

function generateTfvars(variables: TerraformVariable[]): string {
  const active = variables.filter((v) => !v.required && v.value)
  if (!active.length) return "# No default variable values defined"
  const maxLen = Math.max(...active.map((v) => v.name.length))
  return active
    .map((v) => {
      const padding = " ".repeat(maxLen - v.name.length)
      let val = v.value
      if (v.type === "string") val = `"${v.value}"`
      return `${v.name}${padding} = ${val}`
    })
    .join("\n")
}

// ═══════════════════════════════════════════════════════════════
// TOGGLE SWITCH
// ═══════════════════════════════════════════════════════════════

function Toggle({
  checked,
  onChange,
  label,
  sublabel,
  id,
}: {
  checked: boolean
  onChange: (val: boolean) => void
  label: string
  sublabel: string
  id: string
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <label
          htmlFor={id}
          className="text-sm font-medium text-black cursor-pointer"
        >
          {label}
        </label>
        <p className="text-xs text-neutral-500 mt-0.5">{sublabel}</p>
      </div>
      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative flex-shrink-0 w-10 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 ${
          checked ? "bg-black" : "bg-neutral-200"
        }`}
      >
        <span
          className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
            checked ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// COPY BUTTON
// ═══════════════════════════════════════════════════════════════

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      aria-label="Copy to clipboard"
      className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition px-2 py-1 rounded border border-neutral-700 hover:border-neutral-500"
    >
      {copied ? (
        <>
          <Check className="h-3 w-3" />
          Copied!
        </>
      ) : (
        <>
          <Copy className="h-3 w-3" />
          Copy
        </>
      )}
    </button>
  )
}

// ═══════════════════════════════════════════════════════════════
// TERRAFORM PREVIEW
// ═══════════════════════════════════════════════════════════════

function TerraformPreview({ variables }: { variables: TerraformVariable[] }) {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<
    "variables.tf" | "terraform.tfvars"
  >("variables.tf")

  const varsTf = generateVariablesTf(variables)
  const tfvars = generateTfvars(variables)
  const content = activeTab === "variables.tf" ? varsTf : tfvars

  return (
    <div className="border border-neutral-100 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-neutral-50 hover:bg-neutral-100 transition text-left"
        aria-expanded={open}
      >
        <span className="text-sm font-semibold text-black">
          Generated Terraform
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-4 w-4 text-neutral-500" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            {/* Tab bar */}
            <div className="flex items-center justify-between border-b border-neutral-100 px-4 pt-3 pb-0 bg-white">
              <div className="flex gap-4">
                {(
                  ["variables.tf", "terraform.tfvars"] as const
                ).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`text-xs font-mono font-semibold pb-2 border-b-2 transition ${
                      activeTab === tab
                        ? "border-black text-black"
                        : "border-transparent text-neutral-400 hover:text-black"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Code block */}
            <div className="bg-neutral-950 p-4 relative">
              <div className="absolute top-3 right-3">
                <CopyButton text={content} />
              </div>
              <pre className="text-xs text-neutral-300 font-mono overflow-auto whitespace-pre-wrap max-h-72 pr-20">
                {content || "# No variables defined yet"}
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// ADD / EDIT MODAL
// ═══════════════════════════════════════════════════════════════

interface ModalProps {
  variables: TerraformVariable[]
  editingVar: TerraformVariable | null
  onClose: () => void
  onSave: (form: FormState) => void
}

function VariableModal({ variables, editingVar, onClose, onSave }: ModalProps) {
  const [form, setForm] = useState<FormState>(
    editingVar
      ? {
          name: editingVar.name,
          type: editingVar.type,
          value: editingVar.value,
          default: editingVar.default,
          description: editingVar.description,
          sensitive: editingVar.sensitive,
          required: editingVar.required,
        }
      : EMPTY_FORM
  )
  const [errors, setErrors] = useState<FormErrors>({})
  const [saving, setSaving] = useState(false)
  const firstInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const t = setTimeout(() => firstInputRef.current?.focus(), 60)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onClose])

  const set = <K extends keyof FormState>(key: K, val: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: val }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const validate = (): boolean => {
    const errs: FormErrors = {}
    const nameErr = validateName(form.name, variables, editingVar?.id)
    if (nameErr) errs.name = nameErr
    const valueErr = validateValue(form.value, form.type)
    if (valueErr) errs.value = valueErr
    const defaultErr = validateValue(form.default, form.type)
    if (defaultErr) errs.default = defaultErr
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    await new Promise((r) => setTimeout(r, 300))
    onSave(form)
    setSaving(false)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-2xl border border-neutral-200 shadow-xl w-full max-w-lg max-h-[90vh] overflow-auto"
        role="dialog"
        aria-modal="true"
        aria-label={editingVar ? "Edit variable" : "Add variable"}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <h2 className="text-base font-semibold text-black">
            {editingVar ? "Edit Variable" : "Add Variable"}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg hover:bg-neutral-100 transition"
          >
            <X className="h-4 w-4 text-neutral-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5" noValidate>
          {/* Name */}
          <div>
            <label
              className="block text-sm font-medium text-black mb-1"
              htmlFor="var-name"
            >
              Name <span className="text-red-500">*</span>
            </label>
            <input
              ref={firstInputRef}
              id="var-name"
              type="text"
              value={form.name}
              onChange={(e) =>
                set("name", e.target.value.toLowerCase().replace(/\s/g, "_"))
              }
              placeholder="e.g. instance_type"
              autoComplete="off"
              className={`w-full border rounded-lg px-3 py-2 text-sm font-mono text-black placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black transition ${
                errors.name ? "border-red-300" : "border-neutral-200"
              }`}
            />
            {errors.name ? (
              <p className="mt-1 text-xs text-red-500">{errors.name}</p>
            ) : (
              <p className="mt-1 text-xs text-neutral-400">
                Referenced as{" "}
                <code className="font-mono">var.{form.name || "name"}</code> in
                Terraform
              </p>
            )}
          </div>

          {/* Type */}
          <div>
            <label
              className="block text-sm font-medium text-black mb-1"
              htmlFor="var-type"
            >
              Type
            </label>
            <select
              id="var-type"
              value={form.type}
              onChange={(e) => set("type", e.target.value as VarType)}
              className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm text-black bg-white focus:outline-none focus:ring-2 focus:ring-black transition"
            >
              <option value="string">string</option>
              <option value="number">number</option>
              <option value="bool">bool</option>
              <option value="list">list</option>
              <option value="map">map</option>
            </select>
          </div>

          {/* Default Value */}
          <div>
            <label
              className="block text-sm font-medium text-black mb-1"
              htmlFor="var-default"
            >
              Default Value
            </label>
            <input
              id="var-default"
              type={form.sensitive ? "password" : "text"}
              value={form.required ? "" : form.default}
              onChange={(e) => set("default", e.target.value)}
              disabled={form.required}
              placeholder={
                form.required
                  ? "Disabled when required"
                  : getPlaceholder(form.type)
              }
              autoComplete="off"
              className={`w-full border rounded-lg px-3 py-2 text-sm font-mono text-black placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black transition disabled:opacity-40 disabled:cursor-not-allowed ${
                errors.default ? "border-red-300" : "border-neutral-200"
              }`}
            />
            {errors.default && (
              <p className="mt-1 text-xs text-red-500">{errors.default}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label
              className="block text-sm font-medium text-black mb-1"
              htmlFor="var-description"
            >
              Description
            </label>
            <textarea
              id="var-description"
              rows={2}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="What is this variable used for?"
              className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm text-black placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black transition resize-none"
            />
          </div>

          {/* Sensitive toggle */}
          <Toggle
            id="var-sensitive"
            label="Sensitive"
            sublabel="Value will be masked and never shown in logs"
            checked={form.sensitive}
            onChange={(val) => set("sensitive", val)}
          />

          {/* Required toggle */}
          <Toggle
            id="var-required"
            label="Required"
            sublabel="No default value — must be provided at deploy time"
            checked={form.required}
            onChange={(val) => {
              set("required", val)
              if (val) set("default", "")
            }}
          />

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium border border-neutral-200 rounded-lg hover:bg-neutral-50 text-black transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-medium bg-black text-white rounded-lg hover:bg-neutral-800 transition disabled:opacity-60 flex items-center gap-2"
            >
              {saving && (
                <svg
                  className="animate-spin h-3.5 w-3.5 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
              )}
              Save Variable
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// TABLE ROW CELLS
// ═══════════════════════════════════════════════════════════════

function VariableRowCells({
  variable: v,
  onEdit,
  onDelete,
}: {
  variable: TerraformVariable
  onEdit: () => void
  onDelete: () => void
}) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <>
      {/* Name */}
      <td className="px-4 py-3">
        <span className="font-mono text-sm text-black font-medium">{v.name}</span>
      </td>

      {/* Type */}
      <td className="px-4 py-3">
        <span className="border border-neutral-200 rounded px-2 py-0.5 text-xs text-neutral-600 font-mono">
          {v.type}
        </span>
      </td>

      {/* Default */}
      <td className="px-4 py-3">
        <span className="text-sm text-neutral-500 font-mono">
          {v.required ? (
            <span className="text-neutral-300 italic">—</span>
          ) : v.sensitive ? (
            "••••••••"
          ) : v.default ? (
            v.default
          ) : (
            <span className="text-neutral-300 italic">—</span>
          )}
        </span>
      </td>

      {/* Description */}
      <td className="px-4 py-3 max-w-48">
        <span className="text-sm text-neutral-400 truncate block">
          {v.description || <span className="italic">—</span>}
        </span>
      </td>

      {/* Sensitive */}
      <td className="px-4 py-3 text-center">
        {v.sensitive && (
          <Lock
            className="h-3.5 w-3.5 text-neutral-400 mx-auto"
            aria-label="Sensitive"
          />
        )}
      </td>

      {/* Required */}
      <td className="px-4 py-3">
        {v.required && (
          <span className="border border-neutral-200 rounded px-2 py-0.5 text-xs text-neutral-600">
            required
          </span>
        )}
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <AnimatePresence mode="wait">
          {confirmDelete ? (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2 justify-end"
            >
              <span className="text-xs text-neutral-600 whitespace-nowrap">
                Delete{" "}
                <span className="font-mono font-semibold">{v.name}</span>?
              </span>
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-xs px-2 py-1 border border-neutral-200 rounded hover:bg-neutral-50 text-neutral-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={onDelete}
                className="text-xs px-2 py-1 bg-black text-white rounded hover:bg-neutral-800 transition"
              >
                Delete
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="actions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              className="flex items-center gap-1 justify-end"
            >
              <button
                onClick={onEdit}
                aria-label={`Edit ${v.name}`}
                className="p-1.5 rounded hover:bg-neutral-100 text-neutral-500 hover:text-black transition"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setConfirmDelete(true)}
                aria-label={`Delete ${v.name}`}
                className="p-1.5 rounded hover:bg-neutral-100 text-neutral-500 hover:text-black transition"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </td>
    </>
  )
}

// ═══════════════════════════════════════════════════════════════
// EMPTY STATE
// ═══════════════════════════════════════════════════════════════

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="w-14 h-14 rounded-2xl border border-neutral-100 bg-neutral-50 flex items-center justify-center mb-4">
        <Braces className="h-6 w-6 text-neutral-400" />
      </div>
      <h3 className="text-base font-semibold text-black mb-1">
        No variables yet
      </h3>
      <p className="text-sm text-neutral-500 max-w-sm mb-6">
        Add variables to make your Terraform code reusable and
        environment-agnostic.
      </p>
      <button
        onClick={onAdd}
        className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition"
      >
        <Plus className="h-4 w-4" />
        Add your first variable
      </button>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function ProjectVariables() {
  const [variables, setVariables] = useState<TerraformVariable[]>(SEED_VARIABLES)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingVar, setEditingVar] = useState<TerraformVariable | null>(null)

  const openAdd = useCallback(() => {
    setEditingVar(null)
    setModalOpen(true)
  }, [])

  const openEdit = useCallback((v: TerraformVariable) => {
    setEditingVar(v)
    setModalOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setModalOpen(false)
    setEditingVar(null)
  }, [])

  const handleSave = useCallback(
    (form: FormState) => {
      if (editingVar) {
        setVariables((prev) =>
          prev.map((v) =>
            v.id === editingVar.id
              ? { ...v, ...form, default: form.required ? "" : form.default }
              : v
          )
        )
      } else {
        const newVar: TerraformVariable = {
          id: generateId(),
          ...form,
          default: form.required ? "" : form.default,
        }
        setVariables((prev) => [...prev, newVar])
      }
      closeModal()
    },
    [editingVar, closeModal]
  )

  const handleDelete = useCallback((id: string) => {
    setVariables((prev) => prev.filter((v) => v.id !== id))
  }, [])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-black">Variables</h2>
          <p className="text-sm text-neutral-500 mt-0.5">
            {variables.length} variable{variables.length !== 1 && "s"} defined
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-3 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition"
        >
          <Plus className="h-4 w-4" />
          Add Variable
        </button>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg">
        <Info className="h-4 w-4 text-neutral-400 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-neutral-500 leading-relaxed">
          Variables are injected into{" "}
          <code className="font-mono text-xs bg-neutral-100 px-1 py-0.5 rounded">
            variables.tf
          </code>{" "}
          and{" "}
          <code className="font-mono text-xs bg-neutral-100 px-1 py-0.5 rounded">
            terraform.tfvars
          </code>{" "}
          when your Terraform code is generated.
        </p>
      </div>

      {/* Table or empty state */}
      {variables.length === 0 ? (
        <div className="border border-neutral-100 rounded-xl bg-white">
          <EmptyState onAdd={openAdd} />
        </div>
      ) : (
        <div className="border border-neutral-100 rounded-xl bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50">
                  <th className="px-4 py-2.5 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                    Name
                  </th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                    Type
                  </th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                    Default
                  </th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                    Description
                  </th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-neutral-500 uppercase tracking-wide text-center">
                    Sensitive
                  </th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                    Required
                  </th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-neutral-500 uppercase tracking-wide text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {variables.map((v, i) => (
                    <motion.tr
                      key={v.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        transition: { delay: i * 0.05 },
                      }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50 transition"
                    >
                      <VariableRowCells
                        variable={v}
                        onEdit={() => openEdit(v)}
                        onDelete={() => handleDelete(v.id)}
                      />
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Terraform preview */}
      <TerraformPreview variables={variables} />

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <VariableModal
            variables={variables}
            editingVar={editingVar}
            onClose={closeModal}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>
    </div>
  )
}