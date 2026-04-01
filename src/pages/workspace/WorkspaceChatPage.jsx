import { useMemo, useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { WorkspaceShell } from "../../components/layout/shells";
import {
  InfoBanner,
  LoadingScreen,
  MaterialIcon,
  StatusBadge,
} from "../../components/ui/kit";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useLiveSubscription } from "../../hooks/useLiveSubscription";
import { useWorkspaceGroup } from "../../hooks/useWorkspaceGroup";
import { formatDateTime, getInitials } from "../../lib/utils";
import dataService from "../../services/dataService";

export default function WorkspaceChatPage() {
  const { groupId } = useParams();
  const { profile, role } = useAuth();
  const { pushToast } = useToast();
  const { data: group, loading } = useWorkspaceGroup(groupId);
  const { data: messages = [] } = useLiveSubscription(
    (callback) => dataService.subscribeMessages(groupId, callback),
    [groupId],
    [],
  );
  const [messageText, setMessageText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [sending, setSending] = useState(false);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const readOnly = useMemo(
    () => role === "teacher" && group?.type === "class",
    [group?.type, role],
  );

  if (loading && !group) {
    return <LoadingScreen title="Opening group chat..." />;
  }

  if (!group) {
    return <LoadingScreen title="Chat unavailable" />;
  }

  const submitMessage = async (event) => {
    event.preventDefault();
    if (readOnly || (!messageText.trim() && !selectedFile)) {
      return;
    }

    setSending(true);

    try {
      let uploaded = { fileName: "", fileUrl: "" };
      if (selectedFile) {
        uploaded = await dataService.uploadChatFile(selectedFile, group.id, profile.uid);
        pushToast({
          title: "Attachment card added",
          description: "The file is represented in chat as a demo attachment card for the Spark-safe hackathon flow.",
          tone: "success",
        });
      }

      await dataService.sendMessage({
        groupId: group.id,
        senderId: profile.uid,
        text: messageText.trim(),
        fileName: uploaded.fileName,
        fileUrl: uploaded.fileUrl,
      });
      setMessageText("");
      setSelectedFile(null);
    } catch (error) {
      pushToast({
        title: "Could not send message",
        description: error.message,
        tone: "error",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <WorkspaceShell
      group={group}
      currentTab="chat"
      readOnlyBanner={readOnly ? "You are viewing as teacher — read only mode" : undefined}
      sidebarFooter={
        <div className="glass-panel rounded-2xl p-4">
          <div className="font-label text-[10px] uppercase tracking-[0.24em] text-on-surface-variant">
            Pinned
          </div>
          <div className="mt-3 space-y-3 text-sm text-on-surface">
            <div className="rounded-2xl bg-black/20 p-3">Project deadline: Dec 15</div>
            <div className="rounded-2xl bg-black/20 p-3">Meeting link for Thursday • 4:00 PM</div>
          </div>
        </div>
      }
    >
      <div className="flex h-[calc(100vh-9rem)] flex-col gap-6">
        <div className="glass-panel shrink-0 rounded-[2rem] p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="font-headline text-2xl font-bold text-on-surface">Group Chat</div>
              <div className="mt-1 text-sm text-on-surface-variant">
                Realtime discussion powered by {group.githubRepo ? "workspace sync and repo signals" : "workspace sync"}.
              </div>
            </div>
            <div className="flex gap-2">
              <StatusBadge tone="primary">Realtime</StatusBadge>
              <StatusBadge tone="success">{group.members.length} members</StatusBadge>
            </div>
          </div>
        </div>

        <div className="glass-panel flex min-h-0 flex-1 flex-col rounded-[2rem]">
          <div className="border-b border-white/5 px-6 py-4">
            <InfoBanner tone="primary">
              Messages update live in Firestore. Attachments are shown as demo file cards so the app stays free on Firebase Spark.
            </InfoBanner>
          </div>

          <div
            ref={scrollContainerRef}
            className="scrollbar-subtle flex-1 space-y-8 overflow-y-auto px-6 py-6"
          >
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-white/5" />
              <span className="font-label text-[10px] uppercase tracking-[0.24em] text-on-surface-variant">
                Today
              </span>
              <div className="h-px flex-1 bg-white/5" />
            </div>

            {messages.map((message) => {
              const sender = group.members.find((member) => member.uid === message.senderId) || {
                name: "Member",
              };
              const senderLabel = sender.name || sender.email || "Member";
              const ownMessage = message.senderId === profile.uid;

              return (
                <div
                  key={message.id}
                  className={`flex max-w-3xl items-start gap-4 ${
                    ownMessage ? "ml-auto flex-row-reverse" : ""
                  }`}
                >
                  <div className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-surface-container-high text-xs font-bold text-on-surface">
                    {getInitials(senderLabel)}
                  </div>
                  <div className="space-y-2">
                    <div className={`flex items-center gap-2 text-xs ${ownMessage ? "justify-end" : ""}`}>
                      <span className="font-headline font-bold text-on-surface">{senderLabel}</span>
                      <span className="text-on-surface-variant">
                        {formatDateTime(message.timestamp)}
                      </span>
                    </div>
                    <div
                      className={`rounded-2xl p-4 ${
                        ownMessage
                          ? "rounded-tr-sm border border-secondary/20 bg-secondary/20 text-on-surface shadow-violet"
                          : "rounded-tl-sm border border-white/5 bg-surface-container-high/80 text-on-surface"
                      }`}
                    >
                      {message.text ? <div className="text-sm leading-7">{message.text}</div> : null}
                      {message.fileName ? (
                        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-white/5 bg-black/25 p-3">
                          <div className="grid h-10 w-10 place-items-center rounded-xl bg-surface-container-highest">
                            <MaterialIcon name="description" className="text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-medium text-on-surface">
                              {message.fileName}
                            </div>
                            <div className="text-xs text-on-surface-variant">
                              Demo attachment card
                            </div>
                          </div>
                          <MaterialIcon name="draft" className="text-on-surface-variant" />
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}

            {messageText && !readOnly ? (
              <div className="text-sm text-on-surface-variant">Kunal is typing…</div>
            ) : null}
          </div>

          <form className="border-t border-white/5 px-6 py-4" onSubmit={submitMessage}>
            {selectedFile ? (
              <div className="mb-3 flex items-center justify-between rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-on-surface">
                <div className="flex items-center gap-3">
                  <MaterialIcon name="attach_file" className="text-primary" />
                  {selectedFile.name}
                </div>
                <button type="button" className="text-on-surface-variant" onClick={() => setSelectedFile(null)}>
                  <MaterialIcon name="close" />
                </button>
              </div>
            ) : null}

            <div className="flex flex-col gap-3 lg:flex-row">
              <textarea
                className="kinetic-input min-h-20 flex-1"
                placeholder={readOnly ? "Teacher read-only mode enabled" : "Transmit a message to the group..."}
                disabled={readOnly}
                value={messageText}
                onChange={(event) => setMessageText(event.target.value)}
              />
              <div className="flex gap-3 lg:w-[15rem] lg:flex-col">
                <label className="ghost-btn cursor-pointer justify-center">
                  <MaterialIcon name="attach_file" />
                  Attach
                  <input
                    type="file"
                    className="hidden"
                    disabled={readOnly}
                    onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
                  />
                </label>
                <button type="submit" className="primary-btn justify-center" disabled={readOnly || sending}>
                  {sending ? "Sending..." : "Send"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </WorkspaceShell>
  );
}
