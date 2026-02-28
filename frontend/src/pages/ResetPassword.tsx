import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { PublicLayout } from "../components/layout/PublicLayout"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"

const schema = z
  .object({
    code: z.string().length(6, "Verification code must be exactly 6 digits").regex(/^[0-9]+$/, "Code must contain only digits"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[0-9]/, "Must contain a number"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type FormValues = z.infer<typeof schema>

export default function ResetPassword() {
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormValues) {
    console.log("Password reset confirm:", data)
    await new Promise((r) => setTimeout(r, 500))
    navigate("/login")
  }

  return (
    <PublicLayout>
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-lg shadow-gray-200/50">
          <h1 className="text-center text-2xl font-bold text-gray-900">Set new password</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
            <Input label="Verification code" type="text" inputMode="numeric" maxLength={6} placeholder="6-digit code" autoComplete="one-time-code" error={errors.code?.message} {...register("code")} />
            <Input label="New password" type="password" autoComplete="new-password" error={errors.newPassword?.message} {...register("newPassword")} />
            <Input label="Confirm new password" type="password" autoComplete="new-password" error={errors.confirmPassword?.message} {...register("confirmPassword")} />

            <Button type="submit" fullWidth isLoading={isSubmitting} size="lg">
              Reset Password
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            <Link to="/login" className="font-medium text-indigo-600 hover:underline">Back to login</Link>
          </p>
        </div>
      </div>
    </PublicLayout>
  )
}
