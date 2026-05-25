import type { WhiteboardTemplate } from "../templates";
import { FALLBACK_TEMPLATE_ICON, TEMPLATE_ICONS } from "./icons";

interface TemplateCardProps {
  template: WhiteboardTemplate;
  selected: boolean;
  onSelect: (id: string) => void;
}

export const TemplateCard = ({
  template,
  selected,
  onSelect,
}: TemplateCardProps) => {
  const Icon = TEMPLATE_ICONS[template.id] ?? FALLBACK_TEMPLATE_ICON;

  return (
    <button
      onClick={() => onSelect(template.id)}
      className={`flex flex-col items-start gap-1.5 p-3 rounded-md border text-left transition-colors cursor-pointer ${
        selected
          ? "border-[#5a8a6b] bg-[#5a8a6b]/[0.08] dark:bg-[#5a8a6b]/[0.15]"
          : "border-black/[0.08] dark:border-white/[0.07] hover:bg-black/[0.03] dark:hover:bg-white/[0.03]"
      }`}
    >
      <Icon
        size={20}
        className={
          selected ? "text-[#5a8a6b]" : "text-[#5a625e] dark:text-[#a0a8a3]"
        }
      />
      <span className="text-[13px] font-medium text-[#1a201c] dark:text-[#fafaf7]">
        {template.name}
      </span>
      <span className="text-[11px] leading-snug text-[#858c87] dark:text-[#6e7672]">
        {template.description}
      </span>
    </button>
  );
};
