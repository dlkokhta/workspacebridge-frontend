import { DARK } from "./constants";
import type {
  ArrowOptions,
  ElementOptions,
  TemplateElement,
  TextOptions,
} from "./types";

let elementCounter = 0;

const nextId = (prefix: string) => `tpl-${prefix}-${elementCounter++}`;
const nextIndex = () => `a${elementCounter.toString(36).padStart(4, "0")}`;

export const resetCounter = (): void => {
  elementCounter = 0;
};

const baseDefaults = (opts: ElementOptions = {}): TemplateElement => ({
  angle: 0,
  strokeColor: opts.strokeColor ?? DARK,
  backgroundColor: opts.backgroundColor ?? "transparent",
  fillStyle: opts.fillStyle ?? "solid",
  strokeWidth: opts.strokeWidth ?? 2,
  strokeStyle: opts.strokeStyle ?? "solid",
  roughness: opts.roughness ?? 1,
  opacity: 100,
  groupIds: [],
  frameId: null,
  roundness: opts.rounded ? { type: 3 } : null,
  seed: Math.floor(Math.random() * 2 ** 31),
  version: 1,
  versionNonce: Math.floor(Math.random() * 2 ** 31),
  isDeleted: false,
  boundElements: null,
  updated: 1,
  link: null,
  locked: false,
  customData: null,
  index: nextIndex(),
});

export const rect = (
  x: number,
  y: number,
  width: number,
  height: number,
  opts: ElementOptions = {},
): TemplateElement => ({
  ...baseDefaults(opts),
  id: nextId("rect"),
  type: "rectangle",
  x,
  y,
  width,
  height,
});

export const ellipse = (
  x: number,
  y: number,
  width: number,
  height: number,
  opts: ElementOptions = {},
): TemplateElement => ({
  ...baseDefaults(opts),
  id: nextId("ellipse"),
  type: "ellipse",
  x,
  y,
  width,
  height,
});

export const diamond = (
  x: number,
  y: number,
  width: number,
  height: number,
  opts: ElementOptions = {},
): TemplateElement => ({
  ...baseDefaults(opts),
  id: nextId("diamond"),
  type: "diamond",
  x,
  y,
  width,
  height,
});

export const text = (
  x: number,
  y: number,
  content: string,
  opts: TextOptions = {},
): TemplateElement => {
  const fontSize = opts.fontSize ?? 20;
  const width = opts.width ?? Math.max(content.length * fontSize * 0.55, 80);
  const height = opts.height ?? fontSize * 1.25;
  return {
    ...baseDefaults(opts),
    id: nextId("text"),
    type: "text",
    x,
    y,
    width,
    height,
    text: content,
    originalText: content,
    fontSize,
    fontFamily: opts.fontFamily ?? 1,
    textAlign: opts.textAlign ?? "left",
    verticalAlign: opts.verticalAlign ?? "top",
    baseline: Math.round(fontSize * 0.8),
    containerId: null,
    autoResize: true,
    lineHeight: 1.25,
  };
};

export const arrow = (
  x: number,
  y: number,
  points: ReadonlyArray<readonly [number, number]>,
  opts: ArrowOptions = {},
): TemplateElement => {
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  const width = Math.max(...xs) - Math.min(...xs);
  const height = Math.max(...ys) - Math.min(...ys);
  return {
    ...baseDefaults(opts),
    id: nextId("arrow"),
    type: "arrow",
    x,
    y,
    width,
    height,
    points,
    lastCommittedPoint: null,
    startBinding: null,
    endBinding: null,
    startArrowhead: opts.startArrowhead ?? null,
    endArrowhead: opts.endArrowhead === undefined ? "arrow" : opts.endArrowhead,
    elbowed: false,
  };
};

export const line = (
  x: number,
  y: number,
  points: ReadonlyArray<readonly [number, number]>,
  opts: ElementOptions = {},
): TemplateElement => {
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  const width = Math.max(...xs) - Math.min(...xs);
  const height = Math.max(...ys) - Math.min(...ys);
  return {
    ...baseDefaults(opts),
    id: nextId("line"),
    type: "line",
    x,
    y,
    width,
    height,
    points,
    lastCommittedPoint: null,
    startBinding: null,
    endBinding: null,
    startArrowhead: null,
    endArrowhead: null,
  };
};

export const heading = (x: number, y: number, content: string): TemplateElement =>
  text(x, y, content, { fontSize: 28, fontFamily: 1 });

export const label = (
  x: number,
  y: number,
  content: string,
  options: TextOptions = {},
): TemplateElement => text(x, y, content, { fontSize: 18, ...options });

export const sticky = (
  x: number,
  y: number,
  color: string,
  content: string,
): TemplateElement[] => [
  rect(x, y, 160, 120, {
    backgroundColor: color,
    fillStyle: "solid",
    strokeColor: DARK,
    rounded: true,
  }),
  text(x + 16, y + 16, content, { fontSize: 16, width: 128 }),
];
