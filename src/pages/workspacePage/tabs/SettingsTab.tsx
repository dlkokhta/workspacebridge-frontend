import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../../context/AuthContext";
import { workspaceDetailKey } from "../../../hooks/useWorkspaceDetail";
import { workspacesKey, type Workspace } from "../../../hooks/useWorkspaces";
import type { WorkspaceDetail, WorkspaceMember } from "../types";

interface SettingsTabProps {
  workspace: WorkspaceDetail;
}

const extractApiMessage = (err: unknown): string | null => {
  return (
    (err as { response?: { data?: { message?: string } } })?.response?.data
      ?.message ?? null
  );
};

const Row = ({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) => (
  <div className="flex items-start justify-between gap-6 py-5 border-b border-black/[0.06] dark:border-white/[0.05]">
    <div className="flex-1">
      <div className="text-[14px] font-medium text-[#1a201c] dark:text-[#e8ece9] mb-1">{title}</div>
      {desc && <div className="text-[13px] text-[#5a625e] dark:text-[#a0a8a3] leading-[1.5] max-w-[380px]">{desc}</div>}
    </div>
    <div className="flex items-center gap-2 shrink-0">{children}</div>
  </div>
);

export const SettingsTab = ({ workspace }: SettingsTabProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [name, setName] = useState(workspace.name);
  const [description, setDescription] = useState(workspace.description ?? "");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const saveMutation = useMutation({
    mutationFn: async (vars: { name: string; description: string }) => {
      const { data } = await axiosInstance.patch<WorkspaceDetail>(
        `/workspace/${workspace.id}`,
        vars,
      );
      return data;
    },
    onSuccess: (updated) => {
      // Refresh the detail cache + sync the sidebar list (workspace name +
      // description show up there too).
      queryClient.setQueryData(workspaceDetailKey(workspace.id), updated);
      queryClient.setQueryData<Workspace[]>(workspacesKey, (prev) =>
        prev?.map((w) =>
          w.id === workspace.id
            ? { ...w, name: updated.name, description: updated.description }
            : w,
        ),
      );
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await axiosInstance.delete(`/workspace/${workspace.id}`);
    },
    onSuccess: () => {
      queryClient.setQueryData<Workspace[]>(workspacesKey, (prev) =>
        prev?.filter((w) => w.id !== workspace.id),
      );
      queryClient.removeQueries({ queryKey: workspaceDetailKey(workspace.id) });
      navigate("/dashboard");
    },
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    setSaveSuccess(false);
    try {
      await saveMutation.mutateAsync({ name, description });
    } catch (err: unknown) {
      setSaveError(extractApiMessage(err) ?? "Failed to save changes");
    }
  };

  const handleDelete = async () => {
    setDeleteError(null);
    try {
      await deleteMutation.mutateAsync();
    } catch (err: unknown) {
      setDeleteError(extractApiMessage(err) ?? "Failed to delete workspace");
    }
  };

  const saving = saveMutation.isPending;
  const deleting = deleteMutation.isPending;

  const clients = workspace.members.filter((m: WorkspaceMember) => m.role === "CLIENT");

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-[640px]">
        <h2 className="text-[24px] font-semibold tracking-[-0.02em] mb-1.5 text-[#1a201c] dark:text-[#e8ece9]">
          Workspace Settings
        </h2>
        <p className="text-[14px] text-[#5a625e] dark:text-[#a0a8a3] mb-6">
          Manage this workspace's details and membership.
        </p>

        <form onSubmit={handleSave}>
          <Row title="Workspace name">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-[240px] h-[42px] px-3.5 rounded-lg border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#151a17] text-[13px] text-[#1a201c] dark:text-[#e8ece9] outline-none hover:border-black/[0.14] dark:hover:border-white/[0.14] focus:border-[#5a8a6b] focus:ring-2 focus:ring-[#5a8a6b]/20 transition-all"
            />
          </Row>
          <Row title="Description">
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description…"
              className="w-[240px] h-[42px] px-3.5 rounded-lg border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#151a17] text-[13px] text-[#1a201c] dark:text-[#e8ece9] placeholder-[#858c87] outline-none hover:border-black/[0.14] dark:hover:border-white/[0.14] focus:border-[#5a8a6b] focus:ring-2 focus:ring-[#5a8a6b]/20 transition-all"
            />
          </Row>

          <div className="flex items-center gap-3 mt-6 mb-2">
            <button
              type="submit"
              disabled={saving}
              className="h-10 px-5 flex items-center gap-2 rounded-lg bg-[#5a8a6b] hover:bg-[#4f7a5e] text-white text-[13px] font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
            {saveSuccess && <span className="text-[13px] text-[#4a8a5e] dark:text-[#6db383]">Saved.</span>}
            {saveError && <span className="text-[13px] text-red-500">{saveError}</span>}
          </div>
        </form>

        <Row title="Members" desc={`${clients.length} client${clients.length !== 1 ? "s" : ""} have access to this workspace.`}>
          <div className="flex flex-col gap-1 items-end">
            {clients.length === 0 && (
              <span className="text-[13px] text-[#858c87] dark:text-[#6e7672]">No clients yet</span>
            )}
            {clients.map((m) => (
              <span key={m.id} className="text-[13px] text-[#5a625e] dark:text-[#a0a8a3]">
                {m.user.firstname ? `${m.user.firstname} ${m.user.lastname ?? ""}`.trim() : m.user.email}
              </span>
            ))}
          </div>
        </Row>

        <Row
          title="Delete workspace"
          desc="Permanently removes all messages, files, and proposals. This cannot be undone."
        >
          {!showDeleteConfirm ? (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="shrink-0 h-8 px-3 inline-flex items-center gap-1.5 rounded-lg text-[12px] font-medium border border-black/[0.08] dark:border-white/[0.07] bg-transparent text-[#c25a4a] dark:text-[#e07b6b] hover:bg-[#c25a4a]/[0.08] transition-colors cursor-pointer"
            >
              Delete workspace
            </button>
          ) : (
            <div className="flex flex-col items-end gap-2">
              <p className="text-[12px] text-[#c25a4a] dark:text-[#e07b6b] text-right">Are you sure? This cannot be undone.</p>
              {deleteError && <p className="text-[12px] text-red-500">{deleteError}</p>}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="h-8 px-3 rounded-lg border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#1c221e] text-[#1a201c] dark:text-[#e8ece9] text-[12px] font-medium hover:bg-[#f6f6f1] dark:hover:bg-[#222b26] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="h-8 px-3 rounded-lg bg-[#c25a4a] hover:bg-[#a84d3f] text-white text-[12px] font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {deleting ? "Deleting…" : "Yes, delete"}
                </button>
              </div>
            </div>
          )}
        </Row>
      </div>
    </div>
  );
};
