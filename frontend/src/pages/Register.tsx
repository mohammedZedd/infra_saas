import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Eye, EyeOff } from "lucide-react"
import { PublicLayout } from "../components/layout/PublicLayout"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import useAuthStore from "../stores/useAuthStore"

const schema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[0-9]/, "Must contain a number"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type FormValues = z.infer<typeof schema>

function strengthLabel(password: string): { label: string; color: string } {
  if (password.length === 0) return { label: "", color: "" }
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  if (score <= 1) return { label: "Weak", color: "text-red-500" }
  if (score === 2) return { label: "Fair", color: "text-yellow-500" }
  if (score === 3) return { label: "Strong", color: "text-green-500" }
  return { label: "Very strong", color: "text-green-600" }
}

export default function Register() {
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const setUser = useAuthStore((s) => s.setUser)
  const setAccessToken = useAuthStore((s) => s.setAccessToken)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const password = watch("password", "")
  const { label: strengthText, color: strengthColor } = strengthLabel(password)

  async function onSubmit(data: FormValues) {
    await new Promise((r) => setTimeout(r, 400))
    setAccessToken("mock-token")
    setUser({
      id: "user-1",
      email: data.email,
      name: data.name,
      avatar_url: null,
      plan: "free",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    navigate("/dashboard", { replace: true })
  }

  return (
    <PublicLayout>
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-lg shadow-gray-200/50">
          <h1 className="text-center text-2xl font-bold text-gray-900">Create your account</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
            <Input label="Full name" autoComplete="name" error={errors.name?.message} {...register("name")} />
            <Input label="Email address" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 pr-10 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
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
              {strengthText && <p className={`mt-1.5 text-sm font-medium ${strengthColor}`}>{strengthText}</p>}
              {errors.password && <p className="mt-1.5 text-sm text-red-600">{errors.password.message}</p>}
            </div>

            <Input label="Confirm password" type="password" autoComplete="new-password" error={errors.confirmPassword?.message} {...register("confirmPassword")} />

            <Button type="submit" fullWidth isLoading={isSubmitting} size="lg">
              Create Account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account? <Link to="/login" className="font-medium text-indigo-600 hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </PublicLayout>
  )
}
