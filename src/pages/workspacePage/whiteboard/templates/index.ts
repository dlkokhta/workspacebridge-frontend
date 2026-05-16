import { resetCounter } from "./helpers";
import type {
  TemplateElement,
  WhiteboardTemplate,
  WhiteboardTemplateCategory,
} from "./types";

import { buildBlank } from "./blank";
import { buildBrainstorm } from "./brainstorm";
import { buildStickyNotes } from "./stickyNotes";
import { buildMoodBoard } from "./moodBoard";
import { buildKanban } from "./kanban";
import { buildTimeline } from "./timeline";
import { buildMatrix2x2 } from "./matrix";
import { buildRetro } from "./retro";
import { buildFlowchart } from "./flowchart";
import { buildUserJourney } from "./userJourney";
import { buildWireframe } from "./wireframe";
import { buildSystemArchitecture } from "./systemArchitecture";
import { buildDatabaseSchema } from "./databaseSchema";
import { buildApiSequence } from "./apiSequence";
import { buildStateMachine } from "./stateMachine";

export type {
  WhiteboardTemplate,
  WhiteboardTemplateCategory,
} from "./types";

const finalize = (
  id: string,
  name: string,
  category: WhiteboardTemplateCategory,
  description: string,
  builder: () => TemplateElement[],
): WhiteboardTemplate => {
  resetCounter();
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
