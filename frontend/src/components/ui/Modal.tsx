import React, { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/utils/cn";

// ---------------------------------------------------------------------------
// Scroll lock — module-level counter so stacked modals work correctly.
// ---------------------------------------------------------------------------
let _scrollLockCount = 0;

function acquireScrollLock(): void {
  _scrollLockCount++;
  if (_scrollLockCount === 1) {
    document.body.classList.add("overflow-hidden");
  }
}

function releaseScrollLock(): void {
  _scrollLockCount = Math.max(0, _scrollLockCount - 1);
  if (_scrollLockCount === 0) {
    document.body.classList.remove("overflow-hidden");
  }
}

// ---------------------------------------------------------------------------
// Portal target
// ---------------------------------------------------------------------------
function getPortalTarget(): HTMLElement {
  return document.getElementById("modal-root") ?? document.body;
}

// ---------------------------------------------------------------------------
// Size map
// ---------------------------------------------------------------------------
type ModalSize = "sm" | "md" | "lg" | "xl" | "2xl";

const SIZE_CLASS: Record<ModalSize, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
export interface ModalProps {
  /** New primary prop — preferred over the legacy `isOpen` alias */
  open?: boolean;
  /** @deprecated use `open` */
  isOpen?: boolean;

  onClose: () => void;

  title?: string;
  /** @deprecated use `description` */
  subtitle?: string;
  description?: string;

  children: React.ReactNode;

  /** Rendered in a bordered footer strip */
  footer?: React.ReactNode;

  size?: ModalSize;

  showCloseButton?: boolean;

  /** `false` keeps backdrop click from closing. @deprecated use `closeOnBackdrop` */
  disableBackdropClose?: boolean;
  closeOnBackdrop?: boolean;

  closeOnEsc?: boolean;

  /** Ref to the element that should receive focus on open */
  initialFocusRef?: React.RefObject<HTMLElement | null>;

  className?: string;
}

// ---------------------------------------------------------------------------
// Modal
// ---------------------------------------------------------------------------

/**
 * Full-screen portal modal with backdrop blur, scroll lock, Escape handling,
 * and ARIA attributes.
 *
 * Usage (new API):
 * ```tsx
 * <Modal open={isOpen} onClose={close} title="Settings">…</Modal>
 * ```
 *
 * Legacy API (`isOpen`, `subtitle`, `disableBackdropClose`) is still accepted.
 */
export function Modal({
  open,
  isOpen,
  onClose,
  title,
  subtitle,
  description,
  children,
  footer,
  size = "md",
  showCloseButton = true,
  disableBackdropClose,
  closeOnBackdrop = true,
  closeOnEsc = true,
  initialFocusRef,
  className,
}: ModalProps) {
  // Resolve legacy aliases
  const isVisible = open ?? isOpen ?? false;
  const desc = description ?? subtitle;
  const allowBackdropClose =
    disableBackdropClose !== undefined ? !disableBackdropClose : closeOnBackdrop;

  const titleId = useId();
  const descId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // ------ Escape key -------------------------------------------------------
  useEffect(() => {
    if (!isVisible || !closeOnEsc) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isVisible, closeOnEsc, onClose]);

  // ------ Scroll lock -------------------------------------------------------
  useEffect(() => {
    if (!isVisible) return;
    acquireScrollLock();
    return releaseScrollLock;
  }, [isVisible]);

  // ------ Initial focus -----------------------------------------------------
  useEffect(() => {
    if (!isVisible) return;
    const frame = requestAnimationFrame(() => {
      if (initialFocusRef?.current) {
        initialFocusRef.current.focus();
      } else {
        closeButtonRef.current?.focus();
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [isVisible, initialFocusRef]);

  if (!isVisible) return null;

  const dialog = (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 bg-black/40 backdrop-blur-sm"
      aria-hidden="false"
      // Close when clicking the backdrop itself, not the dialog
      onClick={(e) => {
        if (allowBackdropClose && e.target === e.currentTarget) onClose();
      }}
    >
      {/* Dialog panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={!title ? "Dialog" : undefined}
        aria-describedby={desc ? descId : undefined}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "relative w-full bg-white rounded-2xl shadow-xl",
          "max-h-[85vh] overflow-auto",
          "focus:outline-none",
          SIZE_CLASS[size],
          className
        )}
      >
        {/* Close button */}
        {showCloseButton && (
          <button
            ref={closeButtonRef}
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <X size={16} aria-hidden="true" />
          </button>
        )}

        {/* Header */}
        {(title || desc) && (
          <div className="px-6 pt-6 pb-0">
            {title && (
              <h2
                id={titleId}
                className="text-lg font-semibold text-gray-900 pr-8"
              >
                {title}
              </h2>
            )}
            {desc && (
              <p id={descId} className="mt-1 text-sm text-gray-600">
                {desc}
              </p>
            )}
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-5">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(dialog, getPortalTarget());
}

export default Modal;
