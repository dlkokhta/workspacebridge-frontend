import { useState } from "react";
import { ExternalLink, Link as LinkIcon, Pin, Plus, Trash2 } from "lucide-react";
import { AddLinkModal } from "./AddLinkModal";
import { useSharedLinks } from "../sharedLinks/useSharedLinks";
import type { SharedLink } from "../types";

interface SharedLinksTabProps {
  workspaceId: string;
}

const formatAddedBy = (addedBy: SharedLink["addedBy"]): string => {
  if (!addedBy) return "Deleted user";
  const name = [addedBy.firstname, addedBy.lastname].filter(Boolean).join(" ");
  return name || addedBy.email;
};

const formatRelative = (iso: string): string => {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
};

const hostnameOf = (url: string): string => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

export const SharedLinksTab = ({ workspaceId }: SharedLinksTabProps) => {
  const { links, loading, error, addLink, removeLink, clearError } =
    useSharedLinks(workspaceId);
  const [showModal, setShowModal] = useState(false);

  const handleRemove = (id: string) => void removeLink(id);

  return (
    <>
      <div className="flex flex-col flex-1 overflow-hidden min-h-0">
        <div className="flex items-center justify-between px-6 py-3 border-b border-black/[0.06] dark:border-white/[0.05]">
          <span className="text-[13px] text-[#5a625e] dark:text-[#a0a8a3]">
            {loading
              ? "Loading…"
              : `${links?.length ?? 0} links · visible to all workspace members`}
          </span>
          <button
            onClick={() => setShowModal(true)}
            className="h-8 px-3 inline-flex items-center gap-1.5 rounded-lg bg-[#5a8a6b] hover:bg-[#4f7a5e] text-white text-[12px] font-medium transition-colors cursor-pointer"
          >
            <Plus size={13} /> Add link
          </button>
        </div>

        {error && (
          <div className="flex items-center justify-between px-6 py-2 bg-[#c25a4a]/10 text-[12px] text-[#c25a4a] dark:text-[#e07b6b]">
            <span>{error}</span>
            <button onClick={clearError} className="underline cursor-pointer">
              dismiss
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6 space-y-2.5 bg-[#fafaf7] dark:bg-[#0e1310]">
          {!loading && (links?.length ?? 0) === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#5a8a6b]/10 flex items-center justify-center text-[#5a8a6b]">
                <Pin size={22} />
              </div>
              <div>
                <h3 className="text-[17px] font-semibold text-[#1a201c] dark:text-[#e8ece9] mb-1">No links yet</h3>
                <p className="text-[13px] text-[#5a625e] dark:text-[#a0a8a3] max-w-xs">
                  Add Figma files, staging sites, or any URL your client needs access to.
                </p>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="mt-1 h-9 px-4 inline-flex items-center gap-1.5 rounded-lg bg-[#5a8a6b] hover:bg-[#4f7a5e] text-white text-[13px] font-medium transition-colors cursor-pointer"
              >
                <Plus size={13} /> Add first link
              </button>
            </div>
          ) : (
            (links ?? []).map((l) => {
              const host = hostnameOf(l.url);
              return (
                <div
                  key={l.id}
                  className="flex items-center gap-4 px-4 py-4 rounded-xl bg-white dark:bg-[#151a17] border border-black/[0.08] dark:border-white/[0.07]"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-[#5a8a6b]/15 text-[#5a8a6b]">
                    <LinkIcon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-medium text-[#1a201c] dark:text-[#e8ece9] mb-0.5 truncate">
                      {l.title ?? host}
                    </div>
                    <div className="text-[12px] font-mono text-[#858c87] dark:text-[#6e7672] truncate">{l.url}</div>
                    <div className="text-[11px] text-[#b5bbb7] dark:text-[#4a514d] mt-1">
                      {host} · Added by {formatAddedBy(l.addedBy)} · {formatRelative(l.createdAt)}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <a
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-8 px-3 inline-flex items-center gap-1.5 rounded-lg bg-white dark:bg-[#1c221e] border border-black/[0.08] dark:border-white/[0.07] text-[12px] font-medium text-[#1a201c] dark:text-[#e8ece9] hover:bg-[#f6f6f1] dark:hover:bg-[#222b26] transition-colors"
                    >
                      <ExternalLink size={12} /> Open
                    </a>
                    <button
                      onClick={() => handleRemove(l.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-[#858c87] dark:text-[#6e7672] hover:bg-[#c25a4a]/10 hover:text-[#c25a4a] dark:hover:text-[#e07b6b] transition-colors cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {showModal && (
        <AddLinkModal onAdd={addLink} onClose={() => setShowModal(false)} />
      )}
    </>
  );
};
