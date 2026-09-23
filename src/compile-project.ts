import { AltairPluginHost, type StoryProject } from "@haneoka/altair";
import { altairAdvPlugin, parseStoryProjectJson } from "@haneoka/altair-plugin-adv";
import { altairDraftsPlugin } from "@haneoka/altair-plugin-drafts";
import { ALTAIR_STORY_FLOW_PROVIDER_ID, altairFlowPlugin, type StoryFlowGraph } from "@haneoka/altair-plugin-flow";
import { altairHistoryPlugin } from "@haneoka/altair-plugin-history";
import { altairMarketplacePlugin } from "@haneoka/altair-plugin-marketplace";
import { ALTAIR_DETERMINISTIC_PROSE_PROVIDER_ID, altairProsePlugin } from "@haneoka/altair-plugin-prose";
import { ALTAIR_VEGA_PREVIEW_SERVICE, altairVegaPreviewPlugin } from "@haneoka/altair-plugin-vega-preview";
import { altairWebGalPlugin } from "@haneoka/altair-plugin-webgal";
import { altairWorkspaceBrowserPlugin } from "@haneoka/altair-plugin-workspace-browser";
import { ALTAIR_FULL_PRESET_PLUGIN_IDS, installAltairFullPreset } from "@haneoka/altair-preset-full";
import type { VegaProject } from "@haneoka/vega-protocol";

export interface FirstLightSource {
  readonly path: string;
  readonly text: string;
}

export interface FirstLightCompilationInput {
  readonly projectSnapshot: string;
  readonly sources: readonly FirstLightSource[];
}

export interface FirstLightReport {
  readonly authoringPluginIds: readonly string[];
  readonly compileErrors: number;
  readonly compileWarnings: number;
  readonly flowEdges: number;
  readonly flowNodes: number;
  readonly importErrors: number;
  readonly importedScenes: number;
  readonly proseCommands: number;
  readonly roundTripEquivalent: boolean;
  readonly roundTripErrors: number;
  readonly roundTripFiles: Readonly<Record<string, string>>;
  readonly validationErrors: number;
}

export interface FirstLightCompilation {
  readonly authoringProject: StoryProject;
  readonly diagnostics: readonly {
    readonly severity: string;
    readonly code: string;
    readonly message: string;
  }[];
  readonly flow: StoryFlowGraph;
  readonly project: VegaProject;
  readonly report: FirstLightReport;
}

const modules = Object.freeze({
  "haneoka.altair-history": altairHistoryPlugin,
  "haneoka.altair-drafts": altairDraftsPlugin,
  "haneoka.altair-adv": altairAdvPlugin,
  "haneoka.altair-flow": altairFlowPlugin,
  "haneoka.altair-prose": altairProsePlugin,
  "haneoka.altair-webgal": altairWebGalPlugin,
  "haneoka.altair-marketplace": altairMarketplacePlugin,
  "haneoka.altair-vega-preview": altairVegaPreviewPlugin,
  "haneoka.altair-workspace-browser": altairWorkspaceBrowserPlugin,
});

const errors = (diagnostics: readonly { readonly severity: string }[]): number =>
  diagnostics.filter(({ severity }) => severity === "error").length;

const warnings = (diagnostics: readonly { readonly severity: string }[]): number =>
  diagnostics.filter(({ severity }) => severity === "warning").length;

const canonicalJson = (value: unknown): string =>
  JSON.stringify(value, (_, candidate: unknown) => {
    if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
      return candidate;
    }
    return Object.fromEntries(
      Object.entries(candidate as Record<string, unknown>).sort(([left], [right]) => left.localeCompare(right)),
    );
  });

export const compileFirstLightProject = async ({
  projectSnapshot,
  sources,
}: FirstLightCompilationInput): Promise<FirstLightCompilation> => {
  const host = new AltairPluginHost();
  let installation: Awaited<ReturnType<typeof installAltairFullPreset>> | undefined;
  try {
    installation = await installAltairFullPreset(host, modules);
    const snapshot = parseStoryProjectJson(projectSnapshot);
    const imported = await host.importFormat(
      {
        entryPath: "game/scene/start.txt",
        files: sources.map(({ path, text }) => ({
          path,
          bytes: new TextEncoder().encode(text),
          mediaType: "text/x-webgal",
        })),
        options: {
          assetRoot: "game",
          title: "First Light",
        },
      },
      "webgal",
    );
    const authoringProject: StoryProject = {
      ...imported.project,
      meta: {
        ...imported.project.meta,
        description: "Executable Altair authoring and Vega playback tutorial",
        locale: "zh-CN",
        title: "First Light",
      },
      plugins: snapshot.plugins ?? [],
    };
    const preview = host.service(ALTAIR_VEGA_PREVIEW_SERVICE);
    if (!preview) {
      throw new ReferenceError("The default Vega preview plugin is unavailable");
    }

    const [validation, flow, prose, compiled, exported] = await Promise.all([
      host.evaluateDiagnostics(authoringProject),
      host.buildFlow<StoryFlowGraph>(ALTAIR_STORY_FLOW_PROVIDER_ID, authoringProject),
      host.runAi(ALTAIR_DETERMINISTIC_PROSE_PROVIDER_ID, {
        locale: "zh-CN",
        source: "Vega：播放同一份故事。\n\nAltair 把编辑结果交给 Vega。",
        title: "First Light prose check",
      }),
      preview.compileProject({ project: authoringProject }),
      host.exportFormat("webgal", { project: imported.project }),
    ]);
    const diagnostics = Object.freeze([...imported.diagnostics, ...validation, ...compiled.diagnostics]);
    const roundTripFiles = Object.freeze(
      Object.fromEntries(exported.artifacts.map(({ path, bytes }) => [path, new TextDecoder().decode(bytes)])),
    );
    const roundTripped = await host.importFormat(
      {
        entryPath: "game/scene/start.txt",
        files: exported.artifacts,
      },
      "webgal",
    );
    return Object.freeze({
      authoringProject,
      diagnostics: Object.freeze([...diagnostics, ...roundTripped.diagnostics]),
      flow,
      project: compiled.project,
      report: Object.freeze({
        authoringPluginIds: Object.freeze([...installation.pluginIds]),
        compileErrors: errors(compiled.diagnostics),
        compileWarnings: warnings(compiled.diagnostics),
        flowEdges: flow.edges.length,
        flowNodes: flow.nodes.length,
        importErrors: errors(imported.diagnostics),
        importedScenes: authoringProject.scenes.length,
        proseCommands: prose.project.scenes.reduce((count, scene) => count + scene.commands.length, 0),
        roundTripEquivalent: canonicalJson(roundTripped.project) === canonicalJson(imported.project),
        roundTripErrors: errors(roundTripped.diagnostics),
        roundTripFiles,
        validationErrors: errors(validation),
      }),
    });
  } finally {
    await installation?.dispose();
    await host.dispose();
  }
};

export const DEFAULT_ALTAIR_PLUGIN_IDS = ALTAIR_FULL_PRESET_PLUGIN_IDS;
