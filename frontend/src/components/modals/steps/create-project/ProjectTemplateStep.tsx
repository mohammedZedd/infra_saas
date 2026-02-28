import { Check, Globe, Lock, Network, Plus, Server, Zap } from "lucide-react"
import { isPlanSufficient } from "../../../../constants/pricing"
import useAuthStore from "../../../../stores/useAuthStore"
import { cn } from "../../../../utils/cn"
import type { StepComponentProps } from "./index"
import { PROJECT_TEMPLATE_OPTIONS } from "./index"

function getIcon(templateId: string) {
  switch (templateId) {
    case "basic-vpc":
      return Network
    case "web-app":
      return Server
    case "serverless-api":
      return Zap
    case "static-website":
      return Globe
    default:
      return Plus
  }
}

function getColorClass(templateId: string) {
  switch (templateId) {
    case "basic-vpc":
      return "bg-indigo-50 text-indigo-600"
    case "web-app":
      return "bg-orange-50 text-orange-600"
    case "serverless-api":
      return "bg-purple-50 text-purple-600"
    case "static-website":
      return "bg-green-50 text-green-600"
    default:
      return "bg-gray-100 text-gray-600"
  }
}

export function ProjectTemplateStep({ data, updateData }: StepComponentProps) {
  const userPlan = useAuthStore((state) => state.user?.plan ?? "free")

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {PROJECT_TEMPLATE_OPTIONS.map((template) => {
        const Icon = getIcon(template.id)
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
              isSelected ? "border-indigo-500 shadow-sm ring-2 ring-indigo-100" : "border-gray-200 hover:border-gray-300",
              isLocked && "cursor-not-allowed opacity-60"
            )}
          >
            {isSelected && (
              <span className="absolute right-3 top-3 inline-flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white">
                <Check size={12} />
              </span>
            )}

            <div className={cn("mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full", getColorClass(template.id))}>
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

            <p className="mt-1 text-sm text-gray-600">{template.description}</p>
          </button>
        )
      })}
    </div>
  )
}

export default ProjectTemplateStep
