import AuthLayout from "../components/auth/AuthLayout"
import RegisterForm from "../components/auth/RegisterForm"

export default function Register() {
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start building infrastructure visually"
      footerText="Already have an account?"
      footerLinkText="Sign in"
      footerLinkTo="/login"
    >
      <RegisterForm />
    </AuthLayout>
  )
}