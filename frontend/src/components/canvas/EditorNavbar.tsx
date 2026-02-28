import { Link, useParams } from "react-router-dom"
import useEditorStore from "../../stores/useEditorStore"
import { CLOUD_PROVIDERS } from "../../types/cloud"
import WorkspaceSelector from "./WorkspaceSelector"

export default function EditorNavbar() {
  const { projectId } = useParams()
  const nodes = useEditorStore((s) => s.nodes)
  const cloudProvider = useEditorStore((s) => s.cloudProvider)

  const providerConfig = CLOUD_PROVIDERS.find((p) => p.id === cloudProvider)

  return (
    <div className="h-12 flex items-center justify-between border-b border-gray-200 bg-white px-4 gap-2">
      <div className="flex min-w-0 items-center gap-3">
        <Link
          to="/dashboard"
          className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50"
          aria-label="Back to dashboard"
        >
          ←
        </Link>

        <div className="h-6 w-px bg-gray-200" />

        <p className="truncate text-sm font-semibold text-gray-900">Project #{projectId}</p>

        {providerConfig && (
          <div
            className="hidden items-center gap-1 rounded-md border px-2 py-1 sm:flex"
            style={{
              backgroundColor: `${providerConfig.color}10`,
              borderColor: `${providerConfig.color}30`,
            }}
          >
            <span className="text-xs">{providerConfig.icon}</span>
            <span className="text-xs font-medium" style={{ color: providerConfig.color }}>
              {providerConfig.id.toUpperCase()}
            </span>
          </div>
        )}

        <div className="hidden lg:block">
          <WorkspaceSelector />
        </div>
      </div>

      <div className="hidden items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 md:flex">
        <div className={`h-1.5 w-1.5 rounded-full ${nodes.length > 0 ? "bg-green-500" : "bg-gray-400"}`} />
        <span className="text-xs text-gray-600">{nodes.length} component{nodes.length !== 1 ? "s" : ""}</span>
      </div>

      <div className="flex items-center gap-2">
        <button className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50">
          Save
        </button>
        <button className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-indigo-700">
          Export HCL
        </button>
      </div>
    </div>
  )
}
