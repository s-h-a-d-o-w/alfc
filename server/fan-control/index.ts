import {
  MessageToClientKind,
  FanTable,
  FanControlActivity,
} from "../../common/types.js";
import { getCall, setCall } from "../native";
import { state } from "../state/index.js";

export const WAIT_RAMP_DOWN_CYCLES = 10;
export const WAIT_RAMP_UP_CYCLES = 3;
export const CYCLE_DURATION = 1000;
const TEMP_POLL_INTERVAL = 200;

export function fanPercentToSpeed(percent: number) {
  return Math.ceil((percent / 100.0) * 229);
}

// Both CPU and GPU fan are set to the same speed
// due to the shared heat pipes.
export function setFixedFan(percent: number) {
  const speed = fanPercentToSpeed(percent);

  // SetFixedFanSpeed
  setCall("0x6b", "SetFixedFanSpeed", { Data: speed });
  // SetGPUFanDuty
  setCall("0x47", "SetGPUFanDuty", { Data: speed });
}

async function getCallInt(methodId: string, methodName: string) {
  // On rare occassions, the call returns `null`.
  const result = parseInt(await getCall(methodId, methodName), 16);
  return isNaN(result) ? 200 : result; // Force highest speed when temperature reading fails
}

function initFanControl() {
  setCall("0x58", "SetSuperQuiet", { Data: 0 });
  setCall("0x71", "SetAutoFanStatus", { Data: 0 });
  setCall("0x67", "SetStepFanStatus", { Data: 0 });
  setCall("0x6a", "SetFixedFanStatus", { Data: 1 });
}

function resetFanSpeed() {
  setFixedFan(state.cpuFanTable[0][1]);
  return state.cpuFanTable[0][1];
}

function sendActivity(data: FanControlActivity) {
  if (!state.activitySocket) {
    return;
  }

  try {
    if (state.activitySocket.readyState !== state.activitySocket.OPEN) {
      state.activitySocket.close();
      state.activitySocket = undefined;
      return;
    }

    state.activitySocket.send(
      JSON.stringify({ kind: MessageToClientKind.FanControlActivity, data }),
    );
  } catch (err) {
    console.error("Failed to send activity:", err);
    state.activitySocket?.close();
    state.activitySocket = undefined;
  }
}

