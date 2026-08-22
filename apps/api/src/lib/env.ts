// BismiLLAH Ar-Rahman Ar-Roheem.
// Environment adapter for the GoShop API. Platform-agnostic: on Node/Astro it
// reads process.env; on Cloudflare Workers the Pages Function calls setEnv(env)
// to inject the `env` binding. All library code should call getEnv(key) rather
// than reading process.env directly, so the same code runs on both runtimes.

let envCache: Record<string, string> = {};
let workersMode = false;

/**
 * Populate the env cache from the Workers `env` binding. Merges process.env
 * (best-effort, empty on Workers) with the provided binding. Called by the CF
 * Pages Function at the start of every request.
 */
export function setEnv(env: Record<string, string> | undefined): void {
  let fromProcess: Record<string, string> = {};
  try {
    if (typeof process !== 'undefined' && process.env) {
      for (const [k, v] of Object.entries(process.env)) {
        if (typeof v === 'string') fromProcess[k] = v;
      }
    }
  } catch {
    fromProcess = {};
  }
  envCache = { ...fromProcess, ...(env || {}) };
  workersMode = true;
}

/**
 * Read an env var. On Workers returns from the env cache populated by setEnv.
 * On Node/Astro returns from process.env (the cache is empty until setEnv is
 * called, which it never is on the Astro path).
 */
export function getEnv(key: string): string | undefined {
  if (workersMode) {
    return envCache[key];
  }
  try {
    return (process.env as Record<string, string | undefined>)[key] ?? envCache[key];
  } catch {
    return envCache[key];
  }
}

/** True when the runtime is Cloudflare Workers (setEnv has been called). */
export function isWorkersRuntime(): boolean {
  return workersMode;
}

/** Reset caches; test-only. */
export function _resetEnvCache(): void {
  envCache = {};
  workersMode = false;
}
