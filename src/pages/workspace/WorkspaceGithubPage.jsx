import { useParams } from "react-router-dom";
import { WorkspaceShell } from "../../components/layout/shells";
import { LoadingScreen, MaterialIcon, StatusBadge } from "../../components/ui/kit";
import { useWorkspaceGroup } from "../../hooks/useWorkspaceGroup";
import {
  contributorBars,
  githubCommits,
  githubPullRequests,
  heatmapData,
} from "../../lib/showcaseData";

export default function WorkspaceGithubPage() {
  const { groupId } = useParams();
  const { data: group, loading } = useWorkspaceGroup(groupId);

  if (loading && !group) {
    return <LoadingScreen title="Loading GitHub tab..." />;
  }

  if (!group) {
    return <LoadingScreen title="GitHub tab unavailable" />;
  }

  return (
    <WorkspaceShell group={group} currentTab="github">
      <div className="space-y-6">
        <section className="glass-panel rounded-[2rem] border-l-4 border-l-primary p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-5">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-surface-container-high">
                <MaterialIcon name="terminal" className="text-4xl text-primary" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="font-headline text-3xl font-bold text-on-surface">
                    {group.githubRepo || "edu-core/ds-team-a"}
                  </h1>
                  <StatusBadge tone="primary">Connected</StatusBadge>
                </div>
                <div className="mt-2 text-sm text-on-surface-variant">
                  Owner: Kunal • Branch: main • Last synced: 2 min ago
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button type="button" className="ghost-btn">
                Change Repo
              </button>
              <button type="button" className="primary-btn">
                Sync Now
              </button>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="font-headline text-2xl font-bold text-on-surface">Commit Stream</div>
              <StatusBadge tone="primary">Live Styled</StatusBadge>
            </div>
            {githubCommits.map((commit) => (
              <div key={commit.sha} className="glass-panel rounded-[2rem] p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="font-headline text-xl font-bold text-on-surface">{commit.title}</div>
                    <div className="mt-2 text-sm text-on-surface-variant">
                      {commit.author} • {commit.branch} • {commit.time}
                    </div>
                  </div>
                  <div className="text-right font-mono text-sm">
                    <div className="text-on-surface-variant">
                      SHA: <span className="text-secondary-soft">{commit.sha}</span>
                    </div>
                    <div className="mt-2 flex gap-3">
                      <span className="text-primary">+{commit.plus}</span>
                      <span className="text-error">-{commit.minus}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 rounded-2xl border-l-2 border-primary/40 bg-black/30 p-4 font-mono text-xs text-on-surface-variant">
                  {"@@ -42,8 +42,12 @@ class AVLTree { ... }"}
                </div>
              </div>
            ))}
          </section>

          <section className="space-y-6">
            <div className="glass-panel rounded-[2rem] p-6">
              <div className="font-headline text-xl font-bold text-on-surface">Contribution Heatmap</div>
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
                              : "bg-primary shadow-cyan"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="glass-panel rounded-[2rem] p-6">
              <div className="font-headline text-xl font-bold text-on-surface">Core Contributors</div>
              <div className="mt-5 space-y-4">
                {contributorBars.map((bar) => (
                  <div key={bar.label}>
                    <div className="mb-2 flex items-center justify-between text-sm text-on-surface">
                      <span>{bar.label}</span>
                      <span>{bar.value}%</span>
                    </div>
                    <div className="h-3 rounded-full bg-surface-container-highest">
                      <div className="h-3 rounded-full bg-primary" style={{ width: `${bar.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel rounded-[2rem] p-6">
              <div className="font-headline text-xl font-bold text-on-surface">Pull Requests</div>
              <div className="mt-4 space-y-3">
                {githubPullRequests.map((request) => (
                  <div key={request.id} className="rounded-2xl border border-white/5 bg-black/20 p-4">
                    <div className="font-semibold text-on-surface">{request.title}</div>
                    <div className="mt-2 text-sm text-on-surface-variant">{request.author}</div>
                    <div className="mt-3">
                      <StatusBadge tone={request.status === "Merged" ? "success" : "warning"}>
                        {request.status}
                      </StatusBadge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </WorkspaceShell>
  );
}
