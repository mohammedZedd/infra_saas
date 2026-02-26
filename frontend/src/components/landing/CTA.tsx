import { Link } from "react-router-dom"

export default function CTA() {
  return (
    <section style={{ padding: "80px 24px" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
        <div
          style={{
            background: "linear-gradient(135deg, #4F6EF7, #7C3AED)",
            borderRadius: "20px",
            padding: "64px 48px",
          }}
        >
          <h2 style={{ fontSize: "36px", fontWeight: 700, color: "white", marginBottom: "14px" }}>
            Ready to build?
          </h2>
          <p style={{ fontSize: "17px", color: "rgba(255,255,255,0.8)", marginBottom: "32px" }}>
            Join teams already shipping infrastructure faster with InfraDesigner.
          </p>
          <Link
            to="/register"
            style={{
              display: "inline-block",
              padding: "14px 32px",
              backgroundColor: "white",
              color: "#4F6EF7",
              fontWeight: 600,
              fontSize: "15px",
              borderRadius: "10px",
              textDecoration: "none",
              boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
            }}
          >
            Get Started Free
          </Link>
        </div>
      </div>
    </section>
  )
}