import Navbar from "../components/layout/Navbar"
import Footer from "../components/layout/Footer"
import Hero from "../components/landing/Hero"
import Features from "../components/landing/Features"
import CTA from "../components/landing/CTA"

export default function Landing() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#FAFBFC" }}>
      <Navbar />
      <Hero />
      <Features />
      <CTA />
      <Footer />
    </div>
  )
}