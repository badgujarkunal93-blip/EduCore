import { useEffect, useState } from "react";
import { StudentShell } from "../components/layout/shells";
import { LoadingScreen, StatusBadge } from "../components/ui/kit";
import { publicProfileProjects, heatmapData } from "../lib/showcaseData";
import { useParams } from "react-router-dom";
import dataService from "../services/dataService";

export default function ProfilePage() {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    let mounted = true;
    dataService.getUserProfile(userId).then((user) => {
      if (mounted) {
        setProfile(user || null);
      }
    });
    return () => {
      mounted = false;
    };
  }, [userId]);

  if (!profile) {
    return <LoadingScreen title="Opening public profile..." />;
  }

  return (
    <StudentShell
      navLinks={[
        { to: "/student/dashboard", label: "Dashboard" },
        { to: "/settings", label: "Settings" },
      ]}
    >
      <div className="space-y-8">
        <section className="overflow-hidden rounded-[2rem] border border-white/5 bg-gradient-to-br from-primary/20 via-transparent to-secondary/20">
          <div className="h-44 bg-hero-gradient" />
          <div className="px-8 pb-8">
            <div className="-mt-14 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex items-end gap-5">
                <div className="grid h-28 w-28 place-items-center rounded-full border-4 border-surface bg-gradient-to-br from-primary to-secondary text-3xl font-bold text-white">
                  {profile.name
                    .split(" ")
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <div>
                  <div className="font-headline text-4xl font-bold text-on-surface">{profile.name}</div>
                  <div className="mt-2 text-sm text-on-surface-variant">{profile.institution}</div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(profile.skills || ["React", "Python", "AI"]).map((skill) => (
                      <StatusBadge key={skill} tone="secondary">
                        {skill}
                      </StatusBadge>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" className="ghost-btn">
                  GitHub
                </button>
                <button type="button" className="ghost-btn">
                  LinkedIn
                </button>
              </div>
            </div>
            <p className="mt-6 max-w-3xl text-sm leading-7 text-on-surface-variant">
              Builder focused on shipping collaborative learning systems, clean interfaces, and
              presentation-grade demo flows for technical education.
            </p>
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-4">
          {[
            ["Projects", "12"],
            ["Hackathons", "4"],
            ["Commits", "218"],
            ["Reviews", "37"],
          ].map((stat) => (
            <div key={stat[0]} className="stat-card rounded-[1.75rem]">
              <div className="text-[10px] uppercase tracking-[0.24em] text-on-surface-variant">{stat[0]}</div>
              <div className="mt-4 font-headline text-5xl font-bold text-on-surface">{stat[1]}</div>
            </div>
          ))}
        </div>

        <div className="grid gap-8 xl:grid-cols-2">
          <section className="glass-panel rounded-[2rem] p-6">
            <div className="font-headline text-2xl font-bold text-on-surface">Class Projects</div>
            <div className="mt-6 space-y-4">
              {publicProfileProjects.classProjects.map((project) => (
                <div key={project} className="rounded-2xl border border-white/5 bg-black/20 p-4 text-on-surface">
                  {project}
                </div>
              ))}
            </div>
          </section>
          <section className="glass-panel rounded-[2rem] p-6">
            <div className="font-headline text-2xl font-bold text-on-surface">Hackathon Projects</div>
            <div className="mt-6 space-y-4">
              {publicProfileProjects.hackathonProjects.map((project) => (
                <div key={project} className="rounded-2xl border border-white/5 bg-black/20 p-4 text-on-surface">
                  {project}
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="glass-panel rounded-[2rem] p-6">
          <div className="font-headline text-2xl font-bold text-on-surface">Contribution Heatmap</div>
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
    </StudentShell>
  );
}
