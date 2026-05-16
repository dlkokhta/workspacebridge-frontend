import {
  DARK,
  SAGE,
  STICKY_BLUE,
  STICKY_GREEN,
  STICKY_PINK,
  STICKY_YELLOW,
} from "./constants";
import { arrow, ellipse, text } from "./helpers";
import type { TemplateElement } from "./types";

export const buildBrainstorm = (): TemplateElement[] => {
  const cx = 400;
  const cy = 300;
  return [
    ellipse(cx - 100, cy - 50, 200, 100, {
      backgroundColor: SAGE,
      strokeColor: DARK,
      fillStyle: "solid",
    }),
    text(cx - 70, cy - 12, "Main idea", {
      fontSize: 20,
      width: 140,
      textAlign: "center",
      strokeColor: "#ffffff",
    }),
    ellipse(cx - 320, cy - 200, 160, 80, {
      backgroundColor: STICKY_YELLOW,
      strokeColor: DARK,
      fillStyle: "solid",
    }),
    text(cx - 290, cy - 170, "Idea 1", { width: 100, textAlign: "center" }),
    ellipse(cx + 160, cy - 200, 160, 80, {
      backgroundColor: STICKY_GREEN,
      strokeColor: DARK,
      fillStyle: "solid",
    }),
    text(cx + 190, cy - 170, "Idea 2", { width: 100, textAlign: "center" }),
    ellipse(cx - 320, cy + 120, 160, 80, {
      backgroundColor: STICKY_BLUE,
      strokeColor: DARK,
      fillStyle: "solid",
    }),
    text(cx - 290, cy + 150, "Idea 3", { width: 100, textAlign: "center" }),
    ellipse(cx + 160, cy + 120, 160, 80, {
      backgroundColor: STICKY_PINK,
      strokeColor: DARK,
      fillStyle: "solid",
    }),
    text(cx + 190, cy + 150, "Idea 4", { width: 100, textAlign: "center" }),
    arrow(cx, cy, [
      [0, 0],
      [-160, -120],
    ]),
    arrow(cx, cy, [
      [0, 0],
      [160, -120],
    ]),
    arrow(cx, cy, [
      [0, 0],
      [-160, 120],
    ]),
    arrow(cx, cy, [
      [0, 0],
      [160, 120],
    ]),
  ];
};
