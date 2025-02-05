import styled from "@emotion/styled";
import { theme } from "../utils/consts.js";

export const StyledApplyButton = styled.button`
  font-size: 16px;
  padding: 8px 16px;

  &:disabled {
    background-color: ${theme.secondary};
    opacity: 0.5;

    cursor: default;
  }
`;
