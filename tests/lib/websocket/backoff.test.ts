import { describe, expect, it } from "vitest";
import { getBackoffDelayMs } from "@/lib/websocket/backoff";

describe("getBackoffDelayMs", () => {
  it("uses exponential delays before the cap", () => {
    expect(getBackoffDelayMs(0)).toBe(500);
    expect(getBackoffDelayMs(1)).toBe(1000);
    expect(getBackoffDelayMs(2)).toBe(2000);
    expect(getBackoffDelayMs(3)).toBe(4000);
  });

  it("caps delay at 10 seconds", () => {
    expect(getBackoffDelayMs(4)).toBe(10000);
    expect(getBackoffDelayMs(10)).toBe(10000);
  });
});