export function fanControl() {
  initFanControl();
  resetFanSpeed();

  // On Linux, it happened once that restarting the fan control
  // was necessary. But it's so rare it can't be tested what
  // might cause it.
  // So - enforcing every ~5 minutes that our fixed fan settings
  // are used should prevent that.
  const reinitInterval = setInterval(initFanControl, 1000 * 60 * 5);

  // Find highest entry that isn't larger than provided temp,
  // assuming that fan table entries in profiles are ascending.
  function findHighestMatch(temperature: number, table: FanTable) {
    let highestMatch = table[0];

    for (const entry of table) {
      if (entry[0] <= temperature) {
        highestMatch = entry;
      } else {
        break;
      }
    }

    return highestMatch;
  }

  function getGradientTarget(
    lastAppliedPercentage: number,
    targetPercentage: number,
  ) {
    let gradientTarget = targetPercentage;

    if (targetPercentage > lastAppliedPercentage) {
      gradientTarget =
        lastAppliedPercentage +
        Math.round((targetPercentage - lastAppliedPercentage) / 2);
    } else if (targetPercentage < lastAppliedPercentage) {
      gradientTarget =
        lastAppliedPercentage -
        Math.round((lastAppliedPercentage - targetPercentage) / 2);
    }

    return Math.abs(targetPercentage - gradientTarget) < 5
      ? targetPercentage
      : gradientTarget;
  }

  let appliedPercentage = -1;
  let currRampDownCycle = 1;
  let currRampUpCycle = 1;
  let prevCPUFanTable = state.cpuFanTable;
  let prevGPUFanTable = state.gpuFanTable;
  const autoFanInterval = setInterval(async () => {
    // Interrupt if switching to fixed fan speed
    if (state.doFixedSpeed) {
      clearInterval(autoFanInterval);
      clearInterval(reinitInterval);
      setFixedFan(state.fixedPercentage);
      return;
    }

    // Collect average temperature throughout CYCLE_DURATION
    const { avgCPUTemp, avgGPUTemp } = await new Promise<{
      avgCPUTemp: number;
      avgGPUTemp: number;
    }>((resolve) => {
      const CPUTemps: number[] = [];
      const GPUTemps: number[] = [];
      const pushTemps = async () => {
        const currCPUTemp = await getCallInt("0xe1", "getCpuTemp");
        const currGPUTemp1 = await getCallInt("0xe2", "getGpuTemp1");
        const currGPUTemp2 = await getCallInt("0xe3", "getGpuTemp2");
        const currGPUTemp = Math.max(currGPUTemp1, currGPUTemp2);
        // console.log(
        //   `CPU and GPU1/GPU2 temperatures: ${currCPUTemp} ${currGPUTemp1}/${currGPUTemp2}`,
        // );

        CPUTemps.push(currCPUTemp);
        GPUTemps.push(currGPUTemp);

        if (
          CPUTemps.length ===
          Math.round((CYCLE_DURATION - TEMP_POLL_INTERVAL) / TEMP_POLL_INTERVAL)
        ) {
          resolve({
            avgCPUTemp:
              CPUTemps.reduce((sum, temp) => sum + temp) / CPUTemps.length,
            avgGPUTemp:
              GPUTemps.reduce((sum, temp) => sum + temp) / GPUTemps.length,
          });
        } else {
          setTimeout(pushTemps, TEMP_POLL_INTERVAL);
        }
      };
      pushTemps();
    });

    const highestMatchCPU = findHighestMatch(avgCPUTemp, state.cpuFanTable);
    const highestMatchGPU = findHighestMatch(avgGPUTemp, state.gpuFanTable);

    // Target speed is whichever one of the two is higher because
    // of the mostly shared heat pipes.
    const target = Math.max(highestMatchCPU[1], highestMatchGPU[1]);
    let gradientTarget;

    if (
      prevCPUFanTable !== state.cpuFanTable ||
      prevGPUFanTable !== state.gpuFanTable
    ) {
      // When tables change, do nothing in this cycle but reset fans to the
      // lowest percentage currently in state.
      appliedPercentage = resetFanSpeed();
      prevCPUFanTable = state.cpuFanTable;
      prevGPUFanTable = state.gpuFanTable;
      currRampDownCycle = 1;
      currRampUpCycle = 1;
    } else if (appliedPercentage < target) {
      if (currRampUpCycle === WAIT_RAMP_UP_CYCLES) {
        gradientTarget = getGradientTarget(
          appliedPercentage === -1
            ? state.cpuFanTable[0][1]
            : appliedPercentage,
          target,
        );
        // console.log(`Ramping up to ${fanPercentToSpeed(gradientTarget)}`);
        setFixedFan(gradientTarget);

        currRampDownCycle = 1;
        currRampUpCycle = 1;
        appliedPercentage = gradientTarget;
      } else {
        currRampUpCycle++;
      }
    } else if (target < appliedPercentage) {
      // Make fan behavior less erratic by waiting a few cycles until we
      // ramp down.
      if (currRampDownCycle === WAIT_RAMP_DOWN_CYCLES) {
        gradientTarget = getGradientTarget(appliedPercentage, target);
        // console.log(`Ramping down to ${fanPercentToSpeed(gradientTarget)}`);
        setFixedFan(gradientTarget);

        currRampDownCycle = 1;
        currRampUpCycle = 1;
        appliedPercentage = gradientTarget;
      } else {
        currRampDownCycle++;
      }
    } else {
      // Need to reset if e.g. ramp down phase is
      // interrupted by CPU getting hot again or getting cold again.
      currRampDownCycle = 1;
      currRampUpCycle = 1;
    }

    sendActivity({
      appliedSpeed: appliedPercentage === -1 ? null : appliedPercentage,
      avgCPUTemp,
      avgGPUTemp,
      target,
    });
  }, CYCLE_DURATION);
}
