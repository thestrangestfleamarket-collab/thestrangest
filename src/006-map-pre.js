// THE MAP, BEFORE THE PLACES: lots and layout (LBLD, LAY), the away list (AWAY), the grab() that groups a place's meshes, shared state (SOL, FIX, MODS).
const CEL=(()=>{ const q=+new URLSearchParams(location.search).get('cel'); let v=null; try{ v=+SAVE.get('bands'); }catch(e){} const n=q||v||4; return Math.max(3,Math.min(5,n|0)); })();
const HUE=(()=>{ const q=new URLSearchParams(location.search).get('hue'); return (q!=null?+q:1).toFixed(3); })();
const SMOOTH=false;
const ASTEP=window.ASTEP=(()=>{ const Q=new URLSearchParams(location.search), q=Q.get('animfps'); let v=null; try{ v=SAVE.get('animfps'); }catch(e){}
  const A={fps:q!=null?+q:v!=null?+v:10,still:Q.get('still')!=='0',you:{}};
  A.gate=(o,dt)=>{ if(!(A.fps>0))return dt; const T=1/A.fps; if(o._ac==null)o._ac=Math.random()*T; o._ac+=dt; if(o._ac<T)return 0; const d=o._ac; o._ac=0; return d; };
  A.rest=(o,dt,moving)=>{ if(!A.still||moving||(o.restless&&o.restless())){ o._calm=.5; o._sh=7+Math.random()*8; return false; }
    if((o._calm=(o._calm==null?.5:o._calm)-dt)>0)return false; if((o._sh=(o._sh==null?7:o._sh)-dt)<=0){ o._calm=1.5; o._sh=7+Math.random()*8; return false; } return true; };
  return A; })();
THREE.ShaderChunk.fog_fragment=THREE.ShaderChunk.fog_fragment.replace('gl_FragColor.rgb = mix','fogFactor = floor( fogFactor * 8. + .5 ) / 8.;\n\tgl_FragColor.rgb = mix');
const MISTB={x:-1e9,y:-1e9,z:1e9,w:1e9}, MISTB2={x:1e9,y:1e9,z:-1e9,w:-1e9}, MISTE={x:0,y:4,z:26,w:1}, MISTF={x:.5,y:70}, PFAR={x:1e9,y:1e9,z:-1e9,w:-1e9};
THREE.ShaderChunk.lights_fragment_begin=THREE.ShaderChunk.lights_fragment_begin.replace('directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;','#if NUM_DIR_LIGHT_SHADOWS > 2\n\t\tif ( UNROLLED_LOOP_INDEX == 0 && directLight.visible && receiveShadow ) { vec3 nq = vDirectionalShadowCoord[ 0 ].xyz / vDirectionalShadowCoord[ 0 ].w; directLight.color *= min( ( nq.x > .004 && nq.x < .996 && nq.y > .004 && nq.y < .996 && nq.z < 1. ) ? getShadow( directionalShadowMap[ 0 ], directionalLightShadows[ 0 ].shadowMapSize, directionalLightShadows[ 0 ].shadowBias, directionalLightShadows[ 0 ].shadowRadius, vDirectionalShadowCoord[ 0 ] ) : getShadow( directionalShadowMap[ 2 ], directionalLightShadows[ 2 ].shadowMapSize, directionalLightShadows[ 2 ].shadowBias, directionalLightShadows[ 2 ].shadowRadius, vDirectionalShadowCoord[ 2 ] ), getShadow( directionalShadowMap[ 1 ], directionalLightShadows[ 1 ].shadowMapSize, directionalLightShadows[ 1 ].shadowBias, directionalLightShadows[ 1 ].shadowRadius, vDirectionalShadowCoord[ 1 ] ) ); }\n\t\t#elif NUM_DIR_LIGHT_SHADOWS > 1\n\t\tdirectLight.color *= ( directLight.visible && receiveShadow ) ? ( UNROLLED_LOOP_INDEX == 0 ? min( getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ), getShadow( directionalShadowMap[ 1 ], directionalLightShadows[ 1 ].shadowMapSize, directionalLightShadows[ 1 ].shadowBias, directionalLightShadows[ 1 ].shadowRadius, vDirectionalShadowCoord[ 1 ] ) ) : 1.0 ) : 1.0;\n\t\t#else\n\t\tdirectLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;\n\t\t#endif');
for(const k in THREE.ShaderLib){ const u=THREE.ShaderLib[k].uniforms; if(u&&u.fogNear){ u.mistB={value:MISTB}; u.mistB2={value:MISTB2}; u.mistE={value:MISTE}; u.mistF={value:MISTF}; u.pfar={value:PFAR}; } }
THREE.ShaderChunk.fog_pars_vertex=THREE.ShaderChunk.fog_pars_vertex.replace('varying float vFogDepth;','varying float vFogDepth; varying vec3 vFogW;');
THREE.ShaderChunk.fog_vertex=THREE.ShaderChunk.fog_vertex.replace('vFogDepth = - mvPosition.z;','vFogDepth = - mvPosition.z; vFogW = ( inverse( viewMatrix ) * mvPosition ).xyz;');
THREE.ShaderChunk.fog_pars_fragment=THREE.ShaderChunk.fog_pars_fragment.replace('varying float vFogDepth;',`varying float vFogDepth; varying vec3 vFogW; uniform vec4 mistB, mistB2, mistE, pfar; uniform vec2 mistF;
 float mistH(vec2 c){ c=mod(c,256.); return fract(sin(dot(c,vec2(12.9898,78.233)))*43758.5453); }
 float mistN(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(mistH(i),mistH(i+vec2(1,0)),f.x),mix(mistH(i+vec2(0,1)),mistH(i+vec2(1,1)),f.x),f.y); }`);
