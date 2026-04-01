import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { StudentShell } from "../../components/layout/shells";
import {
  EmptyPanel,
  MaterialIcon,
  Modal,
  ProgressRing,
  SectionHeading,
  StatusBadge,
} from "../../components/ui/kit";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useLiveSubscription } from "../../hooks/useLiveSubscription";
import { getInitials } from "../../lib/utils";
import dataService from "../../services/dataService";

export default function StudentDashboardPage() {
  const { profile } = useAuth();
  const { pushToast } = useToast();
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [isHackathonModalOpen, setIsHackathonModalOpen] = useState(false);
  const [isHackathonJoinModalOpen, setIsHackathonJoinModalOpen] = useState(false);
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [joiningHackathon, setJoiningHackathon] = useState(false);
  const [hackathonJoinCode, setHackathonJoinCode] = useState("");
  const [hackathonForm, setHackathonForm] = useState({
    name: "",
    description: "",
    githubRepo: "",
  });
  const { data, loading } = useLiveSubscription(
    (callback) => dataService.subscribeStudentDashboard(profile.uid, callback),
    [profile.uid],
    {
      profile,
      classGroups: [],
      hackathonGroups: [],
      stats: { tasksDue: 0, streak: 0, meetings: 0, commits: 0 },
    },
  );

  const navLinks = useMemo(
    () => [
      { to: "/student/dashboard", label: "Dashboard" },
      { to: "/settings", label: "Settings" },
    ],
    [],
  );
  const firstName = (data.profile?.name || profile?.name || "Builder").trim().split(/\s+/)[0] || "Builder";

  const joinClass = async (event) => {
    event.preventDefault();
    setJoining(true);

    try {
      await dataService.enrollWithJoinCode({
        studentId: profile.uid,
        joinCode,
      });
      setJoinCode("");
      pushToast({
        title: "Class joined",
        description: "Your new class workspace is now live in My Class Groups.",
        tone: "success",
      });
    } catch (error) {
      pushToast({
        title: "Could not join class",
        description: error.message,
        tone: "error",
      });
    } finally {
      setJoining(false);
    }
  };

  const joinHackathonGroup = async (event) => {
    event.preventDefault();
    setJoiningHackathon(true);

    try {
      const group = await dataService.joinHackathonWithCode({
        studentId: profile.uid,
        joinCode: hackathonJoinCode,
      });
      setHackathonJoinCode("");
      setIsHackathonJoinModalOpen(false);
      pushToast({
        title: "Hackathon team joined",
        description: `${group.name} is now live in My Hackathon Groups.`,
        tone: "success",
      });
    } catch (error) {
      pushToast({
        title: "Could not join team",
        description: error.message,
        tone: "error",
      });
    } finally {
      setJoiningHackathon(false);
    }
  };

  const copyHackathonCode = async (joinCode) => {
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

  const createHackathonGroup = async (event) => {
    event.preventDefault();
    setCreatingGroup(true);

    try {
      await dataService.createHackathonGroup({
        ownerId: profile.uid,
        name: hackathonForm.name,
        description: hackathonForm.description,
        githubRepo: hackathonForm.githubRepo,
      });
      setIsHackathonModalOpen(false);
      setHackathonForm({ name: "", description: "", githubRepo: "" });
      pushToast({
        title: "Hackathon group created",
        description: "Your workspace is ready for chat, tasks, and showcase tabs.",
        tone: "success",
      });
    } catch (error) {
      pushToast({
        title: "Could not create group",
        description: error.message,
        tone: "error",
      });
    } finally {
      setCreatingGroup(false);
    }
  };

  return (
    <StudentShell navLinks={navLinks}>
      <div className="space-y-12">
        <SectionHeading
          eyebrow="Student Dashboard"
          title={`Welcome back, ${firstName}`}
          description={`Today is ${new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}. Your command center keeps class groups and hackathon squads in one cinematic workflow.`}
          actions={
            <>
              <button type="button" className="ghost-btn">
                <MaterialIcon name="download" />
                Report
              </button>
              <button type="button" className="primary-btn">
                Weekly Focus
              </button>
            </>
          }
        />

        {loading ? (
          <div className="glass-panel rounded-[2rem] p-10 text-center text-on-surface-variant">
            Loading your workspace clusters...
          </div>
        ) : (
          <>
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-2 rounded-full bg-secondary" />
                  <h2 className="font-headline text-2xl font-bold text-on-surface">
                    My Class Groups
                  </h2>
                </div>
              </div>

              <div className="grid gap-6 xl:grid-cols-3">
                {data.classGroups.map((group) => (
                  <div key={group.id} className="glass-panel rounded-[2rem] p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <StatusBadge tone="secondary">{group.subject?.department || "Class"}</StatusBadge>
                        <h3 className="mt-4 font-headline text-2xl font-bold text-on-surface">
                          {group.subject?.name || group.name}
                        </h3>
                        <div className="mt-2 text-sm text-on-surface-variant">
                          Teacher: {group.teacher?.name || "Faculty Member"}
                        </div>
                      </div>
                      <ProgressRing value={group.completion || 0} />
                    </div>
                    <div className="mt-8 flex items-center justify-between gap-4">
                      <div className="text-sm text-on-surface-variant">
                        Last activity updated recently
                      </div>
                      <button
                        type="button"
                        className="ghost-btn"
                        onClick={() => navigate(`/workspace/${group.id}/overview`)}
                      >
                        Open Workspace
                      </button>
                    </div>
                  </div>
                ))}

                <form
                  onSubmit={joinClass}
                  className="glass-panel flex min-h-[17rem] flex-col justify-between rounded-[2rem] border-dashed border-outline-variant/30 p-6"
                >
                  <div>
                    <div className="grid h-14 w-14 place-items-center rounded-full bg-surface-container-high">
                      <MaterialIcon name="add_circle" className="text-primary" />
                    </div>
                    <h3 className="mt-6 font-headline text-2xl font-bold text-on-surface">
                      Join new class
                    </h3>
                    <p className="mt-2 text-sm text-on-surface-variant">
                      Paste the 6-digit join code your teacher shared to enroll instantly.
                    </p>
                  </div>
                  <div className="mt-6 flex gap-3">
                    <input
                      className="kinetic-input"
                      value={joinCode}
                      onChange={(event) => setJoinCode(event.target.value)}
                      placeholder="Entry code"
                    />
                    <button type="submit" className="primary-btn px-5" disabled={joining}>
                      {joining ? "Joining..." : "Join"}
                    </button>
                  </div>
                </form>
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                  <div className="h-8 w-2 rounded-full bg-tertiary" />
                  <h2 className="font-headline text-2xl font-bold text-on-surface">
                    My Hackathon Groups
                  </h2>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    className="ghost-btn"
                    onClick={() => setIsHackathonJoinModalOpen(true)}
                  >
                    <MaterialIcon name="group_add" />
                    Join Team
                  </button>
                  <button type="button" className="primary-btn" onClick={() => setIsHackathonModalOpen(true)}>
                    <MaterialIcon name="add" />
                    Create Group
                  </button>
                </div>
              </div>

              {data.hackathonGroups.length ? (
                <div className="grid gap-6 xl:grid-cols-3">
                  {data.hackathonGroups.map((group) => (
                    <div key={group.id} className="glass-panel rounded-[2rem] p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <StatusBadge tone="primary">Hackathon</StatusBadge>
                          <h3 className="mt-4 font-headline text-2xl font-bold text-on-surface">
                            {group.name}
                          </h3>
                          <div className="mt-2 text-sm text-on-surface-variant">
                            {group.githubRepo || "Repo pending"}
                          </div>
                        </div>
                        <StatusBadge tone="success">Connected</StatusBadge>
                      </div>
                      <div className="mt-5 flex items-center justify-between gap-3 rounded-2xl border border-white/5 bg-black/20 p-4">
                        <div>
                          <div className="text-[10px] uppercase tracking-[0.24em] text-on-surface-variant">
                            Invite Code
                          </div>
                          <div className="mt-2 font-headline text-lg font-bold tracking-[0.22em] text-primary">
                            {group.joinCode || "PENDING"}
                          </div>
                        </div>
                        {group.joinCode ? (
                          <button
                            type="button"
                            className="ghost-btn"
                            onClick={() => copyHackathonCode(group.joinCode)}
                          >
                            <MaterialIcon name="content_copy" />
                            Copy
                          </button>
                        ) : (
                          <StatusBadge tone="neutral">Generate from workspace</StatusBadge>
                        )}
                      </div>
                      <div className="mt-6 flex -space-x-2">
                        {group.memberProfiles.slice(0, 4).map((member, index) => (
                          <div
                            key={member.uid || `${group.id}-member-${index}`}
                            className="grid h-10 w-10 place-items-center rounded-full border-2 border-surface bg-surface-container-high text-xs font-bold text-on-surface"
                          >
                            {getInitials(member.name || member.email || "Hackathon Member")}
                          </div>
                        ))}
                      </div>
                      <div className="mt-8 flex items-center justify-between">
                        <div className="text-sm text-on-surface-variant">
                          Last commit synced recently
                        </div>
                        <button
                          type="button"
                          className="ghost-btn"
                          onClick={() => navigate(`/workspace/${group.id}/overview`)}
                        >
                          Open Workspace
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyPanel
                  title="Create your first hackathon squad."
                  description="Spin up a project workspace with shared chat, tasks, and showcase tabs in one step."
                  action={
                    <div className="flex flex-wrap justify-center gap-3">
                      <button type="button" className="ghost-btn" onClick={() => setIsHackathonJoinModalOpen(true)}>
                        <MaterialIcon name="group_add" />
                        Join Team
                      </button>
                      <button type="button" className="primary-btn" onClick={() => setIsHackathonModalOpen(true)}>
                        <MaterialIcon name="add" />
                        Create Group
                      </button>
                    </div>
                  }
                />
              )}
            </section>

            <section className="glass-panel rounded-[2rem] p-6">
              <div className="grid gap-4 md:grid-cols-4">
                {[
                  { label: "Tasks Due", value: data.stats.tasksDue },
                  { label: "Active Streak", value: `${data.stats.streak} days` },
                  { label: "Meetings", value: data.stats.meetings },
                  { label: "Commits", value: data.stats.commits },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/5 bg-black/20 p-4">
                    <div className="text-[10px] uppercase tracking-[0.24em] text-on-surface-variant">
                      {item.label}
                    </div>
                    <div className="mt-3 font-headline text-3xl font-bold text-on-surface">
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>

      <Modal
        open={isHackathonJoinModalOpen}
        title="Join Hackathon Team"
        onClose={() => setIsHackathonJoinModalOpen(false)}
      >
        <form className="space-y-5" onSubmit={joinHackathonGroup}>
          <div className="space-y-2">
            <label className="font-label text-[10px] uppercase tracking-[0.24em] text-on-surface-variant">
              Invite Code
            </label>
            <input
              className="kinetic-input"
              placeholder="Enter the 6-digit code"
              value={hackathonJoinCode}
              onChange={(event) => setHackathonJoinCode(event.target.value)}
              required
            />
          </div>
          <p className="text-sm text-on-surface-variant">
            Ask the hackathon owner for the invite code, then join instantly for chat, tasks,
            files, GitHub, and meetings.
          </p>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              className="ghost-btn"
              onClick={() => setIsHackathonJoinModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="primary-btn" disabled={joiningHackathon}>
              {joiningHackathon ? "Joining..." : "Join Team"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={isHackathonModalOpen}
        title="Create Hackathon Group"
        onClose={() => setIsHackathonModalOpen(false)}
      >
        <form className="space-y-5" onSubmit={createHackathonGroup}>
          <div className="space-y-2">
            <label className="font-label text-[10px] uppercase tracking-[0.24em] text-on-surface-variant">
              Group Name
            </label>
            <input
              className="kinetic-input"
              placeholder="NeuralNav Dashboard"
              value={hackathonForm.name}
              onChange={(event) =>
                setHackathonForm((current) => ({ ...current, name: event.target.value }))
              }
              required
            />
          </div>
          <div className="space-y-2">
            <label className="font-label text-[10px] uppercase tracking-[0.24em] text-on-surface-variant">
              Project Description
            </label>
            <textarea
              className="kinetic-input min-h-28"
              placeholder="Describe the idea, challenge area, and what your team wants to ship."
              value={hackathonForm.description}
              onChange={(event) =>
                setHackathonForm((current) => ({ ...current, description: event.target.value }))
              }
              required
            />
          </div>
          <div className="space-y-2">
            <label className="font-label text-[10px] uppercase tracking-[0.24em] text-on-surface-variant">
              GitHub Repo
            </label>
            <input
              className="kinetic-input"
              placeholder="edu-core/neuralnav-dashboard"
              value={hackathonForm.githubRepo}
              onChange={(event) =>
                setHackathonForm((current) => ({ ...current, githubRepo: event.target.value }))
              }
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" className="ghost-btn" onClick={() => setIsHackathonModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="primary-btn" disabled={creatingGroup}>
              {creatingGroup ? "Creating..." : "Create Group"}
            </button>
          </div>
        </form>
      </Modal>
    </StudentShell>
  );
}
