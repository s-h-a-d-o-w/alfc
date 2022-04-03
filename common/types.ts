// Can't be imported in CRA App... -_-
// Maybe there's a workaround. Since TS takes care of things, it
// shouldn't matter anyway.

import WebSocket from 'ws';

export type FanTable = [number, number][];

export type State = {
  cpuFanTable: FanTable;
  gpuFanTable: FanTable;

  doFixedSpeed: boolean;
  fixedPercentage: number;

  gpuBoost: boolean;
  pl1: number;
  pl2: number;

  // Exclude from persistence below.
  activitySocket?: WebSocket;
  isCpuTuningAvailable?: boolean;
};

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

export type MessageToClient =
  | {
      kind: MessageToClientKind.State;
      data?: string;
    }
  | {
      kind: MessageToClientKind.Success;
      data?: unknown;
    };

export type MessageToServer = {
  kind: MessageToServerKind;
  methodId: string;
  methodName: string;
  data?: any;
};
