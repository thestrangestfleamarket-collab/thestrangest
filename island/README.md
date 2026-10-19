# Quiet Island

A standalone three.js island (not part of THE MARKET): one stilt hut, six palms, a hammock, a pier with a moored canoe,
fish, gulls, and the open sea. Published at https://claude.ai/artifact/BnwKkVwTUkgeMMYu9oS1sC.

- `index.html` is the whole page (three.js 0.170 from jsDelivr). `assets/` holds the CC0 Poly Haven textures, skies and models,
  resized and converted by `tools/fetch.sh`. Binary models and HDR skies end in `.wasm` only because the artifact host serves
  no `.glb`/`.hdr` types; the loaders read them by content.
- VR: WebXR (`Enter VR`). It needs the page opened directly in a headset browser (the claude.ai frame does not grant XR).
  Trigger: aim the arc and release to teleport, or point at a coconut in a palm to drop it. Grip: grab and throw coconuts.
  Thumbstick left/right: snap turn.
- URL: `?time=day|golden|night`, `?view=island|water|hut|above|sea|hammock`, `?at=x,y,z,tx,ty,tz`, `?dpr=1`.
- Screenshots: `node tools/shot.cjs` with `SHOTS="view=hut&dpr=1|hut"` (needs `playwright` and `three@0.170.0` installed).
