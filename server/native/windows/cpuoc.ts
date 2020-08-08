import { promisify } from 'util';
import { createEdgeFunc } from './edge';

type DotNetArg = {
  pl1: number;
  pl2: number;
};

const initEdgeFunc = promisify(createEdgeFunc('CPUOC.dll', 'Init'));
const tuneEdgeFunc = promisify(
  createEdgeFunc<DotNetArg, number[]>('CPUOC.dll', 'Tune')
);

export async function tuneInit() {
  await initEdgeFunc(null);
}

export async function tune(pl1: number, pl2: number) {
  await tuneEdgeFunc({
    pl1,
    pl2,
  });
}
