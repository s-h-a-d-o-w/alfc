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

function promiseWithTimeout<T>(promise: Promise<T>, timeout = 1000 * 5) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), timeout),
    ),
  ]);
}

// When these services are experiencing problems, it might lead to freezing that prevents logs from being written, so we give winston an opportunity to do that.
async function logWithFlush(message: string) {
  console.log(message);
  await new Promise((resolve) => setTimeout(resolve));
}

async function initNativeServices() {
  if (!isLinux) {
    await logWithFlush(
      "Initializing WMI... (If stuck here, there might be a temporary problem with WMI that requires a reboot.)",
    );
    await promiseWithTimeout(wmiInit());
    await logWithFlush("Initializing CPU tuning...");
    await promiseWithTimeout(tuneInit());
  }

  console.log("Starting fan control monitoring...");
  fanControl();

  try {
    console.log("Trying to set initial CPU tuning...");
    await tune();
    console.log("Success.");
    state.isCpuTuningAvailable = true;
  } catch (_) {
    console.log("!! CPU tuning is not available !!");
    state.isCpuTuningAvailable = false;
  }

  console.log("Setting GPU boost...");
  setCall("129", "SetAIBoostStatus", { Data: state.gpuBoost ? 1 : 0 });

  console.log("Fan control is up and running, current config was applied.");
}

export { getCall, initNativeServices, setCall, tune };
