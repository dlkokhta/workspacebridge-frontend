import type { OrderedExcalidrawElement } from "@excalidraw/excalidraw/element/types";

export const SYNC_DEBOUNCE_MS = 300;
export const POINTER_THROTTLE_MS = 50;
export const COLLABORATOR_TTL_MS = 10000;
export const COLLABORATOR_SWEEP_MS = 3000;

export const CURSOR_COLORS = [
  { background: "#fef3c7", stroke: "#d97706" },
  { background: "#dbeafe", stroke: "#2563eb" },
  { background: "#fce7f3", stroke: "#db2777" },
  { background: "#d1fae5", stroke: "#059669" },
  { background: "#ede9fe", stroke: "#7c3aed" },
  { background: "#fee2e2", stroke: "#dc2626" },
];

export const hashStr = (s: string): number => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
};

export const colorFor = (userId: string) =>
  CURSOR_COLORS[hashStr(userId) % CURSOR_COLORS.length];

export const sigOf = (elements: readonly OrderedExcalidrawElement[]) =>
  elements.map((e) => `${e.id}:${e.version}`).join("|");

export const sceneToScreen = (
  sceneX: number,
  sceneY: number,
  scrollX: number,
  scrollY: number,
  zoom: number,
) => ({
  x: (sceneX + scrollX) * zoom,
  y: (sceneY + scrollY) * zoom,
});

export const decodeUserIdFromToken = (token: string | null): string | null => {
  if (!token) return null;
  try {
    const [, payloadB64] = token.split(".");
    if (!payloadB64) return null;
    const payload: unknown = JSON.parse(atob(payloadB64));
    if (typeof payload === "object" && payload !== null) {
      const userId = (payload as { userId?: unknown }).userId;
      return typeof userId === "string" ? userId : null;
    }
    return null;
  } catch {
    return null;
  }
};

interface PersonName {
  firstname?: string | null;
  lastname?: string | null;
  email: string;
}

export const formatPersonName = ({ firstname, lastname, email }: PersonName) => {
  if (firstname && lastname) return `${firstname} ${lastname[0]}.`;
  if (firstname) return firstname;
  if (lastname) return lastname;
  return email.split("@")[0];
};

export const formatCollaboratorName = (entry: PersonName) => {
  const first = entry.firstname?.trim();
  const last = entry.lastname?.trim();
  if (first && last) return `${first} ${last[0]}.`;
  if (first) return first;
  if (last) return last;
  return entry.email.split("@")[0];
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

export const formatExactTime = (iso: string): string => {
  const date = new Date(iso);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
};