THREE.ShaderChunk.fog_fragment=THREE.ShaderChunk.fog_fragment.replace('fogFactor = floor(',`vec3 mistC=fogColor; if( mistE.x > .5 ){ vec2 q=vFogW.xz/mistE.w;
		float dx=max(mistB.x/mistE.w-q.x,q.x-mistB.z/mistE.w), dz=max(mistB.y/mistE.w-q.y,q.y-mistB.w/mistE.w), d=max(dx,dz);
		d=min(d,max(max(mistB2.x/mistE.w-q.x,q.x-mistB2.z/mistE.w),max(mistB2.y/mistE.w-q.y,q.y-mistB2.w/mistE.w)));
		d+=(mistN(q/9.)-.5)*14.+(mistN(q/3.1+17.)-.5)*5.;
		fogFactor=clamp((d-mistE.y)/mistE.z,0.,1.);
#ifdef PFAR
		fogFactor=min(fogFactor,.52+.4*clamp((d-8.)/130.,0.,1.));
#else
		if(max(dx,dz)>40.&&q.x<pfar.z/mistE.w&&q.y<pfar.w/mistE.w&&((q.x>pfar.x/mistE.w&&q.y>mistB.w/mistE.w)||(q.y>pfar.y/mistE.w&&q.x>mistB.z/mistE.w)))discard;
#endif
		mistC*=1.-mistF.x*clamp((d-mistE.y-mistE.z)/mistF.y,0.,1.); }
	fogFactor = floor(`).replace('gl_FragColor.rgb, fogColor, fogFactor','gl_FragColor.rgb, mistC, fogFactor')
  .replace('fogFactor = floor( fogFactor * 8. + .5 ) / 8.;','');
