export const AppSidePreview = () => (
  <div className="max-w-[460px] w-full">
    <div className="rounded-xl border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#151a17] overflow-hidden mb-6">
      <div className="flex items-center gap-2 px-3.5 py-2.5 bg-[#f3f3ee] dark:bg-[#1c221e] border-b border-black/[0.06] dark:border-white/[0.05]">
        <div className="flex gap-1.5">
          <span className="w-[11px] h-[11px] rounded-full bg-black/[0.14] dark:bg-white/[0.14]" />
          <span className="w-[11px] h-[11px] rounded-full bg-black/[0.14] dark:bg-white/[0.14]" />
          <span className="w-[11px] h-[11px] rounded-full bg-black/[0.14] dark:bg-white/[0.14]" />
        </div>
        <div className="flex-1 h-6 bg-[#0e1310]/[0.06] dark:bg-white/[0.06] rounded-md flex items-center justify-center font-mono text-[11px] text-[#858c87] dark:text-[#6e7672]">
          workspacebridge.app/w/kodex-labs
        </div>
        <div className="w-[30px]" />
      </div>
      <div className="p-5 bg-[#fafaf7] dark:bg-[#151a17]">
        <div className="flex items-center gap-2.5 mb-4">
          <span className="w-7 h-7 rounded-lg bg-[#5a8a6b] text-white flex items-center justify-center font-semibold text-[11px] shrink-0">
            K
          </span>
          <div>
            <div className="text-[14px] font-semibold text-[#1a201c] dark:text-[#e8ece9]">
              Kodex Labs
            </div>
            <div className="text-[11px] text-[#858c87] dark:text-[#6e7672]">
              Web app · Q3
            </div>
          </div>
          <div className="ml-auto flex items-center gap-1.5 h-[22px] px-2.5 rounded-full bg-[#f3f3ee] dark:bg-[#1c221e] border border-black/[0.08] dark:border-white/[0.07] text-[10px] font-medium text-[#5a625e] dark:text-[#a0a8a3]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4a8a5e] dark:bg-[#6db383]" />
            2 online
          </div>
        </div>
        <div className="flex flex-col gap-2.5">
          <div className="flex gap-2">
            <div className="w-6 h-6 rounded-full bg-[#7a9bbf] text-white flex items-center justify-center text-[10px] font-medium shrink-0">
              JD
            </div>
            <div className="bg-[#f3f3ee] dark:bg-[#1c221e] px-3 py-2 rounded-xl rounded-tl-[4px] text-[12px] leading-[1.45] text-[#1a201c] dark:text-[#e8ece9] max-w-[280px]">
              The dashboard flow looks clean — ship it.
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <div className="bg-[#5a8a6b] text-white px-3 py-2 rounded-xl rounded-tr-[4px] text-[12px] leading-[1.45] max-w-[280px]">
              Deploying to staging now, link drops in Files.
            </div>
          </div>
        </div>
      </div>
    </div>

    <blockquote
      className="m-0 p-0 text-[17px] leading-[1.5] tracking-[-0.01em] text-[#1a201c] dark:text-[#e8ece9]"
      style={{ textWrap: "pretty" } as React.CSSProperties}
    >
      "I onboarded a new client in under a minute. They opened the link, saw
      the workspace, and we were already chatting."
    </blockquote>
    <div className="mt-4 text-[13px] text-[#5a625e] dark:text-[#a0a8a3]">
      <span className="font-medium text-[#1a201c] dark:text-[#e8ece9]">
        Devon
      </span>{" "}
      · Full-stack developer · 8 active clients
    </div>
  </div>
);
