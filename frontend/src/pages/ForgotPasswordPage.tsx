import { useState, type FormEvent, type ChangeEvent } from "react"
import { Link } from "react-router-dom"
import { isAxiosError } from "axios"
import api from "@/lib/api"

// ─── Types ─────────────────────────────────────────────────────────────────────

interface ForgotPasswordBody {
  email: string
}

// ─── Utilities ─────────────────────────────────────────────────────────────────

function resolveErrorMessage(err: unknown): string {
  if (isAxiosError(err)) {
    if (!err.response) return "Cannot reach server. Try again."
    const msg: unknown = (err.response.data as Record<string, unknown>)?.message
    if (typeof msg === "string" && msg.length > 0) return msg
    return "Something went wrong. Please try again."
  }
  return "An unexpected error occurred."
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError]     = useState<string | null>(null)
  const [success, setSuccess] = useState<boolean>(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault()

    // Prevent double-submit
    if (loading) return

    // Basic validation — reset banners
    setError(null)
    setSuccess(false)

    const normalized = email.trim().toLowerCase()
    if (normalized === "") {
      setError("Email address is required.")
      return
    }

    setLoading(true)

    try {
      // TODO: backend endpoint POST /auth/forgot-password not yet implemented.
      // Swap the setTimeout below for the api call once the backend is ready:
      //
      //   const body: ForgotPasswordBody = { email: normalized }
      //   await api.post<void>("/auth/forgot-password", body)
      //
      // For now, simulate a successful API response after 1 s.
      await simulateForgotPassword({ email: normalized })
      setSuccess(true)
    } catch (err: unknown) {
      setError(resolveErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>

        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Forgot your password?</h1>
          <p className="mt-2 text-sm text-gray-500">
            Enter your email and we'll send you a reset link.
          </p>
        </div>

        {/* Success banner */}
        {success && (
          <div className="mb-5 bg-green-50 border border-green-200 text-green-700 rounded-lg px-3 py-2 text-sm">
            If an account exists, we sent an email.
          </div>
        )}

        {/* Error banner */}
        {error !== null && (
          <div className="mb-5 bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm">
            {error}
          </div>
        )}

        {/* Form — hide after success to prevent re-submission */}
        {!success && (
          <form onSubmit={handleSubmit} noValidate>
            <label htmlFor="fp-email" className="block text-sm font-medium text-gray-700 mb-1.5">
              Email address
            </label>
            <input
              id="fp-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-gray-200 outline-none disabled:opacity-60 disabled:cursor-not-allowed"
            />

            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-full bg-blue-600 text-white rounded-lg py-2.5 font-medium text-sm hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Sending…" : "Send reset link"}
            </button>
          </form>
        )}

        {/* Back to login */}
        <p className="mt-6 text-center text-sm text-gray-500">
          <Link
            to="/login"
            className="font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            Back to login
          </Link>
        </p>
    </>
  )
}

// ─── Simulation (remove when backend is ready) ─────────────────────────────────

// Importing `api` above keeps the import live so wiring is a one-line swap.
void api  // suppress "unused import" lint until the real call is added.

function simulateForgotPassword(_body: ForgotPasswordBody): Promise<void> {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, 1000)
  })
}
