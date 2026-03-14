import { useState } from "react"
import type { ComponentType } from "react"
import { Check, FilePlus, Github, LayoutTemplate, Loader2, X } from "lucide-react"
import { cn } from "../../utils/cn"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NewProjectModalProps {
  open: boolean
  onClose: () => void
}

type CreationType = "blank" | "template" | "git"

interface FormData {
  creationType: CreationType | null
  name: string
  region: string
  environment: string
  description: string
  templateId: string
  repoUrl: string
  branch: string
  accessToken: string
}

// ─── Static mock data ─────────────────────────────────────────────────────────

const TEMPLATES = [
  { id: "vpc",        name: "VPC Stack",       description: "Production-ready VPC with public and private subnets", icon: "🌐" },
  { id: "serverless", name: "Serverless API",  description: "API Gateway + Lambda + DynamoDB",                      icon: "⚡" },
  { id: "data",       name: "Data Pipeline",   description: "S3 + Lambda + transformation workflow",                icon: "📊" },
  { id: "web-app",    name: "Web Application", description: "EC2 + RDS + ALB with auto-scaling",                   icon: "🖥️" },
] as const

const REGIONS = [
  { value: "us-east-1",      label: "US East (N. Virginia)" },
  { value: "us-west-2",      label: "US West (Oregon)" },
  { value: "eu-west-1",      label: "Europe (Ireland)" },
  { value: "ap-southeast-1", label: "Asia Pacific (Singapore)" },
] as const

const ENVIRONMENTS = ["Development", "Staging", "Production"] as const

const INITIAL_FORM: FormData = {
  creationType: null,
  name: "",
  region: "us-east-1",
  environment: "Development",
  description: "",
  templateId: "",
  repoUrl: "",
  branch: "main",
  accessToken: "",
}

// ─── Progress Indicator ───────────────────────────────────────────────────────

const STEP_LABELS = ["Type", "Configure", "Review"] as const

