import { ReactNode, useState } from "react";
import { Tooltip, TooltipProps } from "reactstrap";
import styled from "@emotion/styled";

const StyledContent = styled.div<{
  unlimitedWidth?: boolean;
}>`
  background-color: white;
  border-radius: 4px;
  padding: 16px;
  margin: 16px;
  ${({ unlimitedWidth }) => (unlimitedWidth ? "" : "width: 400px;")}
`;

export const SimpleTooltip = ({
  children,
  unlimitedWidth = false,
  ...props
}: TooltipProps & {
  children: ReactNode;
  unlimitedWidth?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    // Warning in console can be ignored:
    // https://github.com/reactstrap/reactstrap/issues/2819
    <Tooltip
      isOpen={isOpen}
      toggle={() => setIsOpen((prevIsOpen) => !prevIsOpen)}
      {...props}
    >
      <StyledContent unlimitedWidth={unlimitedWidth}>{children}</StyledContent>
    </Tooltip>
  );
};
