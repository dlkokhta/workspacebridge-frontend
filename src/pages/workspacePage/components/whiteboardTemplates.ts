/**
 * Starter templates for new whiteboards. Each template is a list of
 * Excalidraw elements that will be passed as `initialData.elements`
 * when the board is created.
 */

export type WhiteboardTemplateCategory =
  | "Quick start"
  | "Ideation"
  | "Planning & tracking"
  | "Process & UX"
  | "Developer";

export interface WhiteboardTemplate {
  id: string;
  name: string;
  category: WhiteboardTemplateCategory;
  description: string;
  elements: readonly TemplateElement[];
}

type TemplateElement = Record<string, unknown>;

interface ElementOptions {
  strokeColor?: string;
  backgroundColor?: string;
  fillStyle?: "solid" | "hachure" | "cross-hatch";
  strokeWidth?: number;
  strokeStyle?: "solid" | "dashed" | "dotted";
  roughness?: number;
  rounded?: boolean;
}

interface TextOptions extends ElementOptions {
  fontSize?: number;
  fontFamily?: 1 | 2 | 3;
  textAlign?: "left" | "center" | "right";
  verticalAlign?: "top" | "middle" | "bottom";
  width?: number;
  height?: number;
}

interface ArrowOptions extends ElementOptions {
  endArrowhead?: "arrow" | null;
  startArrowhead?: "arrow" | null;
}

const DARK = "#1a201c";
const SAGE = "#5a8a6b";
const STICKY_YELLOW = "#fff9c4";
const STICKY_GREEN = "#d3f4d8";
const STICKY_BLUE = "#d8e6f4";
const STICKY_PINK = "#f4d8e6";
const STICKY_ORANGE = "#fce5cd";
const STICKY_PURPLE = "#e8d8f4";
const NEUTRAL_BG = "#f5f5f0";

let elementCounter = 0;
const nextId = (prefix: string) => `tpl-${prefix}-${elementCounter++}`;
const nextIndex = () => `a${elementCounter.toString(36).padStart(4, "0")}`;

const baseDefaults = (opts: ElementOptions = {}): TemplateElement => ({
  angle: 0,
  strokeColor: opts.strokeColor ?? DARK,
  backgroundColor: opts.backgroundColor ?? "transparent",
  fillStyle: opts.fillStyle ?? "solid",
  strokeWidth: opts.strokeWidth ?? 2,
  strokeStyle: opts.strokeStyle ?? "solid",
  roughness: opts.roughness ?? 1,
  opacity: 100,
  groupIds: [],
  frameId: null,
  roundness: opts.rounded ? { type: 3 } : null,
  seed: Math.floor(Math.random() * 2 ** 31),
  version: 1,
  versionNonce: Math.floor(Math.random() * 2 ** 31),
  isDeleted: false,
  boundElements: null,
  updated: 1,
  link: null,
  locked: false,
  customData: null,
  index: nextIndex(),
});

const rect = (
  x: number,
  y: number,
  width: number,
  height: number,
  opts: ElementOptions = {},
): TemplateElement => ({
  ...baseDefaults(opts),
  id: nextId("rect"),
  type: "rectangle",
  x,
  y,
  width,
  height,
});

const ellipse = (
  x: number,
  y: number,
  width: number,
  height: number,
  opts: ElementOptions = {},
): TemplateElement => ({
  ...baseDefaults(opts),
  id: nextId("ellipse"),
  type: "ellipse",
  x,
  y,
  width,
  height,
});

const diamond = (
  x: number,
  y: number,
  width: number,
  height: number,
  opts: ElementOptions = {},
): TemplateElement => ({
  ...baseDefaults(opts),
  id: nextId("diamond"),
  type: "diamond",
  x,
  y,
  width,
  height,
});

const text = (
  x: number,
  y: number,
  content: string,
  opts: TextOptions = {},
): TemplateElement => {
  const fontSize = opts.fontSize ?? 20;
  const width = opts.width ?? Math.max(content.length * fontSize * 0.55, 80);
  const height = opts.height ?? fontSize * 1.25;
  return {
    ...baseDefaults(opts),
    id: nextId("text"),
    type: "text",
    x,
    y,
    width,
    height,
    text: content,
    originalText: content,
    fontSize,
    fontFamily: opts.fontFamily ?? 1,
    textAlign: opts.textAlign ?? "left",
    verticalAlign: opts.verticalAlign ?? "top",
    baseline: Math.round(fontSize * 0.8),
    containerId: null,
    autoResize: true,
    lineHeight: 1.25,
  };
};

const arrow = (
  x: number,
  y: number,
  points: ReadonlyArray<readonly [number, number]>,
  opts: ArrowOptions = {},
): TemplateElement => {
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  const width = Math.max(...xs) - Math.min(...xs);
  const height = Math.max(...ys) - Math.min(...ys);
  return {
    ...baseDefaults(opts),
    id: nextId("arrow"),
    type: "arrow",
    x,
    y,
    width,
    height,
    points,
    lastCommittedPoint: null,
    startBinding: null,
    endBinding: null,
    startArrowhead: opts.startArrowhead ?? null,
    endArrowhead: opts.endArrowhead === undefined ? "arrow" : opts.endArrowhead,
    elbowed: false,
  };
};

