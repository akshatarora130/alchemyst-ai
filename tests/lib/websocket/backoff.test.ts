import { describe, expect, it } from "vitest";
import { getBackoffDelayMs } from "@/lib/websocket/backoff";

describe("getBackoffDelayMs", () => {
  it("uses exponential backoff capped at 10 seconds", () => {
    expect(getBackoffDelayMs(0)).toBe(500);
    expect(getBackoffDelayMs(1)).toBe(1000);
    expect(getBackoffDelayMs(2)).toBe(2000);
    expect(getBackoffDelayMs(3)).toBe(4000);
    expect(getBackoffDelayMs(4)).toBe(10000);
    expect(getBackoffDelayMs(99)).toBe(10000);
  });
});
