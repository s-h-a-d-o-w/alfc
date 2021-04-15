import '@csstools/normalize.css';
import styled from '@emotion/styled';
import { faExchangeAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useCallback, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Button } from 'reactstrap';
import './App.css';
import { CPUTuning } from './containers/CPUTuning';
import { FanTable } from './containers/FanTable';
import { FixedSpeed } from './containers/FixedSpeed';
import { RawUI } from './containers/RawUI';
import { Toggles } from './containers/Toggles';
import { useWebSocket } from './utils/hooks';
import { errorToast, sendMessage } from './utils/misc';

const StyledApp = styled.div`
  display: flex;
  flex-direction: column;

  position: absolute;
  width: 100%;
  height: 100%;
  overflow: auto;

  background-color: #3c3c49;
  color: white;
`;

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

  const ws = useWebSocket(
    useCallback((event) => {
      const { kind, data } = JSON.parse(event.data);
      if (kind === 'state') {
        setDoFixedSpeed(data.doFixedSpeed);
      } else if (kind === 'error') {
        errorToast(data);
        console.error(data);
      }
    }, [])
  );

  if (!ws) {
    return null;
  }

  const onChangeMode: React.MouseEventHandler = () => {
    sendMessage(ws, { kind: 'dofixedspeed', data: !doFixedSpeed });
    setDoFixedSpeed(!doFixedSpeed);
  };

  return (
    <div>
      <StyledApp>
        <div style={{ flexGrow: 1 }}>
          <StyledTopRow>
            <FanTable disabled={doFixedSpeed} />
            <StyledChangeModeContainer>
              <Button onClick={onChangeMode}>
                Auto
                <br />
                <FontAwesomeIcon icon={faExchangeAlt} />
                <br />
                Fixed
              </Button>
            </StyledChangeModeContainer>
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
        <ToastContainer style={{ borderRadius: 4 }} />
      </StyledApp>
    </div>
  );
}

export default App;
