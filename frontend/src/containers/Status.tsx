import React, { useEffect, useState, useCallback } from 'react';
import { StyledArea } from '../components/StyledArea';
import { useWebSocket } from '../utils/hooks';
import { sendMessage } from '../utils/misc';

export function Status({ disabled }: { disabled: boolean }) {
  const [appliedSpeed, setAppliedSpeed] = useState('-');
  const [avgCPUTemp, setAvgCPUTemp] = useState('-');
  const [avgGPUTemp, setAvgGPUTemp] = useState('-');
  const [target, setTarget] = useState('-');

  const ws = useWebSocket(
    useCallback((event) => {
      const { kind, data } = JSON.parse(event.data);
      if (kind === 'fancontrolactivity') {
        setAppliedSpeed(data.appliedSpeed);
        setAvgCPUTemp(data.avgCPUTemp);
        setAvgGPUTemp(data.avgGPUTemp);
        setTarget(data.target);
      } else if (kind === 'error') {
        console.error(data);
      }
    }, [])
  );

  useEffect(() => {
    if (disabled) {
      // Blanking out values must be delayed since we'll
      // still receive fancontrolactivity for a bit, until
      // server has actually stopped the auto fan control.
      setTimeout(() => {
        setAppliedSpeed('-');
        setAvgCPUTemp('-');
        setAvgGPUTemp('-');
        setTarget('-');
      }, 500);
    } else {
      sendMessage(ws, { kind: 'registeractivitysocket' });
    }
  }, [disabled, ws]);

  if (!ws) {
    return null;
  }

  const status = `CPU: ${avgCPUTemp}°C
GPU: ${avgGPUTemp}°C
Current target: ${target}%
Last applied: ${appliedSpeed}%`;
  return (
    <StyledArea>
      <h2>Status</h2>
      <textarea
        readOnly
        value={status}
        rows={4}
        cols={25}
        style={{ fontSize: 14, cursor: 'default' }}
      />
    </StyledArea>
  );
}