const FLOOR=(()=>{ const q=+new URLSearchParams(location.search).get("floor"); return (q>=0&&q<1&&q?q:.2).toFixed(3); })();
const SOFT=(()=>{ const q=new URLSearchParams(location.search).get('soft'); return q!=null?Math.max(0,+q|0):7; })();
const DITH=0&&(()=>{ const q=new URLSearchParams(location.search).get('dith'); if(q!=null)return +q; let v=null; try{ v=SAVE.get('grain'); }catch(e){} return v!=null?+v:16; })();
const LFX={on:new Set((new URLSearchParams(location.search).get('fx')??'cs,cool').split(',').filter(Boolean))}; if(LFX.on.has('all'))['cs','cool','ao','var','wet','sway','life'].forEach(k=>LFX.on.add(k));
LFX.AO={x0:-45,z0:-40,w:160,h:150,k:6};
LFX.shade=true;
if(LFX.shade){ LFX.env=new THREE.DataTexture(new Uint8Array(64*64*4),64,64); LFX.env.wrapS=LFX.env.wrapT=THREE.RepeatWrapping; LFX.env.magFilter=LFX.env.minFilter=THREE.LinearFilter; LFX.env.needsUpdate=true;
  LFX.cs={n:1024,w:256*33.9/PPU,V:{x:0,y:0,z:0,w:0}}; LFX.cs.tex=new (class extends THREE.DataTexture{ get version(){ return this.source.version; } set version(v){} })(new Uint8Array(1024*1024),1024,1024,THREE.RedFormat); LFX.cs.tex.magFilter=LFX.cs.tex.minFilter=THREE.LinearFilter; LFX.cs.tex.needsUpdate=true;
  const A=LFX.AO; LFX.ao=new THREE.DataTexture(new Uint8Array(A.w*A.k*A.h*A.k).fill(255),A.w*A.k,A.h*A.k,THREE.RedFormat); LFX.ao.magFilter=LFX.ao.minFilter=THREE.LinearFilter; LFX.ao.needsUpdate=true;
  LFX.sunS={x:0,y:1,z:0,w:0}; LFX.sunB=[...Array(8)].map(()=>new THREE.Vector4(0,-1e5,0,0)); THREE.ShaderLib.lambert.uniforms.sunS={value:LFX.sunS}; THREE.ShaderLib.lambert.uniforms.sunB={value:LFX.sunB}; THREE.ShaderLib.lambert.uniforms.tENV={value:LFX.env}; THREE.ShaderLib.lambert.uniforms.tAO={value:LFX.ao}; THREE.ShaderLib.lambert.uniforms.tCS={value:LFX.cs.tex}; THREE.ShaderLib.lambert.uniforms.csV={value:LFX.cs.V}; }
if(DITH||LFX.shade){ THREE.ShaderLib.lambert.vertexShader='varying vec3 vWP;\n'+THREE.ShaderLib.lambert.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\n vWP=(modelMatrix*vec4(transformed,1.)).xyz;');
  THREE.ShaderLib.lambert.fragmentShader='varying vec3 vWP;\n'+(LFX.shade?'#define LFX\nuniform sampler2D tENV,tAO,tCS; uniform vec4 csV; uniform vec4 sunS, sunB[8]; float lfh(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); } float lfn(vec2 p){ vec2 i=floor(p), f=fract(p), u=f*f*(3.-2.*f); return mix(mix(lfh(i),lfh(i+vec2(1,0)),u.x),mix(lfh(i+vec2(0,1)),lfh(i+vec2(1,1)),u.x),u.y); }\n':'')+THREE.ShaderLib.lambert.fragmentShader; }
