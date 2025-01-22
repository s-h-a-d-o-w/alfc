import type WebSocket from "ws";
import { WebSocketServer } from "ws";
import {
  MessageToClientKind,
  MessageToServer,
  MessageToServerKind,
} from "../../common/types";
import { getCall, setCall, tune } from "../native";
import { persistState, state } from "../state";
import { setFixedFan, fanControl as autoFanControl } from "../fan-control";
import cloneDeep from "lodash/cloneDeep";

export const WEBSOCKET_PORT = 5523;

function sendState(socket: WebSocket) {
  const stateCopy = cloneDeep(state);
  delete stateCopy.activitySocket;
  socket.send(
    JSON.stringify({ kind: MessageToClientKind.State, data: stateCopy }),
  );
}

/**
 *
 * @param socket
 * @param payload A copy of the request payload
 * @param data Additional data in case of raw operations
 */
function sendSuccess(socket: WebSocket, payload: any, data?: any) {
  socket.send(
    JSON.stringify({
      ...payload,
      kind: MessageToClientKind.Success,
      ...(data && { data }),
    }),
  );
}

export function startWebSocketServer() {
  return new Promise<void>((resolve) => {
    const wss = new WebSocketServer({ port: WEBSOCKET_PORT });
    wss.on("connection", (socket) => {
      sendState(socket);

      socket.on("message", async (message) => {
        const messageString =
          typeof message === "string" ? message : message.toString();

        const payload: MessageToServer = JSON.parse(messageString);
        try {
          switch (payload.kind) {
            case MessageToServerKind.RegisterActivitySocket:
              state.activitySocket = socket;
              return;
            case MessageToServerKind.FixedPercentage:
              state.fixedPercentage = payload.data;
              setFixedFan(state.fixedPercentage);
              persistState();
              return sendSuccess(socket, payload);
            case MessageToServerKind.DoFixedSpeed:
              state.doFixedSpeed = payload.data;
              if (!state.doFixedSpeed) {
                autoFanControl();
              }
              persistState();
              return sendSuccess(socket, payload);
            case MessageToServerKind.FanTable:
              if (payload.data) {
                state.cpuFanTable = payload.data.cpu;
                state.gpuFanTable = payload.data.gpu;
                persistState();
                return sendSuccess(socket, payload);
              }
              break;
            case MessageToServerKind.Tune:
              if (payload.data) {
                state.pl1 = payload.data.pl1;
                state.pl2 = payload.data.pl2;
                persistState();
                await tune();
                return sendSuccess(socket, payload);
              }
              break;
            case MessageToServerKind.Get: {
              const result = await getCall(
                payload.methodId,
                payload.methodName,
                payload.data,
              );
              return sendSuccess(socket, payload, result);
            }
            case MessageToServerKind.Set:
              if (payload.data) {
                await setCall(
                  payload.methodId,
                  payload.methodName,
                  payload.data,
                );
                if (payload.methodName === "SetAIBoostStatus") {
                  state.gpuBoost = payload.data.Data === 1;
                  persistState();
                }
                return sendSuccess(socket, payload);
              }
              break;
          }

          socket.send(
            JSON.stringify({
              ...payload,
              kind: MessageToClientKind.Error,
              data: "Either unknown message kind or missing payload data.",
            }),
          );
        } catch (error) {
          if (error instanceof Error) {
            socket.send(
              JSON.stringify({
                ...payload,
                kind: MessageToClientKind.Error,
                data: error.stack,
              }),
            );
          }
        }
      });
    });
    wss.on("listening", () => {
      resolve();
    });
  });
}
