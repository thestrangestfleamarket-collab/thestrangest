// THE OLD GAME'S LOOK ON THE WORLD (owner, 17 Oct 2026: "look at the actual old game code and see how it was done", then "go all"; its recipe,
// docs/OLD-LOOK.md): (1) every face its own fixed shade by the way it faces, whatever the light: a top as its colour, a side facing along x
// x0.62, along z x0.8 (the old game's rasterBox); (2) the light it gets multiplied in, and its strength cut to 24 even steps (on the
// brightest of its three colours, so its hue stays; no dither), so a lamp's pool falls off in clear bands, not a smooth glow
// (a mockup's choice, ?dith=N: the light in N steps, each pixel's cut moved by a noise fixed to the world's art pixels, so a step's edge breaks
// up into grain instead of a clean ring)
// THE GRAIN, FOR GOOD (owner, 17 Oct 2026: "i want to avoid these types of shadows and grids half tone, can we do the shadows style i mentioned
// earlier with screenshot i shared?", the noise-dithered light he called perfect): on by default, 16 steps; GRAPHICS' LIGHT GRAIN sets it (24 fine,
// 16, 12 strong, or off: the clean 24 bands), kept in the browser, the page loads again to make it; ?dith=N for a test
// SMOOTH LIGHT (owner, 17 Oct 2026: "i dont like any of those mockups, they all look like dots everywhere, i want smooth realistic shadows and
// lighting like gradient radial etc"): the default now: no grain, the light not cut into steps (it falls off in gradients), soft shadow edges
// (build.py); GRAPHICS' LIGHTING switches back to PIXEL (the steps and the grain), kept in the browser; ?look=pixel|smooth for a test
const SMOOTH=(()=>{ const q=new URLSearchParams(location.search).get('look'); if(q)return q!=='pixel'; let v=null; try{ v=SAVE.get('lighting'); }catch(e){} return v!=='pixel'; })();
const DITH=SMOOTH?0:(()=>{ const q=new URLSearchParams(location.search).get('dith'); if(q!=null)return +q; let v=null; try{ v=SAVE.get('grain'); }catch(e){} return v!=null?+v:16; })();
// THE LIVELIER LOOK (owner, 17 Oct 2026: "how can i get the world to look more dynamic with light, shadows, weather etc without dragging down
// with lag? this looks too bland"; "let me see mockups of all of those"): ?fx=cs,cool,ao,var,wet,sway,life (or all): the clouds' shadows
// drifting over the ground (cs), contact shadows where things stand on it (ao), the ground's tones varied in patches (var), wet ground with
// puddles (wet), all in the world's one lit shader, reading their amounts from a tiny texture the page writes (LFX.env: no new programs per
// change); the warm sun and cool shade in the final pass (cool, oldlook.js); the undergrowth swaying (sway, park.js); birds, falling leaves,
// motes in the sun (life, lookfx.js)
const LFX={on:new Set((new URLSearchParams(location.search).get('fx')||'').split(',').filter(Boolean))}; if(LFX.on.has('all'))['cs','cool','ao','var','wet','sway','life'].forEach(k=>LFX.on.add(k));
LFX.AO={x0:-45,z0:-40,w:160,h:150,k:6};   // (the contact shadows' map: world units, texels a unit)
LFX.shade=LFX.on.has('cs')||LFX.on.has('ao')||LFX.on.has('var')||LFX.on.has('wet');
if(LFX.shade){ LFX.env=new THREE.DataTexture(new Uint8Array(64*64*4),64,64); LFX.env.wrapS=LFX.env.wrapT=THREE.RepeatWrapping; LFX.env.magFilter=LFX.env.minFilter=THREE.LinearFilter; LFX.env.needsUpdate=true;
  const A=LFX.AO; LFX.ao=new THREE.DataTexture(new Uint8Array(A.w*A.k*A.h*A.k).fill(255),A.w*A.k,A.h*A.k,THREE.RedFormat); LFX.ao.magFilter=LFX.ao.minFilter=THREE.LinearFilter; LFX.ao.needsUpdate=true;
  THREE.ShaderLib.lambert.uniforms.tENV={value:LFX.env}; THREE.ShaderLib.lambert.uniforms.tAO={value:LFX.ao}; }
