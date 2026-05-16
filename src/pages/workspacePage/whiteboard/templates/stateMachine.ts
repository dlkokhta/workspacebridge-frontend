import {
  DARK,
  NEUTRAL_BG,
  STICKY_BLUE,
  STICKY_GREEN,
  STICKY_PINK,
} from "./constants";
import { arrow, ellipse, heading, text } from "./helpers";
import type { TemplateElement } from "./types";

export const buildStateMachine = (): TemplateElement[] => {
  const elements: TemplateElement[] = [heading(80, 40, "State machine")];
  const states = [
    { x: 120, y: 160, label: "Draft", color: NEUTRAL_BG },
    { x: 380, y: 160, label: "Sent", color: STICKY_BLUE },
    { x: 640, y: 80, label: "Approved", color: STICKY_GREEN },
    { x: 640, y: 240, label: "Revision", color: STICKY_PINK },
  ];

  states.forEach((s) => {
    elements.push(
      ellipse(s.x, s.y, 160, 80, {
        backgroundColor: s.color,
        strokeColor: DARK,
        fillStyle: "solid",
      }),
      text(s.x + 30, s.y + 28, s.label, {
        fontSize: 18,
        width: 100,
        textAlign: "center",
      }),
    );
  });

  elements.push(
    arrow(280, 200, [
      [0, 0],
      [100, 0],
    ]),
    text(300, 175, "submit", { fontSize: 14 }),
    arrow(540, 180, [
      [0, 0],
      [100, -60],
    ]),
    text(540, 145, "approve", { fontSize: 14 }),
    arrow(540, 220, [
      [0, 0],
      [100, 60],
    ]),
    text(540, 250, "request changes", { fontSize: 14 }),
    arrow(720, 240, [
      [0, 0],
      [0, -40],
      [-280, -40],
      [-280, -40],
    ]),
  );

  return elements;
};
