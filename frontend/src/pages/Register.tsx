import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import type { Variants } from "framer-motion"
import {
  Eye,
  EyeOff,
  Github,
  Check,
  CheckCircle2,
  Loader2,
  AlertCircle,
  User as UserIcon,
  Mail,
  Lock,
} from "lucide-react"
import api, { getApiErrorMessage } from "@/lib/api"

import useAuthStore, { type User } from "@/stores/useAuthStore"

// Temporary fix: define AuthUser type if not imported
type AuthUser = User;

interface RegisterResponse {
  token?: string
  accessToken?: string
  refreshToken?: string
  user?: AuthUser
}

// ── Step prop interfaces ───────────────────────────────────────────────────────

interface Step1Props {
  name: string
  email: string
  onChangeName: (v: string) => void
  onChangeEmail: (v: string) => void
  loading: boolean
  error: string | null
  onSubmit: (e: React.FormEvent) => void
}
interface Step2Props {
  email: string
  password: string
  confirmPassword: string
  onChangePassword: (v: string) => void
  onChangeConfirmPassword: (v: string) => void
  onGoBack: () => void
  loading: boolean
  error: string | null
  onSubmit: (e: React.FormEvent) => void
}
interface Step3Props {
  loading: boolean
  error: string | null
  selectedPlan: string
  onChangePlan: (plan: string) => void
  onSelect: () => void
}
interface SuccessScreenProps {
  name: string
  email: string
  onDashboard: () => void
}

// ── Inline SVG icons ──────────────────────────────────────────────────────────

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M19.6 10.23c0-.68-.06-1.36-.17-2H10v3.79h5.4a4.62 4.62 0 0 1-2 3.03v2.52h3.24C18.5 15.98 19.6 13.4 19.6 10.23Z" fill="#4285F4" />
      <path d="M10 20c2.7 0 4.97-.9 6.62-2.43l-3.24-2.52c-.9.6-2.04.96-3.38.96-2.6 0-4.8-1.75-5.59-4.11H1.07v2.6A10 10 0 0 0 10 20Z" fill="#34A853" />
      <path d="M4.41 11.9A6.01 6.01 0 0 1 4.1 10c0-.66.11-1.3.31-1.9V5.5H1.07A10 10 0 0 0 0 10c0 1.61.39 3.13 1.07 4.5l3.34-2.6Z" fill="#FBBC05" />
      <path d="M10 3.96c1.47 0 2.79.51 3.83 1.5l2.87-2.87C14.97.9 12.7 0 10 0A10 10 0 0 0 1.07 5.5l3.34 2.6C5.2 5.71 7.4 3.96 10 3.96Z" fill="#EA4335" />
    </svg>
  )
}

function MicrosoftIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
      <rect x="1"    y="1"    width="8.5" height="8.5" fill="#F35325" />
      <rect x="10.5" y="1"    width="8.5" height="8.5" fill="#81BC06" />
      <rect x="1"    y="10.5" width="8.5" height="8.5" fill="#05A6F0" />
      <rect x="10.5" y="10.5" width="8.5" height="8.5" fill="#FFBA08" />
    </svg>
  )
}

// ── Shared class strings (mirrors Login.tsx) ──────────────────────────────────

const inputCls = [
  "w-full border border-gray-300 rounded-lg px-4 py-2.5",
  "text-sm text-gray-900 placeholder:text-gray-400 bg-white",
  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
  "transition-colors",
].join(" ")

const primaryBtnCls = [
  "w-full bg-blue-600 text-white rounded-lg py-2.5 mt-3",
  "text-sm font-medium hover:bg-blue-700 active:bg-blue-800",
  "transition-colors flex items-center justify-center gap-2",
  "disabled:opacity-60 disabled:cursor-not-allowed",
].join(" ")

const socialBtnCls = [
  "w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5",
  "text-sm font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100",
  "transition-colors flex items-center justify-center gap-3",
].join(" ")

// ── Animation variants ────────────────────────────────────────────────────────

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show:   { opacity: 1, y: 0,  transition: { duration: 0.45, delay: 0.08 } },
}

// ── Progress indicator ────────────────────────────────────────────────────────

function StepDots({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6" aria-hidden="true">
      {[1, 2, 3].map((n) => (
        <div
          key={n}
          className={[
            "rounded-full transition-all",
            n === current
              ? "w-6 h-2 bg-blue-600"
              : n < current
              ? "w-2 h-2 bg-blue-300"
              : "w-2 h-2 bg-gray-200",
          ].join(" ")}
        />
      ))}
    </div>
  )
}

// ── Password strength bar (static visual) ────────────────────────────────────

