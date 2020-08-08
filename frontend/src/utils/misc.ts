import { getMethods, setMethods } from '../data/mof';
import { toast } from 'react-toastify';
import { css } from 'emotion';

function sendMessage(ws: WebSocket | undefined, payload: any) {
  if (ws && ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify(payload));
  } else {
    errorToast('No WebSocket connection. Please refresh the page.');
  }
}

export function sendGet(
  ws: WebSocket | undefined,
  methodName: string,
  data?: { [arg: string]: number }
) {
  sendMessage(ws, {
    ...getMethods[methodName],
    kind: 'get',
    data,
  });
}

export function sendSet(
  ws: WebSocket | undefined,
  methodName: string,
  data: { [arg: string]: number }
) {
  sendMessage(ws, {
    ...setMethods[methodName],
    kind: 'set',
    data,
  });
}

export function sendTune(ws: WebSocket | undefined, pl1: number, pl2: number) {
  sendMessage(ws, {
    kind: 'tune',
    data: { pl1, pl2 },
  });
}

const successToastStyle = css`
  background: #acd132;
  border-radius: 4px;
`;

export function successToast(content: any) {
  toast.success(content, {
    className: successToastStyle,
    position: 'bottom-right',
  });
}

export function errorToast(content: any) {
  toast.error(content, {
    className: successToastStyle,
    position: 'bottom-right',
    autoClose: false,
  });
}
