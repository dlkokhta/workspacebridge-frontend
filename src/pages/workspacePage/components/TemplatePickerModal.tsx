import {
  useEffect,
  useState,
  type KeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { createPortal } from "react-dom";
import {
  Brain,
  Calendar,
  Columns3,
  Database,
  GitMerge,
  Grid2x2,
  LayoutDashboard,
  Lightbulb,
  type LucideIcon,
  Network,
  Palette,
  RefreshCcw,
  Square,
  StickyNote,
  Users,
  Webhook,
  Workflow,
  X,
} from "lucide-react";
import {
  TEMPLATE_CATEGORIES,
  WHITEBOARD_TEMPLATES,
  type WhiteboardTemplate,
  type WhiteboardTemplateCategory,
} from "./whiteboardTemplates";

interface TemplatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (template: WhiteboardTemplate, name: string) => Promise<void> | void;
  creating?: boolean;
}

const TEMPLATE_ICONS: Record<string, LucideIcon> = {
  blank: Square,
  brainstorm: Brain,
  "sticky-notes": StickyNote,
  "mood-board": Palette,
  kanban: Columns3,
  timeline: Calendar,
  matrix: Grid2x2,
  retro: RefreshCcw,
  flowchart: Workflow,
  "user-journey": Users,
  wireframe: LayoutDashboard,
  "system-architecture": Network,
  "database-schema": Database,
  "api-sequence": Webhook,
  "state-machine": GitMerge,
};

const DEFAULT_NAME = "Untitled board";

const groupByCategory = (): Record<
  WhiteboardTemplateCategory,
  WhiteboardTemplate[]
> => {
  const groups = {
    "Quick start": [],
    Ideation: [],
    "Planning & tracking": [],
    "Process & UX": [],
    Developer: [],
  } as Record<WhiteboardTemplateCategory, WhiteboardTemplate[]>;
  for (const template of WHITEBOARD_TEMPLATES) {
    groups[template.category].push(template);
  }
  return groups;
};

export const TemplatePickerModal = ({
  isOpen,
  onClose,
  onCreate,
  creating = false,
}: TemplatePickerModalProps) => {
  const [selectedId, setSelectedId] = useState<string>("blank");
  const [name, setName] = useState<string>(DEFAULT_NAME);

  useEffect(() => {
    if (!isOpen) return;
    setSelectedId("blank");
    setName(DEFAULT_NAME);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const selected = WHITEBOARD_TEMPLATES.find((t) => t.id === selectedId);
  const grouped = groupByCategory();

  const handleBackdropClick = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !creating) onClose();
  };

  const handleSubmit = async () => {
    if (!selected || creating) return;
    const finalName = name.trim() || DEFAULT_NAME;
    await onCreate(selected, finalName);
  };

  const handleNameKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      void handleSubmit();
    }
  };

  return createPortal(
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
    >
      <div className="w-full max-w-[820px] max-h-[88vh] flex flex-col rounded-lg border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#1a201c] shadow-xl overflow-hidden">
        <div className="flex items-start justify-between px-6 py-4 border-b border-black/[0.06] dark:border-white/[0.05]">
          <div>
            <h2 className="text-[16px] font-medium text-[#1a201c] dark:text-[#fafaf7]">
              Choose a template
            </h2>
            <p className="mt-0.5 text-[12px] text-[#858c87] dark:text-[#6e7672]">
              Start fresh or pick a layout to kickstart your board.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            disabled={creating}
            className="h-8 w-8 inline-flex items-center justify-center rounded-md text-[#5a625e] dark:text-[#a0a8a3] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] cursor-pointer disabled:opacity-50"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {TEMPLATE_CATEGORIES.map((category) => {
            const items = grouped[category];
            if (items.length === 0) return null;
            return (
              <section key={category} className="mb-5 last:mb-0">
                <h3 className="mb-2 text-[11px] uppercase tracking-wider font-semibold text-[#858c87] dark:text-[#6e7672]">
                  {category}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                  {items.map((template) => {
                    const Icon = TEMPLATE_ICONS[template.id] ?? Square;
                    const isSelected = template.id === selectedId;
                    return (
                      <button
                        key={template.id}
                        onClick={() => setSelectedId(template.id)}
                        className={`flex flex-col items-start gap-1.5 p-3 rounded-md border text-left transition-colors cursor-pointer ${
                          isSelected
                            ? "border-[#5a8a6b] bg-[#5a8a6b]/[0.08] dark:bg-[#5a8a6b]/[0.15]"
                            : "border-black/[0.08] dark:border-white/[0.07] hover:bg-black/[0.03] dark:hover:bg-white/[0.03]"
                        }`}
                      >
                        <Icon
                          size={20}
                          className={
                            isSelected
                              ? "text-[#5a8a6b]"
                              : "text-[#5a625e] dark:text-[#a0a8a3]"
                          }
                        />
                        <span className="text-[13px] font-medium text-[#1a201c] dark:text-[#fafaf7]">
                          {template.name}
                        </span>
                        <span className="text-[11px] leading-snug text-[#858c87] dark:text-[#6e7672]">
                          {template.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        <div className="flex items-center gap-3 px-6 py-4 border-t border-black/[0.06] dark:border-white/[0.05] bg-black/[0.015] dark:bg-white/[0.015]">
          <label className="text-[12px] font-medium text-[#5a625e] dark:text-[#a0a8a3]">
            Board name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleNameKeyDown}
            maxLength={100}
            placeholder={DEFAULT_NAME}
            disabled={creating}
            className="flex-1 h-8 px-3 rounded-md border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#1a201c] text-[13px] text-[#1a201c] dark:text-[#fafaf7] placeholder:text-[#858c87] dark:placeholder:text-[#6e7672] outline-none focus:border-[#5a8a6b] disabled:opacity-50"
          />
          <button
            onClick={onClose}
            disabled={creating}
            className="h-8 px-3 rounded-md text-[12px] font-medium text-[#5a625e] dark:text-[#a0a8a3] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => void handleSubmit()}
            disabled={creating || !selected}
            className="h-8 px-4 rounded-md text-[12px] font-medium bg-[#5a8a6b] text-white hover:bg-[#4d7a5d] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creating ? "Creating…" : "Create"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};
