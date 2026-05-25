interface SmallBtnProps {
  children: React.ReactNode;
  variant?: "secondary" | "primary" | "outline" | "danger";
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
  type?: "button" | "submit";
}

const STYLES = {
  secondary:
    "border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#1c221e] text-[#1a201c] dark:text-[#e8ece9] hover:bg-[#f6f6f1] dark:hover:bg-[#222b26]",
  primary: "bg-[#5a8a6b] hover:bg-[#4f7a5e] text-white",
  outline:
    "border border-black/[0.16] dark:border-white/[0.14] bg-transparent text-[#1a201c] dark:text-[#e8ece9] hover:bg-black/[0.05] dark:hover:bg-white/[0.05]",
  danger:
    "border border-black/[0.08] dark:border-white/[0.07] bg-transparent text-[#c25a4a] dark:text-[#e07b6b] hover:bg-[#c25a4a]/[0.08]",
} as const;

const BASE =
  "shrink-0 h-8 px-3 inline-flex items-center gap-1.5 rounded-lg text-[12px] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

export const SmallBtn = ({
  children,
  variant = "secondary",
  onClick,
  disabled,
  title,
  type = "button",
}: SmallBtnProps) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`${BASE} ${STYLES[variant]} cursor-pointer`}
  >
    {children}
  </button>
);
