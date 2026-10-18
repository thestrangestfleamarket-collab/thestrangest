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
// CEL, ALWAYS (owner, 18 Oct 2026, his picture of a pixel-art face: "i want this kind of shading at all times ... solid colors, but pixelated, not
// gradient, i dont want gradients ever in the game"; then of the mockups: "3-5 flat as option in menu - do not use smooth light under any
// circumstances hard rule"): the light on every face cut into CEL flat bands (3, 4 or 5: GRAPHICS' LIGHT BANDS, the save's 'bands'; 4 the
// default), no grain, no blend between them, each band down a little cooler and bluer than the one over it (HUE), hard shadow edges. There
// is no smooth light: SMOOTH stays false for the code that still asks; ?cel=N for a test
const CEL=(()=>{ const q=+new URLSearchParams(location.search).get('cel'); let v=null; try{ v=+SAVE.get('bands'); }catch(e){} const n=q||v||4; return Math.max(3,Math.min(5,n|0)); })();
const HUE=(()=>{ const q=new URLSearchParams(location.search).get('hue'); return (q!=null?+q:1).toFixed(3); })();
const SMOOTH=false;   // (never: the hard rule above)
// ---- EVERY CHARACTER AT REST, AND STEPPED (owner, 18 Oct 2026, after the mushroom seller's crawling shadow and "now check other characters":
// "are you just patching each character or applying an overall fix that fixes the root issues?"; "both"): the light on a character is cut into
// hard flat bands and his own shadow is hard-edged, so any motion smaller than a pixel (a breathing loop, a sway) flips edge pixels every frame.
// One rule for everyone, in the one place each goes through (makeNPC's tick, npc-map.js; the Walker-built ones and you in their own frames):
// REST: standing, a character's animation clock is held (his mixer's timeScale 0), after half a second to settle and but for a shift of weight
// of 1.5 s every 7 to 15 s; only what his own file calls deliberate goes on (`N.restless()`: a talk, a cheer, a guard's alert, a blow, wings).
// STEPPED: his pose is worked out ASTEP.fps times a second (10 by default, the time between handed over in one go), held between, as a sprite's
// frames are; where he stands moves smoothly every frame. GRAPHICS' ANIMATION: STEPPED 8 / 10 / 12, EVERY FRAME (the save's 'animfps', 0 every
// frame); ?animfps=N, ?still=0 the rest rule off.
const ASTEP=window.ASTEP=(()=>{ const Q=new URLSearchParams(location.search), q=Q.get('animfps'); let v=null; try{ v=SAVE.get('animfps'); }catch(e){}
  const A={fps:q!=null?+q:v!=null?+v:10,still:Q.get('still')!=='0',you:{}};
  A.gate=(o,dt)=>{ if(!(A.fps>0))return dt; const T=1/A.fps; if(o._ac==null)o._ac=Math.random()*T; o._ac+=dt; if(o._ac<T)return 0; const d=o._ac; o._ac=0; return d; };   // (0: hold this frame; else the time since the last pose)
  A.rest=(o,dt,moving)=>{ if(!A.still||moving||(o.restless&&o.restless())){ o._calm=.5; o._sh=7+Math.random()*8; return false; }
    if((o._calm=(o._calm==null?.5:o._calm)-dt)>0)return false; if((o._sh=(o._sh==null?7:o._sh)-dt)<=0){ o._calm=1.5; o._sh=7+Math.random()*8; return false; } return true; };   // (true: hold his clock)
  return A; })();
