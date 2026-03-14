import React, { useCallback } from "react"
import { Check, Loader2 } from "lucide-react"
import { cn } from "../../utils/cn"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type StepId = string

export interface StepDefinition {
  /** Unique identifier — used as the controlled key */
  id: StepId
  /** Label shown in the stepper header */
  title: string
  /** Optional subtitle shown below the title (desktop only) */
  description?: string
  /** Content rendered when this step is active */
  content: React.ReactNode
  /**
   * Whether the user may proceed from this step.
   * Defaults to `true`. When `false` the Next button is disabled.
   */
  isValid?: boolean
  /** When true the stepper shows "(optional)" beneath the title */
  isOptional?: boolean
  /**
   * Optional side-effect hook called just before the wizard advances
   * from this step. The wizard waits for the promise to resolve.
   */
  onNext?: () => void | Promise<void>
  /** Optional side-effect hook called when Back is pressed on this step */
  onBack?: () => void
}

export interface StepWizardProps {
  steps: StepDefinition[]
  /** Controlled — id of the currently visible step */
  activeStepId: StepId
  /** Called with the next/previous step id when navigation occurs */
  onStepChange: (stepId: StepId) => void
  /** Called when the user clicks Finish on the last step */
  onFinish?: () => void | Promise<void>
  /**
   * When true the Next/Finish button shows a spinner and both nav buttons
   * are disabled.
   */
  isSubmitting?: boolean
  /**
   * When true, clicking a stepper header item calls `onStepChange`.
   * Forward jumps are blocked if any intermediate step is invalid.
   * Defaults to false.
   */
  allowStepClick?: boolean
  /** Label for the Finish button. Defaults to "Finish". */
  finishLabel?: string
  /** Extra classes on the outermost container */
  className?: string
}

// ---------------------------------------------------------------------------
// StepIndicator
// ---------------------------------------------------------------------------

interface StepIndicatorProps {
  step: StepDefinition
  index: number
  isActive: boolean
  isCompleted: boolean
  isClickable: boolean
  isLast: boolean
  onClick: () => void
}

function StepIndicator({
  step,
  index,
  isActive,
  isCompleted,
  isClickable,
  isLast,
  onClick,
}: StepIndicatorProps): React.ReactElement {
  return (
    <div className="flex flex-1 items-center last:flex-none">
      {/* Circle + label */}
      <button
        type="button"
        disabled={!isClickable}
        onClick={onClick}
        aria-current={isActive ? "step" : undefined}
        aria-label={`Step ${index + 1}: ${step.title}`}
        className={cn(
          "flex flex-col items-center rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
          isClickable ? "cursor-pointer" : "cursor-default"
        )}
      >
        {/* Number / check circle */}
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-all duration-200",
            isCompleted
              ? "bg-blue-600 text-white"
              : isActive
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
              : "border-2 border-gray-200 bg-white text-gray-400"
          )}
        >
          {isCompleted ? <Check className="h-4 w-4" aria-hidden /> : index + 1}
        </div>

        {/* Title — hidden on mobile to avoid overflow */}
        <span
          className={cn(
            "mt-1.5 hidden text-xs font-medium whitespace-nowrap md:block",
            isActive ? "text-blue-600" : isCompleted ? "text-gray-700" : "text-gray-400"
          )}
        >
          {step.title}
        </span>

        {/* Optional badge */}
        {step.isOptional === true && !isCompleted && (
          <span className="hidden text-[10px] text-gray-400 md:block">(optional)</span>
        )}
      </button>

      {/* Connector line between circles */}
      {!isLast && (
        <div
          aria-hidden
          className={cn(
            "mx-3 mb-5 h-0.5 flex-1 rounded-full transition-colors duration-300",
            isCompleted ? "bg-blue-600" : "bg-gray-200"
          )}
        />
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// StepWizard
// ---------------------------------------------------------------------------

export function StepWizard({
  steps,
  activeStepId,
  onStepChange,
  onFinish,
  isSubmitting = false,
  allowStepClick = false,
  finishLabel = "Finish",
  className,
}: StepWizardProps): React.ReactElement {
  const activeIndex = steps.findIndex((s) => s.id === activeStepId)
  const safeIndex = activeIndex < 0 ? 0 : activeIndex
  const activeStep = steps[safeIndex]

  const isFirst = safeIndex === 0
  const isLast = safeIndex === steps.length - 1
  const currentIsValid = activeStep?.isValid !== false

  // Determine whether header item at `index` may be clicked
  const isStepClickable = useCallback(
    (index: number): boolean => {
      if (!allowStepClick || index === safeIndex) return false
      if (index < safeIndex) return true
      // Forward jump: all intermediate steps must be valid
      for (let i = safeIndex; i < index; i++) {
        if (steps[i].isValid === false) return false
      }
      return true
    },
    [allowStepClick, safeIndex, steps]
  )

  const handleBack = useCallback((): void => {
    if (isFirst || isSubmitting) return
    activeStep?.onBack?.()
    onStepChange(steps[safeIndex - 1].id)
  }, [isFirst, isSubmitting, activeStep, onStepChange, steps, safeIndex])

  const handleNext = useCallback((): void => {
    if (!currentIsValid || isSubmitting) return
    void (async () => {
      try {
        await activeStep?.onNext?.()
      } catch {
        // Validation hooks can reject to keep the user on the current step.
        return
      }
      if (isLast) {
        await onFinish?.()
      } else {
        onStepChange(steps[safeIndex + 1].id)
      }
    })()
  }, [currentIsValid, isSubmitting, activeStep, isLast, onFinish, onStepChange, steps, safeIndex])

  return (
    <div className={cn("flex h-full flex-col bg-white", className)}>
      {/* Stepper header */}
      <div className="px-6 pt-5 pb-4">
        <div className="flex items-center">
          {steps.map((step, index) => (
            <StepIndicator
              key={step.id}
              step={step}
              index={index}
              isActive={index === safeIndex}
              isCompleted={index < safeIndex}
              isClickable={isStepClickable(index)}
              isLast={index === steps.length - 1}
              onClick={() => onStepChange(step.id)}
            />
          ))}
        </div>
      </div>

      <div className="border-t border-gray-100" />

      {/* Step content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {activeStep?.content}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/50 px-6 py-4">
        {/* Back */}
        <button
          type="button"
          onClick={handleBack}
          disabled={isFirst || isSubmitting}
          aria-label="Go to previous step"
          className={cn(
            "rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors",
            isFirst || isSubmitting
              ? "cursor-not-allowed opacity-50"
              : "hover:bg-gray-50"
          )}
        >
          Back
        </button>

        {/* Next / Finish */}
        <button
          type="button"
          onClick={handleNext}
          disabled={!currentIsValid || isSubmitting}
          aria-label={isLast ? finishLabel : "Go to next step"}
          className={cn(
            "inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors",
            !currentIsValid || isSubmitting
              ? "cursor-not-allowed opacity-60"
              : "hover:bg-blue-700"
          )}
        >
          {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />}
          {isSubmitting ? "Loading…" : isLast ? finishLabel : "Next"}
        </button>
      </div>
    </div>
  )
}

export default StepWizard
