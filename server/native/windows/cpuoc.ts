import { promisify } from "util";
import { createEdgeFunc } from "./edge";

type DotNetArg = {
  pl1: number;
  pl2: number;
};

const initEdgeFunc = promisify(createEdgeFunc("CPUOC.dll", "Init"));
const tuneEdgeFunc = promisify(
  createEdgeFunc<DotNetArg, number[]>("CPUOC.dll", "Tune"),
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

if (require.main === module) {
  (async () => {
    const path = await import("path");
    const { pl1, pl2 } = await import(
      path.join(__dirname, "../../../alfc.config.json")
    );
    console.log("pl1 " + pl1);
    console.log("pl2 " + pl2);

    await tuneInit();
    await tuneEdgeFunc({
      pl1,
      pl2,
    });
  })();
}
