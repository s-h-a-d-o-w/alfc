import service from "@neuralegion/os-service";
import { exec } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import sudo from "sudo-prompt";

const isWindows = os.platform() === "win32";

const sudoOptions = {
  name: "Aorus Laptop Fan Control",
};

const sudoOutputHandler: Parameters<(typeof sudo)["exec"]>[2] = (
  error,
  stdout,
) => {
  if (error) {
    console.error(error);
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
    service.add(
      "alfc",
      {
        args: ["run"],
        dependencies: isWindows ? ["Winmgmt"] : ["acpi_call"],
      },
      (error) => {
        if (error) {
          throw error;
        }

        const serviceStartCommand = isWindows
          ? "net start alfc"
          : "service alfc start";
        exec(serviceStartCommand, async (error) => {
          if (error) {
            throw error;
          }

          if (isWindows) {
            await new Promise((resolve) => setTimeout(resolve, 1000 * 25));
          }

          console.log("Done.");
          require("react-dev-utils/openBrowser")("http://localhost:5522");
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
    const serviceStopCommand = isWindows
      ? "net stop alfc"
      : "service alfc stop";
    exec(serviceStopCommand, () => {
      // exec would possibly error if the service is already stopped.
      // But we don't care about that and will simply attempt to remove the serivce.

      service.remove("alfc", (error) => {
        if (error) {
          throw error;
        }

        console.log("Done.");
      });
    });
    break;
  }
  case "run":
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
    require("./fancontrol");
    break;
  default:
    console.error("If you can read this, either you or I did something wrong.");
    process.exit(1);
}
