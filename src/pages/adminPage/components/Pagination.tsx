import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination = ({ page, totalPages, onPageChange }: PaginationProps) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-black/[0.06] dark:border-white/[0.05]">
      <span className="text-[12px] text-[#858c87] dark:text-[#6e7672]">
        Page {page} of {totalPages}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-[#858c87] dark:text-[#6e7672] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={14} />
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
          .reduce<(number | "…")[]>((acc, p, idx, arr) => {
            if (idx > 0 && p - (arr[idx - 1]) > 1) acc.push("…");
            acc.push(p);
            return acc;
          }, [])
          .map((item, idx) =>
            item === "…" ? (
              <span key={`ellipsis-${idx}`} className="w-7 h-7 flex items-center justify-center text-[12px] text-[#b5bbb7] dark:text-[#4a514d]">
                …
              </span>
            ) : (
              <button
                key={item}
                onClick={() => onPageChange(item)}
                className={`w-7 h-7 flex items-center justify-center rounded-lg text-[12px] font-medium transition-colors cursor-pointer ${
                  item === page
                    ? "bg-[#5a8a6b]/10 text-[#5a8a6b] dark:text-[#6db383]"
                    : "text-[#858c87] dark:text-[#6e7672] hover:bg-black/[0.04] dark:hover:bg-white/[0.04]"
                }`}
              >
                {item}
              </button>
            ),
          )}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-[#858c87] dark:text-[#6e7672] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};

export function usePagination<T>(items: T[], pageSize: number) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  return { totalPages, paginate: (page: number) => items.slice((page - 1) * pageSize, page * pageSize) };
}
