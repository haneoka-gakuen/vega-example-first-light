# First Light

可直接播放和编辑的 Altair × Vega 示例项目。

## 启动

```sh
pnpm bootstrap
pnpm install
pnpm dev
```

项目文件位于 `public/game`，包含场景、背景、立绘和音频。场景列表在
`public/game/manifest.json` 中维护。

## 编辑

```sh
pnpm dev:studio
```

在 Altair 中打开 `public/`，即可编辑场景、管理素材、查看流程图和实时
预览。浏览器无法直接写入文件夹时，可使用 Export 导出修改后的项目。
