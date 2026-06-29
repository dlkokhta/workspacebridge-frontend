// Client-side upload pre-checks. The backend (file.service.ts /
// file.constants.ts) is the authoritative gate — this only fails fast so a
// tester doesn't wait for a full upload before a wrong/oversized file is
// rejected. Keep this extension list in sync with ALLOWED_EXTENSIONS on the
// backend.
const EXTENSIONS = [
  ".pdf", ".doc", ".docx", ".txt", ".md", ".rtf",
  ".xls", ".xlsx", ".csv", ".ods",
  ".ppt", ".pptx", ".key",
  ".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif", ".svg", ".heic", ".heif",
  ".psd", ".ai", ".sketch", ".fig", ".xd", ".indd",
  ".zip", ".rar", ".7z", ".tar", ".gz",
  ".json", ".xml",
  ".mp4", ".mov", ".webm",
];

const ALLOWED_EXTENSIONS: ReadonlySet<string> = new Set(EXTENSIONS);

/** Value for the file input's `accept` attribute — filters the OS picker. */
export const UPLOAD_ACCEPT = EXTENSIONS.join(",");

export const formatBytes = (bytes: number): string => {
  if (bytes >= 1024 * 1024 * 1024) {
    return `${Math.round(bytes / 1024 / 1024 / 1024)} GB`;
  }
  return `${Math.round(bytes / 1024 / 1024)} MB`;
};

const extensionOf = (name: string): string => {
  const dot = name.lastIndexOf(".");
  return dot >= 0 ? name.slice(dot).toLowerCase() : "";
};

/**
 * Returns a user-facing error message if the file fails a pre-check, or null
 * if it passes. The size check runs only when `maxFileSize` is known (> 0);
 * when it isn't (e.g. the limit hasn't loaded yet) the server still enforces
 * it, so we never wrongly block a file.
 */
export const validateUploadFile = (
  file: File,
  maxFileSize?: number,
): string | null => {
  const ext = extensionOf(file.name);
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return ext
      ? `${ext} files aren't supported.`
      : "Files without an extension aren't supported.";
  }
  if (maxFileSize && maxFileSize > 0 && file.size > maxFileSize) {
    return `File is too large — the limit is ${formatBytes(maxFileSize)}.`;
  }
  return null;
};
