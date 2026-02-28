import React, { useState } from "react"
import { Check, type LucideIcon } from "lucide-react"
import { cn } from "../../utils/cn"
import Button from "./Button"

export interface WizardStep {
  key: string
  label: string
  icon?: LucideIcon
  content: React.ReactNode
  description?: string
}

export interface StepWizardProps {
  steps: WizardStep[]
  onComplete: () => void
  onCancel: () => void
  finishLabel?: string
  isSubmitting?: boolean
  onStepValidate?: (stepKey: string, stepIndex: number) => boolean | Promise<boolean>
}

export function StepWizard({ steps, onComplete, onCancel, finishLabel = "Create", isSubmitting = false, onStepValidate }: StepWizardProps) {
  const [current, setCurrent] = useState(0)
  const [completed, setCompleted] = useState<Set<number>>(new Set())

  const isFirst = current === 0
  const isLast = current === steps.length - 1

  const advance = async () => {
    if (onStepValidate) {
      const valid = await onStepValidate(steps[current].key, current)
      if (!valid) return
    }
    setCompleted((prev) => new Set(prev).add(current))
    if (isLast) {
      onComplete()
    } else {
      setCurrent((c) => c + 1)
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* ===== STEP INDICATORS — HORIZONTAL TOP BAR ===== */}
      <div className="px-6 pt-5 pb-4">
        <div className="flex items-center">
          {steps.map((step, index) => (
            <div key={step.key} className="flex items-center flex-1 last:flex-none">
              {/* Circle + Label group */}
              <div
                className="flex flex-col items-center cursor-pointer"
                onClick={() => {
                  if (index < current || completed.has(index)) {
                    setCurrent(index)
                  }
                }}
              >
                {/* Circle */}
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-all duration-200",
                    index < current
                      ? "bg-indigo-600 text-white"
                      : index === current
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                      : "bg-gray-100 text-gray-400 border-2 border-gray-200"
                  )}
                >
                  {index < current ? (
                    <Check size={16} />
                  ) : (
                    index + 1
                  )}
                </div>
                {/* Label */}
                <span
                  className={cn(
                    "mt-1.5 text-xs font-medium whitespace-nowrap",
                    index === current ? "text-indigo-600" : index < current ? "text-gray-700" : "text-gray-400"
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Connecting line between circles */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-3 mb-5 rounded-full transition-colors duration-300",
                    index < current ? "bg-indigo-600" : "bg-gray-200"
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ===== DIVIDER ===== */}
      <div className="border-t border-gray-100" />

      {/* ===== STEP CONTENT — FULL WIDTH ===== */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {steps[current].content}
      </div>

      {/* ===== FOOTER BUTTONS ===== */}
      <div className="border-t border-gray-100 bg-gray-50/50 px-6 py-4 flex items-center justify-between">
        <button
          type="button"
          onClick={onCancel}
          className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
        >
            Cancel
        </button>
        <div className="flex items-center gap-3">
          {!isFirst && (
            <button
              type="button"
              onClick={() => setCurrent((c) => Math.max(0, c - 1))}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-all"
            >
              Previous
            </button>
          )}
          <Button
            variant="primary"
            size="sm"
            isLoading={isLast && isSubmitting}
            onClick={advance}
            className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLast ? finishLabel : "Next"}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default StepWizard
