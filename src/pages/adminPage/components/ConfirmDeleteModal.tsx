interface ConfirmDeleteModalProps {
  title: string;
  description: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDeleteModal = ({
  title,
  description,
  onConfirm,
  onCancel,
}: ConfirmDeleteModalProps) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60">
    <div className="w-full max-w-sm mx-4 rounded-xl border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#151a17] p-6 shadow-lg">
      <h2 className="text-[15px] font-semibold text-[#1a201c] dark:text-[#e8ece9] mb-2">
        {title}
      </h2>
      <p className="text-[13px] text-[#858c87] dark:text-[#6e7672] mb-5">
        {description}
      </p>
      <div className="flex gap-2">
        <button
          onClick={onConfirm}
          className="h-8 px-3.5 rounded-lg bg-[#c25a4a] hover:bg-[#b04a3a] text-white text-[12px] font-medium transition-colors cursor-pointer"
        >
          Yes, delete
        </button>
        <button
          onClick={onCancel}
          className="h-8 px-3.5 rounded-lg border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#1c221e] text-[#5a625e] dark:text-[#a0a8a3] text-[12px] font-medium hover:bg-[#f6f6f1] dark:hover:bg-[#222b26] transition-colors cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
);
