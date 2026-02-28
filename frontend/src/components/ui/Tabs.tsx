import React, { useState } from "react"
import { type LucideIcon } from "lucide-react"
import { cn } from "../../utils/cn"

export interface TabItem {
  key: string
  label: string
  icon?: LucideIcon
  count?: number
  disabled?: boolean
  content: React.ReactNode
}

export interface TabsProps {
  tabs: TabItem[]
  defaultTab?: string
  activeTab?: string
  onTabChange?: (key: string) => void
  className?: string
}

export function Tabs({ tabs, defaultTab, activeTab: controlledTab, onTabChange, className }: TabsProps) {
  const [internalTab, setInternalTab] = useState<string>(defaultTab ?? tabs[0]?.key ?? "")
  const active = controlledTab ?? internalTab

  const handleSelect = (key: string) => {
    setInternalTab(key)
    onTabChange?.(key)
  }

  const activeItem = tabs.find((t) => t.key === active)

  return (
    <div>
      <div role="tablist" aria-label="Page sections" className={cn("border-b border-gray-200", className)}>
        <div className="flex items-center overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = tab.key === active
            return (
              <button
                key={tab.key}
                role="tab"
                id={`tab-${tab.key}`}
                aria-selected={isActive}
                aria-controls={`panel-${tab.key}`}
                disabled={tab.disabled}
                onClick={() => !tab.disabled && handleSelect(tab.key)}
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px",
                  isActive ? "text-indigo-600 border-indigo-600" : "text-gray-500 border-transparent hover:text-gray-700",
                  tab.disabled && "opacity-40 cursor-not-allowed"
                )}
              >
                {Icon && <Icon size={15} aria-hidden="true" />}
                {tab.label}
                {tab.count !== undefined && (
                  <span className={cn("rounded-full px-1.5 py-0.5 text-xs", isActive ? "bg-indigo-50 text-indigo-700" : "bg-gray-100 text-gray-500")}>
                    {tab.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {activeItem && (
        <div role="tabpanel" id={`panel-${activeItem.key}`} aria-labelledby={`tab-${activeItem.key}`} className="focus:outline-none">
          {activeItem.content}
        </div>
      )}
    </div>
  )
}

export default Tabs
