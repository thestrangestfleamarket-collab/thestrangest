// THE FIRE ESCAPE VIEW: your landing on the apartment house's fire escape, with the landings above and below, built from the house's own facade and landings round your apartment (one place, off the map): its door opens and you walk out.
import {SHARED, THREE} from './003-shx.js';
import {CLOCK, CULL, FAR3, GPH, pos, ROOMS, SFX, SKY, UI, VR, WINDOWS} from './003b-systems.js';
import {renderer, scene} from './004-main.js';
import {BLDK, FADE, MISTE, MODS, STORE, SYS, TILE} from './006-map-pre.js';
import {BATCH, PEEK} from './008-batch.js';
import {BLOCKS} from './038zb-blocks.js';
{ const APTS=MODS.apts, F=window.FIREV, T=TILE, KK=BLDK, {X,Z}=SHARED.BOD, Y=SHARED.BOD.Y, {HZ,S}=F, A=APTS.AL, FE=APTS.ESC[0], DU=APTS.DU, DO=APTS.DO, LV=F.lv;
  const ix=x=>x/(T*KK)+SHARED.BOD.OX, iy=z=>z/(T*KK)+SHARED.BOD.OY, cl=v=>Math.max(0,Math.min(1,v)), nk=()=>cl((4-CLOCK.elev())/8);
  const AR=APTS.R, IN=APTS.IN||AR, FY=AR.y0-.24/.907-.006, U=u=>AR.x1-u, V=d=>FY-d, L0=U(FE.ub), L1=U(FE.ua), DX=U(DU);   // the house turned half round your rooms: its front face on their fire-escape wall, your landing level with their floor
  const onL=(x,z)=>{ const u=ix(x), v=iy(z); return u>L0-.3&&u<L1+.3&&v<FY+.4&&v>V(DO+.4); }, outL=(x,z)=>onL(x,z)&&iy(z)<AR.y0-.13; F.onL=onL;
  const sol2=(u0,d0,u1,d1,h)=>STORE.kit.sol(Math.min(U(u0),U(u1)),Math.min(V(d0),V(d1)),Math.max(U(u0),U(u1)),Math.max(V(d0),V(d1)),h);
  const G=new THREE.Group(); G.visible=false; G.userData.mergeStatic=true; scene.add(G); let light=null;
  F.on=false; F.G=G;
  F.spot=d=>({x:X(DX),y:Y(HZ),z:Z(V(d))});
  F.out=()=>APTS.enterReal([X(DX),Z(V(.9)),Y(HZ),Math.PI]);
  F.back=()=>APTS.enterReal();
  const hit=(w,h,d,x,y,z)=>{ const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshBasicMaterial({visible:false})); m.position.set(x,y,z); scene.add(m); return m; };
  let plaque=null; APTS.furnish(APTS.my,()=>{ '@later'; UI.thing({name:'FIRE ESCAPE DOOR',ghost:1,obj:hit(1.1*T*KK,Y(78)-Y(0),1.6*T,X(APTS.fw[0]),Y(HZ+40),Z(APTS.fw[1]-.15)),reach:1.9*T,near:2.6*T,tall:2*T,act:()=>{ const D=APTS.escDoor; if(!APTS.in||!D)return; D.set(!D.open); const at=new THREE.Vector3(X(APTS.fw[0]),Y(HZ+40),Z(APTS.fw[1])); if(D.open)SFX.play('latch',{at,vol:.8}); else SFX.play('door',{at,vol:.35,pitch:1.6,delay:.25}); }});
  const F3={Y:'101101010010010',O:'111101101101111',U:'101101101101111',R:'110101110101101',A:'010101111101101',P:'110101110100100',T:'111010010010010',M:'101111101101101',E:'111100110100111',N:'110101101101101','0':'111101101101111','1':'010110010010111','2':'111001111100111','3':'111001111001111','4':'101101111001001','5':'111100111001111','6':'111100111101111','7':'111001010010010','8':'111101111101111','9':'111101111001111'};
  { const W=61, H=9, cv=document.createElement('canvas'); cv.width=W; cv.height=H; const g=cv.getContext('2d');
    const t=new THREE.CanvasTexture(cv); t.magFilter=t.minFilter=THREE.NearestFilter; t.generateMipmaps=false; t.colorSpace=THREE.SRGBColorSpace;
    const paint=()=>{ const txt=APTS.num?'APT '+APTS.num:'YOUR APARTMENT'; g.fillStyle='#7a5a24'; g.fillRect(0,0,W,H); g.fillStyle='#c8a050'; g.fillRect(1,1,W-2,H-2);
      let tw=0; for(const ch of txt)tw+=ch===' '?2:4; let x=Math.max(3,Math.round((W-tw)/2)); g.fillStyle='#2a1e10';
      for(const ch of txt){ const q=F3[ch]; if(q)for(let r=0;r<5;r++)for(let c=0;c<3;c++)if(q[r*3+c]==='1')g.fillRect(x+c,2+r,1,1); x+=ch===' '?2:4; } t.needsUpdate=true; };
    paint(); F.setPlaque=paint;
    plaque=new THREE.Mesh(new THREE.PlaneGeometry(W/24*T*KK,SHARED.BOD.Y(H)),new THREE.MeshLambertMaterial({map:t,clippingPlanes:APTS.WPL?[APTS.WPL.Wb]:[]})); plaque.position.set(X(APTS.door[0]),Y(HZ+104),Z(APTS.door[1]-.04)); scene.add(plaque); } });
  const z0=APTS.RZ+S;
  F.build=()=>{ '@fire'; if(F.built)return; const keep=BATCH.items.splice(0), km=BATCH.meshes, kc=BATCH.cast; BATCH.meshes={}; BATCH.cast=true; BATCH.tag=null;
    const WN=APTS.WIN, near=(a,c,r=.55)=>Math.abs(a-c)<r, inW=h=>h>WN.WZ[0]&&h<WN.WZ[1], hole=(sd,a,z)=>{ const h=z-HZ; if(h<0||h>S||sd==='b')return false; if(sd==='f')return near(a,A.x0+DU)&&h<75||APTS.FWU.some(u=>near(a,A.x0+u,WN.WHW)&&inW(h)); return WN.SIDE.some(k=>near(a,APTS.sideAt(k),WN.WHW)&&inW(h)); };   // your floor: open where your rooms' windows and doors are (both doors, the side windows too), so you see in
    const bm=BATCH.meshes, HB={x0:A.x0-AR.y0+FY,x1:A.x1+AR.y0-FY,y0:A.y0-2*(AR.y0-FY),y1:A.y1}; BLOCKS.make({...HB,z0:0,z1:Math.min(HZ+3*S,APTS.TOP),kind:'A',roof:(x,y)=>{ const r=((Math.sin(Math.floor(x*4)*12.99+Math.floor(y*4)*78.23)*43758.5)%1+1)%1, e=Math.min(x-HB.x0,HB.x1-x,y-HB.y0,HB.y1-y); return e<.25?[118,50,38]:r<.3?[50,50,52]:r>.7?[66,64,62]:[58,57,57]; },paint:(sd,a,z,f)=>hole(sd,a,z)?null:APTS.paint(sd,a,z0+((z-z0)%(3*S)+3*S)%(3*S),f)});   // the whole building, street to roof, so you see it run all the way up and down past the landing
    BATCH.build(APTS.MKA); const house=new Set(Object.values(bm)); BATCH.meshes={};
    APTS.escape(FE,Array.from({length:Math.min(LV+2,APTS.ST-1)},(_,i)=>i+1),-APTS.RZ,(LV+3)*S);
    BATCH.build(APTS.MKA); for(const me of house){ me.castShadow=me.receiveShadow=true; G.add(me); } BATCH.cast=kc; for(const me of Object.values(BATCH.meshes||{})){ me.castShadow=me.receiveShadow=true; G.add(me); } BATCH.meshes=km; BATCH.items=keep;
    G.rotation.y=Math.PI; G.position.set(X(AR.x1)+X(A.x0),0,Z(FY)+Z(A.y1)); G.updateMatrix(); G.updateMatrixWorld(true);
    // the pots and plants are real: on your landing each one a thing you can pick up, push or knock off; the landings above and below keep theirs in place
    const LW=T*KK, YH=h=>Y(h)-Y(0); F.loose=[]; F.pots=[];
    for(const sp of APTS.escPlants||[]){ const lvP=Math.floor((sp.z-APTS.RZ+6)/S), o=APTS.plant3D(sp.kind,sp.seed,sp.w*LW,YH(sp.h)); o.rotation.y=(sp.seed*2.39)%6.28; o.position.set(X(sp.x),Y(sp.z),Z(sp.y));
      if(lvP===LV&&sp.kind!=='hang'&&GPH.add){ o.position.applyMatrix4(G.matrix); o.rotation.y+=Math.PI; o.traverse(q=>{ if(q.isMesh)q.material=q.material.clone(); }); scene.add(o); F.pots.push({o,on:false}); F.loose.push(GPH.add(o,{name:APTS.plantName[sp.kind]||'PLANT',m:{pot:3,flower:2,fern:3,tall:6,box:8}[sp.kind]||3})); } else G.add(o); }
    // the windows and doors onto the landings are real: a deep painted frame, a stone head, sashes of real glass that catch the light, a panelled door with glass and a brass knob (the stone sills, deep enough to set things on, are the house's own)
    { const Mm=LW/.907, mm=v=>v*Mm, MT={}, mt=(k,c,o={})=>MT[k]||(MT[k]=new THREE.MeshLambertMaterial({color:new THREE.Color('rgb('+c.join(',')+')'),...(o.x||{})}));   // cel: flat steps of light
      const trim=mt('trim',[226,218,200]), wfr=mt('wframe',[24,24,26]), stoneM=mt('stone',[158,146,130]), wood=mt('door',[92,52,34],{sh:30,sp:0x333333}), brass=mt('brass',[200,160,80],{sh:80,sp:0xffeebb});
      const glass=APTS.glassMat();
      const bx=(g,w,h,d,m,x,y,z)=>{ const me=new THREE.Mesh(new THREE.BoxGeometry(mm(w),mm(h),mm(d)),m); me.position.set(mm(x),mm(y),mm(z)); me.castShadow=me.receiveShadow=true; g.add(me); return me; };
      const pane=(g,w,h,x,y,z)=>{ const me=new THREE.Mesh(new THREE.PlaneGeometry(mm(w),mm(h)),glass); me.position.set(mm(x),mm(y),mm(z)); g.add(me); };
      const window3D=(w,h,bare)=>{ const g=new THREE.Group(), cw=.1, cd=.16;
        for(const sx of [-1,1])bx(g,cw,h+.06,cd,wfr,sx*(w/2+cw/2),h/2,cd/2); bx(g,w+2*cw,.12,cd,wfr,0,h+.06,cd/2);   // the casing, standing proud of the brick
        bx(g,w+2*cw+.12,.18,.12,stoneM,0,h+.21,.06); for(const sx of [-1,1])bx(g,.04,h,.06,wfr,sx*(w/2-.02),h/2,.03);   // the stone head; the reveal
        if(bare)return g;   // your floor: the casing only, the sash and glass are your rooms' own (they open)
        const s0=.03, mid=h*.52;   // two sashes, the lower in front of the upper, each a frame of bars round its glass
        for(const [y0,y1,z] of [[s0,mid+.02,.075],[mid-.02,h-.02,.045]]){ const sh=y1-y0, cy=(y0+y1)/2; for(const sx of [-1,1])bx(g,.05,sh,.04,wfr,sx*(w/2-.045),cy,z); bx(g,w-.04,.05,.04,wfr,0,y0+.025,z); bx(g,w-.04,.05,.04,wfr,0,y1-.025,z);
          bx(g,.025,sh-.08,.025,wfr,0,cy,z); if(y0>s0)bx(g,w-.1,.025,.025,wfr,0,cy,z); pane(g,w-.12,sh-.09,0,cy,z-.005); }
        return g; };
      const door3D=(w,h)=>{ const g=new THREE.Group(), cw=.11, cd=.18;
        for(const sx of [-1,1])bx(g,cw,h+.08,cd,trim,sx*(w/2+cw/2),h/2+.04,cd/2); bx(g,w+2*cw,.14,cd,trim,0,h+.07,cd/2); bx(g,w+2*cw+.14,.16,.12,stoneM,0,h+.22,.06);
        bx(g,w+.2,.05,.24,stoneM,0,.025,.12);   // the threshold
        const lz=.05, L=new THREE.Group(); L.userData.noMerge=true; g.add(L);   // the leaf, set back in its frame: rails, stiles, two raised panels below, six panes above
        for(const sx of [-1,1])bx(L,.1,h,.05,wood,sx*(w/2-.05),h/2,lz); bx(L,w,.14,.05,wood,0,.07,lz); bx(L,w,.1,.05,wood,0,h*.42,lz); bx(L,w,.1,.05,wood,0,h-.05,lz);
        for(const sx of [-1,1])bx(L,w/2-.14,h*.42-.22,.07,mt('panel',[110,64,42],{sh:30}),sx*(w/4-.01),(h*.42+.07)/2+.02,lz);
        const g0=h*.42+.05, g1=h-.1; bx(L,.035,g1-g0,.04,wood,0,(g0+g1)/2,lz); bx(L,w-.2,.035,.04,wood,0,g0+(g1-g0)/3,lz); bx(L,w-.2,.035,.04,wood,0,g0+(g1-g0)*2/3,lz); pane(L,w-.2,g1-g0,0,(g0+g1)/2,lz-.01);
        const kb=new THREE.Mesh(new THREE.SphereGeometry(mm(.03),12,8),brass); kb.position.set(mm(w/2-.12),mm(1.0),mm(lz+.05)); L.add(kb); return g; };
      const ww=2*APTS.WIN.WHW*.907, wh=(APTS.WIN.WZ[1]-APTS.WIN.WZ[0])/32.4, dh=(94-3)/32.4, WZ0=APTS.WIN.WZ[0];
      for(let lv=1;lv<=Math.min(LV+2,APTS.ST-1);lv++){ const z=APTS.RZ+lv*S;
        for(const u of APTS.FWU){ const o=window3D(ww,wh,lv===LV); o.position.set(X(A.x0+u),Y(z+WZ0),Z(A.y1)); G.add(o); }
        if(lv>0&&lv!==LV){ const o=door3D(ww,dh); o.position.set(X(A.x0+DU),Y(z+3),Z(A.y1)); G.add(o); } }
      { const z=APTS.RZ+LV*S; for(const k of APTS.WIN.SIDE)for(const [x,r] of [[A.x1+AR.y0-FY,Math.PI/2],[A.x0-AR.y0+FY,-Math.PI/2]]){ const o=window3D(ww,wh,true); o.position.set(X(x),Y(z+WZ0),Z(APTS.sideAt(k))); o.rotation.y=r; G.add(o); } } }   // your floor's side windows, framed like the front ones; your own door is your rooms' (150a), and it opens
    // the sky round the house: a thick layer of white cumulus below the lowest landing, drifting very slowly (the sky's own clouds as meshes)
    { const cx=(A.x0+A.x1)/2, cy=(A.y0+A.y1)/2, hw=Math.hypot(A.x1-A.x0,A.y1-A.y0)/2+6, top=Y(HZ-S*2.4), C=[];   // clear of the house, so none cuts into it
      for(let i=0;i<72;i++){ const a=Math.random()*6.283, d=hw+4+Math.sqrt(Math.random())*66, W=LW*(8+Math.random()*7), y=top-W*(.8+Math.random()*.5);
        C.push({x:X(cx+Math.cos(a)*d),y,z:Z(cy+Math.sin(a)*d),W,s:1+Math.floor(Math.random()*997),a:Math.random()*6.283,v:(.02+Math.random()*.03)*T}); }
      F.cum=SKY.cumulus(C,SKY.lump(8,6),SKY.cumLive()); F.cum.userData.sky=1; const u=F.cum.material.uniforms; u.uSpan.value=LW*160; u.uCC.value.set(X(cx),Z(cy)); G.add(F.cum); SKY.cumOn=()=>G.visible; }
    const H=HZ+33;   // the wall behind the landing is your rooms' own (059a), with its door
    sol2(FE.ua-.12,DO-.16,FE.ub+.12,DO+.06,HZ+35); for(const u of APTS.FWU||[])sol2(u-APTS.WIN.WHW-.07,0,u+APTS.WIN.WHW+.07,.26,HZ+APTS.WIN.WZ[0]); sol2(FE.ua-.12,0,FE.ua+.04,DO,H); sol2(FE.ub-.04,0,FE.ub+.12,DO,H); sol2(FE.lx-.45,APTS.DI,FE.lx+.45,DO,H);
    light=new THREE.PointLight(0xffc890,0,7*T,1.6); light.position.set(X(DX),Y(HZ+70),Z(V(.4))); scene.add(light);
    const pl=STORE.places.find(q=>q[0]===F.name); if(pl){ pl[1]=X(DX); pl[2]=Z(V(.9)); pl[3]=Y(HZ); }
    // seen from your rooms in the isometric view: the house up to your ceiling (its real outside round your walls), the fire escapes up to your landing's rails (cut down with your front wall), nothing above
    G.traverse(o=>{ if(o.material&&!o.userData.sky)for(const m of [].concat(o.material)){ m.clippingPlanes=house.has(o)?[BOT]:[TOP,APTS.WPL.Wf]; m.needsUpdate=true; } });
    G.updateMatrixWorld(true); for(const me of house)PEEK.whole(me);   // the see-through circle shows you behind the house's brick from your rooms, as in every inside (owner, 28 Oct 2026: "only circle transparency")
    F.built=true; };
  const TOP=new THREE.Plane(new THREE.Vector3(0,-1,0),1e6), BOT=new THREE.Plane(new THREE.Vector3(0,-1,0),1e6), upV=new THREE.Vector3(), cd=new THREE.Vector3();
  const sg0=STORE.stackGround; STORE.stackGround=(x,z)=>F.built&&APTS.inReal&&onL(x,z)?Y(HZ):sg0?sg0(x,z):null;
  const WMAX=12*T, cb=new THREE.Box3(), BLUE=new THREE.Color(0x6a9fe0); let skyOff=false;
  UI.camKeeps.push((c,t)=>{ if(!F.built||!APTS.inReal)return; const m=.35*T;
    if(F.on){ const zl=Z(FY)-m; if(c.z<=zl)return; const ox=c.x-t.x, oz=zl-t.z, L=Math.hypot(ox,c.z-t.z); c.z=zl; if(L>Math.abs(oz))c.x=t.x+(ox<0?-1:1)*Math.sqrt(L*L-oz*oz); return; }   // on the landing: the camera swings along the wall, never into the house
    cb.min.set(Math.min(X(IN.x0),X(IN.x1))+m,-1e9,Math.min(Z(IN.y0),Z(IN.y1))+m); cb.max.set(Math.max(X(IN.x0),X(IN.x1))-m,Y(HZ+S)-m,Math.max(Z(IN.y0),Z(IN.y1))-m); if(cb.containsPoint(c))return;   // in your rooms: in front of the walls, under the ceiling
    let k=1; const L=c.distanceTo(t); for(const a of ['x','y','z']){ const d=c[a]-t[a]; if(c[a]>cb.max[a]&&d>1e-6)k=Math.min(k,(cb.max[a]-t[a])/d); if(c[a]<cb.min[a]&&d<-1e-6)k=Math.min(k,(cb.min[a]-t[a])/d); } k=Math.max(k,Math.min(1,.9*T/(L||1))); c.set(t.x+(c.x-t.x)*k,t.y+(c.y-t.y)*k,t.z+(c.z-t.z)*k); });
  SYS.add('places',()=>{ const home=F.built&&!!APTS.inReal, on=home&&SHARED.LVL==='up'&&outL(pos.x,pos.z);
    if(on!==F.on){ F.on=on; APTS.onEsc=on; if(!UI.persp)UI.isoTurn(on?Math.PI*3/4:-Math.PI/4); }   // through the door: the isometric view turns to look at the house from outside, or into your rooms
    UI.distMax=home?WMAX:null; if(home&&UI.dist>WMAX)UI.dist=WMAX;   // on your fire escape you can't zoom out past the landings round yours
    const iso=home&&!UI.persp; TOP.constant=iso?Y(on?HZ+3*S:HZ+45):1e6; BOT.constant=iso?Y(on?HZ+3*S:APTS.inHall&&APTS.inHall()?HZ+45:HZ+S-.1):1e6; G.visible=home;   // out on your landing the two floors above you show; inside, nothing above your floor
    if(home&&!UI.persp&&!UI.freeCam){ upV.setFromMatrixColumn(SHARED.cam.matrixWorld,1); const u=UI.off.dot(upV), lo=(Y(HZ-2.5*S)-SHARED.py)*upV.y; let hi=lo;
      for(const x of [IN.x0,IN.x1])for(const z of [IN.y0,IN.y1])hi=Math.max(hi,(X(x)-pos.x)*upV.x+(Y(HZ+(on?3:1)*S)-SHARED.py)*upV.y+(Z(z)-pos.z)*upV.z);
      const c=SHARED.cam; hi=Math.max(lo,hi-.85*(c.top-c.bottom)/2/(c.zoom||1)); const k=Math.max(lo,Math.min(hi,u)); if(k!==u)UI.off.addScaledVector(upV,k-u); }   // the view drags between the clouds' top and your ceiling's far corner at the top of the screen
    if(!home){ if(light)light.intensity=0; if(skyOff){ skyOff=false; if(SKY.dome)SKY.dome.visible=true; } return; }
    if(SKY.dome){ SKY.dome.visible=false; skyOff=true; } if(scene.background&&scene.background.isColor)scene.background.copy(BLUE);   // at home a plain blue sky
    if(FAR3.mesh)FAR3.mesh.visible=false; if(FAR3.panels)FAR3.panels.visible=false; if(FAR3.trees)FAR3.trees.visible=false; if(FAR3.FU)FAR3.FU.uMK.value=0; MISTE.x=0; if(SKY.U.uMistK)SKY.U.uMistK.value=0; if(scene.fog===FAR3.fog)scene.fog=null;
    light.intensity=on?2.4*nk():0;
    if(F.cum){ const u=F.cum.material.uniforms; u.uDr.value=performance.now()/1000;
      SHARED.cam.getWorldDirection(cd); const h=Math.hypot(cd.x,cd.z)||1; u.uIso.value.set(-cd.x/h,-cd.z/h,iso?-cd.y/h:0); } },'141c-fireview');   // G is turned half round; in the isometric view each cloud is moved up or down by its depth, so the layer stays one band at the bottom of the screen
  // the town from your landing: the real town round your house, drawn small and seldom from where your flat really stands (the glass's way, 130a) and shown behind everything: a cube of pictures in the behind and first-person views, one wide flat picture in the isometric
  const TW=F.town={mist:true,ms:250,px:512,pad:1.5,hz:.28,far:900,cull:true,n:0,last:0}, tU={uC:{value:null},uT:{value:null},uO:{value:0},uPI:{value:new THREE.Matrix4()},uCW:{value:new THREE.Matrix4()},uUV:{value:new THREE.Vector4(1,1,0,0)},uSky:{value:BLUE},uHz:{value:TW.hz}};
  const tq=new THREE.Mesh(new THREE.PlaneGeometry(2,2),new THREE.ShaderMaterial({uniforms:tU,depthWrite:false,vertexShader:'varying vec2 vU; void main(){ vU=uv; gl_Position=vec4(position.xy,1.,1.); }',
    fragmentShader:'uniform samplerCube uC; uniform sampler2D uT; uniform float uO, uHz; uniform mat4 uPI, uCW; uniform vec4 uUV; uniform vec3 uSky; varying vec2 vU; void main(){ vec3 c; if(uO>.5)c=texture2D(uT,vU*uUV.xy+uUV.zw).rgb; else { vec4 v=uPI*vec4(vU*2.-1.,1.,1.); vec3 d=mat3(uCW)*(v.xyz/v.w); c=textureCube(uC,vec3(-d.x,d.y,-d.z)).rgb; } gl_FragColor=vec4(mix(c,uSky,uHz),1.); }'}));
  tq.frustumCulled=false; tq.renderOrder=900; tq.visible=false; tq.raycast=()=>{}; tq.userData.sky=1; scene.add(tq);
  let tc=null, tr=null, tn=0, tt=0, tf=0; const oc0=new THREE.Vector3(), oq=new THREE.Quaternion(), ov=new THREE.Vector3(), ox=new THREE.Vector3(), oy=new THREE.Vector3(), CYC=[4,0,1,3]; let oz=0, ocam=null;
  // one picture: you stand in the town for it (what is drawn there goes by where you are), the town's own cut by distance kept
  const shoot=(cam,rt,face)=>{ const sb=renderer.shadowMap.autoUpdate, px=pos.x, pz=pos.z, t0=performance.now(); renderer.shadowMap.autoUpdate=false; tq.visible=false; ov.set(px,0,pz).applyMatrix4(G.matrix);
    const FU=FAR3.FU, fg=scene.fog, mk=FU&&FU.uMK.value, mx=MISTE.x, fv=[FAR3.mesh,FAR3.panels,FAR3.trees].map(o=>o&&o.visible); if(TW.mist&&FU&&FAR3.fog){ FU.uMK.value=.8; FU.uMP.value.set(ov.x,0,ov.z); MISTE.x=1; scene.fog=FAR3.fog; for(const o of [FAR3.mesh,FAR3.panels,FAR3.trees])if(o)o.visible=true; }
    try{ if(TW.cull){ pos.x=ov.x; pos.z=ov.z; CULL.begin(); } ROOMS.peek(()=>{ renderer.setRenderTarget(rt,face||0); renderer.clear(); renderer.render(scene,cam); }); }
    finally{ if(TW.mist&&FU&&FAR3.fog){ FU.uMK.value=mk; FU.uMP.value.copy(pos); MISTE.x=mx; scene.fog=fg; [FAR3.mesh,FAR3.panels,FAR3.trees].forEach((o,i)=>{ if(o)o.visible=fv[i]; }); } if(TW.cull){ CULL.end(); pos.x=px; pos.z=pz; } renderer.setRenderTarget(null); renderer.shadowMap.autoUpdate=sb; tq.visible=true; TW.n++; TW.last=performance.now()-t0; } };
  tq.onBeforeRender=(r,s,cam)=>{ if(cam.isOrthographicCamera){ if(!ocam)return; ov.copy(cam.position).sub(oc0); const w=(cam.right-cam.left)/cam.zoom, h=(cam.top-cam.bottom)/cam.zoom, k=1/TW.pad; tU.uUV.value.set(k,k,.5-k/2+ov.dot(ox)/w*k,.5-k/2+ov.dot(oy)/h*k); }
    else { tU.uPI.value.copy(cam.projectionMatrixInverse); tU.uCW.value.copy(cam.matrixWorld); } };
  SYS.add('places',()=>{ const on=F.on&&!VR.on&&!FADE.busy&&!WINDOWS.busy; if(F.cum)F.cum.visible=!on; if(!on){ tq.visible=false; tn=0; ocam=null; return; } const cam=SHARED.cam, now=performance.now();
    if(cam.isOrthographicCamera){ tU.uO.value=1; const W=Math.round(TW.px*cam.right/cam.top), sh=ov.copy(cam.position).sub(oc0), w=(cam.right-cam.left)/cam.zoom, h=(cam.top-cam.bottom)/cam.zoom, m=(TW.pad-1)/2;
      if(ocam&&cam.zoom===oz&&cam.quaternion.angleTo(oq)<1e-4&&Math.abs(sh.dot(ox))<m*w&&Math.abs(sh.dot(oy))<m*h&&now-tt<TW.ms*2)return;
      if(!tr)tr=new THREE.WebGLRenderTarget(W,TW.px,{type:THREE.HalfFloatType}); else if(tr.width!==W)tr.setSize(W,TW.px); if(!ocam)ocam=cam.clone(); ocam.copy(cam); for(const k of ['left','right','top','bottom'])ocam[k]=cam[k]*TW.pad; ocam.updateProjectionMatrix();
      ocam.matrixWorld.multiplyMatrices(G.matrix,cam.matrixWorld); ocam.matrixWorld.decompose(ocam.position,ocam.quaternion,ocam.scale); ocam.updateMatrixWorld(true); shoot(ocam,tr);
      oc0.copy(cam.position); oq.copy(cam.quaternion); oz=cam.zoom; ox.setFromMatrixColumn(cam.matrixWorld,0); oy.setFromMatrixColumn(cam.matrixWorld,1); tU.uT.value=tr.texture; tt=now; return; }
    tU.uO.value=0; ocam=null; if(!tc){ const rt=new THREE.WebGLCubeRenderTarget(TW.px,{type:THREE.HalfFloatType}); tc=new THREE.CubeCamera(.5*T,TW.far*T,rt); tc.coordinateSystem=renderer.coordinateSystem; tc.updateCoordinateSystem(); tU.uC.value=rt.texture; }
    if(tn>5&&now-tt<TW.ms)return; tc.position.set(X(DX),Y(HZ+45),Z(V(.9))).applyMatrix4(G.matrix); tc.updateMatrixWorld(true);
    const f=tn<6?tn:CYC[tf++%4]; shoot(tc.children[f],tc.renderTarget,f); tn++; tt=now; },'141c-town');
  window.FIREDBG=()=>({town:{n:TW.n,ms:+TW.last.toFixed(1),on:tq.visible},built:F.built,on:F.on,door:!!(APTS.escDoor&&APTS.escDoor.open),dist:+(UI.dist/T).toFixed(2),meshes:G.children.length,pos:[+ix(pos.x).toFixed(2),+iy(pos.z).toFixed(2)],py:+SHARED.py.toFixed(2),apt:{in:APTS.in,floor:APTS.floor()}});
}
