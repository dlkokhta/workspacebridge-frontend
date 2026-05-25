import {
  TEMPLATE_CATEGORIES,
  WHITEBOARD_TEMPLATES,
  type WhiteboardTemplate,
  type WhiteboardTemplateCategory,
} from "../templates";
import { TemplateCard } from "./TemplateCard";

interface TemplateGridProps {
  selectedId: string;
  onSelect: (id: string) => void;
}

const groupByCategory = (): Record<
  WhiteboardTemplateCategory,
  WhiteboardTemplate[]
> => {
  const groups = {
    "Quick start": [],
    Ideation: [],
    "Planning & tracking": [],
    "Process & UX": [],
    Developer: [],
  } as Record<WhiteboardTemplateCategory, WhiteboardTemplate[]>;
  for (const template of WHITEBOARD_TEMPLATES) {
    groups[template.category].push(template);
  }
  return groups;
};

export const TemplateGrid = ({ selectedId, onSelect }: TemplateGridProps) => {
  const grouped = groupByCategory();

  return (
    <>
      {TEMPLATE_CATEGORIES.map((category) => {
        const items = grouped[category];
        if (items.length === 0) return null;
        return (
          <section key={category} className="mb-5 last:mb-0">
            <h3 className="mb-2 text-[11px] uppercase tracking-wider font-semibold text-[#858c87] dark:text-[#6e7672]">
              {category}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {items.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  selected={template.id === selectedId}
                  onSelect={onSelect}
                />
              ))}
            </div>
          </section>
        );
      })}
    </>
  );
};
