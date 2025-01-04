import { theme } from "../../utils/consts";

export const disabledFormStyle = (disabled?: boolean) =>
  disabled &&
  `
&::after {
  content: '';

  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  background-color: ${theme.secondaryHalfOpacity};
  border-radius: 16px;
}
`;

export const enabledFormStyle = (disabled?: boolean) =>
  !disabled &&
  `
border-radius: 16px;
background-color: ${theme.secondary};
`;
