import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { WorkspaceShell } from "../../components/layout/shells";
import { LoadingScreen, MaterialIcon, Modal, StatusBadge } from "../../components/ui/kit";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useWorkspaceGroup } from "../../hooks/useWorkspaceGroup";
import { formatDateTime, parseDate } from "../../lib/utils";
import { meetingsHistory, meetingsUpcoming } from "../../lib/showcaseData";
import dataService from "../../services/dataService";

function toDateTimeLocalValue(value) {
  const baseDate = parseDate(value) || new Date(Date.now() + 60 * 60 * 1000);
  const timezoneOffset = baseDate.getTimezoneOffset() * 60000;
  return new Date(baseDate.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

export default function WorkspaceMeetingsPage() {
  const { groupId } = useParams();
  const { profile, role } = useAuth();
  const { pushToast } = useToast();
  const { data: group, loading } = useWorkspaceGroup(groupId);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    startsAt: toDateTimeLocalValue(),
    link: "#",
    platform: "Google Meet",
  });

  const canSchedule = useMemo(() => {
    if (!group || !profile) return false;
    return (role === "teacher" && group.type === "class") || group.ownerId === profile.uid;
  }, [group, profile, role]);

  if (loading && !group) {
    return <LoadingScreen title="Loading meetings tab..." />;
  }

  if (!group) {
    return <LoadingScreen title="Meetings tab unavailable" />;
  }

  const openScheduleModal = () => {
    setForm({
      title: group.nextMeeting?.title || `${group.name} Sync`,
      startsAt: toDateTimeLocalValue(group.nextMeeting?.startsAt),
      link: group.nextMeeting?.link || "#",
      platform: group.nextMeeting?.platform || "Google Meet",
    });
    setIsModalOpen(true);
  };

  const scheduleMeeting = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      await dataService.scheduleMeeting({
        groupId: group.id,
        title: form.title,
        startsAt: new Date(form.startsAt).toISOString(),
        link: form.link,
        platform: form.platform,
      });
      setIsModalOpen(false);
      pushToast({
        title: "Meeting scheduled",
        description: "The overview tab and meetings panel updated instantly.",
        tone: "success",
      });
    } catch (error) {
      pushToast({
        title: "Could not schedule meeting",
        description: error.message,
        tone: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <WorkspaceShell group={group} currentTab="meetings">
        <div className="space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="section-chip">Meetings</div>
              <h1 className="mt-4 font-headline text-4xl font-bold tracking-tight text-on-surface">
                Team syncs and attendance history
              </h1>
            </div>
            <button
              type="button"
              className={canSchedule ? "secondary-btn" : "ghost-btn"}
              onClick={openScheduleModal}
              disabled={!canSchedule}
            >
              <MaterialIcon name="add" />
              Schedule a Meeting
            </button>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
            <section className="space-y-6">
              <div className="glass-panel rounded-[2rem] p-6">
                <div className="mb-6 flex items-center justify-between">
                  <div className="font-headline text-2xl font-bold text-on-surface">Weekly Pulse</div>
                  <div className="flex gap-2">
                    <button type="button" className="ghost-btn px-3 py-2">
                      <MaterialIcon name="chevron_left" />
                    </button>
                    <button type="button" className="ghost-btn px-3 py-2">
                      <MaterialIcon name="chevron_right" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-3">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => (
                    <div key={day} className="text-center">
                      <div
                        className={`text-[10px] uppercase tracking-[0.24em] ${
                          index === 2 ? "text-primary" : "text-on-surface-variant"
                        }`}
                      >
                        {day}
                      </div>
                      <div
                        className={`mt-3 rounded-2xl border p-4 ${
                          index === 2
                            ? "border-primary bg-primary/10 shadow-cyan"
                            : "border-white/5 bg-black/20"
                        }`}
                      >
                        <div
                          className={`font-headline text-xl font-bold ${
                            index === 2 ? "text-primary" : "text-on-surface"
                          }`}
                        >
                          {12 + index}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {group.nextMeeting ? (
                <div className="glass-panel rounded-[2rem] border-l-4 border-l-primary p-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="section-chip">Scheduled In Workspace</div>
                      <div className="mt-4 font-headline text-2xl font-bold text-on-surface">
                        {group.nextMeeting.title}
                      </div>
                      <div className="mt-2 text-sm text-on-surface-variant">
                        {formatDateTime(group.nextMeeting.startsAt)}
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <StatusBadge tone="primary">{group.nextMeeting.platform}</StatusBadge>
                        <StatusBadge tone="neutral">{group.nextMeeting.link || "Link pending"}</StatusBadge>
                      </div>
                    </div>
                    {canSchedule ? (
                      <button type="button" className="ghost-btn" onClick={openScheduleModal}>
                        Edit Schedule
                      </button>
                    ) : null}
                  </div>
                </div>
              ) : null}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="font-headline text-2xl font-bold text-on-surface">Upcoming Syncs</div>
                  <StatusBadge tone="primary">
                    {meetingsUpcoming.length + (group.nextMeeting ? 1 : 0)} queued
                  </StatusBadge>
                </div>
                {meetingsUpcoming.map((meeting, index) => (
                  <div key={meeting.id} className="glass-panel rounded-[2rem] p-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div
                            className={`font-headline text-3xl font-black ${
                              index === 0 ? "text-primary" : "text-on-surface-variant"
                            }`}
                          >
                            {meeting.time}
                          </div>
                          <div className="text-[10px] uppercase tracking-[0.24em] text-on-surface-variant">
                            {meeting.duration}
                          </div>
                        </div>
                        <div>
                          <div className="font-headline text-2xl font-bold text-on-surface">
                            {meeting.title}
                          </div>
                          <div className="mt-2 text-sm text-on-surface-variant">
                            {meeting.lead} {"•"} {meeting.platform}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        {index === 0 ? (
                          <button type="button" className="primary-btn">
                            Join Meeting
                          </button>
                        ) : (
                          <button type="button" className="ghost-btn">
                            View Link
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <div className="font-headline text-2xl font-bold text-on-surface">Historical Logs</div>
                {meetingsHistory.map((meeting) => (
                  <div key={meeting.id} className="glass-panel rounded-[2rem] p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-headline text-xl font-bold text-on-surface">
                          {meeting.title}
                        </div>
                        <div className="mt-2 text-sm text-on-surface-variant">{meeting.date}</div>
                      </div>
                      <StatusBadge tone="neutral">Expanded</StatusBadge>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-3">
                      {meeting.attendance.map((member) => (
                        <div
                          key={member.name}
                          className="rounded-full border border-white/5 bg-black/20 px-3 py-2 text-sm"
                        >
                          {member.name} {member.present ? "OK" : "Missed"}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-6">
              <div className="glass-panel rounded-[2rem] p-6 text-center">
                <div className="font-label text-[10px] uppercase tracking-[0.24em] text-on-surface-variant">
                  Completion Rate
                </div>
                <div className="mt-4 font-headline text-6xl font-bold text-primary">94%</div>
              </div>

              <div className="glass-panel rounded-[2rem] p-6">
                <div className="font-headline text-xl font-bold text-on-surface">Meeting Assets</div>
                <div className="mt-4 space-y-3">
                  {["Sprint Deck.pdf", "Research Notes.docx"].map((asset) => (
                    <div
                      key={asset}
                      className="rounded-2xl border border-white/5 bg-black/20 p-4 text-sm text-on-surface"
                    >
                      {asset}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>
      </WorkspaceShell>

      <Modal open={isModalOpen} title="Schedule Meeting" onClose={() => setIsModalOpen(false)}>
        <form className="space-y-5" onSubmit={scheduleMeeting}>
          <div className="space-y-2">
            <label className="font-label text-[10px] uppercase tracking-[0.24em] text-on-surface-variant">
              Meeting Title
            </label>
            <input
              className="kinetic-input"
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              required
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label className="font-label text-[10px] uppercase tracking-[0.24em] text-on-surface-variant">
                Start Time
              </label>
              <input
                type="datetime-local"
                className="kinetic-input"
                value={form.startsAt}
                onChange={(event) => setForm((current) => ({ ...current, startsAt: event.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="font-label text-[10px] uppercase tracking-[0.24em] text-on-surface-variant">
                Platform
              </label>
              <select
                className="kinetic-input"
                value={form.platform}
                onChange={(event) => setForm((current) => ({ ...current, platform: event.target.value }))}
              >
                <option>Google Meet</option>
                <option>Zoom</option>
                <option>Microsoft Teams</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-label text-[10px] uppercase tracking-[0.24em] text-on-surface-variant">
              Meeting Link
            </label>
            <input
              className="kinetic-input"
              value={form.link}
              onChange={(event) => setForm((current) => ({ ...current, link: event.target.value }))}
              placeholder="https://meet.google.com/..."
            />
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" className="ghost-btn" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="primary-btn" disabled={saving}>
              {saving ? "Scheduling..." : "Save Meeting"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
