export function getDefaultRouteForRole(role) {
  return role === "teacher" ? "/teacher/subjects" : "/student/dashboard";
}

export const teacherPortalLinks = [
  { to: "/teacher/subjects", label: "My Subjects", icon: "auto_stories" },
  { to: "/settings", label: "Settings", icon: "settings" },
];

export const studentPortalLinks = [
  { to: "/student/dashboard", label: "Dashboard", icon: "dashboard" },
  { to: "/settings", label: "Settings", icon: "settings" },
];

export const workspaceTabs = [
  { key: "overview", label: "Overview", icon: "dashboard" },
  { key: "chat", label: "Chat", icon: "forum" },
  { key: "tasks", label: "Tasks", icon: "assignment" },
  { key: "files", label: "Files", icon: "folder" },
  { key: "github", label: "GitHub", icon: "terminal" },
  { key: "meetings", label: "Meetings", icon: "video_call" },
];

export const settingsSections = [
  { key: "profile", label: "Profile", icon: "person" },
  { key: "account", label: "Account", icon: "manage_accounts" },
  { key: "notifications", label: "Notifications", icon: "notifications_active" },
  { key: "appearance", label: "Appearance", icon: "palette" },
  { key: "integrations", label: "Integrations", icon: "hub" },
  { key: "privacy", label: "Privacy", icon: "security" },
];
