import { DARK, SAGE } from "./constants";
import { arrow, heading, line, rect, text } from "./helpers";
import type { TemplateElement } from "./types";

export const buildApiSequence = (): TemplateElement[] => {
  const elements: TemplateElement[] = [heading(80, 40, "API sequence")];
  const lanes = ["Client", "Server", "Database"];
  const startX = 120;
  const laneGap = 220;
  const topY = 100;
  const bottomY = 540;

  lanes.forEach((laneName, idx) => {
    const x = startX + idx * laneGap;
    elements.push(
      rect(x - 70, topY, 140, 44, {
        backgroundColor: SAGE,
        strokeColor: DARK,
        fillStyle: "solid",
        rounded: true,
      }),
      text(x - 60, topY + 12, laneName, {
        fontSize: 18,
        width: 120,
        textAlign: "center",
        strokeColor: "#ffffff",
      }),
      line(
        x,
        topY + 44,
        [
          [0, 0],
          [0, bottomY - topY - 44],
        ],
        { strokeStyle: "dashed" },
      ),
    );
  });

  const steps = [
    { from: 0, to: 1, y: 180, label: "POST /login" },
    { from: 1, to: 2, y: 240, label: "SELECT user" },
    { from: 2, to: 1, y: 300, label: "user row", end: null },
    { from: 1, to: 0, y: 380, label: "200 token", end: null },
  ];

  steps.forEach((step) => {
    const fromX = startX + step.from * laneGap;
    const toX = startX + step.to * laneGap;
    const dx = toX - fromX;
    elements.push(
      arrow(fromX, step.y, [
        [0, 0],
        [dx, 0],
      ]),
      text(Math.min(fromX, toX) + 16, step.y - 20, step.label, { fontSize: 14 }),
    );
  });

  return elements;
};
