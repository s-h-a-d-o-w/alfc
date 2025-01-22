import esbuild, { Plugin } from "esbuild";
import { getAbi } from "node-abi";
import fs from "fs/promises";
import path from "path";
import fg from "fast-glob";

interface PrebuildifyOptions {
  // CSV list of prebuildify targets. Combination of os.platform() and os.arch(), e.g. `win32-x64`.
  // By default, all will be copied.
  prebuildifyTargets?: string;

  // Ideally exactly the node version you're distributing with. (If only e.g. "node22" is soecified, it will be assumed that the prebuilds have to support 22.0.0!)
  // By default, this uses the target set in esbuild options. If neither exists, everything will be copies.
  target?: string;
}

const prebuildifyPlugin = ({
  prebuildifyTargets,
  target,
}: PrebuildifyOptions = {}): Plugin => ({
  name: "prebuildify",
  setup(build) {
    build.onEnd(async () => {
      const options = build.initialOptions;
      const outdir =
        options.outdir || (options.outfile && path.dirname(options.outfile));

      if (!outdir) {
        throw new Error(
          "Either `outfile` or `outdir` must be specified when using this plugin.",
        );
      }

      const outPrebuilds = path.join(outdir, "prebuilds");
      await fs.mkdir(outPrebuilds, { recursive: true });

      const prebuilds = await fg(["node_modules/**/prebuilds/**/*.node"]);

      const targets =
        typeof options.target === "string"
          ? [options.target]
          : options.target || target?.split(",");
      const targetAbis =
        targets &&
        new Set(
          targets
            .filter((target) => target.startsWith("node"))
            .map((target) => target.replace("node", ""))
            .map((target) => (target.includes(".") ? target : target + ".0.0"))
            .map((target) => getAbi(target, "node")),
        );

      const parsedPlatforms = prebuildifyTargets?.split(",");
      for (const prebuild of prebuilds) {
        const filename = path.basename(prebuild);
        // Seems like unlike glob, fast-glob always uses / instead of a OS specific path separator.
        const platform = path.dirname(prebuild).split("/").pop();

        if (
          platform &&
          parsedPlatforms &&
          !parsedPlatforms?.includes(platform)
        ) {
          continue;
        }

        if (targetAbis) {
          const abi = filename.match(/abi([0-9]+)./)?.[1];
          if (abi && !targetAbis.has(abi)) {
            continue;
          }
        }

        const outPath = path.join(outPrebuilds, platform!);
        await fs.mkdir(outPath, { recursive: true });
        await fs.copyFile(prebuild, path.join(outPath, filename));
      }
    });
  },
});

await esbuild.build({
  entryPoints: ["index.ts"],
  bundle: true,
  platform: "node",
  target: "node22.11.0",
  format: "cjs",
  outfile: "dist/index.js",
  packages: "bundle",
  external: ["./fancontrol"],
  plugins: [
    prebuildifyPlugin({
      prebuildifyTargets: "win32-x64",
    }),
  ],
});
