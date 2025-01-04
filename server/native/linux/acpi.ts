import { execSync } from "child_process";
import { Args } from "../../../common/types";

// Precondition: There are no uint16 arguments.
function argstoHexString(args?: Args) {
  if (!args) {
    return "0";
  }

  // TODO: Test whether this order inversion works with GetFanIndexValue!
  return "0x" + Buffer.from(Object.values(args).reverse()).toString("hex");
}

export function wmiInit() {
  return Promise.resolve();
}

// Read calls also always expect 3 arguments.
// IF something really needs to be specified, it's packed into the 3rd argument, like with write.
// Otherwise, it's simply not used.
// @return Multiple values are returned in a single number, little endian!
export function getCall(methodId: string, _: string, args?: Args) {
  // TODO: Convert to a number instead of returning a hex string. For Windows as well, obviously
  return Promise.resolve(
    execSync(
      `echo '\\_SB.PCI0.AMW0.WMBC 0 ${methodId} ${argstoHexString(
        args,
      )}' | tee /proc/acpi/call > /dev/null && cat /proc/acpi/call`,
      { encoding: "utf8" },
    ).replace("\0", ""),
  );
}

export function setCall(methodId: string, _: string, args: Args) {
  execSync(
    `echo '\\_SB.PCI0.AMW0.WMBD 0 ${methodId} ${argstoHexString(
      args,
    )}' | tee /proc/acpi/call`,
  );

  return Promise.resolve();
}
