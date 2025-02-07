import { useEffect, useState } from "react";
import packageJson from "../../../package.json";

const GITHUB_API_URL =
  "https://api.github.com/repos/s-h-a-d-o-w/alfc/releases/latest";
const CHECK_INTERVAL = 1000 * 60 * 60 * 12; // 12 hours

export function useVersionCheck() {
  const [newVersionAvailable, setNewVersionAvailable] = useState(false);

  useEffect(() => {
    const checkVersion = async () => {
      try {
        const response = await fetch(GITHUB_API_URL);
        const data = await response.json();

        if (
          response.ok &&
          data?.tag_name?.replace("v", "") !== packageJson.version
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
