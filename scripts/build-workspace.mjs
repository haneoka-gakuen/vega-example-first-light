import { spawnSync } from "node:child_process";

const pnpm = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const builds = [
  ["@haneoka/vega", "build"],
  ["@haneoka/vega-catalog-official", "build"],
  ["@haneoka/vega-renderer-pixi", "build"],
  ["@haneoka/vega-renderer-three", "build"],
  ["@haneoka/vega-plugin-richtext", "build"],
  ["@haneoka/vega-plugin-richtext-bbcode", "build"],
  ["@haneoka/vega-plugin-richtext-html", "build"],
  ["@haneoka/vega-plugin-richtext-latex", "build"],
  ["@haneoka/vega-plugin-richtext-markdown", "build"],
  ["@haneoka/vega-plugin-richtext-typst", "build"],
  ["@haneoka/vega-plugin-cubism", "build"],
  ["@haneoka/vega-plugin-spine", "build"],
  ["@haneoka/vega-plugin-ending", "build"],
  ["@haneoka/vega-theme-haneoka", "build"],
  ["@haneoka/vega-ui-portable", "build"],
  ["@haneoka/vega-shell-default", "build"],
  ["@haneoka/vega-plugin-webgal", "build"],
  ["@haneoka/vega-preset-full", "build"],
  ["@haneoka/altair", "build:core"],
  ["@haneoka/altair-preview-client", "build"],
  ["@haneoka/altair-plugin-adv", "build"],
  ["@haneoka/altair-plugin-flow", "build"],
  ["@haneoka/altair-plugin-history", "build"],
  ["@haneoka/altair-plugin-drafts", "build"],
  ["@haneoka/altair-plugin-marketplace", "build"],
  ["@haneoka/altair-plugin-prose", "build"],
  ["@haneoka/altair-plugin-vega-preview", "build"],
  ["@haneoka/altair-plugin-workspace-browser", "build"],
  ["@haneoka/altair-plugin-webgal", "build"],
  ["@haneoka/altair-preset-full", "build"],
];

for (const [workspace, script] of builds) {
  const result = spawnSync(pnpm, ["--filter", workspace, "run", script], {
    stdio: "inherit",
  });
  if (result.status !== 0) {
    throw new Error(`Failed to build ${workspace}`);
  }
}
