import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  ExternalLink,
  File,
  Link as LinkIcon,
  LogOut,
  MessageCircle,
  Moon,
  Pencil,
  Pin,
  Plus,
  Sun,
  Trash2,
  X,
} from "lucide-react";
import { axiosInstance, useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { MessagesTab as RealMessagesTab } from "../workspacePage/tabs/MessagesTab";
import { WhiteboardTab } from "../workspacePage/whiteboard/WhiteboardTab";
import { FilesTab as RealFilesTab } from "../workspacePage/files/FilesTab";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = "messages" | "files" | "whiteboard" | "shared-links";

interface UserProfile {
  id: string;
  firstname: string | null;
  lastname: string | null;
  email: string;
  picture: string | null;
}

interface Workspace {
  id: string;
  name: string;
  description: string | null;
  color: string;
  status: string;
}

interface SharedLink {
  id: number;
  title: string;
  url: string;
  kind: string;
  by: string;
  added: string;
  color: string;
}

// ─── Static data ─────────────────────────────────────────────────────────────

const SEED_LINKS: SharedLink[] = [];

// ─── Shared Links tab ─────────────────────────────────────────────────────────

const AddLinkModal = ({ onAdd, onClose }: { onAdd: (l: SharedLink) => void; onClose: () => void }) => {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md bg-white dark:bg-[#151a17] border border-black/[0.08] dark:border-white/[0.07] rounded-2xl p-7 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[18px] font-semibold text-[#1a201c] dark:text-[#e8ece9]">Add a link</h3>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-[#858c87] dark:text-[#6e7672] hover:bg-black/[0.05] dark:hover:bg-white/[0.05] cursor-pointer"><X size={14} /></button>
        </div>
        <div className="space-y-3 cursor-pointer">
          <div>
            <label className="block text-[12px] font-medium text-[#5a625e] dark:text-[#a0a8a3] mb-1.5">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Reference images" autoFocus className="w-full h-[42px] px-3.5 rounded-lg border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#1c221e] text-[13px] text-[#1a201c] dark:text-[#e8ece9] outline-none focus:border-[#5a8a6b] focus:ring-2 focus:ring-[#5a8a6b]/20 transition-all" />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-[#5a625e] dark:text-[#a0a8a3] mb-1.5">URL</label>
            <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="figma.com/file/…" className="w-full h-[42px] px-3.5 rounded-lg border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#1c221e] text-[13px] text-[#1a201c] dark:text-[#e8ece9] outline-none focus:border-[#5a8a6b] focus:ring-2 focus:ring-[#5a8a6b]/20 transition-all" />
          </div>
        </div>
        <div className="flex gap-2.5 mt-6">
          <button onClick={onClose} className="flex-1 h-10 rounded-lg border border-black/[0.08] dark:border-white/[0.07] text-[13px] font-medium text-[#5a625e] dark:text-[#a0a8a3] hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-colors cursor-pointer">Cancel</button>
          <button disabled={!title.trim() || !url.trim()} onClick={() => { onAdd({ id: Date.now(), title: title.trim(), url: url.trim(), kind: "Link", by: "You", added: "Just now", color: "#7a9bbf" }); onClose(); }} className="flex-[2] h-10 rounded-lg bg-[#5a8a6b] hover:bg-[#4f7a5e] text-white text-[13px] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Add link</button>
        </div>
      </div>
    </div>
  );
};

const SharedLinksTab = () => {
  const [links, setLinks] = useState<SharedLink[]>(SEED_LINKS);
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="flex flex-col flex-1 overflow-hidden min-h-0">
        <div className="flex items-center justify-between px-6 py-3 border-b border-black/[0.06] dark:border-white/[0.05]">
          <span className="text-[13px] text-[#5a625e] dark:text-[#a0a8a3]">{links.length} links</span>
          <button onClick={() => setShowModal(true)} className="h-8 px-3 inline-flex items-center gap-1.5 rounded-lg bg-[#5a8a6b] hover:bg-[#4f7a5e] text-white text-[12px] font-medium transition-colors cursor-pointer">
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
                <p className="text-[13px] text-[#5a625e] dark:text-[#a0a8a3] max-w-xs">Shared links from your freelancer will appear here.</p>
              </div>
            </div>
          ) : (
            links.map((l) => (
              <div key={l.id} className="flex items-center gap-4 px-4 py-4 rounded-xl bg-white dark:bg-[#151a17] border border-black/[0.08] dark:border-white/[0.07]">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: l.color + "22", color: l.color }}>
                  <LinkIcon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-medium text-[#1a201c] dark:text-[#e8ece9] mb-0.5">{l.title}</div>
                  <div className="text-[12px] font-mono text-[#858c87] dark:text-[#6e7672] truncate">{l.url}</div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <a href={`https://${l.url}`} target="_blank" rel="noopener noreferrer" className="h-8 px-3 inline-flex items-center gap-1.5 rounded-lg bg-white dark:bg-[#1c221e] border border-black/[0.08] dark:border-white/[0.07] text-[12px] font-medium text-[#1a201c] dark:text-[#e8ece9] hover:bg-[#f6f6f1] dark:hover:bg-[#222b26] transition-colors">
                    <ExternalLink size={12} /> Open
                  </a>
                  <button onClick={() => setLinks((prev) => prev.filter((x) => x.id !== l.id))} className="w-8 h-8 flex items-center justify-center rounded-lg text-[#858c87] dark:text-[#6e7672] hover:bg-[#c25a4a]/10 hover:text-[#c25a4a] transition-colors cursor-pointer">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      {showModal && <AddLinkModal onAdd={(l) => setLinks((prev) => [l, ...prev])} onClose={() => setShowModal(false)} />}
    </>
  );
};

// ─── Tab bar ──────────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "messages", label: "Messages", icon: <MessageCircle size={14} /> },
  { id: "files", label: "Files", icon: <File size={14} /> },
  { id: "whiteboard", label: "Whiteboard", icon: <Pencil size={14} /> },
  { id: "shared-links", label: "Shared Links", icon: <LinkIcon size={14} /> },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export const PortalPage = () => {
  const navigate = useNavigate();
  const { setAccessToken } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [tab, setTab] = useState<Tab>("messages");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [profileRes, wsRes] = await Promise.all([
          axiosInstance.get<UserProfile>("/user/me"),
          axiosInstance.get<Workspace[]>("/workspace"),
        ]);
        setProfile(profileRes.data);
        if (wsRes.data.length > 0) setWorkspace(wsRes.data[0]);
      } catch {
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [navigate]);

  const getInitials = () => {
    if (profile?.firstname && profile?.lastname) return `${profile.firstname[0]}${profile.lastname[0]}`.toUpperCase();
    if (profile?.firstname) return profile.firstname[0].toUpperCase();
    if (profile?.email) return profile.email[0].toUpperCase();
    return "?";
  };

  const handleLogout = async () => {
    try { await axiosInstance.post("/auth/logout"); } catch { /* ignore */ }
    finally { setAccessToken(null); navigate("/login"); }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafaf7] dark:bg-[#0e1310]">
        <p className="text-[#5a625e] dark:text-[#a0a8a3] text-sm">Loading…</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#fafaf7] dark:bg-[#0e1310] overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3.5 border-b border-black/[0.06] dark:border-white/[0.05] bg-[#fafaf7] dark:bg-[#0e1310] shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-[13px] font-semibold tracking-[-0.02em] text-[#858c87] dark:text-[#6e7672]">
            <span className="w-[20px] h-[20px] rounded-[5px] bg-[#5a8a6b] text-white flex items-center justify-center">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </span>
            WorkspaceBridge
          </div>
          {workspace && (
            <>
              <span className="text-[#d0d4d1] dark:text-[#2a342e]">/</span>
              <div className="flex items-center gap-2">
                <span className="w-[22px] h-[22px] rounded-md flex items-center justify-center text-[10px] font-semibold text-white shrink-0" style={{ background: workspace.color }}>
                  {workspace.name[0].toUpperCase()}
                </span>
                <span className="text-[14px] font-semibold text-[#1a201c] dark:text-[#e8ece9]">{workspace.name}</span>
                {workspace.description && (
                  <span className="text-[12px] text-[#858c87] dark:text-[#6e7672] hidden sm:block">{workspace.description}</span>
                )}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#1c221e] text-[#5a625e] dark:text-[#a0a8a3] hover:bg-[#f6f6f1] dark:hover:bg-[#222b26] transition-colors cursor-pointer" aria-label="Notifications">
            <Bell size={14} />
          </button>
          <button onClick={toggleTheme} className="w-8 h-8 flex items-center justify-center rounded-lg border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#1c221e] text-[#5a625e] dark:text-[#a0a8a3] hover:bg-[#f6f6f1] dark:hover:bg-[#222b26] transition-colors cursor-pointer" aria-label="Toggle theme">
            {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          <div className="flex items-center gap-2 pl-1 border-l border-black/[0.06] dark:border-white/[0.05] ml-1 cursor-pointer">
            <div className="w-7 h-7 rounded-full bg-[#7a9bbf] text-white flex items-center justify-center text-[11px] font-semibold">
              {getInitials()}
            </div>
            <span className="text-[13px] text-[#5a625e] dark:text-[#a0a8a3] hidden sm:block truncate max-w-[120px]">
              {profile?.firstname ? `${profile.firstname} ${profile.lastname ?? ""}`.trim() : profile?.email}
            </span>
            <button onClick={handleLogout} title="Sign out" className="w-7 h-7 flex items-center justify-center rounded-md text-[#858c87] dark:text-[#6e7672] hover:bg-black/[0.06] dark:hover:bg-white/[0.06] hover:text-[#c25a4a] dark:hover:text-[#e07b6b] transition-colors cursor-pointer">
              <LogOut size={13} />
            </button>
          </div>
        </div>
      </header>

      {/* Tab bar */}
      <div className="flex items-center gap-1 px-6 border-b border-black/[0.06] dark:border-white/[0.05] bg-[#fafaf7] dark:bg-[#0e1310] shrink-0">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3 h-11 text-[13px] font-medium border-b-2 transition-colors cursor-pointer ${
              tab === t.id
                ? "border-[#5a8a6b] text-[#1a201c] dark:text-[#e8ece9]"
                : "border-transparent text-[#5a625e] dark:text-[#a0a8a3] hover:text-[#1a201c] dark:hover:text-[#e8ece9]"
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        {tab === "messages" && workspace && (
          <RealMessagesTab
            workspaceId={workspace.id}
            userId={profile?.id ?? ""}
            initials={getInitials()}
          />
        )}
        {tab === "files" && workspace && (
          <RealFilesTab
            workspaceId={workspace.id}
            currentUserId={profile?.id ?? ""}
            workspaceOwnerId=""
          />
        )}
        {tab === "whiteboard" && workspace && <WhiteboardTab workspaceId={workspace.id} />}
        {tab === "shared-links" && <SharedLinksTab />}
      </div>
    </div>
  );
};
