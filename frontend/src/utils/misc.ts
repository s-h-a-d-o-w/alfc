import { getMethods, setMethods } from '../data/mof';
import { toast } from 'react-toastify';
import { css } from 'emotion';
import { theme } from './consts';

export function sendMessage(ws: WebSocket | undefined, payload: any) {
  if (ws && ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify(payload));
  } else {
    // Log failure just for possible debugging
    console.log(
      `Probably harmless, since it will likely be retried. Tried to send the following payload to ${ws}: ${JSON.stringify(
        payload,
        null,
        2
      )}`
    );
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

export const errorToastStyle = css`
  border-radius: 4px;
`;

const successToastStyle = css`
  background: ${theme.primary};
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
    className: errorToastStyle,
    position: 'bottom-right',
    autoClose: false,
  });
}
