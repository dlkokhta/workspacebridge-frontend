import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { AppPreview } from "./components/AppPreview";
import { Features } from "./components/Features";
import { HowItWorks } from "./components/HowItWorks";
import { Pricing } from "./components/Pricing";
import { CTA } from "./components/CTA";
import { Footer } from "./components/Footer";

export const Homepage = () => (
  <div
    className="min-h-screen bg-[#fafaf7] dark:bg-[#0e1310] text-[#1a201c] dark:text-[#e8ece9]"
    style={{ fontFamily: "'Inter', sans-serif" }}
  >
    <Navbar />
    <Hero />
    <AppPreview />
    <Features />
    <HowItWorks />
    <Pricing />
    <CTA />
    <Footer />
  </div>
);
