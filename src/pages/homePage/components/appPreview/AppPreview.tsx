import { PreviewMain } from "./PreviewMain";
import { PreviewSidebar } from "./PreviewSidebar";

export const AppPreview = () => (
  <section id="preview" className="pb-24 px-8">
    <div className="max-w-[1200px] mx-auto">
      <div className="rounded-2xl overflow-hidden border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#151a17]">
        {/* Browser chrome */}
        <div className="flex items-center gap-2 px-4 py-3 bg-[#f3f3ee] dark:bg-[#1c221e] border-b border-black/[0.06] dark:border-white/[0.05]">
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-[11px] h-[11px] rounded-full bg-black/[0.14] dark:bg-white/[0.14]"
              />
            ))}
          </div>
          <div className="flex-1 h-7 bg-[#fafaf7] dark:bg-[#0e1310] rounded-md flex items-center justify-center text-[11px] text-[#858c87] dark:text-[#6e7672] font-mono">
            workspacebridge.app/w/northwind-studio
          </div>
          <div className="w-8" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr]" style={{ height: 520 }}>
          <PreviewSidebar />
          <PreviewMain />
        </div>
      </div>
    </div>
  </section>
);
