interface ProgressBarProps {
  current: number;
  total: number;
}

export const ProgressBar = ({ current, total }: ProgressBarProps) => (
  <div className="flex gap-1.5 mb-8">
    {Array.from({ length: total }, (_, i) => i + 1).map((i) => (
      <div
        key={i}
        className="flex-1 h-[3px] rounded-full transition-colors duration-300"
        style={{ background: i <= current ? "#5a8a6b" : "rgba(0,0,0,0.08)" }}
      />
    ))}
  </div>
);
