import fs from 'fs';
import stringifyCompact from 'json-stringify-pretty-compact';
import path from 'path';
import WebSocket from 'ws';
import { isDev } from '../utils/consts';

const CONFIG_FILE = isDev
  ? path.join(__dirname, '../../alfc.config.json')
  : path.join(__dirname, '../alfc.config.json');

export type FanTable = [number, number][];

export type State = {
  cpuFanTable: FanTable;
  gpuFanTable: FanTable;

  doFixedSpeed: boolean;
  fixedPercentage: number;

  gpuBoost: boolean;
  pl1: number;
  pl2: number;

  activitySocket?: WebSocket;
};

export const state: State = JSON.parse(
  fs.readFileSync(CONFIG_FILE, { encoding: 'utf8' })
);

export function persistState() {
  // No persistence in dev so that we don't keep getting changes to the
  // default alfc.config.json.
  if (isDev) {
    return;
  }

  const stateCopy = Object.assign({}, state);
  delete stateCopy.activitySocket;
  try {
    // Why JSON:
    // Bad readability when it comes to 2D int arrays with yml
    fs.writeFile(
      CONFIG_FILE,
      stringifyCompact(stateCopy),
      { encoding: 'utf8' },
      (error) => {
        if (error) {
          console.error(error);
        }
      }
    );
  } catch (error) {
    console.error('Error trying to persist state: ' + error);
  }
}
