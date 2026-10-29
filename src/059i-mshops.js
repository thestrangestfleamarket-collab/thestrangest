// THE MERCHANTS' SHOPS: MSHOP, the one way a merchant gets a small shop: its outside one painted block on its lot in the level file (shopfront, window, door, sign), its inside off the map (about half the bodega), built behind the fade when you go in and furnished by the merchant's own kit (MSHOP.kit[id]).
import {SHARED, THREE} from './003-shx.js';
import {ROOMS} from './003b-systems.js';
import {scene} from './004-main.js';
import {FIX, grab, LEVEL, SOL, STORE, TILE, TURN, WP} from './006-map-pre.js';
import {BATCH} from './008-batch.js';
const MSHOP={kit:{},at:{},defs:{}};
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
      win:(u,v,n)=>{ if(v>.2&&v<.8&&(Math.floor(u*9)%2)===0)return n?lit([90,200,120]):[44,70,50]; return null; }}};

  /* ---------- the outside: a shopfront painted on the block's street face ---------- */
  const front=(D,W)=>{ const H0=100, sz=4, sc=Math.floor((W*24-(D.sign.length*6-1)*sz)/2), on=MS.word(D.sign,sc,H0+8,sz), du=D.door*W;
    return (u,z,f,night)=>{ const c=Math.floor(u*24);
      if(z<8)return sh([38,36,40],f*(.9+.2*hs(c,1,3)));
      if(z>=H0&&z<H0+44){ if(z<H0+3||z>=H0+41)return sh(D.trim,f*.8); const n=D.neon?MS.neon(on,c,z,sz,D.signC,f):(on(c,z)?sh(D.signC,f):null); return n||sh(D.signBg,f*(.92+.1*hs(Math.floor(c/6),Math.floor(z/6),11))); }
      if(z>=H0)return null;
      if(Math.abs(u-du)<.85){ if(Math.abs(u-du)>.75||z>94)return sh(D.frame,f); if(z<88&&Math.abs(u-du)<.62&&z>10){ const g=Math.abs(u-du)<.5&&z>40; return g?sh([26,30,34],f*1.1):sh(D.frame,f*1.15); } return sh(D.frame,f*.9); }
      const a0=du>W/2?.35:du+1, a1=du>W/2?du-1:W-.35; if(u>a0&&u<a1&&z>16&&z<92){ const m=(u-a0)%2.2; if(m<.08||z<19||z>89)return sh(D.frame,f);
        const w=D.win&&D.win((u-a0)/(a1-a0),(z-16)/76,night); if(w)return w; const gl=.6+.4*Math.max(0,1-Math.abs((u-a0)/(a1-a0)-.5)*2); return sh([24,26,30],f*gl); }
      if(z<16)return sh(D.trim,f*.85);
      return null; }; };
  const make=(id,D,n)=>{ const p=WP[id], LW=MS.lot(id,D.h), TA=TURN(LW,p.face||'n'), L=TA.L, W=L.x1-L.x0, lcx=L.x0+D.door*W, at=(u,v)=>{ const q=TA.pt(u,v); return [X(q[0]),Z(q[1])]; };
    const fr=front(D,W), wall=D.wall, top=D.h;
    BLOCKS.make({x0:LW.x0,x1:LW.x1,y0:LW.y0,y1:LW.y1,z0:0,z1:D.h,kind:'A',turn:TA,roof:(x,y)=>sh([48,46,50],.9+.14*hs(Math.floor(x*4),Math.floor(y*4),71)),
      paint:(side,u,z,f)=>{ if(side==='f'){ const q=fr(u-L.x0,z,f,0); if(q)return q; }
        if(z>top-14)return sh(D.trim,f*(z>top-4?1.1:.85)); const wu=u-L.x0;
        if(side==='f'&&z>112&&z<top-24){ const k=Math.floor(wu/2.6), m=wu-k*2.6; if(m>.7&&m<1.9&&wu>1&&wu<W-1){ const lt=hs(k,id.length,5)>.55; return (z-112)%30<3?sh(D.trim,f):lt?lit([214,170,96]):sh([20,22,28],f*1.2); } }
        return wall(u,z,f); }});
    BATCH.build(MKA); for(const me of Object.values(BATCH.meshes)){ me.castShadow=true; me.receiveShadow=true; } BATCH.meshes={};
    { const r=box4(LW.x0,LW.y0,LW.x1,LW.y1); SOL.up.push(r); FIX.up.push([r[0],r[1],0,r[2],r[3],Y(D.h)]); }

    /* ---------- the inside, off the map: R in tiles, the door in the middle of its front wall ---------- */
    const IW=p.inW||11, ID=p.inD||9, R={x0:1600+n*30,x1:1600+n*30+IW,y0:-100,y1:-100+ID}, cx=(R.x0+R.x1)/2, WH=p.inH||84;
    STORE.bound.x1=Math.max(STORE.bound.x1,X(R.x1+20)); STORE.bound.z0=Math.min(STORE.bound.z0,Z(R.y0-6)); STORE.bound.z1=Math.max(STORE.bound.z1,Z(R.y1+6));
    let G=null, S=[], PA=null;
    const api={id,R,cx,WH,X,Y,Z,T,hs,sh,lit,
      sol:(x0,y0,x1,y1)=>{ const r=box4(x0,y0,x1,y1); S.push(r); SOL.up.push(r); return r; },
      tex:(w,h,f)=>{ const c=document.createElement('canvas'); c.width=w; c.height=h; const g=c.getContext('2d'); g.imageSmoothingEnabled=false; f(g,w,h); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.magFilter=THREE.NearestFilter; t.minFilter=THREE.NearestFilter; t.generateMipmaps=false; return t; },
      // a flat painted quad on the floor or a wall, its texture painted pixel by pixel like the street (fn(u,v) in tiles -> [r,g,b])
      floor:paint=>{ const {faceTex,bq,C}=SHARED.BOD; bq([X(R.x0),Y(.15),Z(R.y1)],[X(R.x1),Y(.15),Z(R.y1)],[X(R.x1),Y(.15),Z(R.y0)],[X(R.x0),Y(.15),Z(R.y0)],faceTex(IW*24,ID*24,(i,j)=>C(paint(R.x0+(i+.5)/24,R.y1-(j+.5)/24))),'A'); },
      wall:(side,paint)=>{ const {faceTex,bq,C}=SHARED.BOD, h=WH, P=side==='b'?(a,z)=>[X(a),Y(z),Z(R.y0)]:side==='f'?(a,z)=>[X(a),Y(z),Z(R.y1)]:side==='w'?(a,z)=>[X(R.x0),Y(z),Z(a)]:(a,z)=>[X(R.x1),Y(z),Z(a)];
        const a0=side==='b'||side==='f'?R.x0:R.y0, a1=side==='b'||side==='f'?R.x1:R.y1, w=Math.round((a1-a0)*24); bq(P(a0,0),P(a1,0),P(a1,h),P(a0,h),faceTex(w,h,(i,j)=>C(paint(a0+(i+.5)/24,h-j-.5))),'A'); },
      lamp:(x,y,h,c,i=4,r=8)=>{ const Lt=new THREE.PointLight(c,i,r*T,1.6); Lt.position.set(X(x),Y(h*24),Z(y)); scene.add(Lt); return Lt; },
      add:o=>{ scene.add(o); return o; }};
    const build=()=>{ '@later'; G=new THREE.Group(); G.name=id+'-in'; scene.add(G); S=[];
      PA=ROOMS.part(G,()=>{ (MSHOP.kit[id]||(()=>{}))(api); },MKA);
      api.sol(R.x0-.1,R.y0,R.x0+.1,R.y1); api.sol(R.x1-.1,R.y0,R.x1+.1,R.y1); api.sol(R.x0,R.y0-.1,R.x1,R.y0+.1); api.sol(R.x0,R.y1-.1,cx-.9,R.y1+.1); api.sol(cx+.9,R.y1-.1,R.x1,R.y1+.1); return PA; };
    const unbuild=()=>{ for(const r of S){ const i=SOL.up.indexOf(r); if(i>=0)SOL.up.splice(i,1); } S=[]; if(G){ G.removeFromParent(); G=null; } PA=null; if(MSHOP.kit[id]&&MSHOP.kit[id].drop)MSHOP.kit[id].drop(); };
    const wb=box4(R.x0-.2,R.y0-.2,R.x1+.2,R.y1+.2);
    ROOMS.off[id]={name:D.name,box:{x0:wb[0],z0:wb[1],x1:wb[2],z1:wb[3],y0:-1,y1:Y(WH+30)},need:()=>LOAD('later'),build,unbuild,
      spawn:[X(cx),Z(R.y1-1.3),0,Math.PI],out:[...at(lcx,L.y1+.9),0,TA.hd(0)],door:(d=>[d[0],Y(0),d[1]])(at(lcx,L.y1+.25)),exit:[X(cx),0,Z(R.y1-.25)],exitName:'OUT TO THE STREET'};
    MSHOP.at[id]={R,cx,door:at(lcx,L.y1+.25)};
    STORE.places.push([D.name,X(cx),Z(R.y1-1.3),'up','off',Math.PI]);
    // its merchant stands inside, behind the counter, unless the level file or the character editor put them elsewhere
    const who=p.merchant, B=SHARED.BOD, tx=w=>(w-B.XS(0))/(B.XS(1)-B.XS(0)), tz=w=>(w-B.ZS(0))/(B.ZS(1)-B.ZS(0));   // (homes are in the street's tiles)
    const home=(k,a)=>{ if(k&&LEVEL.homes&&!LEVEL.homes[k])LEVEL.homes[k]=[+tx(X(cx+(a?a[0]:0))).toFixed(2),+tz(Z(R.y0+(a?a[1]:2.2))).toFixed(2),0,id]; };
    home(who,p.at); for(const k in p.more||{})home(k,p.more[k]); };   // (more: whoever else stands in the shop)
  let n=0; for(const id in DEF)if(WP[id])make(id,DEF[id],n++);
  window.MSHOPDBG=()=>({shops:Object.keys(MSHOP.at),built:Object.keys(MSHOP.at).filter(id=>ROOMS.lazy[id]&&ROOMS.lazy[id].done)});
});
window.MSHOP=MSHOP;
export {MSHOP};
