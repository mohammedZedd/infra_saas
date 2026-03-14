import React from "react"
import { Link } from "react-router-dom"
import {
  Cloud,
  ArrowRight,
  Zap,
  CheckCircle2,
  Server,
  GitBranch,
} from "lucide-react"

// ---------------------------------------------------------------------------
// Navbar
// ---------------------------------------------------------------------------

function Navbar(): React.ReactElement {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-md">
      <div className="mx-auto grid h-16 max-w-7xl grid-cols-3 items-center px-6">
        {/* Left: logo */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <Cloud className="h-4 w-4 text-white" />
            </div>
            <span className="text-[15px] font-semibold text-gray-900">CloudForge</span>
          </Link>
        </div>

        {/* Center: nav links — truly centered regardless of logo width */}
        <nav className="hidden items-center justify-center gap-8 md:flex">
          <a href="#features" className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900">
            Features
          </a>
          <a href="#pricing" className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900">
            Pricing
          </a>
        </nav>

        {/* Right: auth links + CTA */}
        <div className="hidden items-center justify-end gap-6 md:flex">
          <Link to="/login" className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900">
            Login
          </Link>
          <Link to="/register" className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900">
            Register
          </Link>
          <Link
            to="/register"
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            Get Started
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </header>
  )
}

// ---------------------------------------------------------------------------
// Product mock card shown on the right side of the hero
// ---------------------------------------------------------------------------

interface MockNodeProps {
  colour: string
  label: string
  status?: "active" | "idle"
}

function MockNode({ colour, label, status = "idle" }: MockNodeProps): React.ReactElement {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
      <div
        className="flex h-8 w-8 items-center justify-center rounded-lg"
        style={{ backgroundColor: colour }}
      >
        <Server className="h-4 w-4 text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-gray-800">{label}</p>
        <p className="text-[10px] text-gray-400">{status === "active" ? "Running" : "Standby"}</p>
      </div>
      <div
        className={`ml-auto h-2 w-2 rounded-full ${
          status === "active" ? "bg-emerald-400" : "bg-gray-300"
        }`}
      />
    </div>
  )
}

function ProductMock(): React.ReactElement {
  return (
    <div className="relative mx-auto max-w-md lg:max-w-none">
      {/* Decorative glow */}
      <div
        aria-hidden
        className="absolute -inset-4 rounded-3xl opacity-30 blur-2xl"
        style={{ background: "radial-gradient(ellipse at 60% 40%, #3B82F6 0%, transparent 70%)" }}
      />

      {/* Window chrome */}
      <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-blue-100/50">
        {/* Title bar */}
        <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-4 py-3">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-400" />
            <div className="h-3 w-3 rounded-full bg-yellow-400" />
            <div className="h-3 w-3 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 text-center">
            <span className="rounded bg-gray-100 px-3 py-0.5 text-[11px] text-gray-400">
              app.cloudforge.io/editor
            </span>
          </div>
        </div>

        {/* Canvas area */}
        <div className="grid grid-cols-2 gap-3 bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-50 p-6">
          <div className="flex flex-col gap-3">
            <MockNode colour="#F59E0B" label="API Gateway" status="active" />
            <MockNode colour="#8B5CF6" label="Lambda" status="active" />
            <MockNode colour="#EF4444" label="RDS Aurora" />
          </div>
          <div className="flex flex-col gap-3 pt-6">
            <MockNode colour="#3B82F6" label="EC2 Cluster" status="active" />
            <MockNode colour="#10B981" label="S3 Bucket" />
            <MockNode colour="#6366F1" label="CloudFront" status="active" />
          </div>
        </div>

        {/* Stats bar */}
        <div className="flex items-center justify-between border-t border-gray-100 bg-white px-5 py-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <GitBranch className="h-3.5 w-3.5 text-blue-500" />
            main
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Deployed
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Zap className="h-3.5 w-3.5 text-yellow-500" />
            6 resources
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Hero section
// ---------------------------------------------------------------------------

export default function Hero(): React.ReactElement {
  return (
    <>
      <Navbar />

      <section className="relative overflow-hidden bg-white pt-32 pb-20">
        {/* Subtle background decorations */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full opacity-[0.06] blur-3xl"
          style={{ background: "radial-gradient(ellipse, #3B82F6, transparent 70%)" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-0 right-0 h-[400px] w-[400px] rounded-full opacity-[0.04] blur-3xl"
          style={{ background: "radial-gradient(ellipse, #6366F1, transparent 70%)" }}
        />

        <div className="relative mx-auto max-w-7xl px-6">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            {/* ---- Left: copy ---- */}
            <div className="flex flex-col items-start">
              {/* Badge */}
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                <span className="text-xs font-medium text-blue-700">Now in Beta — free to try</span>
              </div>

              {/* Headline */}
              <h1 className="mb-5 text-[clamp(2.25rem,4vw,3.5rem)] font-bold leading-[1.12] tracking-tight text-gray-900">
                Design AWS
                <br />
                Infrastructure{" "}
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Visually
                </span>
              </h1>

              {/* Subtitle */}
              <p className="mb-8 max-w-md text-lg leading-relaxed text-gray-500">
                Drag, drop, and deploy. Build production-ready AWS architectures with a
                visual canvas and generate Terraform code instantly — no YAML required.
              </p>

              {/* Buttons */}
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-blue-200 transition-all hover:bg-blue-700 hover:shadow-blue-300"
                >
                  Get Started — it&apos;s free
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#pricing"
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:border-gray-300 hover:bg-gray-50"
                >
                  View Pricing
                </a>
              </div>

              {/* Social proof */}
              <p className="mt-6 text-xs text-gray-400">
                Trusted by{" "}
                <span className="font-medium text-gray-600">500+ infrastructure teams</span>
              </p>
            </div>

            {/* ---- Right: product mock ---- */}
            <ProductMock />
          </div>
        </div>
      </section>
    </>
  )
}