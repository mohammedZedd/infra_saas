import { useEffect, useState } from "react"
import useEditorStore from "../../stores/useEditorStore"

/**
 * Affiche les erreurs de connexion de manière visible et temporaire
 */
export default function ConnectionErrorNotification() {
  const connectionError = useEditorStore((s: any) => s.connectionError)
  const clearConnectionError = useEditorStore((s: any) => s.clearConnectionError)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (connectionError) {
      setIsVisible(true)
      // Auto-dismiss après 5 secondes
      const timer = setTimeout(() => {
        setIsVisible(false)
        // Attendre 300ms avant de clear pour la transition
        setTimeout(() => clearConnectionError(), 300)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [connectionError, clearConnectionError])

  if (!connectionError || !isVisible) return null

  return (
    <div
      style={{
        position: "fixed",
        bottom: "30px",
        left: "50%",
        transform: "translateX(-50%)",
        backgroundColor: "#FEE2E2",
        border: "1.5px solid #FCA5A5",
        borderRadius: "12px",
        padding: "16px 24px",
        maxWidth: "500px",
        zIndex: 999,
        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
        animation: "slideUp 0.3s ease-out",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
        <span style={{ fontSize: "20px", flexShrink: 0 }}>⚠️</span>
        <div style={{ flex: 1 }}>
          <p
            style={{
              margin: "0 0 6px",
              fontSize: "13px",
              fontWeight: 600,
              color: "#991B1B",
            }}
          >
            Invalid Connection
          </p>
          <p
            style={{
              margin: 0,
              fontSize: "12px",
              color: "#7F1D1D",
              lineHeight: 1.5,
            }}
          >
            {connectionError}
          </p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false)
            setTimeout(() => clearConnectionError(), 300)
          }}
          style={{
            background: "none",
            border: "none",
            color: "#991B1B",
            cursor: "pointer",
            fontSize: "18px",
            padding: 0,
            flexShrink: 0,
          }}
        >
          ✕
        </button>
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
