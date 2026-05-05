import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";

const PriceCard = ({
  name,
  price,
  period,
  features,
  cta,
  highlight,
  onCtaClick,
}: {
  name: string;
  price: string;
  period: string;
  features: string[];
  cta: string;
  highlight?: boolean;
  onCtaClick: () => void;
}) => (
  <div
    className={`relative rounded-xl p-8 ${
      highlight
        ? "border border-[#5a8a6b] bg-[rgba(90,138,107,0.07)]"
        : "border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#151a17]"
    }`}
  >
    {highlight && (
      <span className="absolute top-5 right-5 inline-flex items-center h-[22px] px-2.5 rounded-full bg-[rgba(90,138,107,0.12)] text-[#5a8a6b] border border-[rgba(90,138,107,0.28)] text-[10px] font-medium">
        Most popular
      </span>
    )}
    <div className="text-[14px] font-medium text-[#1a201c] dark:text-[#e8ece9] mb-3">{name}</div>
    <div className="flex items-baseline gap-1.5 mb-6">
      <span className="text-[44px] font-semibold text-[#1a201c] dark:text-[#e8ece9] tracking-[-0.025em] leading-none">{price}</span>
      <span className="text-[14px] text-[#858c87] dark:text-[#6e7672]">{period}</span>
    </div>
    <button
      onClick={onCtaClick}
      className={`w-full h-10 rounded-lg text-[14px] font-medium mb-6 transition-colors cursor-pointer ${
        highlight
          ? "bg-[#5a8a6b] hover:bg-[#4f7a5e] text-white"
          : "bg-[#f3f3ee] dark:bg-[#1c221e] hover:bg-black/5 dark:hover:bg-white/5 text-[#1a201c] dark:text-[#e8ece9] border border-black/[0.08] dark:border-white/[0.07]"
      }`}
    >
      {cta}
    </button>
    <ul className="flex flex-col gap-2.5">
      {features.map((f) => (
        <li key={f} className="flex items-center gap-2.5 text-[13px] text-[#5a625e] dark:text-[#a0a8a3]">
          <Check size={14} className="text-[#5a8a6b] shrink-0" />
          {f}
        </li>
      ))}
    </ul>
  </div>
);

export const Pricing = () => {
  const navigate = useNavigate();
  return (
    <section id="pricing" className="py-24 px-8 bg-[#fafaf7] dark:bg-[#0e1310]">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-12">
          <span className="block text-xs font-medium uppercase tracking-[0.08em] text-[#5a8a6b] mb-3">Pricing</span>
          <h2 className="text-[40px] font-semibold text-[#1a201c] dark:text-[#e8ece9] tracking-[-0.025em] leading-tight">
            Free until you outgrow it.
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-4 max-w-[880px] mx-auto">
          <PriceCard
            name="Free" price="$0" period="forever"
            features={["3 active workspaces", "Unlimited messages", "5 GB file storage", "Whiteboard & shared links"]}
            cta="Start free"
            onCtaClick={() => navigate("/register")}
          />
          <PriceCard
            name="Pro" price="Coming" period="soon"
            features={["Unlimited workspaces", "100 GB file storage", "Custom domains", "Priority support", "Recurring invoices"]}
            cta="Notify me"
            highlight
            onCtaClick={() => navigate("/register")}
          />
        </div>
      </div>
    </section>
  );
};
