import { SectionHeader } from "../components/SectionHeader";
import { SmallBtn } from "../components/SmallBtn";

export const BillingSection = () => (
  <>
    <SectionHeader title="Billing" desc="Plans, payment, and invoices." />
    <div className="mt-6 rounded-xl border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#151a17] p-6 flex items-center justify-between gap-6">
      <div>
        <div className="flex items-center gap-2.5 mb-1.5">
          <span className="text-[14px] font-medium text-[#1a201c] dark:text-[#e8ece9]">
            Free plan
          </span>
          <span className="inline-flex items-center h-[20px] px-2 rounded-full bg-[#f3f3ee] dark:bg-[#1c221e] border border-black/[0.08] dark:border-white/[0.07] text-[10px] font-medium text-[#5a625e] dark:text-[#a0a8a3]">
            Current
          </span>
        </div>
        <div className="text-[13px] text-[#5a625e] dark:text-[#a0a8a3]">
          Up to 3 workspaces · 5 GB storage
        </div>
        <div className="mt-3.5 flex items-center gap-2.5">
          <div className="w-[200px] h-1 rounded-full bg-black/[0.08] dark:bg-white/[0.07] overflow-hidden">
            <div className="h-full bg-[#5a8a6b]" style={{ width: "55%" }} />
          </div>
          <span className="text-[12px] text-[#5a625e] dark:text-[#a0a8a3] tabular-nums">
            2.7 / 5 GB
          </span>
        </div>
      </div>
      <SmallBtn variant="primary" disabled title="Coming soon">
        Upgrade to Pro
      </SmallBtn>
    </div>
    <p className="mt-6 text-[12px] text-[#858c87] dark:text-[#6e7672]">
      Billing isn't connected yet — preview only.
    </p>
  </>
);
