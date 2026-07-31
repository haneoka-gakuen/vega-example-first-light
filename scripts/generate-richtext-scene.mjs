import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  importWebGal,
  serializeWebGalText,
} from "@haneoka/altair-plugin-webgal";
import { VEGA_ADV_OPCODE } from "@haneoka/vega-protocol";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const writeScene = async ({
  id,
  name,
  lines,
  configure,
}) => {
  const project = importWebGal(lines.join("\n"), {
    sceneId: id,
    sceneName: name,
  }).project;
  configure(project.scenes[0]?.commands ?? []);
  const encoded = serializeWebGalText(project, {
    lineEnding: "\n",
    losslessMetadata: "scene",
    preserveUnchangedSource: false,
    sceneId: id,
  });
  const output = resolve(root, `public/game/scene/${id}.txt`);
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, encoded, "utf8");
  console.log(`Wrote ${output}`);
};

await writeScene({
  id: "plain",
  name: "Explicit plain text",
  lines: [
    "; Generated lossless sidecar for native location and plain-text fields.",
    "intro:排版实验室 · 纯文本;",
    "纯文本:<ruby=ほし>星</ruby> **Markdown** <b>HTML</b>;",
    "",
  ],
  configure(commands) {
    const location = commands.find(({ source }) => source?.command === "intro");
    const plainTalk = commands.find(
      ({ fields }) => fields.targetName === "纯文本",
    );
    if (!location || !plainTalk) {
      throw new ReferenceError("Unable to build the plain-text tutorial");
    }
    location.command = VEGA_ADV_OPCODE.Location;
    plainTalk.fields.textFormat = "plain";
  },
});

const richFormats = [
  {
    speaker: "Markdown",
    format: "markdown",
    text: "**Markdown** 可以显示 *强调*、`行内代码` 与安全链接。",
  },
  {
    speaker: "HTML",
    format: "html",
    text: "<strong>HTML</strong> 会经过清理；<em>未闭合标签也能继续显示",
  },
  {
    speaker: "BBCode",
    format: "bbcode",
    text: "[b]BBCode[/b] 支持 [i]常见论坛排版[/i]，未闭合的 [u]标签也可恢复。",
  },
  {
    speaker: "LaTeX",
    format: "latex",
    text: String.raw`\int_0^1 x^2\,dx = \frac{1}{3}`,
    displayMode: true,
  },
  {
    speaker: "Typst",
    format: "typst",
    text: String.raw`$ integral_0^1 x^2 dif x = 1/3 $`,
    displayMode: true,
  },
];

await writeScene({
  id: "richtext",
  name: "Rich text formats",
  lines: [
    "; Each line is tagged with its renderer in the lossless scene metadata.",
    "intro:排版实验室 · 插件格式;",
    ...richFormats.map(({ speaker, text }) => `${speaker}:${text};`),
    "",
  ],
  configure(commands) {
    const location = commands.find(({ source }) => source?.command === "intro");
    if (!location) {
      throw new ReferenceError("Unable to build the rich-text tutorial");
    }
    location.command = VEGA_ADV_OPCODE.Location;
    for (const sample of richFormats) {
      const talk = commands.find(
        ({ fields }) => fields.targetName === sample.speaker,
      );
      if (!talk) {
        throw new ReferenceError(`Missing ${sample.format} tutorial line`);
      }
      talk.fields.text = sample.text;
      talk.fields.textFormat = sample.format;
      if (sample.displayMode) talk.fields.textDisplayMode = true;
    }
  },
});
