import Footer from "../components/layout/Footer"
import Hero from "../components/landing/Hero"
import Features from "../components/landing/Features"
import CTA from "../components/landing/CTA"
import Pricing from "../components/landing/Pricing"

export default function Landing() {
  return (
    <div className="bg-white">
      <Hero />
      <Features />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  )
}

