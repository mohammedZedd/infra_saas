import { Info } from "lucide-react"
import { AWS_REGIONS } from "../../../../constants/regions"
import { formatCurrency } from "../../../../utils/format"
import type { StepComponentProps } from "./index"
import { getTemplateById } from "./index"

export function ProjectReviewStep({ data }: StepComponentProps) {
  const regionLabel = AWS_REGIONS.find((region) => region.value === data.region)?.label ?? data.region
  const template = getTemplateById(data.template_id)

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <dl className="space-y-3 text-sm">
          <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-3">
            <dt className="text-gray-500">Project Name</dt>
            <dd className="font-medium text-gray-900">{data.name}</dd>
          </div>
          <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-3">
            <dt className="text-gray-500">Description</dt>
            <dd className="max-w-sm text-right text-gray-900">{data.description}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-3">
            <dt className="text-gray-500">Region</dt>
            <dd className="font-medium text-gray-900">{regionLabel}</dd>
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
        <p>You can modify everything after creation. The canvas editor will open automatically.</p>
      </div>
    </div>
  )
}

export default ProjectReviewStep
