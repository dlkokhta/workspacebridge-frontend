interface ToggleProps {
  on: boolean;
  onChange: () => void;
}

export const Toggle = ({ on, onChange }: ToggleProps) => (
  <button
    type="button"
    onClick={onChange}
    className={`w-8 h-[18px] rounded-full relative transition-colors shrink-0 cursor-pointer ${
      on ? "bg-[#5a8a6b]" : "bg-black/[0.16] dark:bg-white/[0.14]"
    }`}
    aria-pressed={on}
  >
    <span
      className={`absolute top-0.5 left-0.5 w-[14px] h-[14px] rounded-full transition-transform ${
        on ? "translate-x-[14px] bg-white" : "bg-[#1a201c] dark:bg-[#e8ece9]"
      }`}
    />
  </button>
);
