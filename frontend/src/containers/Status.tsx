import React, { useEffect, useState, useCallback, useRef } from 'react';
import { StyledArea } from '../components/StyledArea';
import { useWebSocket } from '../utils/hooks';
import { sendMessage } from '../utils/misc';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { SimpleTooltip } from '../components/SimpleTooltip';

export function Status({ disabled }: { disabled: boolean }) {
  const tooltipRef = useRef(null);

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
      <h2>
        Status <FontAwesomeIcon icon={faInfoCircle} forwardedRef={tooltipRef} />
        <SimpleTooltip target={tooltipRef}>
          There's only one target speed because both fans always operate at the
          same speed. Whichever target speed for either CPU or GPU would be
          higher "wins".
        </SimpleTooltip>
      </h2>
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
