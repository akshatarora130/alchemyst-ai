import { describe, expect, it } from "vitest";
import type { ServerMessage } from "@/types/protocol";
import { parseServerMessage } from "@/lib/protocol/parse-server-message";
import {
  createSeqBuffer,
  ingestServerMessage,
  pendingSeqCount,
  resetSeqBuffer,
} from "@/lib/protocol/seq-buffer";

function token(seq: number, text: string): ServerMessage {
  return { type: "TOKEN", seq, text, stream_id: "s_1" };
}

describe("parseServerMessage", () => {
  it("parses a valid TOKEN message", () => {
    const parsed = parseServerMessage(
      JSON.stringify({
        type: "TOKEN",
        seq: 1,
        text: "hello",
        stream_id: "s_1",
      }),
    );

    expect(parsed).toEqual(token(1, "hello"));
  });

  it("rejects malformed messages", () => {
    expect(parseServerMessage("null")).toBeNull();
    expect(
      parseServerMessage(JSON.stringify({ type: "TOKEN", seq: 1 })),
    ).toBeNull();
    expect(parseServerMessage("not-json")).toBeNull();
  });

  it("accepts PING with empty challenge (corrupt heartbeat)", () => {
    const parsed = parseServerMessage(
      JSON.stringify({
        type: "PING",
        seq: 9,
        challenge: "",
      }),
    );

    expect(parsed).toEqual({ type: "PING", seq: 9, challenge: "" });
  });
});

describe("seq buffer", () => {
  it("returns no ready messages from an empty buffer", () => {
    const state = createSeqBuffer();
    const result = ingestServerMessage(state, token(2, "late"));

    expect(result.ready).toEqual([]);
    expect(pendingSeqCount(result.state)).toBe(1);
    expect(result.state.lastProcessedSeq).toBe(0);
  });

  it("processes sequential messages immediately", () => {
    let state = createSeqBuffer();
    const first = ingestServerMessage(state, token(1, "a"));
    state = first.state;

    expect(first.ready).toEqual([token(1, "a")]);
    expect(state.lastProcessedSeq).toBe(1);

    const second = ingestServerMessage(state, token(2, "b"));

    expect(second.ready).toEqual([token(2, "b")]);
    expect(second.state.lastProcessedSeq).toBe(2);
  });

  it("buffers out-of-order messages until the gap fills", () => {
    let state = createSeqBuffer();

    const outOfOrder = ingestServerMessage(state, token(3, "c"));
    state = outOfOrder.state;
    expect(outOfOrder.ready).toEqual([]);
    expect(pendingSeqCount(state)).toBe(1);

    const middle = ingestServerMessage(state, token(2, "b"));
    state = middle.state;
    expect(middle.ready).toEqual([]);
    expect(pendingSeqCount(state)).toBe(2);

    const first = ingestServerMessage(state, token(1, "a"));
    expect(first.ready).toEqual([token(1, "a"), token(2, "b"), token(3, "c")]);
    expect(first.state.lastProcessedSeq).toBe(3);
    expect(pendingSeqCount(first.state)).toBe(0);
  });

  it("deduplicates messages with the same seq", () => {
    let state = createSeqBuffer();
    state = ingestServerMessage(state, token(1, "first")).state;

    const duplicate = ingestServerMessage(state, token(1, "duplicate"));

    expect(duplicate.ready).toEqual([]);
    expect(duplicate.state.lastProcessedSeq).toBe(1);
  });

  it("ignores duplicates already sitting in the pending buffer", () => {
    let state = createSeqBuffer();
    state = ingestServerMessage(state, token(2, "b")).state;

    const duplicate = ingestServerMessage(state, token(2, "again"));

    expect(duplicate.ready).toEqual([]);
    expect(pendingSeqCount(duplicate.state)).toBe(1);
  });

  it("handles a fully reversed sequence", () => {
    let state = createSeqBuffer();
    const messages = [
      token(5, "e"),
      token(4, "d"),
      token(3, "c"),
      token(2, "b"),
    ];

    for (const message of messages) {
      const result = ingestServerMessage(state, message);
      state = result.state;
      expect(result.ready).toEqual([]);
    }

    expect(pendingSeqCount(state)).toBe(4);

    const flush = ingestServerMessage(state, token(1, "a"));

    expect(flush.ready.map((message) => message.seq)).toEqual([1, 2, 3, 4, 5]);
    expect(flush.state.lastProcessedSeq).toBe(5);
  });

  it("resumes from a non-zero lastProcessedSeq after reconnect", () => {
    const state = resetSeqBuffer(10);
    const result = ingestServerMessage(state, token(11, "resumed"));

    expect(result.ready).toEqual([token(11, "resumed")]);
    expect(result.state.lastProcessedSeq).toBe(11);
  });

  it("accepts seq 1 again after a new conversation turn reset", () => {
    let state = createSeqBuffer(0);

    for (let seq = 1; seq <= 50; seq += 1) {
      const result = ingestServerMessage(state, token(seq, `t${seq}`));
      state = result.state;
    }

    expect(state.lastProcessedSeq).toBe(50);

    state = createSeqBuffer(0);
    const nextTurn = ingestServerMessage(state, token(1, "new turn"));

    expect(nextTurn.ready).toEqual([token(1, "new turn")]);
    expect(nextTurn.state.lastProcessedSeq).toBe(1);
  });
});
