import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export function useWebSocket() {
  const [ws, setWs] = useState<WebSocket>();

  useEffect(() => {
    const _ws = new WebSocket('ws://localhost:5522');
    _ws.onopen = () => {
      setWs(_ws);
    };

    _ws.onclose = () => {
      toast.error('WebSocket connection was lost. Please refresh the page.', {
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
  }, []);

  return ws;
}
