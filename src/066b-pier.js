// THE FISHING PIER: PIER builds the long timber pier out into the Hudson with the river (decks, pilings, rails, lamps, gear).
import {THREE} from './003-shx.js';
import {CLOCK, LITE} from './003b-systems.js';
import {scene} from './004-main.js';
import {FIX, SOL, SYS, TILE} from './006-map-pre.js';
import {RIVER} from './066-river.js';
const PIER={}; window.PIER=PIER;
RIVER.onBuild.push(()=>{ const T=TILE, V3=THREE.Vector3, RB=RIVER.box, Q=RB.z1, LV=RB.lv, WU=T/.84, Y=v=>v*WU, X=RIVER.fpier, hs=(a,b)=>{ const s=Math.sin(a*127.1+b*311.7)*43758.5453; return s-Math.floor(s); };
  const hw=3*(RIVER.fpw||1.8*T), zH=Q-Math.min(69*T,Q-RB.z0-14*T), HD=9*T, zE=zH-HD, HW=4*(hw+3*T), G=new THREE.Group(); G.name='pier'; scene.add(G);
  Object.assign(PIER,{x:X,z0:Q,zH,zE,hw,HW,G});
  RIVER.decks.push({r:[[X-hw,zH,X+hw,Q],[X-HW,zE,X+HW,zH]],lad:[X,zE-.55*T,X,zE+.8*T],pier:1});
  const cv=(w,h,f)=>{ const c=document.createElement('canvas'); c.width=w; c.height=h; f(c.getContext('2d'),w,h); const t=new THREE.CanvasTexture(c); t.magFilter=t.minFilter=THREE.NearestFilter; t.generateMipmaps=false; t.colorSpace=THREE.SRGBColorSpace; return t; };
  const lit=(m,k)=>{ m.onBeforeCompile=sh=>{ sh.fragmentShader=sh.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n totalEmissiveRadiance+=diffuseColor.rgb*'+k.toFixed(2)+';'); }; m.customProgramCacheKey=()=>'pierlit'+k; return m; };
  const grain=cv(64,64,(g,w,h)=>{ g.fillStyle='#d6d0c6'; g.fillRect(0,0,w,h); for(let y=0;y<h;y++){ const k=hs(y,3); g.fillStyle=`rgba(60,48,36,${(.05+.18*k*k).toFixed(3)})`; g.fillRect(0,y,w,1); }
    for(let i=0;i<40;i++){ g.fillStyle=`rgba(40,32,24,${(.1+.2*hs(i,5)).toFixed(3)})`; g.fillRect(hs(i,1)*w|0,hs(i,2)*h|0,4+hs(i,4)*16|0,1); }
    for(let i=0;i<3;i++){ const x=hs(i,8)*w, y=hs(i,9)*h; g.fillStyle='rgba(50,36,24,.55)'; g.beginPath(); g.ellipse(x,y,3,1.6,0,0,7); g.fill(); }
    g.fillStyle='rgba(20,20,22,.8)'; for(const x of [3,w-4])for(const y of [h*.3,h*.7])g.fillRect(x,y|0,1,1); });
  const pileTx=cv(16,96,(g,w,h)=>{ for(let y=0;y<h;y++){ const f=1-y/h; let c; if(f<.8)c=[22,30,22]; else if(f<.93){ const k=(f-.8)/.13; c=[40+30*k,52+24*k,34+14*k]; } else c=[78,64,50];
      for(let x=0;x<w;x++){ const n=.8+.4*hs(x,y); g.fillStyle=`rgb(${c[0]*n|0},${c[1]*n|0},${c[2]*n|0})`; g.fillRect(x,y,1,1); if(f>.86&&f<.92&&hs(x+7,y)>.8){ g.fillStyle='#b8b4a6'; g.fillRect(x,y,1,1); } } } });
  const woodM=lit(new THREE.MeshLambertMaterial({map:grain}),.3), pileM=lit(new THREE.MeshLambertMaterial({map:pileTx}),.25), ironM=lit(new THREE.MeshLambertMaterial({color:0xffffff}),.25);
  const BX=[], CY=[], TO=[], GL=[], box=(x,y,z,w,h,d,c,rx=0,ry=0,rz=0)=>BX.push([x,y,z,w,h,d,c,rx,ry,rz]), cyl=(x,y,z,r,h,c,rx=0,rz=0)=>CY.push([x,y,z,r,h,r,c,rx,0,rz]);
  const tone=(c,k,i)=>c.map(v=>v*(1-k/2+k*hs(i,c[0]*97))), WD=[.5,.45,.38], GRY=[.56,.54,.5], DK=[.3,.26,.21], IRON=[.16,.17,.18], RUST=[.42,.24,.14], ROPE=[.62,.54,.38];
  // the deck: planks across, with gaps, every one its own tone; a few warped
  const PT=.22*WU, PG=.025*WU, plank=(x0,x1,z0,z1)=>{ let i=0; for(let z=z1-PG;z-PT>z0;z-=PT+PG,i++){ const k=hs(i,x0|0), wv=hs(i,7)>.93?(.012+.012*hs(i,2)):0, sh=(hs(i,11)-.5)*.12*WU;
      box((x0+x1)/2+sh,-.04*WU+wv*WU*.3,z-PT/2,x1-x0+.03*WU-Math.abs(sh)*2,.08*WU,PT,tone(k>.85?GRY:k<.12?DK:WD,.35,i+(x0|0)),0,0,wv); } };
  plank(X-hw,X+hw,zH,Q); plank(X-HW,X+HW,zE,zH);
  for(const s of [-1,1]){ box(X+s*(hw-.05*WU),-.2*WU,(zH+Q)/2,.1*WU,.26*WU,Q-zH,DK); box(X+s*(HW-.05*WU),-.2*WU,(zE+zH)/2,.1*WU,.26*WU,HD,DK); }
  box(X,-.2*WU,zE+.05*WU,2*HW,.26*WU,.1*WU,DK); for(const s of [-1,1])box(X+s*(HW+hw)/2,-.2*WU,zH-.05*WU,HW-hw,.26*WU,.1*WU,DK);
  // stringers, pile caps, pilings and their bracing
  const PR=.17*WU, BOT=LV-7.3*WU, PL=8.2*WU, pile=(x,z,top=-.08*WU)=>{ CY.push([x,top-PL/2,z,PR,PL,PR,[1,1,1],0,0,(hs(x,z)-.5)*.04,1]); RIVER.posts.push([x,z,PR+.05*T]); };
  for(const o of [-hw+.3*T,0,hw-.3*T])box(X+o,-.24*WU,(zH+Q)/2,.2*WU,.3*WU,Q-zH,DK);
  for(let o=-HW+.4*T;o<=HW-.3*T;o+=(2*HW-.8*T)/Math.round(2*HW/(3*T)))box(X+o,-.24*WU,(zE+zH)/2,.2*WU,.3*WU,HD,DK);
  let bi=0; for(let z=Q-1.5*T;z>zH+.5*T;z-=3*T,bi++){ const px=hw-.28*T; pile(X-px,z); pile(X+px,z); box(X,-.48*WU,z,2*hw+.2*WU,.3*WU,.32*WU,tone(DK,.3,bi));
    const y0=-.7*WU, y1=LV-1.6*WU, len=Math.hypot(2*px,y0-y1), a=Math.atan2(y0-y1,2*px); for(const s of [-1,1])box(X,(y0+y1)/2,z+s*.2*WU,len,.2*WU,.07*WU,tone(WD,.3,bi+s),0,0,s*a);
    if(bi%2===0&&z-3*T>zH)for(const sx of [-1,1]){ const l2=Math.hypot(3*T,y0-y1), a2=Math.atan2(y0-y1,3*T); box(X+sx*(px+.22*WU),(y0+y1)/2,z-1.5*T,.07*WU,.2*WU,l2,tone(WD,.3,bi+9),-a2,0,0); } }
  const NI=Math.round(2*HW/(3*T)); for(let i=0;i<=NI;i++)for(let j=0;j<3;j++){ const x=X-HW+.4*T+i*(2*HW-.8*T)/NI, z=zH-.6*T-j*(HD-1.2*T)/2, moor=(i===0||i===NI||i%4===0)&&j!==1; pile(x,z,moor?.55*WU:-.08*WU); if(i<NI)box((x+X-HW+.4*T+(i+1)*(2*HW-.8*T)/NI)/2,-.48*WU,z,(2*HW-.8*T)/NI,.3*WU,.32*WU,DK); }
  // rails on the walk out, a low curb round the head; wheel blocks under the curb
  const RH=1.05*WU; for(const s of [-1,1]){ const x=X+s*(hw-.06*WU); let i=0; for(let z=Q-.1*T;z>zH+.3*T;z-=1.5*T,i++)box(x,RH/2,z,.1*WU,RH,.1*WU,tone(GRY,.25,i));
    box(x,RH-.03*WU,(zH+Q)/2,.14*WU,.06*WU,Q-zH,GRY); box(x,RH*.55,(zH+Q)/2,.05*WU,.1*WU,Q-zH,tone(GRY,.2,s+4));
    SOL.up.push([x-.12*T,zH+.1*T,x+.12*T,Q]); FIX.up.push([x-.12*T,zH+.1*T,0,x+.12*T,Q,RH]);
    const cx=X+s*(HW-.12*WU); box(cx,.08*WU,(zE+zH)/2,.2*WU,.15*WU,HD-.3*WU,DK); for(let k=0;k<6;k++){ const z=zH-.8*T-k*(HD-1.6*T)/5; box(cx,RH/2,z,.1*WU,RH,.1*WU,GRY); } box(cx,RH-.03*WU,(zE+zH)/2,.14*WU,.06*WU,HD-1.2*T,GRY);
    SOL.up.push([cx-.12*T,zE+.6*T,cx+.12*T,zH-.6*T]); FIX.up.push([cx-.12*T,zE+.6*T,0,cx+.12*T,zH-.6*T,RH]);
    box(X+s*(HW+hw)/2,.08*WU,zH-.12*WU,HW-hw-.2*WU,.15*WU,.2*WU,DK); }
  for(const o of [-1,-.45,.45,1])box(X+o*(HW-.9*T),.08*WU,zE+.12*WU,1.4*T,.15*WU,.2*WU,DK);
  // the ladder down off the head's end
  for(const o of [-.3,.3])box(X+o*WU,(LV-1.4*WU+.9*WU)/2,zE-.08*WU,.05*WU,.9*WU-(LV-1.4*WU),.05*WU,IRON); for(let y=LV-1.2*WU;y<0;y+=.3*WU)box(X,y,zE-.08*WU,.6*WU,.04*WU,.05*WU,IRON);
  // lamps: iron posts with a crook and a hooded light; bollards, cleats, rope, the gear of a working pier
  const LAMPS=[], lamp=(x,z,s)=>{ cyl(x,1.6*WU,z,.05*WU,3.2*WU,IRON); cyl(x,.12*WU,z,.12*WU,.24*WU,IRON); box(x+s*.28*WU,3.15*WU,z,.6*WU,.05*WU,.05*WU,IRON); box(x+s*.55*WU,2.98*WU,z,.04*WU,.3*WU,.04*WU,IRON);
      cyl(x+s*.55*WU,2.8*WU,z,.2*WU,.07*WU,IRON); cyl(x+s*.55*WU,2.86*WU,z,.13*WU,.06*WU,IRON); cyl(x+s*.55*WU,2.91*WU,z,.05*WU,.05*WU,IRON); GL.push([x+s*.55*WU,2.76*WU,z,.26*WU,.01*WU,.26*WU]);
      SOL.up.push([x-.15*T,z-.15*T,x+.15*T,z+.15*T]); const L=new THREE.PointLight(0xffc27a,0,7*T,1.6); L.position.set(x+s*.55*WU,2.66*WU,z); L.userData.i0=14; L.userData.grp=G; LITE.recs.push(L); LAMPS.push(L); };
  { let k=0; for(let z=Q-3*T;z>zH+2*T;z-=6*T,k++){ const s=k%2?-1:1; lamp(X-s*(hw-.1*WU),z,s); } }   // a lamp every 6 tiles, side to side lamp(X-HW+.25*WU,zH-.5*T,1); lamp(X+HW-.25*WU,zE+.5*T,-1);
  const bollard=(x,z)=>{ cyl(x,.22*WU,z,.15*WU,.44*WU,IRON); cyl(x,.46*WU,z,.2*WU,.06*WU,IRON); SOL.up.push([x-.25*T,z-.25*T,x+.25*T,z+.25*T]); };
  bollard(X+1.6*T,zE+.6*T); bollard(X+HW-1.1*T,zE+.7*T); bollard(X-HW+1.4*T,zH-.6*T); bollard(X+hw-.5*T,zH+2*T);
  for(const o of [-.75,-.25,.25,.75]){ const x=X+o*(HW-.8*T); box(x,.18*WU,zE+.12*WU,.4*WU,.05*WU,.08*WU,IRON); box(x,.13*WU,zE+.12*WU,.08*WU,.07*WU,.08*WU,IRON); }
  const coil=(x,z,r)=>{ for(let k=0;k<3;k++)TO.push([x,.04*WU+k*.045*WU,z,r*(1-k*.12),ROPE]); };
  coil(X+2.5*T,zE+1.1*T,.3*WU); coil(X+HW-1.6*T,zE+1.2*T,.26*WU); coil(X-hw+.6*T,Q-11*T,.24*WU);
  { const a=new V3(X+1.6*T,.4*WU,zE+.6*T), b=new V3(X+2.2*T,LV+.1*WU,zE-.9*T), d=b.clone().sub(a), l=d.length(); box((a.x+b.x)/2,(a.y+b.y)/2,(a.z+b.z)/2,.035*WU,l,.035*WU,ROPE,new THREE.Quaternion().setFromUnitVectors(new V3(0,1,0),d.normalize())); }
  const crate=(x,z,y,s,i)=>{ const c=tone([.55,.45,.32],.3,i); box(x,y+s/2,z,s,s,s,c,0,hs(i,3)*.3,0); for(const d of [-1,1])box(x,y+s/2,z+d*s*.505,s*1.02,s*.12,.02*WU,DK,0,hs(i,3)*.3,0); SOL.up.push([x-s*.6,z-s*.6,x+s*.6,z+s*.6]); };
  const cS=.55*WU; crate(X+HW-.9*T,zH-1.2*T,0,cS,1); crate(X+HW-.95*T,zH-1.25*T,cS,cS*.9,2); crate(X+HW-1.8*T,zH-1*T,0,cS*.85,3); crate(X-hw+.55*T,Q-19*T,0,cS*.8,4);
  const barrel=(x,z,i)=>{ const c=i%2?[.36,.22,.14]:[.2,.28,.33]; cyl(x,.45*WU,z,.28*WU,.9*WU,c); for(const y of [.15,.45,.75])cyl(x,y*WU,z,.295*WU,.05*WU,IRON); SOL.up.push([x-.3*T,z-.3*T,x+.3*T,z+.3*T]); };
  barrel(X-HW+.8*T,zH-1.1*T,0); barrel(X-HW+1.5*T,zH-.9*T,1); barrel(X+hw-.45*T,Q-3*T,2);
  for(const [x,z,c] of [[X-HW+3.6*T,zE+.8*T,[.85,.84,.8]],[X+.9*T,zE+.8*T,[.86,.42,.12]],[X-hw+.5*T,Q-9*T,[.85,.84,.8]]]){ cyl(x,.17*WU,z,.15*WU,.34*WU,c); cyl(x,.34*WU,z,.155*WU,.02*WU,[.1,.1,.1]); }
  // a bench on the walk, the cleaning table and the tackle box at the head, the life ring on its post
  { const bz=Q-12*T, bx=X+hw-.45*T; box(bx,.42*WU,bz,.4*WU,.06*WU,1.6*WU,WD); box(bx+.18*WU,.7*WU,bz,.05*WU,.4*WU,1.6*WU,WD); for(const d of [-.65,.65])box(bx,.2*WU,bz+d*WU,.36*WU,.4*WU,.06*WU,DK); SOL.up.push([bx-.25*T,bz-.75*T,bx+.25*T,bz+.75*T]);
    const tx=X+.6*T, tz=zE+2.1*T; box(tx,.85*WU,tz,1.4*WU,.06*WU,.6*WU,GRY); box(tx,.89*WU,tz,.6*WU,.03*WU,.35*WU,[.75,.7,.62]); for(const a of [-.6,.6])for(const b of [-.25,.25])box(tx+a*WU,.42*WU,tz+b*WU,.06*WU,.84*WU,.06*WU,DK);
    box(tx-.3*WU,.93*WU,tz+.05*WU,.16*WU,.012*WU,.03*WU,[.8,.82,.85]); SOL.up.push([tx-.8*T,tz-.4*T,tx+.8*T,tz+.4*T]);
    box(X-.9*T,.12*WU,zE+1.3*T,.45*WU,.22*WU,.25*WU,[.22,.36,.24]); box(X-.9*T,.24*WU,zE+1.3*T,.12*WU,.03*WU,.04*WU,IRON);
    { const rx=X-hw-.04*WU, ry=.72*WU, rz=Q-16.2*T; TO.push([rx,ry,rz,.28*WU,[.84,.22,.15],1]); for(let k=0;k<4;k++){ const a=k*Math.PI/2+.785; box(rx,ry+Math.sin(a)*.28*WU,rz+Math.cos(a)*.28*WU,.11*WU,.1*WU,.1*WU,[.92,.9,.86]); } } }
  // (no shed on the pier head: bait is sold at FISHING & SCUBA, owner 7 Nov 2026)
  // a net hung to dry over the head's rail (no sign: owner, 7 Nov 2026)
  { const net=cv(64,32,(g,w,h)=>{ g.clearRect(0,0,w,h); g.strokeStyle='rgba(70,72,64,1)'; g.lineWidth=1; for(let x=0;x<w;x+=4){ g.beginPath(); g.moveTo(x,0); g.lineTo(x+2,h); g.stroke(); } for(let y=0;y<h;y+=4){ g.beginPath(); g.moveTo(0,y); g.lineTo(w,y+1); g.stroke(); }
      g.fillStyle='#c8b070'; for(let x=2;x<w;x+=10)g.fillRect(x,0,3,2); });
    const ng=new THREE.PlaneGeometry(2.4*WU,1*WU,6,3), p=ng.attributes.position; for(let i=0;i<p.count;i++){ const u=p.getX(i)/(1.2*WU); p.setZ(i,(1-u*u)*.12*WU*(p.getY(i)<0?1:.3)); } ng.rotateY(Math.PI/2); ng.translate(X+HW-.18*WU,RH-.5*WU,zH-2.7*T);
    const nm=new THREE.Mesh(ng,new THREE.MeshLambertMaterial({map:net,transparent:true,alphaTest:.4,side:THREE.DoubleSide})); G.add(nm);
  }
  // the pier at night: bulbs strung along both rails, concrete benches facing the water, gulls on the pilings, rods and buckets by the rails (owner, 7 Nov 2026)
  for(const s of [-1,1])for(let z=Q-1.2*T;z>zH+.6*T;z-=1.5*T)GL.push([X+s*(hw-.06*WU),RH+.05*WU,z,.09*WU,.09*WU,.09*WU]);
  const CON=[.62,.61,.58], CONd=[.5,.49,.47], bench=(x,z,s,i)=>{ box(x,.44*WU,z,.5*WU,.1*WU,1.9*WU,tone(CON,.12,i)); for(const d of [-.7,.7])box(x,.2*WU,z+d*WU,.42*WU,.4*WU,.18*WU,tone(CONd,.1,i+d)); box(x+s*.22*WU,.75*WU,z,.08*WU,.5*WU,1.9*WU,tone(CON,.12,i+3));
    SOL.up.push([x-.3*T,z-1*T,x+.3*T,z+1*T]); FIX.up.push([x-.3*T,z-1*T,0,x+.3*T,z+1*T,.5*WU]); };
  { let k=0; for(let z=Q-6*T;z>zH+2*T;z-=9*T,k++){ bench(X-hw+.6*T,z,-1,k); bench(X+hw-.6*T,z-4.5*T,1,k+50); } bench(X-.8*T,zH-HD/2,-1,99); bench(X+.8*T,zH-HD/2,1,98); }
  const gull=(x,z,y,h,i)=>{ const c=Math.cos(h), sn=Math.sin(h); box(x,y+.12*WU,z,.14*WU,.14*WU,.34*WU,[.93,.93,.9],0,h,0); box(x+sn*.2*WU,y+.2*WU,z+c*.2*WU,.1*WU,.11*WU,.12*WU,[.95,.95,.93],0,h,0);
    box(x+sn*.29*WU,y+.19*WU,z+c*.29*WU,.03*WU,.03*WU,.08*WU,[.95,.72,.2],0,h,0); for(const d of [-1,1])box(x+c*d*.08*WU,y+.15*WU,z-sn*d*.08*WU,.03*WU,.08*WU,.3*WU,[.55,.57,.6],0,h,0); box(x-sn*.2*WU,y+.12*WU,z-c*.2*WU,.12*WU,.04*WU,.12*WU,[.2,.2,.22],0,h,0); };
  { let i=0; for(const [px,pz] of RIVER.posts.slice(-60))if(hs(px*3,pz*5)<.12&&i<9){ gull(px,pz,.55*WU,hs(px,pz)*6.28,i++); } }
  for(let z=Q-8*T,k=0;z>zH+3*T;z-=11*T,k++){ const s=k%2?1:-1, x=X+s*(hw-.25*T); const r=new THREE.Quaternion().setFromEuler(new THREE.Euler(0,0,s*.35)); box(x,1.05*WU,z,.025*WU,2.4*WU,.025*WU,[.15,.13,.12],r); box(x-s*.15*WU,.5*WU,z+.2*T,.03*WU,.03*WU,.03*WU,[.75,.75,.78]);
    cyl(x-s*.35*T,.18*WU,z+.5*T,.15*WU,.36*WU,k%2?[.82,.82,.78]:[.86,.42,.12]); }
  // the T head, as on real fishing piers: a rail all round (open at the ladder), lamps along both edges, concrete benches facing the water, a shade pavilion, fish-cleaning stations, bins, rod holders on the rail, picnic tables, life rings
  { const rail=(x0,x1,z,i)=>{ if(x1-x0<.4*T)return; for(let x=x0;x<=x1+1e-6;x+=Math.max(.6*T,(x1-x0)/Math.ceil((x1-x0)/(1.5*T))))box(x,RH/2,z,.1*WU,RH,.1*WU,tone(GRY,.25,i+x));
      box((x0+x1)/2,RH-.03*WU,z,x1-x0,.06*WU,.14*WU,GRY); box((x0+x1)/2,RH*.55,z,x1-x0,.1*WU,.05*WU,tone(GRY,.2,i)); SOL.up.push([x0,z-.12*T,x1,z+.12*T]); FIX.up.push([x0,z-.12*T,0,x1,z+.12*T,RH]);
      for(let x=x0+.8*T;x<x1-.4*T;x+=1.5*T)cyl(x,RH+.12*WU,z,.045*WU,.36*WU,[.86,.86,.82]); };   // rod holders: white tubes on the rail
    const FZ=zE+.12*WU, BZ=zH-.12*WU; rail(X-HW+.15*T,X-1.1*T,FZ,1); rail(X+1.1*T,X+HW-.15*T,FZ,2); rail(X-HW+.15*T,X-hw-.2*T,BZ,3); rail(X+hw+.2*T,X+HW-.15*T,BZ,4);
    for(let x=X-HW+3*T,k=0;x<X+HW-2*T;x+=7*T,k++){ lamp(x,FZ+.35*T,k%2?1:-1); if(Math.abs(x-X)>hw+1.5*T)lamp(x+3.5*T,BZ-.35*T,k%2?-1:1); }
    const benchX=(x,z,s,i)=>{ box(x,.44*WU,z,1.9*WU,.1*WU,.5*WU,tone(CON,.12,i)); for(const d of [-.7,.7])box(x+d*WU,.2*WU,z,.18*WU,.4*WU,.42*WU,tone(CONd,.1,i+d)); box(x,.75*WU,z+s*.22*WU,1.9*WU,.5*WU,.08*WU,tone(CON,.12,i+3));
      SOL.up.push([x-1*T,z-.3*T,x+1*T,z+.3*T]); FIX.up.push([x-1*T,z-.3*T,0,x+1*T,z+.3*T,.5*WU]); };
    for(let x=X-HW+5*T,k=0;x<X+HW-3*T;x+=7*T,k++)if(Math.abs(x-X)>2.5*T)benchX(x,FZ+1.4*T,1,200+k);
    // the shade pavilion in the middle: four posts, a pitched roof, two benches under it
    { const pz=(zE+zH)/2, pw=4.5*T, pd=3.2*T; for(const a of [-1,1])for(const b of [-1,1])box(X+a*pw/2,1.4*WU,pz+b*pd/2,.18*WU,2.8*WU,.18*WU,DK); box(X,2.85*WU,pz,pw+.4*T,.12*WU,pd+.4*T,DK);
      for(const b of [-1,1])box(X,3.15*WU,pz+b*pd/4,pw+.6*T,.06*WU,pd/2+.3*T,[.36,.4,.42],b*.28,0,0); for(const a of [-1,1])for(const b of [-1,1])SOL.up.push([X+a*pw/2-.15*T,pz+b*pd/2-.15*T,X+a*pw/2+.15*T,pz+b*pd/2+.15*T]);
      benchX(X,pz-.7*T,1,300); benchX(X,pz+.7*T,-1,301); }
    // fish-cleaning stations: a steel-topped table with a sink and a hose, a bin beside
    for(const a of [-.55,.55]){ const x=X+a*HW, z=zH-1.6*T; box(x,.85*WU,z,2*WU,.06*WU,.7*WU,[.72,.74,.76]); box(x+.5*WU,.82*WU,z,.5*WU,.08*WU,.4*WU,[.4,.42,.44]); for(const u of [-.9,.9])for(const v of [-.3,.3])box(x+u*WU,.42*WU,z+v*WU,.06*WU,.84*WU,.06*WU,GRY);
      cyl(x-.8*WU,1.15*WU,z-.25*WU,.03*WU,.6*WU,IRON); box(x,1.4*WU,z+.3*WU,2*WU,.9*WU,.05*WU,[.86,.86,.82]); SOL.up.push([x-1.1*T,z-.4*T,x+1.1*T,z+.4*T]); FIX.up.push([x-1.1*T,z-.4*T,0,x+1.1*T,z+.4*T,.9*WU]);
      cyl(x+1.6*T,.45*WU,z,.28*WU,.9*WU,[.18,.36,.22]); cyl(x+2.3*T,.45*WU,z,.28*WU,.9*WU,[.16,.3,.58]); for(const o of [1.6,2.3])SOL.up.push([x+o*T-.3*T,z-.3*T,x+o*T+.3*T,z+.3*T]); }
    // picnic tables, and life rings on posts at both ends
    for(const a of [-.3,.3]){ const x=X+a*HW, z=(zE+zH)/2; box(x,.75*WU,z,1.8*WU,.06*WU,.8*WU,tone(WD,.2,a*9)); for(const d of [-.6,.6])box(x,.45*WU,z+d*WU,1.8*WU,.05*WU,.3*WU,tone(WD,.2,a*9+d)); for(const u of [-.7,.7])box(x+u*WU,.37*WU,z,.08*WU,.74*WU,1.4*WU,DK); SOL.up.push([x-1*T,z-.8*T,x+1*T,z+.8*T]); }
    for(const a of [-1,1]){ const rx=X+a*(HW-.4*T), rz=(zE+zH)/2; box(rx,.6*WU,rz,.12*WU,1.2*WU,.12*WU,DK); TO.push([rx,1.0*WU,rz,.28*WU,[.84,.22,.15],1]); } }
  // into instanced meshes: one for the timber and iron boxes, one for the round things, one for the rope, one for the glass
  const M=new THREE.Matrix4(), q=new THREE.Quaternion(), e=new THREE.Euler(), V=THREE.Vector3, c=new THREE.Color();
  const inst=(geo,mat,L,f)=>{ const me=new THREE.InstancedMesh(geo,mat,L.length); L.forEach((b,i)=>{ f(b,M); me.setMatrixAt(i,M); if(b.col!==false)me.setColorAt(i,c.setRGB(...(b[6]||b[4]||[1,1,1]))); }); me.castShadow=me.receiveShadow=true; me.computeBoundingSphere(); G.add(me); return me; };
  inst(new THREE.BoxGeometry(1,1,1),woodM,BX,(b,M)=>M.compose(new V(b[0],b[1],b[2]),b[7]&&b[7].isQuaternion?b[7]:q.setFromEuler(e.set(b[7],b[8],b[9])),new V(b[3],b[4],b[5])));
  const piles=CY.filter(b=>b[10]), rounds=CY.filter(b=>!b[10]);
  inst(new THREE.CylinderGeometry(1,1,1,8),pileM,piles,(b,M)=>M.compose(new V(b[0],b[1],b[2]),q.setFromEuler(e.set(0,0,b[9])),new V(b[3],b[4],b[5])));
  inst(new THREE.CylinderGeometry(1,1,1,10),ironM,rounds,(b,M)=>M.compose(new V(b[0],b[1],b[2]),q.setFromEuler(e.set(b[7],0,b[9])),new V(b[3],b[4],b[5])));
  const tor=new THREE.TorusGeometry(1,.16,4,12); tor.rotateX(Math.PI/2);
  inst(tor,ironM,TO,(b,M)=>M.compose(new V(b[0],b[1],b[2]),b[5]?q.setFromEuler(e.set(0,0,Math.PI/2)):q.identity(),b[5]?new V(b[3],b[3],b[3]):new V(b[3],b[3]*.8,b[3])));
  const glassM=new THREE.MeshBasicMaterial({color:0xffffff}), glass=inst(new THREE.BoxGeometry(1,1,1),glassM,GL.map(g=>[...g,[1,.8,.5]]),(b,M)=>M.compose(new V(b[0],b[1],b[2]),q.identity(),new V(b[3],b[4],b[5]))); glass.castShadow=false;
  PIER.lamps=LAMPS; PIER.cost=()=>{ let t=0, d=0; G.traverse(o=>{ if(!o.isMesh)return; const g=o.geometry, n=(g.index?g.index.count:g.attributes.position.count)/3; t+=n*(o.isInstancedMesh?o.count:1); d++; }); return {tris:Math.round(t),draws:d,lights:LAMPS.length}; };
  // lit at dusk, out at dawn
  let lt=0, on=null; PIER.tick=dt=>{ if(!RIVER.shown)return; lt-=dt; if(lt>0)return; lt=.5; const d=CLOCK.dark(); if(d===on)return; on=d; for(const L of LAMPS)L.intensity=d?L.userData.i0:0; glassM.color.setScalar(d?1.6:.35); };
  SYS.add('places',dt=>PIER.tick(dt||0),'066b-pier');
  function mergeG(list){ const pos=[], nor=[], uv=[]; for(const g of list){ const n=g.index?g.toNonIndexed():g; pos.push(...n.attributes.position.array); nor.push(...n.attributes.normal.array); uv.push(...n.attributes.uv.array); }
    const o=new THREE.BufferGeometry(); o.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); o.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3)); o.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2)); return o; }
});
export {PIER};
