import { type DragEvent, useState } from "react"
import { AWS_CATEGORIES, AWS_COMPONENTS, type AwsCategory, type AwsComponentConfig } from "../../types/aws"
import useUIStore from "../../stores/useUIStore"
import useEditorStore from "../../stores/useEditorStore"
import AwsIcon from "./nodes/AwsIcon"

export default function Sidebar() {
  const [search, setSearch] = useState("")
  const [openCategories, setOpenCategories] = useState<Set<AwsCategory>>(new Set(["networking", "compute"]))

  const toggleCategory = (category: AwsCategory) => {
    const next = new Set(openCategories)
    if (next.has(category)) {
      next.delete(category)
    } else {
      next.add(category)
    }
    setOpenCategories(next)
  }

  const cloudProvider = useEditorStore((s) => s.cloudProvider)

  const filteredComponents = search
    ? AWS_COMPONENTS.filter(
        (c) =>
          (c.label.toLowerCase().includes(search.toLowerCase()) ||
            c.type.toLowerCase().includes(search.toLowerCase())) &&
          (!cloudProvider || c.provider === cloudProvider)
      )
    : AWS_COMPONENTS.filter((c) => !cloudProvider || c.provider === cloudProvider)

  const onDragStart = (event: DragEvent, component: AwsComponentConfig) => {
    event.dataTransfer.setData("application/awstype", component.type)
    event.dataTransfer.effectAllowed = "move"
    // notify canvas that a drag operation has started
    useUIStore.getState().setDraggingType(component.type)
  }

  const onDragEnd = () => {
    // clear preview when drag finishes or is cancelled
    useUIStore.getState().setDraggingType(null)
    useUIStore.getState().setDragPosition(null)
  }

  return (
    <div className="w-64 flex-shrink-0 overflow-hidden border-r border-gray-200 bg-white flex flex-col">
      <div className="p-4 pb-2">
        <h3 className="mb-2 text-sm font-semibold text-gray-900">AWS Components</h3>

        <div className="relative">
          <input
            type="text"
            placeholder="Search components..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="custom-scrollbar flex-1 overflow-y-auto px-2 pb-2">
        {search ? (
          <div className="space-y-1">
            <p className="px-2 py-1 text-xs text-gray-400">
              {filteredComponents.length} result{filteredComponents.length !== 1 ? "s" : ""}
            </p>
            {filteredComponents.map((component) => (
              <SidebarItem key={component.type} component={component} onDragStart={onDragStart} onDragEnd={onDragEnd} />
            ))}
            {filteredComponents.length === 0 && <p className="p-4 text-center text-sm text-gray-400">No components available for the selected provider</p>}
          </div>
        ) : (
          <div className="space-y-1">
            {AWS_CATEGORIES.map((category) => {
              const components = AWS_COMPONENTS.filter((c) => c.category === category.id)
              const isOpen = openCategories.has(category.id)

              return (
                <div key={category.id}>
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    <span className={`text-[10px] text-gray-400 transition-transform ${isOpen ? "rotate-90" : ""}`}>▶</span>
                    <span>{category.icon}</span>
                    <span className="flex-1 font-medium">{category.label}</span>
                    <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">{components.length}</span>
                  </button>

                  {isOpen && (
                    <div className="space-y-1 pl-3">
                      {components.map((component) => (
                        <SidebarItem key={component.type} component={component} onDragStart={onDragStart} onDragEnd={onDragEnd} />
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="border-t border-gray-100 px-4 py-2">
        <p className="text-xs text-gray-400">{AWS_COMPONENTS.length} components available</p>
      </div>
    </div>
  )
}

function SidebarItem({
  component,
  onDragStart,
  onDragEnd,
}: {
  component: AwsComponentConfig
  onDragStart: (event: DragEvent, component: AwsComponentConfig) => void
  onDragEnd: () => void
}) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, component)}
      onDragEnd={onDragEnd}
      className="flex cursor-grab items-center gap-2 rounded-lg border border-transparent px-2 py-1.5 transition-colors hover:border-gray-200 hover:bg-gray-50"
    >
      <AwsIcon type={component.type} size={28} />
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-gray-900">{component.label}</p>
      </div>
    </div>
  )
}
