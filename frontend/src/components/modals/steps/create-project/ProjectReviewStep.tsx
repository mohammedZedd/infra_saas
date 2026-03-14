import { Info } from "lucide-react"
import { formatCurrency } from "../../../../utils/format"
import type { StepComponentProps } from "./index"
import { PROJECT_TEMPLATE_OPTIONS } from "./index"

const START_MODE_LABELS: Record<string, string> = {
  scratch: "Start from scratch",
  import: "Import Terraform files",
  template: "Use a template",
}

const REGION_LABELS: Record<string, string> = {
  "us-east-1": "US East (N. Virginia)",
  "us-east-2": "US East (Ohio)",
  "us-west-2": "US West (Oregon)",
  "eu-west-1": "Europe (Ireland)",
  "eu-central-1": "Europe (Frankfurt)",
  "ap-southeast-1": "Asia Pacific (Singapore)",
  "ap-northeast-1": "Asia Pacific (Tokyo)",
  "sa-east-1": "South America (São Paulo)",
}

export function ProjectReviewStep({ data }: StepComponentProps) {
  const template = PROJECT_TEMPLATE_OPTIONS.find((item) => item.id === data.template_id) ?? PROJECT_TEMPLATE_OPTIONS[0]
  const modeLabel = START_MODE_LABELS[data.start_mode] ?? data.start_mode
  const regionLabel = REGION_LABELS[data.region] ? `${REGION_LABELS[data.region]} (${data.region})` : data.region

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <dl className="space-y-3 text-sm">
          <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-3">
            <dt className="text-gray-500">Project Name</dt>
            <dd className="font-medium text-gray-900">{data.name || "—"}</dd>
          </div>
          <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-3">
            <dt className="text-gray-500">Description</dt>
            <dd className="max-w-sm text-right text-gray-900">{data.description || "—"}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-3">
            <dt className="text-gray-500">Region</dt>
            <dd className="font-medium text-gray-900">{regionLabel}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-3">
            <dt className="text-gray-500">Start Mode</dt>
            <dd className="font-medium text-gray-900">{modeLabel}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-3">
            <dt className="text-gray-500">Template</dt>
            <dd className="font-medium text-gray-900">{template.name}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-gray-500">Estimated Cost</dt>
            <dd className="font-medium text-gray-900">{formatCurrency(template.estimate)}/mo</dd>
          </div>
        </dl>
      </div>

      <div className="flex items-start gap-3 rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800">
        <Info size={16} className="mt-0.5 shrink-0" />
        <p>You can modify everything after creation. The project detail page will open automatically.</p>
      </div>
    </div>
  )
}

export default ProjectReviewStep
