import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { getDefaultRouteForRole, workspaceTabs } from "../../lib/navigation";
import { canAccessGroup, cn, formatDateTime, formatRelativeTime } from "../../lib/utils";
import dataService from "../../services/dataService";
import { Avatar, BrandLockup, MaterialIcon, Modal, StatusBadge } from "../ui/kit";

function LinkItem({ to, icon, label, end = false }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => cn("shell-link", isActive && "shell-link-active")}
    >
      <MaterialIcon name={icon} className="text-lg" />
      <span>{label}</span>
    </NavLink>
  );
}

export function TeacherShell({
  title,
  subtitle,
  children,
  actions,
  searchPlaceholder = "Search resources or students...",
  navLinks = [],
}) {
  const { profile, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <aside className="sidebar-shell fixed inset-y-0 left-0 hidden w-72 flex-col lg:flex">
        <div className="p-8">
          <BrandLockup />
        </div>
        <nav className="flex-1 px-4 pb-6">
          <div className="space-y-2">
            {navLinks.map((link) => (
              <LinkItem key={link.to} {...link} />
            ))}
          </div>
        </nav>
        <div className="border-t border-white/5 p-6">
          <div className="glass-panel flex items-center gap-4 rounded-2xl p-4">
            <Avatar user={profile} className="h-12 w-12" />
            <div className="min-w-0">
              <div className="truncate font-headline text-sm font-bold text-on-surface">
                {profile?.name || "Faculty User"}
              </div>
              <div className="truncate text-xs text-on-surface-variant">
                {profile?.institution || "EduCore Portal"}
              </div>
            </div>
          </div>
          <button type="button" className="ghost-btn mt-4 w-full" onClick={logout}>
            <MaterialIcon name="logout" />
            Log Out
          </button>
        </div>
      </aside>

      <div className="lg:ml-72">
        <header className="topbar-shell sticky top-0 z-40 px-6 py-4 lg:px-10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="lg:hidden">
                <BrandLockup compact />
              </div>
              <div className="hidden lg:block">
                <div className="font-headline text-2xl font-bold tracking-tight text-on-surface">
                  {title}
                </div>
                {subtitle ? (
                  <div className="text-sm text-on-surface-variant">{subtitle}</div>
                ) : null}
              </div>
            </div>
            <div className="flex flex-1 flex-wrap items-center justify-end gap-3">
              <div className="relative hidden max-w-md flex-1 md:block">
                <MaterialIcon
                  name="search"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
                />
                <input className="kinetic-input pl-10" placeholder={searchPlaceholder} />
              </div>
              {actions}
              <div className="flex items-center gap-3 rounded-full border border-white/5 bg-black/20 px-3 py-2">
                <Avatar user={profile} className="h-8 w-8" />
                <div className="hidden text-left md:block">
                  <div className="text-sm font-semibold text-on-surface">{profile?.name}</div>
                  <div className="text-[11px] text-on-surface-variant">
                    {profile?.role === "teacher" ? "Teacher" : "Student"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>
        <main className="px-6 py-8 lg:px-10">{children}</main>
      </div>
    </div>
  );
}

export function StudentShell({ children, navLinks = [] }) {
  const { profile, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <header className="topbar-shell sticky top-0 z-40 px-6 py-4">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-8">
            <BrandLockup compact />
            <nav className="hidden items-center gap-6 md:flex">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    cn(
                      "font-headline text-sm font-semibold tracking-tight text-on-surface-variant transition hover:text-on-surface",
                      isActive && "border-b-2 border-primary pb-1 text-primary",
                    )
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <MaterialIcon
                name="search"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
              />
              <input className="kinetic-input w-72 pl-10" placeholder="Search assets..." />
            </div>
            <button type="button" className="ghost-btn hidden md:inline-flex" onClick={logout}>
              <MaterialIcon name="logout" />
              Log Out
            </button>
            <div className="flex items-center gap-3 rounded-full border border-white/5 bg-black/20 px-3 py-2">
              <Avatar user={profile} className="h-8 w-8" />
              <div className="hidden md:block">
                <div className="text-sm font-semibold text-on-surface">{profile?.name}</div>
              </div>
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}

export function WorkspaceShell({
  group,
  currentTab,
  children,
  readOnlyBanner,
  sidebarFooter,
}) {
  const { profile, role } = useAuth();
  const { pushToast } = useToast();
  const [generatingInviteCode, setGeneratingInviteCode] = useState(false);
  const [regeneratingInviteCode, setRegeneratingInviteCode] = useState(false);
  const [isRegenerateConfirmOpen, setIsRegenerateConfirmOpen] = useState(false);
  const canManageInviteCode = group?.type === "hackathon" && profile?.uid === group?.ownerId;
  const recentJoiners = group?.type === "hackathon"
    ? (group.progressEntries || [])
        .filter((entry) => entry.lastActivity?.toLowerCase().includes("joined the team"))
        .map((entry) => ({
          ...entry,
          member: (group.members || []).find((member) => member.uid === entry.studentId),
        }))
        .filter((entry) => entry.member)
        .sort(
          (left, right) =>
            new Date(right.lastActive || 0).getTime() - new Date(left.lastActive || 0).getTime(),
        )
        .slice(0, 3)
    : [];

  const copyInviteCode = async (joinCode) => {
    try {
      await navigator.clipboard.writeText(joinCode);
      pushToast({
        title: "Invite code copied",
        description: `${joinCode} is ready to share with teammates.`,
        tone: "success",
      });
    } catch {
      pushToast({
        title: "Could not copy code",
        description: "Clipboard access was blocked. Please copy the code manually.",
        tone: "error",
      });
    }
  };

  const ensureInviteCode = async () => {
    if (!group?.id) return;

    setGeneratingInviteCode(true);
    try {
      const joinCode = await dataService.ensureHackathonJoinCode({ groupId: group.id });
      await copyInviteCode(joinCode);
    } catch (error) {
      pushToast({
        title: "Could not generate code",
        description: error.message,
        tone: "error",
      });
    } finally {
      setGeneratingInviteCode(false);
    }
  };

  const regenerateInviteCode = async () => {
    if (!group?.id) return;

    setRegeneratingInviteCode(true);
    try {
      const joinCode = await dataService.regenerateHackathonJoinCode({ groupId: group.id });
      try {
        await navigator.clipboard.writeText(joinCode);
      } catch {
        // Fall through to the success toast so the code is still visible in the panel.
      }
      pushToast({
        title: "Invite code refreshed",
        description: "Old codes are replaced and the new code has been copied.",
        tone: "success",
      });
      setIsRegenerateConfirmOpen(false);
    } catch (error) {
      pushToast({
        title: "Could not regenerate code",
        description: error.message,
        tone: "error",
      });
    } finally {
      setRegeneratingInviteCode(false);
    }
  };

  if (!canAccessGroup(group, profile, role)) {
    return (
      <div className="grid min-h-screen place-items-center bg-surface px-6 text-on-surface">
        <div className="glass-panel-strong max-w-xl rounded-[2rem] p-8 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-warning/10 text-warning">
            <MaterialIcon name="lock" className="text-3xl" />
          </div>
          <div className="mt-6 font-headline text-3xl font-bold">Workspace access blocked</div>
          <p className="mt-3 text-sm leading-7 text-on-surface-variant">
            This workspace is only visible to enrolled members, hackathon teammates, or the class
            teacher who owns it.
          </p>
          <div className="mt-6 flex justify-center">
            <Link to={getDefaultRouteForRole(role)} className="primary-btn">
              Return to dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <header className="topbar-shell sticky top-0 z-50 px-6 py-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-8">
            <BrandLockup compact />
            <nav className="hidden items-center gap-6 md:flex">
              {workspaceTabs.map((tab) => (
                <NavLink
                  key={tab.key}
                  to={`/workspace/${group?.id}/${tab.key}`}
                  className={({ isActive }) =>
                    cn(
                      "font-headline text-sm font-bold uppercase tracking-[0.2em] text-on-surface-variant transition hover:text-on-surface",
                      (isActive || currentTab === tab.key) &&
                        "border-b-2 border-primary pb-1 text-primary",
                    )
                  }
                >
                  {tab.label}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <MaterialIcon
                name="search"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
              />
              <input className="kinetic-input w-72 pl-10" placeholder="Search workspace..." />
            </div>
            <div className="flex items-center gap-3 rounded-full border border-white/5 bg-black/20 px-3 py-2">
              <Avatar user={profile} className="h-8 w-8" />
              <div className="hidden md:block">
                <div className="text-sm font-semibold text-on-surface">{profile?.name}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {readOnlyBanner ? (
        <div className="border-b border-warning/20 bg-warning/10 px-6 py-2 text-center text-sm text-warning">
          {readOnlyBanner}
        </div>
      ) : null}

      <div className="flex">
        <aside className="sidebar-shell hidden min-h-[calc(100vh-72px)] w-80 flex-col xl:flex">
          <div className="border-b border-white/5 p-6">
            <StatusBadge tone={group?.type === "class" ? "secondary" : "primary"}>
              {group?.type === "class" ? "Class Group" : "Hackathon Group"}
            </StatusBadge>
            <div className="mt-4 font-headline text-2xl font-bold tracking-tight text-on-surface">
              {group?.name || "Workspace"}
            </div>
            <div className="mt-2 text-sm text-on-surface-variant">
              {group?.subject?.name || group?.description}
            </div>
          </div>
          <div className="scrollbar-subtle flex-1 space-y-8 overflow-y-auto p-6">
            <div>
              <div className="mb-4 flex items-center justify-between">
                <div className="font-label text-[10px] uppercase tracking-[0.28em] text-on-surface-variant">
                  Team Members
                </div>
                <StatusBadge tone="success">
                  {group?.members?.filter((member) => member.online).length || 0} online
                </StatusBadge>
              </div>
              <div className="space-y-3">
                {(group?.members || []).map((member) => (
                  <div
                    key={member.uid}
                    className="glass-panel flex items-center gap-3 rounded-2xl p-3"
                  >
                    <div className="relative">
                      <Avatar user={member} className="h-10 w-10" />
                      <span
                        className={cn(
                          "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-surface",
                          member.online ? "bg-success" : "bg-outline",
                        )}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-on-surface">
                        {member.name}
                      </div>
                      <div className="text-xs text-on-surface-variant">
                        {member.uid === group?.ownerId ? "Owner" : member.role}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-4">
              <div className="font-label text-[10px] uppercase tracking-[0.28em] text-on-surface-variant">
                Next Meeting
              </div>
              {group?.nextMeeting ? (
                <div className="mt-3 space-y-2">
                  <div className="font-headline text-lg font-bold text-on-surface">
                    {group.nextMeeting.title}
                  </div>
                  <div className="text-sm text-on-surface-variant">
                    {formatDateTime(group.nextMeeting.startsAt)}
                  </div>
                  <StatusBadge tone="primary">{group.nextMeeting.platform}</StatusBadge>
                </div>
              ) : (
                <div className="mt-3 text-sm text-on-surface-variant">
                  No meeting scheduled yet.
                </div>
              )}
            </div>

            {group?.type === "hackathon" ? (
              <div className="glass-panel rounded-2xl p-4">
                <div className="font-label text-[10px] uppercase tracking-[0.28em] text-on-surface-variant">
                  Invite Code
                </div>
                {group.joinCode ? (
                  <>
                    <div className="mt-3 font-headline text-2xl font-bold tracking-[0.22em] text-primary">
                      {group.joinCode}
                    </div>
                    <div className="mt-2 text-sm text-on-surface-variant">
                      Share this code so teammates can join from the student dashboard.
                    </div>
                    <div className="mt-4 grid gap-3">
                      <button
                        type="button"
                        className="ghost-btn w-full justify-center"
                        onClick={() => copyInviteCode(group.joinCode)}
                      >
                        <MaterialIcon name="content_copy" />
                        Copy Invite Code
                      </button>
                      {canManageInviteCode ? (
                        <button
                          type="button"
                          className="primary-btn w-full justify-center"
                          onClick={() => setIsRegenerateConfirmOpen(true)}
                          disabled={regeneratingInviteCode}
                        >
                          <MaterialIcon name="autorenew" />
                          {regeneratingInviteCode ? "Regenerating..." : "Regenerate Code"}
                        </button>
                      ) : null}
                    </div>
                  </>
                ) : canManageInviteCode ? (
                  <>
                    <div className="mt-3 text-sm text-on-surface-variant">
                      This older workspace does not have an invite code yet.
                    </div>
                    <button
                      type="button"
                      className="primary-btn mt-4 w-full justify-center"
                      onClick={ensureInviteCode}
                      disabled={generatingInviteCode}
                    >
                      <MaterialIcon name="vpn_key" />
                      {generatingInviteCode ? "Generating..." : "Generate Invite Code"}
                    </button>
                  </>
                ) : (
                  <div className="mt-3 text-sm text-on-surface-variant">
                    Ask the group owner to generate an invite code for this workspace.
                  </div>
                )}
              </div>
            ) : null}

            {recentJoiners.length ? (
              <div className="glass-panel rounded-2xl p-4">
                <div className="font-label text-[10px] uppercase tracking-[0.28em] text-on-surface-variant">
                  Recent Joins
                </div>
                <div className="mt-4 space-y-3">
                  {recentJoiners.map((entry) => (
                    <div key={entry.studentId} className="flex items-center gap-3 rounded-2xl bg-black/20 p-3">
                      <Avatar user={entry.member} className="h-10 w-10" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold text-on-surface">
                          {entry.member.name || entry.member.email || "New teammate"}
                        </div>
                        <div className="text-xs text-on-surface-variant">
                          Joined {formatRelativeTime(entry.lastActive)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {sidebarFooter}
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-6 py-8 xl:px-10">{children}</main>
      </div>

      <Modal
        open={isRegenerateConfirmOpen}
        title="Regenerate Invite Code"
        onClose={() => {
          if (!regeneratingInviteCode) {
            setIsRegenerateConfirmOpen(false);
          }
        }}
      >
        <div className="space-y-5">
          <p className="text-sm leading-7 text-on-surface-variant">
            Regenerating the invite code will replace the current one. Anyone trying to join with
            the old code will need the new code instead.
          </p>
          <div className="rounded-2xl border border-warning/20 bg-warning/10 p-4 text-sm text-warning">
            Only regenerate when you want to invalidate the previous invite code.
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              className="ghost-btn"
              onClick={() => setIsRegenerateConfirmOpen(false)}
              disabled={regeneratingInviteCode}
            >
              Cancel
            </button>
            <button
              type="button"
              className="primary-btn"
              onClick={regenerateInviteCode}
              disabled={regeneratingInviteCode}
            >
              <MaterialIcon name="autorenew" />
              {regeneratingInviteCode ? "Regenerating..." : "Regenerate Code"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