if(DITH){ THREE.ShaderLib.lambert.fragmentShader=THREE.ShaderLib.lambert.fragmentShader.replace('#include <lights_fragment_begin>','#include <lights_fragment_begin>\n vec3 dc=floor(vWP*'+(24/(33.9/30)).toFixed(3)+'+.001); float dh=fract(sin(dot(dc,vec3(12.9898,78.233,37.719)))*43758.5453);'); }
THREE.ShaderLib.lambert.fragmentShader=THREE.ShaderLib.lambert.fragmentShader
  .replace('#include <map_fragment>','#include <map_fragment>\n {\n#ifdef FLAT_SHADED\n vec3 nv_=normalize(cross(dFdx(vViewPosition),dFdy(vViewPosition)));\n#else\n vec3 nv_=normalize(vNormal);\n#endif\n vec3 wn=abs((vec4(nv_,0.)*viewMatrix).xyz); diffuseColor.rgb*=wn.y>=max(wn.x,wn.z)?1.:wn.x>wn.z?.62:.8; }')
  .replace('#include <lights_fragment_end>','#include <lights_fragment_end>\n'+(LFX.shade?' if(sunS.w>0.){ float lb=0.; for(int i=0;i<8;i++){ vec3 v=vWP-sunB[i].xyz; float t=dot(v,sunS.xyz), d2=dot(v,v)-t*t, r2=sunB[i].w*sunB[i].w; lb=max(lb,step(-1.,t)*(step(d2,r2)+step(d2,r2*.3))*.5); } reflectedLight.directDiffuse*=1.+sunS.w*lb*.7; } { vec3 wN=(vec4(normal,0.)*viewMatrix).xyz; float up=step(.7,wN.y); vec4 P0=texelFetch(tENV,ivec2(0,63),0), P1=texelFetch(tENV,ivec2(1,63),0), P2=texelFetch(tENV,ivec2(2,63),0); float cs=texture2D(tCS,(vWP.xz-vWP.y*csV.xy-csV.zw)/'+LFX.cs.w.toFixed(3)+'+.5).r; cs=P0.r*step(.5,cs); reflectedLight.directDiffuse*=1.-cs; reflectedLight.indirectDiffuse*=1.-cs*.3; if(P0.b>.5&&up>0.&&vWP.y<.5){ vec2 au=(vWP.xz-vec2('+LFX.AO.x0+'.,'+LFX.AO.z0+'.))/vec2('+LFX.AO.w+'.,'+LFX.AO.h+'.); float ao=texture2D(tAO,au).r; reflectedLight.directDiffuse*=ao; reflectedLight.indirectDiffuse*=ao; } if(P0.a>.5&&up>0.){ float n=lfn(vWP.xz*.22)*.7+lfn(vWP.xz*.9)*.3, d=lfh(floor(vWP.xz*21.2))-.5, lv=floor(clamp(n*4.+d*.7,0.,3.999))/3.; float t=.84+.28*lv; reflectedLight.directDiffuse*=t; reflectedLight.indirectDiffuse*=t; }  }':'')+'\n { vec3 al=max(diffuseColor.rgb,vec3(.02)); vec3 L0=(reflectedLight.directDiffuse+reflectedLight.indirectDiffuse)/al*3.14159; float m0=max(L0.r,max(L0.g,L0.b)); if(m0<'+FLOOR+') reflectedLight.indirectDiffuse+=al/3.14159*('+FLOOR+'-m0); }\n { vec3 al=max(diffuseColor.rgb,vec3(.02)); vec3 L=(reflectedLight.directDiffuse+reflectedLight.indirectDiffuse)/al*3.14159; float m=max(L.r,max(L.g,L.b)); if('+(SMOOTH&&SOFT?'true':'false')+'&&m>.001){ float f=min(m,1.7)*'+SOFT+'., b=floor(f)+smoothstep(.3,.7,fract(f)), s=(f<1.?f:mix(f,b,.7))/'+SOFT+'.; float q=s/m; reflectedLight.directDiffuse*=q; reflectedLight.indirectDiffuse*=q; }'+(CEL?'\n if(m>.001){ float b=floor(min(m,1.45)*'+CEL+'.+.5)/'+CEL+'.; b=max(b,'+(.5/CEL).toFixed(3)+'); float sh=clamp(1.-b,0.,1.)*'+HUE+'; vec3 tn=mix(vec3(1.05,1.,.93),vec3(.8,.86,1.22),sh); float q=b/m; reflectedLight.directDiffuse*=q*tn; reflectedLight.indirectDiffuse*=q*tn; }':'')+'\n if('+(SMOOTH||CEL?'false':'true')+'&&m>.001){ float q=min(floor(min(m,1.7)*'+(DITH?DITH+'.+dh':'24.+.5')+')/'+(DITH||24)+'.,1.7)/m; reflectedLight.directDiffuse*=q; reflectedLight.indirectDiffuse*=q; } }');
