import styled from '@emotion/styled';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useCallback, useRef, useState } from 'react';
import { SimpleTooltip } from '../components/SimpleTooltip';
import { StyledApplyButton } from '../components/StyledApplyButton';
import { StyledArea } from '../components/StyledArea';
import { useWebSocket } from '../utils/hooks';
import { errorToast, sendTune, successToast } from '../utils/misc';

const StyledInput = styled.input`
  width: 56px;
`;

const StyledLabel = styled.label`
  display: inline-flex;
  align-items: center;
`;

export function CPUTuning() {
  const tooltipRef = useRef(null);

  const [isApplying, setIsApplying] = useState(false);
  const [pl1, setPL1] = useState('38');
  const [pl2, setPL2] = useState('107');

  const ws = useWebSocket(
    useCallback((event) => {
      setIsApplying(false);
      const { kind, data } = JSON.parse(event.data);
      if (kind === 'state') {
        setPL1(data.pl1);
        setPL2(data.pl2);
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
    setIsApplying(true);
    sendTune(ws, parseInt(pl1, 10), parseInt(pl2, 10));
  };

  return (
    <StyledArea style={{ marginTop: 32 }}>
      <h2 style={{ marginBottom: 16 }}>
        CPU power limits{' '}
        <FontAwesomeIcon icon={faInfoCircle} forwardedRef={tooltipRef} />
        <SimpleTooltip target={tooltipRef}>
          Gigabyte uses 38/107 for ECO and 62/107 for Boost. Without Control
          Center installed, Windows uses 38/135.
        </SimpleTooltip>
      </h2>
      <form onSubmit={onSubmit}>
        <StyledLabel>
          PL1
          <StyledInput
            size={4}
            type="number"
            onChange={(event) => setPL1(event.target.value)}
            value={pl1}
          />
        </StyledLabel>
        <br />
        <StyledLabel>
          PL2
          <StyledInput
            size={4}
            type="number"
            onChange={(event) => setPL2(event.target.value)}
            value={pl2}
          />
        </StyledLabel>
        <br />
        <StyledApplyButton
          disabled={isApplying}
          type="submit"
          style={{ marginTop: 16 }}
        >
          Apply
        </StyledApplyButton>
      </form>
    </StyledArea>
  );
}
