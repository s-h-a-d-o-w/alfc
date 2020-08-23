import styled from '@emotion/styled';
import React, { useCallback, useRef, useState } from 'react';
import { StyledApplyButton } from '../components/StyledApplyButton';
import { StyledArea } from '../components/StyledArea';
import { useWebSocket } from '../utils/hooks';
import { errorToast, sendMessage, successToast } from '../utils/misc';
import { FanTableEditor } from './FanTableEditor';
import { Status } from './Status';
import { disabledFormStyle, enabledFormStyle } from './styles/misc';

export type FanTableItems = [string, string][];

const StyledForm = styled.form<{ disabled: boolean }>`
  position: relative;

  text-align: center;
  padding: 0 32px;
  margin: 32px;

  ${({ disabled }) => enabledFormStyle(disabled)}
  ${({ disabled }) => disabledFormStyle(disabled)}
`;

export function FanTable({ disabled }: { disabled: boolean }) {
  const submitRef = useRef<HTMLButtonElement>(null);

  const [cpuTable, setCPUTable] = useState<FanTableItems>([]);
  const [gpuTable, setGPUTable] = useState<FanTableItems>([]);

  const ws = useWebSocket(
    useCallback((event) => {
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
    }, [])
  );

  if (!ws) {
    return null;
  }

  const onSubmit: React.FormEventHandler = (event) => {
    event.preventDefault();
    submitRef.current?.focus();
    sendMessage(ws, {
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
    });
  };

  return (
    <StyledForm disabled={disabled} onSubmit={onSubmit}>
      <div style={{ display: 'flex' }}>
        <StyledArea>
          <h2 style={{ marginTop: 0 }}>CPU</h2>
          <FanTableEditor
            onChange={(nextCurvePoints) => setCPUTable(nextCurvePoints)}
            value={cpuTable}
          />
        </StyledArea>
        <StyledArea style={{ marginRight: 0 }}>
          <h2 style={{ marginTop: 0 }}>GPU</h2>
          <FanTableEditor
            onChange={(nextCurvePoints) => setGPUTable(nextCurvePoints)}
            value={gpuTable}
          />
        </StyledArea>
      </div>
      <StyledApplyButton
        ref={submitRef}
        type="submit"
        style={{ marginBottom: 16 }}
      >
        Apply
      </StyledApplyButton>
      {<Status disabled={disabled} />}
    </StyledForm>
  );
}
