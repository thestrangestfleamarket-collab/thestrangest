// THE ARCADE: the arcade on Main Street as one painted block (its neon ARCADE front); its inside is built off the map when you go in: black walls, four cabinets along each side wall (double-click one to play its game; the games register in 059g), and the holodeck behind the back wall (double-click its door): an empty green grid with a panel on its far wall (double-click it for the list of adventures, each a program in STORE.holo.programs).
import {SHARED, THREE} from './003-shx.js';
import {FORAGE, INV, ROOMS, TEXT, UI, WIELD} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {scene} from './004-main.js';
import {BLDK, FADE, FIX, grab, LEVEL, OFFDX, SOL, STORE, SYS, TILE, TURN, WP} from './006-map-pre.js';
import {BATCH} from './008-batch.js';
import {LAMPS} from './014-gamekit.js';
import {BLOCKS} from './038zb-blocks.js';
import {FACADES} from './038zc-facades.js';
await grab('arcade',async()=>{ const {X,Z,faceTex,bq,C}=SHARED.BOD, Y=SHARED.BOD.Y, {hash:hs}=SHARED.BOD.g, sh=SHARED.BOD.K.sh, MS=STORE.main;
  const HOLO=STORE.holo={programs:[],run:null,hall:null}, say=(t,c)=>SAY(t,c);
  const SKN=k=>{ const s=(FORAGE.SK||[]).find(s=>s[0]===k); return s?s[1]:String(k||'').toUpperCase(); }, esc=TEXT.esc;
  const hp=document.createElement('div'); hp.id='holog'; hp.hidden=true;
  hp.style.cssText='position:fixed;left:50%;top:10%;transform:translateX(-50%);width:min(520px,92vw);max-height:80vh;overflow:auto;z-index:21;padding:14px 16px;font:11px Silkscreen,monospace;letter-spacing:.4px;color:#d8dae2;background:#0b0d13f2;border:2px solid #3a3f4e;zoom:var(--uiz,1)';
  document.body.appendChild(hp); hp.addEventListener('keyup',e=>e.stopPropagation()); hp.addEventListener('keydown',e=>{ if(e.key==='Escape')HOLO.hide(); e.stopPropagation(); });
  const xb=document.createElement('button'); xb.className='pX'; xb.textContent='X'; xb.style.cssText='position:absolute;right:10px;top:10px;font:inherit;color:#c9ccd6;background:#0e1016;border:2px solid #3a3f4e;padding:3px 8px;cursor:pointer'; xb.onclick=()=>HOLO.hide(); hp.appendChild(xb);
  const B='style="font:inherit;color:#ece5d3;background:#0e1016;border:2px solid #3a3f4e;padding:2px 7px;cursor:pointer"';
  HOLO.draw=()=>{ '@later'; if(hp.hidden)return; let o='<h3 style="margin:0 0 4px;color:#f2c14e;font:12px Silkscreen,monospace">THE HOLODECK</h3><div style="color:#9b9584;margin-bottom:8px">'+(HOLO.run?'RUNNING: '+esc(HOLO.run.P.name):'PICK AN ADVENTURE.')+'</div><div style="margin-bottom:8px">YOU HAVE <b style="color:#f2c14e">$'+Math.round(INV.cash)+'</b></div>';
    o+=HOLO.programs.length?'<table style="border-collapse:collapse;width:100%">'+HOLO.programs.map((P,i)=>'<tr style="border-bottom:1px solid #22252f"><td style="padding:4px 2px">'+esc(P.name)+(P.skill?'<div style="color:#9b9584">'+esc(SKN(P.skill))+'</div>':'')+'</td><td style="text-align:right;padding:4px 6px">'+(P.cost===0?'FREE':'$'+(P.cost==null?8:P.cost))+'</td><td style="text-align:right"><button '+B+' data-run="'+i+'"'+(HOLO.run?' disabled':'')+'>RUN</button></td></tr>').join('')+'</table>':'<div style="color:#9b9584">NO ADVENTURES ARE LOADED.</div>';
    if(HOLO.run)o+='<div style="margin-top:8px"><button '+B+' data-end="1">END PROGRAM</button></div>'; hp.innerHTML=o; hp.appendChild(xb); };
  hp.addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b||b.classList.contains('pX'))return; if(b.dataset.end){ HOLO.end(); HOLO.draw(); return; } const P=HOLO.programs[+b.dataset.run]; if(P)HOLO.start(P); });
  HOLO.menu=()=>{ hp.hidden=false; HOLO.draw(); if(UI.menuLook)UI.menuLook(); };
  HOLO.hide=()=>{ hp.hidden=true; };
  HOLO.end=()=>{ const D=HOLO.run; if(!D)return; HOLO.run=null; if(D.P.hide)D.P.hide(); };
  HOLO.close=()=>{ HOLO.end(); HOLO.hide(); HOLO.hall=null; };
  HOLO.start=P=>{ '@later'; if(HOLO.run||!HOLO.hall)return; const c=P.cost||0; if(INV.cash<c)return say('THE HOLODECK TAKES $'+c+' FOR THIS PROGRAM.','#c8a090'); INV.cash-=c; if(P.tool){ if(!FORAGE.has(P.tool))FORAGE.give(P.tool,1); if(WIELD.on!==P.tool)WIELD.set(P.tool); }
    const H=HOLO.hall; HOLO.run={P,x:H.x,z:H.z,n:0,good:0,t:2}; HOLO.hide(); if(P.place)P.place(H.x,H.z,0,H.G); if(P.intro)say(P.intro,'#7dffa4'); if(P.go)P.go(HOLO.run); };
  SYS.add('strike',()=>{ const D=HOLO.run; if(D&&D.P.strike)D.P.strike(D); },'holodeck program');
  SYS.add('places',dt=>{ const D=HOLO.run; if(!D)return;
    if(D.P.room&&ROOMS.offIn){ const at=ROOMS.offIn(), Lz=ROOMS.lazy&&ROOMS.lazy[D.P.room]; if(at===D.P.room||Lz&&Lz.done)D.inWorld=true; }   // in its world once the world is built, even mid-fade
    if(D.P.room&&ROOMS.offIn&&!FADE.busy){ const at=ROOMS.offIn(); const now=performance.now(); if(at===D.P.room){ D.outAt=0; } else if(D.inWorld&&now-(D.outAt||(D.outAt=now))>1000){ HOLO.end(); if(at!=='arcade'){ HOLO.hide(); HOLO.hall=null; } return; } }   // out of an adventure's world for a second, whichever way you left: the program is over (a one-frame gap in the room tracker is not leaving)
    if(D.P.run)D.P.run(D,dt); },'holodeck program');

  const box4=(x0,y0,x1,y1)=>{ const a=X(x0), b=X(x1), c=Z(y0), d=Z(y1); return [Math.min(a,b),Math.min(c,d),Math.max(a,b),Math.max(c,d)]; };
  const MKA=(k,map,emap)=>k==='B'?new THREE.MeshBasicMaterial({map,side:THREE.DoubleSide,alphaTest:.5}):new THREE.MeshLambertMaterial({map,alphaTest:.5,side:THREE.DoubleSide,...(emap?{emissiveMap:emap,emissive:0xffffff,emissiveIntensity:1.3}:{})});
  const LW=MS.lot('arcade',180), TA=TURN(LW,WP.arcade.face), L=TA.L, W=L.x1-L.x0, lcx=(L.x0+L.x1)/2, at=(u,v)=>{ const p=TA.pt(u,v); return [X(p[0]),Z(p[1])]; }, k6=6, c0=Math.floor((W*24-35*k6)/2), on=MS.word('ARCADE',c0,118,k6), litc=c=>Object.assign(c.slice(),{e:1});
  const front=(u,z,f)=>{ const c=Math.floor(u*24), dd=Math.abs(u-W/2);
    if(z<8)return sh([44,34,52],f);
    if(z<96&&dd<.78)return dd>.7||z>90?litc([255,80,200]):z>60?sh([40,24,52],f):sh([30,20,40],f*(Math.floor(u*24)%6===0?.8:1));
    if(z<96&&u>.5&&u<W-.5){ const m=(u-.5)%2.1; return m<.08||z<11||z>93?sh([58,40,70],f):sh([20,16,32],f); }
    if(z>=98&&z<102)return litc([236,64,160]); if(z>=104&&z<106)return litc([60,206,230]);
    if(z>=110&&z<170&&c>=c0-8&&c<c0+35*k6+8)return MS.neon(on,c,z,k6,[255,80,200],f)||sh([24,16,32],f);
    return null; };
  const wall=BLOCKS.brick([96,58,80]);
  if(WP.arcade.pf==='bodega'){ const fy=LW.y1, X=SHARED.BOD.X, Z=SHARED.BOD.Z; (SHARED.PFCORNER=SHARED.PFCORNER||[]).push({id:'arcade',x:X((LW.x0+LW.x1)/2),zf:Z(fy),zi:Math.sign(Z(fy-1)-Z(fy)),rot:TA.hd(0),flip:true}); }   // the Hudson entrance's east corner in the bodega's building, mirrored (owner, 8 Nov 2026)
  else FACADES.make({id:'arcade',L,pt:TA.pt,z1:L.h,wall:[96,58,80],trim:[150,120,170],frame:[58,40,70],seed:53,ground:118,door:{u:lcx,w:.9},glass:true,sign:{text:'ARCADE',color:[255,80,200],bg:[24,16,32]}});
  if(0)BLOCKS.make({x0:LW.x0,x1:LW.x1,y0:LW.y0,y1:LW.y1,z0:0,z1:L.h,kind:'A',turn:TA,roof:(x,y)=>sh([40,36,44],.92+.12*hs(Math.floor(x*4),Math.floor(y*4),61)),
    paint:(side,u,z,f)=>(side==='f'&&front(u-L.x0,z,f))||(z>L.h-10?sh([60,44,70],f):wall(u,z,f))});
  BATCH.build(MKA); for(const me of Object.values(BATCH.meshes)){ me.castShadow=true; me.receiveShadow=true; } BATCH.meshes={};
  { const r=box4(LW.x0,LW.y0,LW.x1,LW.y1); SOL.up.push(r); FIX.up.push([r[0],r[1],0,r[2],r[3],Y(L.h)]); }
  MS.unplace('ARCADE'); MS.unplace('THE ARCADE');

  const AX=480+OFFDX/BLDK, AR={x0:AX,x1:AX+16,y0:-100,y1:-87}, HD={x0:AX,x1:AX+16,y0:-113,y1:-100}, cx=(AR.x0+AR.x1)/2, hy=(HD.y0+HD.y1)/2, WH=130, DW=.8, DH=95;
  STORE.bound.x1=Math.max(STORE.bound.x1,X(AR.x1+20)); STORE.bound.z0=Math.min(STORE.bound.z0,Z(HD.y0-6)); STORE.bound.z1=Math.max(STORE.bound.z1,Z(AR.y1+6));
  let AG=null, AS=[], PA=null; const ARC={scr:null}; SYS.add('places',dt=>{ if(ARC.scr)ARC.scr(dt); },'arcade screens');
  const build=()=>{ '@arcade';
    const S=1.6, ZM=38;
  const lit=c=>Object.assign([c[0],c[1],c[2]],{e:1}), hex=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
  const pic=(w,h,f)=>{ const c=document.createElement('canvas'); c.width=w; c.height=h; const g=c.getContext('2d'); f(g,w,h); const d=g.getImageData(0,0,w,h).data;
    return (u,v)=>{ const i=Math.min(w-1,Math.max(0,Math.floor(u*w))), j=Math.min(h-1,Math.max(0,Math.floor(v*h))), k=(j*w+i)*4; return d[k+3]<128?null:[d[k],d[k+1],d[k+2]]; }; };
  const F3={A:'010101111101101',B:'110101110101110',C:'111100100100111',D:'110101101101110',E:'111100110100111',F:'111100110100100',G:'111100101101111',H:'101101111101101',I:'111010010010111',J:'001001001101111',K:'101101110101101',L:'100100100100111',M:'101111111101101',N:'110101101101101',O:'111101101101111',P:'111101111100100',Q:'111101101111001',R:'111101110101101',S:'111100111001111',T:'111010010010010',U:'101101101101111',V:'101101101101010',W:'101101111111101',X:'101101010101101',Y:'101101010010010',Z:'111001010100111',0:'111101101101111',1:'010110010010111',2:'111001111100111',3:'111001111001111',4:'101101111001001',5:'111100111001111',6:'111100111101111',7:'111001001001001',8:'111101111101111',9:'111101111001111','-':'000000111000000','.':'000000000000010','&':'010101010101011',"'":'010010000000000','!':'010010010000010','$':'111110111011111'};
  const txt=(g,s,x,y,k,col)=>{ g.fillStyle=col; [...s].forEach((ch,i)=>{ const q=F3[ch]; if(!q)return; for(let r=0;r<5;r++)for(let c=0;c<3;c++)if(q[r*3+c]==='1')g.fillRect(x+(i*4+c)*k,y+r*k,k,k); }); };
  const tw=(s,k)=>(s.length*4-1)*k, ctxt=(g,s,cx,y,k,col)=>txt(g,s,Math.round(cx-tw(s,k)/2),y,k,col);
  const SIDE={e:[1,0],w:[-1,0],f:[0,1],b:[0,-1]};
  const fu=(sd,b,P,Q)=>sd==='e'?(b.y1-Q)/(b.y1-b.y0):sd==='w'?(Q-b.y0)/(b.y1-b.y0):sd==='f'?(P-b.x0)/(b.x1-b.x0):(b.x1-P)/(b.x1-b.x0);
  const bx=(x0,y0,x1,y1,z0,z1,c,o={})=>({x0:Math.min(x0,x1),y0:Math.min(y0,y1),x1:Math.max(x0,x1),y1:Math.max(y0,y1),z0,z1,c,...o});
  const pb=(b,sd,p,glow)=>{ const [ax,ay]=SIDE[sd]; b.fs=(nx,ny,P,Q,z,s)=>{ if(nx===ax&&ny===ay){ const r=p(fu(sd,b,P,Q),1-z/(b.z1-b.z0)); if(r)return glow&&!b.em?lit(r):r; } return b.em?b.c:sh(b.c,s); }; return b; };
  const mb=(x0,z0,x1,z1,h0,h1,c,o)=>bx(mx(x0),my(z0),mx(x1),my(z1),h0*ZM,h1*ZM,c,o);
  const thing=(name,boxes,o={})=>{ for(const b of boxes)SHARED.BOD.gbox(b,'A'); if(!o.high&&boxes.length){ sol(Math.min(...boxes.map(b=>b.x0)),Math.min(...boxes.map(b=>b.y0)),Math.max(...boxes.map(b=>b.x1)),Math.max(...boxes.map(b=>b.y1))); } };
  const lamp=(x,z,h,r,c,o={})=>LAMPS.push({own:1,room:1,day:true,x:mx(x),y:my(z),z:h*ZM,r,c,...o});
  const wallAt={b:m=>[mx(m),B.y0+.1],f:m=>[mx(m),B.y1-.1],e:m=>[B.x0+.1,my(m)],w:m=>[B.x1-.1,my(m)],pw:m=>[PX-.13,my(m)],pe:m=>[PX+.13,my(m)]};
  const FACE={b:'f',f:'b',e:'e',w:'w',pw:'w',pe:'e'};
  const onWall=(name,wl,u,h0,h1,wm,p,o={})=>{ const [x,y]=wallAt[wl](u), sd=FACE[wl], [ax,ay]=SIDE[sd], t=o.t||.06, hw=wm*S/2;
    const b=ax?bx(x,y-hw,x+ax*t,y+hw,h0*ZM,h1*ZM,o.c||[14,12,18],{em:o.em}):bx(x-hw,y,x+hw,y+ay*t,h0*ZM,h1*ZM,o.c||[14,12,18],{em:o.em});
    thing(name,[pb(b,sd,p,o.glow)],{high:1}); };
  const halo=(g,w,h,col)=>{ const d=g.getImageData(0,0,w,h), a=d.data, m=new Uint8Array(w*h); for(let i=0;i<w*h;i++)m[i]=a[i*4+3]>0?1:0;
    const grow=(src)=>{ const o=new Uint8Array(w*h); for(let y=0;y<h;y++)for(let x=0;x<w;x++){ if(src[y*w+x]){ o[y*w+x]=1; continue; } for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const X_=x+dx, Y_=y+dy; if(X_>=0&&Y_>=0&&X_<w&&Y_<h&&src[Y_*w+X_]){ o[y*w+x]=1; break; } } } return o; };
    const r1=grow(grow(m)), r2=grow(grow(r1)), [cr,cg,cb]=hex(col);
    for(let i=0;i<w*h;i++){ if(m[i])continue; const k=r1[i]?.5:r2[i]?.24:0; if(!k)continue; a[i*4]=cr*k; a[i*4+1]=cg*k; a[i*4+2]=cb*k; a[i*4+3]=255; } g.putImageData(d,0,0); };
  const neon=(s,col,core,k,pad=6,bulbs)=>{ const w=tw(s,k)+pad*2+4, h=5*k+pad*2+4; return [w,h,pic(w,h,(g)=>{ 
    txt(g,s,pad+2-1,pad+2,k,col); txt(g,s,pad+2+1,pad+2,k,col); txt(g,s,pad+2,pad+1,k,col); txt(g,s,pad+2,pad+3,k,col); txt(g,s,pad+2,pad+2,k,core); halo(g,w,h,col);
    const d=g.getImageData(0,0,w,h); for(let i=3;i<d.data.length;i+=4)if(!d.data[i]){ d.data[i-3]=12; d.data[i-2]=10; d.data[i-1]=18; d.data[i]=255; } g.putImageData(d,0,0);
    if(bulbs){ g.fillStyle=bulbs; for(let x=2;x<w-2;x+=5){ g.fillRect(x,1,2,2); g.fillRect(x,h-3,2,2); } for(let y=2;y<h-2;y+=5){ g.fillRect(1,y,2,2); g.fillRect(w-3,y,2,2); } } })]; };
  const sign=(name,wl,u,hc,s,col,core,k,mpp,bulbs)=>{ const [w,h,p]=neon(s,col,core,k,6,bulbs), wm=w*mpp, hm=h*mpp; onWall(name,wl,u,hc-hm/2,hc+hm/2,wm,p,{em:1,t:.04}); };
    const PAL=['#3cf0ff','#ff3ca8','#ffe83c','#5aff6a','#a46bff','#ff8a2a','#2a7bff'];
    const carpet=pic(77,77,(g,w,h)=>{ g.fillStyle='#000'; g.fillRect(0,0,w,h); let sd=5; const r=()=>((sd=(sd*16807)%2147483647)/2147483647);
      for(let k=0;k<11;k++){ const x=r()*w, y=r()*h, col=PAL[Math.floor(r()*7)], t=Math.floor(r()*5), a=r()*6.28, s=3+r()*3;
        for(const ox of [-w,0,w])for(const oy of [-h,0,h]){ g.save(); g.translate(x+ox,y+oy); g.rotate(a); g.strokeStyle=col; g.lineWidth=1.6; g.beginPath();
          if(t===0)for(let i=0;i<=10;i++)g.lineTo(i*1.2-6,Math.sin(i*.9)*2.2); else if(t===1){ g.moveTo(-s,s*.7); g.lineTo(s,s*.7); g.lineTo(0,-s); g.closePath(); }
          else if(t===2)g.arc(0,0,s*.6,0,7); else if(t===3){ g.ellipse(0,0,s*.9,s*.35,0,0,7); } else { g.moveTo(-s,0); g.lineTo(-s/2,-2); g.lineTo(0,0); g.lineTo(s/2,-2); g.lineTo(s,0); }
          g.stroke(); g.restore(); } }
      for(let k=0;k<12;k++){ g.fillStyle=PAL[Math.floor(r()*7)]; g.fillRect(Math.floor(r()*w),Math.floor(r()*h),1,1); }
      const d=g.getImageData(0,0,w,h), P=PAL.map(hex); for(let i=0;i<d.data.length;i+=4){ const a=d.data; if(Math.max(a[i],a[i+1],a[i+2])<90){ a[i]=a[i+1]=a[i+2]=0; continue; } let best=0, bd=1e9; P.forEach((p,j)=>{ const q=(p[0]-a[i])**2+(p[1]-a[i+1])**2+(p[2]-a[i+2])**2; if(q<bd){ bd=q; best=j; } }); [a[i],a[i+1],a[i+2]]=P[best]; a[i+3]=255; } g.putImageData(d,0,0); });

    const sol=(x0,y0,x1,y1)=>{ const r=box4(x0,y0,x1,y1); AS.push(r); SOL.up.push(r); };
    const gl=(a,b,w)=>{ const fa=a-Math.floor(a), fb=b-Math.floor(b); return fa<w||fa>1-w||fb<w||fb>1-w; };
    const GRID=(u,v)=>gl(u,v,.03)?[60,255,120,1]:sh([8,14,10],1+.06*hs(Math.floor(u),Math.floor(v),601));
    const inf=(u,z)=>{ const du=(u-cx)*24, dz=z-113; if(Math.abs(du)>26||dz<-15||dz>15)return null; if(Math.abs(du)>25||Math.abs(dz)>14)return [43,255,106,1];
      for(const [lx,core] of [[-8.6,0],[8.6,0]]){ const d=Math.hypot((du-lx)/1.15,dz); if(d>4.8&&d<7.8)return d>5.6&&d<7?[217,255,230,1]:[43,255,106,1]; } return [4,25,12]; };
    const black=(u,z,f)=>z<4?sh([10,9,12],f):(((u%1.6)+1.6)%1.6<.04?sh([26,24,32],f):sh([16,15,20],f));
    const WALL=(P0,P1,a0,a1,paint,h=WH,z0=0)=>{ const w=(a1-a0)*24; bq(P0(a0,z0),P0(a1,z0),P1(a1,h),P1(a0,h),faceTex(w,h-z0,(i,j)=>C(paint(a0+(i+.5)/24,h-j-.5))),'A'); };
    const PX=(y,o=0)=>(a,z)=>[X(a),Y(z),Z(y+o)], PY=(x,o=0)=>(a,z)=>[X(x+o),Y(z),Z(a)];
    const flo=(r,paint)=>bq([X(r.x0),Y(.15),Z(r.y1)],[X(r.x1),Y(.15),Z(r.y1)],[X(r.x1),Y(.15),Z(r.y0)],[X(r.x0),Y(.15),Z(r.y0)],faceTex((r.x1-r.x0)*24,(r.y1-r.y0)*24,(i,j)=>C(paint(r.x0+(i+.5)/24,r.y1-(j+.5)/24))),'A');
    const CW=3.2*S; flo(AR,(x,y)=>{ const c=carpet((((x-AR.x0)/CW)%1+1)%1,(((y-AR.y0)/CW)%1+1)%1); return c&&(c[0]||c[1]||c[2])?litc(c.map(q=>q*.8)):[10,9,14]; });
    flo(HD,(x,y)=>GRID(x,y));
    WALL(PY(AR.x0),PY(AR.x0),AR.y0,AR.y1,(u,z)=>black(u,z,.7)); WALL(PY(AR.x1),PY(AR.x1),AR.y0,AR.y1,(u,z)=>black(u,z,.7));
    WALL(PX(AR.y1),PX(AR.y1),AR.x0,AR.x1,(u,z)=>{ const d=Math.abs(u-cx); if(d<.78&&z<94)return d>.7||z>88?[255,42,42,1]:sh([30,20,40],.9); return black(u,z,.85); });
    const back=(u,z)=>inf(u,z)||GRID(u,z/24);
    const door=(u,z)=>{ const d=Math.abs(u-cx); return d>DW-.06||z>DH-3?[60,255,120,1]:Math.abs(d-DW/2)<.03?[28,120,58,1]:sh([10,18,14],.9); };
    WALL(PX(AR.y0,.03),PX(AR.y0,.03),AR.x0,AR.x1,(u,z)=>Math.abs(u-cx)<DW&&z<DH?door(u,z):back(u,z));
    WALL(PX(AR.y0,-.03),PX(AR.y0,-.03),AR.x0,AR.x1,(u,z)=>Math.abs(u-cx)<DW&&z<DH?door(u,z):GRID(u,z/24));
    const panel=(u,z)=>{ const du=(u-cx)*24, dz=z-66; if(Math.abs(du)>24||Math.abs(dz)>22)return null; if(Math.abs(du)>22||Math.abs(dz)>20)return [60,255,120,1]; if(Math.abs(du)>20||Math.abs(dz)>18)return [8,30,16];
      const r=Math.floor((dz+18)/6); if(r%2===0&&du>-16&&du<(r===4?2:14-((r*7)%9)))return r===4?[217,255,230,1]:[120,255,160,1]; return [4,12,7]; };
    WALL(PY(HD.x0),PY(HD.x0),HD.y0,HD.y1,(u,z)=>GRID(u,z/24)); WALL(PY(HD.x1),PY(HD.x1),HD.y0,HD.y1,(u,z)=>GRID(u,z/24)); WALL(PX(HD.y0),PX(HD.y0),HD.x0,HD.x1,(u,z)=>panel(u,z)||GRID(u,z/24));
    sol(AR.x0-.1,HD.y0,AR.x0+.1,AR.y1); sol(AR.x1-.1,HD.y0,AR.x1+.1,AR.y1); sol(AR.x0,AR.y1-.1,AR.x1,AR.y1+.1); sol(HD.x0,HD.y0-.1,HD.x1,HD.y0+.1); sol(AR.x0,AR.y0-.1,AR.x1,AR.y0+.1);
    const CW_=Math.abs(X(1)-X(0)), ZW_=Math.abs(Y(1)-Y(0)), KIT=STORE.cabs.kit(), SCRS=[];
    const ctex=(w,h,f)=>{ const c=document.createElement('canvas'); c.width=w; c.height=h; const g=c.getContext('2d'); f(g,w,h); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=4; return t; };
    const lam=(map,e=.3)=>new THREE.MeshLambertMaterial({map,emissiveMap:map,emissive:new THREE.Color(e,e,e)}), glow=map=>new THREE.MeshBasicMaterial({map});
    const rnd=((sd)=>()=>((sd=(sd*16807)%2147483647)/2147483647))(77);
    const wear=(g,w,h,k=1)=>{ for(let i=0;i<w*h/90*k;i++){ g.fillStyle=`rgba(${rnd()<.5?'255,255,255':'0,0,0'},${.03+rnd()*.06})`; g.fillRect(rnd()*w,rnd()*h,1+rnd()*2,1+rnd()*2); }
      g.lineWidth=.7; for(let i=0;i<14*k;i++){ g.strokeStyle=`rgba(255,255,255,${.05+rnd()*.12})`; g.beginPath(); const x=rnd()*w, y=rnd()*h; g.moveTo(x,y); g.lineTo(x+(rnd()-.5)*w*.25,y+(rnd()-.5)*h*.06); g.stroke(); }
      const sc=g.createLinearGradient(0,h*.82,0,h); sc.addColorStop(0,'rgba(0,0,0,0)'); sc.addColorStop(1,'rgba(0,0,0,.35)'); g.fillStyle=sc; g.fillRect(0,0,w,h); };
    const font=(g,s,x,y,sz,col,al='center',f='Impact,"Arial Black",sans-serif')=>{ g.font=`${sz}px ${f}`; g.textAlign=al; g.textBaseline='middle'; g.fillStyle=col; g.fillText(s,x,y); };
    const chrome=(g,s,x,y,sz,f)=>{ g.font=`${sz}px ${f||'Impact,"Arial Black",sans-serif'}`; g.textAlign='center'; g.textBaseline='middle'; const gr=g.createLinearGradient(0,y-sz/2,0,y+sz/2); gr.addColorStop(0,'#ffffff'); gr.addColorStop(.48,'#8ab0e0'); gr.addColorStop(.52,'#20304a'); gr.addColorStop(1,'#e0f0ff'); g.lineWidth=sz/10; g.strokeStyle='#100818'; g.strokeText(s,x,y); g.fillStyle=gr; g.fillText(s,x,y); };
    const dome=(g,x,y,r,col)=>{ g.fillStyle=col; g.beginPath(); g.moveTo(x-r,y); g.quadraticCurveTo(x-r*1.1,y-r*1.2,x,y-r*1.9); g.quadraticCurveTo(x+r*1.1,y-r*1.2,x+r,y); g.fill(); g.fillRect(x-r*.75,y,r*1.5,r*1.6); g.fillRect(x-.6,y-r*2.5,1.2,r*.7); };
    const PIX={inv:['..#.....#..','...#...#...','..#######..','.##.###.##.','###########','#.#######.#','#.#.....#.#','...##.##...'],gh:['..####..','.######.','##.##.##','##.##.##','########','########','########','#.##.##.']};
    const pix=(g,rows,x,y,k,col)=>{ g.fillStyle=col; rows.forEach((r,j)=>{ for(let i=0;i<r.length;i++)if(r[i]==='#')g.fillRect(x+i*k,y+j*k,k,k); }); };
    const STY={
      'RAINBOW RUN':{body:'#5a0c18',trim:'#d8a838',pr:'std',
        side:(g,w,h)=>{ const gr=g.createLinearGradient(0,0,0,h); gr.addColorStop(0,'#2a0410'); gr.addColorStop(.6,'#6a0c1c'); gr.addColorStop(1,'#3a0610'); g.fillStyle=gr; g.fillRect(0,0,w,h);
          const C=['#ff3c5a','#ff8a2a','#ffe83c','#5aff6a','#3cf0ff','#2a7bff','#a46bff']; for(let i=0;i<16;i++){ const q=w/12, x=rnd()*w, y=h*.08+rnd()*h*.5; g.fillStyle=C[i%7]; for(const [a,b] of [[0,0],[1,0],[1,1],[2,1]])g.fillRect(x+a*q,y+b*q,q-1,q-1); }
          g.strokeStyle='#d8a838'; g.lineWidth=3; for(let i=0;i<7;i++){ g.strokeStyle=C[i]; g.beginPath(); g.arc(w*.5,h*.95,w*(.9-i*.06),Math.PI*1.05,Math.PI*1.95); g.stroke(); }
          for(const [x,r,c] of [[.2,.07,'#2a7bff'],[.38,.1,'#5aff6a'],[.58,.12,'#ffe83c'],[.78,.08,'#ff3c5a'],[.92,.06,'#a46bff']]){ dome(g,w*x,h*.84,w*r,c); g.fillStyle='rgba(0,0,0,.25)'; g.fillRect(w*x-w*r*.75,h*.84,w*r*.4,w*r*1.6); }
          g.fillStyle='#1a0208'; g.fillRect(0,h*.9,w,h*.1); g.fillStyle='#d8a838'; for(let i=0;i<5;i++){ g.beginPath(); g.arc(rnd()*w,rnd()*h*.4,1.5,0,7); g.fill(); } },
        marq:(g,w,h)=>{ g.fillStyle='#200408'; g.fillRect(0,0,w,h); const gr=g.createLinearGradient(w*.1,0,w*.9,0); ['#ff3c5a','#ff8a2a','#ffe83c','#5aff6a','#3cf0ff','#2a7bff','#a46bff'].forEach((c,i)=>gr.addColorStop(i/6,c));
          g.font=`${h*.52}px Impact,"Arial Black",sans-serif`; g.textAlign='center'; g.textBaseline='middle'; g.lineWidth=h*.06; g.strokeStyle='#fff'; g.strokeText('RAINBOW RUN',w/2,h*.42); g.fillStyle=gr; g.fillText('RAINBOW RUN',w/2,h*.42);
          font(g,'КОСМО-ЭЛЕКТРОН · 1984',w/2,h*.83,h*.15,'#d8a838','center','monospace'); } },
      'GALAXY RAID':{body:'#0c0a14',trim:'#ff3ca8',pr:'std',
        side:(g,w,h)=>{ g.fillStyle='#05040c'; g.fillRect(0,0,w,h); for(let i=0;i<220;i++){ g.fillStyle=`rgba(255,255,255,${rnd()})`; g.fillRect(rnd()*w,rnd()*h,1,1); }
          const m=g.createRadialGradient(w*.4,h*.32,4,w*.5,h*.35,w*.5); m.addColorStop(0,'#e8e0f0'); m.addColorStop(.7,'#8a80a0'); m.addColorStop(1,'#2a2440'); g.fillStyle=m; g.beginPath(); g.arc(w*.5,h*.35,w*.42,0,7); g.fill();
          g.fillStyle='rgba(40,30,60,.35)'; for(let i=0;i<14;i++){ g.beginPath(); g.arc(w*(.2+rnd()*.6),h*(.2+rnd()*.3),2+rnd()*w*.05,0,7); g.fill(); }
          for(let i=0;i<9;i++)pix(g,PIX.inv,w*(.08+(i%3)*.3),h*(.58+Math.floor(i/3)*.09),w/60,i%2?'#ff3ca8':'#3cf0ff');
          g.strokeStyle='#5aff6a'; g.lineWidth=2; for(let i=0;i<3;i++){ g.beginPath(); const x=w*(.25+i*.25); g.moveTo(x,h*.95); g.lineTo(x+4,h*.55); g.stroke(); } },
        marq:(g,w,h)=>{ g.fillStyle='#08040c'; g.fillRect(0,0,w,h); for(let i=0;i<80;i++){ g.fillStyle='rgba(255,255,255,.6)'; g.fillRect(rnd()*w,rnd()*h,1,1); }
          g.shadowColor='#ff3ca8'; g.shadowBlur=h*.25; font(g,'GALAXY RAID',w/2,h*.44,h*.5,'#ff7ad8'); g.shadowBlur=0; pix(g,PIX.inv,w*.05,h*.3,h/22,'#3cf0ff'); pix(g,PIX.inv,w*.85,h*.3,h/22,'#3cf0ff'); font(g,'TAIYO DENKI · OSAKA',w/2,h*.85,h*.14,'#8a7aa0','center','monospace'); } },
      'MAZE':{body:'#e8c018',trim:'#141016',pr:'std',
        side:(g,w,h)=>{ g.fillStyle='#e8c018'; g.fillRect(0,0,w,h); g.strokeStyle='#1a3aa8'; g.lineWidth=w*.03; g.lineCap='round';
          for(let i=0;i<9;i++){ g.beginPath(); const y=h*(.12+i*.09); g.moveTo(w*.08,y); for(let k=1;k<6;k++)g.lineTo(w*(.08+k*.17),y+((i+k)%2?h*.045:0)); g.stroke(); }
          g.fillStyle='#ffe83c'; g.strokeStyle='#141016'; g.lineWidth=3; g.beginPath(); g.moveTo(w*.5,h*.6); g.arc(w*.5,h*.6,w*.3,.6,Math.PI*2-.6); g.closePath(); g.fill(); g.stroke(); g.fillStyle='#141016'; g.beginPath(); g.arc(w*.52,h*.52,w*.035,0,7); g.fill();
          ['#ff3c5a','#ffb8ff','#3cf0ff','#ffb852'].forEach((c,i)=>pix(g,PIX.gh,w*(.05+i*.24),h*.84,w/38,c)); },
        marq:(g,w,h)=>{ g.fillStyle='#08080c'; g.fillRect(0,0,w,h); g.strokeStyle='#2a7bff'; g.lineWidth=3; g.strokeRect(4,4,w-8,h-8); g.lineWidth=h*.08; g.strokeStyle='#1a3aa8'; font(g,'MAZE',w/2,h*.46,h*.62,'#ffe83c');
          ['#ff3c5a','#ffb8ff'].forEach((c,i)=>pix(g,PIX.gh,w*(.08+i*.1),h*.35,h/26,c)); ['#3cf0ff','#ffb852'].forEach((c,i)=>pix(g,PIX.gh,w*(.76+i*.1),h*.35,h/26,c)); font(g,'MIDWEST AMUSEMENT CO. · CHICAGO',w/2,h*.86,h*.12,'#8a8aa0','center','monospace'); } },
      'ROAD 85':{body:'#ece6dc',trim:'#ff8a2a',pr:'road',
        side:(g,w,h)=>{ const gr=g.createLinearGradient(0,0,0,h); gr.addColorStop(0,'#1a0838'); gr.addColorStop(.45,'#ff3ca8'); gr.addColorStop(.62,'#ff8a2a'); gr.addColorStop(.63,'#2a0a3a'); gr.addColorStop(1,'#12061e'); g.fillStyle=gr; g.fillRect(0,0,w,h);
          g.fillStyle='#ffd23c'; g.beginPath(); g.arc(w*.55,h*.62,w*.3,Math.PI,0); g.fill(); g.fillStyle='#ff3ca8'; for(let i=0;i<6;i++)g.fillRect(w*.2,h*(.6-i*.03),w*.7,1+i*.6);
          g.strokeStyle='#ff3ca8'; g.lineWidth=1; for(let i=0;i<12;i++){ g.beginPath(); g.moveTo(w*.55,h*.63); g.lineTo(w*(-1+i*.27),h); g.stroke(); } for(let i=0;i<8;i++){ const y=h*(.64+Math.pow(i/8,2)*.36); g.beginPath(); g.moveTo(0,y); g.lineTo(w,y); g.stroke(); }
          g.fillStyle='#0a0414'; for(const [x,s] of [[.12,1],[.86,.8]]){ g.fillRect(w*x,h*(.62-.3*s),3,h*.3*s); for(let i=0;i<6;i++){ g.beginPath(); g.ellipse(w*x+1+Math.cos(i)*w*.07*s,h*(.62-.3*s)+Math.sin(i*1.3)*4,w*.08*s,3,Math.cos(i)*.6,0,7); g.fill(); } }
          g.fillStyle='rgba(255,255,255,.85)'; for(let i=0;i<3;i++)g.fillRect(0,h*(.2+i*.035),w,h*.012); },
        marq:(g,w,h)=>{ const gr=g.createLinearGradient(0,0,0,h); gr.addColorStop(0,'#2a0a4a'); gr.addColorStop(.6,'#ff3ca8'); gr.addColorStop(1,'#ff8a2a'); g.fillStyle=gr; g.fillRect(0,0,w,h); chrome(g,'ROAD 85',w/2,h*.45,h*.58); font(g,'SOLAR DRIVE · TOKYO 1985',w/2,h*.88,h*.13,'#fff','center','monospace'); } },
      'TORCHBEARER':{body:'#161228',trim:'#3cf0ff',pr:'std',btn:2,
        side:(g,w,h)=>{ g.fillStyle='#0c0a16'; g.fillRect(0,0,w,h); const q=w/10; g.fillStyle='#1e1a30'; for(let y=0;y<h;y+=q)for(let x=((y/q)|0)%2?q/2:0;x<w;x+=q)g.fillRect(x+1,y+1,q-2,q-2);
          const fl=g.createRadialGradient(w*.5,h*.3,2,w*.5,h*.3,w*.6); fl.addColorStop(0,'rgba(255,200,80,.9)'); fl.addColorStop(.3,'rgba(255,120,30,.45)'); fl.addColorStop(1,'rgba(0,0,0,0)'); g.fillStyle=fl; g.fillRect(0,0,w,h);
          g.fillStyle='#5a3a1a'; g.fillRect(w*.48,h*.3,w*.04,h*.22); g.fillStyle='#ffd24c'; g.beginPath(); g.ellipse(w*.5,h*.27,w*.06,h*.06,0,0,7); g.fill(); g.fillStyle='#fff6d0'; g.beginPath(); g.ellipse(w*.5,h*.28,w*.025,h*.03,0,0,7); g.fill();
          for(let i=0;i<16;i++)pix(g,PIX.gh,w*(.02+rnd()*.84),h*(.56+rnd()*.38),w/46,i%5?'#e8e8f0':'#3cf0ff');
          g.fillStyle='#ff3c5a'; g.fillRect(w*.44,h*.6,w*.12,h*.15); g.fillStyle='#ffd9b0'; g.fillRect(w*.46,h*.54,w*.08,h*.06); g.fillStyle='#c0c0c8'; g.fillRect(w*.56,h*.62,w*.1,h*.025); g.fillRect(w*.64,h*.6,w*.03,h*.07); },
        marq:(g,w,h)=>{ g.fillStyle='#0a0814'; g.fillRect(0,0,w,h); const fl=g.createRadialGradient(w*.5,h*.5,2,w*.5,h*.5,w*.5); fl.addColorStop(0,'rgba(255,140,40,.45)'); fl.addColorStop(1,'rgba(0,0,0,0)'); g.fillStyle=fl; g.fillRect(0,0,w,h);
          g.shadowColor='#3cf0ff'; g.shadowBlur=h*.2; font(g,'TORCHBEARER',w/2,h*.44,h*.46,'#9af4ff'); g.shadowBlur=0; pix(g,PIX.gh,w*.05,h*.3,h/26,'#e8e8f0'); pix(g,PIX.gh,w*.87,h*.3,h/26,'#e8e8f0'); font(g,'HALCYON GAMES · CHICAGO 1985',w/2,h*.86,h*.13,'#8a7aa0','center','monospace'); } },
      'KNUCKLE CITY':{body:'#2a1230',trim:'#ff3c5a',pr:'std',btn:3,
        side:(g,w,h)=>{ const gr=g.createLinearGradient(0,0,0,h); gr.addColorStop(0,'#120a24'); gr.addColorStop(.7,'#4a1a4a'); gr.addColorStop(1,'#1a0a14'); g.fillStyle=gr; g.fillRect(0,0,w,h);
          for(let i=0;i<7;i++){ const x=i*w/7, bh=h*(.25+rnd()*.3), bw=w/7; g.fillStyle='#0c0714'; g.fillRect(x,h*.72-bh,bw-2,bh); for(let r=0;r<bh/8-1;r++)for(let k=0;k<2;k++)if(rnd()<.6){ g.fillStyle=rnd()<.8?'#ffd24c':'#3cf0ff'; g.fillRect(x+3+k*(bw/2),h*.72-bh+4+r*8,bw/2-5,4); } }
          g.fillStyle='#2a2335'; g.fillRect(0,h*.72,w,h*.28); g.fillStyle='#ff3c5a'; g.fillRect(0,h*.7,w,3); g.fillStyle='#4a4260'; for(let i=0;i<5;i++)g.fillRect(w*(.05+i*.2),h*.85,w*.1,2);
          g.shadowColor='#ff3ca8'; g.shadowBlur=10; font(g,'KNUCKLE',w*.5,h*.13,w*.19,'#ff7ad8'); font(g,'CITY',w*.5,h*.24,w*.19,'#ff7ad8'); g.shadowBlur=0;
          g.fillStyle='#ffd9b0'; g.fillRect(w*.36,h*.78,w*.28,h*.1); g.fillStyle='#1a0a14'; for(let k=0;k<4;k++)g.fillRect(w*(.37+k*.07),h*.77,w*.05,h*.03); g.fillRect(w*.36,h*.84,w*.28,1.5); },
        marq:(g,w,h)=>{ const gr=g.createLinearGradient(0,0,0,h); gr.addColorStop(0,'#5a0c18'); gr.addColorStop(1,'#1a0410'); g.fillStyle=gr; g.fillRect(0,0,w,h); g.fillStyle='#ff8a2a'; g.fillRect(0,h*.78,w,3);
          g.font=`${h*.5}px Impact,"Arial Black",sans-serif`; g.textAlign='center'; g.textBaseline='middle'; g.lineWidth=h*.07; g.strokeStyle='#000'; g.strokeText('KNUCKLE CITY',w/2,h*.42); g.fillStyle='#fff'; g.fillText('KNUCKLE CITY',w/2,h*.42);
          font(g,'CAPSTONE AMUSEMENTS · OSAKA 1991',w/2,h*.88,h*.12,'#ff9a9a','center','monospace'); } },
      'DRAGON POP':{body:'#1a7a3a',trim:'#ffe83c',pr:'std',btn:2,
        side:(g,w,h)=>{ g.fillStyle='#0a3a7a'; g.fillRect(0,0,w,h); g.fillStyle='#2a7bff'; for(let i=0;i<4;i++)g.fillRect(w*(.1+(i%2)*.15),h*(.18+i*.17),w*.5,h*.03);
          for(let i=0;i<18;i++){ const r=3+rnd()*w*.06, x=rnd()*w, y=rnd()*h*.82; g.strokeStyle=i%3?'#7ad8ff':'#5aff6a'; g.lineWidth=1.5; g.beginPath(); g.arc(x,y,r,0,7); g.stroke(); g.fillStyle='#fff'; g.fillRect(x-r*.5,y-r*.6,2,2); }
          g.fillStyle='#5aff6a'; g.beginPath(); g.arc(w*.5,h*.86,w*.18,0,7); g.fill(); g.fillRect(w*.3,h*.68,w*.08,h*.06); g.fillRect(w*.62,h*.68,w*.08,h*.06); g.fillStyle='#fff'; g.beginPath(); g.arc(w*.57,h*.83,w*.045,0,7); g.fill(); g.fillStyle='#000'; g.beginPath(); g.arc(w*.585,h*.83,w*.02,0,7); g.fill(); g.fillStyle='#ffd24c'; g.fillRect(w*.66,h*.88,w*.08,h*.03);
          for(const [x,c] of [[.12,'#ff3c5a'],[.86,'#ffe83c'],[.22,'#ff8a2a']]){ g.fillStyle=c; g.beginPath(); g.arc(w*x,h*.94,w*.035,0,7); g.fill(); } },
        marq:(g,w,h)=>{ g.fillStyle='#1a5ad8'; g.fillRect(0,0,w,h); for(let i=0;i<12;i++){ g.strokeStyle='#9ae0ff'; g.lineWidth=1.5; g.beginPath(); g.arc(rnd()*w,rnd()*h,3+rnd()*h*.1,0,7); g.stroke(); }
          g.font=`${h*.5}px Impact,"Arial Black",sans-serif`; g.textAlign='center'; g.textBaseline='middle'; g.lineWidth=h*.07; g.strokeStyle='#0a2a6a'; g.strokeText('DRAGON POP',w/2,h*.44); g.fillStyle='#ffe83c'; g.fillText('DRAGON POP',w/2,h*.44);
          font(g,'TOYBOX · TOKYO 1986',w/2,h*.87,h*.13,'#c8f0ff','center','monospace'); } },
      'PETRI':{body:'#0c1a14',trim:'#7aff6a',pr:'std',btn:2,
        side:(g,w,h)=>{ g.fillStyle='#07100c'; g.fillRect(0,0,w,h); g.strokeStyle='#14281c'; g.lineWidth=1; for(let x=0;x<w;x+=w/9){ g.beginPath(); g.moveTo(x,0); g.lineTo(x,h); g.stroke(); } for(let y=0;y<h;y+=w/9){ g.beginPath(); g.moveTo(0,y); g.lineTo(w,y); g.stroke(); }
          const C=['#ff3c5a','#ffe83c','#3cf0ff','#a46bff','#ff70ff','#7aff6a']; for(let i=0;i<60;i++){ g.fillStyle=C[i%6]; g.fillRect(rnd()*w,h*.08+rnd()*h*.86,2,2); }
          for(const [x,y,r,c] of [[.5,.42,.2,'#7aff6a'],[.2,.25,.08,'#3cf0ff'],[.78,.2,.06,'#ff70ff'],[.3,.72,.11,'#ffe83c'],[.8,.7,.14,'#ff3c5a'],[.62,.88,.05,'#a46bff']]){ g.fillStyle=c; g.beginPath(); g.arc(w*x,h*y,w*r,0,7); g.fill(); g.strokeStyle='rgba(0,0,0,.35)'; g.lineWidth=w*r*.1; g.stroke(); }
          g.fillStyle='#3aa83a'; g.beginPath(); for(let i=0;i<24;i++){ const a=i/24*Math.PI*2, rr=w*(i%2?.07:.06); g.lineTo(w*.55+Math.cos(a)*rr,h*.62+Math.sin(a)*rr); } g.closePath(); g.fill();
          g.fillStyle='#ffe83c'; g.beginPath(); g.moveTo(w*.44,h*.2); g.lineTo(w*.47,h*.14); g.lineTo(w*.5,h*.19); g.lineTo(w*.53,h*.14); g.lineTo(w*.56,h*.2); g.closePath(); g.fill(); },
        marq:(g,w,h)=>{ g.fillStyle='#07100c'; g.fillRect(0,0,w,h); for(let i=0;i<14;i++){ g.fillStyle=['#ff3c5a','#ffe83c','#3cf0ff','#ff70ff'][i%4]; g.globalAlpha=.5; g.beginPath(); g.arc(rnd()*w,rnd()*h,h*(.05+rnd()*.12),0,7); g.fill(); } g.globalAlpha=1;
          g.font=`bold ${h*.6}px "Arial Black",Impact,sans-serif`; g.textAlign='center'; g.textBaseline='middle'; g.lineWidth=h*.08; g.strokeStyle='#072a14'; g.strokeText('PETRI',w/2,h*.44); g.fillStyle='#7aff6a'; g.fillText('PETRI',w/2,h*.44);
          font(g,'NODE 9 · 2015',w/2,h*.85,h*.14,'#3cf0ff','center','monospace'); } },
      'MONSTER ROAD':{body:'#c8923a',trim:'#2a7bff',pr:'std',btn:2,
        side:(g,w,h)=>{ const gr=g.createLinearGradient(0,0,0,h*.6); gr.addColorStop(0,'#1e4a8a'); gr.addColorStop(1,'#8ac8f0'); g.fillStyle=gr; g.fillRect(0,0,w,h*.6); g.fillStyle='#2a7a3a'; g.beginPath(); g.moveTo(0,h*.6); for(let x=0;x<=w;x+=4)g.lineTo(x,h*(.5+.06*Math.sin(x/w*7))); g.lineTo(w,h*.6); g.fill(); g.fillStyle='#6a9a2a'; g.fillRect(0,h*.6,w,h*.4);
          g.fillStyle='#3a3a4a'; g.fillRect(w*.62,h*.3,w*.28,h*.25); for(let i=0;i<4;i++)g.fillRect(w*(.62+i*.08),h*.26,w*.045,h*.05); g.fillRect(w*.72,h*.14,w*.08,h*.2); g.fillStyle='#ff3c5a'; g.beginPath(); g.moveTo(w*.76,h*.14); g.lineTo(w*.76,h*.08); g.lineTo(w*.84,h*.11); g.fill();
          g.fillStyle='#d8d8e0'; g.fillRect(w*.3,h*.62,w*.04,h*.3); g.fillStyle='#c89a2a'; g.fillRect(w*.24,h*.7,w*.16,h*.03); g.fillStyle='#2a7bff'; g.beginPath(); g.arc(w*.16,h*.8,w*.1,0,7); g.fill(); g.fillStyle='#ffe83c'; g.fillRect(w*.15,h*.72,w*.02,h*.16); g.fillRect(w*.09,h*.79,w*.14,h*.02);
          for(let i=0;i<9;i++){ g.fillStyle='#ffe83c'; g.beginPath(); g.arc(w*(.5+rnd()*.45),h*(.75+rnd()*.2),w*.025,0,7); g.fill(); } },
        marq:(g,w,h)=>{ g.fillStyle='#e8d8a8'; g.fillRect(0,0,w,h); g.fillStyle='#c8923a'; g.fillRect(0,0,w,h*.08); g.fillRect(0,h*.92,w,h*.08); wear(g,w,h,.6);
          g.font=`${h*.48}px Impact,"Arial Black",sans-serif`; g.textAlign='center'; g.textBaseline='middle'; g.lineWidth=h*.06; g.strokeStyle='#5a2a08'; g.strokeText('MONSTER ROAD',w/2,h*.44); g.fillStyle='#2a7bff'; g.fillText('MONSTER ROAD',w/2,h*.44);
          font(g,'SEABRIGHT · YOKOHAMA 1987',w/2,h*.8,h*.12,'#5a2a08','center','monospace'); } } };
    const PRF={std:[[0,0,'b'],[.8,0,'door'],[.8,.42,'u'],[.98,.45,'pf'],[.98,.52,'pt'],[.62,.555,'scr'],[.57,.86,'spk'],[.82,.87,'mq'],[.82,.98,'top'],[0,.96,'b']],
      road:[[0,0,'b'],[.78,0,'door'],[.78,.36,'u'],[1,.4,'pf'],[1,.47,'pt'],[.66,.52,'scr'],[.58,.86,'spk'],[.84,.88,'mq'],[.84,.99,'top'],[0,.97,'b']]};
    const cab=(sd,yc,o)=>{ const st=STY[o.name], PR=PRF[st.pr], w=(o.w||.74)*S, Dm=.98*S, D=Dm*CW_, Hc=1.84*ZM*ZW_, Wd=w*CW_, tm=Wd*.045, Wp=Wd-2*tm, EP=Wd*.004, sl=i=>Math.hypot((PR[(i+1)%PR.length][0]-PR[i][0])*D,(PR[(i+1)%PR.length][1]-PR[i][1])*Hc);
      const bw=sd==='b', G_=new THREE.Group(); G_.position.set(X(bw?yc:sd==='e'?AR.x0+.1:AR.x1-.1),Y(0),Z(bw?AR.y0+.1:yc)); G_.rotation.y=bw?-Math.PI/2:sd==='e'?0:Math.PI; scene.add(G_);   // b: the back wall, yc then runs along x
      const shp=new THREE.Shape(PR.map(p=>new THREE.Vector2(p[0]*D,p[1]*Hc))), eg=new THREE.ExtrudeGeometry(shp,{depth:Wd,bevelEnabled:false}); eg.translate(0,0,-Wd/2);
      const sAsp=Hc/D, sideT=ctex(256,Math.round(256*sAsp),(g,W_,H_)=>{ st.side(g,W_,H_); wear(g,W_,H_); }); sideT.repeat.set(1/D,1/Hc);
      const tc=new THREE.Color(st.trim), trim=new THREE.MeshLambertMaterial({color:tc,emissive:tc.clone().multiplyScalar(.35)});
      G_.add(new THREE.Mesh(eg,[lam(sideT,.22),trim]));
      const face=(i,mat,o2={})=>{ const a=PR[i], b=PR[(i+1)%PR.length], p=new THREE.Vector2(a[0]*D,a[1]*Hc), q=new THREE.Vector2(b[0]*D,b[1]*Hc), t=q.clone().sub(p), len=t.length(); t.normalize();
        const f0=o2.f0||0, f1=o2.f1||1, wd=o2.w||Wp, c0=p.clone().addScaledVector(t,len*(f0+f1)/2), n=new THREE.Vector3(t.y,-t.x,0), Xa=new THREE.Vector3(0,0,-1), Ya=new THREE.Vector3(t.x,t.y,0);
        const gm=new THREE.PlaneGeometry(wd,len*(f1-f0)), m4=new THREE.Matrix4().makeBasis(Xa,Ya,n).setPosition(c0.x+n.x*(o2.out||EP),c0.y+n.y*(o2.out||EP),o2.z||0); gm.applyMatrix4(m4); const me=new THREE.Mesh(gm,mat); G_.add(me);
        return {at:(u,v)=>new THREE.Vector3(p.x+t.x*len*v+n.x*EP,p.y+t.y*len*v+n.y*EP,-(u-.5)*wd),n,len}; };
      const bodyT=(f)=>ctex(128,128,(g,W_,H_)=>{ g.fillStyle=st.body; g.fillRect(0,0,W_,H_); if(f)f(g,W_,H_); wear(g,W_,H_,.6); });
      PR.forEach((pt,i)=>{ const r=pt[2];
        if(r==='door'){ const len=sl(i), tx_=ctex(192,Math.round(192*len/Wp),(g,W_,H_)=>{ g.fillStyle=st.body; g.fillRect(0,0,W_,H_);
            g.fillStyle='#1a1a20'; g.fillRect(0,H_*.9,W_,H_*.1); const dx=W_*.22, dw=W_*.56, dy=H_*.12, dh=H_*.62; const mg=g.createLinearGradient(dx,0,dx+dw,0); mg.addColorStop(0,'#3a3a44'); mg.addColorStop(.5,'#8a8a96'); mg.addColorStop(1,'#3a3a44'); g.fillStyle=mg; g.fillRect(dx,dy,dw,dh);
            g.strokeStyle='#1a1a20'; g.lineWidth=2; g.strokeRect(dx+3,dy+3,dw-6,dh-6); for(const k of [0,1]){ const cx_=dx+dw*(.3+k*.4); g.fillStyle='#ff2a2a'; g.fillRect(cx_-7,dy+dh*.12,14,dh*.24); g.fillStyle='#fff'; g.font=`bold ${dh*.11}px monospace`; g.textAlign='center'; g.fillText('$2',cx_,dy+dh*.29); g.fillStyle='#141418'; g.fillRect(cx_-1.5,dy+dh*.15,3,dh*.17); g.fillStyle='#202028'; g.fillRect(cx_-8,dy+dh*.6,16,dh*.2); }
            g.fillStyle='#c8c8c8'; g.beginPath(); g.arc(dx+dw/2,dy+dh*.5,3,0,7); g.fill(); g.fillStyle='#e8e0c8'; g.beginPath(); g.arc(W_*.12,H_*.2,9,0,7); g.fill(); g.fillStyle='#a01a1a'; g.font='bold 7px monospace'; g.textAlign='center'; g.fillText('PLAY',W_*.12,H_*.2+2);
            g.fillStyle='#d8d0b8'; g.fillRect(W_*.8,H_*.8,26,9); g.fillStyle='#3a3a3a'; g.font='5px monospace'; g.fillText('MKT-0'+(1+Object.keys(STY).indexOf(o.name)),W_*.8+13,H_*.8+6); wear(g,W_,H_,1.4); });
          face(i,lam(tx_,.28)); const lit=new THREE.MeshBasicMaterial({color:0xff3a2a}); for(const u of [.388,.612])face(i,lit,{f0:.69,f1:.79,w:Wp*.035,z:-(u-.5)*Wp,out:EP*2}); }
        else if(r==='pt'){ const len=sl(i), tx_=ctex(192,Math.max(32,Math.round(192*len/Wp)),(g,W_,H_)=>{ g.fillStyle='#141018'; g.fillRect(0,0,W_,H_); g.fillStyle=st.body; g.fillRect(0,0,W_,H_*.12);
            const gr=g.createLinearGradient(0,0,W_,0); gr.addColorStop(0,st.trim); gr.addColorStop(1,st.body); g.globalAlpha=.25; g.fillStyle=gr; g.fillRect(0,0,W_,H_); g.globalAlpha=1;
            g.fillStyle='#fff'; g.font=`bold ${H_*.13}px monospace`; g.textAlign='left'; g.fillText('1 PLAYER · $2',8,H_*.9); for(let k=0;k<5;k++){ g.fillStyle='rgba(90,60,30,.55)'; g.beginPath(); g.arc(rnd()*W_,rnd()*H_,1+rnd()*2,0,7); g.fill(); } wear(g,W_,H_,1.5); });
          const P_=face(i,lam(tx_,.25)), up=P_.n.clone().normalize(), q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),up);
          const put=(geo,mat,u,v,h)=>{ const m=new THREE.Mesh(geo,mat); m.position.copy(P_.at(u,v)).addScaledVector(up,h); m.quaternion.copy(q); G_.add(m); return m; };
          const blk=new THREE.MeshLambertMaterial({color:0x101014}), ball=new THREE.MeshLambertMaterial({color:new THREE.Color(st.trim==='#141016'?'#ff2a2a':st.trim),emissive:new THREE.Color(.08,.02,.02)});
          if(o.name==='ROAD 85'){ const ax=new THREE.Vector3(1,.75,0).normalize(), wm=new THREE.Mesh(new THREE.TorusGeometry(Wd*.2,Wd*.022,8,24),blk); wm.position.copy(P_.at(.5,.45)).addScaledVector(up,Wd*.16); wm.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),ax); G_.add(wm);
            const sp=new THREE.Mesh(new THREE.BoxGeometry(Wd*.36,Wd*.03,Wd*.02),blk); sp.position.copy(wm.position); sp.quaternion.copy(wm.quaternion); G_.add(sp); put(new THREE.CylinderGeometry(Wd*.03,Wd*.04,Wd*.16,8),blk,.5,.55,Wd*.07);
            put(new THREE.CylinderGeometry(Wd*.01,Wd*.01,Wd*.14,6),new THREE.MeshLambertMaterial({color:0xc0c0c8}),.88,.4,Wd*.07); put(new THREE.SphereGeometry(Wd*.035,10,8),blk,.88,.4,Wd*.15); }
          else { put(new THREE.CylinderGeometry(Wd*.06,Wd*.06,Wd*.01,16),blk,.3,.5,Wd*.005); put(new THREE.CylinderGeometry(Wd*.011,Wd*.011,Wd*.12,8),blk,.3,.5,Wd*.06); put(new THREE.SphereGeometry(Wd*.04,12,10),ball,.3,.5,Wd*.125);
            ['#ff3c5a','#ffe83c','#3cf0ff'].slice(0,st.btn??2).forEach((c,k)=>{ put(new THREE.CylinderGeometry(Wd*.042,Wd*.042,Wd*.03,14),new THREE.MeshLambertMaterial({color:new THREE.Color(c),emissive:new THREE.Color(c).multiplyScalar(.3)}),.58+k*.13,.5-(k%2)*.12,Wd*.015); });
            put(new THREE.CylinderGeometry(Wd*.03,Wd*.03,Wd*.02,12),new THREE.MeshBasicMaterial({color:0xfff0c0}),.9,.25,Wd*.01); } }
        else if(r==='scr'){ const len=sl(i), bz=ctex(256,Math.round(256*len/Wp),(g,W_,H_)=>{ g.fillStyle='#08070c'; g.fillRect(0,0,W_,H_);
            const L=KIT.lore(o.name); g.strokeStyle=L.col; g.lineWidth=2; g.strokeRect(6,6,W_-12,H_-12); g.globalAlpha=.5; g.strokeRect(11,11,W_-22,H_-22); g.globalAlpha=1;
            font(g,L.tag,W_/2,H_-14,9,'#c8b8d8','center','monospace'); font(g,'©'+L.year+' '+L.maker,W_/2,15,8,'#8a7aa0','center','monospace'); });
          face(i,lam(bz,.35)); const sw=Wp*.8, sh_=Math.min(len*.78,sw*224/256), d=KIT.demo(o.name), st_=new THREE.CanvasTexture(d.cv); st_.colorSpace=THREE.SRGBColorSpace; d.step(Math.random()*6); d.draw();
          const fo=(len-sh_)/2/len; face(i,new THREE.MeshBasicMaterial({map:st_}),{f0:fo,f1:1-fo,w:sh_*256/224,out:EP*2}); SCRS.push({d,t:st_}); }
        else if(r==='mq'){ const len=sl(i), mt=ctex(256,Math.max(40,Math.round(256*len/Wp)),(g,W_,H_)=>{ st.marq(g,W_,H_); const gl=g.createLinearGradient(0,0,0,H_); gl.addColorStop(0,'rgba(255,255,255,.18)'); gl.addColorStop(.3,'rgba(255,255,255,0)'); g.fillStyle=gl; g.fillRect(0,0,W_,H_); }); face(i,glow(mt)); }
        else if(r==='spk'){ face(i,lam(ctex(128,48,(g,W_,H_)=>{ g.fillStyle='#141018'; g.fillRect(0,0,W_,H_); g.fillStyle='#050408'; for(let y=4;y<H_-2;y+=4)for(let x=4+(y/4%2)*2;x<W_-2;x+=4)g.fillRect(x,y,2,2); g.fillStyle='rgba(255,240,200,.5)'; g.fillRect(W_*.1,H_-3,W_*.8,2); }),.2)); }
        else if(r==='pf'||r==='u'||r==='top')face(i,lam(bodyT(r==='pf'?(g,W_,H_)=>{ g.fillStyle=st.trim; g.fillRect(0,H_*.4,W_,H_*.2); }:null),.22)); });
      const gt=ctex(64,64,(g)=>{ const r=g.createRadialGradient(32,32,2,32,32,32); r.addColorStop(0,KIT.lore(o.name).col); r.addColorStop(1,'rgba(0,0,0,0)'); g.fillStyle=r; g.fillRect(0,0,64,64); });
      const gw=new THREE.Mesh(new THREE.PlaneGeometry(D*1.1,Wd*1.7),new THREE.MeshBasicMaterial({map:gt,transparent:true,opacity:.35,blending:THREE.AdditiveBlending,depthWrite:false})); gw.rotation.x=-Math.PI/2; gw.position.set(D*1.15,Y(.4),0); G_.add(gw);
      const xb=sd==='e'?AR.x0+.1:AR.x1-.1, dm=Dm*Math.max(...PR.map(p=>p[0])), r0=bw?[yc-w/2,AR.y0+.1,yc+w/2,AR.y0+.1+dm]:sd==='e'?[xb,yc-w/2,xb+dm,yc+w/2]:[xb-dm,yc-w/2,xb,yc+w/2]; sol(...r0);
      const hb=new THREE.Mesh(new THREE.BoxGeometry(Math.abs(X(r0[2])-X(r0[0]))+.4*TILE,Y(70),Math.abs(Z(r0[3])-Z(r0[1]))+.4*TILE),new THREE.MeshBasicMaterial({visible:false}));
      hb.position.set((X(r0[0])+X(r0[2]))/2,Y(35),(Z(r0[1])+Z(r0[3]))/2); scene.add(hb); UI.thing({name:'PLAY '+o.name,obj:hb,reach:1.5*TILE,near:2.5*TILE,tall:Y(70),act:()=>STORE.cabs.play(o.name)}); };
    const YS=[AR.y0+2.2,AR.y0+4.7,AR.y0+7.2,AR.y0+9.7];
    for(const sd of ['e','w'])STORE.cabs.walls[sd].forEach((name,i)=>cab(sd,YS[i],{name,w:STY[name].pr==='road'||name==='RAINBOW RUN'?.86:undefined}));
    STORE.cabs.walls.b.forEach((name,i)=>cab('b',cx+3.6+i*2.5,{name}));   // the one new machine: the back wall beside the holodeck's door, facing the street door
    let si=0; ARC.scr=dt=>{ if(STORE.cabs.on||(ROOMS.offIn&&ROOMS.offIn()!=='arcade'))return; for(const q of SCRS)q.d.step(dt); const q=SCRS[si++%SCRS.length]; q.d.draw(); q.t.needsUpdate=true; };
    for(const [y,name,ty,hd] of [[AR.y0+.3,'THE HOLODECK',AR.y0-1.3,Math.PI],[AR.y0-.3,'BACK TO THE ARCADE',AR.y0+1.3,0]]){ const hb=new THREE.Mesh(new THREE.BoxGeometry(1.3*TILE,2.4*TILE,.5*TILE),new THREE.MeshBasicMaterial({visible:false}));
      hb.position.set(X(cx),1.2*TILE,Z(y)); scene.add(hb); UI.thing({name,ghost:1,obj:hb,reach:1.4*TILE,near:2.6*TILE,tall:2.4*TILE,act:()=>!FADE.busy&&FADE.run('',()=>UI.goTo(X(cx),Z(ty),0,hd),{cut:true})}); }
    for(const [x,y,c,i] of [[cx,(AR.y0+AR.y1)/2,0xc070ff,9],[cx,AR.y1-1,0xff4fa0,5],[cx,hy,0x66ff99,5]]){ const Lt=new THREE.PointLight(c,i,10*TILE,1.6); Lt.position.set(X(x),Y(118),Z(y)); scene.add(Lt); }
    { const hb=new THREE.Mesh(new THREE.BoxGeometry(2.2*TILE,Y(50),.4*TILE),new THREE.MeshBasicMaterial({visible:false})); hb.position.set(X(cx),Y(66),Z(HD.y0+.2)); scene.add(hb);
      UI.thing({name:'THE HOLODECK PANEL',obj:hb,reach:1.6*TILE,near:2.8*TILE,tall:Y(90),act:()=>HOLO.menu()}); const hb4=box4(HD.x0,HD.y0,HD.x1,HD.y1); HOLO.hall={x:X(cx),z:Z(hy),G:AG,box:{x0:hb4[0],z0:hb4[1],x1:hb4[2],z1:hb4[3]},y:Y(.15),h:Y(WH),hpx:WH,door:{x:X(cx),z:Z(AR.y0-1.3)}}; }
    if(STORE.furnish&&STORE.furnish.arcade)STORE.furnish.arcade(); };
  const unbuild=()=>{ ARC.scr=null; if(!(HOLO.run&&HOLO.run.P.offWorld))HOLO.close(); for(const r of AS){ const i=SOL.up.indexOf(r); if(i>=0)SOL.up.splice(i,1); } AS=[]; if(AG){ AG.removeFromParent(); AG=null; } };   // an off-world adventure (the catacomb run) keeps the holodeck open while it drops the arcade; it re-enters on return
  const wb=box4(AR.x0-.2,HD.y0-.2,AR.x1+.2,AR.y1+.2);
  const rb=r=>{ const q=box4(r.x0,r.y0,r.x1,r.y1); return {x0:q[0],z0:q[1],x1:q[2],z1:q[3]}; };
  ROOMS.off.arcade={name:'THE ARCADE',ar:AR,addSol:r=>{ AS.push(r); SOL.up.push(r); },box:{x0:wb[0],z0:wb[1],x1:wb[2],z1:wb[3],y0:-1,y1:Y(WH+40)},rooms:[rb(AR),rb(HD)],need:()=>LOAD('arcade','later'),
    build:()=>{ AG=new THREE.Group(); AG.name='arcade-in'; scene.add(AG); AS=[]; PA=ROOMS.part(AG,build,MKA); return PA; },unbuild,
    spawn:[X(cx),Z(AR.y1-1.3),0,Math.PI],out:[...at(lcx,L.y1+.9),0,TA.hd(0)],door:(d=>[d[0],Y(0),d[1]])(at(lcx,L.y1+.25)),exit:[X(cx),0,Z(AR.y1-.25)],exitName:'OUT TO MAIN STREET'};
  { const B=SHARED.BOD, tx=w=>(w-B.XS(0))/(B.XS(1)-B.XS(0)), tz=w=>(w-B.ZS(0))/(B.ZS(1)-B.ZS(0)); if(LEVEL.homes&&!LEVEL.homes.game_master)LEVEL.homes.game_master=[+tx(X(cx-2.2)).toFixed(2),+tz(Z(AR.y0+1.6)).toFixed(2),0,'arcade']; }   // the Game Master by the holodeck's door (owner, 5 Nov 2026)
  { const sp=ROOMS.off.arcade.spawn; STORE.places.push(['THE ARCADE',sp[0],sp[1],'up','off',sp[3]],['THE HOLODECK',X(cx),Z(hy+3),'up','off',Math.PI]); }
  window.ARCDBG=()=>({built:!!PA,cabs:PA?PA.things.filter(t=>/^PLAY /.test(t.name)).length:0,things:PA?PA.things.map(t=>t.name):[],holo:{programs:HOLO.programs.map(P=>P.name),open:!hp.hidden,run:HOLO.run?HOLO.run.P.name:null,rows:hp.querySelectorAll('button[data-run]').length}});
});
