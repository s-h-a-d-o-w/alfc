import React, { useEffect, useRef, useState } from 'react';
import { StyledApplyButton } from '../components/StyledApplyButton';
import { StyledArea } from '../components/StyledArea';
import { useWebSocket } from '../utils/hooks';
import { errorToast, successToast } from '../utils/misc';
import { FanTableEditor } from './FanTableEditor';

// const isWindows = navigator.platform === 'Win32';

export type FanTableItems = [string, string][];

export function FanTable() {
  const submitRef = useRef<HTMLButtonElement>(null);
  const ws = useWebSocket();

  const [cpuTable, setCPUTable] = useState<FanTableItems>([]);
  const [gpuTable, setGPUTable] = useState<FanTableItems>([]);

  useEffect(() => {
    if (ws) {
      ws.onmessage = (event) => {
        const { kind, data } = JSON.parse(event.data);
        if (kind === 'state') {
          setCPUTable(data.cpuFanTable);
          setGPUTable(data.gpuFanTable);
        } else if (kind === 'success') {
          successToast('Successfully applied.');
        } else if (kind === 'error') {
          errorToast(data);
          console.error(data);
        }
      };
    }
  }, [ws]);

  const onSubmit: React.FormEventHandler = (event) => {
    event.preventDefault();
    submitRef.current?.focus();
    ws?.send(
      JSON.stringify({
        kind: 'fantable',
        data: {
          cpu: cpuTable.map((entry) => [
            parseInt(entry[0], 10),
            parseInt(entry[1], 10),
          ]),
          gpu: gpuTable.map((entry) => [
            parseInt(entry[0], 10),
            parseInt(entry[1], 10),
          ]),
        },
      })
    );
  };

  if (!ws) {
    return null;
  }

  return (
    <form onSubmit={onSubmit} style={{ textAlign: 'center', marginTop: 32 }}>
      <div style={{ display: 'flex' }}>
        <StyledArea>
          <h2>CPU</h2>
          <FanTableEditor
            onChange={(nextCurvePoints) => setCPUTable(nextCurvePoints)}
            value={cpuTable}
          />
        </StyledArea>
        <StyledArea>
          <h2>GPU</h2>
          <FanTableEditor
            onChange={(nextCurvePoints) => setGPUTable(nextCurvePoints)}
            value={gpuTable}
          />
        </StyledArea>
      </div>
      <StyledApplyButton ref={submitRef} type="submit">
        Apply
      </StyledApplyButton>
    </form>
  );
}
