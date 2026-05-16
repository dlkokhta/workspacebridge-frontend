import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import { Save, X } from "lucide-react";

interface WhiteboardSaveVersionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (label: string) => Promise<void>;
}

export const WhiteboardSaveVersionDialog = ({
  isOpen,
  onClose,
  onSave,
}: WhiteboardSaveVersionDialogProps) => {
  const [label, setLabel] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setLabel("");
    setError(null);
    setSaving(false);
    const id = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(id);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape" && !saving) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose, saving]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (saving) return;
    setSaving(true);
    setError(null);
    try {
      await onSave(label.trim());
      onClose();
    } catch {
      setError("Could not save version. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      void handleSubmit();
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !saving) onClose();
      }}
    >
      <div className="w-full max-w-[420px] rounded-lg border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#1a201c] shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-black/[0.06] dark:border-white/[0.05]">
          <div className="inline-flex items-center gap-2">
            <Save size={14} className="text-[#5a625e] dark:text-[#a0a8a3]" />
            <h2 className="text-[14px] font-medium text-[#1a201c] dark:text-[#fafaf7]">
              Save current version
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={saving}
            aria-label="Close"
            className="h-7 w-7 inline-flex items-center justify-center rounded-md text-[#5a625e] dark:text-[#a0a8a3] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] cursor-pointer disabled:opacity-50"
          >
            <X size={14} />
          </button>
        </div>

        <div className="px-4 py-3 space-y-2">
          <label className="block text-[12px] font-medium text-[#5a625e] dark:text-[#a0a8a3]">
            Label (optional)
          </label>
          <input
            ref={inputRef}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onKeyDown={onKeyDown}
            maxLength={120}
            disabled={saving}
            placeholder="e.g. Before client review"
            className="w-full h-9 px-3 rounded-md border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#1a201c] text-[13px] text-[#1a201c] dark:text-[#fafaf7] placeholder:text-[#858c87] dark:placeholder:text-[#6e7672] outline-none focus:border-[#5a8a6b] disabled:opacity-50"
          />
          <p className="text-[11px] text-[#858c87] dark:text-[#6e7672]">
            Snapshots the current scene. You can restore it later from the
            history panel.
          </p>
          {error && (
            <p className="text-[12px] text-[#c25a4a]">{error}</p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-black/[0.06] dark:border-white/[0.05] bg-black/[0.015] dark:bg-white/[0.015]">
          <button
            onClick={onClose}
            disabled={saving}
            className="h-8 px-3 rounded-md text-[12px] font-medium text-[#5a625e] dark:text-[#a0a8a3] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => void handleSubmit()}
            disabled={saving}
            className="h-8 px-4 rounded-md text-[12px] font-medium bg-[#5a8a6b] text-white hover:bg-[#4d7a5d] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving…" : "Save version"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};
