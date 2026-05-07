import { useState } from "react";
import { ExternalLink, Link as LinkIcon, Pin, Plus, Trash2 } from "lucide-react";
import { AddLinkModal } from "./AddLinkModal";
import type { SharedLink } from "../types";

export const SharedLinksTab = () => {
  const [links, setLinks] = useState<SharedLink[]>([]);
  const [showModal, setShowModal] = useState(false);

  const removeLink = (id: number) => setLinks((prev) => prev.filter((x) => x.id !== id));
  const addLink = (link: SharedLink) => setLinks((prev) => [link, ...prev]);

  return (
    <>
      <div className="flex flex-col flex-1 overflow-hidden min-h-0">
        <div className="flex items-center justify-between px-6 py-3 border-b border-black/[0.06] dark:border-white/[0.05]">
          <span className="text-[13px] text-[#5a625e] dark:text-[#a0a8a3]">
            {links.length} links · visible to all workspace members
          </span>
          <button
            onClick={() => setShowModal(true)}
            className="h-8 px-3 inline-flex items-center gap-1.5 rounded-lg bg-[#5a8a6b] hover:bg-[#4f7a5e] text-white text-[12px] font-medium transition-colors cursor-pointer"
          >
            <Plus size={13} /> Add link
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-2.5 bg-[#fafaf7] dark:bg-[#0e1310]">
          {links.length === 0 ? (
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
            links.map((l) => (
              <div
                key={l.id}
                className="flex items-center gap-4 px-4 py-4 rounded-xl bg-white dark:bg-[#151a17] border border-black/[0.08] dark:border-white/[0.07]"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: l.color + "22", color: l.color }}
                >
                  <LinkIcon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-medium text-[#1a201c] dark:text-[#e8ece9] mb-0.5">{l.title}</div>
                  <div className="text-[12px] font-mono text-[#858c87] dark:text-[#6e7672] truncate">{l.url}</div>
                  <div className="text-[11px] text-[#b5bbb7] dark:text-[#4a514d] mt-1">
                    {l.kind} · Added by {l.by} · {l.added}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <a
                    href={`https://${l.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-8 px-3 inline-flex items-center gap-1.5 rounded-lg bg-white dark:bg-[#1c221e] border border-black/[0.08] dark:border-white/[0.07] text-[12px] font-medium text-[#1a201c] dark:text-[#e8ece9] hover:bg-[#f6f6f1] dark:hover:bg-[#222b26] transition-colors"
                  >
                    <ExternalLink size={12} /> Open
                  </a>
                  <button
                    onClick={() => removeLink(l.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-[#858c87] dark:text-[#6e7672] hover:bg-[#c25a4a]/10 hover:text-[#c25a4a] dark:hover:text-[#e07b6b] transition-colors cursor-pointer"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showModal && <AddLinkModal onAdd={addLink} onClose={() => setShowModal(false)} />}
    </>
  );
};
