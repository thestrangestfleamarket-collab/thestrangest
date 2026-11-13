// THE PLAYHOUSE'S FRONT ON MARKET ST, THE WOODEN O (owner, 10 Nov 2026): a timber-framed house over its lot, the upper storey jettied out, a thatched gable roof with the flag on its ridge, the arched oak gate under a lantern each side, the pay hatch's lit window, and THE O on its hanging sign.
import {SHARED, THREE} from './003-shx.js';
import {CLOCK, LITE, ROOMS} from './003b-systems.js';
import {scene} from './004-main.js';
import {AWAY, SOL, STORE, SYS, TILE, TURN, WP, ZU} from './006-map-pre.js';
{ let made=null;
  const MH=TILE/.84, MV=ZU*24/.84, PI=Math.PI;
  const cv=(w,h,f)=>{ const c=document.createElement('canvas'); c.width=w; c.height=h; f(c.getContext('2d'),w,h); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; return t; };
  const rep=t=>{ t.wrapS=t.wrapT=THREE.RepeatWrapping; return t; };
  // a box whose faces tile their picture every s metres
  const boxG=(w,h,d,s)=>{ const g=new THREE.BoxGeometry(w,h,d), uv=g.attributes.uv, dims=[[d,h],[d,h],[w,d],[w,d],[w,h],[w,h]]; for(let f=0;f<6;f++)for(let v=0;v<4;v++){ const i=f*4+v; uv.setXY(i,uv.getX(i)*dims[f][0]/s,uv.getY(i)*dims[f][1]/s); } return g; };
  const make=()=>{ '@later'; const MS=STORE.main; if(!MS||!MS.lot||!WP.play)return null;
    const {X,Z}=SHARED.BOD, LW=MS.lot('play',190), TP=TURN(LW,WP.play.face), L=TP.L, f0=TP.pt((L.x0+L.x1)/2,L.y1), a0=TP.pt(L.x0,L.y1), a1=TP.pt(L.x1,L.y1), b0=TP.pt(L.x0,L.y0);
    const Wm=Math.hypot(X(a1[0])-X(a0[0]),Z(a1[1])-Z(a0[1]))/MH, Dm=Math.hypot(X(b0[0])-X(a0[0]),Z(b0[1])-Z(a0[1]))/MH;
    const G=new THREE.Group(); G.position.set(X(f0[0]),SHARED.groundY?SHARED.groundY(X(f0[0]),Z(f0[1])):0,Z(f0[1])); G.rotation.y=TP.hd(0); G.scale.set(MH,MV,MH); scene.add(G);
    const R=(()=>{ let a=19; return ()=>{ a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; })();
    const frame=rep(cv(256,256,(g,w,h)=>{ g.fillStyle='#ebe1ca'; g.fillRect(0,0,w,h); for(let i=0;i<500;i++){ g.fillStyle=`rgba(150,128,96,${.04+R()*.07})`; g.fillRect(R()*w,R()*h,2+R()*9,2+R()*9); }
      g.fillStyle='#2b1d13'; g.fillRect(0,0,w,16); g.fillRect(0,h-16,w,16); g.fillRect(0,0,16,h); g.fillRect(w/2-8,0,16,h); g.fillRect(0,h/2-7,w,14);
      g.lineWidth=12; g.strokeStyle='#2b1d13'; g.beginPath(); g.moveTo(16,h/2); g.lineTo(w/2,16); g.moveTo(w-16,h/2); g.lineTo(w/2,16); g.moveTo(16,h/2); g.lineTo(w/2,h-16); g.moveTo(w-16,h/2); g.lineTo(w/2,h-16); g.stroke(); }));
    const thatch=rep(cv(256,128,(g,w,h)=>{ g.fillStyle='#7a6440'; g.fillRect(0,0,w,h); for(let i=0;i<1400;i++){ const x=R()*w, y=R()*h; g.strokeStyle=R()<.5?'rgba(56,42,24,.5)':'rgba(176,150,98,.45)'; g.beginPath(); g.moveTo(x,y); g.lineTo(x+(R()-.5)*3,y+6+R()*10); g.stroke(); } g.fillStyle='rgba(40,30,18,.35)'; for(let y=0;y<h;y+=32)g.fillRect(0,y,w,3); }));
    const oakT=rep(cv(128,128,(g,w,h)=>{ g.fillStyle='#4a2f1d'; g.fillRect(0,0,w,h); for(let i=0;i<50;i++){ g.strokeStyle=`rgba(${R()<.5?'28,16,8':'112,76,44'},.4)`; const y=R()*h; g.beginPath(); g.moveTo(0,y); g.bezierCurveTo(w*.3,y+(R()-.5)*8,w*.6,y+(R()-.5)*8,w,y); g.stroke(); } for(let x=0;x<w;x+=32){ g.fillStyle='#24160c'; g.fillRect(x,0,2,h); } }));
    const lam=o=>new THREE.MeshLambertMaterial(o), M={frame:lam({map:frame}),thatch:lam({map:thatch,side:THREE.DoubleSide}),oak:lam({map:oakT}),beam:lam({color:0x2b1d13}),iron:lam({color:0x1e1c1a}),dark:new THREE.MeshBasicMaterial({color:0x0c0806}),
      glow:new THREE.MeshBasicMaterial({color:0xffd590,toneMapped:false}),win:new THREE.MeshBasicMaterial({map:cv(64,64,(g,w,h)=>{ g.fillStyle='#e8b060'; g.fillRect(0,0,w,h); g.strokeStyle='#2b1d13'; g.lineWidth=3; for(let k=-64;k<128;k+=14){ g.beginPath(); g.moveTo(k,0); g.lineTo(k+64,64); g.stroke(); g.beginPath(); g.moveTo(k+64,0); g.lineTo(k,64); g.stroke(); } g.lineWidth=6; g.strokeRect(0,0,w,h); g.fillRect(w/2-2,0,4,h); }),toneMapped:false})};
    const put=(geo,mat,x,y,z,o={})=>{ const m=new THREE.Mesh(geo,mat); m.position.set(x,y,z); if(o.rx)m.rotation.x=o.rx; if(o.ry)m.rotation.y=o.ry; if(o.rz)m.rotation.z=o.rz; m.castShadow=o.cast!==false; m.receiveShadow=true; G.add(m); return m; };
    const box=(w,h,d,mat,x,y,z,o={})=>put(boxG(w,h,d,o.s||2.6),mat,x,y,z,o);
    const H1=3.8, H2=7.4, J=.6, RIDGE=11, w=Wm, d=Dm;
    // the two storeys (the upper one jettied out over the street), a beam along the jetty, the gable ends, the thatch
    box(w,H1,d,M.frame,0,H1/2,-d/2); box(w,H2-H1,d+J,M.frame,0,(H1+H2)/2,-(d-J)/2); box(w+.1,.3,.35,M.beam,0,H1+.05,J-.15,{s:1});
    for(let x=-w/2+1.2;x<w/2-.6;x+=2.4)box(.25,.5,.5,M.beam,x,H1-.1,J*.5-.1,{s:1});   // the jetty's brackets
    { const sh=new THREE.Shape([new THREE.Vector2(-(d+J)/2-.2,0),new THREE.Vector2((d+J)/2+.2,0),new THREE.Vector2(0,RIDGE-H2)]); for(const s of [-1,1]){ const g=new THREE.ExtrudeGeometry(sh,{depth:.2,bevelEnabled:false}); const uv=g.attributes.uv; for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)/2.6,uv.getY(i)/2.6); put(g,M.frame,s*(w/2)-(s>0?.2:0),H2,-(d-J)/2,{ry:PI/2}); } }
    { const half=(d+J)/2+.5, ang=Math.atan2(RIDGE-H2,half), len=Math.hypot(half,RIDGE-H2)+.3; for(const s of [-1,1])box(w+.8,.25,len,M.thatch,0,(H2+RIDGE)/2,-(d-J)/2+s*half/2,{rx:s*ang,s:2.4}); box(w+.9,.35,.5,M.thatch,0,RIDGE+.05,-(d-J)/2,{s:2}); }
    // the arched oak gate, a lantern each side of it, the pay hatch's lit window to its left, leaded windows upstairs
    { const gw=2.8, gh=3.4, sh=new THREE.Shape(); sh.moveTo(-gw/2,0); sh.lineTo(gw/2,0); sh.lineTo(gw/2,gh-gw/2); sh.absarc(0,gh-gw/2,gw/2,0,PI,false); sh.lineTo(-gw/2,0);
      const fr=new THREE.Shape(); fr.moveTo(-gw/2-.35,0); fr.lineTo(gw/2+.35,0); fr.lineTo(gw/2+.35,gh+.35); fr.lineTo(-gw/2-.35,gh+.35); fr.lineTo(-gw/2-.35,0); fr.holes.push(new THREE.Path(sh.getPoints(24)));
      put(new THREE.ExtrudeGeometry(fr,{depth:.18,bevelEnabled:false}),M.beam,0,0,.01);
      const dg=new THREE.ExtrudeGeometry(sh,{depth:.1,bevelEnabled:false}), uv=dg.attributes.uv; for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)/1.2,uv.getY(i)/1.2); put(dg,M.oak,0,0,-.04);
      box(.05,gh,.04,M.beam,0,gh/2,.08,{s:1}); for(const s of [-1,1]){ for(let j=0;j<3;j++)box(gw/2-.2,.08,.03,M.iron,s*(gw/4),.6+j*1.1,.08,{s:1}); const r=new THREE.Mesh(new THREE.TorusGeometry(.12,.025,6,14),M.iron); r.position.set(s*.35,1.5,.1); G.add(r); }
      for(const s of [-1,1]){ const x=s*(gw/2+.9); box(.06,.06,.5,M.iron,x,2.9,.25,{s:1}); box(.28,.4,.28,M.iron,x,2.6,.45,{s:1}); put(new THREE.SphereGeometry(.1,10,8),M.glow,x,2.6,.45,{cast:false}); }
      box(1.2,.9,.06,M.win,-gw/2-2.6,1.6,.04,{s:1}); box(1.4,.12,.4,M.oak,-gw/2-2.6,1.12,.2,{s:1}); box(1.4,.12,.12,M.beam,-gw/2-2.6,2.1,.06,{s:1});
      for(let x=-w/2+1.6;x<w/2-1;x+=3.2)if(Math.abs(x)>1.4)box(1.4,1.3,.06,M.win,x,(H1+H2)/2+.2,J+.03,{s:1}); }
    // the hanging sign: THE O, painted both sides, on an iron arm over the pavement
    { const sx=w/2-2.4, sy=H1-.6; box(.06,.06,1.3,M.iron,sx,sy+.85,.65,{s:1}); box(.04,.5,.04,M.iron,sx,sy+.6,1.2,{s:1});
      const t=cv(256,192,(g,W_,H_)=>{ g.fillStyle='#3a2414'; g.fillRect(0,0,W_,H_); g.strokeStyle='#d4a94e'; g.lineWidth=8; g.strokeRect(8,8,W_-16,H_-16); g.beginPath(); g.arc(W_/2,H_/2-6,46,0,7); g.stroke(); g.lineWidth=3; g.beginPath(); g.ellipse(W_/2,H_/2-6,20,46,0,0,7); g.moveTo(W_/2-46,H_/2-6); g.lineTo(W_/2+46,H_/2-6); g.stroke();
        g.fillStyle='#e8c890'; g.font='bold 30px Georgia,serif'; g.textAlign='center'; g.fillText('THE O',W_/2,H_-18); });
      const sm=new THREE.MeshLambertMaterial({map:t,side:THREE.DoubleSide}), sg=new THREE.Mesh(new THREE.PlaneGeometry(1.1,.82),sm); sg.position.set(sx,sy,1.2); sg.rotation.y=PI/2; G.add(sg);
      made={G}; made.sign=sg; }
    // the flag on the ridge
    { box(.08,3,.08,M.iron,0,RIDGE+1.5,-(d-J)/2,{s:1}); const fl=new THREE.Mesh(new THREE.PlaneGeometry(1.6,.9,8,1),new THREE.MeshLambertMaterial({color:0xb03a2a,side:THREE.DoubleSide})); fl.position.set(.84,RIDGE+2.5,-(d-J)/2); G.add(fl); made.flag=fl; made.flag0=fl.geometry.attributes.position.array.slice(); }
    G.traverse(o=>{ o.userData.seenOut=true; });
    { const c4=[[-w/2,-d],[w/2,0]].map(([x,z])=>new THREE.Vector3(x*MH,0,z*MH).applyAxisAngle(new THREE.Vector3(0,1,0),G.rotation.y).add(G.position)); SOL.up.push([Math.min(c4[0].x,c4[1].x),Math.min(c4[0].z,c4[1].z),Math.max(c4[0].x,c4[1].x),Math.max(c4[0].z,c4[1].z)]); }
    G.updateMatrixWorld(); const lamp=new THREE.PointLight(0xffc070,3,6*TILE,1.6); lamp.position.set(0,2.8,1.4).applyMatrix4(G.matrixWorld); LITE.recs.push(lamp); made.lamp=lamp;
    return made; };
  SYS.add('places',dt=>{ if(AWAY.has('playhouse'))return; if(!made){ if(!ROOMS.off||!ROOMS.off.playhouse||!STORE.main||!STORE.main.lot)return; made=make()||{G:null}; if(!made.G)return; }
    if(!made.G)return; const up=SHARED.LVL==='up'; made.G.visible=up&&!(ROOMS.offIn&&ROOMS.offIn()); if(!made.G.visible)return;
    const t=performance.now()/1000, p=made.flag.geometry.attributes.position, a=made.flag0; for(let i=0;i<p.count;i++){ const x=a[i*3]+.8; p.setZ(i,Math.sin(x*3-t*4)*.12*x); } p.needsUpdate=true;
    made.lamp.intensity=CLOCK.dark&&CLOCK.dark()?3:0; },'151zc-ph-front');
}
