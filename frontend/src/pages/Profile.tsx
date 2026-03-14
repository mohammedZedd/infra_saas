import { useState, useCallback, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  User,
  Settings,
  Paintbrush,
  Bell,
  CreditCard,
  Mail,
  Shield,
  Monitor,
  Key,
  GitBranch,
  Cloud,
  AlertTriangle,
  Camera,
  Eye,
  EyeOff,
  Check,
  CheckCircle2,
  Loader2,
  Circle,
  X,
  Github,
  QrCode,
  ShieldAlert,
} from "lucide-react"
import toast from "react-hot-toast"
import useAuthStore, { type User as AuthUser } from "../stores/useAuthStore"

// ─── Types ────────────────────────────────────────────────────────────────────

type Section =
  | "profile"
  | "account"
  | "appearance"
  | "notifications"
  | "billing"
  | "emails"
  | "security"
  | "sessions"
  | "api-keys"
  | "git"
  | "aws"
  | "danger"

interface NavItem {
  key: Section
  label: string
  icon: React.ElementType
  danger?: boolean
}

interface NavGroup {
  label?: string
  items: NavItem[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    items: [
      { key: "profile", label: "Public profile", icon: User },
      { key: "account", label: "Account", icon: Settings },
      { key: "appearance", label: "Appearance", icon: Paintbrush },
      { key: "notifications", label: "Notifications", icon: Bell },
    ],
  },
  {
    label: "Access",
    items: [
      { key: "billing", label: "Billing & Plans", icon: CreditCard },
      { key: "emails", label: "Emails", icon: Mail },
      { key: "security", label: "Password & Security", icon: Shield },
      { key: "sessions", label: "Sessions", icon: Monitor },
      { key: "api-keys", label: "API Keys", icon: Key },
    ],
  },
  {
    label: "Integrations",
    items: [
      { key: "git", label: "Git Connections", icon: GitBranch },
      { key: "aws", label: "AWS Credentials", icon: Cloud },
    ],
  },
  {
    label: "Danger",
    items: [
      { key: "danger", label: "Danger Zone", icon: AlertTriangle, danger: true },
    ],
  },
]

// ─── Shared primitives ────────────────────────────────────────────────────────

const inputCls =
  "w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400 transition-colors"

const btnPrimary = "bg-blue-600 text-white text-sm font-medium rounded-lg px-4 py-2 hover:bg-blue-700 transition-colors"
const btnGhost = "border border-gray-300 text-gray-700 text-sm rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors"

