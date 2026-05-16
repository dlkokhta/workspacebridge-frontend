import {
  DARK,
  STICKY_BLUE,
  STICKY_GREEN,
  STICKY_ORANGE,
  STICKY_PINK,
  STICKY_PURPLE,
  STICKY_YELLOW,
} from "./constants";
import { heading, rect } from "./helpers";
import type { TemplateElement } from "./types";

export const buildStickyNotes = (): TemplateElement[] => {
  const colors = [
    STICKY_YELLOW,
    STICKY_GREEN,
    STICKY_BLUE,
    STICKY_PINK,
    STICKY_ORANGE,
    STICKY_PURPLE,
  ];
  const elements: TemplateElement[] = [heading(80, 40, "Sticky notes")];
  const cols = 4;
  const startX = 80;
  const startY = 120;
  const gap = 24;
  const size = 160;
  for (let i = 0; i < 12; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = startX + col * (size + gap);
    const y = startY + row * (size + gap);
    elements.push(
      rect(x, y, size, size, {
        backgroundColor: colors[i % colors.length],
        strokeColor: DARK,
        fillStyle: "solid",
        rounded: true,
      }),
    );
  }
  return elements;
};
