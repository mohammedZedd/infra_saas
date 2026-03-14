import React, { useRef, useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { NotificationDropdown } from "../notifications/NotificationDropdown";
import { useNotifications } from "../../hooks/useNotifications";

export const NotificationBell: React.FC = () => {
  const { unreadCount } = useNotifications();
  const [open, setOpen] = useState(false);
  const bellRef = useRef<HTMLButtonElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click (comme menu profil)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        ref={bellRef}
        className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        aria-label="Notifications"
        onClick={() => {
          setOpen((v) => !v);
        }}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-white text-xs font-bold shadow ring-2 ring-white">
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 min-w-[320px] w-[400px] max-h-[480px]">
          <NotificationDropdown open={open} onClose={() => setOpen(false)} anchorRef={bellRef as React.RefObject<HTMLButtonElement>} />
        </div>
      )}
    </div>
  );
};
