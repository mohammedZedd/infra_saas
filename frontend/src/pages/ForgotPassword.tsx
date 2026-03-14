import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  Cloud,
  Mail,
  MailCheck,
  Loader2,
  AlertCircle,
  Info,
  ExternalLink,
  ArrowLeft,
} from "lucide-react"

// ─── Helpers ──────────────────────────────────────────────────────────────────

type ViewState = "form" | "sent"

const inputBase =
  "w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
}

function IconCircle({
  bg,
  children,
}: {
  bg: string
  children: React.ReactNode
}) {
  return (
    <motion.div
      className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full ${bg}`}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {children}
    </motion.div>
  )
}

// ─── State "form" ─────────────────────────────────────────────────────────────

function FormView({
  onSent,
}: {
  onSent: (email: string) => void
}) {
  const [email, setEmail] = useState("")
  const [emailError, setEmailError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [globalError, setGlobalError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setEmailError(null)
    setGlobalError(null)

    if (!isValidEmail(email)) {
      setEmailError("Please enter a valid email address.")
      return
    }

    setIsLoading(true)
    setTimeout(() => {
      // Simulate not-found for a specific address
      if (email === "notfound@example.com") {
        setGlobalError("No account found with that email address.")
        setIsLoading(false)
        return
      }
      setIsLoading(false)
      onSent(email)
    }, 1200)
  }

  return (
    <motion.div
      key="form"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
    >
      <IconCircle bg="bg-blue-50">
        <Mail className="h-7 w-7 text-blue-600" aria-hidden="true" />
      </IconCircle>

      <h1 className="mb-2 text-center text-2xl font-bold text-gray-900">
        Forgot your password?
      </h1>
      <p className="mb-6 text-center text-sm text-gray-500">
        Enter your email and we&apos;ll send you a reset link.
      </p>

      <AnimatePresence>
        {globalError && (
          <motion.div
            role="alert"
            className="mb-4 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0, x: [0, -6, 6, -6, 6, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
            <p className="text-sm text-red-600">{globalError}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} noValidate>
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setEmailError(null)
            }}
            placeholder="Email address"
            autoComplete="email"
            aria-label="Email address"
            aria-invalid={emailError !== null}
            aria-describedby={emailError ? "fp-email-error" : undefined}
            className={inputBase}
          />
          <AnimatePresence>
            {emailError && (
              <motion.p
                id="fp-email-error"
                role="alert"
                className="mt-1 text-xs text-red-500"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
              >
                {emailError}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Sending...
            </>
          ) : (
            "Send reset link"
          )}
        </button>
      </form>
    </motion.div>
  )
}

// ─── State "sent" ─────────────────────────────────────────────────────────────

const COOLDOWN_SECONDS = 60

function SentView({ email }: { email: string }) {
  const [resendCooldown, setResendCooldown] = useState(COOLDOWN_SECONDS)
  const [isResending, setIsResending] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Start cooldown on mount
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setResendCooldown((c) => {
        if (c <= 1) {
          clearInterval(intervalRef.current!)
          return 0
        }
        return c - 1
      })
    }, 1000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  function handleResend() {
    if (resendCooldown > 0 || isResending) return
    setIsResending(true)
    setTimeout(() => {
      setIsResending(false)
      setResendCooldown(COOLDOWN_SECONDS)
      // Restart cooldown interval
      if (intervalRef.current) clearInterval(intervalRef.current)
      intervalRef.current = setInterval(() => {
        setResendCooldown((c) => {
          if (c <= 1) {
            clearInterval(intervalRef.current!)
            return 0
          }
          return c - 1
        })
      }, 1000)
    }, 1000)
  }

  const cooldownPct = (resendCooldown / COOLDOWN_SECONDS) * 100

  return (
    <motion.div
      key="sent"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
    >
      <IconCircle bg="bg-green-50">
        <MailCheck className="h-7 w-7 text-green-500" aria-hidden="true" />
      </IconCircle>

      <h1 className="mb-2 text-center text-2xl font-bold text-gray-900">
        Check your inbox
      </h1>
      <p className="text-center text-sm text-gray-500">
        We sent a password reset link to
      </p>
      <p className="mt-1 text-center text-sm font-semibold text-gray-900">
        {email}
      </p>

      {/* Info box */}
      <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-blue-200 bg-blue-50 p-4">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" aria-hidden="true" />
        <p className="text-sm text-blue-700">The link will expire in 15 minutes.</p>
      </div>

      {/* Open email app */}
      <button
        type="button"
        onClick={() => { window.location.href = "mailto:" }}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        <ExternalLink className="h-4 w-4" aria-hidden="true" />
        Open email app
      </button>

      {/* Resend */}
      <div className="mt-6 text-center">
        <span className="text-sm text-gray-500">Didn&apos;t receive it? </span>
        {resendCooldown > 0 ? (
          <span className="text-sm text-gray-400">
            Resend in {resendCooldown}s
          </span>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending}
            className="text-sm font-medium text-blue-600 hover:underline disabled:opacity-60"
          >
            {isResending ? "Resending..." : "Resend email"}
          </button>
        )}

        {resendCooldown > 0 && (
          <div className="mx-auto mt-2 h-1 max-w-xs overflow-hidden rounded-full bg-gray-100">
            <motion.div
              className="h-full rounded-full bg-blue-600"
              initial={{ width: "100%" }}
              animate={{ width: `${cooldownPct}%` }}
              transition={{ duration: 1, ease: "linear" }}
            />
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ForgotPassword() {
  const [viewState, setViewState] = useState<ViewState>("form")
  const [sentEmail, setSentEmail] = useState("")

  function handleSent(email: string) {
    setSentEmail(email)
    setViewState("sent")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      {/* Logo */}
      <motion.div
        className="mb-8 flex items-center gap-2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Cloud className="h-8 w-8 text-blue-600" aria-hidden="true" />
        <span className="text-2xl font-bold text-gray-900">CloudForge</span>
      </motion.div>

      {/* Card */}
      <motion.div
        className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <AnimatePresence mode="wait">
          {viewState === "form" ? (
            <FormView key="form" onSent={handleSent} />
          ) : (
            <SentView key="sent" email={sentEmail} />
          )}
        </AnimatePresence>
      </motion.div>

      {/* Back to login */}
      <motion.div
        className="mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Link
          to="/login"
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to log in
        </Link>
      </motion.div>
    </div>
  )
}
