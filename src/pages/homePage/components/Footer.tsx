import { LogoIcon } from "../../../components/LogoIcon";

export const Footer = () => (
  <footer className="border-t border-black/[0.06] dark:border-white/[0.05] py-12 px-8 bg-[#fafaf7] dark:bg-[#0e1310]">
    <div className="max-w-[1200px] mx-auto flex items-center justify-between flex-wrap gap-4">
      <div className="flex items-center gap-2 text-[#858c87] dark:text-[#6e7672]">
        <span className="w-5 h-5 rounded-[5px] bg-current/20 flex items-center justify-center">
          <LogoIcon size={11} />
        </span>
        <span className="text-sm font-medium">WorkspaceBridge</span>
      </div>
      <div className="flex gap-6 text-[13px] text-[#858c87] dark:text-[#6e7672]">
        {["Privacy", "Terms", "Changelog"].map((l) => (
          <a key={l} href="#" className="hover:text-[#1a201c] dark:hover:text-[#e8ece9] transition-colors no-underline">
            {l}
          </a>
        ))}
      </div>
      <div className="text-[12px] text-[#b5bbb7] dark:text-[#4a514d]">© 2026 WorkspaceBridge</div>
    </div>
  </footer>
);
