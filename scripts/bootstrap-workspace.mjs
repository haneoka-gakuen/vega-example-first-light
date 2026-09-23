import { access, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const organization = "haneoka-gakuen";
const repositories = Object.freeze([
  "altair",
  "altair-plugin-adv",
  "altair-plugin-drafts",
  "altair-plugin-flow",
  "altair-plugin-history",
  "altair-plugin-marketplace",
  "altair-plugin-models",
  "altair-plugin-prose",
  "altair-plugin-vega-preview",
  "altair-plugin-webgal",
  "altair-plugin-workspace-browser",
  "altair-preset-full",
  "vega",
  "vega-marketplace",
  "vega-plugin-cubism",
  "vega-plugin-composite",
  "vega-plugin-ending",
  "vega-plugin-richtext",
  "vega-plugin-richtext-bbcode",
  "vega-plugin-richtext-html",
  "vega-plugin-richtext-latex",
  "vega-plugin-richtext-markdown",
  "vega-plugin-richtext-typst",
  "vega-plugin-spine",
  "vega-plugin-webgal",
  "vega-preset-full",
  "vega-renderer-pixi",
  "vega-renderer-three",
  "vega-shell-default",
  "vega-theme-haneoka",
  "vega-ui-portable",
]);

const args = process.argv.slice(2);
if (args.some((arg) => arg !== "--check")) {
  throw new TypeError(`Unknown bootstrap option: ${args.join(" ")}`);
}

const checkOnly = args.includes("--check");
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const workspace = resolve(root, ".dependencies");
const missing = [];

await mkdir(workspace, { recursive: true });

for (const repository of repositories) {
  const destination = resolve(workspace, repository);
  try {
    await access(resolve(destination, "package.json"));
    continue;
  } catch {
    missing.push(repository);
  }

  if (checkOnly) continue;
  const result = spawnSync(
    "git",
    ["clone", "--depth=1", `https://github.com/${organization}/${repository}.git`, destination],
    { stdio: "inherit" },
  );
  if (result.status !== 0) {
    throw new Error(`Unable to clone ${repository}`);
  }
}

if (checkOnly && missing.length) {
  console.error(`Missing dependency repositories: ${missing.join(", ")}`);
  process.exitCode = 1;
} else {
  console.log(
    checkOnly ? `Workspace ready: ${repositories.length}/${repositories.length}` : "Workspace repositories are ready.",
  );
}
