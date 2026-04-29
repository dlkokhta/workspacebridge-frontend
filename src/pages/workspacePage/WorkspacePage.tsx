import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Bell,
  Download,
  ExternalLink,
  File,
  Filter,
  Folder,
  Grid3X3,
  Image,
  Link as LinkIcon,
  List,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Moon,
  MoreHorizontal,
  Paperclip,
  Pencil,
  Pin,
  Plus,
  Search,
  Send,
  Settings as SettingsIcon,
  Share2,
  Smile,
  Sun,
  Trash2,
  X,
} from "lucide-react";
import { axiosInstance, useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

// ─── Types ─────────────────────────────────────────────────────────────────

type Tab = "messages" | "files" | "whiteboard" | "shared-links";

interface UserProfile {
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
}

interface WorkspaceMember {
  id: string;
  role: string;
  user: {
    id: string;
    firstname: string | null;
    lastname: string | null;
    email: string;
    picture: string | null;
  };
}

interface WorkspaceDetail extends Workspace {
  status: string;
  ownerId: string;
  members: WorkspaceMember[];
}

interface Message {
  id: number;
  side: "me" | "them";
  name: string;
  mark: string;
  color: string;
  time?: string;
  content?: string;
  attachment?: { name: string; meta: string };
}

interface FileItem {
  id: number;
  name: string;
  kind: string;
  size: string;
  mod: string;
  by: string;
  comments: number;
  color: string;
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

// ─── Static data ────────────────────────────────────────────────────────────

const SEED_MESSAGES: Message[] = [
  { id: 1, side: "them", name: "Sara Olsson", mark: "SO", color: "#7a9bbf", time: "9:42 AM", content: "Just looked at the logo concepts — really excited about direction 2. Could we explore a slightly warmer green? The current one feels a bit clinical." },
  { id: 2, side: "them", name: "Sara Olsson", mark: "SO", color: "#7a9bbf", content: "Also dropped a few reference images in Files — under the moodboard tab." },
  { id: 3, side: "me", name: "MK", mark: "MK", color: "#5a8a6b", time: "10:08 AM", content: "Got it! Pulling some warmer sage tones now. Will send v3 with three variations within the hour." },
  { id: 4, side: "me", name: "MK", mark: "MK", color: "#5a8a6b", attachment: { name: "logo-v3-warm-tones.fig", meta: "14 MB · Figma file" } },
  { id: 5, side: "them", name: "Sara Olsson", mark: "SO", color: "#7a9bbf", time: "10:31 AM", content: "Love variant B. Marking it on the proposal — let's lock the palette and move to applications." },
  { id: 6, side: "me", name: "MK", mark: "MK", color: "#5a8a6b", time: "10:34 AM", content: "Perfect. I'll start the application explorations — typography, photography style, and the icon system. Should have a first pass by Thursday." },
];

const SEED_FILES: FileItem[] = [
  { id: 1, name: "logo-v3-warm-tones.fig", kind: "Figma", size: "14 MB", mod: "10 min ago", by: "Maya", comments: 2, color: "#5a8a6b" },
  { id: 2, name: "Brand guidelines v2.pdf", kind: "PDF", size: "3.4 MB", mod: "2 hours ago", by: "Maya", comments: 0, color: "#c25a4a" },
  { id: 3, name: "Color exploration.png", kind: "Image", size: "1.1 MB", mod: "Yesterday", by: "Sara", comments: 5, color: "#7a9bbf" },
  { id: 4, name: "Moodboard.pdf", kind: "PDF", size: "8.9 MB", mod: "Yesterday", by: "Sara", comments: 3, color: "#c25a4a" },
  { id: 5, name: "Wordmark sketches.fig", kind: "Figma", size: "6.2 MB", mod: "2 days ago", by: "Maya", comments: 1, color: "#5a8a6b" },
  { id: 6, name: "Reference photography", kind: "Folder", size: "12 items", mod: "3 days ago", by: "Sara", comments: 0, color: "#b5803a" },
  { id: 7, name: "Logo concepts v2.fig", kind: "Figma", size: "11 MB", mod: "1 week ago", by: "Maya", comments: 8, color: "#5a8a6b" },
  { id: 8, name: "Contract — signed.pdf", kind: "PDF", size: "180 KB", mod: "3 weeks ago", by: "Sara", comments: 0, color: "#c25a4a" },
];

const SEED_LINKS: SharedLink[] = [];

// ─── Small shared components ─────────────────────────────────────────────────

const FileIcon = ({ kind, color, size = 16 }: { kind: string; color: string; size?: number }) => {
  if (kind === "Folder") return <Folder size={size} style={{ color }} />;
  if (kind === "Image") return <Image size={size} style={{ color }} />;
  return <File size={size} style={{ color }} />;
};

// ─── Messages tab ─────────────────────────────────────────────────────────────

const MessagesTab = ({ initials }: { initials: string }) => {
  const [messages, setMessages] = useState<Message[]>(SEED_MESSAGES);
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const send = () => {
    if (!draft.trim()) return;
    const now = new Date();
    const time = `${now.getHours() % 12 || 12}:${String(now.getMinutes()).padStart(2, "0")} ${now.getHours() >= 12 ? "PM" : "AM"}`;
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), side: "me", name: initials, mark: initials, color: "#5a8a6b", time, content: draft.trim() },
    ]);
    setDraft("");
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col flex-1 overflow-hidden min-h-0">
      {/* Thread */}
      <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
        <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.08em] text-[#858c87] dark:text-[#6e7672]">
          <div className="flex-1 h-px bg-black/[0.06] dark:bg-white/[0.05]" />
          Today · Apr 26
          <div className="flex-1 h-px bg-black/[0.06] dark:bg-white/[0.05]" />
        </div>

        {messages.map((m) => {
          const isMe = m.side === "me";
          return (
            <div key={m.id} className={`flex gap-3 items-end ${isMe ? "flex-row-reverse" : ""}`}>
              <span
                className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold text-white shrink-0"
                style={{ background: m.color }}
              >
                {m.mark}
              </span>
              <div className={`max-w-[62%] flex flex-col gap-1 ${isMe ? "items-end" : "items-start"}`}>
                {(m.name || m.time) && (
                  <div className="flex gap-2 text-[11px] text-[#858c87] dark:text-[#6e7672]">
                    {!isMe && m.name && <span className="font-medium text-[#5a625e] dark:text-[#a0a8a3]">{m.name}</span>}
                    {m.time && <span>{m.time}</span>}
                  </div>
                )}
                {m.content && (
                  <div
                    className={`px-3.5 py-2.5 text-[14px] leading-relaxed ${isMe ? "text-white" : "text-[#1a201c] dark:text-[#e8ece9] bg-white dark:bg-[#151a17] border border-black/[0.07] dark:border-white/[0.06]"}`}
                    style={{
                      background: isMe ? "#5a8a6b" : undefined,
                      borderRadius: 14,
                      borderTopRightRadius: isMe ? 4 : 14,
                      borderTopLeftRadius: isMe ? 14 : 4,
                    }}
                  >
                    {m.content}
                  </div>
                )}
                {m.attachment && (
                  <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#151a17] min-w-[280px]">
                    <div className="w-9 h-9 rounded-lg bg-[#5a8a6b]/10 text-[#5a8a6b] flex items-center justify-center shrink-0">
                      <File size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium text-[#1a201c] dark:text-[#e8ece9] truncate">{m.attachment.name}</div>
                      <div className="text-[11px] text-[#858c87] dark:text-[#6e7672]">{m.attachment.meta}</div>
                    </div>
                    <button className="w-7 h-7 flex items-center justify-center rounded-md text-[#858c87] dark:text-[#6e7672] hover:bg-black/[0.05] dark:hover:bg-white/[0.05]">
                      <Download size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <div className="px-6 pb-5 pt-3 border-t border-black/[0.06] dark:border-white/[0.05]">
        <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-[#151a17] border border-black/[0.08] dark:border-white/[0.07] rounded-xl">
          <button className="w-8 h-8 flex items-center justify-center rounded-lg text-[#858c87] dark:text-[#6e7672] hover:bg-black/[0.05] dark:hover:bg-white/[0.05]">
            <Paperclip size={15} />
          </button>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Reply to Sara…"
            className="flex-1 bg-transparent outline-none text-[14px] text-[#1a201c] dark:text-[#e8ece9] placeholder-[#858c87] dark:placeholder-[#6e7672] py-1.5"
          />
          <button className="w-8 h-8 flex items-center justify-center rounded-lg text-[#858c87] dark:text-[#6e7672] hover:bg-black/[0.05] dark:hover:bg-white/[0.05]">
            <Smile size={15} />
          </button>
          <button
            onClick={send}
            disabled={!draft.trim()}
            className="h-8 px-3.5 flex items-center gap-1.5 rounded-lg bg-[#5a8a6b] hover:bg-[#4f7a5e] text-white text-[12px] font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send size={13} /> Send
          </button>
        </div>
        <div className="mt-2 flex justify-between text-[11px] text-[#b5bbb7] dark:text-[#4a514d]">
          <span>Markdown supported · ⌘+Enter to send</span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6db383]" />
            Sara is typing…
          </span>
        </div>
      </div>
    </div>
  );
};

// ─── Files tab ───────────────────────────────────────────────────────────────

const FilesTab = () => {
  const [view, setView] = useState<"grid" | "list">("grid");

  return (
    <div className="flex flex-col flex-1 overflow-hidden min-h-0">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-black/[0.06] dark:border-white/[0.05]">
        <div className="flex gap-1.5">
          <button className="h-8 px-3 inline-flex items-center gap-1.5 rounded-lg bg-white dark:bg-[#1c221e] border border-black/[0.08] dark:border-white/[0.07] text-[12px] font-medium text-[#1a201c] dark:text-[#e8ece9]">
            <Folder size={13} /> All files
          </button>
          <button className="h-8 px-3 inline-flex items-center rounded-lg text-[12px] text-[#5a625e] dark:text-[#a0a8a3] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors">
            Moodboard
          </button>
          <button className="h-8 px-3 inline-flex items-center rounded-lg text-[12px] text-[#5a625e] dark:text-[#a0a8a3] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors">
            Deliverables
          </button>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex bg-[#f3f3ee] dark:bg-[#1c221e] border border-black/[0.08] dark:border-white/[0.07] rounded-lg p-0.5">
            <button
              onClick={() => setView("grid")}
              className={`w-7 h-7 flex items-center justify-center rounded-md text-[#5a625e] dark:text-[#a0a8a3] transition-colors ${view === "grid" ? "bg-white dark:bg-[#2a342e] text-[#1a201c] dark:text-[#e8ece9]" : "hover:bg-black/[0.04] dark:hover:bg-white/[0.04]"}`}
            >
              <Grid3X3 size={13} />
            </button>
            <button
              onClick={() => setView("list")}
              className={`w-7 h-7 flex items-center justify-center rounded-md text-[#5a625e] dark:text-[#a0a8a3] transition-colors ${view === "list" ? "bg-white dark:bg-[#2a342e] text-[#1a201c] dark:text-[#e8ece9]" : "hover:bg-black/[0.04] dark:hover:bg-white/[0.04]"}`}
            >
              <List size={13} />
            </button>
          </div>
          <button className="h-8 px-3 inline-flex items-center gap-1.5 rounded-lg bg-white dark:bg-[#1c221e] border border-black/[0.08] dark:border-white/[0.07] text-[12px] font-medium text-[#5a625e] dark:text-[#a0a8a3] hover:bg-[#f6f6f1] dark:hover:bg-[#222b26] transition-colors">
            <Filter size={13} /> Filter
          </button>
          <button className="h-8 px-3 inline-flex items-center gap-1.5 rounded-lg bg-[#5a8a6b] hover:bg-[#4f7a5e] text-white text-[12px] font-medium transition-colors">
            <Plus size={13} /> Upload
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 bg-[#fafaf7] dark:bg-[#0e1310]">
        {view === "grid" ? (
          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
            {SEED_FILES.map((f) => (
              <div
                key={f.id}
                className="rounded-xl border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#151a17] overflow-hidden cursor-pointer hover:border-black/[0.14] dark:hover:border-white/[0.14] transition-colors"
              >
                <div className="aspect-[16/10] bg-[#f3f3ee] dark:bg-[#0a0f0c] flex items-center justify-center border-b border-black/[0.06] dark:border-white/[0.05]">
                  <FileIcon kind={f.kind} color={f.color} size={28} />
                </div>
                <div className="p-3.5">
                  <div className="text-[13px] font-medium text-[#1a201c] dark:text-[#e8ece9] truncate mb-1">{f.name}</div>
                  <div className="flex items-center justify-between text-[11px] text-[#858c87] dark:text-[#6e7672]">
                    <span>{f.size} · {f.mod}</span>
                    {f.comments > 0 && (
                      <span className="flex items-center gap-1 text-[#5a8a6b]">
                        <MessageCircle size={10} /> {f.comments}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#151a17] overflow-hidden">
            <div className="grid text-[11px] uppercase tracking-[0.06em] text-[#858c87] dark:text-[#6e7672] px-4 py-2.5 border-b border-black/[0.06] dark:border-white/[0.05]" style={{ gridTemplateColumns: "1fr 90px 90px 130px 80px 40px" }}>
              <span>Name</span><span>Kind</span><span>Size</span><span>Modified</span><span>By</span><span />
            </div>
            {SEED_FILES.map((f) => (
              <div key={f.id} className="grid items-center px-4 py-3 border-b border-black/[0.04] dark:border-white/[0.03] last:border-0 text-[13px] hover:bg-[#f6f6f1] dark:hover:bg-[#1a201c]/30 transition-colors" style={{ gridTemplateColumns: "1fr 90px 90px 130px 80px 40px" }}>
                <span className="flex items-center gap-2.5 min-w-0">
                  <FileIcon kind={f.kind} color={f.color} size={14} />
                  <span className="truncate text-[#1a201c] dark:text-[#e8ece9]">{f.name}</span>
                  {f.comments > 0 && <span className="flex items-center gap-1 text-[#5a8a6b] text-[11px] shrink-0"><MessageCircle size={10} /> {f.comments}</span>}
                </span>
                <span className="text-[#5a625e] dark:text-[#a0a8a3]">{f.kind}</span>
                <span className="text-[#5a625e] dark:text-[#a0a8a3]">{f.size}</span>
                <span className="text-[#5a625e] dark:text-[#a0a8a3]">{f.mod}</span>
                <span className="text-[#5a625e] dark:text-[#a0a8a3]">{f.by}</span>
                <button className="w-7 h-7 flex items-center justify-center rounded-md text-[#858c87] dark:text-[#6e7672] hover:bg-black/[0.05] dark:hover:bg-white/[0.05]">
                  <MoreHorizontal size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Whiteboard tab ───────────────────────────────────────────────────────────

const TOOLS = [
  { id: "select", label: "Select", icon: "↖" },
  { id: "pen", label: "Pen", icon: <Pencil size={15} /> },
  { id: "text", label: "Text", icon: "T" },
  { id: "sticky", label: "Sticky", icon: <File size={15} /> },
  { id: "image", label: "Image", icon: <Image size={15} /> },
];

const WhiteboardTab = () => {
  const [tool, setTool] = useState("select");

  return (
    <div className="flex flex-col flex-1 overflow-hidden min-h-0">
      {/* Topbar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-black/[0.06] dark:border-white/[0.05]">
        <div className="flex items-center gap-3">
          <span className="text-[13px] font-medium text-[#1a201c] dark:text-[#e8ece9]">Brand exploration · Apr 26</span>
          <span className="inline-flex items-center gap-1.5 h-[22px] px-2.5 rounded-full bg-[#5a8a6b]/10 border border-[#5a8a6b]/20 text-[11px] font-medium text-[#3e6a4d] dark:text-[#6db383]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6db383]" />
            2 editing
          </span>
        </div>
        <div className="flex gap-1.5">
          <button className="h-8 px-3 inline-flex items-center gap-1.5 rounded-lg bg-white dark:bg-[#1c221e] border border-black/[0.08] dark:border-white/[0.07] text-[12px] font-medium text-[#5a625e] dark:text-[#a0a8a3] hover:bg-[#f6f6f1] dark:hover:bg-[#222b26] transition-colors">
            <Download size={13} /> Export
          </button>
          <button className="h-8 px-3 inline-flex items-center gap-1.5 rounded-lg bg-[#5a8a6b] hover:bg-[#4f7a5e] text-white text-[12px] font-medium transition-colors">
            <Plus size={13} /> New board
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div
        className="flex-1 relative overflow-hidden bg-[#f3f3ee] dark:bg-[#0a0f0c]"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(90,138,107,0.25) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      >
        {/* Toolbar */}
        <div className="absolute left-4 top-4 bg-white dark:bg-[#151a17] border border-black/[0.08] dark:border-white/[0.07] rounded-xl p-1 flex flex-col gap-0.5 z-10">
          {TOOLS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTool(t.id)}
              title={t.label}
              className={`w-9 h-9 rounded-lg flex items-center justify-center text-[14px] font-medium transition-colors ${
                tool === t.id
                  ? "bg-[#5a8a6b]/10 text-[#5a8a6b]"
                  : "text-[#5a625e] dark:text-[#a0a8a3] hover:bg-black/[0.04] dark:hover:bg-white/[0.04]"
              }`}
            >
              {t.icon}
            </button>
          ))}
        </div>

        {/* Collaborator avatars */}
        <div className="absolute right-4 top-4 bg-white dark:bg-[#151a17] border border-black/[0.08] dark:border-white/[0.07] rounded-full px-1.5 py-1.5 flex items-center z-10">
          <span className="w-7 h-7 rounded-full bg-[#5a8a6b] text-white text-[10px] font-semibold flex items-center justify-center -mr-1.5 border-2 border-white dark:border-[#151a17]">MK</span>
          <span className="w-7 h-7 rounded-full bg-[#7a9bbf] text-white text-[10px] font-semibold flex items-center justify-center border-2 border-white dark:border-[#151a17]">SO</span>
        </div>

        {/* Sticky notes */}
        <StickyNote x={120} y={80} color="#5a8a6b" rotate={-2}>
          <div className="text-[10px] opacity-80 mb-1.5 uppercase tracking-wide">Brand essence</div>
          <div className="text-[13px] font-semibold">Considered, not corporate</div>
        </StickyNote>
        <StickyNote x={340} y={140} color="#b5803a" rotate={1}>
          <div className="text-[10px] opacity-80 mb-1.5 uppercase tracking-wide">Voice</div>
          <div className="text-[13px] font-semibold">Quiet confidence. Plain English.</div>
        </StickyNote>
        <StickyNote x={560} y={90} color="#7a9bbf" rotate={-1}>
          <div className="text-[10px] opacity-80 mb-1.5 uppercase tracking-wide">Avoid</div>
          <div className="text-[13px] font-semibold">Overly green / "wellness" tropes</div>
        </StickyNote>

        {/* Frame */}
        <div className="absolute bg-white dark:bg-[#151a17] border border-black/[0.08] dark:border-white/[0.07] rounded-xl p-6" style={{ left: 100, top: 290, width: 480 }}>
          <div className="text-[11px] uppercase tracking-[0.08em] text-[#858c87] dark:text-[#6e7672] mb-3">Logo direction · Variant B</div>
          <div className="grid grid-cols-3 gap-3">
            {["#5a8a6b", "#6a9579", "#7da388"].map((c, i) => (
              <div key={i} className="aspect-square rounded-xl flex items-center justify-center text-white text-3xl font-semibold tracking-tight" style={{ background: c }}>N</div>
            ))}
          </div>
          <div className="mt-3.5 text-[12px] text-[#5a625e] dark:text-[#a0a8a3]">Sage progression — neutral → warm</div>
        </div>

        {/* Comment pin */}
        <div className="absolute" style={{ left: 620, top: 350 }}>
          <div className="w-7 h-7 rounded-full rounded-bl-sm bg-[#5a8a6b] text-white text-[11px] font-semibold flex items-center justify-center shadow-md">1</div>
          <div className="mt-2 ml-3 bg-white dark:bg-[#151a17] border border-black/[0.08] dark:border-white/[0.07] rounded-xl p-3 w-52">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-6 h-6 rounded-full bg-[#7a9bbf] text-white text-[10px] font-semibold flex items-center justify-center">SO</span>
              <span className="text-[12px] font-medium text-[#1a201c] dark:text-[#e8ece9]">Sara</span>
              <span className="text-[11px] text-[#858c87] dark:text-[#6e7672] ml-auto">2m</span>
            </div>
            <p className="text-[12px] text-[#5a625e] dark:text-[#a0a8a3] leading-relaxed">Middle one feels right — let's go with this.</p>
          </div>
        </div>

        {/* Arrow */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <path d="M 280 185 Q 350 240, 380 300" stroke="#5a8a6b" strokeWidth="2" fill="none" strokeDasharray="4,4" />
          <circle cx="380" cy="300" r="3" fill="#5a8a6b" />
        </svg>
      </div>
    </div>
  );
};

const StickyNote = ({
  x, y, color, rotate, children,
}: {
  x: number; y: number; color: string; rotate: number; children: React.ReactNode;
}) => (
  <div
    className="absolute p-3.5 text-white rounded-lg z-[2] shadow-md w-44"
    style={{ left: x, top: y, background: color, transform: `rotate(${rotate}deg)` }}
  >
    {children}
  </div>
);

// ─── Shared Links tab ─────────────────────────────────────────────────────────

const AddLinkModal = ({
  onAdd,
  onClose,
}: {
  onAdd: (link: SharedLink) => void;
  onClose: () => void;
}) => {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md bg-white dark:bg-[#151a17] border border-black/[0.08] dark:border-white/[0.07] rounded-2xl p-7 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[18px] font-semibold text-[#1a201c] dark:text-[#e8ece9]">Add a link</h3>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-[#858c87] dark:text-[#6e7672] hover:bg-black/[0.05] dark:hover:bg-white/[0.05]">
            <X size={14} />
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-[12px] font-medium text-[#5a625e] dark:text-[#a0a8a3] mb-1.5">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Brand mockups v3"
              autoFocus
              className="w-full h-[42px] px-3.5 rounded-lg border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#1c221e] text-[13px] text-[#1a201c] dark:text-[#e8ece9] outline-none focus:border-[#5a8a6b] focus:ring-2 focus:ring-[#5a8a6b]/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-[#5a625e] dark:text-[#a0a8a3] mb-1.5">URL</label>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="figma.com/file/…"
              className="w-full h-[42px] px-3.5 rounded-lg border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#1c221e] text-[13px] text-[#1a201c] dark:text-[#e8ece9] outline-none focus:border-[#5a8a6b] focus:ring-2 focus:ring-[#5a8a6b]/20 transition-all"
            />
          </div>
        </div>
        <div className="flex gap-2.5 mt-6">
          <button onClick={onClose} className="flex-1 h-10 rounded-lg border border-black/[0.08] dark:border-white/[0.07] text-[13px] font-medium text-[#5a625e] dark:text-[#a0a8a3] hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-colors">
            Cancel
          </button>
          <button
            disabled={!title.trim() || !url.trim()}
            onClick={() => {
              onAdd({ id: Date.now(), title: title.trim(), url: url.trim(), kind: "Link", by: "You", added: "Just now", color: "#5a8a6b" });
              onClose();
            }}
            className="flex-[2] h-10 rounded-lg bg-[#5a8a6b] hover:bg-[#4f7a5e] text-white text-[13px] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add link
          </button>
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
        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-black/[0.06] dark:border-white/[0.05]">
          <span className="text-[13px] text-[#5a625e] dark:text-[#a0a8a3]">
            {links.length} links · visible to all workspace members
          </span>
          <button
            onClick={() => setShowModal(true)}
            className="h-8 px-3 inline-flex items-center gap-1.5 rounded-lg bg-[#5a8a6b] hover:bg-[#4f7a5e] text-white text-[12px] font-medium transition-colors"
          >
            <Plus size={13} /> Add link
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-2.5 bg-[#fafaf7] dark:bg-[#0e1310]">
          {links.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#5a8a6b]/10 flex items-center justify-center text-[#5a8a6b]">
                <Pin size={22} />
              </div>
              <div>
                <h3 className="text-[17px] font-semibold text-[#1a201c] dark:text-[#e8ece9] mb-1">No links yet</h3>
                <p className="text-[13px] text-[#5a625e] dark:text-[#a0a8a3] max-w-xs">Add Figma files, staging sites, or any URL your client needs access to.</p>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="mt-1 h-9 px-4 inline-flex items-center gap-1.5 rounded-lg bg-[#5a8a6b] hover:bg-[#4f7a5e] text-white text-[13px] font-medium transition-colors"
              >
                <Plus size={13} /> Add first link
              </button>
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
                  <div className="text-[11px] text-[#b5bbb7] dark:text-[#4a514d] mt-1">{l.kind} · Added by {l.by} · {l.added}</div>
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
                    onClick={() => setLinks((prev) => prev.filter((x) => x.id !== l.id))}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-[#858c87] dark:text-[#6e7672] hover:bg-[#c25a4a]/10 hover:text-[#c25a4a] dark:hover:text-[#e07b6b] transition-colors"
                  >
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

const TABS: { id: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
  { id: "messages", label: "Messages", icon: <MessageCircle size={14} />, count: 3 },
  { id: "files", label: "Files", icon: <File size={14} />, count: 12 },
  { id: "whiteboard", label: "Whiteboard", icon: <Pencil size={14} /> },
  { id: "shared-links", label: "Shared Links", icon: <LinkIcon size={14} /> },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export const WorkspacePage = () => {
  const { id = "northwind" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setAccessToken } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [tab, setTab] = useState<Tab>("messages");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [workspace, setWorkspace] = useState<WorkspaceDetail | null>(null);

  useEffect(() => {
    axiosInstance.get<UserProfile>("/user/me").catch(() => navigate("/login")).then((r) => r && setProfile(r.data));
    axiosInstance.get<Workspace[]>("/workspace").then((r) => setWorkspaces(r.data)).catch(() => navigate("/login"));
    axiosInstance.get<WorkspaceDetail>(`/workspace/${id}`).then((r) => setWorkspace(r.data)).catch(() => navigate("/login"));
  }, [id, navigate]);

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

  return (
    <div className="h-screen grid lg:grid-cols-[248px_1fr] bg-[#fafaf7] dark:bg-[#0e1310] overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col bg-[#f3f3ee] dark:bg-[#0a0f0c] border-r border-black/[0.06] dark:border-white/[0.05] overflow-hidden">
        {/* Logo */}
        <div className="flex items-center justify-between px-4 pt-[18px] pb-3">
          <Link to="/dashboard" className="flex items-center gap-2 text-[14px] font-semibold tracking-[-0.02em] text-[#1a201c] dark:text-[#e8ece9]">
            <span className="w-[22px] h-[22px] rounded-[6px] bg-[#5a8a6b] text-white flex items-center justify-center">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </span>
            WorkspaceBridge
          </Link>
          <button className="w-7 h-7 flex items-center justify-center rounded-md text-[#858c87] dark:text-[#6e7672] hover:bg-black/[0.05] dark:hover:bg-white/[0.05]" title="Search">
            <Search size={14} />
          </button>
        </div>

        {/* Search */}
        <div className="px-3">
          <div className="flex items-center gap-2 px-2.5 py-2 bg-white dark:bg-[#151a17] border border-black/[0.08] dark:border-white/[0.07] rounded-lg text-[#858c87] dark:text-[#6e7672] text-[12px]">
            <Search size={13} />
            <span>Search workspaces</span>
            <span className="ml-auto font-mono text-[10px] text-[#b5bbb7] dark:text-[#4a514d]">⌘K</span>
          </div>
        </div>

        {/* Workspaces header */}
        <div className="px-3 pt-2 pb-1 flex items-center justify-between">
          <div className="text-[11px] uppercase tracking-[0.08em] font-medium text-[#858c87] dark:text-[#6e7672]">Workspaces</div>
          <button onClick={() => navigate("/onboarding")} className="text-[#5a625e] dark:text-[#a0a8a3] hover:text-[#1a201c] dark:hover:text-[#e8ece9]" title="New workspace">
            <Plus size={14} />
          </button>
        </div>

        {/* Workspace list */}
        <div className="px-2 flex-1 overflow-y-auto">
          {workspaces.length === 0 && (
            <button onClick={() => navigate("/onboarding")} className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[12px] text-[#5a8a6b] hover:bg-[#5a8a6b]/10 transition-colors">
              <Plus size={13} /> New workspace
            </button>
          )}
          {workspaces.map((w) => (
            <button
              key={w.id}
              onClick={() => navigate(`/workspace/${w.id}`)}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] transition-colors ${
                w.id === id
                  ? "bg-[#5a8a6b]/10 text-[#1a201c] dark:text-[#e8ece9]"
                  : "text-[#5a625e] dark:text-[#a0a8a3] hover:bg-black/[0.04] dark:hover:bg-white/[0.04]"
              }`}
            >
              <span className="w-[22px] h-[22px] rounded-md flex items-center justify-center text-[10px] font-semibold text-white shrink-0" style={{ background: w.color }}>
                {w.name[0].toUpperCase()}
              </span>
              <span className="flex flex-col min-w-0 flex-1 text-left">
                <span className="font-medium truncate">{w.name}</span>
                {w.description && <span className="text-[11px] text-[#858c87] dark:text-[#6e7672] truncate">{w.description}</span>}
              </span>
              {w.id === id && <span className="w-1.5 h-1.5 rounded-full bg-[#5a8a6b] shrink-0" />}
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="px-3 py-3 border-t border-black/[0.06] dark:border-white/[0.05]">
          <Link
            to="/dashboard"
            className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] text-[#5a625e] dark:text-[#a0a8a3] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] hover:text-[#1a201c] dark:hover:text-[#e8ece9] transition-colors mb-0.5"
          >
            <span className="w-[22px] h-[22px] rounded-md flex items-center justify-center bg-[#f3f3ee] dark:bg-[#1c221e] text-[#5a625e] dark:text-[#a0a8a3] shrink-0">
              <LayoutDashboard size={12} />
            </span>
            <span className="font-medium">Dashboard</span>
          </Link>
          <Link
            to="/profile"
            className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] text-[#5a625e] dark:text-[#a0a8a3] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] hover:text-[#1a201c] dark:hover:text-[#e8ece9] transition-colors mb-0.5"
          >
            <span className="w-[22px] h-[22px] rounded-md flex items-center justify-center bg-[#f3f3ee] dark:bg-[#1c221e] text-[#5a625e] dark:text-[#a0a8a3] shrink-0">
              <SettingsIcon size={12} />
            </span>
            <span className="font-medium">Settings</span>
          </Link>
          <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px]">
            <span className="w-[22px] h-[22px] rounded-full flex items-center justify-center bg-[#5a8a6b] text-white text-[10px] font-semibold shrink-0">
              {getInitials()}
            </span>
            <span className="flex flex-col min-w-0 flex-1">
              <span className="font-medium text-[#1a201c] dark:text-[#e8ece9] truncate">
                {profile?.firstname || profile?.lastname
                  ? `${profile?.firstname ?? ""} ${profile?.lastname ?? ""}`.trim()
                  : profile?.email ?? ""}
              </span>
              <span className="text-[11px] text-[#858c87] dark:text-[#6e7672]">Free plan</span>
            </span>
            <button
              onClick={handleLogout}
              title="Sign out"
              className="shrink-0 w-[22px] h-[22px] flex items-center justify-center rounded-md text-[#858c87] dark:text-[#6e7672] hover:bg-black/[0.06] dark:hover:bg-white/[0.06] hover:text-[#c25a4a] dark:hover:text-[#e07b6b] transition-colors"
            >
              <LogOut size={13} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-col overflow-hidden min-w-0">
        {/* Topbar */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-black/[0.06] dark:border-white/[0.05] bg-[#fafaf7] dark:bg-[#0e1310]">
          <div>
            <div className="text-[11px] uppercase tracking-[0.08em] font-medium text-[#858c87] dark:text-[#6e7672]">Workspace</div>
            <div className="text-[16px] font-semibold mt-0.5 text-[#1a201c] dark:text-[#e8ece9]">{workspace?.name ?? "…"}</div>
          </div>
          <div className="flex items-center gap-2">
            <button className="h-8 px-3 inline-flex items-center gap-1.5 rounded-lg bg-white dark:bg-[#1c221e] border border-black/[0.08] dark:border-white/[0.07] text-[12px] font-medium text-[#5a625e] dark:text-[#a0a8a3] hover:bg-[#f6f6f1] dark:hover:bg-[#222b26] transition-colors">
              <Share2 size={13} /> Share
            </button>
            <button
              onClick={toggleTheme}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#1c221e] text-[#5a625e] dark:text-[#a0a8a3] hover:bg-[#f6f6f1] dark:hover:bg-[#222b26] transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#1c221e] text-[#5a625e] dark:text-[#a0a8a3] hover:bg-[#f6f6f1] dark:hover:bg-[#222b26] transition-colors" aria-label="Notifications">
              <Bell size={14} />
            </button>
            {profile?.picture ? (
              <img src={profile.picture} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#5a8a6b] text-white flex items-center justify-center text-[12px] font-medium">
                {getInitials()}
              </div>
            )}
          </div>
        </header>

        {/* Tab bar */}
        <div className="flex items-center border-b border-black/[0.06] dark:border-white/[0.05] bg-[#fafaf7] dark:bg-[#0e1310] px-6">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 h-11 px-1 mr-5 text-[13px] font-medium border-b-2 transition-colors ${
                tab === t.id
                  ? "border-[#5a8a6b] text-[#1a201c] dark:text-[#e8ece9]"
                  : "border-transparent text-[#5a625e] dark:text-[#a0a8a3] hover:text-[#1a201c] dark:hover:text-[#e8ece9]"
              }`}
            >
              {t.icon}
              {t.label}
              {t.count != null && (
                <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-medium ${tab === t.id ? "bg-[#5a8a6b]/10 text-[#5a8a6b]" : "bg-black/[0.06] dark:bg-white/[0.06] text-[#858c87] dark:text-[#6e7672]"}`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex flex-col flex-1 overflow-hidden min-h-0">
          {tab === "messages" && <MessagesTab initials={getInitials()} />}
          {tab === "files" && <FilesTab />}
          {tab === "whiteboard" && <WhiteboardTab />}
          {tab === "shared-links" && <SharedLinksTab />}
        </div>
      </div>
    </div>
  );
};
