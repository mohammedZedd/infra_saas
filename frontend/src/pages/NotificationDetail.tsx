import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useNotifications } from "../hooks/useNotifications";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Users,
  Info,
  DollarSign,
  ArrowLeft,
} from "lucide-react";

const typeIconMap = {
  project_created: <CheckCircle2 className="text-green-500 w-7 h-7" />,
  terraform_plan_success: <CheckCircle2 className="text-green-500 w-7 h-7" />,
  terraform_plan_failed: <XCircle className="text-red-500 w-7 h-7" />,
  terraform_apply_success: <CheckCircle2 className="text-green-500 w-7 h-7" />,
  terraform_apply_failed: <XCircle className="text-red-500 w-7 h-7" />,
  resource_limit_warning: <AlertTriangle className="text-amber-500 w-7 h-7" />,
  team_invite: <Users className="text-indigo-500 w-7 h-7" />,
  system_update: <Info className="text-blue-500 w-7 h-7" />,
  cost_alert: <DollarSign className="text-purple-500 w-7 h-7" />,
};

const typeLabelMap = {
  project_created: "Project Created",
  terraform_plan_success: "Plan Success",
  terraform_plan_failed: "Plan Failed",
  terraform_apply_success: "Apply Success",
  terraform_apply_failed: "Apply Failed",
  resource_limit_warning: "Resource Limit",
  team_invite: "Team Invite",
  system_update: "System Update",
  cost_alert: "Cost Alert",
};

const typeBadgeColor = {
  project_created: "bg-green-100 text-green-700",
  terraform_plan_success: "bg-green-100 text-green-700",
  terraform_plan_failed: "bg-red-100 text-red-700",
  terraform_apply_success: "bg-green-100 text-green-700",
  terraform_apply_failed: "bg-red-100 text-red-700",
  resource_limit_warning: "bg-amber-100 text-amber-700",
  team_invite: "bg-indigo-100 text-indigo-700",
  system_update: "bg-blue-100 text-blue-700",
  cost_alert: "bg-purple-100 text-purple-700",
};

const actionLabelMap = {
  project_created: "View Project",
  terraform_plan_success: "View Project",
  terraform_plan_failed: "View Logs",
  terraform_apply_success: "View Project",
  terraform_apply_failed: "View Logs",
  resource_limit_warning: "Upgrade Plan",
  team_invite: "View Invitation",
  system_update: "Learn More",
  cost_alert: "View Cost Report",
};

export default function NotificationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notifications, markAsRead, removeNotification } = useNotifications();
  const notification = notifications.find((n) => n.id === id);

  React.useEffect(() => {
    if (notification && !notification.read) {
      markAsRead(notification.id);
    }
  }, [notification, markAsRead]);

  if (!notification) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4">
        <div className="bg-white rounded-lg shadow border p-8 flex flex-col items-center">
          <Info className="w-10 h-10 text-blue-400 mb-4" />
          <h2 className="text-xl font-bold mb-2">Notification not found</h2>
          <p className="text-gray-500 mb-6">The notification you are looking for does not exist.</p>
          <button
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <button
        className="flex items-center text-indigo-600 font-medium mb-6 hover:underline"
        onClick={() => navigate("/notifications")}
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to notifications
      </button>
      <div className="bg-white rounded-lg shadow border p-8">
        <div className="flex items-center gap-4 mb-4">
          <div>{typeIconMap[notification.type]}</div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{notification.title}</h1>
            <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${typeBadgeColor[notification.type]}`}>{typeLabelMap[notification.type]}</span>
          </div>
        </div>
        <div className="text-gray-700 text-base mb-4 whitespace-pre-line">{notification.message}</div>
        <div className="text-sm text-gray-500 mb-2">
          {format(parseISO(notification.createdAt), "MMMM d, yyyy 'at' h:mm a")} (<span>{formatDistanceToNow(parseISO(notification.createdAt), { addSuffix: true })}</span>)
        </div>
        {notification.projectName && (
          <div className="mt-4">
            <div className="text-xs text-gray-400 mb-1">Related Project</div>
            <Link
              to={`/projects/${notification.projectId}`}
              className="text-indigo-600 font-medium hover:underline"
            >
              {notification.projectName}
            </Link>
          </div>
        )}
        {notification.actionUrl && (
          <a
            href={notification.actionUrl}
            className="mt-6 inline-flex items-center px-5 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            {actionLabelMap[notification.type] || "View"}
          </a>
        )}
        <div className="mt-8 flex gap-6 border-t pt-4">
          <button
            className="text-red-500 font-medium hover:underline"
            onClick={() => {
              removeNotification(notification.id);
              navigate("/notifications");
            }}
          >
            Delete this notification
          </button>
          {notification.read && (
            <button
              className="text-gray-500 font-medium hover:underline"
              onClick={() => {
                // Mark as unread logic (not implemented in hook yet)
              }}
              disabled
            >
              Mark as unread
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
