# First Light

[English](README.md) · [简体中文](README.zh-CN.md)

First Light 是一部短篇视觉小说，同时也是整个套件的导览。天文部的两位成员在清晨迎接你，
让你选择想看的内容：舞台效果、文字与排版、播放器外壳、在 Altair 中编辑，或者组合使用
插件。每一章都可以单独重播，整个项目都是普通文件，打开、修改、立刻就能播放。

它用 WebGAL 脚本写成，由 [Altair](https://github.com/haneoka-gakuen/altair) 导入，
由 [Vega](https://github.com/haneoka-gakuen/vega) 播放——同时也演示了 WebGAL 项目无需
改写就能进入这套工具。

## 运行

```sh
pnpm bootstrap   # 拉取本示例依赖的套件源码
pnpm install
pnpm dev         # 在 Vite 输出的地址中游玩
```

`pnpm bootstrap` 会把 Vega 和 Altair 源码放到 `.dependencies/`；`pnpm bootstrap:check`
检查它们是否处于预期版本。

## 编辑

```sh
pnpm dev:studio
```

Altair Studio 启动后，把 `public/` 文件夹作为项目打开：场景、背景、立绘和音频会出现在
工作区，流程图展示各章节如何相连，预览会播放你正在编辑的内容。浏览器无法直接写入文件夹
时，使用 **Export** 保存修改后的项目。

## 项目内容

| 路径 | 内容 |
| --- | --- |
| `public/game/manifest.json` | 入口场景和场景列表。 |
| `public/game/scene/start.txt` | 导览中枢：开场和章节选择。 |
| `public/game/scene/runtime.txt` | 舞台、角色、转场和特效。 |
| `public/game/scene/text.txt`、`plain.txt`、`richtext.txt` | 排版：游戏标记、纯文本，以及 Markdown、HTML、BBCode、LaTeX 和 Typst。 |
| `public/game/scene/shell.txt` | 标题画面、存档、回想和设置。 |
| `public/game/scene/authoring.txt` | 在 Altair 中编辑的演示。 |
| `public/game/scene/plugins.txt` | 能共用一个播放器的全部运行时插件一起登场。 |
| `public/game/background`、`figure`、`bgm`、`vocal` | 各场景使用的美术与音频。 |
| `public/altair.project.json` | Altair 项目设置。 |
| `src/` | 小型播放器：加载项目、编译、播放。 |

`richtext.txt` 把仅 Vega 使用的信息（每行由哪个渲染器显示）保存在 `@haneoka-lossless`
注释中，因此它仍能在 WebGAL 中打开，同时经过 Altair 往返也不会丢失任何内容。

## 脚本

| 脚本 | 作用 |
| --- | --- |
| `pnpm dev` / `pnpm build` | 本地游玩 / 构建播放器。 |
| `pnpm dev:studio` | 针对本项目运行 Altair Studio。 |
| `pnpm check` | 依赖检查、工作区构建、类型检查、构建和 Studio 检查。 |
| `pnpm assets:generate` | 重新生成提示音、环境音和富文本场景。 |
| `pnpm format` | 格式化代码。 |

## 许可证

MPL-2.0。见 [LICENSE](LICENSE)。
