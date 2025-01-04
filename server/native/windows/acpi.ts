import { promisify } from "util";
import { Args } from "../../../common/types";
import { createEdgeFunc } from "./edge";

type DotNetArg = {
  methodName: string;
  args: { [key: string]: number } | null;
};

const initEdgeFunc = promisify(createEdgeFunc("WmiAPI.dll", "InitWmi"));
const wmiGetEdgeFunc = promisify(
  createEdgeFunc<DotNetArg, number[]>("WmiAPI.dll", "WmiGet"),
);
const wmiSetEdgeFunc = promisify(
  createEdgeFunc<DotNetArg, null>("WmiAPI.dll", "WmiSet"),
);

export async function wmiInit() {
  await initEdgeFunc(null);
}

export async function setCall(_: string, methodName: string, args: Args) {
  await wmiSetEdgeFunc({
    methodName,
    args,
  });
}

// NON-PURE
// uint16 values are already little-endian, just need to split them up
function splitWords(numbers: number[]) {
  for (let i = 0; i < numbers.length; i++) {
    const current = numbers[i];
    if (current > 255) {
      numbers[i] = current >> 8;
      numbers.splice(i + 1, 0, current & 0xff);
    }
  }
}

export async function getCall(_: string, methodName: string, args?: Args) {
  // TODO: Convert to a number instead of returning a hex string. For Linux as well, obviously
  const result = (
    await wmiGetEdgeFunc({
      methodName,
      args: args || null,
    })
  ).reverse(); // Little-endian order for multiple return values
  splitWords(result);

  // Leading 0 has to be stripped to make output consistent with Linux
  const hexString = Buffer.from(result).toString("hex");
  return "0x" + (hexString[0] === "0" ? hexString.substr(1) : hexString);
}

if (require.main === module) {
  (async () => {
    await wmiInit();
    console.log("RPM1", await getCall("doesntmatter", "getRpm1"));
  })();
}
