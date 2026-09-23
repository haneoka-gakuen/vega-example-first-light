import { compileFirstLightProject, type FirstLightCompilation, type FirstLightSource } from "./compile-project";

interface FirstLightManifest {
  readonly scenes: readonly string[];
}

const publicUrl = (path: string): string => `${import.meta.env.BASE_URL}${path.replace(/^\/+/u, "")}`;

const responseText = async (path: string, signal: AbortSignal): Promise<string> => {
  const response = await fetch(publicUrl(path), { signal });
  if (!response.ok) {
    throw new Error(`Unable to load ${path}: HTTP ${response.status}`);
  }
  return response.text();
};

export const loadFirstLightProject = async (signal: AbortSignal): Promise<FirstLightCompilation> => {
  const [manifest, projectSnapshot] = await Promise.all([
    responseText("game/manifest.json", signal).then((text) => JSON.parse(text) as FirstLightManifest),
    responseText("altair.project.json", signal),
  ]);
  if (
    !Array.isArray(manifest.scenes) ||
    manifest.scenes.some((path) => typeof path !== "string" || !path.startsWith("game/scene/"))
  ) {
    throw new TypeError("First Light scene manifest is invalid");
  }
  const sources: FirstLightSource[] = await Promise.all(
    manifest.scenes.map(async (path) => ({
      path,
      text: await responseText(path, signal),
    })),
  );
  return compileFirstLightProject({ projectSnapshot, sources });
};
