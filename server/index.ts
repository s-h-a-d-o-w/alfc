import express from "express";
import isElevated from "is-elevated";
import os from "os";
import path from "path";
import { initNativeServices } from "./native";
import { isDev } from "./utils/consts";
import { startWebSocketServer, WEBSOCKET_PORT } from "./websocket";

(async () => {
  if (!(await isElevated())) {
    console.log("======================= NOTE ==========================");
    console.log("This needs to be run with elevated privileges.");
    console.log("=======================================================");
    process.exit(1);
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
