import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Check } from "lucide-react"
import { PublicLayout } from "../components/layout/PublicLayout"
import { Button } from "../components/ui/Button"
import { cn } from "../utils/cn"
import { PLANS } from "../constants/pricing"
import { formatCurrency } from "../utils/format"

export default function Pricing() {
  const [annual, setAnnual] = useState(false)
  const navigate = useNavigate()

  const plans = [PLANS.free, PLANS.pro, PLANS.team]

  function displayPrice(plan: (typeof plans)[number]) {
    if (plan.monthlyPrice === 0) return "$0"
    const price = annual ? plan.monthlyPrice * 0.8 : plan.monthlyPrice
    return formatCurrency(price, "USD").replace(".00", "")
  }

  return (
    <PublicLayout>
      <section className="bg-gradient-to-b from-indigo-50/50 to-white px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-center text-4xl font-bold text-gray-900">Simple, transparent pricing</h1>
          <p className="mt-4 text-center text-lg text-gray-600">Start free. Upgrade when you need more power.</p>

          <div className="mx-auto mt-8 inline-flex rounded-lg bg-gray-100 p-1">
            <button
              onClick={() => setAnnual(false)}
              className={cn("rounded-md px-4 py-2 text-sm font-semibold", !annual ? "bg-white shadow-sm text-gray-900" : "text-gray-600")}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={cn("rounded-md px-4 py-2 text-sm font-semibold", annual ? "bg-white shadow-sm text-gray-900" : "text-gray-600")}
            >
              Annual
            </button>
          </div>

          <div className="mx-auto mt-12 grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => {
              const highlighted = plan.id === "pro"
              return (
                <div
                  key={plan.id}
                  className={cn(
                    "relative rounded-2xl border bg-white p-8 shadow-sm",
                    highlighted && "border-2 border-indigo-600 shadow-lg"
                  )}
                >
                  {highlighted && (
                    <span className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-4 py-1 text-xs font-semibold text-white">
                      Most Popular
                    </span>
                  )}

                  <h2 className="text-xl font-bold text-gray-900">{plan.name}</h2>
                  <div className="mt-4 flex items-end gap-1">
                    <span className="text-4xl font-bold text-gray-900">{displayPrice(plan)}</span>
                    {plan.monthlyPrice > 0 && <span className="mb-1 text-sm text-gray-500">/mo</span>}
                  </div>

                  <Button onClick={() => navigate("/register")} className="mt-6 w-full">
                    {plan.monthlyPrice === 0 ? "Get started" : `Choose ${plan.name}`}
                  </Button>

                  <ul className="mt-8 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5 text-sm text-gray-600">
                        <Check size={16} className="mt-0.5 text-indigo-600" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