function SaveButton({
  onSave, label, variant = "primary", extraCls = "",
}: {
  onSave: () => Promise<void>; label: string; variant?: "primary" | "ghost"; extraCls?: string
}) {
  const [saving, setSaving] = useState(false)
  const [saved,  setSaved]  = useState(false)
  const handle = async () => {
    setSaving(true); setSaved(false)
    await onSave()
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }
  const cls = variant === "ghost" ? btnGhost : btnPrimary
  return (
    <button
      type="button"
      onClick={() => void handle()}
      disabled={saving}
      className={`${cls}${extraCls ? " " + extraCls : ""} inline-flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed`}
    >
      {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
      {saved && !saving && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
      {label}
    </button>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-gray-700 mb-1">{children}</label>
}
function Helper({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-gray-500 mt-1">{children}</p>
}
function SectionCard({ children }: { children: React.ReactNode }) {
  return <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 mb-6">{children}</div>
}
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <>
      <h2 className="text-xl font-semibold text-gray-900 mb-1">{children}</h2>
      <div className="border-b border-gray-200 mb-6 mt-2" />
    </>
  )
}
function SubTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-base font-semibold text-gray-900 mb-1">{children}</h3>
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${checked ? "bg-blue-600" : "bg-gray-200"}`}
    >
      <span className={`inline-block h-4 w-4 mt-[1px] rounded-full bg-white shadow transition-transform duration-150 ${checked ? "translate-x-5" : "translate-x-0"}`} />
    </button>
  )
}

function PasswordInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <input type={show ? "text" : "password"} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={inputCls + " pr-10"} />
      <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" aria-label={show ? "Hide" : "Show"}>
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  )
}

function Modal({ open, onClose, children, title }: { open: boolean; onClose: () => void; children: React.ReactNode; title: string }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
        >
          <motion.div
            className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-xl"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.15 }}
          >
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-200">
              <h2 className="text-base font-semibold text-gray-900">{title}</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-6 py-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── PUBLIC PROFILE ───────────────────────────────────────────────────────────

function ProfileSection({ user, onSave }: { user: AuthUser | null; onSave: (updates: Partial<AuthUser>) => Promise<void> }) {
  const [form, setForm] = useState({
    name: user?.name ?? "",
    username: user?.username ?? "",
    bio: user?.bio ?? "",
    jobTitle: user?.jobTitle ?? "",
    company: user?.company ?? "",
    website: user?.website ?? "",
    twitter: user?.twitter ?? "",
  })
  useEffect(() => {
    setForm({
      name: user?.name ?? "",
      username: user?.username ?? "",
      bio: user?.bio ?? "",
      jobTitle: user?.jobTitle ?? "",
      company: user?.company ?? "",
      website: user?.website ?? "",
      twitter: user?.twitter ?? "",
    })
  }, [user])
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const sv = { hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0 } }
  const ct = { show: { transition: { staggerChildren: 0.04 } } }

  return (
    <motion.div variants={ct} initial="hidden" animate="show">
      <SectionCard>
        <SectionTitle>Public profile</SectionTitle>
        <div className="flex gap-10">
          {/* Form */}
          <div className="flex-1 space-y-5">
            <motion.div variants={sv}>
              <Label>Full name</Label>
              <input className={inputCls} value={form.name} onChange={set("name")} />
              <Helper>Your name may appear around CloudForge.</Helper>
            </motion.div>

            <motion.div variants={sv}>
              <Label>Username</Label>
              <div className="flex rounded-lg border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                <span className="flex items-center px-3 bg-gray-50 border-r border-gray-300 text-gray-400 text-sm whitespace-nowrap">cloudforge.io/</span>
                <input
                  value={form.username}
                  onChange={set("username")}
                  className="flex-1 px-3 py-2 text-sm text-gray-900 focus:outline-none bg-white"
                />
              </div>
            </motion.div>

            <motion.div variants={sv}>
              <Label>Public email</Label>
              <select className={inputCls}>
                <option>Select a verified email</option>
                <option>{user?.email ?? "No verified email available"}</option>
              </select>
              <Helper>Controls what email is shown publicly.</Helper>
            </motion.div>

            <motion.div variants={sv}>
              <Label>Bio</Label>
              <textarea className={inputCls} rows={3} value={form.bio} onChange={set("bio")} placeholder="Tell us a little about yourself" />
              <Helper>Brief description for your profile.</Helper>
            </motion.div>

            <motion.div variants={sv}>
              <Label>Job title</Label>
              <input className={inputCls} value={form.jobTitle} onChange={set("jobTitle")} placeholder="e.g. Platform Engineer" />
            </motion.div>

            <motion.div variants={sv}>
              <Label>Company</Label>
              <input className={inputCls} value={form.company} onChange={set("company")} placeholder="e.g. Acme Corp" />
            </motion.div>

            <motion.div variants={sv}>
              <Label>Website</Label>
              <input className={inputCls} value={form.website} onChange={set("website")} placeholder="https://yourwebsite.com" />
            </motion.div>

            <motion.div variants={sv}>
              <Label>Twitter / X</Label>
              <input className={inputCls} value={form.twitter} onChange={set("twitter")} placeholder="@username" />
            </motion.div>

            <motion.div variants={sv}>
              <SaveButton
                onSave={() =>
                  onSave({
                    name: form.name,
                    username: form.username,
                    bio: form.bio,
                    jobTitle: form.jobTitle,
                    company: form.company,
                    website: form.website,
                    twitter: form.twitter,
                  })
                }
                label="Save profile"
              />
            </motion.div>
          </div>

          {/* Avatar */}
          <div className="w-52 flex flex-col items-center gap-3 pt-1 shrink-0">
            <div className="w-32 h-32 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold select-none">
              {(form.name || "User")
                .split(" ")
                .map((part) => part[0])
                .filter(Boolean)
                .slice(0, 2)
                .join("")
                .toUpperCase() || "U"}
            </div>
            <button type="button" className="inline-flex items-center gap-1.5 border border-gray-300 text-gray-600 text-xs rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors">
              <Camera className="h-3.5 w-3.5" /> Edit photo
            </button>
            <p className="text-xs text-gray-400 text-center">JPG, PNG max 2MB</p>
          </div>
        </div>
      </SectionCard>
    </motion.div>
  )
}

// ─── ACCOUNT ─────────────────────────────────────────────────────────────────

function AccountSection({ user, onSave }: { user: AuthUser | null; onSave: (updates: Partial<AuthUser>) => Promise<void> }) {
  const [username, setUsername] = useState(user?.username ?? "")
  useEffect(() => {
    setUsername(user?.username ?? "")
  }, [user?.username])
  const [publicProfile, setPublicProfile] = useState(true)
  const sv = { hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0 } }
  const ct = { show: { transition: { staggerChildren: 0.04 } } }

  return (
    <motion.div variants={ct} initial="hidden" animate="show" className="space-y-0">
      <SectionCard>
        <SectionTitle>Account</SectionTitle>

        {/* Change username */}
        <motion.div variants={sv} className="mb-8">
          <SubTitle>Change username</SubTitle>
          <div className="border-b border-gray-100 mb-5 mt-1" />
          <div className="max-w-sm space-y-3">
            <div>
              <Label>Username</Label>
              <input className={inputCls} value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
              <p className="text-xs text-yellow-800">Changing your username may break existing integrations and webhooks.</p>
            </div>
            <SaveButton onSave={() => onSave({ username })} label="Update username" variant="ghost" />
          </div>
        </motion.div>

        {/* Export */}
        <motion.div variants={sv} className="mb-8">
          <SubTitle>Export account data</SubTitle>
          <div className="border-b border-gray-100 mb-5 mt-1" />
          <p className="text-sm text-gray-600 mb-3">Request an export of your CloudForge data including all projects, canvas states, and Terraform configurations.</p>
          <button type="button" className={btnGhost}>Export data</button>
        </motion.div>

        {/* Visibility */}
        <motion.div variants={sv}>
          <SubTitle>Account visibility</SubTitle>
          <div className="border-b border-gray-100 mb-5 mt-1" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Make profile public</p>
              <p className="text-xs text-gray-500 mt-0.5">Allow other CloudForge users to find your profile.</p>
            </div>
            <Toggle checked={publicProfile} onChange={setPublicProfile} />
          </div>
        </motion.div>
      </SectionCard>
    </motion.div>
  )
}

// ─── APPEARANCE ───────────────────────────────────────────────────────────────

function AppearanceSection({ onSave }: { onSave: () => Promise<void> }) {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light")
  const [tabSize, setTabSize] = useState("4")
  const [fontSize, setFontSize] = useState("14")
  const [fontFamily, setFontFamily] = useState("fira")
  const sv = { hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0 } }
  const ct = { show: { transition: { staggerChildren: 0.04 } } }

  const themes: { key: "light" | "dark" | "system"; label: string; badge?: string; preview: React.ReactNode }[] = [
    {
      key: "light",
      label: "Light",
      preview: (
        <div className="bg-white border border-gray-200 h-16 rounded-lg p-2 space-y-1.5">
          <div className="h-2 bg-gray-100 rounded w-3/4" />
          <div className="h-2 bg-gray-200 rounded w-1/2" />
          <div className="h-2 bg-gray-100 rounded w-5/6" />
        </div>
      ),
    },
    {
      key: "dark",
      label: "Dark",
      preview: (
        <div className="bg-gray-900 h-16 rounded-lg p-2 space-y-1.5">
          <div className="h-2 bg-gray-700 rounded w-3/4" />
          <div className="h-2 bg-gray-600 rounded w-1/2" />
          <div className="h-2 bg-gray-700 rounded w-5/6" />
        </div>
      ),
    },
    {
      key: "system",
      label: "System default",
      badge: "Recommended",
      preview: (
        <div className="h-16 rounded-lg overflow-hidden flex">
          <div className="flex-1 bg-white p-2 space-y-1.5">
            <div className="h-2 bg-gray-100 rounded w-3/4" />
            <div className="h-2 bg-gray-200 rounded w-1/2" />
          </div>
          <div className="flex-1 bg-gray-900 p-2 space-y-1.5">
            <div className="h-2 bg-gray-700 rounded w-3/4" />
            <div className="h-2 bg-gray-600 rounded w-1/2" />
          </div>
        </div>
      ),
    },
  ]

  return (
    <motion.div variants={ct} initial="hidden" animate="show">
      <SectionCard>
        <SectionTitle>Appearance</SectionTitle>

        <motion.div variants={sv} className="mb-8">
          <SubTitle>Interface theme</SubTitle>
          <div className="border-b border-gray-100 mb-5 mt-1" />
          <div className="grid grid-cols-3 gap-4">
            {themes.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTheme(t.key)}
                className={`rounded-xl p-4 text-left transition-colors ${theme === t.key ? "border-2 border-blue-600 bg-blue-50" : "border border-gray-200 hover:border-gray-400"}`}
              >
                {t.preview}
                <div className="flex items-center gap-2 mt-2">
                  <p className="text-sm font-medium text-gray-900">{t.label}</p>
                  {t.badge && <span className="bg-blue-100 text-blue-700 text-xs rounded-full px-2">{t.badge}</span>}
                </div>
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div variants={sv}>
          <SubTitle>Code editor settings</SubTitle>
          <div className="border-b border-gray-100 mb-5 mt-1" />
          <div className="grid grid-cols-3 gap-4 mb-5">
            <div>
              <Label>Tab size</Label>
              <select className={inputCls} value={tabSize} onChange={(e) => setTabSize(e.target.value)}>
                <option value="2">2 spaces</option>
                <option value="4">4 spaces</option>
                <option value="8">8 spaces</option>
              </select>
            </div>
            <div>
              <Label>Font size</Label>
              <select className={inputCls} value={fontSize} onChange={(e) => setFontSize(e.target.value)}>
                <option value="12">12px</option>
                <option value="13">13px</option>
                <option value="14">14px</option>
                <option value="16">16px</option>
              </select>
            </div>
            <div>
              <Label>Font family</Label>
              <select className={inputCls} value={fontFamily} onChange={(e) => setFontFamily(e.target.value)}>
                <option value="fira">Fira Code</option>
                <option value="jetbrains">JetBrains Mono</option>
                <option value="monaco">Monaco</option>
              </select>
            </div>
          </div>
          <SaveButton onSave={onSave} label="Save preferences" />
        </motion.div>
      </SectionCard>
    </motion.div>
  )
}

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────

function NotificationsSection({ onSave }: { onSave: () => Promise<void> }) {
  const emailRows = [
    { key: "done", label: "Deployment completed", helper: "Notify when terraform apply finishes" },
    { key: "fail", label: "Deployment failed", helper: "Notify when a deployment errors" },
    { key: "budget", label: "Budget alert", helper: "When cost threshold is exceeded" },
    { key: "digest", label: "Weekly digest", helper: "Weekly summary of your activity" },
    { key: "security", label: "Security alerts", helper: "Unusual sign-in or API key activity" },
    { key: "product", label: "Product updates", helper: "New CloudForge features and improvements" },
  ]
  const inAppRows = [
    { key: "deplStatus", label: "Deployment status", helper: "Real-time updates during runs" },
    { key: "collab", label: "Collaborator activity", helper: "When teammates modify shared projects" },
    { key: "mentions", label: "Mentions", helper: "When someone mentions you" },
    { key: "system", label: "System announcements", helper: "Maintenance and service updates" },
  ]
  const init = (rows: { key: string }[]) => Object.fromEntries(rows.map((r) => [r.key, true])) as Record<string, boolean>
  const [emailPrefs, setEmailPrefs] = useState(init(emailRows))
  const [inAppPrefs, setInAppPrefs] = useState(init(inAppRows))
  const sv = { hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0 } }
  const ct = { show: { transition: { staggerChildren: 0.04 } } }

  function NotifCard({ title, rows, prefs, setPrefs }: { title: string; rows: { key: string; label: string; helper: string }[]; prefs: Record<string, boolean>; setPrefs: React.Dispatch<React.SetStateAction<Record<string, boolean>>> }) {
    return (
      <SectionCard>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>
        <div className="divide-y divide-gray-100">
          {rows.map((row) => (
            <div key={row.key} className="flex items-center justify-between py-4">
              <div>
                <p className="text-sm font-medium text-gray-900">{row.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{row.helper}</p>
              </div>
              <Toggle checked={prefs[row.key]} onChange={(v) => setPrefs((s) => ({ ...s, [row.key]: v }))} />
            </div>
          ))}
        </div>
      </SectionCard>
    )
  }

  return (
    <motion.div variants={ct} initial="hidden" animate="show">
      <motion.div variants={sv}>
        <NotifCard title="Email notifications" rows={emailRows} prefs={emailPrefs} setPrefs={setEmailPrefs} />
      </motion.div>
      <motion.div variants={sv}>
        <NotifCard title="In-app notifications" rows={inAppRows} prefs={inAppPrefs} setPrefs={setInAppPrefs} />
      </motion.div>
      <motion.div variants={sv}>
        <SaveButton onSave={onSave} label="Save preferences" />
      </motion.div>
    </motion.div>
  )
}

// ─── BILLING ──────────────────────────────────────────────────────────────────

function UsageBar({ label, used, max }: { label: string; used: number; max: number }) {
  const pct = Math.min((used / max) * 100, 100)
  return (
    <div>
      <div className="flex justify-between mb-1.5">
        <span className="text-sm text-gray-700">{label}</span>
        <span className="text-xs text-gray-500">{used} / {max}</span>
      </div>
      <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
        <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function BillingSection() {
  const billingRows = [
    { date: "Jan 1, 2025", desc: "Free Plan", amount: "$0.00", status: "Active" },
    { date: "Dec 1, 2024", desc: "Free Plan", amount: "$0.00", status: "—" },
    { date: "Nov 1, 2024", desc: "Free Plan", amount: "$0.00", status: "—" },
  ]
  const sv = { hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0 } }
  const ct = { show: { transition: { staggerChildren: 0.04 } } }

  return (
    <motion.div variants={ct} initial="hidden" animate="show" className="space-y-0">
      {/* Plan card */}
      <motion.div variants={sv}>
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-6 flex items-start justify-between gap-6">
          <div>
            <span className="inline-block bg-blue-100 text-blue-700 font-semibold rounded-full px-3 py-1 text-sm mb-3">Free Plan</span>
            <ul className="space-y-1.5 text-sm text-gray-600">
              {["2 projects", "5 services per canvas", "Community support", "Basic Terraform export"].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-blue-600 shrink-0" /> {f}
                </li>
              ))}
            </ul>
          </div>
          <div className="text-right shrink-0">
            <p className="text-2xl font-bold text-gray-900 mb-1">$29<span className="text-sm font-normal text-gray-500">/mo</span></p>
            <button type="button" className={btnPrimary}>Upgrade to Pro</button>
          </div>
        </div>
      </motion.div>

      {/* Usage */}
      <motion.div variants={sv}>
        <SectionCard>
          <SectionTitle>Usage this month</SectionTitle>
          <div className="space-y-5">
            <UsageBar label="Projects used" used={1} max={2} />
            <UsageBar label="Deployments" used={3} max={10} />
            <UsageBar label="API calls" used={247} max={1000} />
          </div>
        </SectionCard>
      </motion.div>

      {/* Billing history */}
      <motion.div variants={sv}>
        <SectionCard>
          <SectionTitle>Billing history</SectionTitle>
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {["Date", "Description", "Amount", "Status", "Invoice"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {billingRows.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-600">{row.date}</td>
                    <td className="px-4 py-3 text-gray-900">{row.desc}</td>
                    <td className="px-4 py-3 text-gray-600">{row.amount}</td>
                    <td className="px-4 py-3 text-gray-600">{row.status}</td>
                    <td className="px-4 py-3 text-gray-400">—</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </motion.div>
    </motion.div>
  )
}

// ─── EMAILS ───────────────────────────────────────────────────────────────────

function EmailsSection({ user, onSave }: { user: AuthUser | null; onSave: (updates?: Partial<AuthUser>) => Promise<void> }) {
  const [newEmail, setNewEmail] = useState("")
  const [keepPrivate, setKeepPrivate] = useState(false)
  const [blockCli, setBlockCli] = useState(false)
  const sv = { hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0 } }
  const ct = { show: { transition: { staggerChildren: 0.04 } } }

  return (
    <motion.div variants={ct} initial="hidden" animate="show">
      <SectionCard>
        <SectionTitle>Email addresses</SectionTitle>

        {/* Primary */}
        <motion.div variants={sv} className="mb-6">
          <SubTitle>Primary email</SubTitle>
          <div className="border-b border-gray-100 mb-4 mt-1" />
            <div className="flex flex-wrap items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <span className="text-sm font-medium text-gray-900">{user?.email ?? "No email available"}</span>
            <span className="bg-blue-100 text-blue-700 text-xs rounded-full px-2 py-0.5">Primary</span>
            <span className="bg-green-100 text-green-700 text-xs rounded-full px-2 py-0.5">Verified</span>
            <button type="button" className="text-xs text-blue-600 hover:underline ml-auto">Make private</button>
          </div>
        </motion.div>

        {/* Add email */}
        <motion.div variants={sv} className="mb-6">
          <SubTitle>Add email address</SubTitle>
          <div className="border-b border-gray-100 mb-4 mt-1" />
          <div className="flex gap-2 max-w-sm">
            <input className={inputCls} value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="Add email address" />
            <SaveButton onSave={() => onSave()} label="Add" extraCls="whitespace-nowrap" />
          </div>
        </motion.div>

        {/* Privacy */}
        <motion.div variants={sv}>
          <SubTitle>Email privacy</SubTitle>
          <div className="border-b border-gray-100 mb-4 mt-1" />
          <div className="divide-y divide-gray-100">
            <div className="flex items-start justify-between py-4">
              <div>
                <p className="text-sm font-medium text-gray-900">Keep my email address private</p>
                <p className="text-xs text-gray-500 mt-0.5">We will use a no-reply address for web-based operations.</p>
              </div>
              <Toggle checked={keepPrivate} onChange={setKeepPrivate} />
            </div>
            <div className="flex items-start justify-between py-4">
              <p className="text-sm font-medium text-gray-900">Block command line pushes that expose my email</p>
              <Toggle checked={blockCli} onChange={setBlockCli} />
            </div>
          </div>
        </motion.div>
      </SectionCard>
    </motion.div>
  )
}

// ─── PASSWORD & SECURITY ──────────────────────────────────────────────────────

function SecuritySection({ onSave }: { onSave: () => Promise<void> }) {
  const [current, setCurrent] = useState("")
  const [newPw, setNewPw] = useState("")
  const [confirm, setConfirm] = useState("")
  const [twoFaModal, setTwoFaModal] = useState(false)
  const [twoFaCode, setTwoFaCode] = useState("")

  function strength(pw: string) {
    let s = 0
    if (pw.length >= 8) s++
    if (/[A-Z]/.test(pw)) s++
    if (/[0-9]/.test(pw)) s++
    if (/[^A-Za-z0-9]/.test(pw)) s++
    return s
  }
  const s = strength(newPw)
  const strengthInfo = [
    { label: "Weak", cls: "bg-red-400 w-1/4" },
    { label: "Fair", cls: "bg-yellow-400 w-2/4" },
    { label: "Good", cls: "bg-blue-400 w-3/4" },
    { label: "Strong", cls: "bg-green-500 w-full" },
  ][Math.max(s - 1, 0)]

  const reqs = [
    { label: "At least 8 characters", met: newPw.length >= 8 },
    { label: "One uppercase letter", met: /[A-Z]/.test(newPw) },
    { label: "One number", met: /[0-9]/.test(newPw) },
    { label: "One special character", met: /[^A-Za-z0-9]/.test(newPw) },
  ]

  const sv = { hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0 } }
  const ct = { show: { transition: { staggerChildren: 0.04 } } }

  return (
    <motion.div variants={ct} initial="hidden" animate="show">
      <SectionCard>
        <SectionTitle>Password & Security</SectionTitle>

        {/* Change password */}
        <motion.div variants={sv} className="mb-8">
          <SubTitle>Change password</SubTitle>
          <div className="border-b border-gray-100 mb-5 mt-1" />
          <div className="max-w-sm space-y-4">
            <div><Label>Current password</Label><PasswordInput value={current} onChange={setCurrent} placeholder="Enter current password" /></div>
            <div><Label>New password</Label><PasswordInput value={newPw} onChange={setNewPw} placeholder="Enter new password" /></div>
            <div><Label>Confirm new password</Label><PasswordInput value={confirm} onChange={setConfirm} placeholder="Confirm new password" /></div>

            {newPw.length > 0 && (
              <div className="space-y-2">
                <div className="bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-300 ${strengthInfo.cls}`} />
                </div>
                <p className="text-xs text-gray-500">{strengthInfo.label}</p>
                <ul className="space-y-1 pt-1">
                  {reqs.map((r) => (
                    <li key={r.label} className="flex items-center gap-2 text-xs">
                      {r.met
                        ? <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                        : <Circle className="h-3.5 w-3.5 text-gray-300" />}
                      <span className={r.met ? "text-green-600" : "text-gray-500"}>{r.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <SaveButton onSave={onSave} label="Update password" />
          </div>
        </motion.div>

        {/* 2FA */}
        <motion.div variants={sv}>
          <SubTitle>Two-factor authentication</SubTitle>
          <div className="border-b border-gray-100 mb-5 mt-1" />
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-gray-100 text-gray-600 text-xs rounded-full px-2 py-0.5">Not configured</span>
              </div>
              <p className="text-sm text-gray-600">Add an extra layer of security. You will need a verification code in addition to your password.</p>
            </div>
            <button type="button" onClick={() => setTwoFaModal(true)} className={btnGhost + " whitespace-nowrap shrink-0"}>
              Enable 2FA
            </button>
          </div>
        </motion.div>
      </SectionCard>

      <Modal open={twoFaModal} onClose={() => setTwoFaModal(false)} title="Set up two-factor authentication">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Scan this QR code with your authenticator app, then enter the 6-digit code below.</p>
          <div className="flex justify-center">
            <div className="w-40 h-40 bg-gray-100 rounded-xl flex items-center justify-center">
              <QrCode className="h-16 w-16 text-gray-400" />
            </div>
          </div>
          <div>
            <Label>Verification code</Label>
            <input
              className={inputCls + " text-center font-mono text-lg tracking-widest"}
              value={twoFaCode}
              onChange={(e) => setTwoFaCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              maxLength={6}
            />
          </div>
          <button
            type="button"
            disabled={twoFaCode.length !== 6}
            onClick={() => { setTwoFaModal(false); void onSave() }}
            className={`w-full rounded-lg py-2 text-sm font-medium transition-colors ${twoFaCode.length === 6 ? btnPrimary : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
          >
            Verify
          </button>
        </div>
      </Modal>
    </motion.div>
  )
}

// ─── SESSIONS ─────────────────────────────────────────────────────────────────

function SessionsSection() {
  return (
    <SectionCard>
      <SectionTitle>Active sessions</SectionTitle>
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
        <Monitor className="mx-auto h-6 w-6 text-gray-400" />
        <p className="mt-2 text-sm font-medium text-gray-700">No sessions data available</p>
        <p className="mt-1 text-xs text-gray-500">Session management will appear here when backend endpoints are available.</p>
      </div>
    </SectionCard>
  )
}

// ─── API KEYS ─────────────────────────────────────────────────────────────────

function ApiKeysSection() {
  return (
    <SectionCard>
      <SectionTitle>API Keys</SectionTitle>
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
        <Key className="mx-auto h-6 w-6 text-gray-400" />
        <p className="mt-2 text-sm font-medium text-gray-700">No API keys yet</p>
        <p className="mt-1 text-xs text-gray-500">API key management will appear here when backend endpoints are available.</p>
      </div>
    </SectionCard>
  )
}

// ─── GIT CONNECTIONS ──────────────────────────────────────────────────────────

function ConnectionCard({
  icon: Icon,
  iconColor,
  name,
  description,
  connected,
  connectedAs,
  onToggle,
}: {
  icon: React.ElementType
  iconColor: string
  name: string
  description: string
  connected: boolean
  connectedAs: string
  onToggle: () => void
}) {
  return (
    <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
      <div className="flex items-start gap-3 mb-3">
        <Icon className={`h-8 w-8 ${iconColor}`} />
        <div>
          <p className="text-lg font-semibold text-gray-900">{name}</p>
          {connected ? (
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm text-gray-600">Connected as @{connectedAs}</span>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Not connected</p>
          )}
        </div>
      </div>
      <p className="text-sm text-gray-600 mb-4">{description}</p>
      {connected ? (
        <button type="button" onClick={onToggle} className="border border-red-200 text-red-600 hover:bg-red-50 text-sm rounded-lg px-4 py-2 transition-colors">
          Disconnect
        </button>
      ) : (
        <button type="button" onClick={onToggle} className={btnGhost}>
          Connect {name}
        </button>
      )}
    </div>
  )
}

function GitSection({ onSave }: { onSave: () => Promise<void> }) {
  const user = useAuthStore((s) => s.user)
  const [githubConnected, setGithubConnected] = useState(false)
  const [gitlabConnected, setGitlabConnected] = useState(false)
  const sv = { hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0 } }
  const ct = { show: { transition: { staggerChildren: 0.04 } } }

  return (
    <motion.div variants={ct} initial="hidden" animate="show">
      <motion.div variants={sv}>
        <h2 className="text-xl font-semibold text-gray-900 mb-1">Git connections</h2>
        <div className="border-b border-gray-200 mb-6 mt-2" />
      </motion.div>
      <motion.div variants={sv} className="grid grid-cols-2 gap-4">
        <ConnectionCard
          icon={Github}
          iconColor="text-gray-900"
          name="GitHub"
          description="Sync your projects with GitHub repositories"
          connected={githubConnected}
          connectedAs={user?.username || "user"}
          onToggle={() => { setGithubConnected((c) => !c); if (!githubConnected) void onSave() }}
        />
        <ConnectionCard
          icon={GitBranch}
          iconColor="text-orange-500"
          name="GitLab"
          description="Sync your projects with GitLab repositories"
          connected={gitlabConnected}
          connectedAs={user?.username || "user"}
          onToggle={() => { setGitlabConnected((c) => !c); if (!gitlabConnected) void onSave() }}
        />
      </motion.div>
    </motion.div>
  )
}

// ─── AWS CREDENTIALS ──────────────────────────────────────────────────────────

function AwsSection({ onSave }: { onSave: () => Promise<void> }) {
  const [form, setForm] = useState({ profile: "", accessKey: "", secretKey: "", region: "us-east-1" })
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))
  const sv = { hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0 } }
  const ct = { show: { transition: { staggerChildren: 0.04 } } }
  const AWS_REGIONS = ["us-east-1","us-east-2","us-west-1","us-west-2","eu-west-1","eu-west-2","eu-central-1","ap-southeast-1","ap-southeast-2","ap-northeast-1","ap-south-1","sa-east-1","ca-central-1"]

  return (
    <motion.div variants={ct} initial="hidden" animate="show">
      <motion.div variants={sv} className="flex gap-3 bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <ShieldAlert className="h-5 w-5 text-yellow-600 mt-0.5 shrink-0" />
        <p className="text-sm text-yellow-800">
          Credentials are encrypted at rest with AES-256. Never share your AWS credentials with anyone.
        </p>
      </motion.div>

      {/* Saved credentials */}
      <motion.div variants={sv}>
        <SectionCard>
          <SectionTitle>Saved credentials</SectionTitle>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="flex items-center gap-4 p-4">
              <div>
                <span className="bg-blue-100 text-blue-700 text-xs font-medium rounded-full px-2 py-0.5">production</span>
                <span className="text-xs text-gray-500 ml-2">us-east-1</span>
              </div>
              <span className="flex-1 font-mono text-gray-500 text-sm">AKIA••••••••XXXX</span>
              <div className="flex gap-3">
                <button type="button" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">Edit</button>
                <button type="button" className="text-sm text-red-500 hover:text-red-700 transition-colors">Delete</button>
              </div>
            </div>
          </div>
        </SectionCard>
      </motion.div>

      {/* Add credentials */}
      <motion.div variants={sv}>
        <SectionCard>
          <SectionTitle>Add credentials</SectionTitle>
          <div className="max-w-sm space-y-4">
            <div><Label>Profile name</Label><input className={inputCls} value={form.profile} onChange={set("profile")} placeholder="e.g. production" /></div>
            <div><Label>AWS Access Key ID</Label><input className={inputCls + " font-mono"} value={form.accessKey} onChange={set("accessKey")} placeholder="AKIAIOSFODNN7EXAMPLE" /></div>
            <div><Label>AWS Secret Access Key</Label><PasswordInput value={form.secretKey} onChange={(v) => setForm((f) => ({ ...f, secretKey: v }))} placeholder="wJalrXUtnFEMI/K7MDENG..." /></div>
            <div>
              <Label>Default region</Label>
              <select className={inputCls} value={form.region} onChange={set("region")}>
                {AWS_REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <SaveButton onSave={onSave} label="Save credentials" />
          </div>
        </SectionCard>
      </motion.div>
    </motion.div>
  )
}

// ─── DANGER ZONE ──────────────────────────────────────────────────────────────

function DangerSection() {
  const [deleteModal, setDeleteModal] = useState(false)
  const [deleteInput, setDeleteInput] = useState("")
  const sv = { hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0 } }
  const ct = { show: { transition: { staggerChildren: 0.04 } } }

  const cards = [
    {
      title: "Export your data",
      desc: "Download a full copy of your CloudForge projects and configurations.",
      btn: "Export data",
      onClick: () => toast.success("Export started — check your email shortly"),
      danger: false,
    },
    {
      title: "Transfer ownership",
      desc: "Transfer all projects to another CloudForge user.",
      btn: "Transfer",
      onClick: () => toast("Transfer flow coming soon", { icon: "ℹ️" }),
      danger: false,
    },
    {
      title: "Delete this account",
      desc: "Once deleted, all data is permanently removed and cannot be recovered.",
      btn: "Delete account",
      onClick: () => setDeleteModal(true),
      danger: true,
    },
  ]

  return (
    <motion.div variants={ct} initial="hidden" animate="show" className="space-y-4">
      {cards.map((card) => (
        <motion.div key={card.title} variants={sv} className="border border-red-200 rounded-xl p-6 bg-red-50/30 flex items-center justify-between gap-6">
          <div>
            <p className={`text-sm font-semibold ${card.danger ? "text-red-600" : "text-gray-900"}`}>{card.title}</p>
            <p className="text-sm text-gray-500 mt-0.5">{card.desc}</p>
          </div>
          <button
            type="button"
            onClick={card.onClick}
            className={card.danger
              ? "bg-red-600 text-white text-sm rounded-lg px-4 py-2 hover:bg-red-700 transition-colors whitespace-nowrap shrink-0"
              : btnGhost + " whitespace-nowrap shrink-0"}
          >
            {card.btn}
          </button>
        </motion.div>
      ))}

      <Modal open={deleteModal} onClose={() => setDeleteModal(false)} title="">
        <div className="space-y-4 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold text-gray-900">Delete your account?</h2>
          <div className="text-left space-y-1.5">
            {[
              "All projects and canvas designs",
              "All generated Terraform configurations",
              "All deployment history and logs",
              "All API keys and integrations",
            ].map((item) => (
              <p key={item} className="text-sm text-gray-600 flex items-center gap-2">
                <X className="h-3.5 w-3.5 text-red-500 shrink-0" /> {item}
              </p>
            ))}
          </div>
          <div className="text-left">
            <Label>Type DELETE to confirm</Label>
            <input
              className="w-full bg-white border-2 border-red-300 text-gray-900 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500"
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              placeholder="DELETE"
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setDeleteModal(false)} className={btnGhost + " flex-1"}>Cancel</button>
            <button
              type="button"
              disabled={deleteInput !== "DELETE"}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${deleteInput === "DELETE" ? "bg-red-600 text-white hover:bg-red-700" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
            >
              Delete permanently
            </button>
          </div>
        </div>
      </Modal>
    </motion.div>
  )
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────

function Sidebar({ active, onChange }: { active: Section; onChange: (s: Section) => void }) {
  return (
    // Fixed flush-left sidebar that starts directly below the ProfileLayout header (h-14 = 3.5rem)
    <nav className="hidden md:flex flex-col fixed left-0 top-14 h-[calc(100vh-3.5rem)] w-64 bg-white border-r border-gray-200 overflow-y-auto z-20 py-4" aria-label="Settings navigation">
      {NAV_GROUPS.map((group, gi) => (
        <div key={gi} className="mb-1">
          {group.label && (
            <p className="text-xs text-gray-400 uppercase tracking-widest px-4 pt-5 pb-2 font-medium">
              {group.label}
            </p>
          )}
          {group.items.map((item) => {
            const Icon = item.icon
            const isActive = active === item.key
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onChange(item.key)}
                style={{ width: "calc(100% - 1rem)" }}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg mx-2 text-sm transition-colors duration-100 ${
                  item.danger
                    ? isActive
                      ? "bg-red-50 text-red-600 font-medium border-l-2 border-red-500 rounded-l-none"
                      : "text-red-500 hover:bg-red-50 hover:text-red-600"
                    : isActive
                    ? "bg-blue-50 text-blue-700 font-medium border-l-2 border-blue-600 rounded-l-none"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </button>
            )
          })}
        </div>
      ))}
    </nav>
  )
}

function MobileTabBar({ active, onChange }: { active: Section; onChange: (s: Section) => void }) {
  const allItems = NAV_GROUPS.flatMap((g) => g.items)
  return (
    <div className="md:hidden sticky top-0 z-10 bg-white border-b border-gray-200 overflow-x-auto shadow-sm mb-6">
      <div className="flex gap-1 px-4 py-2">
        {allItems.map((item) => {
          const Icon = item.icon
          const isActive = active === item.key
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onChange(item.key)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg whitespace-nowrap text-xs transition-colors ${
                isActive ? "bg-blue-50 text-blue-700 font-medium" : item.danger ? "text-red-500" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────

export default function Profile() {
  const user = useAuthStore((s) => s.user)
  const isLoading = useAuthStore((s) => s.isLoading)
  const updateProfile = useAuthStore((s) => s.updateProfile)
  const [activeSection, setActiveSection] = useState<Section>("profile")

  const handleSave = useCallback(async (updates?: Partial<AuthUser>): Promise<void> => {
    try {
      if (updates && Object.keys(updates).length > 0) {
        await updateProfile(updates)
      }
      toast.success("Changes saved successfully")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save changes"
      toast.error(message)
      throw error
    }
  }, [updateProfile])

  function renderSection() {
    switch (activeSection) {
      case "profile": return <ProfileSection user={user} onSave={handleSave} />
      case "account": return <AccountSection user={user} onSave={handleSave} />
      case "appearance": return <AppearanceSection onSave={handleSave} />
      case "notifications": return <NotificationsSection onSave={handleSave} />
      case "billing": return <BillingSection />
      case "emails": return <EmailsSection user={user} onSave={handleSave} />
      case "security": return <SecuritySection onSave={handleSave} />
      case "sessions": return <SessionsSection />
      case "api-keys": return <ApiKeysSection />
      case "git": return <GitSection onSave={handleSave} />
      case "aws": return <AwsSection onSave={handleSave} />
      case "danger": return <DangerSection />
    }
  }

  return (
    <>
      {/* Mobile: scrollable tab bar (no fixed — no outer padding to counteract) */}
      <MobileTabBar active={activeSection} onChange={setActiveSection} />

      {/* Desktop: fixed flush-left sidebar */}
      <Sidebar active={activeSection} onChange={setActiveSection} />

      {/* Main content — offset by sidebar width on desktop, full-width on mobile */}
      <div className="md:ml-64 min-h-[calc(100vh-3.5rem)] bg-gray-50">
        {/* Inner content constrained + padded; max-w applied HERE not on the sidebar wrapper */}
        <div className="max-w-4xl mx-auto px-6 py-8">
          {isLoading && !user && (
            <div className="mb-4 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-500">
              Loading profile...
            </div>
          )}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {renderSection()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </>
  )
}
