import { Outlet } from "react-router-dom"

/**
 * Fullscreen layout for the canvas editor.
 * No sidebar, no topbar — the Editor component has its own navbar.
 */
export default function EditorLayout() {
  return (
    <div className="w-full h-screen overflow-hidden bg-gray-950">
      <Outlet />
    </div>
  )
}