function ProgressIndicator({ step }: { step: 1 | 2 | 3 }) {
  return (
    <div className="flex items-center justify-center mb-8">
      {STEP_LABELS.map((label, idx) => {
        const num = (idx + 1) as 1 | 2 | 3
        const isActive = step === num
        const isDone   = step > num
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all duration-200",
                  isDone   && "bg-blue-600 text-white",
                  isActive && "bg-blue-600 text-white scale-110 shadow-md shadow-blue-200",
                  !isDone && !isActive && "bg-gray-200 text-gray-500"
                )}
              >
                {isDone ? <Check size={14} /> : num}
              </div>
              <span className={cn(
                "mt-1.5 text-xs transition-colors duration-200",
                isActive ? "text-blue-600 font-medium" : "text-gray-400"
              )}>
                {label}
              </span>
            </div>
            {idx < STEP_LABELS.length - 1 && (
              <div className={cn(
                "mx-2 mb-5 h-px w-16 transition-colors duration-300",
                step > num ? "bg-blue-600" : "bg-gray-200"
              )} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Step 1 — Creation Type ───────────────────────────────────────────────────

const CREATION_TYPES: {
  id: CreationType
  label: string
  description: string
  Icon: ComponentType<{ size?: number; className?: string }>
}[] = [
  { id: "blank",    label: "Blank Project",      description: "Start from scratch with an empty project.", Icon: FilePlus },
  { id: "template", label: "Use a Template",      description: "Bootstrap from a pre-built AWS architecture.", Icon: LayoutTemplate },
  { id: "git",      label: "Import from Git",     description: "Clone an existing Terraform repository.", Icon: Github },
]

function StepCreationType({
  selected,
  onSelect,
}: {
  selected: CreationType | null
  onSelect: (t: CreationType) => void
}) {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-gray-900">How would you like to start?</h2>
      <p className="text-sm text-gray-500">Choose a creation method for your new project.</p>
      <div className="mt-4 grid grid-cols-1 gap-3">
        {CREATION_TYPES.map(({ id, label, description, Icon }) => {
          const isSelected = selected === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelect(id)}
              className={cn(
                "w-full rounded-2xl border p-5 text-left transition-all duration-200 hover:shadow-md",
                isSelected
                  ? "border-blue-600 ring-2 ring-blue-100 bg-blue-50/40"
                  : "border-gray-200 bg-white hover:border-gray-300"
              )}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors",
                  isSelected ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"
                )}>
                  <Icon size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{description}</p>
                </div>
                {isSelected && (
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                    <Check size={12} />
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Step 2 — Configure (shared fields) ──────────────────────────────────────

function CommonFields({
  data,
  onChange,
}: {
  data: FormData
  onChange: (patch: Partial<FormData>) => void
}) {
  return (
    <>
      {/* Project Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Project Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={data.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="e.g. production-network"
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Region */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Region</label>
        <select
          value={data.region}
          onChange={(e) => onChange({ region: e.target.value })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {REGIONS.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      </div>

      {/* Environment */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Environment</label>
        <select
          value={data.environment}
          onChange={(e) => onChange({ environment: e.target.value })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {ENVIRONMENTS.map((env) => (
            <option key={env} value={env}>{env}</option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Description <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea
          value={data.description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Brief description of this project..."
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </>
  )
}

function StepConfigBlank({
  data,
  onChange,
}: {
  data: FormData
  onChange: (patch: Partial<FormData>) => void
}) {
  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-gray-900">Configure your project</h2>
      <p className="text-sm text-gray-500">Name your blank project and choose its environment.</p>
      <CommonFields data={data} onChange={onChange} />
    </div>
  )
}

function StepConfigTemplate({
  data,
  onChange,
}: {
  data: FormData
  onChange: (patch: Partial<FormData>) => void
}) {
  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-gray-900">Configure your project</h2>
      <p className="text-sm text-gray-500">Select a template and set the project details.</p>

      {/* Template picker */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Template <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onChange({ templateId: t.id })}
              className={cn(
                "w-full rounded-xl border p-3.5 text-left transition-all duration-200 hover:shadow-sm",
                data.templateId === t.id
                  ? "border-blue-600 ring-2 ring-blue-100 bg-blue-50/40"
                  : "border-gray-200 bg-white hover:border-gray-300"
              )}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{t.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{t.description}</p>
                </div>
                {data.templateId === t.id && (
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                    <Check size={12} />
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      <CommonFields data={data} onChange={onChange} />
    </div>
  )
}

function StepConfigGit({
  data,
  onChange,
}: {
  data: FormData
  onChange: (patch: Partial<FormData>) => void
}) {
  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-gray-900">Configure your project</h2>
      <p className="text-sm text-gray-500">Provide the Git repository details to import.</p>

      {/* Repo URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Repository URL <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={data.repoUrl}
          onChange={(e) => onChange({ repoUrl: e.target.value })}
          placeholder="https://github.com/org/repo.git"
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Branch */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Branch</label>
        <input
          type="text"
          value={data.branch}
          onChange={(e) => onChange({ branch: e.target.value })}
          placeholder="main"
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Access Token */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Access Token <span className="text-gray-400 font-normal">(optional, for private repos)</span>
        </label>
        <input
          type="password"
          value={data.accessToken}
          onChange={(e) => onChange({ accessToken: e.target.value })}
          placeholder="ghp_••••••••••••"
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <CommonFields data={data} onChange={onChange} />
    </div>
  )
}

// ─── Step 3 — Review ──────────────────────────────────────────────────────────

function StepReview({ data }: { data: FormData }) {
  const typeLabel    = CREATION_TYPES.find((c) => c.id === data.creationType)?.label ?? ""
  const templateName = TEMPLATES.find((t) => t.id === data.templateId)?.name
  const regionLabel  = REGIONS.find((r) => r.value === data.region)?.label ?? data.region

  const rows: { label: string; value: string }[] = [
    { label: "Type",        value: typeLabel },
    ...(templateName ? [{ label: "Template",    value: templateName }] : []),
    ...(data.creationType === "git" ? [
      { label: "Repository", value: data.repoUrl },
      { label: "Branch",     value: data.branch },
    ] : []),
    { label: "Name",        value: data.name },
    { label: "Region",      value: regionLabel },
    { label: "Environment", value: data.environment },
    ...(data.description ? [{ label: "Description", value: data.description }] : []),
  ]

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Review & Create</h2>
      <p className="text-sm text-gray-500">Confirm your project configuration before creating.</p>

      <div className="bg-gray-50 rounded-xl p-5 mt-2">
        <dl className="space-y-3 text-sm">
          {rows.map(({ label, value }, idx) => (
            <div
              key={label}
              className={cn(
                "flex items-start justify-between gap-4",
                idx < rows.length - 1 && "border-b border-gray-200 pb-3"
              )}
            >
              <dt className="text-gray-500 shrink-0">{label}</dt>
              <dd className="font-medium text-gray-900 text-right break-all">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export default function NewProjectModal({ open, onClose }: NewProjectModalProps) {
  const [step, setStep]           = useState<1 | 2 | 3>(1)
  const [formData, setFormData]   = useState<FormData>(INITIAL_FORM)
  const [isLoading, setIsLoading] = useState(false)

  if (!open) return null

  const patch = (updates: Partial<FormData>) =>
    setFormData((prev) => ({ ...prev, ...updates }))

  const handleClose = () => {
    setStep(1)
    setFormData(INITIAL_FORM)
    setIsLoading(false)
    onClose()
  }

  const handleCreate = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      handleClose()
    }, 1200)
  }

  // Per-step continue guards
  const canContinue: Record<1 | 2 | 3, boolean> = {
    1: formData.creationType !== null,
    2: formData.name.trim() !== "" &&
       (formData.creationType !== "template" || formData.templateId !== "") &&
       (formData.creationType !== "git"      || formData.repoUrl.trim() !== ""),
    3: true,
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* Progress indicator */}
        <ProgressIndicator step={step} />

        {/* Step content */}
        {step === 1 && (
          <StepCreationType
            selected={formData.creationType}
            onSelect={(t) => patch({ creationType: t })}
          />
        )}
        {step === 2 && formData.creationType === "blank" && (
          <StepConfigBlank data={formData} onChange={patch} />
        )}
        {step === 2 && formData.creationType === "template" && (
          <StepConfigTemplate data={formData} onChange={patch} />
        )}
        {step === 2 && formData.creationType === "git" && (
          <StepConfigGit data={formData} onChange={patch} />
        )}
        {step === 3 && (
          <StepReview data={formData} />
        )}

        {/* Footer buttons */}
        <div className="mt-8 flex items-center justify-between">
          <div>
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}
                disabled={isLoading}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Back
              </button>
            ) : (
              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>

          <div>
            {step < 3 ? (
              <button
                type="button"
                disabled={!canContinue[step]}
                onClick={() => setStep((s) => (s + 1) as 2 | 3)}
                className={cn(
                  "rounded-lg px-5 py-2 text-sm font-medium text-white transition-colors",
                  !canContinue[step]
                    ? "bg-blue-300 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                )}
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                disabled={isLoading}
                onClick={handleCreate}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-medium text-white transition-colors",
                  isLoading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                )}
              >
                {isLoading && <Loader2 size={14} className="animate-spin" />}
                {isLoading ? "Creating..." : "Create Project"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
