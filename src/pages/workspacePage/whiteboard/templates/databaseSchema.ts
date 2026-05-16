import { DARK, STICKY_BLUE, STICKY_GREEN, STICKY_YELLOW } from "./constants";
import { arrow, heading, rect, text } from "./helpers";
import type { TemplateElement } from "./types";

export const buildDatabaseSchema = (): TemplateElement[] => {
  const elements: TemplateElement[] = [heading(80, 40, "Database schema")];
  const tables = [
    {
      x: 80,
      y: 100,
      title: "User",
      color: STICKY_BLUE,
      fields: ["id  uuid PK", "email  text", "name  text", "created_at  ts"],
    },
    {
      x: 360,
      y: 100,
      title: "Workspace",
      color: STICKY_GREEN,
      fields: [
        "id  uuid PK",
        "owner_id  FK → User",
        "name  text",
        "color  text",
      ],
    },
    {
      x: 640,
      y: 100,
      title: "Message",
      color: STICKY_YELLOW,
      fields: [
        "id  uuid PK",
        "workspace_id  FK → Workspace",
        "author_id  FK → User",
        "body  text",
      ],
    },
  ];

  tables.forEach((t) => {
    const headerH = 36;
    const rowH = 28;
    const w = 240;
    const totalH = headerH + t.fields.length * rowH;
    elements.push(
      rect(t.x, t.y, w, totalH, {
        backgroundColor: "#ffffff",
        strokeColor: DARK,
        fillStyle: "solid",
        rounded: true,
      }),
      rect(t.x, t.y, w, headerH, {
        backgroundColor: t.color,
        strokeColor: DARK,
        fillStyle: "solid",
      }),
      text(t.x + 12, t.y + 8, t.title, { fontSize: 18 }),
    );
    t.fields.forEach((field, idx) => {
      elements.push(
        text(t.x + 12, t.y + headerH + 6 + idx * rowH, field, {
          fontSize: 14,
          width: w - 24,
        }),
      );
    });
  });

  elements.push(
    arrow(320, 130, [
      [0, 0],
      [40, 0],
    ]),
    arrow(600, 130, [
      [0, 0],
      [40, 0],
    ]),
  );

  return elements;
};