// (the haze in steps as well: every material's fog cut into 8 flat bands, no smooth fade into the far)
THREE.ShaderChunk.fog_fragment=THREE.ShaderChunk.fog_fragment.replace('gl_FragColor.rgb = mix','fogFactor = floor( fogFactor * 8. + .5 ) / 8.;\n\tgl_FragColor.rgb = mix');
// THE MIST ON THE TOWN'S OUTSKIRTS (owner, 18 Oct 2026, his shot down the street, the road gone teal in straight bands a few tiles from him: "the
// haze should not be straight lines and should be on the outskirts of town"; "game is unplayable"): while the mist is on (skyline.js sets MISTE.x),
// how misty a point is goes by how far it lies past the town's edge (the force field's box, MISTB, set by ring.js), not by its depth in the camera's
// view: the town clear wherever you stand, the mist thickening past its edge; the edge of each of the 8 flat steps bent by a noise fixed to the
// world (two scales), so its bands lie in wavy tongues, never straight lines. The box and the switch are plain objects every fog material's
// uniforms share by reference (three copies a Vector4, not a plain {x,y,z,w}). Cost: a few instructions a fragment
const MISTB={x:-1e9,y:-1e9,z:1e9,w:1e9}, MISTE={x:0,y:4,z:26,w:1}, MISTF={x:.5,y:70};   // (MISTB the town's x0,z0,x1,z1 in the world; MISTE: on, where the mist starts and its depth past the edge in tiles, a tile in the world: ring.js)
for(const k in THREE.ShaderLib){ const u=THREE.ShaderLib[k].uniforms; if(u&&u.fogNear){ u.mistB={value:MISTB}; u.mistE={value:MISTE}; u.mistF={value:MISTF}; } }
THREE.ShaderChunk.fog_pars_vertex=THREE.ShaderChunk.fog_pars_vertex.replace('varying float vFogDepth;','varying float vFogDepth; varying vec3 vFogW;');
THREE.ShaderChunk.fog_vertex=THREE.ShaderChunk.fog_vertex.replace('vFogDepth = - mvPosition.z;','vFogDepth = - mvPosition.z; vFogW = ( inverse( viewMatrix ) * mvPosition ).xyz;');
THREE.ShaderChunk.fog_pars_fragment=THREE.ShaderChunk.fog_pars_fragment.replace('varying float vFogDepth;',`varying float vFogDepth; varying vec3 vFogW; uniform vec4 mistB, mistE; uniform vec2 mistF;
 float mistH(vec2 c){ c=mod(c,256.); return fract(sin(dot(c,vec2(12.9898,78.233)))*43758.5453); }
 float mistN(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(mistH(i),mistH(i+vec2(1,0)),f.x),mix(mistH(i+vec2(0,1)),mistH(i+vec2(1,1)),f.x),f.y); }`);
THREE.ShaderChunk.fog_fragment=THREE.ShaderChunk.fog_fragment.replace('fogFactor = floor(',`vec3 mistC=fogColor; if( mistE.x > .5 ){ vec2 q=vFogW.xz/mistE.w;
		float dx=max(mistB.x/mistE.w-q.x,q.x-mistB.z/mistE.w), dz=max(mistB.y/mistE.w-q.y,q.y-mistB.w/mistE.w), d=max(dx,dz);
		d+=(mistN(q/9.)-.5)*14.+(mistN(q/3.1+17.)-.5)*5.;   // (the steps' edges bent into tongues)
		fogFactor=clamp((d-mistE.y)/mistE.z,0.,1.); mistC*=1.-mistF.x*floor(clamp((d-mistE.y-mistE.z)/mistF.y,0.,1.)*4.)/4.; }   // (darker the further out: owner, "it should get darker further away", in four steps)
	fogFactor = floor(`).replace('gl_FragColor.rgb, fogColor, fogFactor','gl_FragColor.rgb, mistC, fogFactor');
