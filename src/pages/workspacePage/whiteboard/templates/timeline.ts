import { DARK, SAGE } from "./constants";
import { arrow, ellipse, heading, text } from "./helpers";
import type { TemplateElement } from "./types";

export const buildTimeline = (): TemplateElement[] => {
  const elements: TemplateElement[] = [heading(80, 40, "Project timeline")];
  const milestones = ["Kickoff", "Design", "Build", "Test", "Launch"];
  const startX = 100;
  const baseY = 240;
  const step = 160;

  elements.push(
    arrow(startX, baseY, [
      [0, 0],
      [step * milestones.length, 0],
    ]),
  );

  milestones.forEach((name, idx) => {
    const x = startX + idx * step;
    elements.push(
      ellipse(x - 12, baseY - 12, 24, 24, {
        backgroundColor: SAGE,
        strokeColor: DARK,
        fillStyle: "solid",
      }),
      text(x - 50, baseY - 60, name, {
        fontSize: 18,
        width: 100,
        textAlign: "center",
      }),
      text(x - 40, baseY + 30, `Week ${idx + 1}`, {
        fontSize: 14,
        width: 80,
        textAlign: "center",
      }),
    );
  });

  return elements;
};
