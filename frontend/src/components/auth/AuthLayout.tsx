import { Link } from "react-router-dom"

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle: string
  footerText: string
  footerLinkText: string
  footerLinkTo: string
}

export default function AuthLayout({
  children,
  title,
  subtitle,
  footerText,
  footerLinkText,
  footerLinkTo,
}: AuthLayoutProps) {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#FAFBFC",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div style={{ width: "100%", maxWidth: "420px" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <Link
            to="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              textDecoration: "none",
              marginBottom: "32px",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #4F6EF7, #7C3AED)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ color: "white", fontSize: "14px", fontWeight: 700 }}>ID</span>
            </div>
            <span style={{ fontSize: "19px", fontWeight: 600, color: "#111827" }}>InfraDesigner</span>
          </Link>
        </div>

        {/* Card */}
        <div
          style={{
            backgroundColor: "white",
            border: "1px solid #E5E7EB",
            borderRadius: "16px",
            padding: "36px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
          }}
        >
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#111827", marginBottom: "8px" }}>
              {title}
            </h1>
            <p style={{ fontSize: "14px", color: "#6B7280" }}>{subtitle}</p>
          </div>

          {/* Form content */}
          {children}

          {/* Footer link */}
          <div style={{ textAlign: "center", marginTop: "24px" }}>
            <span style={{ fontSize: "14px", color: "#6B7280" }}>
              {footerText}{" "}
              <Link
                to={footerLinkTo}
                style={{
                  color: "#4F6EF7",
                  fontWeight: 500,
                  textDecoration: "none",
                }}
              >
                {footerLinkText}
              </Link>
            </span>
          </div>
        </div>

        {/* Back to home */}
        <div style={{ textAlign: "center", marginTop: "24px" }}>
          <Link
            to="/"
            style={{
              fontSize: "13px",
              color: "#9CA3AF",
              textDecoration: "none",
            }}
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}