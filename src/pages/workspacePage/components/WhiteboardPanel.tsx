import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { axiosInstance } from "../../../context/AuthContext";
import { WhiteboardCanvas } from "./WhiteboardCanvas";

interface BoardSummary {
  id: string;
  name: string;
  updatedAt: string;
}

interface WhiteboardPanelProps {
  workspaceId: string;
}

export const WhiteboardPanel = ({ workspaceId }: WhiteboardPanelProps) => {
  const [boards, setBoards] = useState<BoardSummary[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const { data } = await axiosInstance.get<BoardSummary[]>(
          `/workspace/${workspaceId}/whiteboards`,
        );
        if (cancelled) return;

        if (data.length === 0) {
          const { data: created } = await axiosInstance.post<BoardSummary>(
            `/workspace/${workspaceId}/whiteboards`,
            {},
          );
          if (cancelled) return;
          setBoards([created]);
          setSelectedId(created.id);
        } else {
          setBoards(data);
          setSelectedId(data[0].id);
        }
      } catch {
        if (!cancelled) setError("Could not load whiteboards.");
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [workspaceId]);

  const handleNewBoard = async () => {
    const name = window.prompt("Board name", "Untitled board");
    if (name === null) return;
    setCreating(true);
    try {
      const { data } = await axiosInstance.post<BoardSummary>(
        `/workspace/${workspaceId}/whiteboards`,
        { name: name.trim() || "Untitled board" },
      );
      setBoards((prev) => (prev ? [...prev, data] : [data]));
      setSelectedId(data.id);
    } catch {
      setError("Could not create board.");
    } finally {
      setCreating(false);
    }
  };

  if (error) {
    return (
      <div className="flex-1 min-h-0 w-full flex items-center justify-center text-[13px] text-[#c25a4a]">
        {error}
      </div>
    );
  }

  if (!boards || !selectedId) {
    return (
      <div className="flex-1 min-h-0 w-full flex items-center justify-center text-[13px] text-[#858c87] dark:text-[#6e7672]">
        Loading whiteboards…
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden min-h-0">
      <div className="flex items-center gap-1.5 px-6 py-2 border-b border-black/[0.06] dark:border-white/[0.05] overflow-x-auto">
        {boards.map((b) => (
          <button
            key={b.id}
            onClick={() => setSelectedId(b.id)}
            className={`h-7 px-3 inline-flex items-center rounded-full text-[12px] font-medium transition-colors cursor-pointer ${
              b.id === selectedId
                ? "bg-[#5a8a6b] text-white"
                : "bg-black/[0.04] dark:bg-white/[0.04] text-[#5a625e] dark:text-[#a0a8a3] hover:bg-black/[0.06] dark:hover:bg-white/[0.06]"
            }`}
          >
            {b.name}
          </button>
        ))}
        <button
          onClick={handleNewBoard}
          disabled={creating}
          className="h-7 px-3 inline-flex items-center gap-1 rounded-full text-[12px] font-medium border border-dashed border-black/[0.12] dark:border-white/[0.1] text-[#5a625e] dark:text-[#a0a8a3] hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-colors cursor-pointer disabled:opacity-50"
        >
          <Plus size={12} /> New board
        </button>
      </div>
      <WhiteboardCanvas boardId={selectedId} />
    </div>
  );
};
