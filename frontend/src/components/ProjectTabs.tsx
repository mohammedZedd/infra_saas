import { type LucideIcon } from "lucide-react"
import { cn } from "../utils/cn"

export interface TabItem<T extends string = string> {
  key: T
  label: string
  icon: LucideIcon
  badge?: number
}

interface ProjectTabsProps<T extends string = string> {
  tabs: readonly TabItem<T>[]
  activeTab: T
  onChange: (tab: T) => void
}

export function ProjectTabs<T extends string>({
  tabs,
  activeTab,
  onChange,
}: ProjectTabsProps<T>) {
  return (
    <div className="flex border-b border-gray-200 bg-gray-50">
      {tabs.map(({ key, label, icon: Icon, badge }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={cn(
            "flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-medium transition-colors",
            activeTab === key
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          )}
        >
          <Icon size={15} />
          {label}
          {badge !== undefined && badge > 0 && (
            <span className="ml-1 rounded-full bg-gray-200 px-1.5 py-0.5 text-xs text-gray-600">
              {badge}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
