// THE MERCHANTS' SHOPS: MSHOP, the one way a merchant gets a small shop: its outside one painted block on its lot in the level file (shopfront, window, door, sign), its inside off the map (about half the bodega), built behind the fade when you go in and furnished by the merchant's own kit (MSHOP.kit[id]), or else the shared one (MSHOP.kit._, 162fa).
import {SHARED, THREE} from './003-shx.js';
import {ROOMS, WINDOWS} from './003b-systems.js';
import {scene} from './004-main.js';
import {AWAY, FIX, grab, LEVEL, SOL, STORE, TILE, TURN, WP} from './006-map-pre.js';
import {BATCH} from './008-batch.js';
import {BLOCKS} from './038zb-blocks.js';
import {FACADES} from './038zc-facades.js';
const MSHOP={kit:{},at:{},defs:{},fronts:[]};
await grab('mshops',async()=>{ const {X,Z}=SHARED.BOD, Y=SHARED.BOD.Y, hs=SHARED.BOD.g.hash, sh=SHARED.BOD.K.sh, MS=STORE.main, T=TILE;
  const lit=c=>Object.assign([c[0],c[1],c[2]],{e:1});
  const box4=(x0,y0,x1,y1)=>{ const a=X(x0), b=X(x1), c=Z(y0), d=Z(y1); return [Math.min(a,b),Math.min(c,d),Math.max(a,b),Math.max(c,d)]; };
  const MKA=(k,map,emap)=>k==='B'?new THREE.MeshBasicMaterial({map,side:THREE.DoubleSide,alphaTest:.5}):new THREE.MeshLambertMaterial({map,alphaTest:.5,side:THREE.DoubleSide,...(emap?{emissiveMap:emap,emissive:0xffffff,emissiveIntensity:1.2}:{})});
  // each shop's outside: wall, trim, sign words and colour, how its window looks in (u across the window 0..1, v up it 0..1, night), where its door is (0..1 across)
  const DEF=MSHOP.defs={
    boards:{name:'THE BOARDWRIGHT',sign:'BOARDS',signC:[236,206,150],neon:false,signBg:[52,36,24],wall:BLOCKS.brick([118,92,76]),trim:[196,184,160],frame:[60,44,30],door:.78,h:150,
      win:(u,v,n)=>{ const k=Math.floor(u*7), du=u*7-k; if(v>.12&&v<.92&&du>.25&&du<.75){ const c=[[46,120,118],[150,96,54],[188,160,110],[70,52,90],[160,64,48],[46,120,118],[120,110,84]][k]; return n?lit(c.map(q=>q*.7)):c; } return null; }},
    fixit:{name:'FIX-IT ELECTRONICS',sign:'FIX IT',signC:[255,82,64],neon:true,signBg:[22,20,24],wall:BLOCKS.brick([92,84,80]),trim:[150,146,140],frame:[40,42,46],door:.82,h:150,
      win:(u,v,n)=>{ const k=Math.floor(u*4), du=u*4-k, r=Math.floor(v*3), dv=v*3-r; if(du>.12&&du<.88&&dv>.15&&dv<.85&&r<2){ const on=hs(k,r,7)>.35; return on?lit(n?[120,190,170]:[96,150,140]):[30,32,30]; } return null; }},
    scanner:{name:'THE SCANNER',sign:'RADIO',signC:[120,255,150],neon:true,signBg:[18,24,20],wall:BLOCKS.brick([70,74,66]),trim:[132,138,126],frame:[30,34,30],door:.2,h:140,
      win:(u,v,n)=>{ if(v>.2&&v<.8&&(Math.floor(u*9)%2)===0)return n?lit([90,200,120]):[44,70,50]; return null; }},
    books:{name:'THE BOOKSTORE',sign:'BOOKS',signC:[255,214,140],neon:true,signBg:[30,40,34],glass:true,both:true,dw:1.25,wall:BLOCKS.brick([124,70,58]),trim:[206,196,170],frame:[44,58,48],door:.5,h:150,
      win:(u,v,n)=>{ const r=Math.floor(v*4), dv=v*4-r, warm=lit([118,86,52]); if(dv<.14)return lit([96,70,46]); if(dv>.9)return warm; const k=Math.floor(u*46), lean=hs(k,r,23); if(dv>.88-lean*.3)return warm;
        const c=[[120,40,36],[40,64,96],[62,92,58],[150,120,60],[70,46,86],[30,30,34],[160,140,110]][Math.floor(hs(k,r,41)*7)]; return lit(c.map(q=>q*.85)); }},   // the shelves seen through the glass, in the shop's warm light
    diner:{name:'THE DINER',sign:'DINER',signC:[255,96,128],neon:true,signBg:[26,30,40],wall:BLOCKS.brick([188,186,180]),trim:[226,226,230],frame:[150,40,48],door:.5,h:140,
      win:(u,v,n)=>{ if(v<.12)return [150,40,48]; const k=Math.floor(u*5), du=u*5-k; if(v>.3&&v<.62&&du>.15&&du<.85)return hs(k,3,9)>.5?(n?lit([250,210,150]):[200,170,130]):(n?lit([210,120,110]):[150,90,84]); return null; }},
    bar:{name:'THE BAR',sign:'BAR',signC:[255,120,170],neon:true,signBg:[20,14,20],wall:BLOCKS.brick([72,46,48]),trim:[150,118,70],frame:[26,18,20],door:.5,h:200,
      win:(u,v,n)=>{ if(v<.1||v>.9)return null; const k=Math.floor(u*6), du=u*6-k; if(du<.1||du>.9)return [30,20,22]; const g=.5+.5*hs(k,Math.floor(v*3),17); return lit([150*g+40,70*g+20,50*g+16]); }},   // the lounge's low amber light through its glass (146zca)
    gym:{name:'KNUCKLE & IRON',sign:'GYM',signC:[255,92,70],neon:true,signBg:[22,22,26],wall:BLOCKS.brick([110,58,46]),trim:[200,196,186],frame:[34,36,40],door:.5,h:190,
      win:(u,v,n)=>{ const k=Math.floor(u*5), du=u*5-k; if(du<.08||du>.92)return [34,36,40]; const bag=Math.abs(du-.5)<.12&&v>.25&&v<.8, rope=Math.abs(v-.3)<.02||Math.abs(v-.45)<.02; if(bag&&k%2)return k%4===1?[150,40,34]:[30,30,34]; if(rope)return [200,60,50]; return lit(n?[190,170,120]:[120,112,96]); }},   // the gym (146zka): bags and the ring's ropes through the glass
    // the new map's shops (owner, 6 Nov 2026): painted brick fronts, a sign and a shop window each (no awnings, nothing western); h their height in z-pixels (a metre is 28.6)
    ...Object.fromEntries([['florist','THE FLORIST','FLOWERS',[128,64,52],[255,190,200]],['bees','THE BEEKEEPER','HONEY',[132,82,56],[255,206,90]],['bfly','THE BUTTERFLY SHOP','BUTTERFLIES',[110,62,54],[200,170,255]],
      ['birds','THE BIRD SHOP','BIRDS',[124,74,60],[170,220,255]],['pets','THE PET STORE','PETS',[96,60,50],[180,255,170]],['mush','THE MUSHROOM SHOP','MUSHROOMS',[118,70,58],[255,150,110]],
      ['gems','THE GEM SHOP','GEMS',[92,86,90],[140,255,230]],['armor','THE ARMOURY','ARMS',[84,78,76],[255,120,90]],['clothes','THE CLOTHES SHOP','CLOTHES',[126,68,56],[255,220,160]],
      ['skate','THE SKATE SHOP','SKATE',[104,64,52],[255,170,60]],['fishing','FISHING & SCUBA','TACKLE',[90,84,82],[130,210,255]],['tailor','THE TAILOR','TAILOR',[120,72,60],[240,220,190]],
      ['barber','THE BARBER','BARBER',[116,66,58],[255,120,120]],['hotel','THE HOTEL','HOTEL',[110,78,62],[255,230,170]],['antiques','ANTIQUES & PAWN','PAWN',[110,84,64],[255,200,120]],['outfitter','THE OUTFITTER','GEAR',[90,92,80],[180,255,140]]].map(([id,name,sign,w,c])=>[id,{name,sign,signC:c,neon:true,signBg:[30,26,28],wall:BLOCKS.brick(w),trim:[200,190,170],frame:[44,40,42],door:.5,h:id==='hotel'?300:170}]))};

  /* ---------- the outside: a shopfront painted on the block's street face ---------- */
  const front=(D,W)=>{ const H0=100, sz=4, sc=Math.floor((W*24-(D.sign.length*6-1)*sz)/2), on=MS.word(D.sign,sc,H0+8,sz), du=D.door*W;
    return (u,z,f,night)=>{ const c=Math.floor(u*24);
      if(z<8)return sh([38,36,40],f*(.9+.2*hs(c,1,3)));
      if(z>=H0&&z<H0+44){ if(z<H0+3||z>=H0+41)return sh(D.trim,f*.8); const n=D.neon?MS.neon(on,c,z,sz,D.signC,f):(on(c,z)?sh(D.signC,f):null); return n||sh(D.signBg,f*(.92+.1*hs(Math.floor(c/6),Math.floor(z/6),11))); }
      if(z>=H0)return null;
      const dw=D.dw||.85;   // the door's half width (a shop with glass doors: two tall panes, a stile between, brass bars, lit warm at night)
      if(Math.abs(u-du)<dw){ const e=Math.abs(u-du); if(e>dw-.1||z>94)return sh(D.frame,f);
        if(D.glass){ if(z<10)return sh(D.frame,f); if(e<.05)return sh(D.frame,f*1.1); if(z>48&&z<52&&e>.12&&e<.3)return sh([196,160,80],f*1.2); if(z>88)return sh(D.frame,f); return lit([168,124,74].map(c=>c*(.88+.12*hs(Math.floor(u*8),Math.floor(z/8),3))*(1+.1*((u*3+z/40)%1)))); }   // the shop's warm light through the glass (it glows after dark)
        if(z<88&&e<.62&&z>10){ const g=e<.5&&z>40; return g?sh([26,30,34],f*1.1):sh(D.frame,f*1.15); } return sh(D.frame,f*.9); }
      if(D.both){ const L0=Math.max(.35,du-D.half), L1=du-dw-.2, R0=du+dw+.2, R1=Math.min(W-.35,du+D.half), inL=u>L0&&u<L1, inR=u>R0&&u<R1;   // windows either side of the door
        if((inL||inR)&&z>16&&z<92){ const a0=inL?L0:R0, a1=inL?L1:R1, m=(u-a0)%2.2; if(m<.08||z<19||z>89)return sh(D.frame,f); const w=D.win&&D.win((u-a0)/(a1-a0),(z-16)/76,night); if(w)return w; return sh([24,26,30],f*.9); }
        if(z<16)return sh(D.trim,f*.85); return null; }
      const a0=du>W/2?.35:du+1, a1=du>W/2?du-1:W-.35; if(u>a0&&u<a1&&z>16&&z<92){ const m=(u-a0)%2.2; if(m<.08||z<19||z>89)return sh(D.frame,f);
        const w=D.win&&D.win((u-a0)/(a1-a0),(z-16)/76,night); if(w)return w; const gl=.6+.4*Math.max(0,1-Math.abs((u-a0)/(a1-a0)-.5)*2); return sh([24,26,30],f*gl); }
      if(z<16)return sh(D.trim,f*.85);
      return null; }; };
  MSHOP.front=front;
  const make=(id,D,n)=>{ const p=WP[id], LW=MS.lot(id,D.h), TA=TURN(LW,p.face||'n'), L=TA.L, W=L.x1-L.x0, lcx=L.x0+D.door*W, at=(u,v)=>{ const q=TA.pt(u,v); return [X(q[0]),Z(q[1])]; };
    if(D.both)D.half=(p.inW||11)/2-.3; const fr=D.pf?null:front(D,W), wall=D.wall, top=D.h;
    if(D.pf){ const S=p.face==='s', fy=S?LW.y0:LW.y1, zi=Math.sign(Z(fy+(S?1:-1))-Z(fy)); MSHOP.fronts.push({id,pf:D.pf,x:X((LW.x0+LW.x1)/2),zf:Z(fy),zi,w:Math.abs(X(LW.x1)-X(LW.x0)),rot:TA.hd(0),L,pt:TA.pt,du:lcx}); }   // the Polyfork building stands on the lot (068a-pfrow); the lot's solid below is its footprint
    else { const dw=D.dw||.85, du=D.door*W, sh0=D.both?[[lcx-D.half+.08,lcx-dw-.28,19,89],[lcx+dw+.28,lcx+D.half-.08,19,89],[lcx-dw+.12,lcx+dw-.12,12,86]]:[[L.x0+(du>W/2?.35:du+dw+.15),L.x0+(du>W/2?du-dw-.15:W-.35),16,92]];
      FACADES.make({id,L,pt:TA.pt,z1:D.h,wall:(D.wall&&D.wall.c)||[128,64,52],trim:D.trim,frame:D.frame,seed:id.length*31+n,ground:118,door:D.both?null:{u:lcx,w:dw},shop:sh0.map(([u0,u1,z0,z1])=>({u0,u1,z0,z1})),sign:{text:D.sign,color:D.signC,bg:D.signBg,u:(L.x0+L.x1)/2}}); }   // modelled, not painted (owner, 8 Nov 2026)
    if(!D.pf){ BATCH.build(MKA); for(const me of Object.values(BATCH.meshes)){ me.castShadow=true; me.receiveShadow=true; } BATCH.meshes={}; }
    // a Hudson shop is open at the front (owner, 8 Nov 2026: "they should be open area you walk in no door"): its walls, shelves and counter are solid, the shop is walked into, its merchant behind the counter; the bookstore keeps its door (its library and stacks are inside)
    if(p.row===2&&D.pf&&id!=='books'){ const m=1/.84, w=L.x1-L.x0, c=(L.x0+L.x1)/2, sb=(u0,v0,u1,v1,h)=>{ const a=TA.pt(u0,v0), b=TA.pt(u1,v1), r=box4(a[0],a[1],b[0],b[1]); SOL.up.push(r); FIX.up.push([r[0],r[1],0,r[2],r[3],Y(h)]); };
      sb(L.x0,L.y0,L.x0+.4,L.y1,D.h); sb(L.x1-.4,L.y0,L.x1,L.y1,D.h); sb(L.x0,L.y0,L.x1,L.y0+.4,D.h); for(const u of [L.x0,L.x1-.55*m])sb(u,L.y1-.6*m,u+.55*m,L.y1,D.h);
      for(const u of [L.x0+.3*m,L.x1-.8*m])sb(u,L.y0+1.2*m,u+.5*m,L.y1-2*m,80); sb(c-1.5*m,L.y0+2*m,c+1.5*m,L.y0+2.8*m,32);
      const q=TA.pt(c,L.y0+1.3*m), B=SHARED.BOD, who=p.merchant; if(who&&LEVEL.homes&&!LEVEL.homes[who])LEVEL.homes[who]=[+((X(q[0])-B.XS(0))/(B.XS(1)-B.XS(0))).toFixed(2),+((Z(q[1])-B.ZS(0))/(B.ZS(1)-B.ZS(0))).toFixed(2),0,null];
      const e=TA.pt(c,L.y1-1.5*m); STORE.places.push([D.name,X(e[0]),Z(e[1]),'up']); MSHOP.at[id]={open:true,door:at(c,L.y1)}; return; }
    { const r=box4(LW.x0,LW.y0,LW.x1,LW.y1); SOL.up.push(r); FIX.up.push([r[0],r[1],0,r[2],r[3],Y(D.h)]); }

    /* ---------- the inside, off the map: R in tiles, the door in the middle of its front wall ---------- */
    const IW=p.inW||11, ID=p.inD||9, R={x0:1600+n*30,x1:1600+n*30+IW,y0:-100,y1:-100+ID}, cx=(R.x0+R.x1)/2, WH=p.inH||84;
    STORE.bound.x1=Math.max(STORE.bound.x1,X(R.x1+20)); STORE.bound.z0=Math.min(STORE.bound.z0,Z(R.y0-6)); STORE.bound.z1=Math.max(STORE.bound.z1,Z(R.y1+6));
    let G=null, S=[], PA=null;
    const api={id,who:p.merchant,name:D.name,R,cx,WH,X,Y,Z,T,hs,sh,lit,
      sol:(x0,y0,x1,y1)=>{ const r=box4(x0,y0,x1,y1); S.push(r); SOL.up.push(r); return r; },
      tex:(w,h,f)=>{ const c=document.createElement('canvas'); c.width=w; c.height=h; const g=c.getContext('2d'); g.imageSmoothingEnabled=false; f(g,w,h); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.magFilter=THREE.NearestFilter; t.minFilter=THREE.NearestFilter; t.generateMipmaps=false; return t; },
      // a flat painted quad on the floor or a wall, its texture painted pixel by pixel like the street (fn(u,v) in tiles -> [r,g,b])
      floor:paint=>{ const {faceTex,bq,C}=SHARED.BOD; bq([X(R.x0),Y(.15),Z(R.y1)],[X(R.x1),Y(.15),Z(R.y1)],[X(R.x1),Y(.15),Z(R.y0)],[X(R.x0),Y(.15),Z(R.y0)],faceTex(IW*24,ID*24,(i,j)=>C(paint(R.x0+(i+.5)/24,R.y1-(j+.5)/24))),'A'); },
      wall:(side,paint)=>{ '@later'; const {faceTex,bq,C}=SHARED.BOD, h=WH, P=side==='b'?(a,z)=>[X(a),Y(z),Z(R.y0)]:side==='f'?(a,z)=>[X(a),Y(z),Z(R.y1)]:side==='w'?(a,z)=>[X(R.x0),Y(z),Z(a)]:(a,z)=>[X(R.x1),Y(z),Z(a)];
        const a0=side==='b'||side==='f'?R.x0:R.y0, a1=side==='b'||side==='f'?R.x1:R.y1, w=Math.round((a1-a0)*24); bq(P(a0,0),P(a1,0),P(a1,h),P(a0,h),faceTex(w,h,(i,j)=>C(paint(a0+(i+.5)/24,h-j-.5))),'A'); },
      lamp:(x,y,h,c,i=4,r=8)=>{ const Lt=new THREE.PointLight(c,i,r*T,1.6); Lt.position.set(X(x),Y(h*24),Z(y)); scene.add(Lt); return Lt; },
      add:o=>{ scene.add(o); return o; }};
    const build=()=>{ '@later'; G=new THREE.Group(); G.name=id+'-in'; scene.add(G); S=[];
      PA=ROOMS.part(G,()=>{ (MSHOP.kit[id]||MSHOP.kit._||(()=>{}))(api); },MKA);
      api.sol(R.x0-.1,R.y0,R.x0+.1,R.y1); api.sol(R.x1-.1,R.y0,R.x1+.1,R.y1); api.sol(R.x0,R.y0-.1,R.x1,R.y0+.1); api.sol(R.x0,R.y1-.1,cx-.9,R.y1+.1); api.sol(cx+.9,R.y1-.1,R.x1,R.y1+.1); return PA; };
    const unbuild=()=>{ for(const r of S){ const i=SOL.up.indexOf(r); if(i>=0)SOL.up.splice(i,1); } S=[]; if(G){ G.removeFromParent(); G=null; } PA=null; const k=MSHOP.kit[id]||MSHOP.kit._; if(k&&k.drop)k.drop(); };
    const wb=box4(R.x0-.2,R.y0-.2,R.x1+.2,R.y1+.2);
    ROOMS.off[id]={name:D.name,box:{x0:wb[0],z0:wb[1],x1:wb[2],z1:wb[3],y0:-1,y1:Y(WH+30)},need:()=>LOAD('later'),build,unbuild,
      spawn:[X(cx),Z(R.y1-1.3),0,Math.PI],out:[...at(lcx,L.y1+.9),0,TA.hd(0)],door:(d=>[d[0],Y(0),d[1]])(at(lcx,L.y1+.25)),exit:[X(cx),0,Z(R.y1-.25)],exitName:'OUT TO THE STREET'};
    { // its window, real both ways (130a): the street front and the inside's front wall are matched at the door (M: street to inside, turned and moved), the glass the part of the painted window that lies along the inside's wall
      const V3=THREE.Vector3, P2=(q,y=0)=>new V3(q[0],y,q[1]), S0=P2(at(lcx,L.y1)), us=P2(at(lcx+1,L.y1)).sub(S0).normalize(), ns=P2(at(lcx,L.y1+1)).sub(S0).normalize(), I0=new V3(X(cx),0,Z(R.y1)), ui=new V3(Math.sign(X(cx+1)-X(cx)),0,0), ni=new V3(0,0,Math.sign(Z(R.y1+1)-Z(R.y1))), up=new V3(0,1,0);
      const Bs=new THREE.Matrix4().makeBasis(us,up,ns).setPosition(S0), Bi=new THREE.Matrix4().makeBasis(ui,up,ni).setPosition(I0), M=Bi.multiply(Bs.invert()); ROOMS.off[id].xf=M;
      const du=D.door*W, dw=D.dw||.85, tl=Math.abs(X(1)-X(0)), ry=Math.atan2(ns.x,ns.z);
      // one pane: o0..o1 across from the door's middle (tiles), z0..z1 up (the street's pixels); seen from the street it shows the inside, from inside the street
      const pane=(o0,o1,z0,z1)=>{ o0=Math.max(o0,R.x0+.3-cx); o1=Math.min(o1,R.x1-.3-cx); z1=Math.min(z1,WH-6); if(o1-o0<.5)return; const h=Y(z1)-Y(z0), yc=(Y(z0)+Y(z1))/2, mid=(o0+o1)/2, w=(o1-o0)*tl;
        const pin=new THREE.Mesh(new THREE.PlaneGeometry(w,h)); pin.position.copy(P2(at(lcx+mid,L.y1+.04),yc)); pin.rotation.y=ry; scene.add(pin); WINDOWS.pane(pin,id,'in',false,true);
        const pout=new THREE.Mesh(new THREE.PlaneGeometry(w,h)); pout.position.copy(new V3(X(cx+mid),yc,Z(R.y1-.04))); pout.rotation.y=Math.atan2(ni.x,ni.z); scene.add(pout); WINDOWS.pane(pout,id,'out',false,true); };
      if(D.pf){} else if(D.both){ const hf=D.half; pane(-hf+.08,-dw-.28,19,89); pane(dw+.28,hf-.08,19,89); pane(-dw+.12,-.06,12,86); pane(.06,dw-.12,12,86); }   // both windows and the two glass doors, real through
      else pane((du>W/2?.35:du+dw+.15)-du,(du>W/2?du-dw-.15:W-.35)-du,16,92); }
    MSHOP.at[id]={R,cx,door:at(lcx,L.y1+.25)};
    STORE.places.push([D.name,X(cx),Z(R.y1-1.3),'up','off',Math.PI]);
    // its merchant stands inside, behind the counter, unless the level file or the character editor put them elsewhere
    const who=p.merchant, B=SHARED.BOD, tx=w=>(w-B.XS(0))/(B.XS(1)-B.XS(0)), tz=w=>(w-B.ZS(0))/(B.ZS(1)-B.ZS(0));   // (homes are in the street's tiles)
    const home=(k,a)=>{ if(k&&LEVEL.homes&&!LEVEL.homes[k])LEVEL.homes[k]=[+tx(X(cx+(a?a[0]:0))).toFixed(2),+tz(Z(R.y0+(a?a[1]:2.2))).toFixed(2),0,id]; };
    home(who,p.at); for(const k in p.more||{})home(k,p.more[k]); };   // (more: whoever else stands in the shop)
  for(const id of ['theatre','play','bar','bodega','bath']){ const p=WP[id]; if(!p||!p.pf||DEF[id]||AWAY.has(id==='play'?'playhouse':id))continue; const LW=MS.lot(id,200), S=p.face==='s', fy=S?LW.y0:LW.y1, TA=TURN(LW,p.face||'n'); MSHOP.fronts.push({id,pf:p.pf,x:X((LW.x0+LW.x1)/2),zf:Z(fy),zi:Math.sign(Z(fy+(S?1:-1))-Z(fy)),w:Math.abs(X(LW.x1)-X(LW.x0)),rot:TA.hd(0),L:TA.L,pt:TA.pt});
    if(id==='bodega'||id==='bath'){ const r=box4(LW.x0,LW.y0,LW.x1,LW.y1); SOL.up.push(r); FIX.up.push([r[0],r[1],0,r[2],r[3],Y(120)]); } }   // the theatre's, playhouse's, bar's, bodega's and bath house's Polyfork outsides (their insides off the map; the bodega and bath house solid here, the others by their own builders)   // the theatre's and the playhouse's Polyfork outsides (their insides off the map)
  let n=0; for(const id in DEF)if(WP[id])make(id,WP[id].pf&&!DEF[id].pf?{...DEF[id],pf:WP[id].pf}:DEF[id],n++);   // a place that names a Polyfork building stands it (owner, 7 Nov 2026: the Hudson row's shops)
  window.MSHOPDBG=()=>({shops:Object.keys(MSHOP.at),built:Object.keys(MSHOP.at).filter(id=>ROOMS.lazy[id]&&ROOMS.lazy[id].done)});
});
window.MSHOP=MSHOP;
export {MSHOP};
