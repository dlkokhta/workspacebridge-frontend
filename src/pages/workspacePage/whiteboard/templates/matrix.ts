import { DARK, NEUTRAL_BG, SAGE } from "./constants";
import { heading, label, line, rect } from "./helpers";
import type { TemplateElement } from "./types";

export const buildMatrix2x2 = (): TemplateElement[] => {
  const ox = 120;
  const oy = 120;
  const size = 480;
  const half = size / 2;
  return [
    heading(ox, oy - 60, "Impact × Effort matrix"),
    rect(ox, oy, size, size, {
      backgroundColor: NEUTRAL_BG,
      strokeColor: DARK,
      fillStyle: "solid",
    }),
    line(ox, oy + half, [
      [0, 0],
      [size, 0],
    ]),
    line(ox + half, oy, [
      [0, 0],
      [0, size],
    ]),
    label(ox + 20, oy + 20, "Quick wins", {
      fontSize: 18,
      strokeColor: SAGE,
    }),
    label(ox + half + 20, oy + 20, "Major projects", {
      fontSize: 18,
      strokeColor: SAGE,
    }),
    label(ox + 20, oy + half + 20, "Fill-ins", {
      fontSize: 18,
      strokeColor: DARK,
    }),
    label(ox + half + 20, oy + half + 20, "Reconsider", {
      fontSize: 18,
      strokeColor: "#a8554a",
    }),
    label(ox - 80, oy + half - 12, "Impact ↑", { fontSize: 14 }),
    label(ox + half - 32, oy + size + 20, "Effort →", { fontSize: 14 }),
  ];
};
