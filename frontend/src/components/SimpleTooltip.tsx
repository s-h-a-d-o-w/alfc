import React, { useState } from 'react';
import { Tooltip, TooltipProps } from 'reactstrap';
import styled from '@emotion/styled';

const StyledTooltip = styled.div<{
  unlimitedWidth?: boolean;
}>`
  background-color: white;
  border-radius: 4px;
  padding: 16px;
  margin: 16px;
  ${({ unlimitedWidth }) => (unlimitedWidth ? '' : 'width: 400px;')}
`;

export const SimpleTooltip: React.FC<TooltipProps & {
  unlimitedWidth?: boolean;
}> = ({ children, unlimitedWidth = false, ...props }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Tooltip
      isOpen={isOpen}
      toggle={() => setIsOpen((prevIsOpen) => !prevIsOpen)}
      {...props}
    >
      <StyledTooltip unlimitedWidth={unlimitedWidth}>{children}</StyledTooltip>
    </Tooltip>
  );
};
