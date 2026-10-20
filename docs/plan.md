# Plan: structure & multiplayer — findings and to-do list

Synthesis from a review session on 2026-10-20: a code audit of this repo, three.js
community consensus, and passive recon of two shipped closed-source three.js games
(Krunker.io, Voxiom.io). This is a working plan, not a decision log — owner decisions
still live in HISTORY.md.

## What we confirmed about the game

- It is full 3D three.js/WebGL, not 2D top-down. The default orthographic camera only
  *looks* top-down; views switch between isometric / behind / first-person / free-fly.
- Rendering and performance discipline are already strong: real spatial culling
  (161a-cull.js), heavy InstancedMesh use, a CI budget gate. This is not where the
  problems are — do not disturb it.
- The real gaps are multiplayer-readiness and team-maintainability.

## The single biggest insight

Every multiplayer feature wanted (remote avatars, trade, chat, custom looks) is blocked
on the same prerequisite: there is no first-class "player" in the code — the local
player is scattered globals (pos / heading / py) read in ~724 sites across 70 files.
Make "a player" an entity and remote players can ride the existing NPC render/rig path.
Everything else is downstream.

## What the reference games taught us

- Two independent shipped three.js games (Krunker, Voxiom) put the SAME two levers at
  the top of their quality settings: **Render Scale** (render resolution independent of
  screen) and **View/Draw Distance**. That is the device-tier blueprint, and it maps onto
  machinery we already have (render scale is hardcoded to 1; culling already works in cells).
- Krunker validated our chunked-split asset loading (it does the identical thing:
  core data split into parallel chunks + build-hash cache-busting). Its engine core is WASM.
- Voxiom offers a cheap customization idea: let players reskin via an image URL (needs
  CORS hosting).
- Netcode cannot be learned from a protected game (Krunker's anti-cheat blocked every
  connected menu). For the authoritative-server design, read open source instead:
  Mazmorra (endel/mazmorra) and Colyseus.

## Reference games (all open source — read the source)

- Mazmorra (endel/mazmorra) — closest match: three.js client + authoritative Node server,
  room-based. The working model of "separate server for far parts of the city" = room-per-zone.
- Colyseus — room-based authoritative server; rooms map ~1:1 to city blocks; splits worlds
  by coordinate. Lives beside Cloudflare (Worker keeps door/login; realtime server is separate Node).
- jgarrettvml/threejs-multiplayer — modern TS, server-authoritative + client prediction,
  typed bindings so client/server can't drift.
- juniorxsound/THREE.Multiplayer — minimal Socket.io boilerplate; relay-only (lesson by
  counter-example: the server must validate).
- felixgren/three-arena — playable three.js + Socket.io FPS; movement interpolation.
- Skip: rameshvarun/netplayjs — P2P/WebRTC, no authoritative host. Wrong fit.

## To-do list (biggest leverage first)

### Tier 0 — free, zero-risk
1. DONE (owner, 20 Oct 2026): the "no comments in src/" rule was relaxed — every file now
   starts with one comment line, and short clarifying comments are allowed. The minifier
   strips them all, so they cost the download nothing.
2. Fix stale READMEs (README.md + island/README.md) — they still point to the dropped
   claude.ai artifact and a dist/avatar.html the build no longer makes. (Verify against
   current main before editing.)

### Tier 1 — structural prerequisite (everything multiplayer depends on this)
3. Introduce a first-class Player entity {id, pos, heading, py, look, vel}; make the local
   player instance 0. Migrate the ~724 pos.* sites incrementally behind an alias.
4. Convert the frame loop to a fixed-timestep accumulator (today variable-step clamped to 50ms)
   so sim is deterministic and a server can validate/replay movement.
5. Route remote players through the existing NPC render/rig path.
6. Finish the ES-modules migration (the 20 Oct 2026 "move to modules" is already underway) —
   real imports + esbuild bundle:true as the source model, so the toolchain catches scope
   breakage instead of hand scope-analysis.

### Tier 2 — multiplayer server (only after Tier 1)
7. Stand up an authoritative room server — separate Node host, not in the single-file page;
   one room per block. Read Mazmorra/Colyseus for the pattern.
8. Define the client/server state boundary first; keep all game-state mutation on one side.
9. Zone/room split for "far parts of the city" (room-per-coordinate).
10. Feature layers on room state: player-to-player trade handshake, chat, avatar-look sync.

### Tier 3 — quality tiers (Krunker/Voxiom-informed; machinery mostly exists)
11. Add a device-tier detector (detect-gpu or GPU/memory/touch heuristics) that picks a preset at load.
12. Build named presets + a one-click "Low Spec" master toggle (Default / Performance / Low Spec).
13. Wire presets to the converged knob set, mapped to code we have: Render Scale (render
    resolution independent of screen — today setPixelRatio(1) is hardcoded), Render/Cull
    Distance (culling cell size), Shadows (shadow-map sizing), Map Details, Particles,
    Particle Distance.
14. Add a dynamic FPS governor (sample every ~2s, step quality down to hold a target) under
    the static tier.

### Tier 4 — keep it healthy as it grows
15. Make the test suite actually assert — 107 test files, only ~5 gate CI; add assertions to
    the *sim.cjs / *check.cjs files, especially before trade/position-reconciliation logic exists.
16. Shared material/geometry registry + build-once-per-look avatar cache (240 material
    constructions, dispose() in only ~10 files; 20 customized avatars churning will leak).
17. (Parked) WASM hot-path escape hatch — only if a CPU ceiling is hit in physics/rig math.

## Open decisions (owner to settle)

- Target player count: still "100 per block", or prove end-to-end with a smaller cap (8–20) first?
  This changes how heavy Tier 2 is.
- Server hosting: Cloudflare Workers can't hold a stateful room; this needs a separate Node host
  (Durable Objects are a maybe). Decide where the realtime server runs.
