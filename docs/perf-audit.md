# THE MARKET: perf audit (17 Oct 2026, paused at the owner's word)

Measured in a cloud container (Playwright + SwiftShader, software graphics, 1920x1080 window), on main before `835257b` (smooth light). Milliseconds are
only good for comparing one part with another. The counts (draw calls, triangles, passes, programs) hold on any machine.
Tools: `tools/perfprof.py` (a profiling copy of the page with a timer round each system in the frame) and `tests/perfaudit.cjs <out.json> "<query>"`.
The spots measured were the street by day (`hour=13`) and by night (`hour=21`), inside the bodega and in the park. The BEHIND view, the stored bar,
the platform and the pool were queued but **not measured**, because the run was stopped when the owner paused the work.

## Measured

| spot | in a room | draw calls/frame | triangles/frame (avg / max) | main-pass draws | main-pass tris | on-screen tris (approx) | interior tris drawn from outside | self-shadow passes | CPU frame ms (median) | composer.render ms | self-shadow ms |
|---|---|---|---|---|---|---|---|---|---|---|---|
| street-day | no | 513 | 1,684,782 / 2,490,955 | 79 | 400,410 | 81,220 | 158,724 | 23.6 | 23.2 | 14.9 | 3.2 |
| street-night | no | 216 | 1,509,722 / 2,449,843 | 79 | 395,276 | 81,223 | 158,724 | 21.5 | 13.3 | 7.0 | 2.4 |
| bodega | yes | 120 | 1,032,980 / 1,798,532 | 60 | 243,679 | 87,465 | 0 | 1.0 | 11.1 | 5.7 | 0.4 |
| park | no | 181 | 1,463,327 / 2,144,371 | 50 | 332,105 | 59,817 | 124,147 | 15.4 | 16.1 | 7.6 | 2.3 |

Shadow passes per frame (the sun and the lamp each update every other frame):
- street by day: the lamp's 1024 cube took 116 draws and 979K triangles; the sun's 2048 map took 289 draws and 211K triangles.
- street by night: the lamp's cube took 110 draws and 964K triangles.
- bodega: the lamp's cube took 60 draws and 747K triangles.
- park: the lamp's cube took 90 draws and 858K triangles; the sun took 26 draws and 193K triangles.

Other measurements:
- **Resolution:** the picture is drawn at 480x270 (a quarter of 1920x1080) and scaled up. Nothing renders at full screen size. The glow pass and the output pass are cheap.
- **Programs:** 89 to 95 shader programs. **Memory:** 633 geometries and 652 textures.
- **Render targets:** 51 self-shadow targets at 256x256, one for each character, each with a depth texture. The point-light shadow atlas is 4096x2048 and the sun's map is 2048x2048.
- **Characters:** 51 in all. About 23 are drawn on the street, and each one drawn renders the scene once more for its own self-shadow.

## Biggest costs, ranked

1. **The lamp's point-light shadow (`LITE.pool[0]`, a 1024 cube with 6 faces) draws about 1M triangles every other frame,** about 2.5 times the main pass.
   The batched meshes span the whole world, so they land in all 6 faces. Every `frustumCulled=false` caster is also drawn into all 6 faces, wherever it is.
2. **Of the main pass's 400K triangles, only about 81K are on screen.** The budget is 100K.
   - The stored rooms' one batched mesh is **116,610** triangles drawn from the street, with **0** of them in view.
   - The bodega group draws 34K triangles that are almost all inside its rooms.
   - The pool's water is 32.7K triangles, drawn while out of view.
   - The bar's guitarist is 30.3K triangles, drawn while out of view and far away.
   - Altogether 159K interior triangles are drawn from the street.
3. **The Walker is 56.7K triangles,** because every hairstyle and every eye style is in his one mesh, folded to nothing but still processed.
   He is drawn about 8 times a frame: the main pass, 6 cube faces, the sun's map and his own self-shadow pass.
4. **Per-character self-shadow passes:** 21 to 24 extra scene renders a frame on the street, costing 2.4 to 3.2 ms of CPU and 51 render targets.
5. **`frustumCulled=false`** is set on every skinned character (the skeletons, 4 droids, 12 pawns, the creatures, 10 dragons), on the musicians, the Walker, the water, the clouds and the effects.
   None of these are skipped when off screen, and all of them land in all 6 shadow faces.
6. **A hidden Lambert mesh of about 106K triangles** (318K vertices) is drawn only in the shadow passes. It is not yet identified; `perfextra.cjs` and the probe were meant to find it.
7. **CPU systems:**
   - The pool's floats run every frame wherever you are: 0.7 to 0.9 ms.
   - The flames take 0.1 to 0.2 ms; the butterflies and the musicians are already cheap or already gated.
   - The NPC ticks take about 0.9 ms. They were left alone, because another agent owns them.
8. **Draw calls are modest:** 50 to 80 in the main pass. Most of the 513 calls a frame come from the shadow passes, not from small meshes.

## The fix plan (approved by the owner) and where it stands

| # | fix | measured number it addresses | state |
|---|---|---|---|
| 1 | Interiors: split the batched faces inside each room box into a child mesh per room. That mesh is shown only in that room or at its door, so it uploads to the graphics card on the first visit. Floors, outer walls and roofs stay. | 159K interior triangles from the street, plus their shadow draws | **written** (`src/perf.js` `PERFX.split`/`PERFX.rooms`, hooked into `build.py`); **not built, not tested** |
| 2 | Self-shadows drawn for him and the 2 nearest characters only; the rest without a self-shadow | 21 to 24 passes, 2.4 to 3.2 ms | **written** (`SELFSH` in `src/perf.js`, plus one guard in `npc-map.js` `shadowPass`); **not tested** |
| 4 | Real bounds for the skinned bodies, the Walker, the musicians and the water, so they are culled on screen and in each cube face | about 1M cube-shadow triangles, plus the off-screen draws | **written** (`PERFX.bounds`); **not tested** |
| 6 | The lamp's cube shadow from 1024 to 512 | atlas from 4096x2048 to 2048x1024, a quarter of the fill | **written** (`PERFX.maps`); the look is **unchecked** |
| 7 | The pool's floats only near the pool, the butterflies only near them, the musicians hidden (by layers) past 18 units | 0.7 to 0.9 ms of floats, 30K musician triangles | **written**; **not tested** |
| 5 | Merge small meshes into fewer draws | the main pass has only 50 to 80 draws, so the gain is small | **not started** |
| — | Walker: leave the folded hairstyles and eyes out of his index (an invisible win) | 56.7K triangles × about 8 | **not started** (suggested) |
| — | Find and drop the hidden 106K shadow-only mesh | about 106K triangles in each shadow pass | **not started** |

What would change the look, for the owner to see:
- Fix 1: furniture is no longer seen through the windows from the street (floors stay).
- Fix 2: characters other than the two nearest lose their self-shadow.
- Fix 6: the lamp's shadow is coarser.

Everything else on the list is invisible. `?perfx=0` turns all the fixes off, and `?perfx=-1,-2` turns off single ones, for before/after checks.
