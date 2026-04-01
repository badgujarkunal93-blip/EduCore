import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { TeacherShell } from "../../components/layout/shells";
import { MaterialIcon, ProgressRing, SectionHeading, StatusBadge } from "../../components/ui/kit";
import { analyticsFeed, analyticsStudents } from "../../lib/showcaseData";
import { formatRelativeTime } from "../../lib/utils";
import { teacherPortalLinks } from "../../lib/navigation";
import { useLiveSubscription } from "../../hooks/useLiveSubscription";
import dataService from "../../services/dataService";

export default function TeacherAnalyticsPage() {
  const { subjectId } = useParams();
  const { data: analytics, loading } = useLiveSubscription(
    (callback) => dataService.subscribeTeacherAnalytics(subjectId, callback),
    [subjectId],
    {
      subject: null,
      workspace: null,
      students: [],
      activityFeed: [],
      stats: {
        totalStudents: 0,
        activeToday: 0,
        avgCompletion: 0,
        pendingReviews: 0,
      },
    },
  );

  const hasLiveData = analytics.students.length > 0 || analytics.activityFeed.length > 0;
  const studentCards = useMemo(
    () =>
      hasLiveData
        ? analytics.students.map((student) => ({
            id: student.uid,
            name: student.name,
            progress: student.progress,
            lastActive: formatRelativeTime(student.lastActive),
            activity: student.activity,
            streak:
              student.progress >= 80
                ? "On-track momentum"
                : student.progress >= 40
                  ? "Mid-sprint recovery"
                  : "Needs support",
          }))
        : analyticsStudents,
    [analytics.students, hasLiveData],
  );
  const activityItems = useMemo(
    () =>
      hasLiveData
        ? analytics.activityFeed.map((item) => `${item.actorName} ${item.text}`)
        : analyticsFeed,
    [analytics.activityFeed, hasLiveData],
  );
  const statCards = hasLiveData
    ? [
        { label: "Total Students", value: analytics.stats.totalStudents, accent: "text-on-surface" },
        { label: "Active Today", value: analytics.stats.activeToday, accent: "text-on-surface" },
        { label: "Avg Completion", value: `${analytics.stats.avgCompletion}%`, accent: "text-primary" },
        { label: "Pending Reviews", value: analytics.stats.pendingReviews, accent: "text-secondary-soft" },
      ]
    : [
        { label: "Total Students", value: "42", accent: "text-on-surface" },
        { label: "Active Today", value: "28", accent: "text-on-surface" },
        { label: "Avg Completion", value: "76%", accent: "text-primary" },
        { label: "Pending Reviews", value: "12", accent: "text-secondary-soft" },
      ];

  return (
    <TeacherShell
      title="Analytics"
      subtitle="Teacher cohort overview with live-looking progress telemetry."
      navLinks={teacherPortalLinks}
    >
      <div className="space-y-10">
        <SectionHeading
          eyebrow="Academic Insight"
          title={
            analytics.subject?.name
              ? `${analytics.subject.name} Progress Overview`
              : `Subject ${subjectId ? "Progress Overview" : "Analytics Command"}`
          }
          description={
            hasLiveData
              ? "Track live completion, activity, and review load from the actual workspace roster."
              : "Track student completion, activity, and review load through the Kinetic Observatory analytics layer."
          }
          actions={
            <>
              <button type="button" className="ghost-btn">
                <MaterialIcon name="download" />
                Export PDF
              </button>
              <button type="button" className="ghost-btn">
                <MaterialIcon name="filter_list" />
                Filter
              </button>
            </>
          }
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {statCards.map((stat) => (
            <div key={stat.label} className="stat-card rounded-[1.75rem]">
              <div className="text-[10px] uppercase tracking-[0.24em] text-on-surface-variant">
                {stat.label}
              </div>
              <div className={`mt-4 font-headline text-5xl font-bold ${stat.accent}`}>{stat.value}</div>
            </div>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
          <section className="grid gap-6 lg:grid-cols-3">
            {studentCards.map((student) => (
              <div
                key={student.id}
                className="glass-panel rounded-[2rem] p-6 transition hover:border-primary/20 hover:bg-surface-container"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-headline text-2xl font-bold text-on-surface">
                      {student.name}
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-xs text-on-surface-variant">
                      <span className={`h-2 w-2 rounded-full ${loading ? "bg-warning" : "bg-success"}`} />
                      {student.lastActive}
                    </div>
                  </div>
                  <button type="button" className="text-on-surface-variant">
                    <MaterialIcon name="more_vert" />
                  </button>
                </div>

                <div className="py-6 text-center">
                  <ProgressRing value={student.progress} size={140} strokeWidth={8} />
                </div>

                <div className="flex items-center justify-between">
                  <StatusBadge tone="primary">{student.activity}</StatusBadge>
                  <Link
                    to={`/teacher/student/${student.id}`}
                    className="text-xs uppercase tracking-[0.24em] text-primary"
                  >
                    View Details
                  </Link>
                </div>
                <div className="mt-4 text-sm text-on-surface-variant">{student.streak}</div>
              </div>
            ))}
          </section>

          <aside className="glass-panel rounded-[2rem] p-6">
            <div className="flex items-center justify-between">
              <div className="font-headline text-2xl font-bold text-on-surface">Live Activity</div>
              <StatusBadge tone="danger">LIVE</StatusBadge>
            </div>
            <div className="mt-6 space-y-4">
              {activityItems.map((item) => (
                <div key={item} className="rounded-2xl border border-white/5 bg-black/20 p-4">
                  <div className="flex items-start gap-3">
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
                    <div className="text-sm leading-7 text-on-surface">{item}</div>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </TeacherShell>
  );
}
