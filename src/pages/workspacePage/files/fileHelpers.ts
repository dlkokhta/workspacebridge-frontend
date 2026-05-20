import {
  Archive,
  FileCode2,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileType,
  FileVideo,
  Image as ImageIcon,
  Presentation,
  type LucideIcon,
} from "lucide-react";

export interface FileKindInfo {
  label: string;
  color: string;
  icon: LucideIcon;
}

export const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
};

export const TRASH_RETENTION_DAYS = 30;

export const daysRemainingInTrash = (deletedAt: string): number => {
  const elapsedMs = Date.now() - new Date(deletedAt).getTime();
  const remaining = TRASH_RETENTION_DAYS - elapsedMs / (24 * 60 * 60 * 1000);
  return Math.max(0, Math.ceil(remaining));
};

export const formatRelativeTime = (iso: string): string => {
  const date = new Date(iso);
  const diff = Date.now() - date.getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return date.toLocaleDateString();
};

export const getFileKindInfo = (mimeType: string, name: string): FileKindInfo => {
  const ext = name.toLowerCase().split(".").pop() ?? "";

  if (mimeType.startsWith("image/")) {
    return { label: "Image", color: "#7a9bbf", icon: FileImage };
  }
  if (mimeType.startsWith("video/")) {
    return { label: "Video", color: "#9b6ba8", icon: FileVideo };
  }
  if (mimeType === "application/pdf") {
    return { label: "PDF", color: "#c25a4a", icon: FileText };
  }
  if (
    mimeType.includes("spreadsheet") ||
    ext === "xlsx" ||
    ext === "xls" ||
    ext === "csv"
  ) {
    return { label: "Spreadsheet", color: "#3f8a5a", icon: FileSpreadsheet };
  }
  if (mimeType.includes("presentation") || ext === "pptx" || ext === "ppt") {
    return { label: "Presentation", color: "#d97706", icon: Presentation };
  }
  if (mimeType.includes("word") || ext === "doc" || ext === "docx") {
    return { label: "Document", color: "#2e6bb8", icon: FileText };
  }
  if (
    mimeType.includes("zip") ||
    mimeType.includes("rar") ||
    mimeType.includes("tar") ||
    mimeType.includes("7z") ||
    mimeType.includes("gzip")
  ) {
    return { label: "Archive", color: "#b5803a", icon: Archive };
  }
  if (["psd", "ai", "sketch", "fig", "xd", "indd"].includes(ext)) {
    return { label: "Design", color: "#5a8a6b", icon: ImageIcon };
  }
  if (mimeType.includes("json") || mimeType.includes("xml")) {
    return { label: "Data", color: "#6d6d6d", icon: FileCode2 };
  }
  return { label: ext.toUpperCase() || "File", color: "#858c87", icon: FileType };
};

export const formatUploader = (
  uploader: {
    firstname: string | null;
    lastname: string | null;
    email: string;
  } | null,
): string => {
  if (!uploader) return "Deleted user";
  if (uploader.firstname && uploader.lastname) {
    return `${uploader.firstname} ${uploader.lastname[0]}.`;
  }
  if (uploader.firstname) return uploader.firstname;
  if (uploader.lastname) return uploader.lastname;
  return uploader.email.split("@")[0];
};
