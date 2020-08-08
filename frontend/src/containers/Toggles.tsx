import React, { useEffect, useState } from 'react';
import { useWebSocket } from '../utils/hooks';
import { sendGet, sendSet, errorToast } from '../utils/misc';
import { toast } from 'react-toastify';
import { StyledArea } from '../components/StyledArea';
import styled from '@emotion/styled';

enum State {
  On,
  Off,
  Unknown,
}

const CONTAINER_HEIGHT = 24;
const CONTAINER_PADDING = 2;
const CONTAINER_WIDTH = CONTAINER_HEIGHT * 2 - CONTAINER_PADDING * 2;
const TOGGLE_DIAMETER = CONTAINER_HEIGHT - CONTAINER_PADDING * 2;

const StyledToggleContainer = styled.label`
  position: relative;
  display: inline-block;
  width: ${CONTAINER_WIDTH}px;
  height: ${CONTAINER_HEIGHT}px;
`;

const StyledToggle = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.2s;
  border-radius: ${CONTAINER_HEIGHT}px;

  &:before {
    position: absolute;
    content: '';
    height: ${TOGGLE_DIAMETER}px;
    width: ${TOGGLE_DIAMETER}px;
    left: ${CONTAINER_PADDING}px;
    bottom: ${CONTAINER_PADDING}px;
    background-color: white;
    transition: 0.2s;
    border-radius: 50%;
  }
`;

const StyledInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;

  &:checked + ${StyledToggle} {
    background-color: #acd132;
  }

  &:focus + ${StyledToggle} {
    box-shadow: 0 0 1px #acd132;
  }

  &:checked + ${StyledToggle}:before {
    transform: translateX(${TOGGLE_DIAMETER}px);
  }
`;

export function Toggles() {
  const ws = useWebSocket();

  const [gpuBoost, setGPUBoost] = useState(State.Unknown);

  // Receive execution result
  useEffect(() => {
    if (ws) {
      ws.onmessage = (event) => {
        const { kind, data, methodName } = JSON.parse(event.data);
        if (kind === 'state') {
          setGPUBoost(data.gpuBoost ? State.On : State.Off);
        } else if (kind === 'success') {
          // Current state only changes when we get the websocket
          // result.
          if (methodName === 'GetAIBoostStatus') {
            setGPUBoost(data === '0x1' ? State.On : State.Off);
          } else if (methodName === 'SetAIBoostStatus') {
            sendGet(ws, 'GetAIBoostStatus');
          }
        } else {
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
    setGPUBoost(State.Unknown);
    sendSet(ws, 'SetAIBoostStatus', {
      Data: gpuBoost === State.On ? 0 : 1,
    });
  };

  return (
    <StyledArea>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <StyledToggleContainer>
          <StyledInput
            disabled={gpuBoost === State.Unknown}
            type="checkbox"
            id="gpuBoost"
            name="gpuBoost"
            checked={gpuBoost === State.On}
            // @ts-ignore No time to debug this nonsense
            onChange={onChangeGPUBoost}
          />
          <StyledToggle />
        </StyledToggleContainer>
        <label
          htmlFor="gpuBoost"
          style={{
            marginLeft: 8,
            whiteSpace: 'nowrap',
            display: 'inline-block',
          }}
        >
          <h2>GPU Boost</h2>
        </label>
      </div>
    </StyledArea>
  );
}
