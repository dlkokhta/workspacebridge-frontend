import { useState } from "react";
import { Download, File, Image, Pencil, Plus } from "lucide-react";

const TOOLS = [
  { id: "select", label: "Select", icon: "↖" },
  { id: "pen", label: "Pen", icon: <Pencil size={15} /> },
  { id: "text", label: "Text", icon: "T" },
  { id: "sticky", label: "Sticky", icon: <File size={15} /> },
  { id: "image", label: "Image", icon: <Image size={15} /> },
];

interface StickyNoteProps {
  x: number;
  y: number;
  color: string;
  rotate: number;
  children: React.ReactNode;
}

const StickyNote = ({ x, y, color, rotate, children }: StickyNoteProps) => (
  <div
    className="absolute p-3.5 text-white rounded-lg z-[2] shadow-md w-44"
    style={{ left: x, top: y, background: color, transform: `rotate(${rotate}deg)` }}
  >
    {children}
  </div>
);

export const WhiteboardTab = () => {
  const [tool, setTool] = useState("select");

  return (
    <div className="flex flex-col flex-1 overflow-hidden min-h-0">
      <div className="flex items-center justify-between px-6 py-3 border-b border-black/[0.06] dark:border-white/[0.05]">
        <div className="flex items-center gap-3">
          <span className="text-[13px] font-medium text-[#1a201c] dark:text-[#e8ece9]">Brand exploration · Apr 26</span>
          <span className="inline-flex items-center gap-1.5 h-[22px] px-2.5 rounded-full bg-[#5a8a6b]/10 border border-[#5a8a6b]/20 text-[11px] font-medium text-[#3e6a4d] dark:text-[#6db383]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6db383]" />
            2 editing
          </span>
        </div>
        <div className="flex gap-1.5">
          <button className="h-8 px-3 inline-flex items-center gap-1.5 rounded-lg bg-white dark:bg-[#1c221e] border border-black/[0.08] dark:border-white/[0.07] text-[12px] font-medium text-[#5a625e] dark:text-[#a0a8a3] hover:bg-[#f6f6f1] dark:hover:bg-[#222b26] transition-colors cursor-pointer">
            <Download size={13} /> Export
          </button>
          <button className="h-8 px-3 inline-flex items-center gap-1.5 rounded-lg bg-[#5a8a6b] hover:bg-[#4f7a5e] text-white text-[12px] font-medium transition-colors cursor-pointer">
            <Plus size={13} /> New board
          </button>
        </div>
      </div>

      <div
        className="flex-1 relative overflow-hidden bg-[#f3f3ee] dark:bg-[#0a0f0c]"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(90,138,107,0.25) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      >
        <div className="absolute left-4 top-4 bg-white dark:bg-[#151a17] border border-black/[0.08] dark:border-white/[0.07] rounded-xl p-1 flex flex-col gap-0.5 z-10">
          {TOOLS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTool(t.id)}
              title={t.label}
              className={`w-9 h-9 rounded-lg flex items-center justify-center text-[14px] font-medium transition-colors ${
                tool === t.id
                  ? "bg-[#5a8a6b]/10 text-[#5a8a6b]"
                  : "text-[#5a625e] dark:text-[#a0a8a3] hover:bg-black/[0.04] dark:hover:bg-white/[0.04]"
              }`}
            >
              {t.icon}
            </button>
          ))}
        </div>

        <div className="absolute right-4 top-4 bg-white dark:bg-[#151a17] border border-black/[0.08] dark:border-white/[0.07] rounded-full px-1.5 py-1.5 flex items-center z-10">
          <span className="w-7 h-7 rounded-full bg-[#5a8a6b] text-white text-[10px] font-semibold flex items-center justify-center -mr-1.5 border-2 border-white dark:border-[#151a17]">MK</span>
          <span className="w-7 h-7 rounded-full bg-[#7a9bbf] text-white text-[10px] font-semibold flex items-center justify-center border-2 border-white dark:border-[#151a17]">SO</span>
        </div>

        <StickyNote x={120} y={80} color="#5a8a6b" rotate={-2}>
          <div className="text-[10px] opacity-80 mb-1.5 uppercase tracking-wide">Brand essence</div>
          <div className="text-[13px] font-semibold">Considered, not corporate</div>
        </StickyNote>
        <StickyNote x={340} y={140} color="#b5803a" rotate={1}>
          <div className="text-[10px] opacity-80 mb-1.5 uppercase tracking-wide">Voice</div>
          <div className="text-[13px] font-semibold">Quiet confidence. Plain English.</div>
        </StickyNote>
        <StickyNote x={560} y={90} color="#7a9bbf" rotate={-1}>
          <div className="text-[10px] opacity-80 mb-1.5 uppercase tracking-wide">Avoid</div>
          <div className="text-[13px] font-semibold">Overly green / "wellness" tropes</div>
        </StickyNote>

        <div
          className="absolute bg-white dark:bg-[#151a17] border border-black/[0.08] dark:border-white/[0.07] rounded-xl p-6"
          style={{ left: 100, top: 290, width: 480 }}
        >
          <div className="text-[11px] uppercase tracking-[0.08em] text-[#858c87] dark:text-[#6e7672] mb-3">
            Logo direction · Variant B
          </div>
          <div className="grid grid-cols-3 gap-3">
            {["#5a8a6b", "#6a9579", "#7da388"].map((c, i) => (
              <div
                key={i}
                className="aspect-square rounded-xl flex items-center justify-center text-white text-3xl font-semibold tracking-tight"
                style={{ background: c }}
              >
                N
              </div>
            ))}
          </div>
          <div className="mt-3.5 text-[12px] text-[#5a625e] dark:text-[#a0a8a3]">Sage progression — neutral → warm</div>
        </div>

        <div className="absolute" style={{ left: 620, top: 350 }}>
          <div className="w-7 h-7 rounded-full rounded-bl-sm bg-[#5a8a6b] text-white text-[11px] font-semibold flex items-center justify-center shadow-md">
            1
          </div>
          <div className="mt-2 ml-3 bg-white dark:bg-[#151a17] border border-black/[0.08] dark:border-white/[0.07] rounded-xl p-3 w-52">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-6 h-6 rounded-full bg-[#7a9bbf] text-white text-[10px] font-semibold flex items-center justify-center">SO</span>
              <span className="text-[12px] font-medium text-[#1a201c] dark:text-[#e8ece9]">Sara</span>
              <span className="text-[11px] text-[#858c87] dark:text-[#6e7672] ml-auto">2m</span>
            </div>
            <p className="text-[12px] text-[#5a625e] dark:text-[#a0a8a3] leading-relaxed">
              Middle one feels right — let's go with this.
            </p>
          </div>
        </div>

        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <path d="M 280 185 Q 350 240, 380 300" stroke="#5a8a6b" strokeWidth="2" fill="none" strokeDasharray="4,4" />
          <circle cx="380" cy="300" r="3" fill="#5a8a6b" />
        </svg>
      </div>
    </div>
  );
};
