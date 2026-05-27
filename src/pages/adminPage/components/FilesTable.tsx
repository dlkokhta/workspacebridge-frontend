import { Trash2, HardDrive, FileText } from "lucide-react";
import { useAdminFiles } from "../../../hooks/useAdminFiles";
import { StatCard } from "./StatCard";

export const FilesTable = () => {
  const { files, stats, deletingId, deleteFile } = useAdminFiles();

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024)
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  return (
    <>
      {/* Storage stats */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
          <StatCard
            icon={<FileText size={14} />}
            label="Total files"
            value={stats.totalFiles}
            accent="green"
          />
          <StatCard
            icon={<HardDrive size={14} />}
            label={`Total storage — ${formatSize(stats.totalSize)}`}
            value={stats.perWorkspace.length}
            accent="blue"
          />
        </div>
      )}

      {/* Files table */}
      <div className="rounded-xl border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#151a17] overflow-hidden mt-6">
        <div className="px-5 py-4 border-b border-black/[0.06] dark:border-white/[0.05]">
          <h3 className="text-[14px] font-semibold text-[#1a201c] dark:text-[#e8ece9]">
            Files
          </h3>
          <p className="text-[12px] text-[#858c87] dark:text-[#6e7672] mt-0.5">
            {files.length} file{files.length !== 1 && "s"} across all workspaces
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-black/[0.06] dark:border-white/[0.05]">
                {["Name", "Workspace", "Uploaded by", "Type", "Size", "Status", "Created"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-5 py-2.5 text-left text-[11px] uppercase tracking-[0.06em] font-medium text-[#858c87] dark:text-[#6e7672]"
                    >
                      {h}
                    </th>
                  ),
                )}
                <th className="px-5 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr
                  key={file.id}
                  className="border-b border-black/[0.04] dark:border-white/[0.04] last:border-0 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-5 py-3 text-[13px] text-[#1a201c] dark:text-[#e8ece9] max-w-[200px] truncate">
                    {file.name}
                  </td>
                  <td className="px-5 py-3 text-[13px] text-[#1a201c] dark:text-[#e8ece9]">
                    {file.workspace.name}
                  </td>
                  <td className="px-5 py-3 text-[12px] text-[#858c87] dark:text-[#6e7672]">
                    {file.uploadedBy
                      ? file.uploadedBy.firstname || file.uploadedBy.lastname
                        ? `${file.uploadedBy.firstname ?? ""} ${file.uploadedBy.lastname ?? ""}`.trim()
                        : file.uploadedBy.email
                      : <span className="text-[#b5bbb7] dark:text-[#4a514d]">Deleted user</span>}
                  </td>
                  <td className="px-5 py-3 text-[12px] text-[#858c87] dark:text-[#6e7672]">
                    {file.mimeType}
                  </td>
                  <td className="px-5 py-3 text-[12px] text-[#858c87] dark:text-[#6e7672]">
                    {formatSize(file.size)}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex items-center h-[20px] px-2 rounded-full border text-[10px] font-medium ${
                        file.deletedAt
                          ? "bg-[#c25a4a]/10 text-[#c25a4a] dark:text-[#e07b6b] border-[#c25a4a]/30"
                          : "bg-[#5a8a6b]/10 text-[#3e6a4d] dark:text-[#6db383] border-[#5a8a6b]/30"
                      }`}
                    >
                      {file.deletedAt ? "Trashed" : "Active"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-[12px] text-[#858c87] dark:text-[#6e7672]">
                    {fmt(file.createdAt)}
                  </td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => deleteFile(file.id)}
                      disabled={deletingId === file.id}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-[#858c87] dark:text-[#6e7672] hover:bg-[#c25a4a]/10 hover:text-[#c25a4a] dark:hover:text-[#e07b6b] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete file permanently"
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {files.length === 0 && (
          <p className="text-center py-10 text-[13px] text-[#858c87] dark:text-[#6e7672]">
            No files found.
          </p>
        )}
      </div>
    </>
  );
};
