export type DeviceKind = "mobile" | "tablet" | "desktop";

export const parseUserAgent = (
  ua: string | null,
): { label: string; kind: DeviceKind } => {
  if (!ua) return { label: "Unknown device", kind: "desktop" };

  const kind: DeviceKind = /mobile|iphone|android(?!.*tablet)/i.test(ua)
    ? "mobile"
    : /ipad|tablet/i.test(ua)
      ? "tablet"
      : "desktop";

  const browser = /edg/i.test(ua)
    ? "Edge"
    : /opr|opera/i.test(ua)
      ? "Opera"
      : /chrome|crios/i.test(ua)
        ? "Chrome"
        : /firefox|fxios/i.test(ua)
          ? "Firefox"
          : /safari/i.test(ua)
            ? "Safari"
            : "Browser";

  const os = /windows/i.test(ua)
    ? "Windows"
    : /android/i.test(ua)
      ? "Android"
      : /iphone|ipad|ios/i.test(ua)
        ? "iOS"
        : /mac os/i.test(ua)
          ? "macOS"
          : /linux/i.test(ua)
            ? "Linux"
            : "Unknown OS";

  return { label: `${browser} · ${os}`, kind };
};

export const formatRelative = (iso: string): string => {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  return new Date(iso).toLocaleDateString();
};