const line = (
  x: number,
  y: number,
  points: ReadonlyArray<readonly [number, number]>,
  opts: ElementOptions = {},
): TemplateElement => {
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  const width = Math.max(...xs) - Math.min(...xs);
  const height = Math.max(...ys) - Math.min(...ys);
  return {
    ...baseDefaults(opts),
    id: nextId("line"),
    type: "line",
    x,
    y,
    width,
    height,
    points,
    lastCommittedPoint: null,
    startBinding: null,
    endBinding: null,
    startArrowhead: null,
    endArrowhead: null,
  };
};

const heading = (x: number, y: number, content: string): TemplateElement =>
  text(x, y, content, { fontSize: 28, fontFamily: 1 });

const label = (
  x: number,
  y: number,
  content: string,
  options: TextOptions = {},
): TemplateElement => text(x, y, content, { fontSize: 18, ...options });

const sticky = (
  x: number,
  y: number,
  color: string,
  content: string,
): TemplateElement[] => [
  rect(x, y, 160, 120, {
    backgroundColor: color,
    fillStyle: "solid",
    strokeColor: DARK,
    rounded: true,
  }),
  text(x + 16, y + 16, content, { fontSize: 16, width: 128 }),
];

const buildBlank = (): TemplateElement[] => [];

const buildBrainstorm = (): TemplateElement[] => {
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

const buildStickyNotes = (): TemplateElement[] => {
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

const buildMoodBoard = (): TemplateElement[] => {
  const elements: TemplateElement[] = [
    heading(80, 40, "Mood board"),
    label(80, 80, "Drop images, swatches, and references that capture the vibe.", {
      fontSize: 14,
      width: 600,
    }),
  ];
  const tiles: Array<{ w: number; h: number }> = [
    { w: 260, h: 180 },
    { w: 200, h: 180 },
    { w: 220, h: 180 },
    { w: 180, h: 220 },
    { w: 280, h: 220 },
    { w: 220, h: 220 },
  ];
  let x = 80;
  let y = 130;
  let rowMax = 0;
  for (const tile of tiles) {
    if (x + tile.w > 800) {
      x = 80;
      y += rowMax + 20;
      rowMax = 0;
    }
    elements.push(
      rect(x, y, tile.w, tile.h, {
        backgroundColor: NEUTRAL_BG,
        strokeColor: DARK,
        strokeStyle: "dashed",
        fillStyle: "solid",
        rounded: true,
      }),
    );
    x += tile.w + 20;
    rowMax = Math.max(rowMax, tile.h);
  }
  return elements;
};

const buildKanban = (): TemplateElement[] => {
  const cols = [
    { title: "To do", color: STICKY_YELLOW },
    { title: "In progress", color: STICKY_BLUE },
    { title: "Done", color: STICKY_GREEN },
  ];
  const elements: TemplateElement[] = [heading(80, 40, "Kanban board")];
  const startX = 80;
  const startY = 100;
  const colWidth = 240;
  const colHeight = 500;
  const gap = 20;

  cols.forEach((col, idx) => {
    const x = startX + idx * (colWidth + gap);
    elements.push(
      rect(x, startY, colWidth, colHeight, {
        backgroundColor: NEUTRAL_BG,
        strokeColor: DARK,
        fillStyle: "solid",
        rounded: true,
      }),
      text(x + 16, startY + 16, col.title, {
        fontSize: 22,
        fontFamily: 1,
      }),
    );
    for (let i = 0; i < 2; i++) {
      elements.push(
        ...sticky(
          x + 20,
          startY + 70 + i * 140,
          col.color,
          `${col.title} item ${i + 1}`,
        ),
      );
    }
  });

  return elements;
};

const buildTimeline = (): TemplateElement[] => {
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

const buildMatrix2x2 = (): TemplateElement[] => {
  const ox = 120;
  const oy = 120;
  const size = 480;
  const half = size / 2;
  return [
    heading(ox, oy - 60, "Impact × Effort matrix"),
    rect(ox, oy, size, size, {
      backgroundColor: NEUTRAL_BG,
      strokeColor: DARK,
      fillStyle: "solid",
    }),
    line(ox, oy + half, [
      [0, 0],
      [size, 0],
    ]),
    line(ox + half, oy, [
      [0, 0],
      [0, size],
    ]),
    label(ox + 20, oy + 20, "Quick wins", {
      fontSize: 18,
      strokeColor: SAGE,
    }),
    label(ox + half + 20, oy + 20, "Major projects", {
      fontSize: 18,
      strokeColor: SAGE,
    }),
    label(ox + 20, oy + half + 20, "Fill-ins", {
      fontSize: 18,
      strokeColor: DARK,
    }),
    label(ox + half + 20, oy + half + 20, "Reconsider", {
      fontSize: 18,
      strokeColor: "#a8554a",
    }),
    label(ox - 80, oy + half - 12, "Impact ↑", { fontSize: 14 }),
    label(ox + half - 32, oy + size + 20, "Effort →", { fontSize: 14 }),
  ];
};

const buildRetro = (): TemplateElement[] => {
  const cols = [
    { title: "Liked", color: STICKY_GREEN },
    { title: "Disliked", color: STICKY_PINK },
    { title: "Action items", color: STICKY_YELLOW },
  ];
  const elements: TemplateElement[] = [heading(80, 40, "Retro")];
  const startX = 80;
  const startY = 100;
  const colWidth = 240;
  const colHeight = 500;
  const gap = 20;

  cols.forEach((col, idx) => {
    const x = startX + idx * (colWidth + gap);
    elements.push(
      rect(x, startY, colWidth, colHeight, {
        backgroundColor: NEUTRAL_BG,
        strokeColor: DARK,
        fillStyle: "solid",
        rounded: true,
      }),
      text(x + 16, startY + 16, col.title, { fontSize: 22 }),
    );
    for (let i = 0; i < 2; i++) {
      elements.push(
        ...sticky(x + 20, startY + 70 + i * 140, col.color, ""),
      );
    }
  });

  return elements;
};

const buildFlowchart = (): TemplateElement[] => [
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

const buildUserJourney = (): TemplateElement[] => {
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

const buildWireframe = (): TemplateElement[] => {
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

const buildSystemArchitecture = (): TemplateElement[] => {
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

const buildDatabaseSchema = (): TemplateElement[] => {
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

const buildApiSequence = (): TemplateElement[] => {
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

const buildStateMachine = (): TemplateElement[] => {
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

const reset = (): void => {
  elementCounter = 0;
};

const finalize = (
  id: string,
  name: string,
  category: WhiteboardTemplateCategory,
  description: string,
  builder: () => TemplateElement[],
): WhiteboardTemplate => {
  reset();
  return { id, name, category, description, elements: builder() };
};

export const WHITEBOARD_TEMPLATES: readonly WhiteboardTemplate[] = [
  finalize(
    "blank",
    "Blank",
    "Quick start",
    "An empty canvas to start from scratch.",
    buildBlank,
  ),
  finalize(
    "brainstorm",
    "Brainstorm",
    "Ideation",
    "Central idea with branching thoughts.",
    buildBrainstorm,
  ),
  finalize(
    "sticky-notes",
    "Sticky notes wall",
    "Ideation",
    "Colorful grid of empty stickies for free-form ideas.",
    buildStickyNotes,
  ),
  finalize(
    "mood-board",
    "Mood board",
    "Ideation",
    "Drop visual references, swatches, and inspiration.",
    buildMoodBoard,
  ),
  finalize(
    "kanban",
    "Kanban",
    "Planning & tracking",
    "To do · In progress · Done columns.",
    buildKanban,
  ),
  finalize(
    "timeline",
    "Timeline",
    "Planning & tracking",
    "Project milestones along a horizontal arrow.",
    buildTimeline,
  ),
  finalize(
    "matrix",
    "2×2 Matrix",
    "Planning & tracking",
    "Impact vs Effort prioritization grid.",
    buildMatrix2x2,
  ),
  finalize(
    "retro",
    "Retro",
    "Planning & tracking",
    "Liked · Disliked · Action items review board.",
    buildRetro,
  ),
  finalize(
    "flowchart",
    "Flowchart",
    "Process & UX",
    "Start → process → decision → end shapes.",
    buildFlowchart,
  ),
  finalize(
    "user-journey",
    "User journey map",
    "Process & UX",
    "Stages, actions, and emotions across the user path.",
    buildUserJourney,
  ),
  finalize(
    "wireframe",
    "Wireframe",
    "Process & UX",
    "Browser frame with header, hero, cards, and footer.",
    buildWireframe,
  ),
  finalize(
    "system-architecture",
    "System architecture",
    "Developer",
    "Client · Server · Data layered diagram.",
    buildSystemArchitecture,
  ),
  finalize(
    "database-schema",
    "Database schema",
    "Developer",
    "Tables with fields and foreign-key relations.",
    buildDatabaseSchema,
  ),
  finalize(
    "api-sequence",
    "API sequence diagram",
    "Developer",
    "Client · Server · Database lanes with request flow.",
    buildApiSequence,
  ),
  finalize(
    "state-machine",
    "State machine",
    "Developer",
    "States and transitions for proposal-style workflows.",
    buildStateMachine,
  ),
];

export const TEMPLATE_CATEGORIES: readonly WhiteboardTemplateCategory[] = [
  "Quick start",
  "Ideation",
  "Planning & tracking",
  "Process & UX",
  "Developer",
];
