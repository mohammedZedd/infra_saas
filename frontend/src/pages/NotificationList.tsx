import React, { useMemo, useState } from "react";
import { useNotifications } from "../hooks/useNotifications";
import { useNavigate } from "react-router-dom";
import { format, isToday, isYesterday, parseISO, isThisWeek, isThisYear } from "date-fns";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Users,
  Info,
  DollarSign,
} from "lucide-react";

const typeIconMap = {
  project_created: <CheckCircle2 className="text-green-500 w-5 h-5" />,
  terraform_plan_success: <CheckCircle2 className="text-green-500 w-5 h-5" />,
  terraform_plan_failed: <XCircle className="text-red-500 w-5 h-5" />,
  terraform_apply_success: <CheckCircle2 className="text-green-500 w-5 h-5" />,
  terraform_apply_failed: <XCircle className="text-red-500 w-5 h-5" />,
  resource_limit_warning: <AlertTriangle className="text-amber-500 w-5 h-5" />,
  team_invite: <Users className="text-indigo-500 w-5 h-5" />,
  system_update: <Info className="text-blue-500 w-5 h-5" />,
  cost_alert: <DollarSign className="text-purple-500 w-5 h-5" />,
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

const typeFilters = [
  { label: "All", value: "all" },
  { label: "Unread", value: "unread" },
  { label: "Success", value: "success" },
  { label: "Failed", value: "failed" },
  { label: "Warning", value: "warning" },
  { label: "Team", value: "team_invite" },
  { label: "System", value: "system_update" },
  { label: "Cost", value: "cost_alert" },
];

function getGroupLabel(date) {
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  if (isThisWeek(date)) return "Earlier this week";
  if (isThisYear(date)) return format(date, "MMMM d");
  return format(date, "yyyy MMM d");
}

export default function NotificationList() {
  const { notifications, markAllAsRead } = useNotifications();
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    if (filter === "all") return notifications;
    if (filter === "unread") return notifications.filter((n) => !n.read);
    if (filter === "success") return notifications.filter((n) => n.type.includes("success"));
    if (filter === "failed") return notifications.filter((n) => n.type.includes("failed"));
    if (filter === "warning") return notifications.filter((n) => n.type === "resource_limit_warning");
    return notifications.filter((n) => n.type === filter);
  }, [notifications, filter]);

  // Group notifications by date
  const grouped = useMemo(() => {
    const groups = {};
    filtered.forEach((n) => {
      const date = parseISO(n.createdAt);
      const label = getGroupLabel(date);
      if (!groups[label]) groups[label] = [];
      groups[label].push(n);
    });
    return groups;
  }, [filtered]);

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <button
          className="text-indigo-600 font-medium hover:underline"
          onClick={markAllAsRead}
        >
          Mark all as read
        </button>
      </div>
      <div className="flex gap-2 mb-6 flex-wrap">
        {typeFilters.map((f) => (
          <button
            key={f.value}
            className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${filter === f.value ? "bg-indigo-50 border-indigo-600 text-indigo-700" : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"}`}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>
      {Object.keys(grouped).length === 0 ? (
        <div className="text-gray-400 text-center py-16">No notifications found.</div>
      ) : (
        Object.entries(grouped).map(([label, notifs]) => (
          <div key={label} className="mb-8">
            <div className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">{label}</div>
            <div className="bg-white rounded-lg shadow border divide-y">
              {notifs.map((n) => (
                <button
                  key={n.id}
                  className={`flex w-full items-center gap-4 px-6 py-4 text-left transition-colors ${!n.read ? "bg-indigo-50 hover:bg-indigo-100" : "hover:bg-gray-50"}`}
                  onClick={() => navigate(`/notifications/${n.id}`)}
                >
                  <span>{typeIconMap[n.type]}</span>
                  <span className="flex-1 min-w-0">
                    <span className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 truncate">{n.title}</span>
                      {!n.read && <span className="ml-1 h-2 w-2 rounded-full bg-indigo-500 inline-block" />}
                    </span>
                    <span className="block text-gray-500 text-sm line-clamp-2">{n.message}</span>
                  </span>
                  <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${typeBadgeColor[n.type]}`}>{typeLabelMap[n.type]}</span>
                </button>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
