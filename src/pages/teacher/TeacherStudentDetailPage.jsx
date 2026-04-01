import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { TeacherShell } from "../../components/layout/shells";
import { MaterialIcon, StatusBadge } from "../../components/ui/kit";
import { heatmapData, versions } from "../../lib/showcaseData";
import { teacherPortalLinks } from "../../lib/navigation";
import dataService from "../../services/dataService";

export default function TeacherStudentDetailPage() {
  const { studentId } = useParams();
  const [student, setStudent] = useState(null);

  useEffect(() => {
    let mounted = true;

    dataService.getUserProfile(studentId).then((profile) => {
      if (mounted) {
        setStudent(profile || null);
      }
    });

    return () => {
      mounted = false;
    };
  }, [studentId]);

  const studentName = student?.name || "Alex Chen";
  const studentEmail = student?.email || "alex.chen@educore.edu";
  const studentInstitution = student?.institution || "Alpha Quant";
  const studentInitials = studentName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

  return (
    <TeacherShell
      title="Student Detail"
      subtitle="Version-aware student review panel."
      navLinks={teacherPortalLinks}
    >
      <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="space-y-8">
          <div className="glass-panel rounded-[2rem] border-l-4 border-l-primary p-6">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-5">
                <div className="grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary text-2xl font-bold text-white">
                  {studentInitials}
                </div>
                <div>
                  <div className="font-headline text-4xl font-bold text-on-surface">
                    {studentName}
                  </div>
                  <div className="mt-2 text-sm text-on-surface-variant">
                    {studentEmail} {"•"} {studentInstitution}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <StatusBadge tone="secondary">{studentId}</StatusBadge>
                    <StatusBadge tone="neutral">Joined Sep 2024</StatusBadge>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" className="ghost-btn px-3 py-3">
                  <MaterialIcon name="edit" />
                </button>
                <button type="button" className="ghost-btn px-3 py-3">
                  <MaterialIcon name="share" />
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <section className="glass-panel rounded-[2rem] p-6">
              <div className="font-headline text-2xl font-bold text-on-surface">Task Timeline</div>
              <div className="mt-6 space-y-6">
                {[
                  ["Neural Network Optimization", "Done", "primary"],
                  ["Backend API Integration", "In Progress", "secondary"],
                  ["Weekly Lab Reflection #12", "Overdue", "danger"],
                ].map(([title, state, tone], index) => (
                  <div key={title} className="relative pl-10">
                    <div
                      className={`absolute left-0 top-1 h-4 w-4 rounded-full ${
                        index === 2 ? "bg-error" : index === 1 ? "bg-secondary" : "bg-primary"
                      }`}
                    />
                    <div className="rounded-2xl border border-white/5 bg-black/20 p-4">
                      <div className="font-semibold text-on-surface">{title}</div>
                      <div className="mt-3">
                        <StatusBadge tone={tone}>{state}</StatusBadge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="glass-panel rounded-[2rem] p-6">
              <div className="font-headline text-2xl font-bold text-on-surface">
                Development Activity
              </div>
              <div className="mt-6 grid grid-cols-14 gap-1">
                {heatmapData.map((value, index) => (
                  <div
                    key={`${value}-${index}`}
                    className={`h-4 rounded-sm ${
                      value === 0
                        ? "bg-surface-container-highest"
                        : value === 1
                          ? "bg-primary/15"
                          : value === 2
                            ? "bg-primary/35"
                            : value === 3
                              ? "bg-primary/60"
                              : "bg-primary"
                    }`}
                  />
                ))}
              </div>
            </section>
          </div>

          <section className="glass-panel overflow-hidden rounded-[2rem]">
            <div className="border-b border-white/5 px-6 py-5">
              <div className="font-headline text-2xl font-bold text-on-surface">
                Meeting Attendance
              </div>
            </div>
            <table className="w-full">
              <thead className="bg-black/20 text-left text-[10px] uppercase tracking-[0.24em] text-on-surface-variant">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Session Name</th>
                  <th className="px-6 py-4 text-center">Attended</th>
                  <th className="px-6 py-4">Notes</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Oct 24, 2024", "Q4 Strategy Review", "check_circle", "Active contributor in breakout sessions"],
                  ["Oct 21, 2024", "Sprint Planning: Alpha", "check_circle", "-"],
                  ["Oct 18, 2024", "Architecture Critique", "cancel", "Missed due to lab review"],
                  ["Oct 15, 2024", "Repo Readiness Check", "check_circle", "Presented AVL patch"],
                ].map((row) => (
                  <tr key={row[0]} className="border-t border-white/5">
                    <td className="px-6 py-4 text-sm text-on-surface">{row[0]}</td>
                    <td className="px-6 py-4 text-sm text-on-surface">{row[1]}</td>
                    <td className="px-6 py-4 text-center">
                      <MaterialIcon
                        name={row[2]}
                        className={row[2] === "check_circle" ? "text-success" : "text-error"}
                      />
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </section>

        <aside className="space-y-8">
          <section className="glass-panel rounded-[2rem] p-6">
            <div className="font-headline text-2xl font-bold text-on-surface">Version History</div>
            <div className="mt-6 space-y-4">
              {versions.map((version) => (
                <div key={version.id} className="rounded-2xl border border-white/5 bg-black/20 p-4">
                  <div className="font-headline text-lg font-bold text-on-surface">
                    {version.label}
                  </div>
                  <div className="mt-2 text-sm text-on-surface-variant">{version.note}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="glass-panel rounded-[2rem] p-6">
            <div className="font-headline text-2xl font-bold text-on-surface">Teacher Notes</div>
            <textarea
              className="kinetic-input mt-4 min-h-48"
              defaultValue="Alex has strong implementation velocity. Encourage more commit annotation before final handoff."
            />
          </section>
        </aside>
      </div>
    </TeacherShell>
  );
}
