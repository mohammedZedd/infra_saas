import React from "react";
import type { Notification } from "../../types/notification";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Users,
  Info,
  DollarSign,
  ArrowRight,
} from "lucide-react";
import clsx from "clsx";
import { formatDistanceToNow, parseISO } from "date-fns";

const typeIconMap: Record<Notification["type"], React.ReactNode> = {
  project_created: <CheckCircle2 className="text-green-500" />,
  terraform_plan_success: <CheckCircle2 className="text-green-500" />,
  terraform_plan_failed: <XCircle className="text-red-500" />,
  terraform_apply_success: <CheckCircle2 className="text-green-500" />,
  terraform_apply_failed: <XCircle className="text-red-500" />,
  resource_limit_warning: <AlertTriangle className="text-amber-500" />,
  team_invite: <Users className="text-indigo-500" />,
  system_update: <Info className="text-blue-500" />,
  cost_alert: <DollarSign className="text-purple-500" />,
};

interface NotificationItemProps {
  notification: Notification;
  onClick: (notification: Notification) => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onClick }) => {
  return (
    <button
      className={clsx(
        "flex w-full items-start gap-3 px-4 py-3 transition-colors text-left",
        !notification.read && "bg-indigo-50 hover:bg-indigo-100",
        notification.read && "hover:bg-gray-50"
      )}
      onClick={() => onClick(notification)}
      tabIndex={0}
    >
      <span className="mt-1 flex-shrink-0">
        {typeIconMap[notification.type]}
      </span>
      <span className="flex-1 min-w-0">
        <span className="flex items-center gap-2">
          <span className="font-semibold text-gray-900 truncate">
            {notification.title}
          </span>
          {!notification.read && (
            <span className="ml-1 h-2 w-2 rounded-full bg-indigo-500 inline-block" />
          )}
        </span>
        <span className="block text-gray-500 text-sm line-clamp-2">
          {notification.message}
        </span>
        <span className="block text-xs text-gray-400 mt-1">
          {formatDistanceToNow(parseISO(notification.createdAt), { addSuffix: true })}
        </span>
      </span>
      {notification.actionUrl && (
        <ArrowRight className="text-gray-400 mt-1 flex-shrink-0" size={18} />
      )}
    </button>
  );
};
