// RAMEN: the ramen cart at the Market St and West St corner, park side (data/world.json ramen; a baked copy of RAMEN's own cart, data/ramencart.json, tools/ramen-cart.cjs), and RAMEN's door: double-click it (or GO TO it from the map) and you leave THE MARKET for RAMEN's own page as a guest (/holo?g=ramen&as=guest, src/sushi/guest.js), where that same corner is the street; the cart, its cook, the customers and everyone passing are the same on every page; you are there as your own figure (sent with you: its mesh, and its standing, walking and sitting posed here by your rig), and come back here beside the cart, what you paid for your bowls taken from your money
import {SHARED, THREE} from './003-shx.js';
import {INV, LITE, ONLINE, pos, UI, WHERE} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {scene} from './004-main.js';
import {FIX, LEVEL, MAPG, MODS, SOL, STORE, SYS, TILE} from './006-map-pre.js';
import {FACADES} from './038zc-facades.js';
import {BODIES} from './111a-bodies.js';
{ const MW=TILE/.84, START=[1.4,-3.2], CART=SYS.far(__LAZY__("data/ramencart.json"));
  // where the cart stands (the level file), and its frame in THE MARKET's world: the cart's own metres, x east and z north as the section's, so a place in RAMEN is the same place here
  const spot=()=>{ const t=LEVEL.ramen||{x:-18,y:-41.3}; return [SHARED.BOD.XS(t.x),SHARED.BOD.ZS(t.y)]; };
  const frame=()=>{ const o=spot(); return [+o[0].toFixed(2),+o[1].toFixed(2),+MW.toFixed(4),0,0,+MW.toFixed(4)]; };
  const b64=a=>{ const u=new Uint8Array(a.buffer,a.byteOffset,a.byteLength); let s=''; for(let i=0;i<u.length;i+=0x8000)s+=String.fromCharCode.apply(null,u.subarray(i,i+0x8000)); return btoa(s); };
  const r4=v=>Math.round(v*1e4)/1e4, r1=v=>Math.round(v*10)/10, m12=e=>[r4(e[0]),r4(e[1]),r4(e[2]),r4(e[4]),r4(e[5]),r4(e[6]),r4(e[8]),r4(e[9]),r4(e[10]),r1(e[12]),r1(e[13]),r1(e[14])];
  // your figure as the others draw it (ONLINE.self): its points, colours and bones, in metres
  const pack=()=>{ '@later'; const S=ONLINE.self&&ONLINE.self(); if(!S)return null; const G0=S.me.geometry, P=G0.attributes.position, C=G0.attributes.color||G0.attributes.c1, n=P.count, lo=[1e9,1e9,1e9], hi=[-1e9,-1e9,-1e9];
    for(let i=0;i<n;i++)for(let a=0;a<3;a++){ const v=P.array[i*3+a]; if(v<lo[a])lo[a]=v; if(v>hi[a])hi[a]=v; }
    const q=new Uint16Array(n*3), c=new Uint8Array(n*3); for(let i=0;i<n;i++)for(let a=0;a<3;a++){ q[i*3+a]=Math.round((P.array[i*3+a]-lo[a])/Math.max(1e-6,hi[a]-lo[a])*65535); c[i*3+a]=C?Math.max(0,Math.min(255,Math.round(C.array[i*3+a]*255))):200; }
    const B=S.kind==='w'?Uint8Array.from(G0.attributes.pidx.array,v=>Math.round(v)):(()=>{ const bi=G0.attributes.bi.array, bw=G0.attributes.bw.array, o=new Uint8Array(n*3); for(let i=0;i<n;i++){ o[i*3]=Math.round(bi[i*2]); o[i*3+1]=Math.round(bi[i*2+1]); o[i*3+2]=Math.round(bw[i]*255); } return o; })();
    const ix=G0.index?(n<65536?Uint16Array.from(G0.index.array):null):null;
    const Dj=JSON.stringify({kind:S.kind,np:S.PM.value.length,n,lo,hi,mi:1,s:S.scale.map(v=>v/MW),p:b64(q),c:b64(c),b:b64(B),...(ix?{i:b64(ix)}:{})});
    return {k:S.k+':'+Dj.length,D:Dj}; };
  // its standing, its walk in eight steps and its sitting on a stool, posed by your own rig (12 numbers a bone)
  const clips=()=>{ '@later'; const S=ONLINE.self&&ONLINE.self(); if(!S)return null; const one=(B,st)=>{ if(S.kind==='b')BODIES.pose(B,S.PM,S.body,st||null); else S.PCS.forEach((pc,i)=>S.FM.set(i,RIG.frameOf(pc.on||pc.n,B))); const m=[]; for(const X of S.PM.value)m.push(...m12(X.elements)); return m; };
    const st=RIG.create(); st.sit={z:Math.max(2,.62/(S.scale[1]/MW))};
    return {stand:one(RIG.frameAt('stand',0)),walk:[0,1,2,3,4,5,6,7].map(f=>one(RIG.frameAt('walk',f))),sit:one(RIG.pose(st,true),st)}; };
  // what goes with you: who you are and your figure, the alley's frame, where the cook stands, your money; and you are saved standing at the alley's mouth, where THE MARKET starts you again
  const card=()=>{ const f=frame(), at=[+(f[0]+f[2]*START[0]+f[4]*START[1]).toFixed(2),+(f[1]+f[3]*START[0]+f[5]*START[1]).toFixed(2),0,0,'up','alley'];
    let fig=null, cl=null; try{ fig=pack(); cl=clips(); }catch(e){ console.warn('RAMEN: your figure',e); }
    return {at,yatai:{f,w:[f[0],+(f[1]+.45*MW).toFixed(2),0,+Math.PI.toFixed(2),'up','alley'],fig,clips:cl,cash:INV.money(),paid:0}}; };
  const mouth=()=>{ const f=frame(); return [f[0]+f[2]*START[0],f[1]+f[5]*START[1]]; };   // where you stand when you come back: on the pavement before the stools
  const go=async()=>{ await LOAD('later'); const C=card(), m=mouth(); pos.x=m[0]; pos.z=m[1]; SHARED.py=0; SHARED.floor='up'; if(WHERE.save)WHERE.save(true); STORE.holo.go({name:'RAMEN',page:'/holo?g=ramen&as=guest',card:C}); };
  const P=STORE.places.find(p=>p[0]==='RAMEN'); if(P)P[6]=go;
  // back from the alley: what you paid for your bowls there comes out of your money, once
  const settle=()=>{ let h=null; try{ h=JSON.parse(sessionStorage.getItem('holo')||'null'); }catch(e){} const y=h&&h.yatai; if(!y||!(y.paid>0)||y.settled)return; setTimeout(()=>{ const n=Math.min(Math.round(y.paid),INV.money()); if(n>0)INV.pay(n); if(INV.save)INV.save(); y.settled=1; try{ sessionStorage.setItem('holo',JSON.stringify(h)); }catch(e){} SAY('YOU PAID $'+n+' AT THE RAMEN CART.','#ffb070'); },1500); }; SYS.onStart(settle,'146bg-yatai paid');
  // the cart itself: one mesh (its colours and what shines at night baked into its points, its signs on one picture), solid, lit after dark, the door to RAMEN
  const build=async()=>{ const D=await CART(); if(!D||!D.p||MODS.yatai.cart)return; const b=k=>{ const s=atob(D[k]), u=new Uint8Array(s.length); for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i); return u; };
    const n=D.n, q=new Uint16Array(b('p').buffer), P=new Float32Array(n*3); for(let i=0;i<n*3;i++){ const a=i%3; P[i]=D.lo[a]+q[i]/65535*(D.hi[a]-D.lo[a]); }
    const c8=b('c'), C=new Float32Array(n*3), Gl=new Float32Array(n), col=new THREE.Color(); for(let i=0;i<n;i++){ col.setRGB(c8[i*4]/255,c8[i*4+1]/255,c8[i*4+2]/255,THREE.SRGBColorSpace); C[i*3]=col.r; C[i*3+1]=col.g; C[i*3+2]=col.b; Gl[i]=c8[i*4+3]/255; }
    const u16=new Uint16Array(b('u').buffer), U=new Float32Array(n*2); for(let i=0;i<n*2;i++)U[i]=u16[i]/65535;
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(P,3)); g.setAttribute('color',new THREE.BufferAttribute(C,3)); g.setAttribute('uv',new THREE.BufferAttribute(U,2)); g.setAttribute('aGlow',new THREE.BufferAttribute(Gl,1)); g.setIndex(new THREE.BufferAttribute(D.i32?new Uint32Array(b('i').buffer):new Uint16Array(b('i').buffer),1)); g.computeVertexNormals();
    const tx=await new Promise(r=>new THREE.TextureLoader().load(D.atlas,r,undefined,()=>r(null))); if(tx){ tx.colorSpace=THREE.SRGBColorSpace; tx.magFilter=THREE.NearestFilter; }
    const m=new THREE.MeshLambertMaterial({map:tx,vertexColors:true,side:THREE.DoubleSide}); m.onBeforeCompile=sh=>{ sh.uniforms.uNight=FACADES.night; sh.vertexShader='attribute float aGlow; varying float vGlow;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n vGlow=aGlow;'); sh.fragmentShader='uniform float uNight; varying float vGlow;\n'+sh.fragmentShader.replace('#include <opaque_fragment>','outgoingLight+=diffuseColor.rgb*vGlow*(.25+uNight*1.5);\n#include <opaque_fragment>'); }; m.customProgramCacheKey=()=>'ramencart';
    const o=spot(), y=SHARED.groundY?SHARED.groundY(o[0],o[1]):0, me=new THREE.Mesh(g,m); me.scale.setScalar(MW); me.position.set(o[0],y,o[1]); me.castShadow=me.receiveShadow=true; me.name='ramen cart'; (MAPG.bodega||MAPG.street||scene).add(me);
    const hb=new THREE.Mesh(new THREE.BoxGeometry(3.9*MW,2.6*MW,3.4*MW),new THREE.MeshBasicMaterial({visible:false})); hb.position.set(o[0],y+1.3*MW,o[1]+.3*MW); scene.add(hb);
    SOL.up.push([o[0]-1.95*MW,o[1]-1.4*MW,o[0]+1.95*MW,o[1]+2.3*MW]); FIX.up.push([o[0]-1.95*MW,o[1]-1.4*MW,y,o[0]+1.95*MW,o[1]+2.3*MW,y+2.8*MW]);
    UI.thing({name:'RAMEN',obj:hb,reach:2.6*TILE,near:5*TILE,tall:2.8*MW,act:()=>go()});
    // its lamp over the counter and its lantern's glow, after dark
    const lamps=[[0,2.15,-.35,0xffb060,34,8],[0,1.95,-1.9,0xff8a50,16,6]].map(([x,h,z,c,i,d])=>{ const L=new THREE.PointLight(c,0,d*MW,1.6); L.position.set(o[0]+x*MW,y+h*MW,o[1]+z*MW); L.userData.both=true; L.userData.i1=i; LITE.recs.push(L); return L; });
    SYS.every(()=>{ const k=FACADES.night.value; for(const L of lamps)L.intensity=k>.05?L.userData.i1*k:0; },500,'146bg-cart lamps');
    MODS.yatai.cart={me,tris:D.tris,at:o}; };
  MODS.yatai={go,card,pack,clips,frame,mouth,settle,spot,cart:null}; build().catch(e=>console.warn('RAMEN: the cart',e)); }
