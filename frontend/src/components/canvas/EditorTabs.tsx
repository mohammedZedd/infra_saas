import { useState } from "react"
import PropertiesPanel from "./PropertiesPanel"
import SimulationPanel from "./SimulationPanel"
import SettingsPanel from "./SettingsPanel"

type TabId = "properties" | "simulate" | "settings"

const TABS: { id: TabId; label: string; emoji: string }[] = [
  { id: "properties", label: "Properties", emoji: "⚙️" },
  { id: "simulate", label: "Simulate", emoji: "🧪" },
  { id: "settings", label: "Settings", emoji: "⚡" },
]

export default function EditorTabs() {
  const [activeTab, setActiveTab] = useState<TabId>("properties")

  const renderPanel = () => {
    switch (activeTab) {
      case "properties":
        return <PropertiesPanel />
      case "simulate":
        return <SimulationPanel />
      case "settings":
        return <SettingsPanel />
      default:
        return null
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-shrink-0 border-b border-gray-200 bg-gray-50">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-1 flex-col items-center gap-0.5 border-b-2 py-2 text-xs transition-colors ${
                isActive ? "border-indigo-600 font-semibold text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <span className="text-base">{tab.emoji}</span>
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      <div className="flex-1 overflow-y-auto">{renderPanel()}</div>
    </div>
  )
}
