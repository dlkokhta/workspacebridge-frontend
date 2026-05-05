import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Check, FileText, ImageIcon } from "lucide-react";

const HeroSideCard = () => (
  <div className="relative h-[420px]">
    {/* Chat card — top right */}
    <div
      className="absolute top-0 right-0 w-[310px] rounded-xl border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#151a17] p-[18px]"
      style={{ transform: "rotate(2deg)" }}
    >
      <div className="flex items-center gap-2.5 mb-3.5">
        <span className="w-[26px] h-[26px] rounded-[7px] bg-[#5a8a6b] text-white flex items-center justify-center font-semibold text-[11px] shrink-0">
          N
        </span>
        <div>
          <div className="text-[13px] font-medium text-[#1a201c] dark:text-[#e8ece9]">Northwind Studio</div>
          <div className="text-[11px] text-[#858c87] dark:text-[#6e7672]">3 unread messages</div>
        </div>
      </div>
      <div className="flex gap-2 mb-2.5">
        <div className="w-7 h-7 rounded-full bg-[#7a9bbf] text-white flex items-center justify-center text-[10px] font-medium shrink-0">
          SO
        </div>
        <div className="bg-[#f3f3ee] dark:bg-[#1c221e] rounded-xl rounded-tl-[4px] px-3 py-2 text-[12px] leading-[1.45] text-[#1a201c] dark:text-[#e8ece9] max-w-[200px]">
          Loving the new direction. Can we push the green a touch warmer?
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <div className="bg-[#5a8a6b] text-white rounded-xl rounded-tr-[4px] px-3 py-2 text-[12px] leading-[1.45] max-w-[200px]">
          On it — sending v3 in 20.
        </div>
      </div>
    </div>

    {/* Project status card — bottom left */}
    <div
      className="absolute bottom-0 left-0 w-[270px] rounded-xl border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#151a17] p-4"
      style={{ transform: "rotate(-3deg)" }}
    >
      <div className="text-[10px] text-[#858c87] dark:text-[#6e7672] mb-2.5 uppercase tracking-[0.08em]">Project · Q3 2026</div>
      <div className="text-[13px] font-semibold text-[#1a201c] dark:text-[#e8ece9] mb-2.5">Brand identity system</div>
      <div className="flex justify-between items-center text-[11px] text-[#858c87] dark:text-[#6e7672] mb-3.5">
        <span>Started Apr 1 · 6 weeks</span>
        <span className="inline-flex items-center gap-1 h-5 px-2 rounded-full bg-[rgba(90,138,107,0.12)] text-[#5a8a6b] border border-[rgba(90,138,107,0.28)] text-[10px] font-medium">
          <Check size={9} /> On track
        </span>
      </div>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="flex-1 h-1 rounded-sm"
            style={{ background: i <= 4 ? "#5a8a6b" : "rgba(255,255,255,0.1)" }}
          />
        ))}
      </div>
    </div>

    {/* File card — middle */}
    <div
      className="absolute top-[110px] left-10 w-[195px] rounded-xl border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#151a17] p-3.5"
      style={{ transform: "rotate(-1deg)" }}
    >
      <div className="flex items-center gap-2 mb-2.5">
        <FileText size={13} className="text-[#5a8a6b] shrink-0" />
        <div className="text-[12px] font-medium text-[#1a201c] dark:text-[#e8ece9] truncate">logo-v3.fig</div>
      </div>
      <div className="aspect-[16/10] bg-[rgba(90,138,107,0.12)] rounded-md flex items-center justify-center mb-2">
        <ImageIcon size={18} className="text-[#5a8a6b]" />
      </div>
      <div className="text-[10px] text-[#858c87] dark:text-[#6e7672]">2 comments · 14 MB</div>
    </div>
  </div>
);

export const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 px-8">
      <div className="max-w-[1200px] mx-auto grid grid-cols-[1.1fr_0.9fr] gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="inline-flex items-center gap-1.5 h-[26px] px-2.5 rounded-full bg-[rgba(90,138,107,0.12)] text-[#5a8a6b] border border-[rgba(90,138,107,0.28)] text-xs font-medium mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            Built for freelancers
          </span>

          <h1
            className="text-[clamp(36px,4.5vw,56px)] font-semibold text-[#1a201c] dark:text-[#e8ece9] tracking-[-0.03em] leading-[1.06] mb-5"
            style={{ textWrap: "balance" } as React.CSSProperties}
          >
            One workspace for everything between you and your client.
          </h1>

          <p className="text-[17px] text-[#5a625e] dark:text-[#a0a8a3] leading-[1.55] mb-7 max-w-[480px]">
            Stop stitching email, Slack, Drive, and Notion for every project. Give every client their own space — chat, files, whiteboard, and shared links in one place.
          </p>

          <div className="flex flex-wrap gap-3 mb-3.5">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/register")}
              className="inline-flex items-center gap-2 h-12 px-5 bg-[#5a8a6b] hover:bg-[#4f7a5e] text-white text-[15px] font-medium rounded-lg transition-colors cursor-pointer"
            >
              Create your workspace <ArrowRight size={15} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 h-12 px-5 border border-black/[0.16] dark:border-white/[0.14] text-[#1a201c] dark:text-[#e8ece9] hover:bg-black/5 dark:hover:bg-white/[0.04] text-[15px] font-medium rounded-lg transition-colors cursor-pointer"
            >
              See a demo
            </motion.button>
          </div>

        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <HeroSideCard />
        </motion.div>
      </div>
    </section>
  );
};
