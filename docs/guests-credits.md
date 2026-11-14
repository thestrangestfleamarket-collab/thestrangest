# The Guest List: credits

| What | Files | From | Licence |
|---|---|---|---|
| The twenty guests' bodies and their motion (walking, talking, drinking, sitting, dancing) | `data/guests/people/*.glb`, `data/guests/anim-m.glb`, `data/guests/anim-f.glb` | Microsoft Rocketbox Avatar Library, https://github.com/microsoft/Microsoft-Rocketbox | MIT |
| Surfaces (floors, walls, wood, stone, cloth, leather) | `data/guests/tex/*_{d,n,a}.jpg` | Poly Haven, https://polyhaven.com/textures | CC0 |
| Furniture and things (chandeliers, sofas, tables, shelves, clocks, pictures, kitchen and garden things, old weapons) | `data/guests/m/*.glb` | Poly Haven, https://polyhaven.com/models | CC0 |
| Your hands in the headset | `data/guests/hand/*.glb` | `@webxr-input-profiles/assets` generic hand (W3C Immersive Web) | MIT |

Changes made: the people re-exported as GLB with eight face shapes and clips sampled at 15 fps (`tools/guests-people.cjs`); pictures resized and re-encoded (`tools/guests-assets.py`); heavier models thinned (`tools/guests-slim.cjs`).

Libraries: three.js (MIT), Rapier (Apache 2.0). The house, its doors, windows, hearths, bar, bath, billiard table, the grounds, the storm and every sound are made in code. The guests' minds are Claude Haiku 5.5; their voices Deepgram Aura on Workers AI, or the browser's own.
