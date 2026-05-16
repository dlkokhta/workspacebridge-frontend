import { Save } from "lucide-react";
import type { WhiteboardVersionSummary } from "../../../../hooks/useWhiteboardVersions";
import { VersionRow } from "./VersionRow";

interface VersionsListProps {
  versions: WhiteboardVersionSummary[];
  loading: boolean;
  error: string | null;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export const VersionsList = ({
  versions,
  loading,
  error,
  selectedId,
  onSelect,
}: VersionsListProps) => {
  if (loading) {
    return (
      <div className="p-4 text-[12px] text-[#858c87] dark:text-[#6e7672]">
        Loading…
      </div>
    );
  }
  if (error) {
    return <div className="p-4 text-[12px] text-[#c25a4a]">{error}</div>;
  }
  if (versions.length === 0) {
    return (
      <div className="p-4 text-[12px] text-[#858c87] dark:text-[#6e7672]">
        <Save size={14} className="inline mr-1.5" />
        No versions yet. Click <span className="font-medium">Save version</span> on the board to capture a snapshot.
      </div>
    );
  }
  return (
    <div>
      {versions.map((v) => (
        <VersionRow
          key={v.id}
          version={v}
          isSelected={v.id === selectedId}
          onClick={() => onSelect(v.id)}
        />
      ))}
    </div>
  );
};