function PasswordStrength() {
  const segments = [true, true, true, false] as const
  const label = "Good"
  const labelColor = "text-yellow-600"

  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {segments.map((filled, i) => (
          <div
            key={i}
            className={[
              "h-1 flex-1 rounded-full",
              filled ? "bg-yellow-400" : "bg-gray-200",
            ].join(" ")}
          />
        ))}
      </div>
      <p className={`text-xs mt-1 ${labelColor}`}>{label} password</p>
    </div>
  )
}

// ── Password requirement row ──────────────────────────────────────────────────

function Requirement({ met, label }: { met: boolean; label: string }) {
  return (
    <li className="flex items-center gap-1.5 text-xs">
      <Check
        className={met ? "text-green-500 w-3.5 h-3.5" : "text-gray-300 w-3.5 h-3.5"}
        aria-hidden="true"
      />
      <span className={met ? "text-gray-700" : "text-gray-400"}>{label}</span>
    </li>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 1 — Name + Email
// ─────────────────────────────────────────────────────────────────────────────

function Step1({ name, email, onChangeName, onChangeEmail, loading, error, onSubmit }: Step1Props) {
  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900 text-center mb-1">
        Create your account
      </h1>
      <p className="text-sm text-gray-500 text-center mb-6">
        Start building AWS infrastructure visually
      </p>

      {/* Social signup */}
      <div className="flex flex-col gap-3">
        <button type="button" className={socialBtnCls} aria-label="Sign up with Google">
          <GoogleIcon />
          Continue with Google
        </button>
        <button type="button" className={socialBtnCls} aria-label="Sign up with GitHub">
          <Github className="w-5 h-5 text-gray-800" aria-hidden="true" />
          Continue with GitHub
        </button>
        <button type="button" className={socialBtnCls} aria-label="Sign up with Microsoft">
          <MicrosoftIcon />
          Continue with Microsoft
        </button>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4 my-6" role="separator">
        <div className="flex-1 border-t border-gray-200" />
        <span className="text-sm text-gray-400">or</span>
        <div className="flex-1 border-t border-gray-200" />
      </div>

      {/* Error banner */}
      {error !== null && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-start gap-2" role="alert" aria-live="assertive">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" aria-hidden="true" />
          <span className="text-sm text-red-600 leading-snug">{error}</span>
        </div>
      )}

      <form onSubmit={onSubmit} noValidate>
        <div className="mb-4">
          <label htmlFor="r-name" className="block text-sm font-medium text-gray-700 mb-1.5">
            Full name
          </label>
          <div className="relative">
            <input
              id="r-name"
              type="text"
              placeholder="Alex Johnson"
              autoComplete="name"
              aria-label="Full name"
              value={name}
              onChange={(e) => onChangeName(e.target.value)}
              className={`${inputCls} pl-10`}
            />
            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
          </div>
        </div>

        <div className="mb-1">
          <label htmlFor="r-email" className="block text-sm font-medium text-gray-700 mb-1.5">
            Work email
          </label>
          <div className="relative">
            <input
              id="r-email"
              type="email"
              placeholder="you@company.com"
              autoComplete="email"
              aria-label="Work email"
              value={email}
              onChange={(e) => onChangeEmail(e.target.value)}
              className={`${inputCls} pl-10`}
            />
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
          </div>
        </div>

        <button type="submit" disabled={loading} className={primaryBtnCls}>
          {loading
            ? <><Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /><span>Checking...</span></>
            : "Continue"
          }
        </button>
      </form>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 2 — Password
// ─────────────────────────────────────────────────────────────────────────────

function Step2({ email, password, confirmPassword, onChangePassword, onChangeConfirmPassword, onGoBack, loading, error, onSubmit }: Step2Props) {
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900 text-center mb-1">
        Set your password
      </h1>
      <p className="text-sm text-gray-500 text-center mb-6">
        Choose a strong password for your account
      </p>

      {/* Email display */}
      <div className="flex items-center justify-between mb-4 px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg">
        <span className="text-sm text-gray-600 truncate" aria-label="Current email">
          {email}
        </span>
        <button
          type="button"
          className="text-xs font-medium text-blue-600 hover:underline ml-3 shrink-0 focus:outline-none"
          aria-label="Change email"
          onClick={onGoBack}
        >
          Change
        </button>
      </div>

      {/* Error banner */}
      {error !== null && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-start gap-2" role="alert" aria-live="assertive">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" aria-hidden="true" />
          <span className="text-sm text-red-600 leading-snug">{error}</span>
        </div>
      )}

      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <div>
          <label htmlFor="r-password" className="block text-sm font-medium text-gray-700 mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              id="r-password"
              type={showPw ? "text" : "password"}
              placeholder="Create a password"
              autoComplete="new-password"
              aria-label="Password"
              value={password}
              onChange={(e) => onChangePassword(e.target.value)}
              className={`${inputCls} pl-10 pr-10`}
            />
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
              aria-label={showPw ? "Hide password" : "Show password"}
              onClick={() => setShowPw((v) => !v)}
              tabIndex={-1}
            >
              {showPw
                ? <EyeOff className="w-4 h-4" aria-hidden="true" />
                : <Eye    className="w-4 h-4" aria-hidden="true" />
              }
            </button>
          </div>
          <PasswordStrength />
        </div>

        <div>
          <label htmlFor="r-confirm" className="block text-sm font-medium text-gray-700 mb-1.5">
            Confirm password
          </label>
          <div className="relative">
            <input
              id="r-confirm"
              type={showConfirm ? "text" : "password"}
              placeholder="Repeat your password"
              autoComplete="new-password"
              aria-label="Confirm password"
              value={confirmPassword}
              onChange={(e) => onChangeConfirmPassword(e.target.value)}
              className={`${inputCls} pl-10 pr-10`}
            />
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
              aria-label={showConfirm ? "Hide confirmation" : "Show confirmation"}
              onClick={() => setShowConfirm((v) => !v)}
              tabIndex={-1}
            >
              {showConfirm
                ? <EyeOff className="w-4 h-4" aria-hidden="true" />
                : <Eye    className="w-4 h-4" aria-hidden="true" />
              }
            </button>
          </div>
        </div>

        <ul className="space-y-1 px-1" aria-label="Password requirements">
          <Requirement met label="At least 8 characters" />
          <Requirement met label="One uppercase letter" />
          <Requirement met label="One number" />
          <Requirement met={false} label="One special character" />
        </ul>

        <button type="submit" disabled={loading} className={primaryBtnCls}>
          {loading
            ? <><Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /><span>Continuing...</span></>
            : "Continue"
          }
        </button>
      </form>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 3 — Plan selection
// ─────────────────────────────────────────────────────────────────────────────

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "forever",
    features: ["1 project", "5 AWS resources", "Community support"],
    highlighted: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "$29",
    period: "/month",
    features: ["Unlimited projects", "All AWS resources", "Priority support", "Team collaboration"],
    highlighted: true,
  },
  {
    id: "team",
    name: "Team",
    price: "$79",
    period: "/month",
    features: ["Everything in Pro", "SSO / SAML", "Audit logs", "SLA guarantee"],
    highlighted: false,
  },
] as const

