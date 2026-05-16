import { DARK, NEUTRAL_BG, SAGE, STICKY_YELLOW } from "./constants";
import { heading, rect, text } from "./helpers";
import type { TemplateElement } from "./types";

export const buildUserJourney = (): TemplateElement[] => {
  const stages = ["Discover", "Sign up", "Onboard", "Use", "Advocate"];
  const elements: TemplateElement[] = [heading(80, 40, "User journey")];
  const startX = 80;
  const colWidth = 180;
  const gap = 16;
  const rows = [
    { y: 100, label: "Stage", color: SAGE, textColor: "#ffffff" },
    { y: 180, label: "Actions", color: NEUTRAL_BG, textColor: DARK },
    { y: 340, label: "Emotion", color: STICKY_YELLOW, textColor: DARK },
  ];

  elements.push(
    text(20, 120, "Stage", { fontSize: 14 }),
    text(20, 220, "Actions", { fontSize: 14 }),
    text(20, 380, "Emotion", { fontSize: 14 }),
  );

  stages.forEach((stage, idx) => {
    const x = startX + idx * (colWidth + gap);
    elements.push(
      rect(x, rows[0].y, colWidth, 50, {
        backgroundColor: rows[0].color,
        strokeColor: DARK,
        fillStyle: "solid",
        rounded: true,
      }),
      text(x + 16, rows[0].y + 14, stage, {
        fontSize: 18,
        strokeColor: rows[0].textColor,
        width: colWidth - 32,
      }),
      rect(x, rows[1].y, colWidth, 140, {
        backgroundColor: rows[1].color,
        strokeColor: DARK,
        fillStyle: "solid",
        strokeStyle: "dashed",
        rounded: true,
      }),
      rect(x, rows[2].y, colWidth, 80, {
        backgroundColor: rows[2].color,
        strokeColor: DARK,
        fillStyle: "solid",
        rounded: true,
      }),
      text(x + colWidth / 2 - 12, rows[2].y + 26, "🙂", {
        fontSize: 28,
        width: 32,
      }),
    );
  });

  return elements;
};
