import { execSync } from 'child_process';

// eslint-disable-next-line @typescript-eslint/no-empty-function
export async function tuneInit() {}

// Only async to make the API consistent with Windows.
// In both cases, we wait for the execution to be done anyway.
export async function tune(pl1: number, pl2: number) {
  execSync(
    `echo ${pl1 *
      1000 *
      1000} | tee /sys/devices/virtual/powercap/intel-rapl/intel-rapl:0/constraint_0_power_limit_uw`,
    {
      encoding: 'utf8',
    }
  );

  execSync(
    `echo ${pl2 *
      1000 *
      1000} | tee /sys/devices/virtual/powercap/intel-rapl/intel-rapl:0/constraint_1_power_limit_uw`,
    {
      encoding: 'utf8',
    }
  );
}
