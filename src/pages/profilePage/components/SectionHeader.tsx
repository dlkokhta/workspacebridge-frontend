interface SectionHeaderProps {
  title: string;
  desc?: string;
}

export const SectionHeader = ({ title, desc }: SectionHeaderProps) => (
  <div className="mb-2">
    <h2 className="text-[24px] font-semibold tracking-[-0.02em] mb-1.5 text-[#1a201c] dark:text-[#e8ece9]">
      {title}
    </h2>
    {desc && (
      <p className="text-[14px] text-[#5a625e] dark:text-[#a0a8a3]">{desc}</p>
    )}
  </div>
);
