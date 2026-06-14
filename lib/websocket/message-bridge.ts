let agentMessageHandler: ((raw: string) => void) | null = null;

export function setAgentMessageHandler(
  handler: ((raw: string) => void) | null,
): void {
  agentMessageHandler = handler;
}

export function forwardAgentMessage(raw: string): void {
  agentMessageHandler?.(raw);
}

let seqProcessedHandler: ((seq: number) => void) | null = null;

export function setSeqProcessedHandler(
  handler: ((seq: number) => void) | null,
): void {
  seqProcessedHandler = handler;
}

export function notifySeqProcessed(seq: number): void {
  seqProcessedHandler?.(seq);
}

let pongSentHandler: ((echo: string) => void) | null = null;

export function setPongSentHandler(
  handler: ((echo: string) => void) | null,
): void {
  pongSentHandler = handler;
}

export function notifyPongSent(echo: string): void {
  pongSentHandler?.(echo);
}
