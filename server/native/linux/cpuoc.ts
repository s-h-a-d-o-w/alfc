import { execSync } from "child_process";

export async function tuneInit() {}

// Has to be async to make the type consistent with Windows.
// eslint-disable-next-line require-await
export async function tune(pl1: number, pl2: number) {
  execSync(
    `echo ${
      pl1 * 1000 * 1000
    } | tee /sys/devices/virtual/powercap/intel-rapl/intel-rapl:0/constraint_0_power_limit_uw`,
    {
      encoding: "utf8",
    },
  );

  execSync(
    `echo ${
      pl2 * 1000 * 1000
    } | tee /sys/devices/virtual/powercap/intel-rapl/intel-rapl:0/constraint_1_power_limit_uw`,
    {
      encoding: "utf8",
    },
  );
}
