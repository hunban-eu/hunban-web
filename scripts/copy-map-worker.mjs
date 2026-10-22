// MapLibre 6 runs its heavy lifting in a separate background script (a "worker")
// that the Next.js bundler does not pick up on its own. Before every build and
// dev start, copy the worker files from the installed package into public/,
// so they are served from our own domain and always match the installed version.
import { copyFileSync, mkdirSync } from "node:fs";

const from = "node_modules/maplibre-gl/dist";
const to = "public/maplibre";
mkdirSync(to, { recursive: true });
for (const file of ["maplibre-gl-worker.mjs", "maplibre-gl-shared.mjs"]) {
  copyFileSync(`${from}/${file}`, `${to}/${file}`);
}
console.log("Copied MapLibre worker files to public/maplibre");
