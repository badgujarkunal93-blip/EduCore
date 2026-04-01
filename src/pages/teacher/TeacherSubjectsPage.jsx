import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { TeacherShell } from "../../components/layout/shells";
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
import { teacherPortalLinks } from "../../lib/navigation";
import { cn, formatRelativeTime } from "../../lib/utils";
import dataService from "../../services/dataService";

const paletteByIndex = [
  "bg-primary/10 text-primary border-primary/20",
  "bg-secondary/10 text-secondary-soft border-secondary/20",
  "bg-tertiary/10 text-tertiary border-tertiary/20",
];

export default function TeacherSubjectsPage() {
  const { profile } = useAuth();
  const { pushToast } = useToast();
  const navigate = useNavigate();
  const { data: subjects = [], loading } = useLiveSubscription(
    (callback) => dataService.subscribeTeacherSubjects(profile.uid, callback),
    [profile.uid],
    [],
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    name: "",
    department: "Computer Science",
    term: "Winter 2026",
  });

  const stats = useMemo(() => {
    const totalStudents = subjects.reduce((sum, subject) => sum + subject.studentCount, 0);
    return [
      { label: "Active Subjects", value: subjects.length || 0 },
      { label: "Students Linked", value: totalStudents || 0 },
      { label: "Live Join Codes", value: subjects.length || 0 },
      { label: "Realtime Workspaces", value: subjects.filter((item) => item.workspaceId).length || 0 },
    ];
  }, [subjects]);

  const createSubject = async (event) => {
    event.preventDefault();
    setCreating(true);

    try {
      await dataService.createSubject({
        teacherId: profile.uid,
        name: form.name,
        department: form.department,
        term: form.term,
      });
      setIsModalOpen(false);
      setForm({
        name: "",
        department: "Computer Science",
        term: "Winter 2026",
      });
      pushToast({
        title: "Subject created",
        description: "Join code and workspace generated successfully.",
        tone: "success",
      });
    } catch (error) {
      pushToast({
        title: "Could not create subject",
        description: error.message,
        tone: "error",
      });
    } finally {
      setCreating(false);
    }
  };

  const copyJoinCode = async (joinCode) => {
    await navigator.clipboard.writeText(joinCode);
    pushToast({
      title: "Join code copied",
      description: `${joinCode} is ready to share with students.`,
      tone: "success",
    });
  };

  return (
    <TeacherShell
      title="My Subjects"
      subtitle="Manage your active curriculum, join codes, and collaborative workspaces."
      navLinks={teacherPortalLinks}
      actions={
        <button type="button" className="primary-btn" onClick={() => setIsModalOpen(true)}>
          <MaterialIcon name="add" />
          Create Subject
        </button>
      }
    >
      <div className="space-y-10">
        <SectionHeading
          eyebrow="Academic Command"
          title="Launch, track, and open subject workspaces."
          description="Each subject automatically generates a join code and a live class workspace so you can move directly from setup to collaboration."
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat, index) => (
            <div key={stat.label} className="stat-card rounded-[1.75rem]">
              <div className="absolute right-5 top-5 text-on-surface-variant/20">
                <MaterialIcon
                  name={["dashboard", "group", "vpn_key", "hub"][index]}
                  className="text-4xl"
                />
              </div>
              <div className="font-headline text-4xl font-bold text-on-surface">{stat.value}</div>
              <div className="mt-2 text-sm text-on-surface-variant">{stat.label}</div>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="glass-panel rounded-[2rem] p-10 text-center text-on-surface-variant">
            Synchronizing subject cards...
          </div>
        ) : subjects.length ? (
          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {subjects.map((subject, index) => (
              <div
                key={subject.id}
                className="glass-panel group flex flex-col rounded-[2rem] p-6 transition hover:border-primary/20 hover:bg-surface-container"
              >
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div
                    className={cn(
                      "grid h-14 w-14 place-items-center rounded-2xl border",
                      paletteByIndex[index % paletteByIndex.length],
                    )}
                  >
                    <MaterialIcon name={["terminal", "database", "cloud"][index % 3]} className="text-2xl" />
                  </div>
                  <StatusBadge tone="neutral">{subject.department}</StatusBadge>
                </div>

                <div>
                  <h3 className="font-headline text-2xl font-bold tracking-tight text-on-surface">
                    {subject.name}
                  </h3>
                  <div className="mt-2 text-sm text-on-surface-variant">{subject.term}</div>
                </div>

                <div className="mt-6 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                    <MaterialIcon name="group" className="text-base" />
                    {subject.studentCount} students
                  </div>
                  <button
                    type="button"
                    onClick={() => copyJoinCode(subject.joinCode)}
                    className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-primary"
                  >
                    {subject.joinCode}
                    <MaterialIcon name="content_copy" className="text-sm" />
                  </button>
                </div>

                <div className="mt-6 rounded-2xl border border-white/5 bg-black/20 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="font-label text-[10px] uppercase tracking-[0.24em] text-on-surface-variant">
                        Last Activity
                      </div>
                      <div className="mt-2 text-sm text-on-surface">
                        {subject.activityLabel}
                      </div>
                    </div>
                    <ProgressRing
                      value={Math.min(100, 28 + subject.studentCount * 6)}
                      size={68}
                      label={`${subject.studentCount}`}
                    />
                  </div>
                  <div className="mt-3 text-xs text-on-surface-variant">
                    Updated {formatRelativeTime(subject.lastActivity)}
                  </div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <Link
                    to={`/teacher/analytics/${subject.id}`}
                    className="ghost-btn justify-center"
                  >
                    View Progress
                  </Link>
                  <button
                    type="button"
                    className="primary-btn justify-center"
                    onClick={() => navigate(`/workspace/${subject.workspaceId}/overview`)}
                  >
                    Open Workspace
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyPanel
            title="Launch your first subject."
            description="Create a subject to generate a live join code and instantly unlock the class workspace shell."
            action={
              <button type="button" className="primary-btn" onClick={() => setIsModalOpen(true)}>
                <MaterialIcon name="add" />
                Create Subject
              </button>
            }
          />
        )}
      </div>

      <Modal open={isModalOpen} title="Create Subject" onClose={() => setIsModalOpen(false)}>
        <form className="space-y-5" onSubmit={createSubject}>
          <div className="space-y-2">
            <label className="font-label text-[10px] uppercase tracking-[0.24em] text-on-surface-variant">
              Subject Name
            </label>
            <input
              className="kinetic-input"
              placeholder="Advanced Algorithms"
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
              required
            />
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label className="font-label text-[10px] uppercase tracking-[0.24em] text-on-surface-variant">
                Department
              </label>
              <input
                className="kinetic-input"
                value={form.department}
                onChange={(event) =>
                  setForm((current) => ({ ...current, department: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <label className="font-label text-[10px] uppercase tracking-[0.24em] text-on-surface-variant">
                Term
              </label>
              <input
                className="kinetic-input"
                value={form.term}
                onChange={(event) =>
                  setForm((current) => ({ ...current, term: event.target.value }))
                }
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" className="ghost-btn" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="primary-btn" disabled={creating}>
              {creating ? "Generating..." : "Create Subject"}
            </button>
          </div>
        </form>
      </Modal>
    </TeacherShell>
  );
}
