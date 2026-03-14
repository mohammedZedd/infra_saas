import { create } from "zustand"
import api from "@/lib/api"

// ── User shape ─────────────────────────────────────────────────────────────
export interface User {
  id: string
  name: string
  email: string
  username: string
  avatar: string | null
  plan: "free" | "pro" | "enterprise"
  bio?: string | null
  jobTitle?: string | null
  company?: string | null
  website?: string | null
  twitter?: string | null
  region?: string | null
}

// ── Storage keys ───────────────────────────────────────────────────────────
const KEYS = {
  token:   "cf_access_token",
  refresh: "cf_refresh_token",
  user:    "cf_user",
  version: "cf_store_version",
} as const

// Bump this string to force-wipe all existing localStorage sessions.
const STORE_VERSION = "v3"

// ── localStorage helpers ───────────────────────────────────────────────────
const clearStorage = () => {
  localStorage.removeItem(KEYS.token)
  localStorage.removeItem(KEYS.refresh)
  localStorage.removeItem(KEYS.user)
}

// ── Synchronous boot-time hydration ───────────────────────────────────────
// Runs once at module import time — before any React render.
// The version check auto-wipes stale data from old sessions.
interface BootState {
  user:            User | null
  /** Primary auth token (JWT / access token). Stored as cf_access_token. */
  token:           string | null
  refreshToken:    string | null
  isAuthenticated: boolean
  isLoading:       boolean
  // Set to true once AuthGate finishes hydration (sync + optional /me call).
  // ProtectedRoute waits for this before allowing or denying access.
  isHydrated:      boolean
}

const defaultState: BootState = {
  user:            null,
  token:           null,
  refreshToken:    null,
  isAuthenticated: false,
  isLoading:       false,
  isHydrated:      false,
}

function getInitialState(): BootState {
  try {
    const version = localStorage.getItem(KEYS.version)
    if (version !== STORE_VERSION) {
      clearStorage()
      localStorage.setItem(KEYS.version, STORE_VERSION)
      return defaultState
    }

    const token = localStorage.getItem(KEYS.token)
    const raw   = localStorage.getItem(KEYS.user)
    if (!token || !raw) return defaultState

    const user = JSON.parse(raw) as User
    if (!user?.id || !user?.email || !user?.name) {
      clearStorage()
      return defaultState
    }

    return {
      user,
      token:           token,
      refreshToken:    localStorage.getItem(KEYS.refresh),
      isAuthenticated: true,
      isLoading:       false,
      // isHydrated stays false — AuthGate sets it true after optional /me validation.
      isHydrated:      false,
    }
  } catch {
    clearStorage()
    return defaultState
  }
}

const BOOT = getInitialState()

// ── Store interface ────────────────────────────────────────────────────────
interface AuthStore extends BootState {
  login:          (user: User, token: string, refreshToken: string) => void
  logout:         () => void
  setUser:        (user: User) => void
  setTokens:      (token: string, refreshToken: string) => void
  initialize:     () => void
  setLoading:     (loading: boolean) => void
  setHydrated:    (hydrated: boolean) => void
  updateProfile:  (updates: Partial<User>) => Promise<User>
  /**
   * Validate stored token against /auth/me, then set isHydrated = true.
   * Called once by AuthGate on mount. Idempotent — safe to call multiple times.
   */
  hydrateAuth:    () => Promise<void>
  /** @deprecated Use hydrateAuth */
  hydrateAsync:   () => Promise<void>
  /** @deprecated Use token */
  readonly accessToken: string | null
}

// ── Store implementation ───────────────────────────────────────────────────
export const useAuthStore = create<AuthStore>()((set, get) => ({
  ...BOOT,

  login: (user, token, refreshToken) => {
    localStorage.setItem(KEYS.version, STORE_VERSION)
    localStorage.setItem(KEYS.token,   token)
    localStorage.setItem(KEYS.refresh, refreshToken)
    localStorage.setItem(KEYS.user,    JSON.stringify(user))
    set({ user, token, refreshToken, isAuthenticated: true, isLoading: false })
  },

  logout: () => {
    clearStorage()
    set({ user: null, token: null, refreshToken: null, isAuthenticated: false, isLoading: false })
  },

  setUser: (user) => {
    localStorage.setItem(KEYS.user, JSON.stringify(user))
    set({ user })
  },

  setTokens: (token, refreshToken) => {
    localStorage.setItem(KEYS.token,   token)
    localStorage.setItem(KEYS.refresh, refreshToken)
    set({ token, refreshToken })
  },

  initialize: () => { /* intentional no-op — use hydrateAuth instead */ },

  setLoading: (loading) => set({ isLoading: loading }),

  setHydrated: (hydrated) => set({ isHydrated: hydrated }),

  updateProfile: async (updates) => {
    set({ isLoading: true })
    try {
      const response = await api.put<{ user?: User } | User>("/auth/me", updates)
      const payload = response.data
      const apiUser = "user" in payload ? payload.user : payload
      const nextUser = { ...(get().user ?? {} as User), ...(apiUser ?? {}), ...updates } as User
      localStorage.setItem(KEYS.user, JSON.stringify(nextUser))
      set({ user: nextUser, isLoading: false, isAuthenticated: true })
      return nextUser
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

hydrateAuth: async () => {
    // Already hydrated — nothing to do.
    if (get().isHydrated) return

    const { token } = get()

    // No token on disk → unauthenticated, mark hydrated immediately.
    if (!token) {
      set({ isAuthenticated: false, isHydrated: true })
      return
    }

    // Token exists — validate with /auth/me.
    // If the endpoint isn't wired up yet the catch will still mark hydrated
    // rather than leaving the app in a permanent loading state.
    try {
      const res = await api.get<{ user: User }>("/auth/me")
      const freshUser = res.data.user
      localStorage.setItem(KEYS.user, JSON.stringify(freshUser))
      set({ user: freshUser, isAuthenticated: true, isHydrated: true })
    } catch (err: unknown) {
      // 401 → token is invalid or expired; clear everything.
      // Any other error (network, 5xx) → keep optimistic auth state so the
      // user isn't logged out due to a transient backend outage.
      const status = (err as { response?: { status?: number } }).response?.status
      if (status === 401) {
        clearStorage()
        set({ user: null, token: null, refreshToken: null, isAuthenticated: false, isHydrated: true })
      } else {
        // Non-auth error: trust BOOT data, mark hydrated.
        set({ isHydrated: true })
      }
    }
  },

  // Deprecated alias kept for backward compatibility.
  get hydrateAsync() { return get().hydrateAuth },

  // Deprecated alias: token was previously called accessToken.
  get accessToken() { return get().token },
}))

export default useAuthStore
