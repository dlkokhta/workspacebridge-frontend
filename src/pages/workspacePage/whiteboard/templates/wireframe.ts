import { DARK, NEUTRAL_BG } from "./constants";
import { ellipse, heading, rect, text } from "./helpers";
import type { TemplateElement } from "./types";

export const buildWireframe = (): TemplateElement[] => {
  const ox = 80;
  const oy = 80;
  const browserW = 760;
  const browserH = 520;

  return [
    heading(ox, oy - 40, "Wireframe"),
    rect(ox, oy, browserW, browserH, {
      backgroundColor: "#ffffff",
      strokeColor: DARK,
      fillStyle: "solid",
      rounded: true,
    }),
    rect(ox, oy, browserW, 36, {
      backgroundColor: NEUTRAL_BG,
      strokeColor: DARK,
      fillStyle: "solid",
    }),
    ellipse(ox + 12, oy + 12, 12, 12, {
      backgroundColor: "#e57373",
      strokeColor: DARK,
      fillStyle: "solid",
    }),
    ellipse(ox + 30, oy + 12, 12, 12, {
      backgroundColor: "#ffb74d",
      strokeColor: DARK,
      fillStyle: "solid",
    }),
    ellipse(ox + 48, oy + 12, 12, 12, {
      backgroundColor: "#81c784",
      strokeColor: DARK,
      fillStyle: "solid",
    }),
    rect(ox + 20, oy + 60, browserW - 40, 60, {
      backgroundColor: NEUTRAL_BG,
      strokeColor: DARK,
      fillStyle: "solid",
      strokeStyle: "dashed",
    }),
    text(ox + 40, oy + 80, "Logo", { fontSize: 18 }),
    text(ox + browserW - 200, oy + 80, "Nav · Nav · Nav", { fontSize: 14 }),
    rect(ox + 20, oy + 140, browserW - 40, 180, {
      backgroundColor: NEUTRAL_BG,
      strokeColor: DARK,
      fillStyle: "solid",
      strokeStyle: "dashed",
    }),
    text(ox + 40, oy + 220, "Hero headline", { fontSize: 22 }),
    rect(ox + 20, oy + 340, 220, 120, {
      backgroundColor: NEUTRAL_BG,
      strokeColor: DARK,
      fillStyle: "solid",
      strokeStyle: "dashed",
    }),
    rect(ox + 270, oy + 340, 220, 120, {
      backgroundColor: NEUTRAL_BG,
      strokeColor: DARK,
      fillStyle: "solid",
      strokeStyle: "dashed",
    }),
    rect(ox + 520, oy + 340, 220, 120, {
      backgroundColor: NEUTRAL_BG,
      strokeColor: DARK,
      fillStyle: "solid",
      strokeStyle: "dashed",
    }),
    text(ox + 90, oy + 388, "Card", { fontSize: 16 }),
    text(ox + 340, oy + 388, "Card", { fontSize: 16 }),
    text(ox + 590, oy + 388, "Card", { fontSize: 16 }),
    rect(ox + 20, oy + 480, browserW - 40, 30, {
      backgroundColor: NEUTRAL_BG,
      strokeColor: DARK,
      fillStyle: "solid",
      strokeStyle: "dashed",
    }),
    text(ox + 40, oy + 488, "Footer", { fontSize: 14 }),
  ];
};
