import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { WorkspaceShell } from "../../components/layout/shells";
import {
  Avatar,
  LoadingScreen,
  MaterialIcon,
  Modal,
  SideDrawer,
  StatusBadge,
} from "../../components/ui/kit";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useLiveSubscription } from "../../hooks/useLiveSubscription";
import { useWorkspaceGroup } from "../../hooks/useWorkspaceGroup";
import { formatDate } from "../../lib/utils";
import dataService from "../../services/dataService";

const columns = [
  { key: "backlog", label: "Backlog" },
  { key: "todo", label: "To Do" },
  { key: "in-progress", label: "In Progress" },
  { key: "done", label: "Done" },
];

export default function WorkspaceTasksPage() {
  const { groupId } = useParams();
  const { profile } = useAuth();
  const { pushToast } = useToast();
  const { data: group, loading } = useWorkspaceGroup(groupId);
  const { data: tasks = [] } = useLiveSubscription(
    (callback) => dataService.subscribeTasks(groupId, callback),
    [groupId],
    [],
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [comment, setComment] = useState("");
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    assigneeId: "",
    priority: "Medium",
    dueDate: "",
  });

  const groupedTasks = useMemo(
    () =>
      columns.reduce((accumulator, column) => {
        accumulator[column.key] = tasks.filter((task) => task.status === column.key);
        return accumulator;
      }, {}),
    [tasks],
  );

  if (loading && !group) {
    return <LoadingScreen title="Loading task board..." />;
  }

  if (!group) {
    return <LoadingScreen title="Task board unavailable" />;
  }

  const members = group.members.filter((member) => member.role === "student" || member.uid === profile.uid);

  const createTask = async (event) => {
    event.preventDefault();
    setCreating(true);

    try {
      await dataService.createTask({
        groupId: group.id,
        title: form.title,
        description: form.description,
        assigneeId: form.assigneeId,
        priority: form.priority,
        dueDate: form.dueDate,
        actorId: profile.uid,
      });
      setIsCreateModalOpen(false);
      setForm({
        title: "",
        description: "",
        assigneeId: "",
        priority: "Medium",
        dueDate: "",
      });
      pushToast({
        title: "Task created",
        description: "The Kanban board updated in real time.",
        tone: "success",
      });
    } catch (error) {
      pushToast({
        title: "Could not create task",
        description: error.message,
        tone: "error",
      });
    } finally {
      setCreating(false);
    }
  };

  const updateTask = async (taskId, patch) => {
    await dataService.updateTask(taskId, patch, profile.uid);
  };

  const addComment = async (event) => {
    event.preventDefault();
    if (!selectedTask || !comment.trim()) return;

    await dataService.addTaskComment(selectedTask.id, {
      text: comment.trim(),
      authorId: profile.uid,
    });
    setComment("");
  };

  const openTask = (task) => {
    setSelectedTask(task);
    setComment("");
  };

  const selectedTaskFresh = selectedTask
    ? tasks.find((task) => task.id === selectedTask.id) || selectedTask
    : null;

  return (
    <>
      <WorkspaceShell
        group={group}
        currentTab="tasks"
        sidebarFooter={
          <button type="button" className="primary-btn w-full justify-center" onClick={() => setIsCreateModalOpen(true)}>
            <MaterialIcon name="add_task" />
            New Task
          </button>
        }
      >
        <div className="space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="section-chip">Realtime Kanban</div>
              <h1 className="mt-4 font-headline text-4xl font-bold tracking-tight text-on-surface">
                Task Board
              </h1>
              <p className="mt-2 text-sm text-on-surface-variant">
                Create tasks, assign owners, change status, and comment from the same board.
              </p>
            </div>
            <button type="button" className="primary-btn" onClick={() => setIsCreateModalOpen(true)}>
              <MaterialIcon name="add" />
              Create Task
            </button>
          </div>

          <div className="grid gap-6 xl:grid-cols-4">
            {columns.map((column) => (
              <section key={column.key} className="glass-panel rounded-[2rem] p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div className="font-headline text-lg font-bold text-on-surface">
                    {column.label}
                  </div>
                  <StatusBadge tone="primary">{groupedTasks[column.key]?.length || 0}</StatusBadge>
                </div>
                <div className="space-y-4">
                  {(groupedTasks[column.key] || []).map((task) => {
                    const assignee = group.members.find((member) => member.uid === task.assigneeId);
                    return (
                      <button
                        key={task.id}
                        type="button"
                        onClick={() => openTask(task)}
                        className="w-full rounded-[1.5rem] border border-white/5 bg-black/20 p-4 text-left transition hover:border-primary/20 hover:bg-surface-container-high"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="font-headline text-lg font-bold text-on-surface">
                            {task.title}
                          </div>
                          <StatusBadge
                            tone={
                              task.priority === "High"
                                ? "danger"
                                : task.priority === "Medium"
                                  ? "warning"
                                  : "neutral"
                            }
                          >
                            {task.priority}
                          </StatusBadge>
                        </div>
                        <div className="mt-4 flex items-center justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <Avatar user={assignee} className="h-8 w-8" />
                            <div className="truncate text-sm text-on-surface-variant">
                              {assignee?.name || "Unassigned"}
                            </div>
                          </div>
                          <div className="text-xs text-on-surface-variant">{formatDate(task.dueDate)}</div>
                        </div>
                        <div className="mt-4">
                          <select
                            value={task.status}
                            className="kinetic-input py-2 text-xs uppercase tracking-[0.2em]"
                            onClick={(event) => event.stopPropagation()}
                            onChange={(event) => updateTask(task.id, { status: event.target.value })}
                          >
                            {columns.map((statusOption) => (
                              <option key={statusOption.key} value={statusOption.key}>
                                {statusOption.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </div>
      </WorkspaceShell>

      <Modal open={isCreateModalOpen} title="Create Task" onClose={() => setIsCreateModalOpen(false)}>
        <form className="space-y-5" onSubmit={createTask}>
          <div className="space-y-2">
            <label className="font-label text-[10px] uppercase tracking-[0.24em] text-on-surface-variant">
              Title
            </label>
            <input
              className="kinetic-input"
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="font-label text-[10px] uppercase tracking-[0.24em] text-on-surface-variant">
              Description
            </label>
            <textarea
              className="kinetic-input min-h-28"
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({ ...current, description: event.target.value }))
              }
            />
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            <div className="space-y-2">
              <label className="font-label text-[10px] uppercase tracking-[0.24em] text-on-surface-variant">
                Assignee
              </label>
              <select
                className="kinetic-input"
                value={form.assigneeId}
                onChange={(event) =>
                  setForm((current) => ({ ...current, assigneeId: event.target.value }))
                }
                required
              >
                <option value="" disabled>
                  Select
                </option>
                {members.map((member) => (
                  <option key={member.uid} value={member.uid}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="font-label text-[10px] uppercase tracking-[0.24em] text-on-surface-variant">
                Priority
              </label>
              <select
                className="kinetic-input"
                value={form.priority}
                onChange={(event) =>
                  setForm((current) => ({ ...current, priority: event.target.value }))
                }
              >
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="font-label text-[10px] uppercase tracking-[0.24em] text-on-surface-variant">
                Due Date
              </label>
              <input
                type="date"
                className="kinetic-input"
                value={form.dueDate}
                onChange={(event) =>
                  setForm((current) => ({ ...current, dueDate: event.target.value }))
                }
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" className="ghost-btn" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="primary-btn" disabled={creating}>
              {creating ? "Creating..." : "Create Task"}
            </button>
          </div>
        </form>
      </Modal>

      <SideDrawer
        open={Boolean(selectedTaskFresh)}
        title={selectedTaskFresh?.title || "Task"}
        onClose={() => setSelectedTask(null)}
      >
        {selectedTaskFresh ? (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              <StatusBadge
                tone={
                  selectedTaskFresh.priority === "High"
                    ? "danger"
                    : selectedTaskFresh.priority === "Medium"
                      ? "warning"
                      : "neutral"
                }
              >
                {selectedTaskFresh.priority}
              </StatusBadge>
              <StatusBadge tone="primary">{formatDate(selectedTaskFresh.dueDate)}</StatusBadge>
            </div>

            <div className="glass-panel rounded-2xl p-4">
              <div className="font-label text-[10px] uppercase tracking-[0.24em] text-on-surface-variant">
                Description
              </div>
              <div className="mt-3 text-sm leading-7 text-on-surface">
                {selectedTaskFresh.description || "No task description yet."}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="glass-panel rounded-2xl p-4">
                <div className="font-label text-[10px] uppercase tracking-[0.24em] text-on-surface-variant">
                  Assignee
                </div>
                <div className="mt-3 flex items-center gap-3 text-sm text-on-surface">
                  <Avatar
                    user={group.members.find((member) => member.uid === selectedTaskFresh.assigneeId)}
                    className="h-9 w-9"
                  />
                  <span>
                    {group.members.find((member) => member.uid === selectedTaskFresh.assigneeId)?.name ||
                      "Unassigned"}
                  </span>
                </div>
              </div>
              <div className="glass-panel rounded-2xl p-4">
                <div className="font-label text-[10px] uppercase tracking-[0.24em] text-on-surface-variant">
                  Status
                </div>
                <select
                  value={selectedTaskFresh.status}
                  className="kinetic-input mt-3 py-2 text-sm"
                  onChange={(event) =>
                    updateTask(selectedTaskFresh.id, { status: event.target.value })
                  }
                >
                  {columns.map((statusOption) => (
                    <option key={statusOption.key} value={statusOption.key}>
                      {statusOption.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-4">
              <div className="font-headline text-lg font-bold text-on-surface">Comments</div>
              <div className="mt-4 space-y-3">
                {(selectedTaskFresh.comments || []).map((entry) => (
                  <div key={entry.id} className="rounded-2xl border border-white/5 bg-black/20 p-3">
                    <div className="text-sm font-semibold text-on-surface">{entry.authorName}</div>
                    <div className="mt-1 text-sm text-on-surface-variant">{entry.text}</div>
                  </div>
                ))}
              </div>

              <form className="mt-4 space-y-3" onSubmit={addComment}>
                <textarea
                  className="kinetic-input min-h-24"
                  placeholder="Leave a quick comment..."
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                />
                <button type="submit" className="primary-btn justify-center">
                  Add Comment
                </button>
              </form>
            </div>
          </div>
        ) : null}
      </SideDrawer>
    </>
  );
}
