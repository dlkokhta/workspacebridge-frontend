import {
  DARK,
  NEUTRAL_BG,
  STICKY_GREEN,
  STICKY_PINK,
  STICKY_YELLOW,
} from "./constants";
import { arrow, diamond, ellipse, heading, rect, text } from "./helpers";
import type { TemplateElement } from "./types";

export const buildFlowchart = (): TemplateElement[] => [
  heading(80, 40, "Flowchart"),
  ellipse(160, 120, 160, 80, {
    backgroundColor: STICKY_GREEN,
    strokeColor: DARK,
    fillStyle: "solid",
  }),
  text(200, 148, "Start", { fontSize: 20, width: 80, textAlign: "center" }),
  arrow(240, 200, [
    [0, 0],
    [0, 60],
  ]),
  rect(140, 260, 200, 80, {
    backgroundColor: NEUTRAL_BG,
    strokeColor: DARK,
    fillStyle: "solid",
    rounded: true,
  }),
  text(180, 290, "Process step", {
    fontSize: 18,
    width: 120,
    textAlign: "center",
  }),
  arrow(240, 340, [
    [0, 0],
    [0, 60],
  ]),
  diamond(140, 400, 200, 120, {
    backgroundColor: STICKY_YELLOW,
    strokeColor: DARK,
    fillStyle: "solid",
  }),
  text(190, 450, "Decision?", {
    fontSize: 18,
    width: 100,
    textAlign: "center",
  }),
  arrow(240, 520, [
    [0, 0],
    [-140, 80],
  ]),
  arrow(240, 520, [
    [0, 0],
    [140, 80],
  ]),
  text(80, 560, "Yes", { fontSize: 14 }),
  text(380, 560, "No", { fontSize: 14 }),
  ellipse(20, 600, 160, 80, {
    backgroundColor: STICKY_PINK,
    strokeColor: DARK,
    fillStyle: "solid",
  }),
  text(60, 628, "End A", { fontSize: 18, width: 80, textAlign: "center" }),
  ellipse(300, 600, 160, 80, {
    backgroundColor: STICKY_PINK,
    strokeColor: DARK,
    fillStyle: "solid",
  }),
  text(340, 628, "End B", { fontSize: 18, width: 80, textAlign: "center" }),
];
