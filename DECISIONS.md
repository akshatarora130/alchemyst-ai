# DECISIONS

## Seq buffer

`Map<seq, message>` + `lastProcessedSeq`. Park out-of-order messages, drain when the next seq is ready, ignore duplicates and stale seqs.

Server resets seq on each user message — client resets its buffer too, but keeps trace/context history.

## Tool calls (no layout shift)

Assistant messages are ordered **segments** (text | tool). `TOOL_CALL` freezes the current text block; tool card goes below; tokens resume in a new text segment after `TOOL_RESULT`.

## Reconnection

- **connectionMachine:** backoff, `RESUME(lastProcessedSeq)` on reconnect
- **sessionMachine:** seq buffer + chat/trace/context — what the UI actually applied

`lastProcessedSeq` updates only after a message is fully processed. Replayed events dedupe through the same buffer. Pending tools show **Waiting** while disconnected.

Empty-challenge PING: skip PONG, don't crash.

## If this scaled up

**50 streams:** per-session state map, connection pool, virtualize chat + trace, ring-buffer history.

**100× longer output:** virtualize chat, batch token renders (rAF), slim trace storage, lazy context diffs.

**Tradeoff:** heavy reordering can delay `TOOL_ACK` until earlier seqs land; server may log timeout but still sends `TOOL_RESULT`.