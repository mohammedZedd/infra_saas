import { Link } from "react-router-dom"

export default function Navbar() {
  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "64px",
        backgroundColor: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid #E5E7EB",
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 24px",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #4F6EF7, #7C3AED)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ color: "white", fontSize: "13px", fontWeight: 700 }}>ID</span>
          </div>
          <span style={{ fontSize: "17px", fontWeight: 600, color: "#111827" }}>InfraDesigner</span>
        </Link>

        {/* Center links */}
        <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
          <a href="#features" style={{ fontSize: "14px", fontWeight: 500, color: "#6B7280", textDecoration: "none" }}>
            Features
          </a>
          <Link to="/pricing" style={{ fontSize: "14px", fontWeight: 500, color: "#6B7280", textDecoration: "none" }}>
            Pricing
          </Link>
          <a href="#docs" style={{ fontSize: "14px", fontWeight: 500, color: "#6B7280", textDecoration: "none" }}>
            Docs
          </a>
        </div>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link
            to="/login"
            style={{ fontSize: "14px", fontWeight: 500, color: "#374151", textDecoration: "none", padding: "8px 16px" }}
          >
            Sign in
          </Link>
          <Link
            to="/register"
            style={{
              fontSize: "14px",
              fontWeight: 500,
              color: "white",
              backgroundColor: "#4F6EF7",
              padding: "8px 18px",
              borderRadius: "8px",
              textDecoration: "none",
            }}
          >
            Get Started →
          </Link>
        </div>
      </div>
    </nav>
  )
}