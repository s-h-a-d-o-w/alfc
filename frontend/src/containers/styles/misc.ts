export const disabledFormStyle = (disabled: boolean) =>
  disabled &&
  `
&::after {
  content: '';

  position: absolute;
  z-index: 10;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  background-color: hsl(240 10% 40% / 0.5);
  border-radius: 16px;
}
`;

export const enabledFormStyle = (disabled: boolean) =>
  !disabled &&
  `
border-radius: 16px;
background-color: hsl(240 10% 40% / 1);
`;
