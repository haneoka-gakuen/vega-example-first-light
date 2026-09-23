import type { VegaPlugin } from "@haneoka/vega/plugin";
import { createVegaFullPreset } from "@haneoka/vega-preset-full";

export const DEFAULT_VEGA_PLUGIN_IDS = Object.freeze([
  "haneoka.renderer-three",
  "haneoka.vega-richtext",
  "haneoka.vega-richtext-bbcode",
  "haneoka.vega-richtext-html",
  "haneoka.vega-richtext-latex",
  "haneoka.vega-richtext-markdown",
  "haneoka.vega-richtext-typst",
  "haneoka.vega-portable-ui",
  "haneoka.vega-shell-default",
  "haneoka.theme",
  "haneoka.vega-ending",
] as const);

export const createFirstLightRuntimePreset = (): readonly VegaPlugin[] => {
  const plugins = createVegaFullPreset({
    ending: {
      heading: "故事终了",
      message: "感谢体验 First Light。",
      replayLabel: "重新开始",
      titleLabel: "返回标题",
    },
    richText: {
      bbcode: true,
      html: true,
      latex: true,
      markdown: true,
      typst: true,
    },
  });
  const pluginIds = plugins.map(({ manifest }) => manifest.id);
  if (
    pluginIds.length !== DEFAULT_VEGA_PLUGIN_IDS.length ||
    pluginIds.some((id, index) => id !== DEFAULT_VEGA_PLUGIN_IDS[index])
  ) {
    throw new Error("First Light runtime preset drifted from Vega defaults");
  }
  return plugins;
};
