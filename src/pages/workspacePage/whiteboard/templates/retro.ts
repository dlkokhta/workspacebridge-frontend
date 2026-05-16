import {
  DARK,
  NEUTRAL_BG,
  STICKY_GREEN,
  STICKY_PINK,
  STICKY_YELLOW,
} from "./constants";
import { heading, rect, sticky, text } from "./helpers";
import type { TemplateElement } from "./types";

export const buildRetro = (): TemplateElement[] => {
  const cols = [
    { title: "Liked", color: STICKY_GREEN },
    { title: "Disliked", color: STICKY_PINK },
    { title: "Action items", color: STICKY_YELLOW },
  ];
  const elements: TemplateElement[] = [heading(80, 40, "Retro")];
  const startX = 80;
  const startY = 100;
  const colWidth = 240;
  const colHeight = 500;
  const gap = 20;

  cols.forEach((col, idx) => {
    const x = startX + idx * (colWidth + gap);
    elements.push(
      rect(x, startY, colWidth, colHeight, {
        backgroundColor: NEUTRAL_BG,
        strokeColor: DARK,
        fillStyle: "solid",
        rounded: true,
      }),
      text(x + 16, startY + 16, col.title, { fontSize: 22 }),
    );
    for (let i = 0; i < 2; i++) {
      elements.push(
        ...sticky(x + 20, startY + 70 + i * 140, col.color, ""),
      );
    }
  });

  return elements;
};
