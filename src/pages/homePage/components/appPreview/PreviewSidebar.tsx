import { Search } from "lucide-react";
import { LogoIcon } from "../../../../components/LogoIcon";

const WORKSPACES = [
  {
    name: "Kodex Labs",
    sub: "Web app development",
    mark: "K",
    color: "#7a9bbf",
    active: true,
  },
  {
    name: "Northwind Studio",
    sub: "Brand identity",
    mark: "N",
    color: "#5a8a6b",
  },
  { name: "Fold Coffee", sub: "Brand refresh", mark: "F", color: "#b5803a" },
  {
    name: "Atlas Logistics",
    sub: "Mobile concepts",
    mark: "A",
    color: "#9a7ab8",
  },
];

export const PreviewSidebar = () => (
  <div className="hidden md:flex bg-[#f3f3ee] dark:bg-[#0a0f0c] border-r border-black/[0.06] dark:border-white/[0.05] flex-col">
    <div className="px-3 py-3 flex items-center gap-2">
      <span className="w-5 h-5 rounded-[5px] bg-[#5a8a6b] text-white flex items-center justify-center shrink-0">
        <LogoIcon size={11} />
      </span>
      <span className="text-[13px] font-semibold text-[#1a201c] dark:text-[#e8ece9] tracking-tight">
        WorkspaceBridge
      </span>
    </div>
    <div className="px-2.5 pb-1">
      <div className="flex items-center gap-2 px-2.5 py-2 bg-white dark:bg-[#151a17] border border-black/[0.08] dark:border-white/[0.07] rounded-lg text-[#858c87] dark:text-[#6e7672] text-[12px]">
        <Search size={12} />
        <span>Search workspaces</span>
      </div>
    </div>
    <div className="px-3 py-1.5 text-[10px] uppercase tracking-[0.08em] text-[#858c87] dark:text-[#6e7672] font-medium">
      Workspaces
    </div>
    <div className="flex flex-col gap-0.5 px-2 flex-1">
      {WORKSPACES.map((w) => (
        <div
          key={w.name}
          className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[12px] ${
            w.active
              ? "bg-[rgba(90,138,107,0.12)] text-[#1a201c] dark:text-[#e8ece9]"
              : "text-[#5a625e] dark:text-[#a0a8a3]"
          }`}
        >
          <span
            className="w-5 h-5 rounded-[5px] text-white flex items-center justify-center text-[9px] font-semibold shrink-0"
            style={{ background: w.color }}
          >
            {w.mark}
          </span>
          <span className="flex flex-col min-w-0">
            <span className="font-medium truncate">{w.name}</span>
            <span className="text-[10px] text-[#858c87] dark:text-[#6e7672] truncate">
              {w.sub}
            </span>
          </span>
        </div>
      ))}
    </div>
  </div>
);
