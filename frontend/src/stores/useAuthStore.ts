import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { User } from "../types/auth.types"

interface AuthStore {
  /** The authenticated user, or null if not logged in. */
  user: User | null
  /** JWT access token, or null if not logged in. */
  accessToken: string | null
  /** True when both user and accessToken are set. */
  isAuthenticated: boolean
  /** True while an auth operation is in progress. */
  isLoading: boolean

  /** Stores the user and recomputes isAuthenticated. */
  setUser: (user: User) => void
  /** Stores the access token and recomputes isAuthenticated. */
  setAccessToken: (token: string) => void
  /** Clears all auth state (triggers zustand-persist to wipe localStorage). */
  logout: () => void
  /** Sets the loading flag. */
  setLoading: (loading: boolean) => void
}

const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) =>
        set((state) => ({
          user,
          isAuthenticated: user !== null && state.accessToken !== null,
        })),

      setAccessToken: (token) =>
        set((state) => ({
          accessToken: token,
          isAuthenticated: state.user !== null && token !== null,
        })),

      logout: () =>
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
        }),

      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: "cloudforge-auth",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

export default useAuthStore

