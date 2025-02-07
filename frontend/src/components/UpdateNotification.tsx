import styled from "@emotion/styled";
import { theme } from "../utils/consts";

const StyledLink = styled.a`
  position: fixed;
  top: 16px;
  right: 16px;
  padding: 8px 16px;
  background-color: ${theme.primary};
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-size: 14px;

  &:hover {
    opacity: 0.9;
  }
`;

export function UpdateNotification() {
  return (
    <StyledLink
      href="https://github.com/s-h-a-d-o-w/alfc/releases/latest"
      target="_blank"
      rel="noopener noreferrer"
    >
      New version available!
    </StyledLink>
  );
}
