import { MessageCircle, FileText, Pencil, Pin } from "lucide-react";

const FeatureCard = ({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
}) => (
  <div className="bg-white dark:bg-[#151a17] border border-black/[0.08] dark:border-white/[0.07] rounded-xl p-7">
    <div className="w-10 h-10 rounded-[10px] bg-[rgba(90,138,107,0.12)] text-[#5a8a6b] flex items-center justify-center mb-4">
      <Icon size={20} />
    </div>
    <h3 className="text-[18px] font-semibold text-[#1a201c] dark:text-[#e8ece9] tracking-tight mb-2">{title}</h3>
    <p className="text-[14px] text-[#5a625e] dark:text-[#a0a8a3] leading-[1.55]">{desc}</p>
  </div>
);

export const Features = () => (
  <section id="features" className="py-24 px-8 bg-[#fafaf7] dark:bg-[#0e1310]">
    <div className="max-w-[1200px] mx-auto">
      <div className="max-w-[640px] mb-12">
        <span className="block text-xs font-medium uppercase tracking-[0.08em] text-[#5a8a6b] mb-3">Features</span>
        <h2 className="text-[40px] font-semibold text-[#1a201c] dark:text-[#e8ece9] tracking-[-0.025em] leading-tight">
          Built for the way freelancers actually work.
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FeatureCard icon={MessageCircle} title="Real-time messaging"
          desc="Threaded conversations per project, with read receipts and typing indicators. No more digging through email threads to find one decision." />
        <FeatureCard icon={FileText} title="File delivery with comments"
          desc="Upload builds, screenshots, or final deliverables. Clients leave comments pinned to specific files — feedback stays where the work lives." />
        <FeatureCard icon={Pencil} title="Shared whiteboard"
          desc="Sketch concepts, map flows, and react in real time. Everything saves automatically and stays in the workspace forever." />
        <FeatureCard icon={Pin} title="Shared links"
          desc="Add your Figma, staging site, or any project link. Your client sees everything without asking in chat." />
      </div>
    </div>
  </section>
);
