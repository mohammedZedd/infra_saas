import { useMemo, useState } from "react"
import { cn } from "../../../../utils/cn"
import type { StepComponentProps } from "./index"

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

// ─── Component ────────────────────────────────────────────────────────────────

export function ProjectDetailsStep({ data, updateData, errors }: StepComponentProps) {
  const [environment, setEnvironment] = useState<(typeof ENVIRONMENTS)[number]>(ENVIRONMENTS[0])
  const [nameTouched, setNameTouched] = useState(false)
  const nameError = useMemo(() => {
    if (!data.name.trim()) return "Project name is required."
    if (data.name.trim().length < 3) return "Name must be at least 3 characters."
    if (!/^[a-z0-9-]+$/i.test(data.name.trim())) return "Only letters, numbers, and hyphens allowed."
    return undefined
  }, [data.name])
  const displayNameError = errors.name ?? (nameTouched ? nameError : undefined)

  return (
    <div className="space-y-5">
      {/* Project Name */}
      <div>
        <label htmlFor="pd-name" className="block text-sm font-medium text-gray-700 mb-1.5">
          Project Name <span className="text-red-500">*</span>
        </label>
        <input
          id="pd-name"
          type="text"
          value={data.name}
          onChange={(e) => updateData({ name: e.target.value })}
          onBlur={() => setNameTouched(true)}
          placeholder="e.g. production-network"
          className={cn(
            "w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
            displayNameError ? "border-red-400 bg-red-50" : "border-gray-300 bg-white"
          )}
        />
        {displayNameError && <p className="mt-1.5 text-xs text-red-600">{displayNameError}</p>}
      </div>

      {/* Region */}
      <div>
        <label htmlFor="pd-region" className="block text-sm font-medium text-gray-700 mb-1.5">
          AWS Region
        </label>
        <select
          id="pd-region"
          value={data.region}
          onChange={(e) => updateData({ region: e.target.value })}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {REGIONS.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      </div>

      {/* Environment */}
      <div>
        <label htmlFor="pd-env" className="block text-sm font-medium text-gray-700 mb-1.5">
          Environment
        </label>
        <select
          id="pd-env"
          value={environment}
          onChange={(e) => setEnvironment(e.target.value as (typeof ENVIRONMENTS)[number])}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {ENVIRONMENTS.map((env) => (
            <option key={env} value={env}>{env}</option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="pd-description" className="block text-sm font-medium text-gray-700 mb-1.5">
          Description <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <div className="relative">
          <textarea
            id="pd-description"
            rows={4}
            maxLength={200}
            value={data.description}
            onChange={(e) => updateData({ description: e.target.value })}
            placeholder="Describe what this infrastructure does..."
            className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="pointer-events-none absolute bottom-2 right-3 text-xs text-gray-400">
            {data.description.length}/200
          </span>
        </div>
      </div>
    </div>
  )
}

export default ProjectDetailsStep
