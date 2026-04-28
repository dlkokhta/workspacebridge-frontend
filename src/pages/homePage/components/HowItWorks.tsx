const Step = ({ n, title, desc }: { n: string; title: string; desc: string }) => (
  <div>
    <div className="flex items-center gap-3 mb-3.5">
      <div className="w-8 h-8 rounded-full bg-[rgba(90,138,107,0.12)] text-[#5a8a6b] flex items-center justify-center font-semibold text-[14px] shrink-0">
        {n}
      </div>
      <div className="flex-1 h-px bg-black/[0.05] dark:bg-white/[0.05]" />
    </div>
    <h3 className="text-[20px] font-semibold text-[#1a201c] dark:text-[#e8ece9] tracking-tight mb-2">{title}</h3>
    <p className="text-[14px] text-[#5a625e] dark:text-[#a0a8a3] leading-[1.6]">{desc}</p>
  </div>
);

export const HowItWorks = () => (
  <section id="how" className="py-24 px-8 bg-[#f3f3ee] dark:bg-[#0a0f0c] border-t border-b border-black/[0.06] dark:border-white/[0.05]">
    <div className="max-w-[1200px] mx-auto">
      <div className="max-w-[640px] mb-12">
        <span className="block text-xs font-medium uppercase tracking-[0.08em] text-[#5a8a6b] mb-3">How it works</span>
        <h2 className="text-[40px] font-semibold text-[#1a201c] dark:text-[#e8ece9] tracking-[-0.025em] leading-tight">
          Three steps to a calmer client relationship.
        </h2>
      </div>
      <div className="grid grid-cols-3 gap-8">
        <Step n="1" title="Create a workspace for your client"
          desc="Name the project, pick a color, and add a description. Takes about 30 seconds." />
        <Step n="2" title="Invite your client with one link"
          desc="Send a magic link — no app downloads, no passwords, no setup. They're in within a minute." />
        <Step n="3" title="Manage everything in one place"
          desc="Chat, files, shared links, and whiteboards stay together. Search across years of client history." />
      </div>
    </div>
  </section>
);
