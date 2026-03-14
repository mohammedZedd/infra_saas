import { useState, useEffect } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Circle,
  KeyRound,
  XCircle,
  ShieldCheck,
  ShieldAlert,
  ArrowLeft,
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

type TokenState = "validating" | "valid" | "invalid"
type ViewState = "form" | "success"

// ─── Shared primitives ────────────────────────────────────────────────────────

const inputBase =
  "w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-11 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"

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

// ─── Password helpers ─────────────────────────────────────────────────────────

function passwordStrength(pw: string): 0 | 1 | 2 | 3 | 4 {
  let s = 0
  if (pw.length >= 8) s++
  if (/[A-Z]/.test(pw)) s++
  if (/[0-9]/.test(pw)) s++
  if (/[^A-Za-z0-9]/.test(pw)) s++
  return s as 0 | 1 | 2 | 3 | 4
}

const strengthMeta: Record<1 | 2 | 3 | 4, { label: string; color: string; segColor: string }> = {
  1: { label: "Weak", color: "text-red-500", segColor: "bg-red-400" },
  2: { label: "Fair", color: "text-orange-500", segColor: "bg-orange-400" },
  3: { label: "Good", color: "text-yellow-600", segColor: "bg-yellow-400" },
  4: { label: "Strong", color: "text-green-600", segColor: "bg-green-500" },
}

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null
  const s = passwordStrength(password)
  const meta = s > 0 ? strengthMeta[s as 1 | 2 | 3 | 4] : null
  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((seg) => (
          <div
            key={seg}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${s >= seg && meta ? meta.segColor : "bg-gray-200"}`}
          />
        ))}
      </div>
      {meta && (
        <p className={`mt-1 text-right text-xs ${meta.color}`}>{meta.label}</p>
      )}
    </div>
  )
}

function PasswordChecklist({ password }: { password: string }) {
  const reqs = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "One uppercase letter", met: /[A-Z]/.test(password) },
    { label: "One number", met: /[0-9]/.test(password) },
    { label: "One special character (!@#$...)", met: /[^A-Za-z0-9]/.test(password) },
  ]
  return (
    <ul className="mt-3 space-y-1.5">
      {reqs.map((r) => (
        <li key={r.label} className="flex items-center gap-2 text-xs">
          {r.met
            ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-500" />
            : <Circle className="h-3.5 w-3.5 shrink-0 text-gray-300" />}
          <span className={r.met ? "text-gray-600" : "text-gray-400"}>{r.label}</span>
        </li>
      ))}
    </ul>
  )
}

function PwInput({
  value,
  onChange,
  placeholder,
  autoComplete,
  ariaLabel,
  id,
  ariaDescribedBy,
  ariaInvalid,
  rightSlot,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
  autoComplete: string
  ariaLabel: string
  id?: string
  ariaDescribedBy?: string
  ariaInvalid?: boolean
  rightSlot?: React.ReactNode
}) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid}
        className={inputBase}
      />
      {rightSlot ?? (
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          tabIndex={-1}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      )}
    </div>
  )
}

// ─── Validating view ───────────────────────────────────────────────────────────

function ValidatingView() {
  return (
    <motion.div
      key="validating"
      className="flex flex-col items-center py-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" aria-hidden="true" />
      <p className="mt-3 text-center text-sm text-gray-500">
        Verifying your reset link...
      </p>
    </motion.div>
  )
}

// ─── Invalid token view ────────────────────────────────────────────────────────

function InvalidTokenView({ onRequestNew }: { onRequestNew: () => void }) {
  return (
    <motion.div
      key="invalid"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
    >
      <IconCircle bg="bg-red-50">
        <XCircle className="h-7 w-7 text-red-500" aria-hidden="true" />
      </IconCircle>
      <h1 className="mb-2 text-center text-2xl font-bold text-gray-900">
        Link expired or invalid
      </h1>
      <p className="mb-6 text-center text-sm text-gray-500">
        This password reset link has expired or is invalid.
        Reset links are only valid for 15 minutes.
      </p>
      <button
        type="button"
        onClick={onRequestNew}
        className="flex w-full items-center justify-center rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Request a new reset link
      </button>
    </motion.div>
  )
}

// ─── Reset form view ───────────────────────────────────────────────────────────

function ResetFormView({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [confirmError, setConfirmError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [globalError, setGlobalError] = useState<string | null>(null)

  const s = passwordStrength(password)
  const passwordsMatch =
    confirmPassword.length > 0 && confirmPassword === password
  const canSubmit =
    s >= 3 && password.length > 0 && confirmPassword === password

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setGlobalError(null)
    setConfirmError(null)

    if (s < 3) return
    if (confirmPassword !== password) {
      setConfirmError("Passwords do not match.")
      return
    }

    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      onSuccess()
    }, 1400)
  }

  return (
    <motion.div
      key="reset-form"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
    >
      <IconCircle bg="bg-blue-50">
        <KeyRound className="h-7 w-7 text-blue-600" aria-hidden="true" />
      </IconCircle>

      <h1 className="mb-2 text-center text-2xl font-bold text-gray-900">
        Set new password
      </h1>
      <p className="mb-6 text-center text-sm text-gray-500">
        Your new password must be different from previous passwords.
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
        {/* New password */}
        <div>
          <PwInput
            value={password}
            onChange={setPassword}
            placeholder="New password"
            autoComplete="new-password"
            ariaLabel="New password"
            id="rp-password"
          />
          <PasswordStrength password={password} />
          {password.length > 0 && <PasswordChecklist password={password} />}
        </div>

        {/* Confirm password */}
        <div className="mt-4">
          <PwInput
            value={confirmPassword}
            onChange={(v) => {
              setConfirmPassword(v)
              setConfirmError(null)
            }}
            placeholder="Confirm new password"
            autoComplete="new-password"
            ariaLabel="Confirm new password"
            id="rp-confirm"
            ariaDescribedBy={confirmError ? "rp-confirm-error" : undefined}
            ariaInvalid={confirmError !== null}
            rightSlot={
              passwordsMatch ? (
                <span className="absolute right-3 top-1/2 -translate-y-1/2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" aria-label="Passwords match" />
                </span>
              ) : undefined
            }
          />
          <AnimatePresence>
            {confirmError && (
              <motion.p
                id="rp-confirm-error"
                role="alert"
                className="mt-1 text-xs text-red-500"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
              >
                {confirmError}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <button
          type="submit"
          disabled={!canSubmit || isLoading}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Resetting...
            </>
          ) : (
            "Reset password"
          )}
        </button>
      </form>
    </motion.div>
  )
}

// ─── Success view ─────────────────────────────────────────────────────────────

function SuccessView({ onGoToLogin }: { onGoToLogin: () => void }) {
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    const id = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(id)
          onGoToLogin()
          return 0
        }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [onGoToLogin])

  return (
    <motion.div
      key="success"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
    >
      <IconCircle bg="bg-green-50">
        <ShieldCheck className="h-7 w-7 text-green-500" aria-hidden="true" />
      </IconCircle>

      <h1 className="mb-2 text-center text-2xl font-bold text-gray-900">
        Password reset!
      </h1>
      <p className="mb-6 text-center text-sm text-gray-500">
        Your password has been successfully updated.
      </p>

      <p className="text-center text-xs text-gray-400">
        Redirecting to login in{" "}
        <motion.span
          key={countdown}
          className="inline-block font-semibold"
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          {countdown}s
        </motion.span>
        ...
      </p>

      <button
        type="button"
        onClick={onGoToLogin}
        className="mt-4 flex w-full items-center justify-center rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Go to login now
      </button>

      {/* Security tip */}
      <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-blue-200 bg-blue-50 p-4">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" aria-hidden="true" />
        <p className="text-sm text-blue-700">
          For your security, you have been logged out of all other devices.
        </p>
      </div>
    </motion.div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [tokenState, setTokenState] = useState<TokenState>("validating")
  const [viewState, setViewState] = useState<ViewState>("form")

  useEffect(() => {
    const token = searchParams.get("token")
    if (!token) {
      setTokenState("invalid")
      return
    }
    const id = setTimeout(() => {
      // Treat token "expired" as invalid for demo
      if (token === "expired") {
        setTokenState("invalid")
      } else {
        setTokenState("valid")
      }
    }, 1000)
    return () => clearTimeout(id)
  }, [searchParams])

  // Determine which view to render
  function renderContent() {
    if (tokenState === "validating") return <ValidatingView />
    if (tokenState === "invalid") {
      return (
        <InvalidTokenView
          key="invalid"
          onRequestNew={() => navigate("/forgot-password")}
        />
      )
    }
    // token valid
    if (viewState === "form") {
      return (
        <ResetFormView
          key="reset-form"
          onSuccess={() => setViewState("success")}
        />
      )
    }
    return (
      <SuccessView
        key="success"
        onGoToLogin={() => navigate("/login")}
      />
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <AnimatePresence mode="wait">
        {renderContent()}
      </AnimatePresence>

      {/* Back to login */}
      <div className="mt-6 pt-5 border-t border-gray-100 text-center">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to log in
        </Link>
      </div>
    </motion.div>
  )
}