if(DITH||LFX.shade){ THREE.ShaderLib.lambert.vertexShader='varying vec3 vWP;\n'+THREE.ShaderLib.lambert.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\n vWP=(modelMatrix*vec4(transformed,1.)).xyz;');
  THREE.ShaderLib.lambert.fragmentShader='varying vec3 vWP;\n'+(LFX.shade?'#define LFX\nuniform sampler2D tENV,tAO; float lfh(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); } float lfn(vec2 p){ vec2 i=floor(p), f=fract(p), u=f*f*(3.-2.*f); return mix(mix(lfh(i),lfh(i+vec2(1,0)),u.x),mix(lfh(i+vec2(0,1)),lfh(i+vec2(1,1)),u.x),u.y); }\n':'')+THREE.ShaderLib.lambert.fragmentShader; }
if(DITH){ THREE.ShaderLib.lambert.fragmentShader=THREE.ShaderLib.lambert.fragmentShader.replace('#include <lights_fragment_begin>','#include <lights_fragment_begin>\n vec3 dc=floor(vWP*'+(24/(33.9/30)).toFixed(3)+'+.001); float dh=fract(sin(dot(dc,vec3(12.9898,78.233,37.719)))*43758.5453);'); }
THREE.ShaderLib.lambert.fragmentShader=THREE.ShaderLib.lambert.fragmentShader
  .replace('#include <map_fragment>','#include <map_fragment>\n {\n#ifdef FLAT_SHADED\n vec3 nv_=normalize(cross(dFdx(vViewPosition),dFdy(vViewPosition)));\n#else\n vec3 nv_=normalize(vNormal);\n#endif\n vec3 wn=abs((vec4(nv_,0.)*viewMatrix).xyz); diffuseColor.rgb*=wn.y>=max(wn.x,wn.z)?1.:wn.x>wn.z?.62:.8; }')   /* (a flat-shaded Lambert (the boats, the floats) has no vNormal: its face's normal from the screen's slopes; its program failed to compile before, 17 Oct 2026) */
  .replace('#include <lights_fragment_end>','#include <lights_fragment_end>\n'+(LFX.shade?' { vec3 wN=(vec4(normal,0.)*viewMatrix).xyz; float up=step(.7,wN.y); vec4 P0=texelFetch(tENV,ivec2(0,63),0), P1=texelFetch(tENV,ivec2(1,63),0), P2=texelFetch(tENV,ivec2(2,63),0); float cs=texture2D(tENV,vWP.xz/40.68+P1.rg).r; reflectedLight.directDiffuse*=1.-P0.r*smoothstep(.48,.58,cs)*.7; if(P0.b>.5&&up>0.&&vWP.y<.5){ vec2 au=(vWP.xz-vec2('+LFX.AO.x0+'.,'+LFX.AO.z0+'.))/vec2('+LFX.AO.w+'.,'+LFX.AO.h+'.); float ao=texture2D(tAO,au).r; reflectedLight.directDiffuse*=ao; reflectedLight.indirectDiffuse*=ao; } if(P0.a>.5&&up>0.){ float n=lfn(vWP.xz*.22)*.7+lfn(vWP.xz*.9)*.3, d=lfh(floor(vWP.xz*21.2))-.5, lv=floor(clamp(n*4.+d*.7,0.,3.999))/3.; float t=.84+.28*lv; reflectedLight.directDiffuse*=t; reflectedLight.indirectDiffuse*=t; } if(P0.g>.01&&up>0.){ float m=step(.7,lfn(vWP.xz*1.1+7.)*.75+lfn(vWP.xz*3.3)*.25), k=1.-P0.g*(.3+.25*m); reflectedLight.directDiffuse*=k; reflectedLight.indirectDiffuse*=k; reflectedLight.indirectDiffuse+=P2.rgb*P0.g*m*.12*(.5+.5*lfn(vWP.xz*5.)); } }':'')+'\n { vec3 al=max(diffuseColor.rgb,vec3(.02)); vec3 L=(reflectedLight.directDiffuse+reflectedLight.indirectDiffuse)/al*3.14159; float m=max(L.r,max(L.g,L.b)); if('+(SMOOTH?'false':'true')+'&&m>.001){ float q=min(floor(min(m,1.7)*'+(DITH?DITH+'.+dh':'24.+.5')+')/'+(DITH||24)+'.,1.7)/m; reflectedLight.directDiffuse*=q; reflectedLight.indirectDiffuse*=q; } }');
