"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  type ReactNode,
} from "react";
import { useActorRef, useSelector } from "@xstate/react";
import type { ConnectionStatus } from "@/types/connection";
import type { ChatMessage } from "@/types/chat";
import {
  createUserMessage,
  serializeClientMessage,
} from "@/lib/protocol/client-messages";
import { sendOnActiveSocket } from "@/lib/websocket/active-socket";
import {
  setAgentMessageHandler,
  setSeqProcessedHandler,
} from "@/lib/websocket/message-bridge";
import { connectionMachine } from "@/machines/connection-machine";
import { mapMachineStateToStatus } from "@/machines/connection-types";
import { sessionMachine } from "@/machines/session-machine";

interface AgentContextValue {
  status: ConnectionStatus;
  messages: ChatMessage[];
  sendUserMessage: (content: string) => void;
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

  useEffect(() => {
    connectionRef.start();
    sessionRef.start();

    setAgentMessageHandler((raw) => {
      sessionRef.send({ type: "WS_RAW", raw });
    });

    setSeqProcessedHandler((seq) => {
      connectionRef.send({ type: "UPDATE_LAST_SEQ", seq });
    });

    connectionRef.send({ type: "CONNECT" });

    return () => {
      setAgentMessageHandler(null);
      setSeqProcessedHandler(null);
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

  const value: AgentContextValue = {
    status,
    messages,
    sendUserMessage,
    connect,
    disconnect,
  };

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
