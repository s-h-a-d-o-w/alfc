import { execSync } from "child_process";

execSync(
  process.platform === "win32"
    ? "ncc build index.ts --minify"
    : "ncc build index.ts --minify --external edge-js",
  {
    stdio: "inherit",
  },
);