// THE DARKEST A FACE GOES (owner, 18 Oct 2026: "nothing should be black like this even at darkest give it 5-20%"): a face the sun and lamps miss still
// gets this much of its own colour, so the bricks of a shaded side show; ?floor=N for a test
const FLOOR=(()=>{ const q=+new URLSearchParams(location.search).get("floor"); return (q>=0&&q<1&&q?q:.2).toFixed(3); })();
// SOFT STEPS (owner, 18 Oct 2026, "do A-D": everything looked flat under smooth light): the smooth light keeps a few broad bands, each edge
// eased over a short gradient (no grain, no hard line), so a face's turn from the light reads; ?soft=0 the smooth light alone, ?soft=N N bands
const SOFT=(()=>{ const q=new URLSearchParams(location.search).get('soft'); return q!=null?Math.max(0,+q|0):7; })();
const DITH=0&&(()=>{ const q=new URLSearchParams(location.search).get('dith'); if(q!=null)return +q; let v=null; try{ v=SAVE.get('grain'); }catch(e){} return v!=null?+v:16; })();
// THE LIVELIER LOOK (owner, 17 Oct 2026: "how can i get the world to look more dynamic with light, shadows, weather etc without dragging down
// with lag? this looks too bland"; "let me see mockups of all of those"): ?fx=cs,cool,ao,var,wet,sway,life (or all): the clouds' shadows
// drifting over the ground (cs), contact shadows where things stand on it (ao), the ground's tones varied in patches (var), wet ground with
// puddles (wet), all in the world's one lit shader, reading their amounts from a tiny texture the page writes (LFX.env: no new programs per
// change); the warm sun and cool shade in the final pass (cool, oldlook.js); the undergrowth swaying (sway, park.js); birds, falling leaves,
// motes in the sun (life, lookfx.js)
const LFX={on:new Set((new URLSearchParams(location.search).get('fx')??'cs,cool').split(',').filter(Boolean))};   /* (the clouds' shadows and the warm sun / cool shade on by default since 18 Oct 2026, owner: "do A-D", the flat midday; ?fx=none all off) */ if(LFX.on.has('all'))['cs','cool','ao','var','wet','sway','life'].forEach(k=>LFX.on.add(k));
LFX.AO={x0:-45,z0:-40,w:160,h:150,k:6};   // (the contact shadows' map: world units, texels a unit)
LFX.shade=true;   // (always, 18 Oct 2026: the weather's wet ground and lying snow are read from it too, below; the ?fx= switches each its own part)
if(LFX.shade){ LFX.env=new THREE.DataTexture(new Uint8Array(64*64*4),64,64); LFX.env.wrapS=LFX.env.wrapT=THREE.RepeatWrapping; LFX.env.magFilter=LFX.env.minFilter=THREE.LinearFilter; LFX.env.needsUpdate=true;
  const A=LFX.AO; LFX.ao=new THREE.DataTexture(new Uint8Array(A.w*A.k*A.h*A.k).fill(255),A.w*A.k,A.h*A.k,THREE.RedFormat); LFX.ao.magFilter=LFX.ao.minFilter=THREE.LinearFilter; LFX.ao.needsUpdate=true;
  THREE.ShaderLib.lambert.uniforms.tENV={value:LFX.env}; THREE.ShaderLib.lambert.uniforms.tAO={value:LFX.ao}; }
if(DITH||LFX.shade){ THREE.ShaderLib.lambert.vertexShader='varying vec3 vWP;\n'+THREE.ShaderLib.lambert.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\n vWP=(modelMatrix*vec4(transformed,1.)).xyz;');
  THREE.ShaderLib.lambert.fragmentShader='varying vec3 vWP;\n'+(LFX.shade?'#define LFX\nuniform sampler2D tENV,tAO; float lfh(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); } float lfn(vec2 p){ vec2 i=floor(p), f=fract(p), u=f*f*(3.-2.*f); return mix(mix(lfh(i),lfh(i+vec2(1,0)),u.x),mix(lfh(i+vec2(0,1)),lfh(i+vec2(1,1)),u.x),u.y); }\n':'')+THREE.ShaderLib.lambert.fragmentShader; }
