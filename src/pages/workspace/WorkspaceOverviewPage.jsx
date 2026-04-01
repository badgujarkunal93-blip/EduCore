import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { WorkspaceShell } from "../../components/layout/shells";
import {
  Avatar,
  MaterialIcon,
  Modal,
  ProgressRing,
  SectionHeading,
  StatusBadge,
} from "../../components/ui/kit";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useWorkspaceGroup } from "../../hooks/useWorkspaceGroup";
import { LoadingScreen } from "../../components/ui/kit";
import { formatDateTime, formatRelativeTime } from "../../lib/utils";
import dataService from "../../services/dataService";

const milestones = [
  "Concept lock",
  "Core build",
  "Review loop",
  "Demo polish",
];

const activityIcons = {
  task_done: "task_alt",
  task_create: "add_task",
  task_update: "swap_horiz",
  file_upload: "upload_file",
  commit: "terminal",
  member_join: "person_add",
  announcement: "campaign",
  message: "forum",
};

export default function WorkspaceOverviewPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { profile, role } = useAuth();
  const { pushToast } = useToast();
  const { data: group, loading } = useWorkspaceGroup(groupId);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [announcementDraft, setAnnouncementDraft] = useState("");
  const [saving, setSaving] = useState(false);

  const canEditAnnouncement = useMemo(() => {
    if (!group || !profile) return false;
    return (role === "teacher" && group.type === "class") || group.ownerId === profile.uid;
  }, [group, profile, role]);
  const studentProgressCards = useMemo(() => {
    if (!group) return [];

    return group.members
      .filter((member) => member.role === "student")
      .map((member) => {
        const progressEntry = group.progressEntries.find(
          (entry) => entry.studentId === member.uid,
        );
        const recentActivity = group.activityFeed.find((entry) => entry.actorId === member.uid);
        const completion = progressEntry?.tasksTotal
          ? Math.round((progressEntry.tasksDone / progressEntry.tasksTotal) * 100)
          : 0;

        return {
          ...member,
          completion,
          lastActive: progressEntry?.lastActive || recentActivity?.timestamp || group.updatedAt,
          activity:
            progressEntry?.lastActivity ||
            recentActivity?.text ||
            "No tracked activity yet",
        };
      });
  }, [group]);

  if (loading && !group) {
    return <LoadingScreen title="Opening workspace..." />;
  }

  if (!group) {
    return <LoadingScreen title="Workspace unavailable" />;
  }

  const saveAnnouncement = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      await dataService.updateAnnouncement({
        groupId: group.id,
        text: announcementDraft,
        actorId: profile.uid,
      });
      setIsAnnouncementModalOpen(false);
      pushToast({
        title: "Announcement updated",
        description: "Pinned message refreshed for the whole group.",
        tone: "success",
      });
    } catch (error) {
      pushToast({
        title: "Could not update announcement",
        description: error.message,
        tone: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <WorkspaceShell
        group={group}
        currentTab="overview"
        sidebarFooter={
          <div className="glass-panel rounded-2xl p-4">
            <div className="font-label text-[10px] uppercase tracking-[0.24em] text-on-surface-variant">
              Repo Status
            </div>
            <div className="mt-3 text-sm text-on-surface">
              {group.githubRepo || "No repository connected yet."}
            </div>
          </div>
        }
      >
        <div className="space-y-8">
          <SectionHeading
            eyebrow={group.type === "class" ? "Class Workspace" : "Hackathon Workspace"}
            title={group.name}
            description={group.description}
          />

          <div className="grid gap-6 2xl:grid-cols-[1fr_320px]">
            <div className="space-y-6">
              <section className="glass-panel rounded-[2rem] border-primary/20 bg-gradient-to-br from-primary/10 via-transparent to-transparent p-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="section-chip">
                      <MaterialIcon name="campaign" className="text-base" />
                      Pinned Announcement
                    </div>
                    <h2 className="mt-6 font-headline text-3xl font-bold tracking-tight text-on-surface">
                      {group.subject?.name || group.name}
                    </h2>
                    <p className="mt-4 max-w-2xl text-sm leading-7 text-on-surface-variant">
                      {group.announcement}
                    </p>
                  </div>
                  {canEditAnnouncement ? (
                    <button
                      type="button"
                      className="ghost-btn"
                      onClick={() => {
                        setAnnouncementDraft(group.announcement || "");
                        setIsAnnouncementModalOpen(true);
                      }}
                    >
                      <MaterialIcon name="edit" />
                      Edit
                    </button>
                  ) : null}
                </div>
              </section>

              <section className="grid gap-4 md:grid-cols-3">
                {[
                  {
                    label: "New Task",
                    icon: "add_task",
                    tone: "secondary-btn",
                    action: () => navigate(`/workspace/${group.id}/tasks`),
                  },
                  {
                    label: "Upload File",
                    icon: "upload_file",
                    tone: "ghost-btn",
                    action: () => navigate(`/workspace/${group.id}/files`),
                  },
                  {
                    label: "Schedule Meeting",
                    icon: "event_available",
                    tone: "ghost-btn",
                    action: () => navigate(`/workspace/${group.id}/meetings`),
                  },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={item.action}
                    className={`${item.tone} min-h-32 flex-col justify-center gap-3 rounded-[1.75rem]`}
                  >
                    <MaterialIcon name={item.icon} className="text-3xl" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </section>

              {studentProgressCards.length ? (
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="font-headline text-2xl font-bold text-on-surface">
                      Student Pulse
                    </div>
                    <StatusBadge tone="primary">
                      {studentProgressCards.length} tracked
                    </StatusBadge>
                  </div>
                  <div className="grid gap-4 xl:grid-cols-2">
                    {studentProgressCards.map((student) => (
                      <div
                        key={student.uid}
                        className="glass-panel rounded-[1.75rem] border-white/10 p-5"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex min-w-0 items-center gap-4">
                            <Avatar user={student} className="h-12 w-12" />
                            <div className="min-w-0">
                              {role === "teacher" && group.type === "class" ? (
                                <Link
                                  to={`/teacher/student/${student.uid}`}
                                  className="truncate font-headline text-xl font-bold text-on-surface transition hover:text-primary"
                                >
                                  {student.name}
                                </Link>
                              ) : (
                                <div className="truncate font-headline text-xl font-bold text-on-surface">
                                  {student.name}
                                </div>
                              )}
                              <div className="mt-1 text-xs text-on-surface-variant">
                                Updated {formatRelativeTime(student.lastActive)}
                              </div>
                            </div>
                          </div>
                          <ProgressRing value={student.completion} size={82} />
                        </div>
                        <div className="mt-5 flex items-center justify-between gap-3">
                          <StatusBadge
                            tone={student.completion >= 80 ? "success" : student.completion >= 40 ? "warning" : "danger"}
                          >
                            {student.completion}% complete
                          </StatusBadge>
                          <div className="text-xs uppercase tracking-[0.24em] text-on-surface-variant">
                            Live
                          </div>
                        </div>
                        <div className="mt-4 rounded-2xl border border-white/5 bg-black/20 p-4 text-sm text-on-surface-variant">
                          {student.activity}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}

              <section className="glass-panel rounded-[2rem] p-6">
                <div className="mb-6 flex items-center justify-between">
                  <div className="font-headline text-2xl font-bold text-on-surface">
                    Recent Activity
                  </div>
                  <StatusBadge tone="primary">Live Feed</StatusBadge>
                </div>
                <div className="space-y-3">
                  {(group.activityFeed || []).map((activity) => (
                    <div
                      key={activity.id}
                      className="rounded-2xl border border-white/5 bg-black/20 p-4"
                    >
                      <div className="flex items-start gap-4">
                        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-surface-container-high">
                          <MaterialIcon
                            name={activityIcons[activity.type] || "bolt"}
                            className="text-primary"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm text-on-surface">
                            <span className="font-bold">{activity.actorName}</span> {activity.text}
                          </div>
                          <div className="mt-2 text-xs text-on-surface-variant">
                            {formatRelativeTime(activity.timestamp)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <section className="glass-panel rounded-[2rem] p-6 text-center">
                <div className="font-label text-[10px] uppercase tracking-[0.24em] text-on-surface-variant">
                  Overall Progress
                </div>
                <div className="mt-6">
                  <ProgressRing value={group.progressSummary.percentage} size={160} strokeWidth={10} />
                </div>
                <div className="mt-4 text-sm text-on-surface-variant">
                  {group.progressSummary.done} of {group.progressSummary.total} tasks complete
                </div>
              </section>

              <section className="glass-panel rounded-[2rem] p-6">
                <div className="font-headline text-xl font-bold text-on-surface">Milestone Stepper</div>
                <div className="mt-6 space-y-4">
                  {milestones.map((label, index) => (
                    <div key={label} className="flex items-center gap-4">
                      <div
                        className={`grid h-10 w-10 place-items-center rounded-full ${
                          index <= 1 ? "bg-primary/15 text-primary" : "bg-surface-container-high text-on-surface-variant"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div className="text-sm text-on-surface">{label}</div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="glass-panel rounded-[2rem] p-6">
                <div className="font-headline text-xl font-bold text-on-surface">Next Meeting</div>
                {group.nextMeeting ? (
                  <div className="mt-4 space-y-2">
                    <div className="text-lg font-semibold text-on-surface">
                      {group.nextMeeting.title}
                    </div>
                    <div className="text-sm text-on-surface-variant">
                      {formatDateTime(group.nextMeeting.startsAt)}
                    </div>
                    <StatusBadge tone="primary">{group.nextMeeting.platform}</StatusBadge>
                  </div>
                ) : (
                  <div className="mt-4 text-sm text-on-surface-variant">
                    No meeting scheduled yet. Use the Meetings tab to create one.
                  </div>
                )}
              </section>

              <section className="glass-panel rounded-[2rem] p-6">
                <div className="font-headline text-xl font-bold text-on-surface">GitHub Repo</div>
                <div className="mt-4 text-sm text-on-surface-variant">
                  {group.githubRepo ? "Connected repository" : "No repository connected yet."}
                </div>
                <div className="mt-4 rounded-2xl border border-white/5 bg-black/20 p-4 font-mono text-sm text-on-surface">
                  {group.githubRepo || "Connect a repo from the GitHub tab"}
                </div>
              </section>
            </div>
          </div>
        </div>
      </WorkspaceShell>

      <Modal
        open={isAnnouncementModalOpen}
        title="Update Announcement"
        onClose={() => setIsAnnouncementModalOpen(false)}
      >
        <form className="space-y-5" onSubmit={saveAnnouncement}>
          <textarea
            className="kinetic-input min-h-32"
            value={announcementDraft}
            onChange={(event) => setAnnouncementDraft(event.target.value)}
          />
          <div className="flex justify-end gap-3">
            <button type="button" className="ghost-btn" onClick={() => setIsAnnouncementModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="primary-btn" disabled={saving}>
              {saving ? "Saving..." : "Save Announcement"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
