interface TypingIndicatorProps {
  names: string[];
}

export const TypingIndicator = ({ names }: TypingIndicatorProps) => {
  if (names.length === 0) return null;

  const label =
    names.length === 1
      ? `${names[0]} is typing`
      : names.length === 2
        ? `${names[0]} and ${names[1]} are typing`
        : "Several people are typing";

  return (
    <div className="px-6 h-5 flex items-center gap-1.5 text-[12px] text-[#858c87] dark:text-[#6e7672]">
      <span className="flex items-center gap-[3px]">
        <span className="w-1 h-1 rounded-full bg-[#858c87] dark:bg-[#6e7672] animate-bounce" />
        <span className="w-1 h-1 rounded-full bg-[#858c87] dark:bg-[#6e7672] animate-bounce [animation-delay:150ms]" />
        <span className="w-1 h-1 rounded-full bg-[#858c87] dark:bg-[#6e7672] animate-bounce [animation-delay:300ms]" />
      </span>
      <span>{label}…</span>
    </div>
  );
};
