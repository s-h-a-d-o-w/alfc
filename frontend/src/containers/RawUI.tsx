import styled from '@emotion/styled';
import React, { useCallback, useRef, useState } from 'react';
import { getMethods, setMethods } from '../data/mof';
import { useWebSocket } from '../utils/hooks';
import { theme } from '../utils/consts';

enum Kind {
  Get = 'get',
  Set = 'set',
}

const StyledHeader = styled.div`
  width: 100%;
  margin-top: 32px;
  padding: 8px;

  background-color: ${theme.secondary};

  cursor: pointer;
`;

const StyledContent = styled.div`
  font-size: 14px;
`;

const StyledControls = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 8px;
`;

const StyledForm = styled.form`
  display: flex;
  align-items: center;
`;

export function RawUI() {
  const refRun = useRef<HTMLButtonElement>(null);

  const [kind, setKind] = useState(Kind.Get);
  const [methodName, setMethodName] = useState('');
  const [args, setArgs] = useState<{ [key: string]: number }>({});
  const [isRunning, setIsRunning] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [result, setResult] = useState('');

  const ws = useWebSocket(
    useCallback((event) => {
      const payload = JSON.parse(event.data);
      if (payload.kind !== 'state') {
        setResult(`${new Date().toLocaleTimeString()}: ${payload.data}`);
        setIsRunning(false);
      }
    }, [])
  );

  if (!ws) {
    return null;
  }

  const onKindChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    setKind(event.target.value as Kind);
    setMethodName('');
    setArgs({});
  };

  const onSubmit: React.FormEventHandler = (event) => {
    event.preventDefault();
    refRun.current?.focus();
    setIsRunning(true);
    ws.send(
      JSON.stringify({
        kind,
        methodId:
          kind === Kind.Get
            ? getMethods[methodName].methodId
            : setMethods[methodName].methodId,
        methodName,
        data: Object.keys(args).length > 0 ? args : undefined,
      })
    );
  };

  const methods = kind === Kind.Get ? getMethods : setMethods;
  const methodNameOptions = Object.keys(methods).map((methodName) => (
    <option key={methodName} value={methodName}>
      {methodName}
    </option>
  ));
  const argumentsComponent =
    methodName === '' ? null : methods[methodName].inArgs.length ===
      0 ? null : (
      <div>
        Arguments:
        {methods[methodName].inArgs.map((arg, idx) => (
          <div key={arg.name}>
            <label>
              <em>{arg.type}</em> {arg.name} ({arg.description})
              <input
                type="number"
                min={0}
                max={255}
                onChange={(event) => {
                  event.persist();
                  setArgs((prev) => {
                    return {
                      ...prev,
                      [arg.name]: parseInt(event.target.value, 10),
                    };
                  });
                }}
                value={args[arg.name] ?? ''}
              />
            </label>
          </div>
        ))}
      </div>
    );

  const isRunnable =
    methodName !== '' &&
    Object.keys(args).length === methods[methodName].inArgs.length;

  const content = isVisible && (
    <StyledContent>
      <div style={{ margin: 8 }}>
        ⚠️ It goes without saying that you should know what you're doing when
        using this.
        <br />
        Some of these simply won't work probably because these commands are used
        on many different laptops and the Aorus 15G doesn't have implementations
        for all of them.
      </div>
      <StyledControls onSubmit={onSubmit}>
        <StyledForm>
          <div>
            <label>
              <input
                type="radio"
                name="kind"
                value={Kind.Get}
                checked={kind === Kind.Get}
                onChange={onKindChange}
              />
              Get
            </label>
            <br />
            <label>
              <input
                type="radio"
                name="kind"
                value={Kind.Set}
                checked={kind === Kind.Set}
                onChange={onKindChange}
              />
              Set
            </label>
          </div>
          <select
            name="methodName"
            size={10}
            onChange={(event) => {
              setArgs({});
              setMethodName(event.target.value);
            }}
          >
            {methodNameOptions}
          </select>
          {argumentsComponent}
          <div>
            {methodName !== '' &&
              methods[methodName].outArgs.length > 0 &&
              methods[methodName].outArgs[0].type === 'uint16' && (
                <div style={{ marginLeft: 4 }}>
                  uint16 output =&gt; little endian!
                </div>
              )}
            <button
              disabled={!isRunnable || isRunning}
              type="submit"
              ref={refRun}
            >
              Run
            </button>
          </div>
        </StyledForm>
        <div>
          <label>
            Output
            <br />
            <textarea readOnly rows={4} cols={40} value={result} />
          </label>
        </div>
      </StyledControls>
    </StyledContent>
  );

  return (
    <div>
      <StyledHeader onClick={() => setIsVisible(!isVisible)}>
        Raw UI
      </StyledHeader>
      {content}
    </div>
  );
}
