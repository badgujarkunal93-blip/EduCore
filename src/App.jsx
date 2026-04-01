import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import { ProtectedRoute, PublicOnlyRoute } from "./components/layout/route-guards";
import { ToastViewport } from "./components/ui/kit";
import { getDefaultRouteForRole } from "./lib/navigation";
import AuthPage from "./pages/AuthPage";
import LandingPage from "./pages/LandingPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import StudentDashboardPage from "./pages/student/StudentDashboardPage";
import TeacherAnalyticsPage from "./pages/teacher/TeacherAnalyticsPage";
import TeacherStudentDetailPage from "./pages/teacher/TeacherStudentDetailPage";
import TeacherSubjectsPage from "./pages/teacher/TeacherSubjectsPage";
import WorkspaceChatPage from "./pages/workspace/WorkspaceChatPage";
import WorkspaceFilesPage from "./pages/workspace/WorkspaceFilesPage";
import WorkspaceGithubPage from "./pages/workspace/WorkspaceGithubPage";
import WorkspaceMeetingsPage from "./pages/workspace/WorkspaceMeetingsPage";
import WorkspaceOverviewPage from "./pages/workspace/WorkspaceOverviewPage";
import WorkspaceTasksPage from "./pages/workspace/WorkspaceTasksPage";

function NotFoundPage() {
  const { isAuthenticated, role } = useAuth();

  return (
    <div className="grid min-h-screen place-items-center bg-background px-6">
      <div className="glass-panel rounded-[2rem] p-10 text-center">
        <div className="font-headline text-4xl font-bold text-on-surface">404</div>
        <div className="mt-3 text-sm text-on-surface-variant">
          That route doesn&apos;t exist in the current EduCore map.
        </div>
        <div className="mt-6">
          <Navigate to={isAuthenticated ? getDefaultRouteForRole(role) : "/"} replace />
        </div>
      </div>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route element={<PublicOnlyRoute />}>
        <Route path="/auth" element={<AuthPage />} />
      </Route>

      <Route element={<ProtectedRoute roles={["teacher"]} />}>
        <Route path="/teacher/subjects" element={<TeacherSubjectsPage />} />
        <Route path="/teacher/analytics/:subjectId" element={<TeacherAnalyticsPage />} />
        <Route path="/teacher/student/:studentId" element={<TeacherStudentDetailPage />} />
      </Route>

      <Route element={<ProtectedRoute roles={["student"]} />}>
        <Route path="/student/dashboard" element={<StudentDashboardPage />} />
        <Route path="/profile/:userId" element={<ProfilePage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/workspace/:groupId/overview" element={<WorkspaceOverviewPage />} />
        <Route path="/workspace/:groupId/chat" element={<WorkspaceChatPage />} />
        <Route path="/workspace/:groupId/tasks" element={<WorkspaceTasksPage />} />
        <Route path="/workspace/:groupId/files" element={<WorkspaceFilesPage />} />
        <Route path="/workspace/:groupId/github" element={<WorkspaceGithubPage />} />
        <Route path="/workspace/:groupId/meetings" element={<WorkspaceMeetingsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <AppRoutes />
          <ToastViewport />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
