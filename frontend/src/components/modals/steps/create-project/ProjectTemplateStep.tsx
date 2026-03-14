import { useState } from "react"
import { ArrowLeft, Check, Lock, Network, Server, Zap, Globe, Ship, Component } from "lucide-react"
import { isPlanSufficient } from "../../../../constants/pricing"
import { cn } from "../../../../utils/cn"
import { FileUpload } from "../../../ui/FileUpload"
import type { StepComponentProps } from "./index"
import { PROJECT_TEMPLATE_OPTIONS } from "./index"
import type { StartMode } from "./index"

// ─── START MODE CARDS ─────────────────────────────────────────────

interface StartCard {
  mode: StartMode
  icon: string
  title: string
  description: string
}

const START_CARDS: StartCard[] = [
  {
    mode: "scratch",
    icon: "🎨",
    title: "Start from scratch",
    description: "Build your AWS infrastructure visually with drag and drop",
  },
  {
    mode: "import",
    icon: "📥",
    title: "Import Terraform files",
    description: "Upload your existing .tf files and we'll generate the visual architecture",
  },
  {
    mode: "template",
    icon: "📦",
    title: "Use a template",
    description: "Start with a pre-built AWS architecture from our marketplace",
  },
]

// ─── TEMPLATE ICON HELPER ─────────────────────────────────────────

function getTemplateIcon(templateId: string) {
  switch (templateId) {
    case "basic-vpc":
      return Network
    case "web-app":
      return Server
    case "serverless-api":
      return Zap
    case "static-website":
      return Globe
    case "microservices":
      return Ship
    case "kubernetes":
      return Component
    default:
      return Network
  }
}

function getTemplateColor(templateId: string) {
  switch (templateId) {
    case "basic-vpc":
      return "bg-indigo-50 text-indigo-600"
    case "web-app":
      return "bg-orange-50 text-orange-600"
    case "serverless-api":
      return "bg-purple-50 text-purple-600"
    case "static-website":
      return "bg-green-50 text-green-600"
    case "microservices":
      return "bg-cyan-50 text-cyan-600"
    case "kubernetes":
      return "bg-blue-50 text-blue-600"
    default:
      return "bg-gray-100 text-gray-600"
  }
}

// ─── SUB-VIEW: TEMPLATE GRID ─────────────────────────────────────

