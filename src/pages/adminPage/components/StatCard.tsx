interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  accent?: "green" | "blue";
}

export const StatCard = ({ icon, label, value, accent }: StatCardProps) => {
  const iconColor =
    accent === "green"
      ? "text-[#5a8a6b]"
      : accent === "blue"
        ? "text-[#7a9bbf]"
        : "text-[#858c87] dark:text-[#6e7672]";

  return (
    <div className="px-4 py-3.5 rounded-xl border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#151a17]">
      <div className={`mb-2 ${iconColor}`}>{icon}</div>
      <div className="text-[24px] font-semibold tracking-[-0.02em] text-[#1a201c] dark:text-[#e8ece9]">
        {value}
      </div>
      <div className="text-[12px] text-[#858c87] dark:text-[#6e7672] mt-0.5">{label}</div>
    </div>
  );
};
