import type { ServerMessage } from "@/types/protocol";

export interface SeqBufferState {
  lastProcessedSeq: number;
  pending: Map<number, ServerMessage>;
}

export interface IngestResult {
  state: SeqBufferState;
  ready: ServerMessage[];
}

export function createSeqBuffer(lastProcessedSeq = 0): SeqBufferState {
  return {
    lastProcessedSeq,
    pending: new Map(),
  };
}

function drainReadyMessages(state: SeqBufferState): {
  state: SeqBufferState;
  ready: ServerMessage[];
} {
  const ready: ServerMessage[] = [];
  let nextSeq = state.lastProcessedSeq + 1;

  while (state.pending.has(nextSeq)) {
    const message = state.pending.get(nextSeq);
    state.pending.delete(nextSeq);

    if (!message) {
      break;
    }

    ready.push(message);
    state.lastProcessedSeq = nextSeq;
    nextSeq += 1;
  }

  return { state, ready };
}

export function ingestServerMessage(
  state: SeqBufferState,
  message: ServerMessage,
): IngestResult {
  if (message.seq <= state.lastProcessedSeq) {
    return { state, ready: [] };
  }

  if (state.pending.has(message.seq)) {
    return { state, ready: [] };
  }

  const nextState: SeqBufferState = {
    lastProcessedSeq: state.lastProcessedSeq,
    pending: new Map(state.pending),
  };

  nextState.pending.set(message.seq, message);

  return drainReadyMessages(nextState);
}

export function resetSeqBuffer(lastProcessedSeq: number): SeqBufferState {
  return createSeqBuffer(lastProcessedSeq);
}

export function pendingSeqCount(state: SeqBufferState): number {
  return state.pending.size;
}
