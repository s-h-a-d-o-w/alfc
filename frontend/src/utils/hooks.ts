import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { errorToastStyle } from './misc';

export function useWebSocket(onMessage: WebSocket['onmessage']) {
  const [ws, setWs] = useState<WebSocket>();

  useEffect(() => {
    var retryCount = 0;
    const maxRetryCount = 50;
    const reconnectTimeout = 5;
    var isReconnecting = false;
    var _ws: WebSocket;

    function onOpen() {
      toast.success('WS is OPEN', {
        closeButton: false,
        hideProgressBar: false,
        draggable: false,
        closeOnClick: true,
        autoClose: 5000
      });
      retryCount = 0;
      setWs(_ws);
    }

    function onErrorOrOnClose() {
      var message = 'WebSocket connection was not established or lost.';
      if(retryCount < maxRetryCount) {
        message += ' Reconnect retry #' + retryCount + ' of ' + maxRetryCount;
      }
      toast.error(message, {
        className: errorToastStyle,
        autoClose: 5000,
        closeButton: false,
        hideProgressBar: false,
        draggable: false,
        closeOnClick: false
      });

      if(!isReconnecting && retryCount < maxRetryCount) {
        isReconnecting = true;
        setTimeout(() => {
          retryCount++;
          openWebsocket();
          isReconnecting = false;
        }, reconnectTimeout * 1000);
      }
    }

    function openWebsocket() {
      _ws = new WebSocket('ws://localhost:5522');
      _ws.onmessage = onMessage;
      _ws.onopen = onOpen;
      _ws.onclose = onErrorOrOnClose;
      _ws.onerror = onErrorOrOnClose;
    }

    openWebsocket();

    return () => {
      _ws.close();
    };
  }, [onMessage]);

  return ws;
}
