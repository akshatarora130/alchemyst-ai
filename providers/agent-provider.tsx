"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { useActorRef, useSelector } from "@xstate/react";
import type { ConnectionStatus } from "@/types/connection";
import type { ContextInspectorState } from "@/types/context";
import type { ChatMessage } from "@/types/chat";
import type { TraceEntry } from "@/types/trace";
import {
  createUserMessage,
  serializeClientMessage,
} from "@/lib/protocol/client-messages";
import { sendOnActiveSocket } from "@/lib/websocket/active-socket";
import {
  setAgentMessageHandler,
  setPongSentHandler,
  setSeqProcessedHandler,
} from "@/lib/websocket/message-bridge";
import { connectionMachine } from "@/machines/connection-machine";
import { mapMachineStateToStatus } from "@/machines/connection-types";
import { sessionMachine } from "@/machines/session-machine";

interface AgentContextValue {
  status: ConnectionStatus;
  messages: ChatMessage[];
  traceEntries: TraceEntry[];
  selectedTraceId: string | null;
  contextState: ContextInspectorState;
  sendUserMessage: (content: string) => void;
  selectTrace: (traceId: string | null) => void;
  setContextStep: (stepIndex: number) => void;
  setActiveContext: (contextId: string) => void;
  connect: () => void;
  disconnect: () => void;
}

const AgentContext = createContext<AgentContextValue | null>(null);

interface AgentProviderProps {
  children: ReactNode;
}

export function AgentProvider({ children }: AgentProviderProps) {
  const connectionRef = useActorRef(connectionMachine);
  const sessionRef = useActorRef(sessionMachine);

  const status = useSelector(connectionRef, (snapshot) =>
    mapMachineStateToStatus(snapshot.value),
  );

  const messages = useSelector(
    sessionRef,
    (snapshot) => snapshot.context.messages,
  );

  const traceEntries = useSelector(
    sessionRef,
    (snapshot) => snapshot.context.traceEntries,
  );

  const selectedTraceId = useSelector(
    sessionRef,
    (snapshot) => snapshot.context.selectedTraceId,
  );

  const contextState = useSelector(
    sessionRef,
    (snapshot) => snapshot.context.contextState,
  );

  useEffect(() => {
    connectionRef.start();
    sessionRef.start();

    setAgentMessageHandler((raw) => {
      sessionRef.send({ type: "WS_RAW", raw });
    });

    setSeqProcessedHandler((seq) => {
      connectionRef.send({ type: "UPDATE_LAST_SEQ", seq });
    });

    setPongSentHandler((echo) => {
      sessionRef.send({ type: "PONG_SENT", echo });
    });

    connectionRef.send({ type: "CONNECT" });

    return () => {
      setAgentMessageHandler(null);
      setSeqProcessedHandler(null);
      setPongSentHandler(null);
      connectionRef.stop();
      sessionRef.stop();
    };
  }, [connectionRef, sessionRef]);

  const connect = useCallback(() => {
    connectionRef.send({ type: "CONNECT" });
  }, [connectionRef]);

  const disconnect = useCallback(() => {
    connectionRef.send({ type: "DISCONNECT" });
  }, [connectionRef]);

  const sendUserMessage = useCallback(
    (content: string) => {
      const trimmed = content.trim();
      if (!trimmed) {
        return;
      }

      sessionRef.send({ type: "SEND_USER", content: trimmed });
      sendOnActiveSocket(serializeClientMessage(createUserMessage(trimmed)));
    },
    [sessionRef],
  );

  const selectTrace = useCallback(
    (traceId: string | null) => {
      sessionRef.send({ type: "SELECT_TRACE", traceId });
    },
    [sessionRef],
  );

  const setContextStep = useCallback(
    (stepIndex: number) => {
      sessionRef.send({ type: "SET_CONTEXT_STEP", stepIndex });
    },
    [sessionRef],
  );

  const setActiveContext = useCallback(
    (contextId: string) => {
      sessionRef.send({ type: "SET_ACTIVE_CONTEXT", contextId });
    },
    [sessionRef],
  );

  const value = useMemo(
    (): AgentContextValue => ({
      status,
      messages,
      traceEntries,
      selectedTraceId,
      contextState,
      sendUserMessage,
      selectTrace,
      setContextStep,
      setActiveContext,
      connect,
      disconnect,
    }),
    [
      status,
      messages,
      traceEntries,
      selectedTraceId,
      contextState,
      sendUserMessage,
      selectTrace,
      setContextStep,
      setActiveContext,
      connect,
      disconnect,
    ],
  );

  return (
    <AgentContext.Provider value={value}>{children}</AgentContext.Provider>
  );
}

export function useAgent(): AgentContextValue {
  const context = useContext(AgentContext);

  if (!context) {
    throw new Error("useAgent must be used within AgentProvider");
  }

  return context;
}

export function useConnection(): Pick<
  AgentContextValue,
  "status" | "connect" | "disconnect"
> {
  const { status, connect, disconnect } = useAgent();
  return { status, connect, disconnect };
}