if(LFX.shade){ const FN='#ifdef FLAT_SHADED\n vec3 nq=normalize(cross(dFdx(vViewPosition),dFdy(vViewPosition)));\n#else\n vec3 nq=normalize(vNormal);\n#endif\n';
  THREE.ShaderLib.lambert.fragmentShader=THREE.ShaderLib.lambert.fragmentShader
  .replace('#include <color_fragment>','#include <color_fragment>\n float lfP=0.;\n { vec4 Q0=texelFetch(tENV,ivec2(0,63),0), Q1=texelFetch(tENV,ivec2(1,63),0);\n if(Q0.g>.01||Q1.b>.01){\n'+FN+' float upq=step(.7,(vec4(nq,0.)*viewMatrix).y); vec3 dc=diffuseColor.rgb; float gr=step(dc.r*1.1,dc.g)*step(dc.b*1.05,dc.g);\n if(Q0.g>.01&&upq>0.){ float w=Q0.g; diffuseColor.rgb*=1.-w*(.34-.22*gr); lfP=w*step(.79,lfn(vWP.xz*.55+3.)*.7+lfn(vWP.xz*1.9+11.)*.3)*(1.-gr)*step(vWP.y,.4); diffuseColor.rgb*=1.-.6*lfP; }\n if(Q1.b>.01&&upq>0.){ float c=step(1.-Q1.b*1.15,lfn(vWP.xz*.8+9.)*.6+lfn(vWP.xz*3.1+5.)*.4); diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.9,.92,.96),c); lfP*=1.-c; } } }')
  .replace('#include <opaque_fragment>',' if(lfP>0.){ vec3 sk=texelFetch(tENV,ivec2(2,63),0).rgb; outgoingLight=mix(outgoingLight,sk*.46+.015,lfP*.8); }\n#include <opaque_fragment>'); }
const NEONS=[], SHL=[], cutWalls=[], lamps=[], shopGroups=[]; let night=1, nightTo=1; const C1=new THREE.Color(), C2=new THREE.Color(); function applyTime(){}
const ZU=1/(PPU*Math.cos(Math.PI/6)), TILE=33.9/PPU, QS=new URLSearchParams(location.search), LAMPI=8, LAMPD=1.6;
const SEEN=(o,show)=>{ if(!SEEN.L){ SEEN.L=1; scene.traverse(c=>{ if(c.isLight&&c.shadow)c.shadow.camera.layers.enable(3); }); }
  if(o.userData.seen===show)return; o.userData.seen=show; o.traverse(c=>{ if(c.isMesh||c.isLine||c.isPoints){ if(show)c.layers.enable(0); else c.layers.disable(0); c.layers.enable(3); } }); };
const OUT=window.OUT={L:[],open:true,world:true,up:true,add(o,k='open'){ OUT.L.push({o,k}); SEEN(o,OUT[k]); return o; },
  tick(){ const up=LVL!=='down', ins=typeof ROOMS!=='undefined'&&!!ROOMS.cur, open=up&&!ins, world=up&&(FREE||!ins); OUT.up=up; if(open===OUT.open&&world===OUT.world)return;
    OUT.open=open; OUT.world=world; for(const e of OUT.L)SEEN(e.o,OUT[e.k]); }};
const FREE=QS.get('free')!=='0';
const SOL={up:[],down:[]}, FIX={up:[],down:[]}, CLIPX=[];
let solids=SOL.up, fixed=FIX.up, BOUND, groundY, LVL='up', BOD, BODB, METRO;
const STORE={rooms:[],places:[],roofs:[]}, BF={list:[]}; window.STORE=STORE;
const MAPG={}, MODS={}; let MAPBAKE=0; const OVERHEAD=[]; let RPASS=null, FIRE=null;
const grab=async(name,fn)=>{ const n0=scene.children.length; await fn(); const g=new THREE.Group(); g.name=name; for(const o of scene.children.slice(n0))g.add(o); scene.add(g); MAPG[name]=g; return g; };
const LAYOUT0={bodega:{x:36.4},diner:{x:-24.75},ghost:{x:15.85},house:{x:67.56},subway:{x:36.99},apartments:{x:59},park:{e:[-4,0,0,0]},castle:{x:-70,y:25.5+14}};
const AWAY0=['diner','aquarium','garden','avenue','keep','civic','power'], AWAYLOT=1000;
const AWAY=(()=>{ const s=new Set(AWAY0), q=QS.get('bring'); if(q==='all')s.clear(); else if(q)for(const k of q.split(','))s.delete(k.trim()); return s; })(); window.AWAY=AWAY;
const LAY=(()=>{ const q=QS.get('layout'); let o={}; try{ o=q&&q[0]==='{'?JSON.parse(q):q==='0'?{}:JSON.parse(SAVE.get('layout')||'{}')||{}; }catch(e){}
  const L=Object.assign({},LAYOUT0,o); return {L, o:k=>({x:(+(L[k]&&L[k].x)||0)+(k==='apartments'?AWAYLOT:0),y:+(L[k]&&L[k].y)||0}), e:k=>(L[k]&&L[k].e||[0,0,0,0]).map(v=>+v||0), h:k=>+(L[k]&&L[k].h)||0, s:k=>+(L[k]&&L[k].s)||1}; })();
