import React, { useContext, useRef, useState, useEffect } from 'react';
import { WebsocketContext } from '../App';
import { getMethods, setMethods } from '../data/mof';

enum Kind {
  Get = 'Get',
  Set = 'Set',
}

function argstoHexString(args: string[]) {
  return (
    '0x' + Buffer.from(args.map((arg) => parseInt(arg, 10))).toString('hex')
  );
}

export function Debug() {
  const refRun = useRef<HTMLButtonElement>(null);

  const ws = useContext(WebsocketContext);

  const [kind, setKind] = useState(Kind.Get);
  const [methodName, setMethodName] = useState('');
  const [args, setArgs] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState('');

  // Receive execution result
  useEffect(() => {
    ws.onmessage = (event) => {
      const payload = JSON.parse(event.data);
      let nextResult = new Date().toLocaleTimeString() + ': ';
      if (payload.kind === 'success') {
        nextResult += payload.result || 'SUCCESS';
      } else {
        nextResult += 'ERROR: ' + payload.result;
      }
      setResult(nextResult);
    };
  }, [ws]);

  const onKindChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    setKind(event.target.value as Kind);
    setMethodName('');
    setArgs([]);
  };

  const onSubmit: React.FormEventHandler = (event) => {
    event.preventDefault();
    refRun.current?.focus();
    setIsRunning(true);
    ws.send(
      JSON.stringify({
        kind,
        methodName,
        args: argstoHexString(args),
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
                    const next = prev.slice();
                    next[idx] = event.target.value;
                    return next;
                  });
                }}
                value={args[idx] || ''}
              />
            </label>
          </div>
        ))}
      </div>
    );

  const isRunnable =
    methodName !== '' &&
    args.reduce(
      (prev, current) =>
        current !== undefined && current !== '' ? prev + 1 : prev,
      0
    ) === methods[methodName].inArgs.length;

  return (
    <div>
      <form onSubmit={onSubmit}>
        <fieldset>
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
        </fieldset>
        <select
          name="methodName"
          size={10}
          onChange={(event) => {
            setArgs([]);
            setMethodName(event.target.value);
          }}
        >
          {methodNameOptions}
        </select>
        {argumentsComponent}
        <button disabled={!isRunnable || isRunning} type="submit" ref={refRun}>
          Run
        </button>
      </form>
      <label>
        Output
        <textarea readOnly rows={2} cols={40} value={result} />
      </label>
    </div>
  );
}
