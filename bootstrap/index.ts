import service from "@neuralegion/os-service";
import { exec } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import sudo from "@vscode/sudo-prompt";

const isWindows = os.platform() === "win32";
const serviceName = "atest1";

const sudoOptions = {
  name: "Aorus Laptop Fan Control",
};

const sudoOutputHandler: Parameters<(typeof sudo)["exec"]>[2] = (
  error,
  stdout,
) => {
  if (error) {
    if (error.message.includes("already exists")) {
      console.log("Service already exists.");
    } else if (error.message.includes("grant permission")) {
      console.log("Please re-run and give permission to run.");
    } else if (error.message.includes("does not exist")) {
      console.log("Service doesn't exist.");
    } else {
      console.error(error);
    }
    return;
  }

  console.log(stdout);
};

switch (process.argv[2]) {
  case "install":
    console.log("Installing...");
    sudo.exec(
      `node ${
        isWindows ? `"${process.argv[1]}"` : process.argv[1]
      } install-as-sudo`,
      sudoOptions,
      sudoOutputHandler,
    );
    break;
  case "install-as-sudo":
    console.log("Registering the service...");
    service.add(
      serviceName,
      {
        args: [process.argv[1], "run"],
        dependencies: isWindows ? ["Winmgmt"] : ["acpi_call"],
      },
      (error) => {
        if (error) {
          throw error;
        }

        console.log("Starting service...");
        const serviceStartCommand = isWindows
          ? "net start " + serviceName
          : `service ${serviceName} start`;
        exec(serviceStartCommand, async (error) => {
          if (error) {
            throw error;
          }

          if (isWindows) {
            await new Promise((resolve) => setTimeout(resolve, 1000 * 25));
          }

          console.log("Done.");
          import("open").then(({ default: open }) => {
            open("http://localhost:5522");
          });
        });
      },
    );
    break;
  case "uninstall":
    console.log("Uninstalling...");
    sudo.exec(
      `node ${
        isWindows ? `"${process.argv[1]}"` : process.argv[1]
      } uninstall-as-sudo`,
      sudoOptions,
      sudoOutputHandler,
    );
    break;
  case "uninstall-as-sudo": {
    console.log("Stopping service...");
    const serviceStopCommand = isWindows
      ? "net stop " + serviceName
      : `service ${serviceName} stop`;
    exec(serviceStopCommand, () => {
      // exec would possibly error if the service is already stopped.
      // But we don't care about that and will simply attempt to remove the serivce.

      console.log("Removing service...");
      service.remove(serviceName, (error) => {
        if (error) {
          throw error;
        }

        console.log("Done.");
      });
    });
    break;
  }
  case "run":
    // Stop the service when the OS requests it.
    service.run(function () {
      service.stop(0);
    });

    // Need to redirect all output to a log file on Windows.
    // On Linux, it'll go to the systemd logs.
    if (isWindows) {
      const access = fs.createWriteStream(path.join(__dirname, "service.log"));
      // @ts-expect-error Undefined/null type mismatch: Type 'Error | null | undefined' is not assignable to type 'Error | undefined'.
      process.stdout.write = process.stderr.write = access.write.bind(access);
      process.on("uncaughtException", function (err) {
        console.error(err && err.stack ? err.stack : err);
      });
    }

    process.chdir(__dirname);
    process.env.NODE_ENV = "production";

    new Promise((resolve) => {
      setTimeout(resolve, Number.MAX_SAFE_INTEGER);
    });
    // require("./fancontrol");
    break;
  default:
    console.error("If you can read this, either you or I did something wrong.");
    process.exit(1);
}
