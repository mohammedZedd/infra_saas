import { useEffect } from "react"

interface ConnectionErrorProps {
  message: string
  onClose: () => void
}

export default function ConnectionError({ message, onClose }: ConnectionErrorProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div
      style={{
        position: "absolute",
        top: "16px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 60,
        maxWidth: "500px",
        width: "90%",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          border: "1px solid #FECACA",
          borderRadius: "12px",
          padding: "16px 20px",
          boxShadow: "0 8px 24px rgba(220, 38, 38, 0.12), 0 4px 12px rgba(0,0,0,0.06)",
          display: "flex",
          alignItems: "flex-start",
          gap: "12px",
          animation: "slideDown 0.3s ease",
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "8px",
            backgroundColor: "#FEF2F2",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "#DC2626",
              margin: 0,
              marginBottom: "4px",
            }}
          >
            Invalid Connection
          </p>
          <p
            style={{
              fontSize: "12px",
              color: "#6B7280",
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            {message}
          </p>
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          style={{
            width: "24px",
            height: "24px",
            borderRadius: "4px",
            backgroundColor: "transparent",
            border: "none",
            cursor: "pointer",
            color: "#9CA3AF",
            fontSize: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#FEF2F2")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
        >
          ×
        </button>
      </div>
    </div>
  )
}