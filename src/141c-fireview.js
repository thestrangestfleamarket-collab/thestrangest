// THE FIRE ESCAPE VIEW: your landing on the apartment house's fire escape, with the landings above and below, built off the map from the house's own facade and landings; the camera is held on it.
import {SHARED, THREE} from './003-shx.js';
import {CLOCK, FAR3, GPH, pos, SKY, UI} from './003b-systems.js';
import {scene} from './004-main.js';
import {BLDK, FADE, MISTE, MODS, STORE, SYS, TILE} from './006-map-pre.js';
import {BATCH} from './008-batch.js';
{ const APTS=MODS.apts, F=window.FIREV, T=TILE, KK=BLDK, {X,Z}=SHARED.BOD, Y=SHARED.BOD.Y, {CX,WY,HZ,S}=F, A=APTS.AL, FE=APTS.ESC[0], DU=APTS.DU, DO=APTS.DO, LV=F.lv;
  const ix=x=>x/(T*KK)+SHARED.BOD.OX, iy=z=>z/(T*KK)+SHARED.BOD.OY, cl=v=>Math.max(0,Math.min(1,v)), nk=()=>cl((4-CLOCK.elev())/8);
  const du=CX-(A.x0+A.x1)/2, U=u=>A.x0+u+du, L0=U(FE.ua), L1=U(FE.ub), DX=U(DU);
  const onL=(x,z)=>{ const u=ix(x), v=iy(z); return u>L0-.3&&u<L1+.3&&v>WY-.4&&v<WY+DO+.4; };
  const G=new THREE.Group(); G.visible=false; scene.add(G); let light=null, busy=false;
  F.on=false; F.G=G;
  const fade=async(txt,fn)=>{ busy=true; await FADE.run(txt,fn,{hold:200}); busy=false; };
  F.out=()=>{ if(busy)return; fade(F.built?'YOUR FIRE ESCAPE':'LOADING YOUR FIRE ESCAPE...',async()=>{ APTS.inReal=false; await STORE.offGo(F.name); UI.goTo(X(DX),Z(WY+.9),Y(HZ)); SHARED.heading=0; if(UI.persp&&window.__dbg)__dbg.face(Math.PI); }); };
  F.back=()=>{ if(busy)return; APTS.enterReal(); };
  const hit=(w,h,d,x,y,z)=>{ const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshBasicMaterial({visible:false})); m.position.set(x,y,z); scene.add(m); return m; };
  let plaque=null; APTS.furnish(APTS.my,()=>{ '@later'; UI.thing({name:'YOUR FIRE ESCAPE',ghost:1,obj:hit(1.1*T*KK,SHARED.BOD.Y(52),.3*T,X(APTS.fw[0]),SHARED.BOD.Y(68),Z(APTS.fw[1]+.2)),reach:1.4*T,near:2.6*T,tall:1.4*T,act:()=>{ if(APTS.in)F.out(); }});
  const F3={Y:'101101010010010',O:'111101101101111',U:'101101101101111',R:'110101110101101',A:'010101111101101',P:'110101110100100',T:'111010010010010',M:'101111101101101',E:'111100110100111',N:'110101101101101','0':'111101101101111','1':'010110010010111','2':'111001111100111','3':'111001111001111','4':'101101111001001','5':'111100111001111','6':'111100111101111','7':'111001010010010','8':'111101111101111','9':'111101111001111'};
  { const W=61, H=9, cv=document.createElement('canvas'); cv.width=W; cv.height=H; const g=cv.getContext('2d');
    const t=new THREE.CanvasTexture(cv); t.magFilter=t.minFilter=THREE.NearestFilter; t.generateMipmaps=false; t.colorSpace=THREE.SRGBColorSpace;
    const paint=()=>{ const txt=APTS.num?'APT '+APTS.num:'YOUR APARTMENT'; g.fillStyle='#7a5a24'; g.fillRect(0,0,W,H); g.fillStyle='#c8a050'; g.fillRect(1,1,W-2,H-2);
      let tw=0; for(const ch of txt)tw+=ch===' '?2:4; let x=Math.max(3,Math.round((W-tw)/2)); g.fillStyle='#2a1e10';
      for(const ch of txt){ const q=F3[ch]; if(q)for(let r=0;r<5;r++)for(let c=0;c<3;c++)if(q[r*3+c]==='1')g.fillRect(x+c,2+r,1,1); x+=ch===' '?2:4; } t.needsUpdate=true; };
    paint(); F.setPlaque=paint;
    plaque=new THREE.Mesh(new THREE.PlaneGeometry(W/24*T*KK,SHARED.BOD.Y(H)),new THREE.MeshLambertMaterial({map:t,clippingPlanes:APTS.WPL?[APTS.WPL.Wb]:[]})); plaque.position.set(X(APTS.door[0]),SHARED.BOD.Y(104),Z(APTS.door[1]-.04)); scene.add(plaque); } });
  const z0=APTS.RZ+S;
  F.build=()=>{ '@fire'; if(F.built)return; const keep=BATCH.items.splice(0), km=BATCH.meshes, kc=BATCH.cast; BATCH.meshes={}; BATCH.cast=true; BATCH.tag=null;
    BLOCKS.make({x0:A.x0,x1:A.x1,y0:A.y0,y1:A.y1,z0:0,z1:HZ+2*S,kind:'A',paint:(sd,a,z,f)=>APTS.paint(sd,a,z0+((z-z0)%(3*S)+3*S)%(3*S),f)});   // the whole building, street to roof, so you see it run all the way up and down past the landing
    APTS.escape(FE,[LV-1,LV,LV+1],(LV-1)*S,(LV+2)*S);
    BATCH.build(APTS.MKA); BATCH.cast=kc; for(const me of Object.values(BATCH.meshes||{})){ me.castShadow=me.receiveShadow=true; G.add(me); } BATCH.meshes=km; BATCH.items=keep;
    G.position.set(X(du)-X(0),0,Z(WY-A.y1)-Z(0));
    // the pots and plants are real: on your landing each one a thing you can pick up, push or knock off; the landings above and below keep theirs in place
    const LW=T*KK, YH=h=>Y(h)-Y(0); F.loose=[];
    for(const sp of APTS.escPlants||[]){ const lvP=Math.floor((sp.z-APTS.RZ+6)/S), o=APTS.plant3D(sp.kind,sp.seed,sp.w*LW,YH(sp.h)); o.rotation.y=(sp.seed*2.39)%6.28; o.position.set(X(sp.x),Y(sp.z),Z(sp.y));
      if(lvP===LV&&sp.kind!=='hang'&&GPH.add){ o.position.add(G.position); scene.add(o); F.loose.push(GPH.add(o,{name:APTS.plantName[sp.kind]||'PLANT',m:{pot:3,flower:2,fern:3,tall:6,box:8}[sp.kind]||3})); } else G.add(o); }
    // the windows and doors onto the landings are real: a deep painted frame, a stone head, sashes of real glass that catch the light, a panelled door with glass and a brass knob (the stone sills, deep enough to set things on, are the house's own)
    { const Mm=LW/.907, mm=v=>v*Mm, MT={}, mt=(k,c,o={})=>MT[k]||(MT[k]=new THREE.MeshLambertMaterial({color:new THREE.Color('rgb('+c.join(',')+')'),...(o.x||{})}));   // cel: flat steps of light
      const trim=mt('trim',[226,218,200]), stoneM=mt('stone',[158,146,130]), wood=mt('door',[92,52,34],{sh:30,sp:0x333333}), brass=mt('brass',[200,160,80],{sh:80,sp:0xffeebb});
      const glass=mt('glass',[120,146,168],{sh:120,sp:0xffffff,x:{transparent:true,opacity:.42,depthWrite:false}});
      const bx=(g,w,h,d,m,x,y,z)=>{ const me=new THREE.Mesh(new THREE.BoxGeometry(mm(w),mm(h),mm(d)),m); me.position.set(mm(x),mm(y),mm(z)); me.castShadow=me.receiveShadow=true; g.add(me); return me; };
      const pane=(g,w,h,x,y,z)=>{ const me=new THREE.Mesh(new THREE.PlaneGeometry(mm(w),mm(h)),glass); me.position.set(mm(x),mm(y),mm(z)); g.add(me); };
      const window3D=(w,h)=>{ const g=new THREE.Group(), cw=.1, cd=.16;
        for(const sx of [-1,1])bx(g,cw,h+.06,cd,trim,sx*(w/2+cw/2),h/2,cd/2); bx(g,w+2*cw,.12,cd,trim,0,h+.06,cd/2);   // the casing, standing proud of the brick
        bx(g,w+2*cw+.12,.18,.12,stoneM,0,h+.21,.06); for(const sx of [-1,1])bx(g,.04,h,.06,trim,sx*(w/2-.02),h/2,.03);   // the stone head; the reveal
        const s0=.03, mid=h*.52;   // two sashes, the lower in front of the upper, each a frame of bars round its glass
        for(const [y0,y1,z] of [[s0,mid+.02,.075],[mid-.02,h-.02,.045]]){ const sh=y1-y0, cy=(y0+y1)/2; for(const sx of [-1,1])bx(g,.05,sh,.04,trim,sx*(w/2-.045),cy,z); bx(g,w-.04,.05,.04,trim,0,y0+.025,z); bx(g,w-.04,.05,.04,trim,0,y1-.025,z);
          bx(g,.025,sh-.08,.025,trim,0,cy,z); if(y0>s0)bx(g,w-.1,.025,.025,trim,0,cy,z); pane(g,w-.12,sh-.09,0,cy,z-.005); }
        return g; };
      const door3D=(w,h)=>{ const g=new THREE.Group(), cw=.11, cd=.18;
        for(const sx of [-1,1])bx(g,cw,h+.08,cd,trim,sx*(w/2+cw/2),h/2+.04,cd/2); bx(g,w+2*cw,.14,cd,trim,0,h+.07,cd/2); bx(g,w+2*cw+.14,.16,.12,stoneM,0,h+.22,.06);
        bx(g,w+.2,.05,.24,stoneM,0,.025,.12);   // the threshold
        const lz=.05, L=new THREE.Group(); g.add(L);   // the leaf, set back in its frame: rails, stiles, two raised panels below, six panes above
        for(const sx of [-1,1])bx(L,.1,h,.05,wood,sx*(w/2-.05),h/2,lz); bx(L,w,.14,.05,wood,0,.07,lz); bx(L,w,.1,.05,wood,0,h*.42,lz); bx(L,w,.1,.05,wood,0,h-.05,lz);
        for(const sx of [-1,1])bx(L,w/2-.14,h*.42-.22,.07,mt('panel',[110,64,42],{sh:30}),sx*(w/4-.01),(h*.42+.07)/2+.02,lz);
        const g0=h*.42+.05, g1=h-.1; bx(L,.035,g1-g0,.04,wood,0,(g0+g1)/2,lz); bx(L,w-.2,.035,.04,wood,0,g0+(g1-g0)/3,lz); bx(L,w-.2,.035,.04,wood,0,g0+(g1-g0)*2/3,lz); pane(L,w-.2,g1-g0,0,(g0+g1)/2,lz-.01);
        const kb=new THREE.Mesh(new THREE.SphereGeometry(mm(.03),12,8),brass); kb.position.set(mm(w/2-.12),mm(1.0),mm(lz+.05)); L.add(kb); return g; };
      const ww=1.1*.907, wh=(94-42)/32.4, dh=(94-3)/32.4;
      for(const lv of [LV-1,LV,LV+1]){ const z=APTS.RZ+lv*S;
        for(const u of APTS.FWU){ const o=window3D(ww,wh); o.position.set(X(A.x0+u),Y(z+42),Z(A.y1)); G.add(o); }
        if(lv>0){ const o=door3D(ww,dh); o.position.set(X(A.x0+DU),Y(z+3),Z(A.y1)); G.add(o); } } }
    // the sky round the house: thick clouds drifting below your floor and around the building, a few far above
    { const puff=()=>{ const cv=document.createElement('canvas'); cv.width=256; cv.height=160; const g=cv.getContext('2d'), P=[];
        for(let i=0;i<16;i++){ const x=40+Math.random()*176, r=16+Math.random()*30*(1-Math.abs(x-128)/150), y=110-r*.55-Math.random()*26; P.push([x,y,r]); }
        P.sort((a,b)=>b[1]-a[1]); for(const [x,y,r] of P){ g.fillStyle='#c4cad8'; g.beginPath(); g.arc(x,y+r*.18,r,0,7); g.fill(); } for(const [x,y,r] of P){ g.fillStyle='#e8ebf2'; g.beginPath(); g.arc(x,y,r*.9,0,7); g.fill(); } for(const [x,y,r] of P){ g.fillStyle='#ffffff'; g.beginPath(); g.arc(x-r*.18,y-r*.22,r*.62,0,7); g.fill(); }   // three flat tones: shade, body, sunlit top
        const t=new THREE.CanvasTexture(cv); t.colorSpace=THREE.SRGBColorSpace; return new THREE.SpriteMaterial({map:t,transparent:true,depthWrite:false,fog:false}); };
      F.cloudMs=[puff(),puff(),puff(),puff()]; F.clouds=[]; const cx=(A.x0+A.x1)/2, cy=(A.y0+A.y1)/2;
      for(let i=0;i<190;i++){ const hi=i>=164, a=Math.random()*6.283, d=(hi?34:13)+Math.random()*(hi?60:50), x=cx+Math.cos(a)*d, y=cy+Math.sin(a)*d, z=hi?HZ+S*(2+Math.random()*5):HZ-S*(.75+Math.random()*2.8), sz=LW*(hi?12+Math.random()*14:7+Math.random()*12);
        const sp=new THREE.Sprite(F.cloudMs[i%4]); sp.position.set(X(x),Y(z),Z(y)); sp.scale.set(sz,sz*.62,1); sp.renderOrder=3; G.add(sp); F.clouds.push({sp,x0:sp.position.x,v:.15+Math.random()*.35,span:LW*120}); } }
    const sol=STORE.kit.sol, V=d=>WY+d, H=HZ+33;
    sol(L0-1,WY-.3,L1+1,WY,HZ+120); sol(L0-.12,V(DO-.16),L1+.12,V(DO+.06),HZ+35); for(const u of APTS.FWU||[])sol(U(u)-.62,WY,U(u)+.62,WY+.26,HZ+42); sol(L0-.12,WY,L0+.04,V(DO),H); sol(L1-.04,WY,L1+.12,V(DO),H); sol(U(FE.lx)-.45,V(APTS.DI),U(FE.lx)+.45,V(DO),H);
    light=new THREE.PointLight(0xffc890,0,7*T,1.6); light.position.set(X(DX),Y(HZ+70),Z(WY+.4)); scene.add(light);
    UI.thing({name:'BACK INSIDE',ghost:1,obj:hit(1.2*T*KK,Y(94),.4*T,X(DX),Y(HZ+47),Z(WY+.15)),reach:1.4*T,near:2.6*T,tall:2.2*T,act:()=>F.back()});
    const pl=STORE.places.find(q=>q[0]===F.name); if(pl){ pl[1]=X(DX); pl[2]=Z(WY+.9); pl[3]=Y(HZ); }
    F.built=true; };
  const sg0=STORE.stackGround; STORE.stackGround=(x,z)=>F.built&&onL(x,z)?Y(HZ):sg0?sg0(x,z):null;
  SYS.add('places',()=>{ const on=F.built&&SHARED.LVL==='up'&&onL(pos.x,pos.z);
    if(on!==F.on){ F.on=on; G.visible=on; }   // free view on the landing: look up and down the building, the clouds below and the sky above
    if(!on){ if(light)light.intensity=0; return; }
    if(FAR3.mesh)FAR3.mesh.visible=false; if(FAR3.panels)FAR3.panels.visible=false; if(FAR3.trees)FAR3.trees.visible=false; if(FAR3.FU)FAR3.FU.uMK.value=0; MISTE.x=0; if(SKY.U.uMistK)SKY.U.uMistK.value=0; if(scene.fog===FAR3.fog)scene.fog=null;
    light.intensity=2.4*nk();
    if(F.clouds){ const t=performance.now()/1000, n=nk(); for(const m of F.cloudMs)m.color.setRGB(1-.72*n,1-.68*n,1-.55*n); for(const c of F.clouds){ c.sp.position.x=c.x0+((t*c.v*T)%c.span)-c.span/2; } } },'141c-fireview');
  window.FIREDBG=()=>({built:F.built,on:F.on,meshes:G.children.length,pos:[+ix(pos.x).toFixed(2),+iy(pos.z).toFixed(2)],py:+SHARED.py.toFixed(2),apt:{in:APTS.in,floor:APTS.floor()}});
}
