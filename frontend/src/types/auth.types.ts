/** Subscription plan identifier. */
export type UserPlan = "free" | "pro" | "team" | "enterprise"

/** Authenticated user object. */
export interface User {
  id: string
  email: string
  name: string
  avatar_url: string | null
  plan: UserPlan
  created_at: string
  updated_at: string
}

/** Global authentication state shape. */
export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  accessToken: string | null
}

/** Credentials for email/password login. */
export interface LoginCredentials {
  email: string
  password: string
}

/** Credentials for account creation. */
export interface RegisterCredentials {
  email: string
  password: string
  name: string
}

/** Request body for initiating a password reset. */
export interface ResetPasswordRequest {
  email: string
}

/** Request body for confirming a password reset with a verification code. */
export interface ConfirmResetPassword {
  email: string
  code: string
  newPassword: string
}

/** Cognito token set returned after successful authentication. */
export interface CognitoTokens {
  accessToken: string
  idToken: string
  refreshToken: string
}

