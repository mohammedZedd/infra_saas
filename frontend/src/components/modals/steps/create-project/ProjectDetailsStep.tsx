import { slugify } from "../../../../utils/format"
import { AWS_REGIONS } from "../../../../constants/regions"
import { Input } from "../../../ui/Input"
import { Select } from "../../../ui/Select"
import type { StepComponentProps } from "./index"

export function ProjectDetailsStep({ data, updateData, errors }: StepComponentProps) {
  const descriptionLength = data.description.length
  const slugPreview = slugify(data.name || "")

  return (
    <div className="space-y-5">
      <Input
        label="Project name"
        placeholder="my-infrastructure"
        value={data.name}
        onChange={(event) => updateData({ name: event.target.value })}
        error={errors.name}
        required
      />

      <p className="-mt-3 text-xs text-gray-500">
        Resource prefix: <span className="font-medium text-gray-700">{slugPreview || "my-infrastructure"}</span>
      </p>

      <div>
        <label htmlFor="project-description" className="mb-1.5 block text-sm font-medium text-gray-700">
          Description
        </label>
        <div className="relative">
          <textarea
            id="project-description"
            rows={4}
            maxLength={200}
            value={data.description}
            onChange={(event) => updateData({ description: event.target.value })}
            placeholder="Describe what this infrastructure does..."
            className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 pr-14 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <span className="pointer-events-none absolute bottom-2 right-3 text-xs text-gray-400">{descriptionLength}/200</span>
        </div>
        {errors.description && <p className="mt-1.5 text-sm text-red-600">{errors.description}</p>}
      </div>

      <Select
        label="AWS Region"
        value={data.region}
        onChange={(event) => updateData({ region: event.target.value })}
        options={AWS_REGIONS}
        error={errors.region}
        required
      />
    </div>
  )
}

export default ProjectDetailsStep
