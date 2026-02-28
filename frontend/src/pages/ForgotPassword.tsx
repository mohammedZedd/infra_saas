import { useState } from "react"
import { Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { CheckCircle } from "lucide-react"
import { PublicLayout } from "../components/layout/PublicLayout"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"

const schema = z.object({
  email: z.string().email("Please enter a valid email address"),
})

type FormValues = z.infer<typeof schema>

export default function ForgotPassword() {
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormValues) {
    console.log("Password reset requested for:", data.email)
    await new Promise((r) => setTimeout(r, 500))
    setSubmitted(true)
  }

  return (
    <PublicLayout>
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-lg shadow-gray-200/50">
          <h1 className="text-center text-2xl font-bold text-gray-900">Reset your password</h1>
          <p className="mt-2 text-center text-sm text-gray-500">Enter your email and we&apos;ll send you a reset code.</p>

          {submitted ? (
            <div className="mt-8 rounded-xl bg-green-50 p-6 text-center">
              <CheckCircle className="mx-auto h-8 w-8 text-green-500" />
              <p className="mt-3 font-medium text-green-800">Check your email for a reset code</p>
              <p className="mt-1 text-sm text-green-600">We sent a verification code to your inbox.</p>
              <Link to="/reset-password" className="mt-3 inline-block text-sm font-medium text-indigo-600 hover:underline">
                Enter reset code
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
              <Input label="Email address" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
              <Button type="submit" fullWidth isLoading={isSubmitting} size="lg">
                Send Reset Code
              </Button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-gray-500">
            <Link to="/login" className="font-medium text-indigo-600 hover:underline">Back to login</Link>
          </p>
        </div>
      </div>
    </PublicLayout>
  )
}
