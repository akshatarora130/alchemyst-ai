# Agent Console

Next.js UI for the Alchemyst agent server — streaming chat, tool calls, protocol trace, context diffs, reconnect + chaos handling.

**Architecture:** UI → XState (`connectionMachine`, `sessionMachine`) → protocol libs (seq buffer, trace, diff) → WebSocket.

![Connection state machine](./Screenshot%202026-06-14%20at%2017.21.32.png)

## Run

```bash
# repo root — normal mode (drop --mode chaos for chaos)
docker build -t agent-server ./agent-server
docker run -p 4747:4747 --name agent-server agent-server

cd alchemyst-ai && pnpm install && pnpm dev
```

→ [http://localhost:3000](http://localhost:3000) · WS: `ws://localhost:4747/ws`

Protocol log: `curl -s http://localhost:4747/log`

## Chaos recording

https://github.com/user-attachments/assets/7a5248c6-ee2a-4d9f-a4b3-4d7febec9250

## Dev

`pnpm dev` · `pnpm build` · `pnpm test` · `pnpm lint`

Stack: Next.js 16, TS strict, Tailwind v4, XState v5, TanStack Virtual, microdiff.

Details: [DECISIONS.md](./DECISIONS.md)