function Step3({ loading, error, selectedPlan, onChangePlan, onSelect }: Step3Props) {
  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900 text-center mb-1">
        Choose a plan
      </h1>
      <p className="text-sm text-gray-500 text-center mb-6">
        You can change this at any time
      </p>

      {/* Error banner */}
      {error !== null && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-start gap-2" role="alert" aria-live="assertive">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" aria-hidden="true" />
          <span className="text-sm text-red-600 leading-snug">{error}</span>
        </div>
      )}

      <div className="space-y-3">
        {PLANS.map((plan) => {
          const isSelected = selectedPlan === plan.id
          return (
            <button
              key={plan.id}
              type="button"
              onClick={() => onChangePlan(plan.id)}
              className={[
                "w-full cursor-pointer text-left rounded-xl border p-4 transition-colors",
                isSelected
                  ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50",
              ].join(" ")}
              aria-pressed={isSelected}
              aria-label={`Select ${plan.name} plan`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900 text-sm">{plan.name}</span>
                  {plan.highlighted && (
                    <span className="text-xs bg-blue-600 text-white rounded-full px-2 py-0.5 font-medium">
                      Popular
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <span className="font-bold text-gray-900">{plan.price}</span>
                  <span className="text-xs text-gray-500 ml-0.5">{plan.period}</span>
                </div>
              </div>
              <ul className="mt-2 space-y-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Check className="w-3 h-3 text-green-500 shrink-0" aria-hidden="true" />
                    {f}
                  </li>
                ))}
              </ul>
            </button>
          )
        })}
      </div>

      <button type="button" disabled={loading} className={primaryBtnCls} onClick={onSelect}>
        {loading
          ? <><Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /><span>Creating account...</span></>
          : "Create account"
        }
      </button>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Success screen
// ─────────────────────────────────────────────────────────────────────────────

