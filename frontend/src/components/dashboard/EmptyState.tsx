interface EmptyStateProps {
  onCreateProject: () => void
}

export default function EmptyState({ onCreateProject }: EmptyStateProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 24px",
        textAlign: "center",
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: "72px",
          height: "72px",
          borderRadius: "16px",
          backgroundColor: "#EEF2FF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "24px",
        }}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4F6EF7" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="12" y1="8" x2="12" y2="16" />
          <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
      </div>

      <h3
        style={{
          fontSize: "20px",
          fontWeight: 600,
          color: "#111827",
          marginBottom: "8px",
        }}
      >
        No projects yet
      </h3>

      <p
        style={{
          fontSize: "14px",
          color: "#6B7280",
          marginBottom: "28px",
          maxWidth: "360px",
          lineHeight: 1.6,
        }}
      >
        Create your first project to start designing AWS infrastructure visually.
      </p>

      <button
        onClick={onCreateProject}
        style={{
          padding: "10px 24px",
          fontSize: "14px",
          fontWeight: 500,
          color: "white",
          backgroundColor: "#4F6EF7",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          boxShadow: "0 2px 8px rgba(79, 110, 247, 0.25)",
          transition: "background-color 0.15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#4461F2")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#4F6EF7")}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        New Project
      </button>
    </div>
  )
}