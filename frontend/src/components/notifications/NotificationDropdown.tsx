import React, { useRef, useEffect, useState } from "react";
import { NotificationItem } from "./NotificationItem";
import { useNotifications } from "../../hooks/useNotifications";
import { Bell } from "lucide-react";
import clsx from "clsx";
import { useNavigate } from "react-router-dom";

type NotificationDropdownProps = {
  open: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
};

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ open, onClose, anchorRef }) => {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  const panelRef = useRef<HTMLDivElement>(null);
  const [animate, setAnimate] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      setAnimate(true);
    } else {
      setTimeout(() => setAnimate(false), 200);
    }
  }, [open]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(event.target as Node)
      ) {
        onClose();
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
  }, [open, onClose, anchorRef]);

  return (
    <div
      ref={panelRef}
      className={clsx(
        "absolute right-0 mt-2 w-[400px] max-h-[480px] z-50 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden flex flex-col transition-all duration-200",
        animate && open
          ? "opacity-100 translate-y-0"
          : "opacity-0 -translate-y-2 pointer-events-none"
      )}
      style={{ top: "100%" }}
      tabIndex={-1}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white sticky top-0 z-10">
        <span className="font-semibold text-lg text-gray-900">Notifications</span>
        <button
          className="text-indigo-600 text-sm font-medium hover:underline"
          onClick={markAllAsRead}
        >
          Mark all as read
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Bell size={40} className="mb-2" />
            <span className="font-medium">No notifications yet</span>
          </div>
        ) : (
          notifications.map((notif) => (
            <NotificationItem
              key={notif.id}
              notification={notif}
              onClick={(n) => {
                markAsRead(n.id);
                navigate(`/notifications/${n.id}`);
                onClose();
              }}
            />
          ))
        )}
      </div>
      <div className="border-t border-gray-100 bg-white px-4 py-2 text-right sticky bottom-0 z-10">
        <button
          onClick={() => {
            navigate("/notifications");
            onClose();
          }}
          className="text-indigo-600 text-sm font-medium hover:underline"
        >
          View all notifications
        </button>
      </div>
    </div>
  );
};
