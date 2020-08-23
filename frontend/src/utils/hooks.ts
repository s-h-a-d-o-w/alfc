import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { errorToastStyle } from './misc';

export function useWebSocket(onMessage: WebSocket['onmessage']) {
  const [ws, setWs] = useState<WebSocket>();

  useEffect(() => {
    const _ws = new WebSocket('ws://localhost:5522');

    _ws.onmessage = onMessage;

    _ws.onopen = () => {
      setWs(_ws);
    };

    _ws.onclose = () => {
      toast.error('WebSocket connection was lost. Please refresh the page.', {
        className: errorToastStyle,
        autoClose: false,
        closeButton: false,
        hideProgressBar: true,
        draggable: false,
        closeOnClick: false,
      });
    };

    return () => {
      _ws.close();
    };
  }, [onMessage]);

  return ws;
}
