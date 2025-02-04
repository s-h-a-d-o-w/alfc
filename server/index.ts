import express from "express";
import os from "os";
import path from "path";
import { initNativeServices } from "./native/index.js";
import { isDev } from "./utils/consts.js";
import { startWebSocketServer, WEBSOCKET_PORT } from "./websocket/index.js";

// This is necessary because with just logging to the console before exiting, not everything actually ended up in the log file.
const exitWithError = () => {
  try {
    const message =
      "======================= NOTE ==========================\n" +
      "This needs to be run with elevated privileges.\n" +
      "=======================================================\n";

    process.stdout.write(message);

    // Check if we need to drain
    if (process.stdout.writableNeedDrain) {
      process.stdout.once("drain", () => process.exit(1));
    } else {
      process.exit(1);
    }
  } catch (_) {
    // Ensure we exit even if write fails
    process.exit(1);
  }
};

(async () => {
  const { default: isElevated } = await import("is-elevated");
  if (!(await isElevated())) {
    exitWithError();
  }

  // Declaring WMI as a dependency is apparently not enough.
  // So we need to wait for things to settle...
  // TODO: Offer a method through the .NET library that makes it
  // possible to just try and create a WMI instance and returns whether
  // it was able to.
  if (os.platform() === "win32") {
    await new Promise((resolve) => setTimeout(resolve, 1000 * 15));
  }

  await initNativeServices();
  await startWebSocketServer();

  const app = express();
  const port = 5522;

  if (!isDev) {
    app.use(express.static(path.join(__dirname, "./frontend")));
  } else {
    app.get("/", (_, res) => {
      res.send("Nothing to see here.");
    });
  }

  app.listen(port, "localhost", () => {
    console.log(`Server running @ ${port} (Websocket ${WEBSOCKET_PORT})`);
  });
})();
