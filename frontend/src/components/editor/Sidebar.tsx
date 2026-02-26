import { type DragEvent, useState } from "react"
import { AWS_COMPONENTS, AWS_CATEGORIES, type AwsComponentConfig, type AwsCategory } from "../../types/aws"
import AwsIcon from "./nodes/AwsIcon"

export default function Sidebar() {
  const [search, setSearch] = useState("")
  const [openCategories, setOpenCategories] = useState<Set<AwsCategory>>(
    new Set(["networking", "compute"])
  )

  const toggleCategory = (category: AwsCategory) => {
    const next = new Set(openCategories)
    if (next.has(category)) {
      next.delete(category)
    } else {
      next.add(category)
    }
    setOpenCategories(next)
  }

  const filteredComponents = search
    ? AWS_COMPONENTS.filter(
        (c) =>
          c.label.toLowerCase().includes(search.toLowerCase()) ||
          c.type.toLowerCase().includes(search.toLowerCase())
      )
    : AWS_COMPONENTS

  const onDragStart = (event: DragEvent, component: AwsComponentConfig) => {
    event.dataTransfer.setData("application/awstype", component.type)
    event.dataTransfer.effectAllowed = "move"
  }

  return (
    <div
      style={{
        width: "260px",
        backgroundColor: "white",
        borderRight: "1px solid #E5E7EB",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div style={{ padding: "14px 14px 0" }}>
        <h3 style={{ fontSize: "13px", fontWeight: 600, color: "#111827", margin: 0, marginBottom: "10px" }}>
          AWS Components
        </h3>

        {/* Search */}
        <div style={{ position: "relative", marginBottom: "8px" }}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#9CA3AF"
            strokeWidth="2"
            style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search components..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 10px 8px 32px",
              fontSize: "13px",
              color: "#111827",
              backgroundColor: "#F9FAFB",
              border: "1px solid #E5E7EB",
              borderRadius: "8px",
              outline: "none",
              transition: "border-color 0.15s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#4F6EF7")}
            onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
          />
        </div>
      </div>

      {/* Components list */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "6px",
        }}
      >
        {search ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <p style={{ fontSize: "11px", color: "#9CA3AF", padding: "4px 8px", margin: 0 }}>
              {filteredComponents.length} result{filteredComponents.length !== 1 ? "s" : ""}
            </p>
            {filteredComponents.map((component) => (
              <SidebarItem key={component.type} component={component} onDragStart={onDragStart} />
            ))}
            {filteredComponents.length === 0 && (
              <p style={{ fontSize: "13px", color: "#9CA3AF", textAlign: "center", padding: "20px" }}>
                No components found
              </p>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {AWS_CATEGORIES.map((category) => {
              const components = AWS_COMPONENTS.filter((c) => c.category === category.id)
              const isOpen = openCategories.has(category.id)

              return (
                <div key={category.id}>
                  <button
                    onClick={() => toggleCategory(category.id)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "8px",
                      backgroundColor: "transparent",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      transition: "background-color 0.1s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F9FAFB")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <span
                      style={{
                        fontSize: "10px",
                        color: "#9CA3AF",
                        transition: "transform 0.15s",
                        transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                        display: "inline-block",
                      }}
                    >
                      ▶
                    </span>
                    <span style={{ fontSize: "12px" }}>{category.icon}</span>
                    <span style={{ fontSize: "12px", fontWeight: 600, color: "#374151", flex: 1, textAlign: "left" }}>
                      {category.label}
                    </span>
                    <span
                      style={{
                        fontSize: "10px",
                        color: "#9CA3AF",
                        backgroundColor: "#F3F4F6",
                        padding: "1px 6px",
                        borderRadius: "4px",
                      }}
                    >
                      {components.length}
                    </span>
                  </button>

                  {isOpen && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "1px", paddingLeft: "8px" }}>
                      {components.map((component) => (
                        <SidebarItem key={component.type} component={component} onDragStart={onDragStart} />
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: "10px 14px", borderTop: "1px solid #F3F4F6" }}>
        <p style={{ fontSize: "11px", color: "#9CA3AF", margin: 0 }}>
          {AWS_COMPONENTS.length} components available
        </p>
      </div>
    </div>
  )
}

function SidebarItem({
  component,
  onDragStart,
}: {
  component: AwsComponentConfig
  onDragStart: (event: DragEvent, component: AwsComponentConfig) => void
}) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, component)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "6px 8px",
        borderRadius: "6px",
        cursor: "grab",
        transition: "background-color 0.1s",
        border: "1px solid transparent",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "#F9FAFB"
        e.currentTarget.style.borderColor = "#E5E7EB"
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "transparent"
        e.currentTarget.style.borderColor = "transparent"
      }}
    >
      {/* Real AWS icon */}
      <AwsIcon type={component.type} size={28} />

      <div style={{ minWidth: 0 }}>
        <p
          style={{
            fontSize: "12px",
            fontWeight: 500,
            color: "#111827",
            margin: 0,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {component.label}
        </p>
      </div>
    </div>
  )
}