// ---- THE MAP (owner, 16 Oct 2026: "a small map with only the subway, pool and bodega (next to each other for now)", "build the exit to the
// subway (floor level) and subway underneath"): one street; the bodega and the pool room side by side on its sidewalk; the West End's
// subway station under the lot west of the bodega, its stairs down from the sidewalk into the station's exit tunnel. Two levels: the street's
// and the station's (98 art px under it), each its own walls, ground and lights; going down the stairs takes you from one to the other.
// Places in the bodega's tiles (the game's own, its door at the scene's middle); each place built by its own code, moved to its spot ----
const NEONS=[], SHL=[], cutWalls=[], lamps=[], trees=[], shopGroups=[]; let night=1, nightTo=1; const C1=new THREE.Color(), C2=new THREE.Color(); function applyTime(){}
const ZU=1/(PPU*Math.cos(Math.PI/6)), TILE=33.9/PPU, QS=new URLSearchParams(location.search), LAMPI=8, LAMPD=1.6;
const SOL={up:[],down:[]}, FIX={up:[],down:[]}, CLIPX=[];   // (CLIPX: the things not in the batch, for the hitboxes' pass: {place, name, P its triangles in the world, or obj its group}: clip.js)
let solids=SOL.up, fixed=FIX.up, BOUND, groundY, LVL='up', BOD, BODB;
const STORE={rooms:[],places:[],roofs:[]}, BF={list:[]}; window.STORE=STORE;   // (STORE: the storeroom, store.js; BF: the butterflies, butterflies.js)
const MAPG={}, MODS={}; let MAPBAKE=0; const OVERHEAD=[]; let RPASS=null, FIRE=null;   // (OVERHEAD: the lights hung over a room, shown only from under them: rooms.js; RPASS: the picture's render pass, its camera the view's: ui.js)
// a place's own objects gathered in a group of its own (shown and hidden with its level)
const grab=(name,fn)=>{ const n0=scene.children.length; fn(); const g=new THREE.Group(); g.name=name; for(const o of scene.children.slice(n0))g.add(o); scene.add(g); MAPG[name]=g; return g; };
// THE MAP'S LAYOUT (owner, 17 Oct 2026: "build a map editor that allows me to move buildings and land around easily"; Shift+M, src/mapedit.js):
// each place's move from where its code puts it, in the map's tiles (x east, y toward the park), and for the park and the land their edges'
// moves too (e: west, back, east, front); read once here by the code that sets each place out, so its faces, solids, lights, rooms, ground,
// stairs and lanes all go with it. LAYOUT0 is the game's own (what he exports, saved here for good); the editor's own in the browser
// (market-layout) over it, the page reloaded to build it; ?layout=0 the game's own alone, ?layout={...} one for a test
// THE MARKET'S LAYOUT, MOCKUP 1 (owner, 17 Oct 2026, of three mockups: "mockup 1"): one block, shoulder to shoulder, homes at both ends and
// the shops between: the apartment house | the community garden (the herb cottage and the butterfly garden, down off the roof, on the lot
// the subway stairs stand before) | the bodega | the Diner | THE AQUARIUM (the octopus tank's room, a storefront) | the Bar | Ghost Street |
// the apartment building with its pool at the east end, nothing on its roof; the keep in the castle's bailey; the street run on east past
// them (BOD.MAP.x1), and THE AVENUE north from its east end along the park's east wall (AVE, below). The moves here in the map's tiles
const LAYOUT0={bodega:{x:8.75},diner:{x:-24.75},bar:{x:-8},ghost:{x:-8.75},apartments:{x:59},park:{e:[-4,0,0,0]},castle:{y:16.5}};   // (castle: to the grown park's back-left corner, 17 Oct 2026)
const LAY=(()=>{ const q=QS.get('layout'); let o={}; try{ o=q&&q[0]==='{'?JSON.parse(q):q==='0'?{}:JSON.parse(SAVE.get('layout')||'{}')||{}; }catch(e){}
  const L=Object.assign({},LAYOUT0,o); return {L, o:k=>({x:+(L[k]&&L[k].x)||0,y:+(L[k]&&L[k].y)||0}), e:k=>(L[k]&&L[k].e||[0,0,0,0]).map(v=>+v||0), h:k=>+(L[k]&&L[k].h)||0, s:k=>+(L[k]&&L[k].s)||1}; })();   // (h: a room's lift in tiles, s: its size, the map editor's RAISE / LOWER and GROW / SHRINK: mapedit.js, store.js)
