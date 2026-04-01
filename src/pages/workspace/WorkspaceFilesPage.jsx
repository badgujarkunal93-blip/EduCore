import { useParams } from "react-router-dom";
import { WorkspaceShell } from "../../components/layout/shells";
import { LoadingScreen, MaterialIcon, StatusBadge } from "../../components/ui/kit";
import { useWorkspaceGroup } from "../../hooks/useWorkspaceGroup";
import { filesTable, versions } from "../../lib/showcaseData";

export default function WorkspaceFilesPage() {
  const { groupId } = useParams();
  const { data: group, loading } = useWorkspaceGroup(groupId);

  if (loading && !group) {
    return <LoadingScreen title="Loading files tab..." />;
  }

  if (!group) {
    return <LoadingScreen title="Files tab unavailable" />;
  }

  return (
    <WorkspaceShell group={group} currentTab="files">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="section-chip">Files & Version Control</div>
            <h1 className="mt-4 font-headline text-4xl font-bold tracking-tight text-on-surface">
              Collaborative assets and revision history
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-on-surface-variant">
              Review the folder tree, recent uploads, and the teacher annotation stack.
            </p>
          </div>
          <div className="flex gap-3">
            <button type="button" className="ghost-btn">
              <MaterialIcon name="history" />
              Audit Log
            </button>
            <button type="button" className="primary-btn">
              <MaterialIcon name="cloud_upload" />
              Upload File
            </button>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
          <section className="glass-panel overflow-hidden rounded-[2rem]">
            <div className="grid min-h-[42rem] md:grid-cols-[15rem_1fr]">
              <aside className="border-r border-white/5 bg-black/20 p-4">
                <div className="font-label text-[10px] uppercase tracking-[0.24em] text-on-surface-variant">
                  Directories
                </div>
                <div className="mt-4 space-y-2">
                  <div className="rounded-2xl border border-primary/20 bg-primary/10 p-3 text-sm text-primary">
                    Project
                  </div>
                  <div className="rounded-2xl bg-surface-container-high p-3 text-sm text-on-surface-variant">
                    Source
                  </div>
                  <div className="rounded-2xl bg-surface-container-high p-3 text-sm text-on-surface-variant">
                    Assets
                  </div>
                  <div className="rounded-2xl bg-surface-container-high p-3 text-sm text-on-surface-variant">
                    Docs
                  </div>
                </div>
              </aside>

              <div className="flex flex-col">
                <div className="border-b border-white/5 px-5 py-4">
                  <div className="relative max-w-md">
                    <MaterialIcon
                      name="search"
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
                    />
                    <input className="kinetic-input pl-10" placeholder="Search files, versions, or authors..." />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-white/5 bg-black/20 text-left text-[10px] uppercase tracking-[0.24em] text-on-surface-variant">
                      <tr>
                        <th className="px-5 py-4">Name</th>
                        <th className="px-5 py-4">Uploaded By</th>
                        <th className="px-5 py-4">Last Modified</th>
                        <th className="px-5 py-4">Version</th>
                        <th className="px-5 py-4 text-right">Size</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filesTable.map((file, index) => (
                        <tr
                          key={file.name}
                          className={`border-b border-white/5 ${
                            index === 0 ? "bg-primary/10" : "bg-transparent"
                          }`}
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <MaterialIcon
                                name={file.name.endsWith(".py") ? "terminal" : file.name.endsWith(".pdf") ? "description" : "image"}
                                className={index === 0 ? "text-primary" : "text-secondary-soft"}
                              />
                              <span className="text-sm font-medium text-on-surface">{file.name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-sm text-on-surface-variant">{file.author}</td>
                          <td className="px-5 py-4 text-sm text-on-surface-variant">{file.modified}</td>
                          <td className="px-5 py-4">
                            <StatusBadge tone={index === 0 ? "primary" : "neutral"}>{file.version}</StatusBadge>
                          </td>
                          <td className="px-5 py-4 text-right text-sm text-on-surface-variant">{file.size}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="m-5 rounded-[1.75rem] border border-dashed border-outline-variant/30 bg-black/20 p-10 text-center">
                  <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-surface-container-high">
                    <MaterialIcon name="cloud_upload" className="text-primary" />
                  </div>
                  <div className="mt-4 font-headline text-2xl font-bold text-on-surface">
                    Drag and drop assets
                  </div>
                  <div className="mt-2 text-sm text-on-surface-variant">
                    Upload zone is fully styled for demo. File handling is intentionally optional here.
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="glass-panel rounded-[2rem] p-6">
              <div className="font-headline text-xl font-bold text-on-surface">Version History</div>
              <div className="mt-6 space-y-4">
                {versions.map((version, index) => (
                  <div key={version.id} className="relative pl-8">
                    <div className="absolute left-0 top-1 h-4 w-4 rounded-full bg-primary" />
                    {index !== versions.length - 1 ? (
                      <div className="absolute left-[7px] top-5 h-12 w-px bg-white/10" />
                    ) : null}
                    <div className="rounded-2xl border border-white/5 bg-black/20 p-4">
                      <div className="font-headline text-lg font-bold text-on-surface">{version.label}</div>
                      <div className="mt-2 text-sm text-on-surface-variant">{version.note}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-warning/20 bg-warning/10 p-6">
              <div className="font-headline text-xl font-bold text-warning">Teacher Feedback</div>
              <p className="mt-3 text-sm leading-7 text-on-surface">
                Great structure overall. Before final submission, annotate the UML diagram more
                clearly and leave a short note on why the AVL rotation patch changed the visualizer.
              </p>
            </div>
          </section>
        </div>
      </div>
    </WorkspaceShell>
  );
}
