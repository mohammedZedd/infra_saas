import FeatureCard from "../ui/FeatureCard"

export default function Features() {
  const features = [
    {
      icon: "🎨",
      color: "#EEF2FF",
      title: "Visual Canvas",
      description:
        "Drag and drop AWS components. Connect them visually. See your architecture come to life in real-time.",
    },
    {
      icon: "⚡",
      color: "#F5F3FF",
      title: "Terraform Export",
      description:
        "Generate production-ready HCL code. Download instantly. Deploy with confidence using industry standards.",
    },
    {
      icon: "🔒",
      color: "#ECFDF5",
      title: "Best Practices",
      description:
        "Built-in security rules. AWS Well-Architected validation. Ship infrastructure you can trust.",
    },
  ]

  return (
    <section
      id="features"
      style={{
        padding: "80px 24px",
        backgroundColor: "white",
        borderTop: "1px solid #F3F4F6",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "60px" }}>
          <h2 style={{ fontSize: "36px", fontWeight: 700, color: "#111827", marginBottom: "14px" }}>
            Everything you need to ship faster
          </h2>
          <p style={{ fontSize: "17px", color: "#6B7280", maxWidth: "550px", margin: "0 auto" }}>
            Stop writing boilerplate. Focus on architecture, not syntax.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "24px",
          }}
        >
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  )
}