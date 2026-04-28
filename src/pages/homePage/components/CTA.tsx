import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export const CTA = () => {
  const navigate = useNavigate();
  return (
    <section className="py-24 px-8 bg-[#fafaf7] dark:bg-[#0e1310]">
      <div className="max-w-[1200px] mx-auto">
        <div className="bg-[#5a8a6b] rounded-2xl px-12 py-20 text-center">
          <h2
            className="text-[clamp(32px,4vw,52px)] font-semibold text-white tracking-[-0.03em] leading-[1.06] mb-4 max-w-[640px] mx-auto"
            style={{ textWrap: "balance" } as React.CSSProperties}
          >
            Your clients deserve better than a chat thread.
          </h2>
          <p className="text-[18px] text-white/85 mb-8 max-w-[480px] mx-auto leading-[1.55]">
            Give every client their own workspace. Own the relationship.
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/register")}
            className="inline-flex items-center gap-2 h-12 px-6 bg-white hover:bg-[#f0f0eb] text-[#1a201c] text-[15px] font-medium rounded-lg transition-colors"
          >
            Create your first workspace <ArrowRight size={15} />
          </motion.button>
        </div>
      </div>
    </section>
  );
};