// where each place goes: the station (its platform 98 px down, its exit tunnel's end 3 tiles behind the sidewalk, 11 tiles west of the
// bodega's door), the pool room (its west wall 10 tiles east of the bodega's door, its front on the sidewalk), the stairs (bodega tiles)
const STN={DX:(-11+LAY.o('subway').x)*TILE, DZ:(-35+LAY.o('subway').y)*TILE, DY:-98*ZU};   // (the subway: the station and its stairs move together)
const PDX=(10+27.3/2+LAY.o('apartments').x)*TILE, PDZ=(-8.4+LAY.o('apartments').y)*TILE;   // (the apartment building, a fifth bigger: its west wall where it was, its front on the sidewalk)
// BIGGER BUILDINGS, BIGGER DOORS (owner, 17 Oct 2026: "make doorways 30% larger, buildings 10% larger"): each building (the bodega, the pool room)
// a tenth bigger every way from the middle of its front, which stays on the sidewalk; the street, the sidewalks and the road as they were. Doors 1.3 times (1.56 wide, 94 px high)
const BLDK=1.1;
// THE AVENUE (owner, 17 Oct 2026: "have the street on right side go up and fill the right side of that street with places as well. pull from old
// game"): a cross street north from the main street's east end, the park's east wall its west side, a row of the old game's places its east
// side (avenue.js). In the street's tiles (BOD.XS/ZS): x0..x1 its whole width (two sidewalks of 3.2 and a road of 7.7, the main street's), y1
// how far north it runs (the park's back is -2); its road's kerbs at r0, r1
const AVE={x0:152,x1:166.5,y1:57.5}; AVE.r0=AVE.x0+3.2; AVE.r1=AVE.x1-3.2;
const MAPSTAIR={x0:59,x1:63,y0:-80,y1:-74, steps:12, depth:98, dir:-1};
{ const o=LAY.o('subway'); MAPSTAIR.x0+=o.x; MAPSTAIR.x1+=o.x; MAPSTAIR.y0+=o.y; MAPSTAIR.y1+=o.y; }
// THE CASTLE (owner, 17 Oct 2026: "the castle on the left back end" of the park, "the dungeon under the castle (only 1 level)"; castle.js): its
// bailey's curtain wall (the lines of its four sides, bodega tiles), the gate's middle on its front (toward the street), the stair down from the
// bailey (twelve steps, the subway's depth, descending toward the park's back: dir 1), the one dungeon under it (its walls' lines, its height)
const CASTLE={b:[46,67,-21,-4],gate:58.5,stair:{x0:61.5,x1:63.5,y0:-19.4,y1:-13.4,steps:12,depth:98,dir:1},hall:{x0:51,y0:-20,x1:65,y1:-6.8,h:130}};   // (clear of the Moon Shrine's garden east of it, store.js)
{ const o=LAY.o('castle'), C=CASTLE, S=C.stair, H=C.hall; C.b=[C.b[0]+o.x,C.b[1]+o.x,C.b[2]+o.y,C.b[3]+o.y]; C.gate+=o.x; for(const R of [S,H]){ R.x0+=o.x; R.x1+=o.x; R.y0+=o.y; R.y1+=o.y; } }   // (the dungeon under it goes with it)
const POOLR={x0:0,y0:0,x1:27.3,y1:16.8,H:150}; Object.assign(POOLR,{bx0:3.5,by0:9.7,bx1:17,by1:15.6,HT:5});   // (the apartments' pool: across the front, left to right, 13.5 x 5.9 tiles, all one depth)   // (the basin as the game has it, the room's middle across)
POOLR.LX=POOLR.bx1-POOLR.bx0; POOLR.LY=POOLR.by1-POOLR.by0; POOLR.level=-0.16*24;   // the water 4 art px under the deck
