export type NotificationType =
  | "project_created"
  | "terraform_plan_success"
  | "terraform_plan_failed"
  | "terraform_apply_success"
  | "terraform_apply_failed"
  | "resource_limit_warning"
  | "team_invite"
  | "system_update"
  | "cost_alert";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string; // ISO string
  projectId?: string;
  projectName?: string;
  actionUrl?: string;
}
