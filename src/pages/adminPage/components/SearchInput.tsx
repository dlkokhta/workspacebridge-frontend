import { Search } from "lucide-react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SearchInput = ({
  value,
  onChange,
  placeholder = "Search…",
}: SearchInputProps) => (
  <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-[#151a17] border border-black/[0.08] dark:border-white/[0.07] rounded-lg text-[12px]">
    <Search size={13} className="text-[#858c87] dark:text-[#6e7672] shrink-0" />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="bg-transparent outline-none flex-1 text-[#1a201c] dark:text-[#e8ece9] placeholder:text-[#b5bbb7] dark:placeholder:text-[#4a514d]"
    />
  </div>
);
