import useReactWebSocket, { ReadyState } from "react-use-websocket";
import { MessageToClient } from "../../../common/types.js";

const emptyObject = {};
const shouldReconnect = (_: CloseEvent) => true;

export function useWebSocket() {
  const { lastJsonMessage, sendJsonMessage, readyState } =
    useReactWebSocket<MessageToClient | null>("ws://localhost:5523", {
      heartbeat: {
        interval: 30000,
      },
      retryOnError: true,
      reconnectAttempts: Number.MAX_SAFE_INTEGER,
      shouldReconnect,
    });

  return {
    lastJsonMessage:
      // Empty object is forced like this in order to avoid having to check for null in each component that uses this.
      lastJsonMessage || (emptyObject as unknown as MessageToClient),
    sendJsonMessage,
    isConnected: readyState === ReadyState.OPEN,
  };
}
