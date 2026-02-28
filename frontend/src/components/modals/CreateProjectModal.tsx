import { ClipboardCheck, FileText, LayoutTemplate } from "lucide-react"
import { z } from "zod"
import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import Modal from "../ui/Modal"
import { StepWizard } from "../ui/StepWizard"
import useProjectStore from "../../stores/useProjectStore"
import useUIStore from "../../stores/useUIStore"
import { awsRegionSchema, projectNameSchema } from "../../utils/validation"
import {
  type CreateProjectErrors,
  type CreateProjectFormData,
  ProjectDetailsStep,
  ProjectReviewStep,
  ProjectTemplateStep,
} from "./steps/create-project"

const initialFormData: CreateProjectFormData = {
  name: "",
  description: "",
  region: "us-east-1",
  template_id: "blank",
}

const detailsSchema = z.object({
  name: projectNameSchema,
  description: z.string().min(1, "Description is required").max(200, "Description must be at most 200 characters"),
  region: awsRegionSchema,
})

export function CreateProjectModal() {
  const navigate = useNavigate()
  const isOpen = useUIStore((state) => state.activeModal === "create-project")
  const closeModal = useUIStore((state) => state.closeModal)
  const addProject = useProjectStore((state) => state.addProject)
  const [formData, setFormData] = useState<CreateProjectFormData>(initialFormData)
  const [errors, setErrors] = useState<CreateProjectErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setFormData(initialFormData)
    setErrors({})
    setIsSubmitting(false)
  }, [isOpen])

  const updateData = (updates: Partial<CreateProjectFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }))
  }

  const steps = useMemo(
    () => [
      {
        key: "details",
        label: "Project Details",
        icon: FileText,
        content: <ProjectDetailsStep data={formData} updateData={updateData} errors={errors} />,
      },
      {
        key: "template",
        label: "Choose Template",
        icon: LayoutTemplate,
        content: <ProjectTemplateStep data={formData} updateData={updateData} errors={errors} />,
      },
      {
        key: "review",
        label: "Review",
        icon: ClipboardCheck,
        content: <ProjectReviewStep data={formData} updateData={updateData} errors={errors} />,
      },
    ],
    [errors, formData]
  )

  const onStepValidate = async (stepKey: string): Promise<boolean> => {
    if (stepKey !== "details") return true

    const parsed = detailsSchema.safeParse({
      name: formData.name,
      description: formData.description,
      region: formData.region,
    })

    if (parsed.success) {
      setErrors({})
      return true
    }

    const nextErrors: CreateProjectErrors = {}
    for (const issue of parsed.error.issues) {
      const field = issue.path[0]
      if (field === "name" || field === "description" || field === "region") {
        nextErrors[field] = issue.message
      }
    }
    setErrors(nextErrors)
    return false
  }

  const onComplete = () => {
    setIsSubmitting(true)
    const now = new Date().toISOString()
    const newId = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Date.now().toString()

    addProject({
      id: newId,
      name: formData.name,
      description: formData.description,
      region: formData.region,
      status: "draft",
      node_count: 0,
      estimated_cost: 0,
      created_at: now,
      updated_at: now,
      last_deployed_at: null,
    })

    closeModal()
    toast.success("Project created successfully")
    navigate(`/projects/${newId}/editor`)
    setIsSubmitting(false)
  }

  return (
    <Modal isOpen={isOpen} onClose={closeModal} title="Create new project" size="xl">
      <StepWizard
        steps={steps}
        onComplete={onComplete}
        onCancel={closeModal}
        finishLabel="Create"
        isSubmitting={isSubmitting}
        onStepValidate={onStepValidate}
      />
    </Modal>
  )
}

export default CreateProjectModal
