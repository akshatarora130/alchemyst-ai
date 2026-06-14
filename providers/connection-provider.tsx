"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { useActor } from "@xstate/react";
import type { ConnectionStatus } from "@/types/connection";
import type { ClientMessage } from "@/types/protocol";
import { serializeClientMessage } from "@/lib/protocol/client-messages";
import { sendOnActiveSocket } from "@/lib/websocket/active-socket";
import { connectionMachine } from "@/machines/connection-machine";
import { mapMachineStateToStatus } from "@/machines/connection-types";

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
  const [snapshot, send] = useActor(connectionMachine);

  useEffect(() => {
    if (autoConnect) {
      send({ type: "CONNECT" });
    }
  }, [autoConnect, send]);

  const connect = useCallback(() => {
    send({ type: "CONNECT" });
  }, [send]);

  const disconnect = useCallback(() => {
    send({ type: "DISCONNECT" });
  }, [send]);

  const sendMessage = useCallback((message: ClientMessage) => {
    sendOnActiveSocket(serializeClientMessage(message));
  }, []);

  const updateLastProcessedSeq = useCallback(
    (seq: number) => {
      send({ type: "UPDATE_LAST_SEQ", seq });
    },
    [send],
  );

  const value = useMemo(
    (): ConnectionContextValue => ({
      status: mapMachineStateToStatus(snapshot.value),
      connect,
      disconnect,
      sendMessage,
      updateLastProcessedSeq,
    }),
    [snapshot.value, connect, disconnect, sendMessage, updateLastProcessedSeq],
  );

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
