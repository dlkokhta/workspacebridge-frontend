import { describe, it, expect, beforeEach } from "vitest";
import { getCsrfToken } from "../context/AuthContext";

const clearCookies = () => {
  for (const cookie of document.cookie.split(";")) {
    const name = cookie.split("=")[0].trim();
    if (name) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }
  }
};

describe("getCsrfToken", () => {
  beforeEach(() => {
    clearCookies();
  });

  it("returns an empty string when no csrfToken cookie exists", () => {
    expect(getCsrfToken()).toBe("");
  });

  it("reads the csrfToken cookie", () => {
    document.cookie = "csrfToken=abc123";
    expect(getCsrfToken()).toBe("abc123");
  });

  it("finds csrfToken among other cookies", () => {
    document.cookie = "other=value";
    document.cookie = "csrfToken=def456";
    expect(getCsrfToken()).toBe("def456");
  });

  it("decodes URI-encoded values", () => {
    document.cookie = "csrfToken=a%2Bb";
    expect(getCsrfToken()).toBe("a+b");
  });
});
