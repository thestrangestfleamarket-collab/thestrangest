// THE ARCADE: the arcade on Main Street as one painted block (its neon ARCADE front); its inside is built off the map when you go in: black walls, three cabinets along each side wall, and the holodeck behind the back wall with its training programs.
import {SHARED, THREE} from './003-shx.js';
import {FORAGE, INV, pos, ROOMS, UI, WIELD} from './003b-systems.js';
import {scene} from './004-main.js';
import {FIX, grab, SOL, STORE, SYS, TILE, TURN, WP} from './006-map-pre.js';
import {BATCH} from './008-batch.js';
import {LAMPS} from './014-gamekit.js';
await grab('arcade',async()=>{ const {X,Z,faceTex,bq,C}=SHARED.BOD, Y=SHARED.BOD.Y, {hash:hs}=SHARED.BOD.g, sh=SHARED.BOD.K.sh, MS=STORE.main;
  const HOLO=STORE.holo={programs:[],run:null}, say=(t,c)=>FORAGE.say&&FORAGE.say(t,c);
  HOLO.open=(x,z,G)=>{ const n=HOLO.programs.length; HOLO.programs.forEach((P,i)=>{ const px=x+(i-(n-1)/2)*2.2*TILE; if(P.place)P.place(px,z,0,G);
      const hb=new THREE.Mesh(new THREE.BoxGeometry(.8*TILE,2*TILE,.8*TILE),new THREE.MeshBasicMaterial({visible:false})); hb.position.set(px,TILE,z); scene.add(hb);
      UI.thing({name:P.name,obj:hb,reach:1.6*TILE,near:2.6*TILE,tall:2*TILE,act:()=>HOLO.start(P,px,z)}); }); };
  HOLO.close=()=>{ HOLO.run=null; for(const P of HOLO.programs)if(P.hide)P.hide(); };
  HOLO.start=(P,x,z)=>{ if(HOLO.run)return; const c=P.cost||8; if(INV.cash<c)return say('THE HOLODECK TAKES $'+c+' FOR THIS PROGRAM.','#c8a090'); INV.cash-=c; if(P.tool){ if(!FORAGE.has(P.tool))FORAGE.give(P.tool,1); if(WIELD.on!==P.tool)WIELD.set(P.tool); }
    HOLO.run={P,x,z,n:0,good:0,cue:false,t:2}; say(P.intro,'#7dffa4'); };
  SYS.add('strike',()=>{ const D=HOLO.run; if(!D)return; if(D.P.strike)return D.P.strike(D); if(!D.cue||Math.hypot(pos.x-D.x,pos.z-D.z)>2.6*TILE)return; D.cue=false; D.good++; D.n++; D.t=1.2+Math.random()*1.6; say('GOOD.','#7dffa4'); if(D.P.skill)FORAGE.use(D.P.skill,0,100); },'holodeck drill');
  SYS.add('places',dt=>{ const D=HOLO.run; if(!D)return; if(D.P.run)return D.P.run(D,dt); D.t-=dt; if(D.t>0)return;
    if(D.cue){ D.cue=false; D.n++; D.t=1.2+Math.random()*1.6; say('TOO SLOW.','#c8a090'); return; }
    if(D.n>=5){ say('PROGRAM COMPLETE: '+D.good+' OF 5.','#7dffa4'); if(D.P.skill&&D.good)FORAGE.train(D.P.skill,600,0,D.good*4); HOLO.run=null; return; } D.cue=true; D.t=1.1; say(D.P.cue,'#5dff8f'); },'holodeck drill');

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
  BLOCKS.make({x0:LW.x0,x1:LW.x1,y0:LW.y0,y1:LW.y1,z0:0,z1:L.h,kind:'A',turn:TA,roof:(x,y)=>sh([40,36,44],.92+.12*hs(Math.floor(x*4),Math.floor(y*4),61)),
    paint:(side,u,z,f)=>(side==='f'&&front(u-L.x0,z,f))||(z>L.h-10?sh([60,44,70],f):wall(u,z,f))});
  BATCH.build(MKA); for(const me of Object.values(BATCH.meshes)){ me.castShadow=true; me.receiveShadow=true; } BATCH.meshes={};
  { const r=box4(LW.x0,LW.y0,LW.x1,LW.y1); SOL.up.push(r); FIX.up.push([r[0],r[1],0,r[2],r[3],Y(L.h)]); }
  MS.unplace('ARCADE'); MS.unplace('THE ARCADE');

  const AR={x0:480,x1:496,y0:-100,y1:-87}, HD={x0:480,x1:496,y0:-113,y1:-100}, cx=(AR.x0+AR.x1)/2, hy=(HD.y0+HD.y1)/2, WH=130, DW=.8, DH=95;
  STORE.bound.x1=Math.max(STORE.bound.x1,X(AR.x1+20)); STORE.bound.z0=Math.min(STORE.bound.z0,Z(HD.y0-6)); STORE.bound.z1=Math.max(STORE.bound.z1,Z(AR.y1+6));
  let AG=null, AS=[], PA=null;
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
  const thing=(name,boxes,o={})=>{ for(const b of boxes)SHARED.BOD.gbox(b,'A'); if(!o.high&&boxes.length){ sol(Math.min(...boxes.map(b=>b.x0)),Math.min(...boxes.map(b=>b.y0)),Math.max(...boxes.map(b=>b.x1)),Math.max(...boxes.map(b=>b.y1))); }
    if(o.skill&&boxes.length){ const x0=Math.min(...boxes.map(b=>b.x0)), x1=Math.max(...boxes.map(b=>b.x1)), y0=Math.min(...boxes.map(b=>b.y0)), y1=Math.max(...boxes.map(b=>b.y1)), hb=new THREE.Mesh(new THREE.BoxGeometry(Math.abs(X(x1)-X(x0))+.4*TILE,Y(70),Math.abs(Z(y1)-Z(y0))+.4*TILE),new THREE.MeshBasicMaterial({visible:false}));
      hb.position.set((X(x0)+X(x1))/2,Y(35),(Z(y0)+Z(y1))/2); scene.add(hb); UI.thing({name:'PLAY '+o.title,obj:hb,reach:1.5*TILE,near:2.5*TILE,tall:Y(70),act:()=>FORAGE.train(o.skill,400,2,3)}); } };
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
    WALL(PX(AR.y0,.03),PX(AR.y0,.03),AR.x0,cx-DW,back); WALL(PX(AR.y0,.03),PX(AR.y0,.03),cx+DW,AR.x1,back); WALL(PX(AR.y0,.03),PX(AR.y0,.03),cx-DW,cx+DW,back,WH,DH);
    for(const o of [-.03])WALL(PX(AR.y0,o),PX(AR.y0,o),AR.x0,AR.x1,(u,z)=>Math.abs(u-cx)<DW&&z<DH?null:GRID(u,z/24));
    WALL(PY(HD.x0),PY(HD.x0),HD.y0,HD.y1,(u,z)=>GRID(u,z/24)); WALL(PY(HD.x1),PY(HD.x1),HD.y0,HD.y1,(u,z)=>GRID(u,z/24)); WALL(PX(HD.y0),PX(HD.y0),HD.x0,HD.x1,(u,z)=>GRID(u,z/24));
    sol(AR.x0-.1,HD.y0,AR.x0+.1,AR.y1); sol(AR.x1-.1,HD.y0,AR.x1+.1,AR.y1); sol(AR.x0,AR.y1-.1,AR.x1,AR.y1+.1); sol(HD.x0,HD.y0-.1,HD.x1,HD.y0+.1); sol(AR.x0,AR.y0-.1,cx-DW,AR.y0+.1); sol(cx+DW,AR.y0-.1,AR.x1,AR.y0+.1);
    const SIDE2={e:[1,0],w:[-1,0]}, dk=[16,14,20];
    const CABSK={'RAINBOW RUN':'bird','GALAXY RAID':'sword','MAZE':'prosp','ROAD 85':'fish','TELEMAK':'ento','ISTANBUL TAKSI':'forage'};   // each game trains a skill, a token a play
    const cab=(sd,yc,o)=>{ const [ax]=SIDE2[sd], w=(o.w||.74)*S, xb=sd==='e'?AR.x0+.1:AR.x1-.1, yb=yc, bs=[];
      const R_=(a0,a1,d0,d1)=>ax>0?[xb+d0*S,yb+a0*w,xb+d1*S,yb+a1*w]:[xb-d1*S,yb-a1*w,xb-d0*S,yb-a0*w];
      const art=pic(32,64,(g,W_,H_)=>{ g.fillStyle=o.body; g.fillRect(0,0,W_,H_);
        if(o.art==='stripes'){ const Cs=['#27a84a','#ff8a2a','#e2304a','#141016']; for(let i=-10;i<20;i++){ g.fillStyle=Cs[(i+40)%4]; g.beginPath(); g.moveTo(0,H_-i*6); g.lineTo(W_,H_-i*6-20); g.lineTo(W_,H_-i*6-25); g.lineTo(0,H_-i*6-5); g.fill(); } }
        else if(o.art==='check'){ g.fillStyle='#141016'; for(let i=0;i<8;i++)for(let j=0;j<2;j++)if((i+j)%2)g.fillRect(i*4,34+j*4,4,4); }
        else { g.fillStyle=o.art; g.beginPath(); g.moveTo(0,H_); g.lineTo(W_,H_-14); g.lineTo(W_,H_-26); g.lineTo(0,H_-12); g.fill(); g.fillRect(0,0,W_,5); } });
      const dep=(P)=>ax>0?(P-xb)/S:(xb-P)/S, fu2=(b,Q)=>ax>0?(b.y1-Q)/(b.y1-b.y0):(Q-b.y0)/(b.y1-b.y0);
      const part=(a0,a1,d0,d1,h0,h1,c,fr,em)=>{ const [x0,y0,x1,y1]=R_(a0,a1,d0,d1), b=bx(x0,y0,x1,y1,h0*ZM,h1*ZM,c,em?{em:1}:{});
        b.fs=(nx,ny,P,Q,z,s)=>{ if(nx===ax&&!ny){ if(fr){ const q=fr(fu2(b,Q),1-z/(b.z1-b.z0)); if(q)return q; } return em?c:sh(c,s); }
          if(ny){ const q=art(Math.min(.99,dep(P)),1-(b.z0+z)/ZM/1.84); return sh(q||c,s); } return em?c:sh(c,s); }; bs.push(b); return b; };
      const trim=o.trim||dk, coin=(u_,v)=>(v>.45&&v<.75&&((u_>.3&&u_<.4)||(u_>.6&&u_<.7)))?lit([255,60,60]):(v>.3&&v<.9&&u_>.2&&u_<.8)?[28,26,32]:null;
      part(-.5,.5,0,.78,0,.82,trim,coin); part(-.5,.5,0,.98,.82,.97,trim); part(-.5,.5,0,.6,.97,1.56,trim); part(-.5,.5,0,.8,1.56,1.84,trim);
      part(-.42,.42,.6,.64,1.0,1.5,[10,10,16],o.scr,1);
      const mq=pic(64,14,(g)=>{ g.fillStyle=o.mbg||'#141016'; g.fillRect(0,0,64,14); const k=tw(o.name,1)>60?1:2; ctxt(g,o.name,32,k===2?2:4,k,o.mcol||'#fff'); });
      part(-.46,.46,.8,.82,1.58,1.82,[20,18,24],mq,1);
      if(o.edge)for(const a of [-.52,.5]){ const [x0,y0,x1,y1]=R_(a,a+.02,.74,.8); bs.push(bx(x0,y0,x1,y1,0,1.84*ZM,o.edge,{em:1})); }
      thing('arcade cabinet: '+o.name.toLowerCase(),bs,{skill:CABSK[o.name],title:o.name}); };
      const scr=k=>pic(48,40,(g,W,H)=>{ g.fillStyle='#05060c'; g.fillRect(0,0,W,H);
        if(k==='paddles'){ g.fillStyle='#e8f0ff'; g.fillRect(3,14,2,8); g.fillRect(43,10,2,8); g.fillRect(26,20,2,2); for(let y=1;y<H;y+=4)g.fillRect(23,y,2,2); txt(g,'3',14,3,1,'#e8f0ff'); txt(g,'7',30,3,1,'#e8f0ff'); }
        else if(k==='raid'){ const C=['#ff4fd8','#4ff0ff','#5aff6a']; for(let r=0;r<3;r++)for(let i=0;i<5;i++){ g.fillStyle=C[r]; const x=4+i*8, y=4+r*6; g.fillRect(x,y,5,3); g.fillRect(x+1,y+3,1,1); g.fillRect(x+3,y+3,1,1); } g.fillStyle='#ffe83c'; g.fillRect(21,35,6,3); g.fillRect(23,33,2,2); }
        else if(k==='taksi'){ g.fillStyle='#ff8a2a'; g.fillRect(0,8,W,10); g.fillStyle='#283048'; g.fillRect(0,18,W,22); g.fillStyle='#606a80'; g.beginPath(); g.moveTo(20,18); g.lineTo(28,18); g.lineTo(46,40); g.lineTo(2,40); g.fill(); g.fillStyle='#ffd21c'; g.fillRect(17,28,14,6); g.fillStyle='#111'; g.fillRect(18,29,12,2); }
        else if(k==='maze'){ g.strokeStyle='#2a7bff'; for(let i=0;i<3;i++)g.strokeRect(3.5+i*6,3.5+i*6,40-i*12,32-i*12); g.fillStyle='#ffe83c'; g.fillRect(22,18,4,4); g.fillStyle='#ff4f6a'; g.fillRect(8,8,3,3); }
        else { const C=['#ff4fd8','#4ff0ff','#ffe83c','#5aff6a','#ff8a2a']; for(let y=20;y<H;y+=4)for(let x=2;x<W-2;x+=4)if(hs(x,y,710)<.5+(y-20)/40){ g.fillStyle=C[Math.floor(hs(y,x,711)*5)]; g.fillRect(x,y,3,3); } g.fillStyle='#4ff0ff'; g.fillRect(20,6,4,4); g.fillRect(24,6,4,4); g.fillRect(24,10,4,4); } });
    const YS=[AR.y0+3.4,AR.y0+6.4,AR.y0+9.4];
    cab('e',YS[0],{name:'RAINBOW RUN',body:'#141016',art:'stripes',scr:scr('blocks'),mcol:'#ff8a2a',w:.86,edge:[226,48,74]});
    cab('e',YS[1],{name:'GALAXY RAID',body:'#2a1030',art:'#ff3ca8',scr:scr('raid'),mcol:'#ff7ad8',edge:[255,60,168]});
    cab('e',YS[2],{name:'MAZE',body:'#1a2050',art:'#2a7bff',scr:scr('maze'),mcol:'#ffe83c'});
    cab('w',YS[0],{name:'ROAD 85',body:'#2a1a12',art:'#ff8a2a',scr:scr('taksi'),mcol:'#ff8a2a',edge:[255,138,42]});
    cab('w',YS[1],{name:'TELEMAK',body:'#1a1a2a',art:'#2a7bff',scr:scr('paddles'),mbg:'#2a7bff',edge:[42,123,255]});
    cab('w',YS[2],{name:'ISTANBUL TAKSI',body:'#ffd21c',art:'check',scr:scr('taksi'),mbg:'#ffd21c',mcol:'#141016',trim:[216,168,18],w:.86});
    for(const [x,y,c,i] of [[cx,(AR.y0+AR.y1)/2,0xc070ff,9],[cx,AR.y1-1,0xff4fa0,5],[cx,hy,0x66ff99,5]]){ const Lt=new THREE.PointLight(c,i,10*TILE,1.6); Lt.position.set(X(x),Y(118),Z(y)); scene.add(Lt); }
    HOLO.open(X(cx),Z(hy-1.5),AG); };
  const unbuild=()=>{ HOLO.close(); for(const r of AS){ const i=SOL.up.indexOf(r); if(i>=0)SOL.up.splice(i,1); } AS=[]; if(AG){ AG.removeFromParent(); AG=null; } };
  const wb=box4(AR.x0-.2,HD.y0-.2,AR.x1+.2,AR.y1+.2);
  const rb=r=>{ const q=box4(r.x0,r.y0,r.x1,r.y1); return {x0:q[0],z0:q[1],x1:q[2],z1:q[3]}; };
  ROOMS.off.arcade={name:'THE ARCADE',box:{x0:wb[0],z0:wb[1],x1:wb[2],z1:wb[3],y0:-1,y1:Y(WH+40)},rooms:[rb(AR),rb(HD)],need:()=>LOAD('arcade','later'),
    build:()=>{ AG=new THREE.Group(); AG.name='arcade-in'; scene.add(AG); AS=[]; PA=ROOMS.part(AG,build,MKA); return PA; },unbuild,
    spawn:[X(cx),Z(AR.y1-1.3),0,Math.PI],out:[...at(lcx,L.y1+.9),0,TA.hd(0)],door:(d=>[d[0],Y(0),d[1]])(at(lcx,L.y1+.25)),exit:[X(cx),0,Z(AR.y1-.25)],exitName:'OUT TO MAIN STREET'};
  STORE.places.push(['THE ARCADE',...ROOMS.off.arcade.spawn],['THE HOLODECK',X(cx),Z(hy+3),0,Math.PI]);
  window.ARCDBG=()=>({built:!!PA,cabs:PA?PA.things.filter(t=>/SWORD/.test(t.name)).length:0,things:PA?PA.things.map(t=>t.name):[],knight:(q=>!!(q&&q.by.knight&&q.by.knight.npc&&q.by.knight.npc.on))(window.BODIES)});
});