function TemplateGrid({ data, updateData }: StepComponentProps) {
  // ⚠️ UI prototype mode — auth store removed, treat all users as free plan
  const userPlan = "free" as const
  // Filter out blank — user chose "template" so we show real templates only
  const templates = PROJECT_TEMPLATE_OPTIONS.filter((t) => t.id !== "blank")

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {templates.map((template) => {
        const Icon = getTemplateIcon(template.id)
        const isSelected = data.template_id === template.id
        const isLocked = !!template.requiredPlan && !isPlanSufficient(userPlan, template.requiredPlan)

        return (
          <button
            key={template.id}
            type="button"
            disabled={isLocked}
            onClick={() => updateData({ template_id: template.id })}
            className={cn(
              "relative rounded-xl border bg-white p-4 text-left transition-all duration-200",
              isSelected
                ? "border-indigo-500 shadow-sm ring-2 ring-indigo-100"
                : "border-gray-200 hover:border-gray-300 hover:shadow-sm",
              isLocked && "cursor-not-allowed opacity-60"
            )}
          >
            {isSelected && (
              <span className="absolute right-3 top-3 inline-flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white">
                <Check size={12} />
              </span>
            )}

            <div className={cn("mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full", getTemplateColor(template.id))}>
              <Icon size={18} />
            </div>

            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-gray-900">{template.name}</p>
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                  template.badge === "Pro"
                    ? "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-600/20"
                    : "bg-gray-100 text-gray-700"
                )}
              >
                {isLocked && <Lock size={11} />}
                {template.badge}
              </span>
            </div>

            <p className="mt-1 text-sm text-gray-500">{template.description}</p>

            {template.components && template.components.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {template.components.map((c) => (
                  <span key={c} className="inline-block rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                    {c}
                  </span>
                ))}
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}

// ─── SUB-VIEW: TERRAFORM IMPORT ───────────────────────────────────

function TerraformImport({ data, updateData }: StepComponentProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800">
        <p className="font-medium">Upload your Terraform files</p>
        <p className="mt-1 text-blue-700">
          Drag & drop <code className="rounded bg-blue-100 px-1 font-mono text-xs">.tf</code> files or a{" "}
          <code className="rounded bg-blue-100 px-1 font-mono text-xs">.zip</code> archive. We'll parse them and generate the visual
          architecture on your canvas.
        </p>
      </div>

      <FileUpload
        value={data.importedFiles}
        accept=".tf,.zip"
        multiple
        maxSizeBytes={10 * 1024 * 1024}
        helperText=".tf files or .zip archive"
        onChange={(files) => updateData({ importedFiles: files })}
      />

      {data.importedFiles.length > 0 && (
        <p className="text-sm text-gray-600">
          <span className="font-medium text-gray-900">{data.importedFiles.length}</span> file
          {data.importedFiles.length > 1 ? "s" : ""} selected — resources will be imported after project creation.
        </p>
      )}
    </div>
  )
}

// ─── MAIN STEP COMPONENT ─────────────────────────────────────────

export function ProjectTemplateStep({ data, updateData, errors }: StepComponentProps) {
  // Track whether user has drilled into a sub-view
  const [subView, setSubView] = useState<"template" | "import" | null>(
    // Restore sub-view if user navigated back
    data.start_mode === "template" ? "template" : data.start_mode === "import" ? "import" : null
  )

  const handleSelect = (mode: StartMode) => {
    if (mode === "scratch") {
      updateData({ start_mode: "scratch", template_id: "blank", importedFiles: [] })
      setSubView(null)
    } else if (mode === "import") {
      updateData({ start_mode: "import", template_id: "blank" })
      setSubView("import")
    } else {
      // default template selection to first real template if none chosen
      const current = data.template_id
      const hasRealTemplate = current !== "blank" && PROJECT_TEMPLATE_OPTIONS.some((t) => t.id === current)
      updateData({
        start_mode: "template",
        importedFiles: [],
        template_id: hasRealTemplate ? current : "basic-vpc",
      })
      setSubView("template")
    }
  }

  const goBack = () => {
    setSubView(null)
  }

  // ── SUB VIEWS ──

  if (subView === "template") {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={goBack}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft size={14} />
          Back to options
        </button>
        <h3 className="text-sm font-semibold text-gray-900">Choose a template</h3>
        <TemplateGrid data={data} updateData={updateData} errors={errors} />
      </div>
    )
  }

  if (subView === "import") {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={goBack}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft size={14} />
          Back to options
        </button>
        <h3 className="text-sm font-semibold text-gray-900">Import Terraform files</h3>
        <TerraformImport data={data} updateData={updateData} errors={errors} />
      </div>
    )
  }

  // ── MAIN: 3 START-MODE CARDS ──

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-gray-700">How do you want to start?</p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {START_CARDS.map((card) => {
          const isSelected = data.start_mode === card.mode

          return (
            <button
              key={card.mode}
              type="button"
              onClick={() => handleSelect(card.mode)}
              className={cn(
                "group relative flex flex-col items-center rounded-xl border bg-white p-5 text-center transition-all duration-200",
                isSelected
                  ? "border-indigo-500 shadow-md ring-2 ring-indigo-100"
                  : "border-gray-200 hover:border-indigo-300 hover:shadow-sm"
              )}
            >
              <span className="text-3xl">{card.icon}</span>
              <p className="mt-3 text-sm font-semibold text-gray-900">{card.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-gray-500">{card.description}</p>

              {isSelected && (
                <span className="absolute right-2.5 top-2.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white">
                  <Check size={12} />
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default ProjectTemplateStep
