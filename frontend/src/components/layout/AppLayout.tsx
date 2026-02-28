import React, { useEffect } from "react"
import { cn } from "../../utils/cn"
import { Sidebar } from "./Sidebar"
import { Header } from "./Header"
import useUIStore from "../../stores/useUIStore"

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const collapsed = useUIStore((s) => s.sidebarCollapsed)
  const setSidebarCollapsed = useUIStore((s) => s.setSidebarCollapsed)

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true)
      }
    }
    onResize()
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [setSidebarCollapsed])

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <div
        className={cn(
          "fixed inset-0 z-30 bg-black/40 backdrop-blur-sm transition-opacity md:hidden",
          !collapsed ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setSidebarCollapsed(true)}
        aria-hidden="true"
      />

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 transition-transform duration-300 md:relative md:translate-x-0",
          collapsed ? "-translate-x-full" : "translate-x-0"
        )}
      >
        <Sidebar />
      </div>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header />
        <main id="main-content" className="flex-1 overflow-y-auto overflow-x-hidden p-6 lg:p-8" tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  )
}

export default AppLayout
