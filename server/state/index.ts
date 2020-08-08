import fs from 'fs';
import stringifyCompact from 'json-stringify-pretty-compact';
import path from 'path';
import WebSocket from 'ws';

const CONFIG_FILE =
  process.env.NODE_ENV === 'production'
    ? path.join(__dirname, '../alfc.config.json')
    : path.join(__dirname, '../../alfc.config.json');

export type FanTable = [number, number][];

export type State = {
  cpuFanTable: FanTable;
  gpuFanTable: FanTable;
  gpuBoost: boolean;
  pl1: number;
  pl2: number;

  activitySocket?: WebSocket;
};

export const state: State = JSON.parse(
  fs.readFileSync(CONFIG_FILE, { encoding: 'utf8' })
);

export function persistState() {
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
