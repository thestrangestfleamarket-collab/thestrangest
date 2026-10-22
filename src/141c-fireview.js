// THE FIRE ESCAPE VIEW: your landing on the apartment house's fire escape, with the landings above and below, built off the map from the house's own facade and landings; the camera is held on it.
import {SHARED, THREE} from './003-shx.js';
import {CLOCK, FAR3, pos, ROOMS, SKY, UI} from './003b-systems.js';
import {renderer, scene} from './004-main.js';
import {BLDK, FADE, MISTE, MODS, STORE, SYS, TILE} from './006-map-pre.js';
import {BATCH} from './008-batch.js';
{ const APTS=MODS.apts, F=window.FIREV, T=TILE, KK=BLDK, {X,Z}=SHARED.BOD, Y=SHARED.BOD.Y, {CX,WY,HZ,S}=F, A=APTS.A, FE=APTS.ESC[0], DU=APTS.DU, DO=APTS.DO, LV=F.lv;
  const ix=x=>x/(T*KK)+SHARED.BOD.OX, iy=z=>z/(T*KK)+SHARED.BOD.OY, cl=v=>Math.max(0,Math.min(1,v)), nk=()=>cl((4-CLOCK.elev())/8);
  const du=CX-(A.x0+A.x1)/2, U=u=>A.x0+u+du, L0=U(FE.ua), L1=U(FE.ub), DX=U(DU);
  const onL=(x,z)=>{ const u=ix(x), v=iy(z); return u>L0-.3&&u<L1+.3&&v>WY-.4&&v<WY+DO+.4; };
  const G=new THREE.Group(); G.visible=false; scene.add(G); let light=null, busy=false, HOLD=null;
  F.on=false; F.G=G;
  const fade=async(txt,fn)=>{ busy=true; await FADE.run(txt,fn,{hold:200}); busy=false; };
  F.out=()=>{ if(busy)return; fade(F.built?'YOUR FIRE ESCAPE':'LOADING YOUR FIRE ESCAPE...',async()=>{ await STORE.offGo(F.name); UI.goTo(X(DX),Z(WY+.9),Y(HZ)); SHARED.heading=0; if(UI.persp&&window.__dbg)__dbg.face(Math.PI); }); };
  F.back=()=>{ if(busy)return; fade('YOUR APARTMENT',async()=>{ await ROOMS.goIn('apt',[X(APTS.fw[0]),Z(APTS.fw[1]+.9),0,0]); SHARED.heading=0; }); };
  const hit=(w,h,d,x,y,z)=>{ const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshBasicMaterial({visible:false})); m.position.set(x,y,z); scene.add(m); return m; };
  let plaque=null; APTS.furnish(APTS.my,()=>{ UI.thing({name:'YOUR FIRE ESCAPE',ghost:1,obj:hit(1.1*T*KK,SHARED.BOD.Y(52),.3*T,X(APTS.fw[0]),SHARED.BOD.Y(68),Z(APTS.fw[1]+.2)),reach:1.4*T,near:2.6*T,tall:1.4*T,act:()=>{ if(APTS.in)F.out(); }});
  const F3={Y:'101101010010010',O:'111101101101111',U:'101101101101111',R:'110101110101101',A:'010101111101101',P:'110101110100100',T:'111010010010010',M:'101111101101101',E:'111100110100111',N:'110101101101101'};
  plaque=(()=>{ const txt='YOUR APARTMENT', W=61, H=9, cv=document.createElement('canvas'); cv.width=W; cv.height=H; const g=cv.getContext('2d'); g.fillStyle='#7a5a24'; g.fillRect(0,0,W,H); g.fillStyle='#c8a050'; g.fillRect(1,1,W-2,H-2);
    let x=3; g.fillStyle='#2a1e10'; for(const ch of txt){ const q=F3[ch]; if(q)for(let r=0;r<5;r++)for(let c=0;c<3;c++)if(q[r*3+c]==='1')g.fillRect(x+c,2+r,1,1); x+=ch===' '?2:4; }
    const t=new THREE.CanvasTexture(cv); t.magFilter=t.minFilter=THREE.NearestFilter; t.generateMipmaps=false; t.colorSpace=THREE.SRGBColorSpace;
    const m=new THREE.Mesh(new THREE.PlaneGeometry(W/24*T*KK,SHARED.BOD.Y(H)),new THREE.MeshLambertMaterial({map:t})); m.position.set(X(APTS.door[0]),SHARED.BOD.Y(104),Z(APTS.door[1]-.04)); scene.add(m); return m; })(); });
  const z0=APTS.RZ+S;
  F.build=()=>{ '@fire'; if(F.built)return; const keep=BATCH.items.splice(0), km=BATCH.meshes, kc=BATCH.cast; BATCH.meshes={}; BATCH.cast=true; BATCH.tag=null;
    BLOCKS.make({x0:A.x0,x1:A.x1,y0:A.y0,y1:A.y1,z0:HZ-3*S,z1:HZ+4*S,kind:'A',paint:(sd,a,z,f)=>APTS.paint(sd,a,z0+((z-z0)%(3*S)+3*S)%(3*S),f)});
    APTS.escape(FE,[LV-3,LV-2,LV-1,LV,LV+1,LV+2,LV+3],-3*S,(LV+4)*S);
    BATCH.build(APTS.MKA); BATCH.cast=kc; for(const me of Object.values(BATCH.meshes||{})){ me.castShadow=me.receiveShadow=true; G.add(me); } BATCH.meshes=km; BATCH.items=keep;
    G.position.set(X(du)-X(0),0,Z(WY-A.y1)-Z(0));
    const sol=STORE.kit.sol, V=d=>WY+d, H=HZ+33;
    sol(L0-1,WY-.3,L1+1,WY,HZ+120); sol(L0-.12,V(DO-.06),L1+.12,V(DO+.06),H); sol(L0-.12,WY,L0+.04,V(DO),H); sol(L1-.04,WY,L1+.12,V(DO),H); sol(U(FE.lx)-.45,V(APTS.DI),U(FE.lx)+.45,V(DO),H);
    light=new THREE.PointLight(0xffc890,0,7*T,1.6); light.position.set(X(DX),Y(HZ+70),Z(WY+.4)); scene.add(light);
    UI.thing({name:'BACK INSIDE',ghost:1,obj:hit(1.2*T*KK,Y(94),.4*T,X(DX),Y(HZ+47),Z(WY+.15)),reach:1.4*T,near:2.6*T,tall:2.2*T,act:()=>F.back()});
    const pl=STORE.places.find(q=>q[0]===F.name); if(pl){ pl[1]=X(DX); pl[2]=Z(WY+.9); pl[3]=Y(HZ); }
    F.built=true; };
  const sg0=STORE.stackGround; STORE.stackGround=(x,z)=>F.built&&onL(x,z)?Y(HZ):sg0?sg0(x,z):null;
  SYS.add('places',()=>{ const on=F.built&&SHARED.LVL==='up'&&onL(pos.x,pos.z);
    if(on!==F.on){ F.on=on; G.visible=on; if(on)UI.hold=HOLD={yaw:F.yaw,pitch:Math.PI/6,ppu:SHARED.ppu,look:.2,off:new THREE.Vector3(Math.cos(F.yaw),0,-Math.sin(F.yaw)).multiplyScalar(F.shift*T*KK)}; else if(UI.hold===HOLD)UI.hold=null; }
    if(!on){ if(light)light.intensity=0; return; }
    HOLD.ppu=renderer.domElement.clientHeight/((Y(F.span*S)-Y(0))*Math.cos(HOLD.pitch));
    if(FAR3.mesh)FAR3.mesh.visible=false; if(FAR3.panels)FAR3.panels.visible=false; if(FAR3.trees)FAR3.trees.visible=false; if(FAR3.FU)FAR3.FU.uMK.value=0; MISTE.x=0; if(SKY.U.uMistK)SKY.U.uMistK.value=0; if(scene.fog===FAR3.fog)scene.fog=null;
    light.intensity=2.4*nk(); },'141c-fireview');
  window.FIREDBG=()=>({built:F.built,on:F.on,meshes:G.children.length,hold:!!HOLD&&UI.hold===HOLD,pos:[+ix(pos.x).toFixed(2),+iy(pos.z).toFixed(2)],py:+SHARED.py.toFixed(2),apt:{in:APTS.in,floor:APTS.floor()}});
}
