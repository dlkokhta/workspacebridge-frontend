import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeftRight } from "lucide-react";

export const Homepage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white flex flex-col">

      {/* ── Navbar ── */}
      <div className="flex justify-center px-4 pt-5">
        <motion.nav
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center justify-between w-full max-w-4xl bg-[#252525] border border-white/10 rounded-2xl px-5 py-3"
        >
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#5a8a6b] flex items-center justify-center shrink-0">
              <ArrowLeftRight size={15} className="text-white" />
            </div>
            <span className="font-bold text-white text-base tracking-tight">WorkspaceBridge</span>
          </div>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-7">
            {["Features", "How it works", ""].map((item) => (
              <button
                key={item}
                className="cursor-pointer text-sm text-gray-400 hover:text-white transition-colors"
              >
                {item}
              </button>
            ))}
            <button
              onClick={() => navigate("/login")}
              className="cursor-pointer text-sm text-gray-400 hover:text-white transition-colors"
            >
              Sign in
            </button>
          </div>

          {/* CTA */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/register")}
            className="cursor-pointer text-sm font-semibold text-white bg-[#5a8a6b] hover:bg-[#4a7a5b] px-4 py-2 rounded-xl transition-colors"
          >
            Get started free
          </motion.button>
        </motion.nav>
      </div>

      {/* ── Hero ── */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20">

      

       


        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-wrap items-center justify-center gap-3 mb-5"
        >
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: "0 8px 24px rgba(90,138,107,0.35)" }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/register")}
            className="cursor-pointer text-sm sm:text-base font-semibold text-white bg-[#5a8a6b] hover:bg-[#4a7a5b] px-8 py-3.5 rounded-2xl transition-colors"
          >
            Create your workspace
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.04, backgroundColor: "rgba(255,255,255,0.06)" }}
            whileTap={{ scale: 0.97 }}
            className="cursor-pointer text-sm sm:text-base font-semibold text-white border border-white/25 hover:border-white/40 px-8 py-3.5 rounded-2xl transition-colors"
          >
            See a demo
          </motion.button>
        </motion.div>

       
      </section>
    </div>
  );
};
