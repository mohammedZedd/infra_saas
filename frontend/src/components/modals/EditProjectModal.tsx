import { useEffect, useMemo, useState } from "react"
import { z } from "zod"
import toast from "react-hot-toast"
import Modal from "../ui/Modal"
import { Button } from "../ui/Button"
import { Input } from "../ui/Input"
import { Select } from "../ui/Select"
import { AWS_REGIONS } from "../../constants/regions"
import useProjectStore from "../../stores/useProjectStore"
import useUIStore from "../../stores/useUIStore"
import { awsRegionSchema, projectNameSchema } from "../../utils/validation"

type EditErrors = Partial<Record<"name" | "description" | "region", string>>

const editSchema = z.object({
  name: projectNameSchema,
  description: z.string().min(1, "Description is required").max(200, "Description must be at most 200 characters"),
  region: awsRegionSchema,
})

export function EditProjectModal() {
  const activeModal = useUIStore((state) => state.activeModal)
  const modalData = useUIStore((state) => state.modalData)
  const closeModal = useUIStore((state) => state.closeModal)
  const updateProject = useProjectStore((state) => state.updateProject)
  const getProjectById = useProjectStore((state) => state.getProjectById)

  const isOpen = activeModal === "edit-project"
  const projectId = isOpen ? modalData?.projectId : null
  const project = useMemo(() => (projectId ? getProjectById(projectId) : undefined), [getProjectById, projectId])

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [region, setRegion] = useState("us-east-1")
  const [errors, setErrors] = useState<EditErrors>({})
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!isOpen || !project) return
    setName(project.name)
    setDescription(project.description)
    setRegion(project.region)
    setErrors({})
    setIsSaving(false)
  }, [isOpen, project])

  if (!project) return null

  const handleSave = () => {
    const parsed = editSchema.safeParse({ name, description, region })

    if (!parsed.success) {
      const nextErrors: EditErrors = {}
      for (const issue of parsed.error.issues) {
        const field = issue.path[0]
        if (field === "name" || field === "description" || field === "region") {
          nextErrors[field] = issue.message
        }
      }
      setErrors(nextErrors)
      return
    }

    setIsSaving(true)
    updateProject(project.id, {
      name,
      description,
      region,
      updated_at: new Date().toISOString(),
    })
    closeModal()
    toast.success("Project updated")
    setIsSaving(false)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      title="Edit project"
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={closeModal} disabled={isSaving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} isLoading={isSaving}>
            Save
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <Input label="Name" value={name} onChange={(event) => setName(event.target.value)} error={errors.name} />

        <div>
          <label htmlFor="edit-project-description" className="mb-1.5 block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="edit-project-description"
            rows={4}
            maxLength={200}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          {errors.description && <p className="mt-1.5 text-sm text-red-600">{errors.description}</p>}
        </div>

        <Select
          label="Region"
          options={AWS_REGIONS}
          value={region}
          onChange={(event) => setRegion(event.target.value)}
          error={errors.region}
        />
      </div>
    </Modal>
  )
}

export default EditProjectModal
