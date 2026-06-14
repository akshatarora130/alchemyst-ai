let activeSocket: WebSocket | null = null;

export function setActiveSocket(socket: WebSocket | null): void {
  activeSocket = socket;
}

export function sendOnActiveSocket(data: string): boolean {
  if (!activeSocket || activeSocket.readyState !== WebSocket.OPEN) {
    return false;
  }

  activeSocket.send(data);
  return true;
}