if(DITH){ THREE.ShaderLib.lambert.fragmentShader=THREE.ShaderLib.lambert.fragmentShader.replace('#include <lights_fragment_begin>','#include <lights_fragment_begin>\n vec3 dc=floor(vWP*'+(24/(33.9/30)).toFixed(3)+'+.001); float dh=fract(sin(dot(dc,vec3(12.9898,78.233,37.719)))*43758.5453);'); }
THREE.ShaderLib.lambert.fragmentShader=THREE.ShaderLib.lambert.fragmentShader
  .replace('#include <map_fragment>','#include <map_fragment>\n {\n#ifdef FLAT_SHADED\n vec3 nv_=normalize(cross(dFdx(vViewPosition),dFdy(vViewPosition)));\n#else\n vec3 nv_=normalize(vNormal);\n#endif\n vec3 wn=abs((vec4(nv_,0.)*viewMatrix).xyz); diffuseColor.rgb*=wn.y>=max(wn.x,wn.z)?1.:wn.x>wn.z?.62:.8; }')   /* (a flat-shaded Lambert (the boats, the floats) has no vNormal: its face's normal from the screen's slopes; its program failed to compile before, 17 Oct 2026) */
  .replace('#include <lights_fragment_end>','#include <lights_fragment_end>\n'+(LFX.shade?' { vec3 wN=(vec4(normal,0.)*viewMatrix).xyz; float up=step(.7,wN.y); vec4 P0=texelFetch(tENV,ivec2(0,63),0), P1=texelFetch(tENV,ivec2(1,63),0), P2=texelFetch(tENV,ivec2(2,63),0); float cs=texture2D(tENV,vWP.xz/40.68+P1.rg).r; reflectedLight.directDiffuse*=1.-P0.r*smoothstep(.48,.58,cs)*.45; if(P0.b>.5&&up>0.&&vWP.y<.5){ vec2 au=(vWP.xz-vec2('+LFX.AO.x0+'.,'+LFX.AO.z0+'.))/vec2('+LFX.AO.w+'.,'+LFX.AO.h+'.); float ao=texture2D(tAO,au).r; reflectedLight.directDiffuse*=ao; reflectedLight.indirectDiffuse*=ao; } if(P0.a>.5&&up>0.){ float n=lfn(vWP.xz*.22)*.7+lfn(vWP.xz*.9)*.3, d=lfh(floor(vWP.xz*21.2))-.5, lv=floor(clamp(n*4.+d*.7,0.,3.999))/3.; float t=.84+.28*lv; reflectedLight.directDiffuse*=t; reflectedLight.indirectDiffuse*=t; }  }':'')+'\n { vec3 al=max(diffuseColor.rgb,vec3(.02)); vec3 L0=(reflectedLight.directDiffuse+reflectedLight.indirectDiffuse)/al*3.14159; float m0=max(L0.r,max(L0.g,L0.b)); if(m0<'+FLOOR+') reflectedLight.indirectDiffuse+=al/3.14159*('+FLOOR+'-m0); }\n { vec3 al=max(diffuseColor.rgb,vec3(.02)); vec3 L=(reflectedLight.directDiffuse+reflectedLight.indirectDiffuse)/al*3.14159; float m=max(L.r,max(L.g,L.b)); if('+(SMOOTH&&SOFT?'true':'false')+'&&m>.001){ float f=min(m,1.7)*'+SOFT+'., b=floor(f)+smoothstep(.3,.7,fract(f)), s=(f<1.?f:mix(f,b,.7))/'+SOFT+'.; float q=s/m; reflectedLight.directDiffuse*=q; reflectedLight.indirectDiffuse*=q; }'+(CEL?'\n if(m>.001){ float b=floor(min(m,1.45)*'+CEL+'.+.5)/'+CEL+'.; b=max(b,'+(.5/CEL).toFixed(3)+'); float sh=clamp(1.-b,0.,1.)*'+HUE+'; vec3 tn=mix(vec3(1.05,1.,.93),vec3(.8,.86,1.22),sh); float q=b/m; reflectedLight.directDiffuse*=q*tn; reflectedLight.indirectDiffuse*=q*tn; }':'')+'\n if('+(SMOOTH||CEL?'false':'true')+'&&m>.001){ float q=min(floor(min(m,1.7)*'+(DITH?DITH+'.+dh':'24.+.5')+')/'+(DITH||24)+'.,1.7)/m; reflectedLight.directDiffuse*=q; reflectedLight.indirectDiffuse*=q; } }');
