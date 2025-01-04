import fs from "fs";
import stringifyCompact from "json-stringify-pretty-compact";
import { cloneDeep } from "lodash";
import path from "path";
import { isDev } from "../utils/consts";
import { State } from "../../common/types";

const CONFIG_FILE = isDev
  ? path.join(__dirname, "../../alfc.config.json")
  : path.join(__dirname, "../alfc.config.json");

export const state: State = JSON.parse(
  fs.readFileSync(CONFIG_FILE, { encoding: "utf8" }),
);

export function persistState() {
  // No persistence in dev so that we don't keep getting changes to the
  // default alfc.config.json.
  if (isDev) {
    return;
  }

  const stateCopy = cloneDeep(state);
  delete stateCopy.activitySocket;
  delete stateCopy.isCpuTuningAvailable;

  try {
    // Why JSON:
    // Bad readability when it comes to 2D int arrays with yml
    fs.writeFile(
      CONFIG_FILE,
      stringifyCompact(stateCopy),
      { encoding: "utf8" },
      (error) => {
        if (error) {
          console.error(error);
        }
      },
    );
  } catch (error) {
    console.error("Error trying to persist state: " + error);
  }
}
