import type WebSocket from "ws";

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
  FanControlActivity = "fancontrolactivity",
  State = "state",
  Success = "success",
  Error = "error",
}

export enum MessageToServerKind {
  Get = "get",
  Set = "set",
  Tune = "tune",
  FanTable = "fantable",
  FixedPercentage = "fixedpercentage",
  DoFixedSpeed = "dofixedspeed",
  RegisterActivitySocket = "registeractivitysocket",
}

export type FanControlActivity = {
  appliedSpeed: number | null;
  avgCPUTemp: number;
  avgGPUTemp: number;
  target: number;
};

export type MessageToClient = Pick<MessageToServer, "methodName" | "methodId"> &
  (
    | {
        kind: MessageToClientKind.State;
        data: State;
      }
    | {
        kind: MessageToClientKind.Success;
        data?: unknown;
      }
    | {
        kind: MessageToClientKind.Error;
        data: string;
      }
    | {
        kind: MessageToClientKind.FanControlActivity;
        data: FanControlActivity;
      }
  );

export type MessageToServer = {
  kind: MessageToServerKind;
  methodId: string;
  methodName: string;
  data?: any;
};
