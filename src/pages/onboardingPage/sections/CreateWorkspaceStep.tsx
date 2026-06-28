import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { axiosInstance } from "../../../context/AuthContext";
import { workspacesKey } from "../../../hooks/useWorkspaces";
import { extractApiMessage } from "../utils/extractApiMessage";

const COLORS = ["#5a8a6b", "#7a9bbf", "#b5803a", "#9a7ab8", "#c25a4a", "#4f7aa3"];

interface CreateWorkspaceStepProps {
  /**
   * Set only if the workspace was already persisted earlier in this flow
   * (e.g. the user generated an invite link on step 2, then came back). It is
   * `null` on a fresh run — the workspace is not created here, only on a
   * committing action in step 2.
   */
  workspaceId: string | null;
  initialName: string;
  initialDescription: string;
  initialColor: string;
  onComplete: (workspace: {
    name: string;
    description: string;
    color: string;
  }) => void;
}

export const CreateWorkspaceStep = ({
  workspaceId,
  initialName,
  initialDescription,
  initialColor,
  onComplete,
}: CreateWorkspaceStepProps) => {
  const queryClient = useQueryClient();
  const [name, setName] = useState(initialName);
  const [desc, setDesc] = useState(initialDescription);
  const [color, setColor] = useState(initialColor || COLORS[0]);
  const [error, setError] = useState<string | null>(null);

  // Only used in the edge case where the workspace already exists and the user
  // came back to edit it — syncs the changes. A fresh run never hits the API
  // here; persistence is deferred to step 2.
  const updateMutation = useMutation({
    mutationFn: async (vars: {
      name: string;
      description?: string;
      color: string;
    }) => {
      await axiosInstance.patch(`/workspace/${workspaceId}`, vars);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspacesKey });
    },
  });

  const handleContinue = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setError(null);
    const trimmedDesc = desc.trim();
    if (workspaceId) {
      try {
        await updateMutation.mutateAsync({
          name: trimmed,
          description: trimmedDesc || undefined,
          color,
        });
      } catch (err: unknown) {
        setError(
          extractApiMessage(err) ??
            "Failed to save changes. Please try again.",
        );
        return;
      }
    }
    onComplete({ name: trimmed, description: trimmedDesc, color });
  };

  const saving = updateMutation.isPending;

  return (
    <div>
      <span className="block text-[11px] uppercase tracking-[0.08em] font-medium text-[#5a8a6b] mb-3">
        Step 1 · Workspace
      </span>
      <h1 className="text-[32px] font-semibold tracking-[-0.025em] text-[#1a201c] dark:text-[#e8ece9] mb-2">
        Create a workspace
      </h1>
      <p className="text-[15px] text-[#5a625e] dark:text-[#a0a8a3] mb-7">
        One workspace per client project. You can rename or archive it later.
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-[12px] font-medium text-[#5a625e] dark:text-[#a0a8a3] mb-1.5">
            Workspace name
          </label>
          <input
            type="text"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && name.trim()) handleContinue();
            }}
            placeholder="e.g. Northwind Studio"
            className="w-full h-[42px] px-3.5 rounded-lg border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#151a17] text-[14px] text-[#1a201c] dark:text-[#e8ece9] placeholder-[#858c87] dark:placeholder-[#6e7672] outline-none hover:border-black/[0.14] dark:hover:border-white/[0.14] focus:border-[#5a8a6b] focus:ring-2 focus:ring-[#5a8a6b]/20 transition-all"
          />
        </div>

        <div>
          <label className="block text-[12px] font-medium text-[#5a625e] dark:text-[#a0a8a3] mb-1.5">
            Project description{" "}
            <span className="font-normal opacity-60">(optional)</span>
          </label>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Brand identity · Q3 2026"
            rows={2}
            className="w-full px-3.5 py-2.5 rounded-lg border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#151a17] text-[14px] text-[#1a201c] dark:text-[#e8ece9] placeholder-[#858c87] dark:placeholder-[#6e7672] outline-none hover:border-black/[0.14] dark:hover:border-white/[0.14] focus:border-[#5a8a6b] focus:ring-2 focus:ring-[#5a8a6b]/20 transition-all resize-none"
          />
        </div>

        <div>
          <label className="block text-[12px] font-medium text-[#5a625e] dark:text-[#a0a8a3] mb-2">
            Color
          </label>
          <div className="flex gap-2">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className="w-8 h-8 rounded-lg transition-all cursor-pointer"
                style={{
                  background: c,
                  outline:
                    color === c ? `2px solid ${c}` : "2px solid transparent",
                  outlineOffset: 2,
                }}
                aria-label={c}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Preview pill */}
      {name.trim() && (
        <div className="mt-5 flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#151a17] w-fit">
          <span
            className="w-[22px] h-[22px] rounded-md flex items-center justify-center text-[10px] font-semibold text-white shrink-0"
            style={{ background: color }}
          >
            {name.trim()[0].toUpperCase()}
          </span>
          <div className="flex flex-col">
            <span className="text-[13px] font-medium text-[#1a201c] dark:text-[#e8ece9]">
              {name.trim()}
            </span>
            {desc.trim() && (
              <span className="text-[11px] text-[#858c87] dark:text-[#6e7672]">
                {desc.trim()}
              </span>
            )}
          </div>
        </div>
      )}

      {error && <p className="mt-4 text-[13px] text-red-500">{error}</p>}
      <button
        onClick={handleContinue}
        disabled={!name.trim() || saving}
        className="w-full h-11 mt-6 flex items-center justify-center gap-2 rounded-lg bg-[#5a8a6b] hover:bg-[#4f7a5e] active:bg-[#446b52] text-white text-[14px] font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      >
        {saving ? (
          "Saving…"
        ) : (
          <>
            Continue <ArrowRight size={15} />
          </>
        )}
      </button>
    </div>
  );
};
