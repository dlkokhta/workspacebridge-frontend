import { Fragment } from "react";

// Must match the backend sentinels in search.service.ts (HL_START = U+0001,
// HL_END = U+0002). ts_headline wraps each matched run in these control
// characters. We split on them and render matched runs as <mark> — as React
// text nodes, never raw HTML, so search content can never inject markup (XSS).
const SENTINELS = new RegExp(
  `[${String.fromCharCode(1)}${String.fromCharCode(2)}]`,
);

export const SearchHighlight = ({ text }: { text: string }) => {
  const parts = text.split(SENTINELS);
  return (
    <>
      {parts.map((part, i) =>
        // After splitting on either sentinel, odd indices were the matched runs.
        i % 2 === 1 ? (
          <mark
            key={i}
            className="bg-[#5a8a6b]/20 text-[#1a201c] dark:text-[#e8ece9] rounded-[2px] px-0.5"
          >
            {part}
          </mark>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
};
