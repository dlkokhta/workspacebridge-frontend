import {
  Brain,
  Calendar,
  Columns3,
  Database,
  GitMerge,
  Grid2x2,
  LayoutDashboard,
  type LucideIcon,
  Network,
  Palette,
  RefreshCcw,
  Square,
  StickyNote,
  Users,
  Webhook,
  Workflow,
} from "lucide-react";

export const TEMPLATE_ICONS: Record<string, LucideIcon> = {
  blank: Square,
  brainstorm: Brain,
  "sticky-notes": StickyNote,
  "mood-board": Palette,
  kanban: Columns3,
  timeline: Calendar,
  matrix: Grid2x2,
  retro: RefreshCcw,
  flowchart: Workflow,
  "user-journey": Users,
  wireframe: LayoutDashboard,
  "system-architecture": Network,
  "database-schema": Database,
  "api-sequence": Webhook,
  "state-machine": GitMerge,
};

export const FALLBACK_TEMPLATE_ICON: LucideIcon = Square;
