// Can't be imported in CRA App... -_-
// Maybe there's a workaround. Since TS takes care of things, it 
// shouldn't matter anyway.

export type Args = {
  [key: string]: number;
};

export enum MessageToClientKind {
  FanControlActivity = 'fancontrolactivity',
  State = 'state',
  Success = 'success',
  Error = 'error',
}

export enum MessageToServerKind {
  Get = 'get',
  Set = 'set',
  Tune = 'tune',
  FanTable = 'fantable',
  FixedPercentage = 'fixedpercentage',
  DoFixedSpeed = 'dofixedspeed',
  RegisterActivitySocket = 'registeractivitysocket',
}

export type MessageToClient = {
  kind: MessageToClientKind,
  methodId: string,
  methodName: string,
  data?: string,
};

export type MessageToServer = {
  kind: MessageToServerKind,
  methodId: string,
  methodName: string,
  data?: any,
};

