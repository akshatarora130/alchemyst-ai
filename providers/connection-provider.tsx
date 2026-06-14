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
import type { ClientMessage } from "@/types/protocol";
import { serializeClientMessage } from "@/lib/protocol/client-messages";
import { sendOnActiveSocket } from "@/lib/websocket/active-socket";
import { connectionMachine } from "@/machines/connection-machine";
import { getConnectionDisplayState } from "@/lib/connection/display-state";

interface ConnectionContextValue {
  status: ConnectionStatus;
  connect: () => void;
  disconnect: () => void;
  sendMessage: (message: ClientMessage) => void;
  updateLastProcessedSeq: (seq: number) => void;
}

const ConnectionContext = createContext<ConnectionContextValue | null>(null);

interface ConnectionProviderProps {
  children: ReactNode;
  autoConnect?: boolean;
}

export function ConnectionProvider({
  children,
  autoConnect = true,
}: ConnectionProviderProps) {
  const actorRef = useActorRef(connectionMachine);
  const status = useSelector(actorRef, (snapshot) =>
    getConnectionDisplayState(snapshot).status,
  );

  useEffect(() => {
    actorRef.start();

    return () => {
      actorRef.stop();
    };
  }, [actorRef]);

  useEffect(() => {
    if (autoConnect) {
      actorRef.send({ type: "CONNECT" });
    }
  }, [autoConnect, actorRef]);

  const connect = useCallback(() => {
    actorRef.send({ type: "CONNECT" });
  }, [actorRef]);

  const disconnect = useCallback(() => {
    actorRef.send({ type: "DISCONNECT" });
  }, [actorRef]);

  const sendMessage = useCallback((message: ClientMessage) => {
    sendOnActiveSocket(serializeClientMessage(message));
  }, []);

  const updateLastProcessedSeq = useCallback(
    (seq: number) => {
      actorRef.send({ type: "UPDATE_LAST_SEQ", seq });
    },
    [actorRef],
  );

  const value: ConnectionContextValue = {
    status,
    connect,
    disconnect,
    sendMessage,
    updateLastProcessedSeq,
  };

  return (
    <ConnectionContext.Provider value={value}>
      {children}
    </ConnectionContext.Provider>
  );
}

export function useConnection(): ConnectionContextValue {
  const context = useContext(ConnectionContext);

  if (!context) {
    throw new Error("useConnection must be used within ConnectionProvider");
  }

  return context;
}
