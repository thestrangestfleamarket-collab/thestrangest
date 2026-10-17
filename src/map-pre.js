// THE OLD GAME'S LOOK ON THE WORLD (owner, 17 Oct 2026: "look at the actual old game code and see how it was done", then "go all"; its recipe,
// docs/OLD-LOOK.md): (1) every face its own fixed shade by the way it faces, whatever the light: a top as its colour, a side facing along x
// x0.62, along z x0.8 (the old game's rasterBox); (2) the light it gets multiplied in, and its strength cut to 24 even steps (on the
// brightest of its three colours, so its hue stays; no dither), so a lamp's pool falls off in clear bands, not a smooth glow
THREE.ShaderLib.lambert.fragmentShader=THREE.ShaderLib.lambert.fragmentShader
  .replace('#include <map_fragment>','#include <map_fragment>\n { vec3 wn=abs((vec4(normalize(vNormal),0.)*viewMatrix).xyz); diffuseColor.rgb*=wn.y>=max(wn.x,wn.z)?1.:wn.x>wn.z?.62:.8; }')
  .replace('#include <lights_fragment_end>','#include <lights_fragment_end>\n { vec3 al=max(diffuseColor.rgb,vec3(.02)); vec3 L=(reflectedLight.directDiffuse+reflectedLight.indirectDiffuse)/al*3.14159; float m=max(L.r,max(L.g,L.b)); if(m>.001){ float q=min(floor(min(m,1.7)*24.+.5)/24.,1.7)/m; reflectedLight.directDiffuse*=q; reflectedLight.indirectDiffuse*=q; } }');
// ---- THE MAP (owner, 16 Oct 2026: "a small map with only the subway, pool and bodega (next to each other for now)", "build the exit to the
// subway (floor level) and subway underneath"): one street; the bodega and the pool room side by side on its sidewalk; the West End's
// subway station under the lot west of the bodega, its stairs down from the sidewalk into the station's exit tunnel. Two levels: the street's
// and the station's (98 art px under it), each its own walls, ground and lights; going down the stairs takes you from one to the other.
// Places in the bodega's tiles (the game's own, its door at the scene's middle); each place built by its own code, moved to its spot ----
const NEONS=[], SHL=[], cutWalls=[], lamps=[], trees=[], shopGroups=[]; let night=1, nightTo=1; const C1=new THREE.Color(), C2=new THREE.Color(); function applyTime(){}
const ZU=1/(PPU*Math.cos(Math.PI/6)), TILE=33.9/PPU, QS=new URLSearchParams(location.search), LAMPI=8, LAMPD=1.6;
const SOL={up:[],down:[]}, FIX={up:[],down:[]}; let solids=SOL.up, fixed=FIX.up, BOUND, groundY, LVL='up', BOD, BODB;
const MAPG={}, MODS={}; let MAPBAKE=0; const OVERHEAD=[]; let RPASS=null, FIRE=null;   // (OVERHEAD: the lights hung over a room, shown only from under them: rooms.js; RPASS: the picture's render pass, its camera the view's: ui.js)
// a place's own objects gathered in a group of its own (shown and hidden with its level)
const grab=(name,fn)=>{ const n0=scene.children.length; fn(); const g=new THREE.Group(); g.name=name; for(const o of scene.children.slice(n0))g.add(o); scene.add(g); MAPG[name]=g; return g; };
// where each place goes: the station (its platform 98 px down, its exit tunnel's end 3 tiles behind the sidewalk, 11 tiles west of the
// bodega's door), the pool room (its west wall 10 tiles east of the bodega's door, its front on the sidewalk), the stairs (bodega tiles)
const STN={DX:-11*TILE, DZ:-35*TILE, DY:-98*ZU};
const PDX=(10+27.3/2)*TILE, PDZ=-8.4*TILE;   // (the apartment building, a fifth bigger: its west wall where it was, its front on the sidewalk)
// BIGGER BUILDINGS, BIGGER DOORS (owner, 17 Oct 2026: "make doorways 30% larger, buildings 10% larger"): each building (the bodega, the pool room)
// a tenth bigger every way from the middle of its front, which stays on the sidewalk; the street, the sidewalks and the road as they were. Doors 1.3 times (1.56 wide, 94 px high)
const BLDK=1.1;
const MAPSTAIR={x0:59,x1:63,y0:-80,y1:-74, steps:12, depth:98};
const POOLR={x0:0,y0:0,x1:27.3,y1:16.8,H:150}; Object.assign(POOLR,{bx0:3.5,by0:9.7,bx1:17,by1:15.6,HT:5});   // (the apartments' pool: across the front, left to right, 13.5 x 5.9 tiles, all one depth)   // (the basin as the game has it, the room's middle across)
POOLR.LX=POOLR.bx1-POOLR.bx0; POOLR.LY=POOLR.by1-POOLR.by0; POOLR.level=-0.16*24;   // the water 4 art px under the deck
