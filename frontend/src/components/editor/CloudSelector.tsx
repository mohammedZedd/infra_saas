import { CLOUD_PROVIDERS, type CloudProvider } from "../../types/cloud"

interface CloudSelectorProps {
  onSelect: (provider: CloudProvider) => void
}

export default function CloudSelector({ onSelect }: CloudSelectorProps) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(8px)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "600px",
          backgroundColor: "white",
          borderRadius: "20px",
          padding: "40px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #4F6EF7, #7C3AED)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <span style={{ fontSize: "24px" }}>☁️</span>
          </div>
          <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#111827", marginBottom: "8px" }}>
            Choose your cloud
          </h2>
          <p style={{ fontSize: "15px", color: "#6B7280" }}>
            Select the cloud provider for this project
          </p>
        </div>

        {/* Cloud options */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {CLOUD_PROVIDERS.map((provider) => (
            <button
              key={provider.id}
              onClick={() => provider.available && onSelect(provider.id)}
              disabled={!provider.available}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                padding: "18px 20px",
                backgroundColor: provider.available ? "white" : "#FAFBFC",
                border: `2px solid ${provider.available ? "#E5E7EB" : "#F3F4F6"}`,
                borderRadius: "14px",
                cursor: provider.available ? "pointer" : "not-allowed",
                transition: "all 0.15s ease",
                opacity: provider.available ? 1 : 0.5,
                textAlign: "left",
                width: "100%",
              }}
              onMouseEnter={(e) => {
                if (provider.available) {
                  e.currentTarget.style.borderColor = provider.color
                  e.currentTarget.style.boxShadow = `0 0 0 3px ${provider.color}15`
                  e.currentTarget.style.transform = "translateY(-1px)"
                }
              }}
              onMouseLeave={(e) => {
                if (provider.available) {
                  e.currentTarget.style.borderColor = "#E5E7EB"
                  e.currentTarget.style.boxShadow = "none"
                  e.currentTarget.style.transform = "translateY(0)"
                }
              }}
            >
              {/* Icon */}
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  backgroundColor: `${provider.color}10`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                  flexShrink: 0,
                }}
              >
                {provider.icon}
              </div>

              {/* Info */}
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <p style={{ fontSize: "16px", fontWeight: 600, color: "#111827", margin: 0 }}>
                    {provider.name}
                  </p>
                  {!provider.available && (
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 500,
                        color: "#9CA3AF",
                        backgroundColor: "#F3F4F6",
                        padding: "2px 8px",
                        borderRadius: "4px",
                      }}
                    >
                      Coming Soon
                    </span>
                  )}
                </div>
                <p style={{ fontSize: "13px", color: "#6B7280", margin: 0, marginTop: "2px" }}>
                  {provider.description}
                </p>
              </div>

              {/* Arrow */}
              {provider.available && (
                <span style={{ fontSize: "18px", color: "#9CA3AF" }}>→</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}