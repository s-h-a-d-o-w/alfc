import os from "os";
// Reference elision makes this work on Linux too. Awesome stuff:
// http://ideasintosoftware.com/typescript-conditional-imports/
import * as ACPI from "./windows/acpi.js";
import * as CPUOC from "./windows/cpuoc.js";
import { fanControl } from "../fan-control/index.js";
import { state } from "../state/index.js";

const isLinux = os.platform() === "linux";

const { getCall, wmiInit, setCall }: typeof ACPI = isLinux
  ? require("./linux/acpi")
  : require("./windows/acpi");
const { tuneInit, tune: tuneNative }: typeof CPUOC = isLinux
  ? require("./linux/cpuoc")
  : require("./windows/cpuoc");

function tune() {
  return tuneNative(state.pl1, state.pl2);
}

async function initNativeServices() {
  if (!isLinux) {
    await wmiInit();
    await tuneInit();
  }

  fanControl();
  try {
    await tune();
    state.isCpuTuningAvailable = true;
  } catch (_) {
    console.log("!! CPU tuning is not available !!");
    state.isCpuTuningAvailable = false;
  }
  setCall("129", "SetAIBoostStatus", { Data: state.gpuBoost ? 1 : 0 });

  console.log("Fan control is up and running, current config was applied.");
}

export { getCall, initNativeServices, setCall, tune };
