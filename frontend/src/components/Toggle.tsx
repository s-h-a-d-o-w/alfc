import styled from '@emotion/styled';
import React from 'react';
import { theme } from '../utils/consts';

export enum ToggleState {
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
    background-color: ${theme.primary};
  }

  &:focus + ${StyledToggle} {
    box-shadow: 0 0 1px ${theme.primary};
  }

  &:checked + ${StyledToggle}:before {
    transform: translateX(${TOGGLE_DIAMETER}px);
  }
`;

const StyledLabel = styled.label`
  display: inline-block;
  margin-left: 8px;
  cursor: pointer;
`;

type Props = {
  label: string;
  name: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  value: ToggleState;
};

export function Toggle({ label, name, onChange, value }: Props) {
  return (
    <>
      <StyledToggleContainer>
        <StyledInput
          disabled={value === ToggleState.Unknown}
          type="checkbox"
          id={name}
          name={name}
          checked={value === ToggleState.On}
          onChange={onChange}
        />
        <StyledToggle />
      </StyledToggleContainer>
      <StyledLabel
        htmlFor={name}
        style={{
          marginLeft: 8,
          whiteSpace: 'nowrap',
          display: 'inline-block',
        }}
      >
        <h2>{label}</h2>
      </StyledLabel>
    </>
  );
}
