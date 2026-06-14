import { useState } from "react";
import { Download } from "lucide-react";
import { axiosInstance } from "../../../../context/AuthContext";
import { Row } from "../../components/Row";
import { SmallBtn } from "../../components/SmallBtn";

// Downloads a full JSON export of the account's data (GDPR right to access).
// The export endpoint is JWT-guarded, so we fetch it as a blob through
// axiosInstance (which attaches the bearer token) and save it via a temporary
// object URL — a plain <a href> wouldn't carry the Authorization header.
export const DataExportRow = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await axiosInstance.get("/user/me/export", {
        responseType: "blob",
      });
      const disposition = res.headers["content-disposition"] as
        | string
        | undefined;
      const filename =
        disposition?.match(/filename="?([^"]+)"?/)?.[1] ??
        "workspacebridge-data-export.json";
      const url = URL.createObjectURL(res.data as Blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Failed to export your data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Row
        title="Download my data"
        desc="Export a JSON copy of your profile, sign-in methods, sessions, account activity and workspaces."
      >
        <SmallBtn onClick={handleDownload} disabled={loading}>
          <Download size={13} />
          {loading ? "Preparing…" : "Export data"}
        </SmallBtn>
      </Row>
      {error && (
        <p className="text-[12px] text-red-500 -mt-3 pb-4">{error}</p>
      )}
    </div>
  );
};
