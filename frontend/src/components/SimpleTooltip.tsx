import React, { useState } from 'react';
import { Tooltip, TooltipProps } from 'reactstrap';
import styled from '@emotion/styled';

const StyledTooltip = styled.div`
  background-color: white;
  border-radius: 4px;
  padding: 16px;
  margin: 16px;
  max-width: 200px;
`;

export const SimpleTooltip: React.FC<TooltipProps> = ({
  children,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Tooltip
      isOpen={isOpen}
      toggle={() => setIsOpen((prevIsOpen) => !prevIsOpen)}
      {...props}
    >
      <StyledTooltip>{children}</StyledTooltip>
    </Tooltip>
  );
};
