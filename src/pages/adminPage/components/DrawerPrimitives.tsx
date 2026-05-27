export function Badge({
  label,
  variant,
}: {
  label: string;
  variant: "role" | "success" | "danger" | "info" | "neutral";
}) {
  const cls = {
    role: "bg-[#9b7abf]/10 text-[#7a5a9b] dark:text-[#b89adb] border-[#9b7abf]/30",
    success:
      "bg-[#5a8a6b]/10 text-[#3e6a4d] dark:text-[#6db383] border-[#5a8a6b]/30",
    danger:
      "bg-[#c25a4a]/10 text-[#c25a4a] dark:text-[#e07b6b] border-[#c25a4a]/30",
    info: "bg-[#7a9bbf]/10 text-[#4a6a8a] dark:text-[#7a9bbf] border-[#7a9bbf]/30",
    neutral:
      "bg-black/[0.04] dark:bg-white/[0.04] text-[#858c87] dark:text-[#6e7672] border-black/[0.08] dark:border-white/[0.07]",
  }[variant];

  return (
    <span
      className={`inline-flex items-center h-[20px] px-2 rounded-full border text-[10px] font-medium ${cls}`}
    >
      {label}
    </span>
  );
}

export function ActionButton({
  icon,
  label,
  variant,
  loading,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  variant: "default" | "danger" | "success";
  loading: boolean;
  onClick: () => void;
}) {
  const cls = {
    default:
      "border-black/[0.08] dark:border-white/[0.07] text-[#5a625e] dark:text-[#a0a8a3] hover:bg-[#f6f6f1] dark:hover:bg-[#222b26]",
    danger:
      "border-[#c25a4a]/30 text-[#c25a4a] dark:text-[#e07b6b] hover:bg-[#c25a4a]/5",
    success:
      "border-[#5a8a6b]/30 text-[#5a8a6b] dark:text-[#6db383] hover:bg-[#5a8a6b]/5",
  }[variant];

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`h-8 px-3 inline-flex items-center gap-1.5 rounded-lg border text-[12px] font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${cls}`}
    >
      {icon}
      {loading ? "…" : label}
    </button>
  );
}

export function Section({
  icon,
  title,
  count,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#151a17] overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-black/[0.06] dark:border-white/[0.05]">
        <span className="text-[#858c87] dark:text-[#6e7672]">{icon}</span>
        <span className="text-[13px] font-medium text-[#1a201c] dark:text-[#e8ece9]">
          {title}
        </span>
        <span className="ml-auto text-[11px] text-[#858c87] dark:text-[#6e7672]">
          {count}
        </span>
      </div>
      <div className="px-4 py-3">{children}</div>
    </div>
  );
}

export function StatusPill({ status }: { status: string }) {
  const cls =
    {
      ACTIVE:
        "bg-[#5a8a6b]/10 text-[#3e6a4d] dark:text-[#6db383] border-[#5a8a6b]/30",
      COMPLETED:
        "bg-[#7a9bbf]/10 text-[#4a6a8a] dark:text-[#7a9bbf] border-[#7a9bbf]/30",
      ARCHIVED:
        "bg-black/[0.04] dark:bg-white/[0.04] text-[#858c87] dark:text-[#6e7672] border-black/[0.08] dark:border-white/[0.07]",
    }[status] ??
    "bg-black/[0.04] dark:bg-white/[0.04] text-[#858c87] dark:text-[#6e7672] border-black/[0.08] dark:border-white/[0.07]";

  return (
    <span
      className={`inline-flex items-center h-[18px] px-1.5 rounded-full border text-[9px] font-medium shrink-0 ${cls}`}
    >
      {status}
    </span>
  );
}

export function EmptyRow({ text }: { text: string }) {
  return (
    <p className="text-[12px] text-[#b5bbb7] dark:text-[#4a514d] py-1">
      {text}
    </p>
  );
}
