import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { axiosInstance } from "../../../context/AuthContext";
import { workspacesKey } from "../../../hooks/useWorkspaces";
import { extractApiMessage } from "../utils/extractApiMessage";

const COLORS = ["#5a8a6b", "#7a9bbf", "#b5803a", "#9a7ab8", "#c25a4a", "#4f7aa3"];

interface CreateWorkspaceStepProps {
  onComplete: (workspace: { id: string; name: string }) => void;
}

export const CreateWorkspaceStep = ({ onComplete }: CreateWorkspaceStepProps) => {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [error, setError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: async (vars: {
      name: string;
      description?: string;
      color: string;
    }) => {
      const { data } = await axiosInstance.post<{ id: string }>(
        "/workspace",
        vars,
      );
      return data;
    },
    onSuccess: () => {
      // Refresh the dashboard sidebar so the new workspace shows up
      // immediately on navigation back.
      queryClient.invalidateQueries({ queryKey: workspacesKey });
    },
  });

  const handleCreate = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setError(null);
    try {
      const data = await createMutation.mutateAsync({
        name: trimmed,
        description: desc.trim() || undefined,
        color,
      });
      onComplete({ id: data.id, name: trimmed });
    } catch (err: unknown) {
      setError(
        extractApiMessage(err) ?? "Failed to create workspace. Please try again.",
      );
    }
  };

  const creating = createMutation.isPending;

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
              if (e.key === "Enter" && name.trim()) handleCreate();
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
        onClick={handleCreate}
        disabled={!name.trim() || creating}
        className="w-full h-11 mt-6 flex items-center justify-center gap-2 rounded-lg bg-[#5a8a6b] hover:bg-[#4f7a5e] active:bg-[#446b52] text-white text-[14px] font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      >
        {creating ? (
          "Creating…"
        ) : (
          <>
            Continue <ArrowRight size={15} />
          </>
        )}
      </button>
    </div>
  );
};
