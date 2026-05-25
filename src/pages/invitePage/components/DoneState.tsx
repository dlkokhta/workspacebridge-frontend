export const DoneState = () => (
  <div className="text-center">
    <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-[#5a8a6b]/10 text-[#5a8a6b] flex items-center justify-center">
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </div>
    <h1 className="text-[24px] font-semibold tracking-[-0.02em] text-[#1a201c] dark:text-[#e8ece9] mb-2">
      You're in!
    </h1>
    <p className="text-[14px] text-[#858c87] dark:text-[#6e7672]">
      Redirecting to your workspace…
    </p>
  </div>
);
