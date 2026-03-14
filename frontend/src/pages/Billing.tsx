import { useState } from "react"
import { ArrowUpCircle, Check, CreditCard, Receipt } from "lucide-react"
import toast from "react-hot-toast"
import { Card, CardBody, CardHeader } from "../components/ui/Card"
import { Button } from "../components/ui/Button"
import { Badge } from "../components/ui/Badge"
import { ConfirmDialog } from "../components/ui/ConfirmDialog"
import useAuthStore from "../stores/useAuthStore"
import { PLANS } from "../constants/pricing"
import { formatCurrency, formatDate } from "../utils/format"
import { cn } from "../utils/cn"
import { useEffect } from "react"

const PLAN_ORDER = ["free", "pro", "team"] as const

export default function Billing() {
  const user = useAuthStore((s) => s.user)
  const [currentPlan, setCurrentPlan] = useState<string>(user?.plan ?? "free")
  const [confirmPlan, setConfirmPlan] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setCurrentPlan(user?.plan ?? "free")
  }, [user?.plan])

  async function handleUpgrade() {
    if (!confirmPlan) return
    setLoading(true)
    await new Promise((r) => setTimeout(r, 800))
    setCurrentPlan(confirmPlan)
    toast.success(`Switched to ${PLANS[confirmPlan as keyof typeof PLANS]?.name} plan`)
    setLoading(false)
    setConfirmPlan(null)
  }

  const planList = PLAN_ORDER.map((id) => PLANS[id])
  const targetPlan = confirmPlan ? PLANS[confirmPlan as keyof typeof PLANS] : null

  return (
    <div className="p-6 lg:p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Billing</h1>

        <Card>
          <CardBody>
            <p className="text-sm font-medium text-gray-900">{user?.name ?? "Unknown user"}</p>
            <p className="text-sm text-gray-500">{user?.email ?? "No email available"}</p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900">
              <CreditCard size={16} /> Current plan
            </h2>
          </CardHeader>
          <CardBody className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-2xl font-bold capitalize text-gray-900">{currentPlan}</p>
              <p className="text-sm text-gray-500">
                {currentPlan === "free" ? "No charge" : `${formatCurrency(PLANS[currentPlan as keyof typeof PLANS]?.monthlyPrice ?? 0)}/month`}
              </p>
            </div>
            <Badge variant={currentPlan === "free" ? "gray" : currentPlan === "pro" ? "blue" : "purple"} className="capitalize">
              {currentPlan}
            </Badge>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900">
              <ArrowUpCircle size={16} /> Change plan
            </h2>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {planList.map((plan) => {
                const isCurrent = plan.id === currentPlan
                return (
                  <div
                    key={plan.id}
                    className={cn(
                      "rounded-xl border p-5",
                      isCurrent ? "border-indigo-400 bg-indigo-50" : "border-gray-200 bg-white transition-colors hover:border-indigo-300"
                    )}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span className="font-semibold text-gray-900">{plan.name}</span>
                      {isCurrent && <Check size={16} className="text-indigo-600" />}
                    </div>
                    <p className="text-xl font-bold text-gray-900">{plan.monthlyPrice === 0 ? "Free" : `${formatCurrency(plan.monthlyPrice)}/mo`}</p>
                    <ul className="mt-3 space-y-1.5 text-xs text-gray-500">
                      {plan.features.slice(0, 4).map((f) => (
                        <li key={f} className="flex items-center gap-1.5">
                          <Check size={12} className="text-green-500" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Button size="sm" variant={isCurrent ? "secondary" : "primary"} disabled={isCurrent} className="mt-5 w-full" onClick={() => setConfirmPlan(plan.id)}>
                      {isCurrent ? "Current" : "Switch"}
                    </Button>
                  </div>
                )
              })}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900">
              <Receipt size={16} /> Invoice history
            </h2>
          </CardHeader>
          <CardBody className="p-0">
            <div className="px-6 py-8 text-center">
              <p className="text-sm font-medium text-gray-700">No invoices yet</p>
              <p className="mt-1 text-xs text-gray-500">Billing invoices will appear here once payment history is available.</p>
              <p className="mt-3 text-xs text-gray-400">Last checked: {formatDate(new Date().toISOString())}</p>
            </div>
          </CardBody>
        </Card>
      </div>

      <ConfirmDialog
        open={!!confirmPlan}
        onCancel={() => setConfirmPlan(null)}
        onConfirm={handleUpgrade}
        title={`Switch to ${targetPlan?.name ?? ""} plan`}
        description={`You will be charged ${targetPlan && targetPlan.monthlyPrice > 0 ? formatCurrency(targetPlan.monthlyPrice) + "/month" : "nothing"} starting from your next billing cycle.`}
        confirmText="Confirm switch"
        isLoading={loading}
      />
    </div>
  )
}
