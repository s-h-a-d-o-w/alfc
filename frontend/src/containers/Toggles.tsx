import React, { useEffect, useState } from 'react';
import { StyledArea } from '../components/StyledArea';
import { Toggle, ToggleState } from '../components/Toggle';
import { useWebSocket } from '../utils/hooks';
import { errorToast, sendGet, sendSet } from '../utils/misc';

export function Toggles() {
  const ws = useWebSocket();

  const [gpuBoost, setGPUBoost] = useState(ToggleState.Unknown);

  // Receive execution result
  useEffect(() => {
    if (ws) {
      ws.onmessage = (event) => {
        const { kind, data, methodName } = JSON.parse(event.data);
        if (kind === 'state') {
          setGPUBoost(data.gpuBoost ? ToggleState.On : ToggleState.Off);
        } else if (kind === 'success') {
          // Current state only changes when we get the websocket
          // result.
          if (methodName === 'GetAIBoostStatus') {
            setGPUBoost(data === '0x1' ? ToggleState.On : ToggleState.Off);
          } else if (methodName === 'SetAIBoostStatus') {
            sendGet(ws, 'GetAIBoostStatus');
          }
        } else if (kind === 'error') {
          errorToast(data);
          console.error(data);
        }
      };
    }
  }, [ws]);

  if (!ws) {
    return null;
  }

  const onChangeGPUBoost: React.ChangeEventHandler = () => {
    setGPUBoost(ToggleState.Unknown);
    sendSet(ws, 'SetAIBoostStatus', {
      Data: gpuBoost === ToggleState.On ? 0 : 1,
    });
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Toggle
        label="GPU Boost"
        name="gpuBoost"
        value={gpuBoost}
        onChange={onChangeGPUBoost}
      />
    </div>
  );
}
