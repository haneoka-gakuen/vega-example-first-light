import {
  type CSSProperties,
  useEffect,
  useMemo,
  useState,
} from "react";
import { VegaPlayer } from "@haneoka/vega-react";
import type { FirstLightCompilation } from "./compile-project";
import { createFirstLightRuntimePreset } from "./runtime-preset";

const DEFAULT_VEGA_PLUGINS = createFirstLightRuntimePreset();
const VEGA_ENGINE_OPTIONS = Object.freeze({
  officialPlugins: DEFAULT_VEGA_PLUGINS,
});
const VEGA_PLAYER_OPTIONS = Object.freeze({
  renderBackend: "pixi",
});
const VEGA_PLAYER_STYLE = Object.freeze({
  "--vega-stage-background": `center / cover no-repeat url("${import.meta.env.BASE_URL}game/background/astronomy-room-dawn.png")`,
  "--vega-title-background": `url("${import.meta.env.BASE_URL}game/background/astronomy-room-dawn.png")`,
}) as CSSProperties;

type LoadState =
  | { readonly phase: "loading" }
  | { readonly phase: "error"; readonly message: string }
  | { readonly phase: "ready"; readonly value: FirstLightCompilation };

const saveJson = (name: string, value: unknown): void => {
  const url = URL.createObjectURL(
    new Blob([`${JSON.stringify(value, null, 2)}\n`], {
      type: "application/json",
    }),
  );
  const anchor = document.createElement("a");
  anchor.download = name;
  anchor.href = url;
  anchor.hidden = true;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
};

export function App() {
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState<LoadState>({ phase: "loading" });
  useEffect(() => {
    const controller = new AbortController();
    setState({ phase: "loading" });
    void import("./load-project").then(
      ({ loadFirstLightProject }) =>
        loadFirstLightProject(controller.signal),
    ).then(
      (value) => {
        if (!controller.signal.aborted) {
          setState({ phase: "ready", value });
        }
      },
      (error: unknown) => {
        if (!controller.signal.aborted) {
          setState({
            phase: "error",
            message: error instanceof Error ? error.message : String(error),
          });
        }
      },
    );
    return () => controller.abort();
  }, [revision]);

  const compilation = state.phase === "ready" ? state.value : undefined;
  const shell = useMemo(
    () =>
      compilation
        ? {
            projectId: compilation.project.id,
            title:
              typeof compilation.project.title === "string"
                ? compilation.project.title
                : (compilation.project.title["zh-CN"] ??
                  compilation.project.id),
          }
        : undefined,
    [compilation],
  );
  return (
    <main className="page-shell">
      <header className="site-header">
        <a className="wordmark" href="#">
          <span aria-hidden="true" className="mark">
            <i />
            <i />
            <i />
          </span>
          <span>
            <strong>First Light</strong>
            <small>Altair × Vega</small>
          </span>
        </a>
        <nav aria-label="Project actions">
          <button
            disabled={!compilation}
            onClick={() =>
              compilation &&
              saveJson("first-light.vega.json", compilation.project)
            }
          >
            导出
          </button>
          <button onClick={() => setRevision((value) => value + 1)}>
            重新开始
          </button>
        </nav>
      </header>

      <section aria-label="First Light player" className="player-frame">
        {state.phase === "ready" && shell ? (
          <VegaPlayer
            appearance="system"
            autoStart={false}
            className="vega-player"
            engineOptions={VEGA_ENGINE_OPTIONS}
            key={revision}
            playerOptions={VEGA_PLAYER_OPTIONS}
            project={state.value.project}
            shell={shell}
            style={VEGA_PLAYER_STYLE}
            theme="portable"
          />
        ) : state.phase === "error" ? (
          <div className="load-state error" role="alert">
            <strong>项目加载失败</strong>
            <span>{state.message}</span>
          </div>
        ) : (
          <div className="load-state" role="status">
            <span className="loader" />
            <strong>正在准备 First Light</strong>
            <span>背景、立绘和剧情马上就好。</span>
          </div>
        )}
      </section>
    </main>
  );
}
