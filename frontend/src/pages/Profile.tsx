import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Mail, Shield, User } from "lucide-react"
import toast from "react-hot-toast"
import { AppLayout } from "../components/layout/AppLayout"
import { Input } from "../components/ui/Input"
import { Button } from "../components/ui/Button"
import { Card, CardBody, CardHeader } from "../components/ui/Card"
import { Badge } from "../components/ui/Badge"
import useAuthStore from "../stores/useAuthStore"
import { emailSchema, nameSchema } from "../utils/validation"

const profileSchema = z.object({
  name: nameSchema,
  email: emailSchema,
})

type ProfileForm = z.infer<typeof profileSchema>

const PLAN_VARIANT: Record<string, "gray" | "blue" | "green" | "purple"> = {
  free: "gray",
  pro: "blue",
  team: "purple",
  enterprise: "green",
}

export default function Profile() {
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? "", email: user?.email ?? "" },
  })

  useEffect(() => {
    if (user) reset({ name: user.name, email: user.email })
  }, [user, reset])

  async function onSubmit(data: ProfileForm) {
    await new Promise((r) => setTimeout(r, 600))
    if (user) setUser({ ...user, name: data.name, email: data.email })
    toast.success("Profile updated")
  }

  const plan = user?.plan ?? "free"
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?"

  return (
    <AppLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>

        <Card>
          <CardBody className="flex items-center gap-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-xl font-bold text-indigo-700">{initials}</div>
            <div>
              <p className="text-lg font-semibold text-gray-900">{user?.name ?? "-"}</p>
              <p className="text-sm text-gray-500">{user?.email ?? "-"}</p>
              <div className="mt-2 flex items-center gap-2">
                <Shield size={14} className="text-gray-400" />
                <Badge variant={PLAN_VARIANT[plan] ?? "gray"} className="capitalize">
                  {plan} plan
                </Badge>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900">
              <User size={16} /> Personal information
            </h2>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
              <Input label="Full name" leftIcon={User} required autoComplete="name" error={errors.name?.message} {...register("name")} />
              <Input label="Email address" type="email" leftIcon={Mail} required autoComplete="email" error={errors.email?.message} {...register("email")} />
              <div className="flex justify-end">
                <Button type="submit" isLoading={isSubmitting} disabled={!isDirty}>
                  Save changes
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </AppLayout>
  )
}
