import { useCallback, useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import Modal from "../ui/Modal"
import { StepWizard } from "../ui/StepWizard"
import type { StepId } from "../ui/StepWizard"
import useProjectStore from "../../stores/useProjectStore"
import useEditorStore from "../../stores/useEditorStore"
import useUIStore from "../../stores/useUIStore"
import { parseTerraformFiles } from "../../utils/terraform-parser"
import {
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
  start_mode: "scratch",
  importedFiles: [],
}

export function CreateProjectModal() {
  const navigate = useNavigate()
  const isOpen = useUIStore((state) => state.activeModal === "create-project")
  const closeModal = useUIStore((state) => state.closeModal)
  const addProject = useProjectStore((state) => state.addProject)
  const addNode = useEditorStore((state) => state.addNode)
  const [formData, setFormData] = useState<CreateProjectFormData>(initialFormData)
  const [activeStepId, setActiveStepId] = useState<StepId>("start")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [detailsSubmitAttempted, setDetailsSubmitAttempted] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setFormData(initialFormData)
    setActiveStepId("start")
    setIsSubmitting(false)
    setDetailsSubmitAttempted(false)
  }, [isOpen])

  const updateData = useCallback((updates: Partial<CreateProjectFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }))
  }, [])

  // Per-step validity derived from formData (no side effects)
  const isStartValid = useMemo(() => {
    if (!formData.start_mode) return false
    if (formData.start_mode === "import" && formData.importedFiles.length === 0) return false
    if (formData.start_mode === "template" && formData.template_id === "blank") return false
    return true
  }, [formData.start_mode, formData.importedFiles.length, formData.template_id])

  const detailsNameError = useMemo(() => {
    if (!formData.name.trim()) return "Project name is required."
    if (formData.name.trim().length < 3) return "Name must be at least 3 characters."
    if (!/^[a-z0-9-]+$/i.test(formData.name.trim())) return "Only letters, numbers, and hyphens allowed."
    return undefined
  }, [formData.name])

  const steps = useMemo(
    () => [
      {
        id: "start",
        title: "How to Start",
        isValid: isStartValid,
        content: <ProjectTemplateStep data={formData} updateData={updateData} errors={{}} />,
      },
      {
        id: "details",
        title: "Project Details",
        isValid: true,
        onNext: () => {
          setDetailsSubmitAttempted(true)
          if (detailsNameError) {
            throw new Error("Project details validation failed")
          }
        },
        content: (
          <ProjectDetailsStep
            data={formData}
            updateData={updateData}
            errors={detailsSubmitAttempted && detailsNameError ? { name: detailsNameError } : {}}
          />
        ),
      },
      {
        id: "review",
        title: "Review",
        content: <ProjectReviewStep data={formData} updateData={updateData} errors={{}} />,
      },
    ],
    [formData, updateData, isStartValid, detailsSubmitAttempted, detailsNameError]
  )

  const onFinish = async () => {
    setIsSubmitting(true)
    try {
      const createdProject = await addProject({
        name: formData.name,
        description: formData.description,
        region: formData.region,
        template_id: formData.template_id,
      })

      closeModal()
      navigate(`/projects/${createdProject.id}`)

      if (formData.start_mode === "import" && formData.importedFiles.length > 0) {
        try {
          const resources = await parseTerraformFiles(formData.importedFiles)
          let col = 0
          const COLS = 4
          const GAP_X = 200
          const GAP_Y = 180
          for (const resource of resources) {
            const x = 100 + (col % COLS) * GAP_X
            const y = 100 + Math.floor(col / COLS) * GAP_Y
            addNode(resource.type, { x, y })
            col++
          }
          toast.success(`${resources.length} resource${resources.length > 1 ? "s" : ""} imported successfully`)
        } catch {
          toast.error("Failed to parse Terraform files. Try importing them manually.")
        }
      } else {
        toast.success("Project created successfully")
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create project"
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={closeModal} title="Create new project" size="xl">
      <StepWizard
        steps={steps}
        activeStepId={activeStepId}
        onStepChange={setActiveStepId}
        onFinish={onFinish}
        finishLabel="Create"
        isSubmitting={isSubmitting}
      />
    </Modal>
  )
}

export default CreateProjectModal
