import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SearchHighlight } from "../components/search/SearchHighlight";

const START = String.fromCharCode(1);
const END = String.fromCharCode(2);

describe("SearchHighlight", () => {
  it("renders plain text without sentinels as-is", () => {
    render(<SearchHighlight text="plain snippet text" />);
    expect(screen.getByText("plain snippet text")).toBeInTheDocument();
  });

  it("wraps a matched run in a <mark>", () => {
    render(<SearchHighlight text={`see the ${START}logo${END} here`} />);
    const mark = screen.getByText("logo");
    expect(mark.tagName).toBe("MARK");
  });

  it("keeps the surrounding text outside the mark", () => {
    const { container } = render(
      <SearchHighlight text={`a${START}b${END}c`} />,
    );
    expect(container.querySelectorAll("mark")).toHaveLength(1);
    expect(container.textContent).toBe("abc");
  });

  it("handles multiple matched runs", () => {
    const { container } = render(
      <SearchHighlight text={`${START}one${END} and ${START}two${END}`} />,
    );
    expect(container.querySelectorAll("mark")).toHaveLength(2);
  });
});
