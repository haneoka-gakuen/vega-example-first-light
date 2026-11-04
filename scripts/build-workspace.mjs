import { spawnSync } from "node:child_process";

const pnpm = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const build = `
const { readFileSync } = require("node:fs");
const { execFileSync } = require("node:child_process");
const manifest = JSON.parse(readFileSync("package.json", "utf8"));
const script = ["@haneoka/vega", "@haneoka/altair"].includes(manifest.name) ? "build:core" : "build";
if (manifest.scripts?.[script]) execFileSync(process.platform === "win32" ? "pnpm.cmd" : "pnpm", ["run", script], { stdio: "inherit", shell: process.platform === "win32" });
`;
const result = spawnSync(
  pnpm,
  [
    "--recursive",
    "--workspace-concurrency=2",
    "--filter",
    "@haneoka/altair-app^...",
    "--filter",
    "@haneoka/vega-example-first-light^...",
    "exec",
    "node",
    "-e",
    build,
  ],
  { stdio: "inherit", shell: process.platform === "win32" },
);
if (result.status !== 0) throw new Error("Workspace dependency build failed");
