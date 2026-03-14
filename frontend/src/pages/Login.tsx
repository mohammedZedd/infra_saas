import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import type { Variants } from "framer-motion"
import { Eye, EyeOff, Loader2, AlertCircle, Github } from "lucide-react"
import api, { getApiErrorMessage } from "@/lib/api"
import useAuthStore, { type User } from "@/stores/useAuthStore"

// ── Login API response ────────────────────────────────────────────────────────
interface LoginResponse {
  token?: string
  accessToken?: string
  refreshToken?: string
  idToken?: string
  user?: User
}

// ── Inline SVG icons ──────────────────────────────────────────────────────────

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M19.6 10.23c0-.68-.06-1.36-.17-2H10v3.79h5.4a4.62 4.62 0 0 1-2 3.03v2.52h3.24C18.5 15.98 19.6 13.4 19.6 10.23Z"
        fill="#4285F4"
      />
      <path
        d="M10 20c2.7 0 4.97-.9 6.62-2.43l-3.24-2.52c-.9.6-2.04.96-3.38.96-2.6 0-4.8-1.75-5.59-4.11H1.07v2.6A10 10 0 0 0 10 20Z"
        fill="#34A853"
      />
      <path
        d="M4.41 11.9A6.01 6.01 0 0 1 4.1 10c0-.66.11-1.3.31-1.9V5.5H1.07A10 10 0 0 0 0 10c0 1.61.39 3.13 1.07 4.5l3.34-2.6Z"
        fill="#FBBC05"
      />
      <path
        d="M10 3.96c1.47 0 2.79.51 3.83 1.5l2.87-2.87C14.97.9 12.7 0 10 0A10 10 0 0 0 1.07 5.5l3.34 2.6C5.2 5.71 7.4 3.96 10 3.96Z"
        fill="#EA4335"
      />
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

// ── Shared Tailwind class strings ─────────────────────────────────────────────

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

// ── Component ─────────────────────────────────────────────────────────────────
export default function Login() {
  const [step, setStep] = useState<"email" | "password">("email")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const navigate  = useNavigate()
  const storeLogin = useAuthStore((s) => s.login)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (step === "email") {
        if (!email.trim()) throw new Error("Please enter your email address.")
        setStep("password")
        return
      }

      // ── Password step: authenticate ──────────────────────────────────
      if (!password) throw new Error("Please enter your password.")

      const normalizedEmail = email.trim().toLowerCase()

      const res = await api.post<LoginResponse>("/auth/login", {
        email: normalizedEmail,
        password,
      })

      // Accept either `token` or `accessToken` from the server
      const accessToken = res.data.accessToken ?? res.data.token ?? ""
      if (!accessToken) throw new Error("Invalid email or password.")

      const refreshToken = res.data.refreshToken ?? ""

      // Persist auth state via the Zustand store (writes cf_access_token to localStorage
      // and sets isAuthenticated = true — ProtectedRoute reads from the store).
      const user: User = {
        id:       res.data.user?.id       ?? "",
        email:    res.data.user?.email    ?? normalizedEmail,
        name:     res.data.user?.name     ?? normalizedEmail,
        username: res.data.user?.email    ?? normalizedEmail,
        avatar:   null,
        plan:     (res.data.user?.plan as User["plan"]) ?? "free",
      }
      storeLogin(user, accessToken, refreshToken)

      navigate("/dashboard", { replace: true })
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="show">
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-6">Log in</h1>

        {/* Social buttons */}
        <div className="flex flex-col gap-3">
          <button type="button" className={socialBtnCls} aria-label="Continue with Google">
            <GoogleIcon />
            Continue with Google
          </button>
          <button type="button" className={socialBtnCls} aria-label="Continue with GitHub">
            <Github className="w-5 h-5 text-gray-800" aria-hidden="true" />
            Continue with GitHub
          </button>
          <button type="button" className={socialBtnCls} aria-label="Continue with Microsoft">
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
          <div
            className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-start gap-2"
            role="alert"
            aria-live="assertive"
          >
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" aria-hidden="true" />
            <span className="text-sm text-red-600 leading-snug">{error}</span>
          </div>
        )}

        {/* ── Email step ── */}
        {step === "email" && (
          <form onSubmit={handleSubmit} noValidate>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email address
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@company.com"
                autoComplete="email"
                aria-label="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputCls}
              />
            </div>
            <button type="submit" disabled={loading} className={primaryBtnCls}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  <span>Checking...</span>
                </>
              ) : (
                "Continue with email"
              )}
            </button>
          </form>
        )}

        {/* ── Password step ── */}
        {step === "password" && (
          <form onSubmit={handleSubmit} noValidate>
            {/* Read-only email display + Change link */}
            <div className="flex items-center justify-between mb-4 px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg">
              <span
                className="text-sm text-gray-600 truncate"
                aria-label="Current email address"
              >
                {email}
              </span>
              <button
                type="button"
                className="text-xs font-medium text-blue-600 hover:underline ml-3 shrink-0 focus:outline-none focus:underline"
                aria-label="Change email address"
                onClick={() => { setStep("email"); setError(null) }}
              >
                Change
              </button>
            </div>

            {/* Password input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-blue-600 hover:underline focus:outline-none focus:underline"
                  tabIndex={-1}
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  aria-label="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputCls} pr-10`}
                />
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
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} className={primaryBtnCls}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  <span>Logging in...</span>
                </>
              ) : (
                "Log in"
              )}
            </button>
          </form>
        )}

        {/* Terms */}
        <p className="text-xs text-gray-400 text-center mt-5 leading-relaxed">
          By continuing, you agree to our{" "}
          <Link to="#" className="text-blue-600 hover:underline focus:outline-none focus:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link to="#" className="text-blue-600 hover:underline focus:outline-none focus:underline">
            Privacy Policy
          </Link>
          .
        </p>
      {/* Sign-up link */}
      <p className="mt-6 pt-5 border-t border-gray-100 text-sm text-gray-500 text-center">
        Don't have an account?{" "}
        <Link
          to="/register"
          className="text-blue-600 font-medium hover:underline focus:outline-none focus:underline"
        >
          Sign up
        </Link>
      </p>
    </motion.div>
  )
}
