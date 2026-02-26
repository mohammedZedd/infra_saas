import { Link } from "react-router-dom"
import CanvasNode from "./CanvasNode"

export default function Hero() {
  return (
    <section
      style={{
        paddingTop: "140px",
        paddingBottom: "80px",
        paddingLeft: "24px",
        paddingRight: "24px",
      }}
    >
      <div style={{ maxWidth: "1000px", margin: "0 auto", textAlign: "center" }}>
        {/* Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 14px",
            backgroundColor: "#EEF2FF",
            border: "1px solid #C7D2FE",
            borderRadius: "9999px",
            marginBottom: "24px",
          }}
        >
          <span
            style={{
              width: "8px",
              height: "8px",
              backgroundColor: "#4F6EF7",
              borderRadius: "50%",
            }}
          ></span>
          <span style={{ fontSize: "13px", fontWeight: 500, color: "#4338CA" }}>Now in Beta</span>
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: "clamp(36px, 5vw, 58px)",
            fontWeight: 700,
            color: "#111827",
            lineHeight: 1.15,
            marginBottom: "20px",
          }}
        >
          Design AWS Infrastructure
          <br />
          <span
            style={{
              background: "linear-gradient(135deg, #4F6EF7, #7C3AED)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Visually
          </span>
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: "18px",
            color: "#6B7280",
            lineHeight: 1.7,
            maxWidth: "600px",
            margin: "0 auto 40px",
          }}
        >
          Drag, drop, and deploy. Build production-ready AWS architectures
          with a visual canvas and generate Terraform code instantly.
        </p>

        {/* CTA Buttons */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
            marginBottom: "60px",
          }}
        >
          <Link
            to="/register"
            style={{
              padding: "12px 28px",
              backgroundColor: "#4F6EF7",
              color: "white",
              fontWeight: 500,
              fontSize: "15px",
              borderRadius: "10px",
              textDecoration: "none",
              boxShadow: "0 4px 14px rgba(79, 110, 247, 0.3)",
            }}
          >
            Start Building Free
          </Link>
          <a
            href="#demo"
            style={{
              padding: "12px 28px",
              backgroundColor: "white",
              color: "#374151",
              fontWeight: 500,
              fontSize: "15px",
              borderRadius: "10px",
              border: "1px solid #D1D5DB",
              textDecoration: "none",
            }}
          >
            Watch Demo
          </a>
        </div>

        {/* Screenshot Mockup */}
        <div style={{ maxWidth: "960px", margin: "0 auto" }}>
          <div
            style={{
              border: "1px solid #E5E7EB",
              borderRadius: "16px",
              overflow: "hidden",
              boxShadow: "0 25px 60px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.03)",
              backgroundColor: "white",
            }}
          >
            {/* Window bar */}
            <div
              style={{
                backgroundColor: "#F9FAFB",
                borderBottom: "1px solid #E5E7EB",
                padding: "14px 18px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <div style={{ display: "flex", gap: "6px" }}>
                <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#EF4444" }}></div>
                <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#F59E0B" }}></div>
                <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#22C55E" }}></div>
              </div>
              <div style={{ flex: 1, textAlign: "center" }}>
                <span
                  style={{
                    fontSize: "12px",
                    color: "#9CA3AF",
                    backgroundColor: "#F3F4F6",
                    padding: "4px 12px",
                    borderRadius: "6px",
                  }}
                >
                  my-project.infradesigner.io
                </span>
              </div>
              <div style={{ width: "56px" }}></div>
            </div>

            {/* Canvas area */}
            <div
              style={{
                aspectRatio: "16/9",
                background: "linear-gradient(135deg, #EEF2FF, #F5F3FF, #EFF6FF)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div style={{ display: "flex", gap: "40px", alignItems: "center" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "20px", alignItems: "center" }}>
                  <CanvasNode color="#F59E0B" label="API Gateway" />
                  <CanvasNode color="#8B5CF6" label="Lambda" />
                </div>
                <div
                  style={{
                    width: "60px",
                    height: "2px",
                    backgroundColor: "#D1D5DB",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      right: "-4px",
                      top: "-3px",
                      width: "8px",
                      height: "8px",
                      borderRight: "2px solid #D1D5DB",
                      borderBottom: "2px solid #D1D5DB",
                      transform: "rotate(-45deg)",
                    }}
                  ></div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "20px", alignItems: "center" }}>
                  <CanvasNode color="#3B82F6" label="EC2" />
                  <CanvasNode color="#EF4444" label="RDS" />
                  <CanvasNode color="#22C55E" label="S3" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}