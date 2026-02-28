import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Eye, EyeOff } from "lucide-react"
import { PublicLayout } from "../components/layout/PublicLayout"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import useAuthStore from "../stores/useAuthStore"

const schema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
})

type FormValues = z.infer<typeof schema>

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string })?.from ?? "/dashboard"
  const setUser = useAuthStore((s) => s.setUser)
  const setAccessToken = useAuthStore((s) => s.setAccessToken)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormValues) {
    await new Promise((r) => setTimeout(r, 400))
    setAccessToken("mock-token")
    setUser({
      id: "user-1",
      email: data.email,
      name: data.email.split("@")[0],
      avatar_url: null,
      plan: "free",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    navigate(from, { replace: true })
  }

  return (
    <PublicLayout>
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-lg shadow-gray-200/50">
          <h1 className="text-center text-2xl font-bold text-gray-900">Sign in to CloudForge</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
            <Input label="Email address" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  aria-invalid={!!errors.password}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 pr-10 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none aria-[invalid=true]:border-red-300 aria-[invalid=true]:focus:border-red-500 aria-[invalid=true]:focus:ring-red-500"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="mt-1.5 text-sm text-red-600">{errors.password.message}</p>}
              <div className="mt-2 text-right">
                <Link to="/forgot-password" className="text-sm text-indigo-600 hover:underline">
                  Forgot your password?
                </Link>
              </div>
            </div>

            <Button type="submit" fullWidth isLoading={isSubmitting} size="lg">
              Sign In
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Don&apos;t have an account? <Link to="/register" className="font-medium text-indigo-600 hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </PublicLayout>
  )
}
