import { DARK, STICKY_BLUE, STICKY_GREEN, STICKY_YELLOW } from "./constants";
import { arrow, heading, rect, text } from "./helpers";
import type { TemplateElement } from "./types";

export const buildSystemArchitecture = (): TemplateElement[] => {
  const elements: TemplateElement[] = [heading(80, 40, "System architecture")];
  const layers = [
    { y: 100, title: "Client", color: STICKY_BLUE, boxes: ["Web", "Mobile"] },
    {
      y: 260,
      title: "Server",
      color: STICKY_GREEN,
      boxes: ["API", "Auth", "Workers"],
    },
    {
      y: 420,
      title: "Data",
      color: STICKY_YELLOW,
      boxes: ["Postgres", "Cache", "Storage"],
    },
  ];

  layers.forEach((layer) => {
    elements.push(text(80, layer.y + 16, layer.title, { fontSize: 18 }));
    const startX = 200;
    const w = 160;
    const gap = 24;
    layer.boxes.forEach((boxLabel, idx) => {
      const x = startX + idx * (w + gap);
      elements.push(
        rect(x, layer.y, w, 80, {
          backgroundColor: layer.color,
          strokeColor: DARK,
          fillStyle: "solid",
          rounded: true,
        }),
        text(x + 16, layer.y + 28, boxLabel, {
          fontSize: 18,
          width: w - 32,
          textAlign: "center",
        }),
      );
    });
  });

  elements.push(
    arrow(280, 180, [
      [0, 0],
      [0, 80],
    ]),
    arrow(280, 340, [
      [0, 0],
      [0, 80],
    ]),
  );

  return elements;
};