// WET GROUND AND LYING SNOW (owner, 18 Oct 2026, "go all": the weather's "not yet: wet ground, snow lying"): read from LFX.env's last row
// (lookfx.js writes how wet and how snowed on, outdoors only, 0 inside or underground), on every face facing up in the world's one lit shader,
// before the light is cut into its bands, so both take the cel steps as everything does: WET, the ground a third darker (grass a little), and
// still puddles on the paving and the road (blobs of a fixed noise, hard-edged, never moving; not on grass, not above knee height) a flat sheet
// of the sky's colour laid over after the bands; SNOW, white patches growing from a fixed noise as it lies deeper until all is covered, melting
// back the same way. No new program, no new texture, no light
if(LFX.shade){ const FN='#ifdef FLAT_SHADED\n vec3 nq=normalize(cross(dFdx(vViewPosition),dFdy(vViewPosition)));\n#else\n vec3 nq=normalize(vNormal);\n#endif\n';
  THREE.ShaderLib.lambert.fragmentShader=THREE.ShaderLib.lambert.fragmentShader
  .replace('#include <color_fragment>','#include <color_fragment>\n float lfP=0.;\n { vec4 Q0=texelFetch(tENV,ivec2(0,63),0), Q1=texelFetch(tENV,ivec2(1,63),0);\n if(Q0.g>.01||Q1.b>.01){\n'+FN+' float upq=step(.7,(vec4(nq,0.)*viewMatrix).y); vec3 dc=diffuseColor.rgb; float gr=step(dc.r*1.1,dc.g)*step(dc.b*1.05,dc.g);\n if(Q0.g>.01&&upq>0.){ float w=Q0.g; diffuseColor.rgb*=1.-w*(.34-.22*gr); lfP=w*step(.79,lfn(vWP.xz*.55+3.)*.7+lfn(vWP.xz*1.9+11.)*.3)*(1.-gr)*step(vWP.y,.4); diffuseColor.rgb*=1.-.6*lfP; }\n if(Q1.b>.01&&upq>0.){ float c=step(1.-Q1.b*1.15,lfn(vWP.xz*.8+9.)*.6+lfn(vWP.xz*3.1+5.)*.4); diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.9,.92,.96),c); lfP*=1.-c; } } }')
  .replace('#include <opaque_fragment>',' if(lfP>0.){ vec3 sk=texelFetch(tENV,ivec2(2,63),0).rgb; outgoingLight=mix(outgoingLight,sk*.46+.015,lfP*.8); }\n#include <opaque_fragment>'); }
// ---- THE MAP (owner, 16 Oct 2026: "a small map with only the subway, pool and bodega (next to each other for now)", "build the exit to the
// subway (floor level) and subway underneath"): one street; the bodega and the pool room side by side on its sidewalk; the West End's
// subway station under the lot west of the bodega, its stairs down from the sidewalk into the station's exit tunnel. Two levels: the street's
// and the station's (98 art px under it), each its own walls, ground and lights; going down the stairs takes you from one to the other.
// Places in the bodega's tiles (the game's own, its door at the scene's middle); each place built by its own code, moved to its spot ----
const NEONS=[], SHL=[], cutWalls=[], lamps=[], trees=[], shopGroups=[]; let night=1, nightTo=1; const C1=new THREE.Color(), C2=new THREE.Color(); function applyTime(){}
const ZU=1/(PPU*Math.cos(Math.PI/6)), TILE=33.9/PPU, QS=new URLSearchParams(location.search), LAMPI=8, LAMPD=1.6;
// A ROOF OUT OF SIGHT, NOT GONE (owner, 18 Oct 2026: "it looks like the roof is vanishes and lets real light, i dont want it to actually vanish
// just not show up on screen, needs to still look like its inside, dont change lighting in interiors jsut beacuse you walk in the room"): a roof
// hidden while you're in is taken off the camera's layer (0) onto layer 3, which every shadow-casting light's shadow camera also sees, so it
// keeps the sun out (and its shadow on the room) exactly as from outside. Rays (layer 0) don't hit it while it's out of sight, as before.
const SEEN=(o,show)=>{ if(!SEEN.L){ SEEN.L=1; scene.traverse(c=>{ if(c.isLight&&c.shadow)c.shadow.camera.layers.enable(3); }); }
  if(o.userData.seen===show)return; o.userData.seen=show; o.traverse(c=>{ if(c.isMesh||c.isLine||c.isPoints){ if(show)c.layers.enable(0); else c.layers.disable(0); c.layers.enable(3); } }); };
