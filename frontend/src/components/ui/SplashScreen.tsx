// ── SplashScreen ───────────────────────────────────────────────────────────
//
// Minimal full-page loader shown while AuthGate validates the stored token.
// Kept intentionally lightweight — no animation libraries — so it paints
// as fast as possible and doesn't block the hydration render.

export default function SplashScreen() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4"
      role="status"
      aria-label="Loading"
    >
      {/* Spinner */}
      <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-blue-600 animate-spin" />

      {/* Brand name — same font weight as the auth pages */}
      <p className="text-sm text-gray-400 select-none tracking-wide">
        CloudForge
      </p>
    </div>
  )
}
