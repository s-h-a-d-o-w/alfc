import React, { useEffect, useState } from 'react';
import './App.css';
import { Debug } from './components/Debug';

const ws = new WebSocket('ws://localhost:3001');
export const WebsocketContext = React.createContext(ws);

function App() {
  const [isWebSocketOpen, setIsWebSocketOpen] = useState(false);

  useEffect(() => {
    ws.onopen = () => {
      setIsWebSocketOpen(true);
    };
  }, []);

  if (!isWebSocketOpen) {
    return <div>Establishing connection to backend...</div>;
  }

  return (
    <WebsocketContext.Provider value={ws}>
      <div className="App">
        <Debug />
      </div>
    </WebsocketContext.Provider>
  );
}

export default App;
