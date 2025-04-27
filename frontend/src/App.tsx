import styled from "@emotion/styled";
import { faExchangeAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Button } from "reactstrap";
import { CPUTuning } from "./containers/CPUTuning.js";
import { FanTable } from "./containers/FanTable.js";
import { FixedSpeed } from "./containers/FixedSpeed.js";
import { RawUI } from "./containers/RawUI.js";
import { Toggles } from "./containers/Toggles.js";
import { useWebSocket } from "./utils/useWebSocket.js";
import { errorToast } from "./utils/misc.js";
import { UpdateNotification } from "./components/UpdateNotification.js";
const StyledTopRow = styled.div`
  display: flex;
  justify-content: center;
`;

const StyledChangeModeContainer = styled.div`
  align-self: center;

  display: flex;
  align-items: center;
  justify-content: center;

  margin: 8px;
`;

function App() {
  const [doFixedSpeed, setDoFixedSpeed] = useState(false);

  const { isConnected, sendJsonMessage, lastJsonMessage } = useWebSocket();

  useEffect(() => {
    const { kind, data } = lastJsonMessage;
    if (kind === "state") {
      setDoFixedSpeed(data.doFixedSpeed);
    } else if (kind === "error") {
      errorToast("Unknown error");
      console.error(data);
    }
  }, [lastJsonMessage]);

  const onChangeMode: React.MouseEventHandler = () => {
    sendJsonMessage({ kind: "dofixedspeed", data: !doFixedSpeed });
    setDoFixedSpeed(!doFixedSpeed);
  };

  return (
    <>
      <div style={{ flexGrow: 1 }}>
        <StyledTopRow>
          <FanTable disabled={doFixedSpeed} />
          {isConnected && (
            <StyledChangeModeContainer>
              <Button onClick={onChangeMode}>
                Auto
                <br />
                <FontAwesomeIcon icon={faExchangeAlt} />
                <br />
                Fixed
              </Button>
            </StyledChangeModeContainer>
          )}
          <FixedSpeed disabled={!doFixedSpeed} />
        </StyledTopRow>
        <StyledTopRow>
          <div style={{ maxWidth: 300, marginLeft: 32, marginTop: 24 }}>
            <Toggles />
            <CPUTuning />
          </div>
        </StyledTopRow>
      </div>

      <RawUI />
      <ToastContainer />
      <UpdateNotification />
    </>
  );
}

export default App;
