import { Link, useNavigate } from "react-router-dom"
import { useState } from "react"

export default function DashboardNavbar() {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    // TODO: clear JWT token
    navigate("/login")
  }

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
        <Link
          to="/dashboard"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            textDecoration: "none",
          }}
        >
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

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {/* Upgrade button */}
          <Link
            to="/pricing"
            style={{
              fontSize: "13px",
              fontWeight: 500,
              color: "#4F6EF7",
              backgroundColor: "#EEF2FF",
              padding: "6px 14px",
              borderRadius: "6px",
              textDecoration: "none",
              border: "1px solid #C7D2FE",
            }}
          >
            Upgrade
          </Link>

          {/* Avatar dropdown */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #4F6EF7, #7C3AED)",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ color: "white", fontSize: "14px", fontWeight: 600 }}>J</span>
            </button>

            {/* Dropdown */}
            {menuOpen && (
              <>
                {/* Overlay to close */}
                <div
                  onClick={() => setMenuOpen(false)}
                  style={{
                    position: "fixed",
                    inset: 0,
                    zIndex: 40,
                  }}
                ></div>

                <div
                  style={{
                    position: "absolute",
                    top: "44px",
                    right: 0,
                    width: "200px",
                    backgroundColor: "white",
                    border: "1px solid #E5E7EB",
                    borderRadius: "10px",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                    padding: "6px",
                    zIndex: 50,
                  }}
                >
                  {/* User info */}
                  <div
                    style={{
                      padding: "10px 12px",
                      borderBottom: "1px solid #F3F4F6",
                      marginBottom: "4px",
                    }}
                  >
                    <p style={{ fontSize: "14px", fontWeight: 500, color: "#111827" }}>John Doe</p>
                    <p style={{ fontSize: "12px", color: "#9CA3AF" }}>john@company.com</p>
                  </div>

                  <DropdownItem label="Settings" onClick={() => setMenuOpen(false)} />
                  <DropdownItem label="Billing" onClick={() => setMenuOpen(false)} />
                  <div style={{ height: "1px", backgroundColor: "#F3F4F6", margin: "4px 0" }}></div>
                  <DropdownItem label="Log out" onClick={handleLogout} danger />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

function DropdownItem({
  label,
  onClick,
  danger = false,
}: {
  label: string
  onClick: () => void
  danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        padding: "8px 12px",
        fontSize: "13px",
        fontWeight: 500,
        color: danger ? "#DC2626" : "#374151",
        backgroundColor: "transparent",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        textAlign: "left",
        transition: "background-color 0.1s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = danger ? "#FEF2F2" : "#F9FAFB")}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
    >
      {label}
    </button>
  )
}