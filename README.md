# First Light

[English](README.md) · [简体中文](README.zh-CN.md)

First Light is a short visual novel that doubles as a guided tour of the
suite. Two members of an astronomy club greet you at dawn and let you choose
what to see: stage effects, text and typesetting, the player shell, editing in
Altair, or combining plugins. Every chapter can be replayed on its own, and the
whole project is plain files you can open, change and play back immediately.

It is written in WebGAL script, imported by
[Altair](https://github.com/haneoka-gakuen/altair) and played by
[Vega](https://github.com/haneoka-gakuen/vega) — so it also shows a WebGAL
project moving into the suite without being rewritten.

## Run it

```sh
pnpm bootstrap   # clone the suite packages this example builds against
pnpm install
pnpm dev         # play at the address Vite prints
```

`pnpm bootstrap` places the Vega and Altair sources under `.dependencies/`;
`pnpm bootstrap:check` verifies they are at the expected revisions.

## Edit it

```sh
pnpm dev:studio
```

Altair Studio starts. Open the `public/` folder as the project: scenes,
backgrounds, figures and audio appear in the workspace, the flowchart shows
how the chapters connect, and the preview plays what you edit. Where the
browser cannot write to a folder, use **Export** to save the changed project.

## What is inside

| Path | Contents |
| --- | --- |
| `public/game/manifest.json` | The entry scene and the list of scenes. |
| `public/game/scene/start.txt` | The hub: introduction and the chapter choice. |
| `public/game/scene/runtime.txt` | Stage, characters, transitions and effects. |
| `public/game/scene/text.txt`, `plain.txt`, `richtext.txt` | Typesetting: game markup, plain text, and Markdown, HTML, BBCode, LaTeX and Typst lines. |
| `public/game/scene/shell.txt` | Title screen, saves, backlog and settings. |
| `public/game/scene/authoring.txt` | A walkthrough of editing in Altair. |
| `public/game/scene/plugins.txt` | Every runtime plugin that can share one player, together. |
| `public/game/background`, `figure`, `bgm`, `vocal` | Art and sound used by the scenes. |
| `public/altair.project.json` | Altair project settings. |
| `src/` | The small player app: load the project, compile it, play it. |

`richtext.txt` keeps Vega-only details (which renderer each line uses) in
`@haneoka-lossless` comments, so it still opens in WebGAL while round-tripping
perfectly through Altair.

## Scripts

| Script | Does |
| --- | --- |
| `pnpm dev` / `pnpm build` | Play locally / build the player. |
| `pnpm dev:studio` | Run Altair Studio against this project. |
| `pnpm check` | Bootstrap check, workspace build, type check, build and Studio check. |
| `pnpm assets:generate` | Re-create the generated chime, ambience and rich-text scene. |
| `pnpm format` | Format the code. |

## License

MPL-2.0. See [LICENSE](LICENSE).
