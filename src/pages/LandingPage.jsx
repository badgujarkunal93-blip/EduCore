import { Link } from "react-router-dom";
import { BrandLockup, MaterialIcon, StatusBadge } from "../components/ui/kit";

const features = [
  {
    icon: "query_stats",
    title: "Live progress tracking",
    description:
      "Real-time telemetry of every assignment, giving teachers and students a shared command view.",
  },
  {
    icon: "hub",
    title: "Workspace-style groups",
    description:
      "Shared technical environments for class teams and hackathon squads with one visual operating system.",
  },
  {
    icon: "rocket_launch",
    title: "Hackathon team builder",
    description:
      "Fast launchpads for project squads, repo tracking, task boards, and demo-ready storytelling.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-background text-on-surface">
      <nav className="topbar-shell fixed inset-x-0 top-0 z-50 px-6 py-4 lg:px-10">
        <div className="flex items-center justify-between">
          <BrandLockup compact subtitle="Cinematic Learning Observatory" />
          <div className="hidden items-center gap-8 md:flex">
            <a className="font-headline text-sm text-on-surface-variant transition hover:text-on-surface">
              Solutions
            </a>
            <a className="font-headline text-sm text-on-surface-variant transition hover:text-on-surface">
              Curriculum
            </a>
            <a className="font-headline text-sm text-on-surface-variant transition hover:text-on-surface">
              Observatory
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth?role=student" className="ghost-btn hidden md:inline-flex">
              Join as Student
            </Link>
            <Link to="/auth?role=teacher" className="primary-btn">
              Create as Teacher
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative pt-28">
        <section className="relative px-6 pb-20 pt-12 lg:px-10 lg:pb-28 lg:pt-24">
          <div className="absolute inset-0 bg-hero-gradient" />
          <div className="absolute inset-0 hud-grid opacity-50" />
          <div className="absolute left-[-8rem] top-20 h-72 w-72 rounded-full bg-secondary/20 blur-[120px]" />
          <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-primary/15 blur-[140px]" />

          <div className="relative mx-auto flex max-w-7xl flex-col items-center text-center">
            <div className="section-chip">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              System Status: Active
            </div>
            <h1 className="mt-8 max-w-6xl font-headline text-5xl font-bold tracking-tighter text-on-surface md:text-7xl lg:text-8xl">
              Where classrooms become{" "}
              <span className="bg-gradient-to-br from-primary-soft via-primary to-secondary-soft bg-clip-text text-transparent">
                workspaces
              </span>
            </h1>
            <p className="mt-8 max-w-3xl text-lg text-on-surface-variant md:text-xl">
              A cinematic operating system for technical education. Turn passive learning into live
              production with real-time tasks, chat, analytics, and version-aware teamwork.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link to="/auth?role=student" className="secondary-btn">
                Join as Student
              </Link>
              <Link to="/auth?role=teacher" className="ghost-btn px-8 py-3">
                Create as Teacher
              </Link>
            </div>

            <div className="mt-20 w-full glass-panel rounded-[2rem] border-white/10 px-6 py-10 lg:px-10">
              <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
                <div className="text-left">
                  <StatusBadge tone="primary">The Kinetic Dashboard</StatusBadge>
                  <h2 className="mt-6 font-headline text-4xl font-bold tracking-tight text-on-surface">
                    The judge demo flow is built into the product.
                  </h2>
                  <p className="mt-4 max-w-xl text-on-surface-variant">
                    Register a teacher, create a subject, enroll a student with a join code, open
                    the workspace, send a live chat message, and move a task on the board with the
                    exact same visual language across every page.
                  </p>
                  <div className="mt-8 grid gap-4 sm:grid-cols-3">
                    <div className="stat-card">
                      <div className="text-4xl font-headline font-bold text-on-surface">42</div>
                      <div className="mt-2 text-sm text-on-surface-variant">Students tracked</div>
                    </div>
                    <div className="stat-card">
                      <div className="text-4xl font-headline font-bold text-on-surface">76%</div>
                      <div className="mt-2 text-sm text-on-surface-variant">Average completion</div>
                    </div>
                    <div className="stat-card">
                      <div className="text-4xl font-headline font-bold text-on-surface">12</div>
                      <div className="mt-2 text-sm text-on-surface-variant">Pending reviews</div>
                    </div>
                  </div>
                </div>

                <div className="glass-panel rounded-[1.75rem] border-primary/15 p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-primary" />
                    <div className="h-3 w-3 rounded-full bg-secondary-soft" />
                    <div className="h-3 w-3 rounded-full bg-tertiary" />
                  </div>
                  <div className="rounded-[1.5rem] border border-white/5 bg-black/40 p-5">
                    <div className="grid gap-4">
                      <div className="rounded-2xl border border-primary/15 bg-primary/10 p-4">
                        <div className="text-xs uppercase tracking-[0.24em] text-primary-soft">
                          Teacher Cohort Grid
                        </div>
                        <div className="mt-3 grid grid-cols-3 gap-3">
                          {[90, 67, 34].map((value) => (
                            <div
                              key={value}
                              className="rounded-2xl border border-white/5 bg-surface-container-low p-4 text-center"
                            >
                              <div className="mx-auto h-14 w-14 rounded-full border-4 border-primary/30 border-t-primary" />
                              <div className="mt-3 font-headline text-lg font-bold">{value}%</div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-2xl border border-secondary/20 bg-secondary/10 p-4">
                          <div className="text-xs uppercase tracking-[0.24em] text-secondary-soft">
                            Version Control
                          </div>
                          <div className="mt-4 space-y-3 text-sm text-on-surface">
                            <div className="rounded-xl bg-black/30 p-3">v12 • Teacher feedback injected</div>
                            <div className="rounded-xl bg-black/30 p-3">v11 • UML diagram update</div>
                          </div>
                        </div>
                        <div className="rounded-2xl border border-primary/20 bg-surface-container-high p-4">
                          <div className="text-xs uppercase tracking-[0.24em] text-primary-soft">
                            GitHub Stream
                          </div>
                          <div className="mt-4 space-y-3">
                            <div className="rounded-xl bg-black/30 p-3 text-sm">Refactor AVL rotations</div>
                            <div className="rounded-xl bg-black/30 p-3 text-sm">Sync judge script</div>
                            <div className="rounded-xl bg-black/30 p-3 text-sm">Fix heap sort bounds</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
          <div className="mb-12 flex items-center justify-between">
            <div>
              <div className="section-chip">Functional Modules</div>
              <h2 className="mt-4 font-headline text-4xl font-bold tracking-tight text-on-surface">
                Engineered for performance.
              </h2>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="glass-panel group rounded-[1.75rem] p-8 transition hover:border-primary/20 hover:bg-surface-container"
              >
                <div
                  className={`grid h-14 w-14 place-items-center rounded-2xl border border-white/5 ${
                    index === 1 ? "bg-secondary/10 text-secondary-soft" : "bg-primary/10 text-primary"
                  }`}
                >
                  <MaterialIcon name={feature.icon} className="text-3xl" />
                </div>
                <h3 className="mt-8 font-headline text-2xl font-bold tracking-tight text-on-surface">
                  {feature.title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-on-surface-variant">{feature.description}</p>
                <div className="mt-8 flex items-center gap-2 text-sm font-semibold text-primary">
                  Explore demo
                  <MaterialIcon name="arrow_forward" className="text-base" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