// FREE (owner, 18 Oct 2026: "lets take off any preloading rules or hiding rules, just let the user run freely around full map. dont render characters
// or things that are out of sight of player that dont need to be - whatever method you think would reduce lag and let me freely run around n and
// out of rooms"): no world vanishing inside a room (its six planes and the black, the characters outside hidden, the river and the force field
// hiding: rooms.js, ring.js, river.js, lives.js); the near-side cut kept but its planes on every material before the first compile (rooms.js's
// nearAll, at the warm-up: its first use had recompiled every program, the freeze going in); no interior
// drawn only near its door (interiors.js) or only from inside (perf.js's 1st), so nothing pops or hitches as you come and go. What stays: the walls
// toward the camera cut to their foot and the roof hidden while you're in (so you see yourself), the map chunks' frustum culling, characters out of
// the picture not drawn and far ones not run (npc-map.js). ?free=0 the old rules
const FREE=QS.get('free')!=='0';
const SOL={up:[],down:[]}, FIX={up:[],down:[]}, CLIPX=[];   // (CLIPX: the things not in the batch, for the hitboxes' pass: {place, name, P its triangles in the world, or obj its group}: clip.js)
let solids=SOL.up, fixed=FIX.up, BOUND, groundY, LVL='up', BOD, BODB, METRO;   // (METRO: the subway, metro.js; undefined while the old station is brought back)
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
const LAYOUT0={bodega:{x:8.75},diner:{x:-24.75},bar:{x:-8},ghost:{x:-8.75},apartments:{x:59},park:{e:[-4,0,0,0]},castle:{x:-70,y:25.5+14}};   // (castle: to the grown park's back-left corner, 17 Oct 2026; x -70, y +3 since 18 Oct 2026: the street run on 70 tiles west, the far sidewalk 3 tiles deeper; y +6 more the same day, the far sidewalk 12 deep: NORTHY)
// OFF THE MAP (owner, 18 Oct 2026: "i want main street to only have this building [the apartment house], the bodega and ghost street building on
// it. put all other buildings that are on main now off map for me to pull from later. i dont want any other buildings or rooms on map"; and of the
// castle, "the tower shouldnt be inside the castle, it should be off map"): every place named here is kept in the code but not on the map. Most are
// simply not built (each one's own code asks AWAY.has(its key) where it's set out, and whatever leans on it skips a place that isn't there): the
// Diner (diner), the Bar and its band (bar), the Aquarium (aquarium), the community garden with the herb cottage, the butterfly house and its
// fence (garden), the Avenue's seven shells (avenue), the keep (keep), the civic tower (civic: its droids then keep the bodega's door), the power
// house (power: the grid off with it). The apartment building with its pool (apartments) is too woven into the page to leave out (its water,
// the swimming, the floats and boats), so it's built where no one goes: AWAYLOT tiles east, past the force field, never drawn or reached.
// To bring one back: ?bring=diner,bar (or ?bring=all) for a look, or take its key out of AWAY0 here for good; the map editor (Shift+M) then
// moves it as before. The castle and its dungeon stay (half height, for the woodland creatures: castle.js)
// THE OLD STATION OFF THE MAP (owner, 18 Oct 2026: "i want to bring the metro into the map and move the current subway station off map"):
// station: the game's West End station and its stairs (station.js, wsub.js, map-post.js's old stairs), the Metro in their place (metro.js);
// ?bring=station builds the old one again instead (the two share the subway's spot under the lot, so it's one or the other)
const AWAY0=['apartments','diner','bar','aquarium','garden','avenue','keep','civic','power','station'], AWAYLOT=1000;
const AWAY=(()=>{ const s=new Set(AWAY0), q=QS.get('bring'); if(q==='all')s.clear(); else if(q)for(const k of q.split(','))s.delete(k.trim()); return s; })(); window.AWAY=AWAY;   // (castle: to the grown park's back-left corner, 17 Oct 2026)
const LAY=(()=>{ const q=QS.get('layout'); let o={}; try{ o=q&&q[0]==='{'?JSON.parse(q):q==='0'?{}:JSON.parse(SAVE.get('layout')||'{}')||{}; }catch(e){}
  const L=Object.assign({},LAYOUT0,o); return {L, o:k=>({x:(+(L[k]&&L[k].x)||0)+(k==='apartments'&&AWAY.has(k)?AWAYLOT:0),y:+(L[k]&&L[k].y)||0}), e:k=>(L[k]&&L[k].e||[0,0,0,0]).map(v=>+v||0), h:k=>+(L[k]&&L[k].h)||0, s:k=>+(L[k]&&L[k].s)||1}; })();   // (h: a room's lift in tiles, s: its size, the map editor's RAISE / LOWER and GROW / SHRINK: mapedit.js, store.js)
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
// THE MAIN STREET TWICE AS LONG, ITS FAR SIDEWALK TWICE AS DEEP (owner, 18 Oct 2026: "double th size of the street of main (left and right
// diretions) and double the size of the siewalk on the central park side"): the street run on 70 tiles each way (MAINX: the west street, the park's
// west wall and the castle 70 west; the Avenue, the park's east wall and the force field's east side 70 east; the park twice as wide between
// them), the far sidewalk 6 tiles where it was 3 (BOD.MAP.y1 in bodega.js), the park and the north street 3 tiles north with it (NORTHY)
// (and again, owner 18 Oct 2026: "make sidewalk on central park side 2x bigger": the far sidewalk 12 tiles, the park and all north of it 9 north, NORTHY)
// (THE ROADS THREE TIMES WIDER, owner 18 Oct 2026: "the street lanes are too narrow, need to be 3x wider": every road of the loop WID tiles
// wider: the main street's road 7 tiles to 21 (its far kerb, LSEED.grass in gamekit.js, 14 north, and all north of it with NORTHY), the west
// street's 8.1 to 22.1 (its outer edge 14 west), the north street's (its outer edge 14 north), the Avenue's (its outer edge 14 east))
const MAINX={w:70,e:70}, WID=14, NORTHY=9+WID;
const AVE={x0:152+MAINX.e,x1:166.5+MAINX.e+WID,y1:57.5}; AVE.r0=AVE.x0+3.2; AVE.r1=AVE.x1-3.2;
// THE LOOP (owner, 17 Oct 2026: "lets loop the street all the way around the park and back again ... use force field to block anyone from leaving
// outside of the city block loop ... add the hudson behind the buildings on main street, it goes all the way up and down map"): the main street
// (south), the Avenue (east), a north street along the park's back and a west street along its west side, each 14.5 tiles (two sidewalks of 3.2,
// a road of 8.1), the Avenue's road ending at the north street (its east sidewalk on to the last shell's door, AVE.ey1); the force field round the
// loop and the buildings on its outer side (ff); the Hudson south of the main street's row and its alley, the land's whole width (river). In the
// street's tiles (BOD.XS / ZS: y up toward the park)
const RING={wx0:31.5-MAINX.w-WID,wx1:46-MAINX.w,ny0:12.5+NORTHY,ny1:27+NORTHY+WID}; RING.wr0=RING.wx0+3.2; RING.wr1=RING.wx1-3.2; RING.nr0=RING.ny0+3.2; RING.nr1=RING.ny1-3.2;
{ const x0=(RING.wr0+RING.wr1)/2+2.7, raw=((50-MAINX.w)+AVE.x0)/2+9; RING.mine={x:x0+(Math.floor((raw-x0)/2.5)+.5)*2.5}; }   /* (the deep mines' way in from the loop tunnel, on the mine's grid: mines.js, sub.js) */ AVE.y1=RING.ny1; AVE.ey1=RING.ny1+11.5; RING.stairs=[{x0:RING.wx0+.6,x1:RING.wx0+2.6,y0:-2,y1:4,steps:12,depth:98,dir:-1,leg:'w'},{x0:AVE.r1+.6,x1:AVE.r1+2.6,y0:-2.4,y1:3.6,steps:12,depth:98,dir:-1,leg:'e'}];   /* (the loop's subway: its stairs down, the west street's outer sidewalk and the Avenue's east one, in the gap between its shells: sub.js) */ RING.river={y0:-150,y1:-104}; RING.ff={x0:RING.wx0-1.5,x1:AVE.x1+25.5,y0:RING.river.y0-1.5,y1:40.5+NORTHY};   // (the field past the river's far bank: the Hudson in the city, real water to swim in, river.js; owner 18 Oct 2026)   // (just past the row's back alley)
// THE SUBWAY'S WAY DOWN (the old station's stairs; the Metro's opening fills it in from the kit's railing, metro.js: then has(x, z, lv) says
// when you're on its stairs or in its exit, ground(x, z, lv) the floor under you there)
const MAPSTAIR={x0:59,x1:63,y0:-80,y1:-74, steps:12, depth:98, dir:-1};
{ const o=LAY.o('subway'); MAPSTAIR.x0+=o.x; MAPSTAIR.x1+=o.x; MAPSTAIR.y0+=o.y; MAPSTAIR.y1+=o.y; }
// THE CASTLE (owner, 17 Oct 2026: "the castle on the left back end" of the park, "the dungeon under the castle (only 1 level)"; castle.js): its
// bailey's curtain wall (the lines of its four sides, bodega tiles), the gate's middle on its front (toward the street), the stair down from the
// bailey (twelve steps, the subway's depth, descending toward the park's back: dir 1), the one dungeon under it (its walls' lines, its height)
const CASTLE={b:[46,67,-21,-4],gate:58.5,stair:{x0:61.5,x1:63.5,y0:-19.4,y1:-13.4,steps:12,depth:98,dir:1},hall:{x0:51,y0:-20,x1:65,y1:-6.8,h:130}};   // (clear of the Moon Shrine's garden east of it, store.js)
{ const o=LAY.o('castle'), C=CASTLE, S=C.stair, H=C.hall; C.b=[C.b[0]+o.x,C.b[1]+o.x,C.b[2]+o.y,C.b[3]+o.y]; C.gate+=o.x; for(const R of [S,H]){ R.x0+=o.x; R.x1+=o.x; R.y0+=o.y; R.y1+=o.y; } }   // (the dungeon under it goes with it)
const POOLR={x0:0,y0:0,x1:27.3,y1:16.8,H:150}; Object.assign(POOLR,{bx0:3.5,by0:9.7,bx1:17,by1:15.6,HT:5});   // (the apartments' pool: across the front, left to right, 13.5 x 5.9 tiles, all one depth)   // (the basin as the game has it, the room's middle across)
POOLR.LX=POOLR.bx1-POOLR.bx0; POOLR.LY=POOLR.by1-POOLR.by0; POOLR.level=-0.16*24;   // the water 4 art px under the deck
