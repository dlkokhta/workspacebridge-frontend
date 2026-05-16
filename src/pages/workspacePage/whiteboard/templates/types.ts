export type WhiteboardTemplateCategory =
  | "Quick start"
  | "Ideation"
  | "Planning & tracking"
  | "Process & UX"
  | "Developer";

export type TemplateElement = Record<string, unknown>;

export interface WhiteboardTemplate {
  id: string;
  name: string;
  category: WhiteboardTemplateCategory;
  description: string;
  elements: readonly TemplateElement[];
}

export interface ElementOptions {
  strokeColor?: string;
  backgroundColor?: string;
  fillStyle?: "solid" | "hachure" | "cross-hatch";
  strokeWidth?: number;
  strokeStyle?: "solid" | "dashed" | "dotted";
  roughness?: number;
  rounded?: boolean;
}

export interface TextOptions extends ElementOptions {
  fontSize?: number;
  fontFamily?: 1 | 2 | 3;
  textAlign?: "left" | "center" | "right";
  verticalAlign?: "top" | "middle" | "bottom";
  width?: number;
  height?: number;
}

export interface ArrowOptions extends ElementOptions {
  endArrowhead?: "arrow" | null;
  startArrowhead?: "arrow" | null;
}
