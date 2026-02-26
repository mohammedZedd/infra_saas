export default function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid #E5E7EB",
        padding: "32px 24px",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "24px",
              height: "24px",
              borderRadius: "6px",
              background: "linear-gradient(135deg, #4F6EF7, #7C3AED)",
            }}
          ></div>
          <span style={{ fontSize: "14px", fontWeight: 500, color: "#6B7280" }}>InfraDesigner</span>
        </div>
        <p style={{ fontSize: "13px", color: "#9CA3AF" }}>© 2025 InfraDesigner. All rights reserved.</p>
      </div>
    </footer>
  )
}