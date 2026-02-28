import { useNavigate } from "react-router-dom"
import { ReactFlow, ReactFlowProvider, Background } from "@xyflow/react"
import "@xyflow/react/dist/style.css"

import { RUN_STATUS_CONFIG } from "./projectData"
import type { Project, TabId } from "./projectData"
import { nodeTypes } from "../canvas/nodes/nodeTypes"
import useEditorStore from "../../stores/useEditorStore"

interface Props {
  project: Project
  onTabChange: (tab: TabId) => void
}

export default function ProjectOverview({ project, onTabChange }: Props) {
  const navigate = useNavigate()

  // Lire les vrais nodes/edges du store — même source que l'Editor
  const nodes = useEditorStore((s) => s.nodes)
  const edges = useEditorStore((s) => s.edges)

  // Nodes en read-only pour le preview
  const previewNodes = nodes.map((n) => ({
    ...n,
    selectable: false,
    draggable: false,
  }))

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
      {/* ========== COLONNE GAUCHE — Architecture Graph ========== */}
      <div
        style={{
          backgroundColor: "white",
          borderRadius: 14,
          border: "1px solid #E5E7EB",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #E5E7EB",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 16 }}>🏗️</span>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "#111827", margin: 0 }}>
              Architecture
            </h3>
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: "#6B7280",
                backgroundColor: "#F3F4F6",
                padding: "2px 8px",
                borderRadius: 10,
              }}
            >
              {previewNodes.length} resources
            </span>
          </div>
          <button
            onClick={() => navigate(`/editor/${project.id}`)}
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "#4F46E5",
              backgroundColor: "#EEF2FF",
              border: "1px solid #C7D2FE",
              borderRadius: 6,
              padding: "5px 12px",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#E0E7FF"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#EEF2FF"
            }}
          >
            Open in Editor →
          </button>
        </div>

        <div style={{ flex: 1, minHeight: 420 }}>
          {previewNodes.length > 0 ? (
            <ReactFlowProvider>
              <ReactFlow
                nodes={previewNodes}
                edges={edges}
                nodeTypes={nodeTypes}
                fitView
                fitViewOptions={{ padding: 0.3 }}
                nodesDraggable={false}
                nodesConnectable={false}
                nodesFocusable={false}
                edgesFocusable={false}
                elementsSelectable={false}
                panOnDrag={false}
                zoomOnScroll={false}
                zoomOnPinch={false}
                zoomOnDoubleClick={false}
                preventScrolling={false}
                proOptions={{ hideAttribution: true }}
                style={{ backgroundColor: "#FAFBFC" }}
              >
                <Background color="#E2E8F0" gap={20} size={1} />
              </ReactFlow>
            </ReactFlowProvider>
          ) : (
            <div
              style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                color: "#9CA3AF",
              }}
            >
              <span style={{ fontSize: 40 }}>🏗️</span>
              <p style={{ fontSize: 13, fontWeight: 500, margin: 0 }}>No architecture yet</p>
              <p style={{ fontSize: 11, color: "#D1D5DB", margin: 0 }}>
                Open the editor to start designing
              </p>
              <button
                onClick={() => navigate(`/editor/${project.id}`)}
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "white",
                  backgroundColor: "#4F46E5",
                  border: "none",
                  borderRadius: 8,
                  padding: "8px 20px",
                  cursor: "pointer",
                  marginTop: 4,
                }}
              >
                Start Designing
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ========== COLONNE DROITE ========== */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Last Run */}
        <div
          style={{
            backgroundColor: "white",
            borderRadius: 14,
            border: "1px solid #E5E7EB",
            padding: "20px 24px",
          }}
        >
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "#111827", margin: "0 0 16px" }}>
            🚀 Last Run
          </h3>
          {project.lastRun ? (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: 20 }}>
                  {RUN_STATUS_CONFIG[project.lastRun.status]?.emoji}
                </span>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#111827", margin: 0 }}>
                    terraform {project.lastRun.command}
                  </p>
                  <p style={{ fontSize: 11, color: "#9CA3AF", margin: "2px 0 0" }}>
                    {project.lastRun.at} • {project.lastRun.duration}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onTabChange("runs")}
                style={{
                  fontSize: 12,
                  color: "#4F46E5",
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  fontWeight: 500,
                }}
              >
                View all runs →
              </button>
            </div>
          ) : (
            <p style={{ fontSize: 12, color: "#9CA3AF" }}>No runs yet</p>
          )}
        </div>

        {/* Project Details */}
        <div
          style={{
            backgroundColor: "white",
            borderRadius: 14,
            border: "1px solid #E5E7EB",
            padding: "20px 24px",
          }}
        >
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "#111827", margin: "0 0 16px" }}>
            📋 Project Details
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {[
              { label: "Cloud Provider", value: `☁️ ${project.cloud}` },
              { label: "Created", value: project.createdAt },
              { label: "Last Updated", value: project.updatedAt },
              { label: "Components", value: `${project.components} resources` },
              { label: "Variables", value: `${project.variables} defined` },
              { label: "Secrets", value: `${project.secrets} encrypted` },
            ].map((item, i) => (
              <div key={i}>
                <p
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: "#9CA3AF",
                    margin: "0 0 4px",
                    textTransform: "uppercase",
                  }}
                >
                  {item.label}
                </p>
                <p style={{ fontSize: 13, fontWeight: 500, color: "#111827", margin: 0 }}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}