const STN={DX:(-11+LAY.o('subway').x)*TILE, DZ:(-35+LAY.o('subway').y)*TILE, DY:-98*ZU};
const BLDK=1.1;
const MAINX={w:70,e:70}, WID=14, NORTHY=9+WID, NORTHX=36;
const AVE={x0:152+MAINX.e,x1:166.5+MAINX.e+WID,y1:57.5}; AVE.r0=AVE.x0+3.2; AVE.r1=AVE.x1-3.2;
const BLOCK={back:-92.4,alley:[-99.4,-92.4],row2:[-111.4,-99.4],prom:[-119,-111.4],river:-165,x0:-50,x1:212,lots:{play:[46.7,60.7],theatre:[172.9,186.9],arcade:[191.9,205.9]}};
const MAINROW=[[-50,-39],[-18.3,10.3],[46.7,60.7],[97,101],[104,112.8],[115.8,144.4],[149.4,167.9],[172.9,186.9],[191.9,205.9]];
const WROW={bar:{x0:-38.91,x1:-28.91},mus:{x0:-10.09,y0:-101,x1:15.91,y1:-80,h:210}};
const RING={wx0:31.5-MAINX.w-WID,wx1:46-MAINX.w,ny0:12.5+NORTHY+NORTHX,ny1:27+NORTHY+WID+NORTHX}; RING.wr0=RING.wx0+3.2; RING.wr1=RING.wx1-3.2; RING.nr0=RING.ny0+3.2; RING.nr1=RING.ny1-3.2;
{ const x0=(RING.wr0+RING.wr1)/2+2.7, raw=((50-MAINX.w)+AVE.x0)/2+9; RING.mine={x:x0+(Math.floor((raw-x0)/2.5)+.5)*2.5}; } AVE.y1=RING.ny1; AVE.ey1=RING.ny1+11.5; RING.stairs=[{x0:RING.wx0+.6,x1:RING.wx0+2.6,y0:-2,y1:4,steps:12,depth:98,dir:-1,leg:'w'},{x0:AVE.r1+.6,x1:AVE.r1+2.6,y0:-2.4,y1:3.6,steps:12,depth:98,dir:-1,leg:'e'}]; RING.river={y0:BLOCK.river,y1:BLOCK.river+46}; RING.ff={x0:RING.wx0-1.5,x1:AVE.x1+25.5,y0:RING.river.y0-1.5,y1:40.5+NORTHY+NORTHX};
RING.bank={x0:-102.5,rx:-96,y0:6.7,r0:17,r1:37,y1:44,ys:-10.9,yn:56,bx1:-73.9};
const MAPSTAIR={x0:60.01,x1:64.01,y0:-82.9,y1:-76.9, steps:12, depth:98, dir:-1};
{ const o=LAY.o('subway'); MAPSTAIR.x0+=o.x; MAPSTAIR.x1+=o.x; MAPSTAIR.y0+=o.y; MAPSTAIR.y1+=o.y; }
const CASTLE={b:[46,67,-21,-4],gate:58.5,stair:{x0:61.5,x1:63.5,y0:-19.4,y1:-13.4,steps:12,depth:98,dir:1},hall:{x0:51,y0:-20,x1:65,y1:-6.8,h:130}};
{ const o=LAY.o('castle'), C=CASTLE, S=C.stair, H=C.hall; C.b=[C.b[0]+o.x,C.b[1]+o.x,C.b[2]+o.y,C.b[3]+o.y]; C.gate+=o.x; for(const R of [S,H]){ R.x0+=o.x; R.x1+=o.x; R.y0+=o.y; R.y1+=o.y; } }
