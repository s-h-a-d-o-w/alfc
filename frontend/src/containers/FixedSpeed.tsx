import styled from '@emotion/styled';
import React, { useEffect, useRef, useState } from 'react';
import { StyledApplyButton } from '../components/StyledApplyButton';
import { useWebSocket } from '../utils/hooks';
import { errorToast, successToast, sendMessage } from '../utils/misc';
import { disabledFormStyle, enabledFormStyle } from './styles/misc';

const StyledForm = styled.form<{ disabled: boolean }>`
  position: relative;
  display: flex;
  align-items: center;

  text-align: center;
  padding: 0 32px;
  margin: 32px;

  ${({ disabled }) => enabledFormStyle(disabled)}
  ${({ disabled }) => disabledFormStyle(disabled)}
`;

const StyledInput = styled.input`
  width: 3rem;
`;

export function FixedSpeed({ disabled }: { disabled: boolean }) {
  const submitRef = useRef<HTMLButtonElement>(null);
  const ws = useWebSocket();

  const [fixedPercentage, setFixedPercentage] = useState('0');

  useEffect(() => {
    if (ws) {
      ws.onmessage = (event) => {
        const { kind, data } = JSON.parse(event.data);
        if (kind === 'state') {
          setFixedPercentage(data.fixedPercentage);
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
    sendMessage(ws, {
      kind: 'fixedpercentage',
      data: parseInt(fixedPercentage, 10),
    });
  };

  if (!ws) {
    return null;
  }

  return (
    <StyledForm disabled={disabled} onSubmit={onSubmit}>
      <div>
        <h2>Fan Speed</h2>
        <StyledInput
          type="number"
          name="percentage"
          min={0}
          max={100}
          maxLength={3}
          size={4}
          onChange={(event) => {
            setFixedPercentage(event.target.value);
          }}
          value={fixedPercentage}
        />
        <br />
        <StyledApplyButton
          ref={submitRef}
          type="submit"
          style={{ marginTop: 16 }}
        >
          Apply
        </StyledApplyButton>
      </div>
    </StyledForm>
  );
}
