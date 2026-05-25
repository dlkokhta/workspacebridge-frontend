interface RowProps {
  title: string;
  desc?: string;
  children: React.ReactNode;
}

export const Row = ({ title, desc, children }: RowProps) => (
  <div className="flex items-start justify-between gap-6 py-5 border-b border-black/[0.06] dark:border-white/[0.05]">
    <div className="flex-1">
      <div className="text-[14px] font-medium text-[#1a201c] dark:text-[#e8ece9] mb-1">
        {title}
      </div>
      {desc && (
        <div className="text-[13px] text-[#5a625e] dark:text-[#a0a8a3] leading-[1.5] max-w-[380px]">
          {desc}
        </div>
      )}
    </div>
    <div className="flex items-center gap-2 shrink-0">{children}</div>
  </div>
);