function SuccessScreen({ name, email, onDashboard }: SuccessScreenProps) {
  return (
    <div className="text-center py-4">
      <div className="flex items-center justify-center mb-4">
        <div className="w-16 h-16 rounded-full bg-green-50 border border-green-100 flex items-center justify-center">
          <CheckCircle2 className="w-9 h-9 text-green-500" aria-hidden="true" />
        </div>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">
        {"You're all set!"}
      </h1>
      <p className="text-sm text-gray-500 mb-2">
        Welcome to CloudForge,{" "}
        <span className="font-medium text-gray-700">{name || "there"}</span>!
      </p>
      <p className="text-xs text-gray-400 mb-8">
        A confirmation email has been sent to{" "}
        <span className="text-gray-600">{email}</span>
      </p>
      <button
        type="button"
        className={primaryBtnCls}
        onClick={onDashboard}
        style={{ marginTop: 0 }}
      >
        Go to Dashboard
      </button>
      <p className="text-xs text-gray-400 mt-4">
        {"Didn't receive an email? "}
        <Link to="#" className="text-blue-600 hover:underline">
          Resend
        </Link>
      </p>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Root component
// ─────────────────────────────────────────────────────────────────────────────

export default function Register() {
  const [step, setStep] = useState<1 | 2 | 3 | "success">(1)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [selectedPlan, setSelectedPlan] = useState<string>("pro")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const navigate   = useNavigate()
  const storeLogin = useAuthStore((s) => s.login)

  const advance = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (step === 1) {
        if (!name.trim()) throw new Error("Please enter your full name.")
        if (!email.trim()) throw new Error("Please enter your email address.")
        setStep(2)
      } else if (step === 2) {
        if (!password) throw new Error("Please enter a password.")
        if (password.length < 8) throw new Error("Password must be at least 8 characters.")
        if (password !== confirmPassword) throw new Error("Passwords do not match.")
        setStep(3)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  const selectPlan = async () => {
    setError(null)
    setLoading(true)
    try {
      const normalizedEmail = email.trim().toLowerCase()

      // Register the account
      const res = await api.post<RegisterResponse>("/auth/register", {
        email: normalizedEmail,
        password,
        full_name: name.trim(),
        plan: selectedPlan,
      })

      const accessToken = res.data.accessToken ?? res.data.token ?? ""
      if (!accessToken) throw new Error("Registration failed. Please try again.")

      const refreshToken = res.data.refreshToken ?? ""

      // Store token for ProtectedRoute check
      localStorage.setItem("auth_token", accessToken)

      // Hydrate zustand store
      const user: User = {
        id:       res.data.user?.id       ?? "",
        email:    res.data.user?.email    ?? normalizedEmail,
        name:     res.data.user?.name     ?? name.trim(),
        username: res.data.user?.email    ?? normalizedEmail,
        avatar:   null,
        plan:     (res.data.user?.plan as User["plan"]) ?? "free",
      }
      storeLogin(user, accessToken, refreshToken)

      setStep("success")
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const stepNumber = step === "success" ? 3 : (step as number)

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="show">
        {/* Step dots — hidden on success */}
        {step !== "success" && <StepDots current={stepNumber} />}

        {/* Step views */}
        {step === 1 && (
          <Step1
            name={name} email={email}
            onChangeName={setName} onChangeEmail={setEmail}
            loading={loading} error={error} onSubmit={advance}
          />
        )}
        {step === 2 && (
          <Step2
            email={email}
            password={password}
            confirmPassword={confirmPassword}
            onChangePassword={setPassword}
            onChangeConfirmPassword={setConfirmPassword}
            onGoBack={() => { setStep(1); setError(null) }}
            loading={loading} error={error} onSubmit={advance}
          />
        )}
        {step === 3 && <Step3
          loading={loading}
          error={error}
          selectedPlan={selectedPlan}
          onChangePlan={setSelectedPlan}
          onSelect={selectPlan}
        />}
        {step === "success" && (
          <SuccessScreen name={name} email={email} onDashboard={() => navigate("/dashboard", { replace: true })} />
        )}

        {/* Terms */}
        {step !== "success" && (
          <p className="text-xs text-gray-400 text-center mt-5 leading-relaxed">
            By continuing, you agree to our{" "}
            <Link to="#" className="text-blue-600 hover:underline focus:outline-none">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="#" className="text-blue-600 hover:underline focus:outline-none">
              Privacy Policy
            </Link>
            .
          </p>
        )}
      {/* Sign in link */}
      <p className="mt-6 pt-5 border-t border-gray-100 text-sm text-gray-500 text-center">
        Already have an account?{" "}
        <Link
          to="/login"
          className="text-blue-600 font-medium hover:underline focus:outline-none"
        >
          Log in
        </Link>
      </p>
    </motion.div>
  )
}
