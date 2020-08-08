import '@csstools/normalize.css';
import styled from '@emotion/styled';
import React, { useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import { CPUTuning } from './containers/CPUTuning';
import { Debug } from './containers/Debug';
import { FanTable } from './containers/FanTable';
import { Toggles } from './containers/Toggles';
import { Status } from './containers/Status';
import { css } from 'emotion';

const StyledApp = styled.div`
  display: flex;
  flex-direction: column;

  position: absolute;
  width: 100%;
  height: 100%;

  background-color: #3c3c49;
  color: white;
`;

const StyledMain = styled.main`
  display: flex;
  justify-content: center;
`;

function App() {
  return (
    <div>
      <StyledApp>
        <div style={{ flexGrow: 1 }}>
          <StyledMain>
            <FanTable />
            <div style={{ maxWidth: 300, marginLeft: 32, marginTop: 24 }}>
              <Toggles />
              <CPUTuning />
            </div>
          </StyledMain>
          <Status />
        </div>
        <Debug />
        <ToastContainer style={{ borderRadius: 4 }} />
      </StyledApp>
    </div>
  );
}

export default App;
