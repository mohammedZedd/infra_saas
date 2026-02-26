import { useState } from "react"
import { useNavigate } from "react-router-dom"

export default function LoginForm() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email || !password) {
      setError("Please fill in all fields")
      return
    }

    setLoading(true)

    // TODO: connect to backend API
    setTimeout(() => {
      setLoading(false)
      navigate("/dashboard")
    }, 1000)
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Error */}
      {error && (
        <div
          style={{
            padding: "10px 14px",
            backgroundColor: "#FEF2F2",
            border: "1px solid #FECACA",
            borderRadius: "8px",
            marginBottom: "16px",
          }}
        >
          <span style={{ fontSize: "13px", color: "#DC2626" }}>{error}</span>
        </div>
      )}

      {/* Email */}
      <div style={{ marginBottom: "16px" }}>
        <label
          style={{
            display: "block",
            fontSize: "13px",
            fontWeight: 500,
            color: "#374151",
            marginBottom: "6px",
          }}
        >
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          style={{
            width: "100%",
            padding: "10px 14px",
            fontSize: "14px",
            color: "#111827",
            backgroundColor: "#FAFBFC",
            border: "1px solid #D1D5DB",
            borderRadius: "8px",
            outline: "none",
            transition: "border-color 0.15s",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#4F6EF7")}
          onBlur={(e) => (e.target.style.borderColor = "#D1D5DB")}
        />
      </div>

      {/* Password */}
      <div style={{ marginBottom: "8px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "6px",
          }}
        >
          <label style={{ fontSize: "13px", fontWeight: 500, color: "#374151" }}>
            Password
          </label>
          <a
            href="#"
            style={{
              fontSize: "12px",
              color: "#4F6EF7",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            Forgot password?
          </a>
        </div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          style={{
            width: "100%",
            padding: "10px 14px",
            fontSize: "14px",
            color: "#111827",
            backgroundColor: "#FAFBFC",
            border: "1px solid #D1D5DB",
            borderRadius: "8px",
            outline: "none",
            transition: "border-color 0.15s",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#4F6EF7")}
          onBlur={(e) => (e.target.style.borderColor = "#D1D5DB")}
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        style={{
          width: "100%",
          padding: "11px",
          marginTop: "20px",
          fontSize: "14px",
          fontWeight: 500,
          color: "white",
          backgroundColor: loading ? "#93A3F8" : "#4F6EF7",
          border: "none",
          borderRadius: "8px",
          cursor: loading ? "not-allowed" : "pointer",
          transition: "background-color 0.15s",
          boxShadow: "0 2px 8px rgba(79, 110, 247, 0.25)",
        }}
        onMouseEnter={(e) => {
          if (!loading) e.currentTarget.style.backgroundColor = "#4461F2"
        }}
        onMouseLeave={(e) => {
          if (!loading) e.currentTarget.style.backgroundColor = "#4F6EF7"
        }}
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>

      {/* Divider */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          margin: "24px 0",
        }}
      >
        <div style={{ flex: 1, height: "1px", backgroundColor: "#E5E7EB" }}></div>
        <span style={{ fontSize: "12px", color: "#9CA3AF" }}>or</span>
        <div style={{ flex: 1, height: "1px", backgroundColor: "#E5E7EB" }}></div>
      </div>

      {/* GitHub button */}
      <button
        type="button"
        style={{
          width: "100%",
          padding: "11px",
          fontSize: "14px",
          fontWeight: 500,
          color: "#374151",
          backgroundColor: "white",
          border: "1px solid #D1D5DB",
          borderRadius: "8px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          transition: "background-color 0.15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F9FAFB")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "white")}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#111827">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
        Continue with GitHub
      </button>
    </form>
  )
}