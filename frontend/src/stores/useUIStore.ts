import { create } from "zustand"
import { persist } from "zustand/middleware"

interface UIStore {
  /** Whether the main dashboard sidebar is collapsed to icon-only mode. */
  sidebarCollapsed: boolean
  /** The id of the currently open modal, or null if none. */
  activeModal: string | null
  /** Optional data payload passed when opening a modal. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  modalData: Record<string, any> | null
  /** Whether to show the grid pattern on the canvas. */
  canvasGridVisible: boolean
  showMinimap: boolean

  /** current type being dragged from the sidebar (for preview) */
  draggingType: string | null
  /** current pointer position in flow coordinates while dragging */
  dragPosition: { x: number; y: number } | null

  /** Flips the sidebar between expanded and collapsed. */
  toggleSidebar: () => void
  /** Explicitly sets the sidebar collapsed state. */
  setSidebarCollapsed: (collapsed: boolean) => void
  /** Opens a modal by id with optional data payload. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  openModal: (modalId: string, data?: Record<string, any>) => void
  /** Closes the active modal and clears its data. */
  closeModal: () => void
  /** Toggles canvas grid visibility. */
  toggleCanvasGrid: () => void
  /** Explicitly sets canvas grid visibility. */
  setCanvasGridVisible: (visible: boolean) => void
  /** Sets the currently dragging component type for preview. */
  setDraggingType: (type: string | null) => void
  /** Sets the current drag position in flow coordinates. */
  setDragPosition: (pos: { x: number; y: number } | null) => void
}

const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      activeModal: null,
      modalData: null,
      canvasGridVisible: false,
      showMinimap: false,
      draggingType: null,
      dragPosition: null,

      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

      openModal: (modalId, data = {}) =>
        set({ activeModal: modalId, modalData: data }),

      closeModal: () => set({ activeModal: null, modalData: null }),

      toggleCanvasGrid: () =>
        set((state) => ({ canvasGridVisible: !state.canvasGridVisible })),

      setCanvasGridVisible: (visible: boolean) => set({ canvasGridVisible: visible }),

      setDraggingType: (type: string | null) => set({ draggingType: type }),
      setDragPosition: (pos: { x: number; y: number } | null) => set({ dragPosition: pos }),

      toggleMinimap: () =>
        set((state) => ({ showMinimap: !state.showMinimap })),

      setMinimapVisible: (visible: boolean) => set({ showMinimap: visible }),
    }),
    {
      name: "cloudforge-ui",
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        canvasGridVisible: state.canvasGridVisible,
        showMinimap: state.showMinimap,
      }),
    }
  )
)

export default useUIStore

