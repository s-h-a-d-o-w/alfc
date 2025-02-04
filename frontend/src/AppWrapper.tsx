import App from "./App.js";
import { useWebSocket } from "./utils/hooks.js";
import styled from "@emotion/styled";
import { ErrorBoundary } from "react-error-boundary";

const StyledAppWrapper = styled.div`
  display: flex;
  flex-direction: column;

  position: absolute;
  width: 100%;
  height: 100%;
  overflow: auto;

  background-color: #3c3c49;
  color: white;
`;

const StyledCenteredMessage = styled.h3`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  padding: 32px;

  font-weight: normal;
`;

export function AppWrapper() {
  const { isConnected } = useWebSocket();

  return (
    <StyledAppWrapper>
      <ErrorBoundary
        fallbackRender={({ error }) => {
          console.error(error);
          return (
            <StyledCenteredMessage>
              Unknown, catastrophic app failure. Please report this if a restart
              doesn&apos;t solve it.
            </StyledCenteredMessage>
          );
        }}
      >
        {isConnected ? (
          <App />
        ) : (
          <>
            <StyledCenteredMessage>
              Waiting for server connection...
            </StyledCenteredMessage>
          </>
        )}
      </ErrorBoundary>
    </StyledAppWrapper>
  );
}
