import { useEffect, useState } from "react";
import packageJson from "../../../package.json";

const GITHUB_RAW_URL =
  "https://raw.githubusercontent.com/s-h-a-d-o-w/alfc/master/package.json";
const CHECK_INTERVAL = 1000 * 60 * 60 * 12; // 12 hours

export function useVersionCheck() {
  const [newVersionAvailable, setNewVersionAvailable] = useState(false);

  useEffect(() => {
    const checkVersion = async () => {
      try {
        const response = await fetch(GITHUB_RAW_URL);
        const data = (await response.json()) as unknown;

        if (
          typeof data === "object" &&
          data !== null &&
          "version" in data &&
          data.version !== packageJson.version
        ) {
          setNewVersionAvailable(true);
        }
      } catch (error) {
        console.error("Failed to check for updates:", error);
      }
    };

    checkVersion();
    const interval = setInterval(checkVersion, CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  return newVersionAvailable;
}
