import { DARK, NEUTRAL_BG } from "./constants";
import { heading, label, rect } from "./helpers";
import type { TemplateElement } from "./types";

export const buildMoodBoard = (): TemplateElement[] => {
  const elements: TemplateElement[] = [
    heading(80, 40, "Mood board"),
    label(80, 80, "Drop images, swatches, and references that capture the vibe.", {
      fontSize: 14,
      width: 600,
    }),
  ];
  const tiles: Array<{ w: number; h: number }> = [
    { w: 260, h: 180 },
    { w: 200, h: 180 },
    { w: 220, h: 180 },
    { w: 180, h: 220 },
    { w: 280, h: 220 },
    { w: 220, h: 220 },
  ];
  let x = 80;
  let y = 130;
  let rowMax = 0;
  for (const tile of tiles) {
    if (x + tile.w > 800) {
      x = 80;
      y += rowMax + 20;
      rowMax = 0;
    }
    elements.push(
      rect(x, y, tile.w, tile.h, {
        backgroundColor: NEUTRAL_BG,
        strokeColor: DARK,
        strokeStyle: "dashed",
        fillStyle: "solid",
        rounded: true,
      }),
    );
    x += tile.w + 20;
    rowMax = Math.max(rowMax, tile.h);
  }
  return elements;
};
