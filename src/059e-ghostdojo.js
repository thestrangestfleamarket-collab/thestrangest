// THE BATH HOUSE (the ghost street's dojo until 19 Oct 2026): gdShape lays its lot; its own builder for the outside and, off the map, its inside (an empty dojo hall full of steam).
import {SHARED, THREE} from './003-shx.js';
import {BATCH, CLOCK, pos, ROOMS, UI, VIT} from './003b-systems.js';
import {PPU, renderer, scene} from './004-main.js';
import {BLDK, cutWalls, FIX, grab, LOTX, LOTY, MODS, SEEN, SOL, STORE, SYS, TILE, WP} from './006-map-pre.js';
import {FLAME} from './007-fire.js';
import {OBJ} from './008-batch.js';
import {ONSEN} from './023-west-kits.js';

await grab('ghostdojo',async()=>{ const {X:BX,Y:BY,Z:BZ,gbox:GB,faceTex,bq,C}=SHARED.BOD, J=SHARED.BOD.GDJ, GK=SHARED.BOD.GDK, {hash,grain}=SHARED.BOD.g, sh=SHARED.BOD.K.sh;
  if(GK){ const S=GK.S||1, {u,v,iu,iv}=GK, X=x=>BX(u(x)), Z=y=>BZ(v(y)), Y=z=>BY(z*S);   // drawn 1.5x about the middle of its front (owner, 8 Nov 2026): built and painted at its old size, every point scaled
    const F=GK.flip?-1:1, mm=(a,b)=>[Math.min(a,b),Math.max(a,b)];
    const gbox=(b,k)=>{ const [x0,x1]=mm(u(b.x0),u(b.x1)), [y0,y1]=mm(v(b.y0),v(b.y1)), o={...b,x0,x1,y0,y1,z0:b.z0*S,z1:b.z1*S}; if(b.fs)o.fs=(nx,ny,P,Q,z,f)=>b.fs(nx*F,ny*F,iu(P),iv(Q),z/S,f); if(b.skf)o.skf=(nx,ny,...r)=>b.skf(nx*F,ny*F,...r); if(b.fi)o.fi=(Q,z)=>b.fi(iv(Q),z/S); if(b.fj)o.fj=(P,z)=>b.fj(iu(P),z/S); if(b.top)o.top=(x,y)=>b.top(iu(x),iv(y)); return GB(o,k); };
    const {X0,X1,Y0,Y1,W,D}=GK, T=.22, H=168, H2=H, DH=118,   // one storey (owner, 10 Nov 2026: "remove the 2nd story from bathouse"): the roof sits on the ground floor
    hs=hash;
    const xi0=X0+T, xi1=X1-T, yi0=Y0+T, yi1=Y1-T, cx=(xi0+xi1)/2, cy=(yi0+yi1)/2, WD=J.DJWOOD;
    const lit=c=>Object.assign([Math.min(255,c[0]),Math.min(255,c[1]),Math.min(255,c[2])],{e:1});
    J.setDJ({H:160});
    const KW=Math.min(1,W/14.6), BAY={a0:1.4*KW,a1:5.2*KW,z0:36,z1:124,out:.14}, DOOR={a0:W/2-1.2,a1:W/2+1.2,z0:0,z1:DH}, EW={a0:9.4*KW,a1:12.4*KW,z0:40,z1:124};   // the windows laid out for a 14.6-tile front, kept clear of the door on a narrower one
    const RND={back:[3.3],west:[D/2]}, RZc=76, RR=27;
    const UW=[{a0:2.0,a1:4.6},{a0:W-4.6,a1:W-2.0}], UZ0=H+42, UZ1=H+104, SIGN={a0:W/2-1.45,a1:W/2+1.45,z0:DH+2,z1:H};
    const IVY={front:[[.25,262,1.3],[W-.3,150,.7]],west:[[.9,290,1.5],[3.5,210,1.3],[5.6,130,.9]],back:[[1.6,190,1.4],[8.6,250,1.7],[13.2,150,.8]],east:[[4.6,120,.8]]};
    const LEAF=[[30,56,36],[42,78,44],[60,102,52],[88,132,64]];
    const holesOf={front:[BAY,DOOR,EW],back:[],west:[],east:[]};
    const inOpen=(f,a,z)=>{ for(const h of holesOf[f])if(a>h.a0-.12&&a<h.a1+.12&&z>h.z0-4&&z<h.z1+4)return true; for(const m of RND[f]||[])if(Math.hypot((a-m)*24,z-RZc)<RR+5)return true;
      if(f==='front'){ for(const u of UW)if(a>u.a0-.12&&a<u.a1+.12&&z>UZ0-4&&z<UZ1+4)return true; if(a>SIGN.a0-.1&&a<SIGN.a1+.1&&z>SIGN.z0-4&&z<SIGN.z1+4)return true; } return false; };
    const ivyK=(f,a,z)=>{ let best=0; for(const [ra,hm,w] of IVY[f]||[]){ if(z>hm+12)continue; const t=z/hm, sp=w*(.3+.9*Math.sin(Math.min(1,t)*2.4)), d=Math.abs(a-ra)/Math.max(.08,sp);
        best=Math.max(best,1-d-Math.max(0,t-.75)*2.4+(grain(a*2.2+ra,z/16,640,.5)-.5)*.9); } return best; };
    const ivy=(f,a,z)=>{ if(inOpen(f,a,z))return null; const k=ivyK(f,a,z);
      for(const [ra,hm] of IVY[f]||[])if(z<hm*.8&&Math.abs(a-(ra+.18*Math.sin(z/17+ra*3)+.06*Math.sin(z/5)))<.045&&k>-.3)return [70,56,40];
      if(k<.32)return null; const qa=Math.floor(a*24/3), qz=Math.floor(z/3), h=hs(qa,qz,641), ia=Math.floor(a*24)-qa*3, iz=Math.floor(z)-qz*3;
      if(h<.14||k<.42&&h<.5)return k<.42?null:[20,34,24];
      return ia===0&&iz===2?LEAF[3]:LEAF[h<.42?0:h<.78?1:2]; };
    const BRD=[[112,74,52],[98,64,46],[124,84,58],[88,58,44],[106,70,50],[118,80,60]], POST=[78,48,40];
    const board=(a,z)=>{ const p=Math.floor(a*24), w=6+Math.floor(hs(Math.floor(p/8),5,650)*3), b=Math.floor(p/w), bx=p-b*w;
      if(bx===0)return [40,26,22];
      let c=BRD[Math.floor(hs(b,1,651)*BRD.length)]; c=sh(c,.9+.16*hs(p,Math.floor(z/(4+hs(b,2,652)*7)),653)); if(bx===1)c=sh(c,1.12);
      const kz=20+hs(b,3,654)*120; if(hs(b,4,655)<.3&&Math.abs(z-kz)<2.4&&Math.abs(bx-w/2)<1.5)c=[56,34,26];
      if(z>=50&&z<56)c=z<51?[150,100,70]:sh(POST,1.05);
      if(Math.abs(z-53)<.6&&bx===Math.floor(w/2))c=[44,44,48];
      if(z<16)c=sh(c,z<6?.6:z<11?.72:.84); if(z<4&&hs(p,Math.floor(z),656)<.45)c=[64,82,48];
      return c; };
    const plaster=(f,a,z)=>{ let c=sh([206,196,172],.93+.09*grain(a*1.2,z/30,660,1)); const p=Math.floor(a*24);
      if(hs(p,Math.floor(z),661)<.05)c=sh(c,.9); if(z>H2-16)c=sh(c,z>H2-7?.72:.84);
      if(f==='front')for(const u of UW)if(a>u.a0&&a<u.a1&&z<UZ0&&z>UZ0-50&&hs(p,0,662)<.35+(UZ0-z)/200)c=sh(c,.84);
      const cr=Math.abs(a-(f==='front'?6.4:2.6)-.12*Math.sin(z/6)-.04*Math.sin(z*1.7)); if(cr<.03&&z>H+10&&z<H+70)c=[96,88,76];
      if(grain(a*1.3+(f==='west'?9:0),z/34,663,1)>.8){ c=(p+Math.floor(z))%4<2?[124,86,58]:[92,62,44]; }
      return c; };
    const lattice=(a,a0,a1,z,z0,z1,glow)=>{ const p=Math.floor((a-a0)*24), L=Math.round((a1-a0)*24); if(p<2||p>=L-2||z<z0+2||z>=z1-2)return [60,38,30];
      if(p%5===0)return [70,44,34];
      return lit(Math.floor(z-z0)%16===0?sh(glow,.86):glow); };
    const round=(a,m,z,glow)=>{ const r=Math.hypot((a-m)*24,z-RZc); if(r>=RR+3)return null; if(r>=RR-1)return [62,40,32]; const u=Math.floor((a-m)*24+40), v=Math.floor(z+40); return u%7===0||v%7===0?[86,56,40]:lit(glow); };
    const WARM=[255,214,150], AMBER=WARM, PINK=WARM;   // every window the same paper glow (owner, 28 Oct 2026)
    const outside=(f,a,z,k)=>{ let c=null;
      if(z<H){ for(const m of RND[f]||[]){ const r=round(a,m,z,WARM); if(r)return r.e?r:sh(r,k); }
        for(const h of holesOf[f])if(a>h.a0-.13&&a<h.a1+.13&&z>h.z0-4&&z<h.z1+4&&!(a>h.a0&&a<h.a1&&z>h.z0&&z<h.z1)){ c=z>=h.z1?[66,40,32]:POST; break; }
        if(!c)c=board(a,z); }
      else{ if(f==='front')for(const u of UW)if(a>u.a0&&a<u.a1&&z>UZ0&&z<UZ1)return lattice(a,u.a0,u.a1,z,UZ0,UZ1,AMBER);
        if((f==='west'||f==='east'||f==='back')&&Math.abs(a-(f==='back'?W/2:D/2))<1&&z>UZ0&&z<UZ1)return lattice(a,(f==='back'?W/2:D/2)-1,(f==='back'?W/2:D/2)+1,z,UZ0,UZ1,AMBER);
        c=plaster(f,a,z); }
      const v=ivy(f,a,z); if(v)c=v; return sh(c,k); };
    const wood=(f=1)=>sh(WD,f);
    function shoji(a,z,L,door,win,alc,holes){ const n=Math.max(1,Math.round(L/2)), sp=L/n, pa=a-Math.floor(a/sp)*sp;
      if(door&&a>door[0]-.1&&a<door[1]+.1){ const m=(door[0]+door[1])/2, u=Math.abs(a-m)*24, hw=(door[1]-door[0])*12;   // two sliding shoji panels, the way out
        if(z<DH+4){ if(u>hw-2.4||z>DH-3||z<3)return wood(z>DH-3?1.12:.8); if(u<1.2)return wood(.7); if(z<16)return wood(.95); if(Math.hypot(u-5,z-52)<2.2)return [40,30,26];
          return u%8<1.1||(z-16)%11<1.1?wood(1.15):sh(J.DJPAP,.84+.05*hash(Math.floor(a*12),Math.floor(z/3),725)); }
        if(z>=DH+6&&z<DH+16&&a>door[0]+.05&&a<door[1]-.05)return (a*8)%1<.22||z%4.5<1.2?wood(1.15):[40,30,26]; }
      for(const h of holes||[])if(a>h[0]-.14&&a<h[1]+.14&&z>h[2]-5&&z<h[3]+5)return wood(z<h[2]?.8:1.05);
      if(z>=147)return sh(J.DJPLA,.94+.06*hash(Math.floor(a*20),Math.floor(z/2),721));
      if(z>=139)return wood(z<140.5?.8:1.12);
      if(alc&&a>alc[0]&&a<alc[1]){ const u=(a-alc[0])*24, L=(alc[1]-alc[0])*24, du=u-L/2, dz=z-98, r=Math.hypot(du,dz); if(z<10||z>134||u<2||u>L-2)return wood(z<10?.7:1);
        if(r<22)return Math.hypot(du+7,dz-5)<5||Math.hypot(du-6,dz+8)<3.5||Math.hypot(du-9,dz-9)<2.5?lit([222,210,172]):lit([252,240,204]);
        if(r<25.5)return r<23.5?[34,44,86]:lit([150,184,200]);
        if(z<42){ const w=Math.abs(du+2.5*Math.sin(z*1.3))<10-z*.12&&z%5>1.5; return w?lit([236,228,196]):z%9<1.2?[52,82,130]:[30,52,98]; }
        if(z<52)return Math.abs(du+16-z*.6)<20&&z>44?[60,64,70]:[40,48,92];
        return hs(Math.floor(u),Math.floor(z),724)<.012?lit([240,240,250]):Math.abs(z-64-3*Math.sin(u*.08))<2.5&&Math.abs(du)>30?[70,78,120]:[24,30,66]; }
      for(const w of win){ const r=Math.hypot((a-w)*24,z-RZc); if(r<RR+2.5){ if(r>=RR)return wood(); return ((a-w)*24+40)%7<1.3||(z+40)%7<1.3?wood(1.2):lit(WARM); } }
      if(pa<.09||pa>sp-.09||a<.09||a>L-.09)return wood();
      if(z<12)return wood(z<1?.6:(a*6)%1<.08?.75:1.05);
      if(z<13.5||z>136.5||(a*4)%1<.07||z%12<1)return wood(1.25);
      return sh(J.DJPAP,.94+.06*hash(Math.floor(a*12),Math.floor(z/3),723)); }
    const WALLS={front:{n:[0,-1],ax:'x',at0:Y1-T,at1:Y1,o:X0,L:W,inA:a=>a-T,inL:xi1-xi0,win:[],door:[DOOR.a0-T,DOOR.a1-T],holes:[[BAY.a0-T,BAY.a1-T,BAY.z0,BAY.z1],[EW.a0-T,EW.a1-T,EW.z0,EW.z1]]},
      back:{n:[0,1],ax:'x',at0:Y0,at1:Y0+T,o:X0,L:W,inA:a=>a-T,inL:xi1-xi0,win:RND.back.map(m=>m-T),alc:null},
      west:{n:[1,0],ax:'y',at0:X0,at1:X0+T,o:Y0,L:D,inA:a=>a-T,inL:yi1-yi0,win:RND.west.map(m=>m-T),s0:T,s1:D-T},
      east:{n:[-1,0],ax:'y',at0:X1-T,at1:X1,o:Y0,L:D,inA:a=>a-T,inL:yi1-yi0,win:[],s0:T,s1:D-T}};
    const TK=[cx-1.9,cx+1.9];
    WALLS.back.alc=[TK[0]-xi0-.12,TK[1]-xi0];
    const strips=(L,holes,s0=0,s1=L)=>{ const cuts=new Set([s0,s1]); for(const h of holes){ cuts.add(h.a0); cuts.add(h.a1); } const A=[...cuts].sort((p,q)=>p-q), out=[];
      for(let i=0;i+1<A.length;i++){ const u0=A[i], u1=A[i+1], m=(u0+u1)/2, hh=holes.filter(h=>m>h.a0&&m<h.a1).sort((p,q)=>p.z0-q.z0); let z=0;
        for(const h of hh){ if(h.z0>z)out.push([u0,u1,z,h.z0]); z=Math.max(z,h.z1); } if(z<H)out.push([u0,u1,z,H]); } return out; };
    const WB=[]; const box3=(w,u0,u1,z0,z1,t0,t1,fs,top,id)=>w.ax==='x'?{id,x0:w.o+u0,x1:w.o+u1,y0:t0,y1:t1,z0,z1,c:WD,fs,top}:{id,x0:t0,x1:t1,y0:w.o+u0,y1:w.o+u1,z0,z1,c:WD,fs,top};
    for(const id in WALLS){ const w=WALLS[id];
      for(const [u0,u1,z0,z1] of strips(w.L,holesOf[id],w.s0,w.s1))WB.push(box3(w,u0,u1,z0,z1,w.at0,w.at1,(nx,ny,x,y,zr,k)=>{ const z=zr+z0, a=(w.ax==='x'?x:y)-w.o;
        if(nx===w.n[0]&&ny===w.n[1])return shoji(w.inA(a),z,w.inL,w.door,w.win,w.alc,w.holes);
        if(nx===-w.n[0]&&ny===-w.n[1])return outside(id,a,z,k);
        return wood(.9); },()=>sh(WD,1.1),id)); }
    BATCH.tag=OBJ('bodega','bath house'); for(const b of WB)gbox({...b,skf:(nx,ny)=>(nx||ny)&&nx===WALLS[b.id].n[0]&&ny===WALLS[b.id].n[1]},'GD'+b.id);
    const pw=(c,lo=.9,hi=1.08)=>(nx,ny,x,y,z,k)=>sh(c,k*(lo+(hi-lo)*hs(Math.floor((nx?y:x)*24),Math.floor(z/5),670)));
    const OUT={front:[0,1],back:[0,-1],west:[-1,0],east:[1,0]}, onWall=(f,a0,a1,z0,z1,d,c,more={})=>{ const w=WALLS[f], [ox,oy]=OUT[f], t=w.ax==='x'?(oy>0?[w.at1,w.at1+d]:[w.at0-d,w.at0]):(ox>0?[w.at1,w.at1+d]:[w.at0-d,w.at0]);
      return {...box3(w,a0,a1,z0,z1,t[0],t[1],more.fs||pw(c),more.top||(()=>sh(c,1.12)),f),...more}; };
    const POSTS={front:[0,BAY.a0-.08,BAY.a1+.08,DOOR.a0-.1,DOOR.a1+.1,EW.a0-.08,EW.a1+.08,W],back:[0,5.6,9.4,W],west:[.85,D-.85],east:[D/3,2*D/3]};
    const DEP=[];
    for(const f in POSTS)for(const a of POSTS[f]){ const half=a===0||a===WALLS[f].L?.16:.11, a0=Math.max(-.08,a-half), a1=Math.min(WALLS[f].L+.08,a+half); DEP.push(onWall(f,a0,a1,12,H,.08,POST)); }
    for(const f in WALLS){ DEP.push(onWall(f,-.08,WALLS[f].L+.08,H-12,H,.1,[86,54,42])); DEP.push(onWall(f,-.08,WALLS[f].L+.08,H,H+8,.06,[70,44,36])); DEP.push(onWall(f,-.08,WALLS[f].L+.08,H2-8,H2,.06,[70,44,36])); }
    { const b0=BAY.a0, b1=BAY.a1, o=BAY.out, fr=[60,38,30];
      DEP.push(onWall('front',b0,b1,12,BAY.z0,o,[86,54,42],{fs:(nx,ny,x,y,z,k)=>sh(z>BAY.z0-20?(z>BAY.z0-16?[86,54,42]:[60,38,30]):board(x-X0,z+12),k)}));
      for(const a of [b0,b1])DEP.push(onWall('front',a-.04,a+.04,BAY.z0,BAY.z1,o,fr));
      const gl=(nx,ny,x,y,z,k)=>{ const a=x-X0, zz=z+BAY.z0, mull=Math.abs(((a-b0)%1.27)-.635)>.6||Math.abs(zz-96)<1.5||Math.abs(((a-b0)*24%10)-5)>4.4&&zz>96; return mull?sh(fr,k):lit(Math.floor(zz)%22===0?sh(PINK,.88):PINK); };
      DEP.push({id:'front',x0:X0+b0+.04,x1:X0+b1-.04,y0:Y1+o-.04,y1:Y1+o-.01,z0:BAY.z0,z1:BAY.z1,c:PINK,fs:(nx,ny,x,y,z,k)=>ny?gl(nx,ny,x,y,z,k):lit(sh(PINK,.9)),top:()=>lit(PINK)});
      for(let i=0;i<3;i++)DEP.push(onWall('front',b0-.15+i*.04,b1+.15-i*.04,BAY.z1+i*5,BAY.z1+5+i*5,o+.2-i*.1,[92,58,72],{top:(x)=>Math.floor(x*24)%6===0?[52,36,48]:[118,72,76]})); }
    {
      DEP.push({id:'front',x0:X0+EW.a0,x1:X0+EW.a1,y0:Y1-.12,y1:Y1-.1,z0:EW.z0,z1:EW.z1,c:AMBER,fs:(nx,ny,x,y,z,k)=>lit(Math.floor(z+EW.z0)%16===0||Math.floor((x-X0-EW.a0)*24)%14===0?sh(AMBER,.86):AMBER),top:()=>lit(AMBER)});
      DEP.push(onWall('front',EW.a0-.1,EW.a1+.1,EW.z0-6,EW.z0,.14,[86,54,42])); }
    if(H2>H)for(const u of UW){ const L=u.a1-u.a0, n=Math.round(L/.21); for(let i=1;i<n;i++){ const a=u.a0+i*L/n; DEP.push({...onWall('front',a-.025,a+.025,UZ0,UZ1,.05,[68,42,32]),id:'U'}); } DEP.push({...onWall('front',u.a0-.12,u.a1+.12,UZ0-6,UZ0,.12,[86,54,42]),id:'U'}); }
    { const S=SIGN;   // no words (owner, 13 Nov 2026): the hot spring sign, ♨, that everyone reads as a bath
      const gl=(a,z)=>{ const L=S.a1-S.a0, u=(a-S.a0)/L, v=(z-S.z0)/(S.z1-S.z0); if(u<.04||u>.96||v<.07||v>.93)return [52,34,28];
        const px=(a-S.a0)*24, pz=S.z1-z, W=L*24, Hs=S.z1-S.z0, k=Math.max(1,Math.floor(Math.min(W,Hs)*.8/ONSEN.length)); if(ONSEN.at(Math.floor((px-(W-ONSEN.length*k)/2)/k),Math.floor((pz-(Hs-ONSEN.length*k)/2)/k)))return hs(Math.floor(a*24),Math.floor(z),684)<.12?[150,116,62]:[214,168,82];
        return sh([36,52,84],.92+.1*hs(Math.floor(a*12),Math.floor(z/3),685)); };
      DEP.push({...onWall('front',S.a0,S.a1,S.z0,S.z1,.16,[36,52,84],{fs:(nx,ny,x,y,z,k)=>ny>0?sh(gl(x-X0,z+S.z0),k):sh([52,34,28],k),top:()=>[60,40,32]}),id:'U'}); }
    for(const f in IVY){ const w=WALLS[f]; for(let i=0;i<70;i++){ const a=hs(i,f.length,690)*w.L, z=4+hs(i,f.length,691)*290; if(ivyK(f,a,z)<.55||inOpen(f,a,z)||z+9>H2)continue;
        const wd=.06+hs(i,1,692)*.09, ht=4+hs(i,2,693)*5, d=.04+hs(i,3,694)*.07, c=LEAF[1+Math.floor(hs(i,4,695)*3)];
        DEP.push({...onWall(f,a-wd,a+wd,z,z+ht,d,c,{fs:(nx,ny,x,y,zz,k)=>sh(LEAF[Math.floor(hs(Math.floor((nx?y:x)*48),Math.floor(zz),696)*3)],k),top:()=>c}),id:z<H?f:'U'}); } }
    for(const b of DEP)gbox(b,b.id==='U'?'GDU':'GD'+b.id);
    const UP=[]; if(H2>H)for(const f in WALLS){ const w=WALLS[f]; UP.push(box3(w,w.s0||0,w.s1||w.L,H,H2,w.at0,w.at1,(nx,ny,x,y,zr,k)=>{ const z=zr+H, a=(w.ax==='x'?x:y)-w.o; return nx===-w.n[0]&&ny===-w.n[1]?outside(f,a,z,k):sh([180,170,150],k); },()=>[90,86,80],f)); }
    for(const b of UP)gbox(b,'GDU');
    const tileTop=(x,y,row)=>{ const p=Math.floor(x*24), m=((p%6)+6)%6, cI=Math.floor(p/6), t=hs(cI,row,700);
      let c=m===0?[46,32,42]:m<3?[124,74,76]:m<5?[96,60,72]:[74,48,62]; if(t<.025)c=[64,44,40];
      const mo=grain(x*1.5,y*1.5+row*.3,701,.7); if(mo>.7&&m)c=mo>.78?[82,98,58]:[96,104,66]; if(hs(p,Math.floor(y*24),702)<.012)c=[170,168,130]; return c; };
    const tileEnd=(x,z,k,row)=>{ const p=Math.floor(x*24), m=((p%6)+6)%6; return sh(m===0||z<1.5?[40,28,36]:z>5?[150,90,86]:[118,72,76],k); };
    const ROOF=[]; const strip=(x0,x1,y0,y1,z0,z1,row,kind)=>{ const b={x0,x1,y0,y1,z0,z1,c:[92,58,72],top:(x,y)=>tileTop(x,y,row),fs:(nx,ny,x,y,z,k)=>ny?tileEnd(x,z,k,row):sh(nx?(z<3?[40,28,36]:[64,42,44]):[64,42,60],k)}; ROOF.push(b); gbox(b,kind); };
    if(H2>H)for(let i=0;i<4;i++)strip(X0-.35,X1+.35,Y1+.32*i,Y1+.32*(i+1),H+26-i*7,H+33-i*7,i,'GDU');
    if(H2>H)for(let a=.2;a<W;a+=.45){ const rb={x0:X0+a-.035,x1:X0+a+.035,y0:Y1+.85,y1:Y1+1.3,z0:H+1,z1:H+5,c:[70,44,36]}; gbox(rb,'GDU'); }
    const ov=.9, N=13, half=D/2+ov, q=half/N, ym=(Y0+Y1)/2, RX0=X0-.7, RX1=X1+.7;
    for(let i=0;i<N;i++){ const z0=H2+i*8, z1=z0+8; strip(RX0,RX1,Y1+ov-(i+1)*q,Y1+ov-i*q,z0,z1,i,'GDR'); strip(RX0,RX1,Y0-ov+i*q,Y0-ov+(i+1)*q,z0,z1,i+20,'GDR');
      const gy0=Math.max(Y0,Y0-ov+(i+1)*q), gy1=Math.min(Y1,Y1+ov-(i+1)*q); if(gy1>gy0)for(const gx of [[X0,X0+T],[X1-T,X1]]){ const g={x0:gx[0],x1:gx[1],y0:gy0,y1:gy1,z0,z1,c:[190,180,158],fs:(nx,ny,x,y,z,k)=>sh(plaster('west',y-Y0,z+z0),k*.88),top:()=>[150,140,124]}; gbox(g,'GDR'); } }
    const RZ=H2+N*8; gbox({x0:RX0-.1,x1:RX1+.1,y0:ym-.24,y1:ym+.24,z0:RZ,z1:RZ+10,c:[64,46,58],top:(x)=>Math.floor(x*24)%8<1?[44,32,40]:[82,58,70],fs:(nx,ny,x,y,z,k)=>sh(z>7?[96,66,78]:[58,40,52],k)},'GDR');
    for(const ex of [RX0-.1,RX1-.25])gbox({x0:ex,x1:ex+.35,y0:ym-.3,y1:ym+.3,z0:RZ,z1:RZ+22,c:[70,50,60],top:()=>[96,70,82],fs:(nx,ny,x,y,z,k)=>sh(z>18?[110,80,92]:[70,50,60],k)},'GDR');
    const stone=(nx,ny,x,y,z,k)=>{ const a=(nx?y:x)*24, row=Math.floor(z/6), off=hs(row,7,710)*9, b=Math.floor((a+off)/13), ba=(a+off)%13;
      if(ba<1||z%6<1)return sh(grain(a/24*3,z/24*3,711,.5)>.6?[70,86,52]:[60,58,58],k); return sh([[132,128,120],[118,116,112],[146,140,130]][Math.floor(hs(b,row,712)*3)],k*(.94+.08*hs(Math.floor(a),Math.floor(z),713))); };
    const PL=[[X0-.1,X0+DOOR.a0,Y1,Y1+.12],[X0+DOOR.a1,X1+.1,Y1,Y1+.12],[X0-.1,X1+.1,Y0-.12,Y0],[X0-.12,X0,Y0,Y1],[X1,X1+.12,Y0,Y1]];
    for(const [a,b,c_,d] of PL)gbox({x0:a,x1:b,y0:c_,y1:d,z0:0,z1:12,c:[130,126,118],fs:stone,top:(x,y)=>sh([150,146,138],.95+.08*hs(Math.floor(x*24),Math.floor(y*24),714))},'GDL');
    gbox({x0:X0+DOOR.a0-.2,x1:X0+DOOR.a1+.2,y0:Y1,y1:Y1+.55,z0:0,z1:5,c:[140,136,128],fs:stone,top:(x,y)=>sh([156,152,146],(x*24)%26<1?.7:.95+.08*hs(Math.floor(x*24),Math.floor(y*24),715))},'GDL');
    const flat=(x0,y0,x1,y1,z,col,kind)=>bq([X(x0),Y(z),Z(y1)],[X(x1),Y(z),Z(y1)],[X(x1),Y(z),Z(y0)],[X(x0),Y(z),Z(y0)],faceTex((x1-x0)*24,(y1-y0)*24,(i,j)=>C(col(x0+(i+.5)/24,y0+(j+.5)/24))),kind);
    flat(X0,Y0,X1,Y1,H+.5,(x,y)=>sh([92,62,48],.9+.1*hs(Math.floor(x*24/7),3,716)),'GDR');
    { const n=4, L=DOOR.a1-DOOR.a0, nz0=DH-38;
      BATCH.tag=OBJ('bodega','paper lantern');
      for(const a of [DOOR.a0-.5,DOOR.a1+.5]){ const x=X0+a, y=Y1+.55;
        gbox({x0:x-.01,x1:x+.01,y0:y-.01,y1:y+.01,z0:H-8,z1:H+18,c:[30,26,24]},'GDU');
        gbox({x0:x-.2,x1:x+.2,y0:y-.2,y1:y+.2,z0:H-34,z1:H-8,c:[220,60,44],top:()=>[40,30,28],fs:(nx,ny,X_,Y_,z)=>z<3||z>23?[40,30,28]:z%5<1?lit([200,40,30]):lit([255,96,64])},'GDL'); }
      BATCH.tag=OBJ('bodega','bath house'); }
    const THINGS=[], LATER=[]; const thing=(name,boxes,solid=true,later)=>{ if(later)LATER.push([name,boxes]); else{ BATCH.tag=OBJ('bodega',name); for(const b of boxes)gbox(b,'GDL'); } THINGS.push({name,boxes,solid}); };
    const bk=(x0,y0,x1,y1,z0,z1,c,more={})=>({x0,y0,x1,y1,z0,z1,c,...more});
    const BEDS=[];
    BATCH.tag=null;
    const [,,,yE]=GK.pool, yR=yE-.32, yS=yE-.7, yL=yE-1.1, WL=-3, BS=-20, BD=-64, GAP=1.5;
    const floorCol=(x,y)=>{ const e=Math.min(x-xi0,xi1-x,y-yE,yi1-y), i=Math.floor(x*4), j=Math.floor(y*4); if(x*4-i<.08||y*4-j<.08)return [138,146,150];
      return sh(e<.5?[66,112,150]:hash(i,j,701)<.14?[110,160,186]:[206,214,216],.95+.08*hash(i,j,702)); };
    const COP=[[xi0,cx-GAP],[cx+GAP,xi1]], ISL=[[cx-.75,yi0+.02,cx+.75,yi0+1.25,5],[xi0+.4,yi0+.35,xi0+1.1,yi0+1.05,-4],[xi1-1.1,yi0+.35,xi1-.4,yi0+1.05,-4],[xi0+1.9,yi0+.2,xi0+2.6,yi0+.9,3],[xi1-2.6,yi0+.2,xi1-1.9,yi0+.9,3]];
    const PB=[[150,196,198],[138,186,190],[162,206,204],[146,190,196]], SEAM=[70,196,190];
    const bot=(x,y,deep)=>{ '@later'; const u=x-xi0, v=y-yi0, row=Math.floor(v/.5), off=hs(row,9,780)*.6, col=Math.floor((u+off)/.7), fu=(u+off)/.7-col, fv=v/.5-row;
      if(deep)for(const m of [cx-3.4,cx+3.4]){ const dx=x-m, dy=y-(yi0+yL)/2, r=Math.hypot(dx,dy); if(r<.56&&Math.hypot(dx-.22,dy+.1)>.46)return lit([240,214,130]); if(r>.72&&r<.78)return lit(SEAM); if(r<.8)return sh(PB[2],1.04); }
      if(fu<.05||fv<.06)return lit(SEAM); return sh(PB[Math.floor(hs(col,row,781)*4)],.94+.08*hs(Math.floor(x*24),Math.floor(y*24),782)); };
    const bw=(a,z)=>{ const row=Math.floor(-z/10), q=a*24+hs(row,3,783)*14; if(z>WL-2)return [70,84,86]; if(-z%10<1||q%16<1)return lit(SEAM); return sh(PB[Math.floor(hs(Math.floor(q/16),row,784)*4)],.84); };
    BATCH.tag=null;
    flat(X0+DOOR.a0,Y1-T,X0+DOOR.a1,Y1,.4,(x,y)=>sh(J.DJBRD,(x*5)%1<.1?.72:1),'GDL');
    flat(X0+BAY.a0,Y1-T,X0+BAY.a1,Y1+BAY.out,BAY.z0+.3,(x,y)=>sh(J.DJBRD,(x*5)%1<.1?.72:1),'GDfront');
    const ITEMS=[], CAND=[[xi0+.5,yi1-.5],[xi1-.5,yi1-.5]], AND=[[X0+DOOR.a0-.6,yi1-.45],[X0+DOOR.a1+.6,yi1-.45]];
    const WAX=[226,214,186], WG=[236,184,120], E=c=>Object.assign(c,{e:1}), wax=p=>{ '@later'; for(const b of p.boxes)if(!b.life)for(const f of ['fs','fi','fj','top']){ const g=b[f]; if(g)b[f]=(...a)=>{ const c=g(...a); if(!c)return c; if(!c.e)return f==='fs'?E(sh(WG,.28)):c;
        const k=Math.max(0,Math.min(1,(c[0]/240-.3)/1.07)); return f==='top'?E(sh(WG,.62)):E(sh(WG,.3+.34*k*k)); }; }
      const fb=p.boxes.find(b=>b.life), x=(fb.x0+fb.x1)/2, y=(fb.y0+fb.y1)/2; p.boxes.push({x0:x-.012,y0:y-.012,x1:x+.012,y1:y+.012,z0:30,z1:32.5,c:[26,22,20],foot:0,nb:1}); return p; };
    const PLN={}; for(const id in WALLS)PLN[id]=new THREE.Plane(new THREE.Vector3(0,-1,0),1e6);
    BATCH.cast=true;
    const MKG=(k,map,emap)=>{ const pl=PLN[k.slice(2)], cp=pl?{clippingPlanes:[pl]}:{};
      if(k==='B')return new THREE.MeshBasicMaterial({map,side:THREE.DoubleSide,alphaTest:.5});
      if(k==='GDC')return new THREE.MeshLambertMaterial({map,side:THREE.FrontSide});
      if(k==='GDI')return new THREE.MeshLambertMaterial({map,side:THREE.BackSide,...(emap?{emissiveMap:emap,emissive:0xffffff,emissiveIntensity:1.3}:{})});
      return new THREE.MeshLambertMaterial({map,alphaTest:.5,side:k==='GDP'?THREE.FrontSide:THREE.DoubleSide,...(emap?{emissiveMap:emap,emissive:0xffffff,emissiveIntensity:1.3}:{}),...cp}); };
    BATCH.build(MKG);
    BATCH.cast=false; const KM=BATCH.meshes; BATCH.meshes={}; for(const me of BATCH.all(KM,'B'))me.castShadow=false;
    const ix0=X(xi0), ix1=X(xi1), iz0=Z(yi0), iz1=Z(yi1), inBox=()=>pos.x>Math.min(ix0,ix1)&&pos.x<Math.max(ix0,ix1)&&pos.z>Math.min(iz0,iz1)&&pos.z<Math.max(iz0,iz1), inside=inBox;
    const cuts=M=>{ for(const id in WALLS)for(const me of BATCH.all(M,'GD'+id))cutWalls.push({pl:PLN[id],nx:WALLS[id].n[0]*F,nz:WALLS[id].n[1]*F,foot:Y(8),me,when:inside}); }; cuts(KM);
    const HIDE=[...BATCH.all(KM,'GDU'),...BATCH.all(KM,'GDR')];
    { const pane=(h,yf,fn,glow)=>{ const W=Math.max(1,Math.round((h.a1-h.a0)*24)), Hh=Math.max(1,Math.round(h.z1-h.z0)), cv=document.createElement('canvas'), ce=document.createElement('canvas'); cv.width=ce.width=W; cv.height=ce.height=Hh;
        const g=cv.getContext('2d'), ge=ce.getContext('2d'), im=g.createImageData(W,Hh), ie=ge.createImageData(W,Hh);
        for(let j=0;j<Hh;j++)for(let i=0;i<W;i++){ const c=fn(h.a0+(i+.5)/24,h.z1-(j+.5)), k=(j*W+i)*4; im.data.set([c[0],c[1],c[2],255],k); ie.data.set(c.e?[c[0],c[1],c[2],255]:[0,0,0,255],k); }
        g.putImageData(im,0,0); ge.putImageData(ie,0,0); const tex=x=>{ const t=new THREE.CanvasTexture(x); t.magFilter=t.minFilter=THREE.NearestFilter; t.generateMipmaps=false; t.colorSpace=THREE.SRGBColorSpace; return t; };
        const m=new THREE.Mesh(new THREE.PlaneGeometry(Math.abs(X(X0+h.a1)-X(X0+h.a0)),Y(h.z1)-Y(h.z0)),new THREE.MeshLambertMaterial({map:tex(cv),emissiveMap:tex(ce),emissive:0xffffff,emissiveIntensity:glow?1.2:0}));
        m.position.set((X(X0+h.a0)+X(X0+h.a1))/2,(Y(h.z0)+Y(h.z1))/2,Z(yf)); if(GK.flip)m.rotation.y=Math.PI; m.raycast=()=>{}; scene.add(m); HIDE.push(m); return m; };
      pane(BAY,Y1+BAY.out+.02,(a,z)=>lattice(a,BAY.a0,BAY.a1,z,BAY.z0,BAY.z1,PINK),1); pane(EW,Y1+.02,(a,z)=>lattice(a,EW.a0,EW.a1,z,EW.z0,EW.z1,WARM),1);
    }
    if(SHARED.BOD.GHOSTST)SHARED.BOD.GHOSTST.push({name:'ghost street shop roof',boxes:ROOF.filter(b=>b.z0>=H2).map(b=>({...b,x0:Math.max(b.x0,X0),x1:Math.min(b.x1,X1)})),high:1});
    const sol=(x0,y0,x1,y1,zt)=>{ const [a0,a1]=mm(X(x0),X(x1)), [b0,b1]=mm(Z(y0),Z(y1)); SOL.up.push([a0,b0,a1,b1]); FIX.up.push([a0,b0,0,a1,b1,Math.max(.05,Y(zt))]); };
    for(const b of WB)if(b.z0===0)sol(b.x0,b.y0,b.x1,b.y1,H);
    sol(X0+BAY.a0,Y1,X0+BAY.a1,Y1+BAY.out,BAY.z0);
    for(const [a,b,c_,d] of BEDS)sol(a,b,c_,d,8);
    for(const t of THINGS)if(t.solid)sol(Math.min(...t.boxes.map(b=>b.x0)),Math.min(...t.boxes.map(b=>b.y0)),Math.max(...t.boxes.map(b=>b.x1)),Math.max(...t.boxes.map(b=>b.y1)),Math.max(...t.boxes.map(b=>b.z1)));
    for(const p of ITEMS){ const bs=p.boxes.filter(b=>b.z0<30&&b.z1-b.z0>3); if(!bs.length||/incense/.test(p.name))continue;
      sol(Math.min(...bs.map(b=>b.x0)),Math.min(...bs.map(b=>b.y0)),Math.max(...bs.map(b=>b.x1)),Math.max(...bs.map(b=>b.y1)),Math.max(...bs.map(b=>b.z1))); }
    const NEARB=30*TILE, LT=[], STEAM={k:.05,c:new THREE.Color(),day:new THREE.Color(.86,.85,.82),fog:new THREE.Fog(0xdcdad2,0,9*TILE),was:null};
    const light=(x,y,z,c,r,fl)=>{ const cm=Math.max(...c), L=new THREE.PointLight(new THREE.Color(c[0]/cm,c[1]/cm,c[2]/cm),0,r*TILE*1.25*S,1.6); L.position.set(X(x),Y(z),Z(y)); scene.add(L); LT.push({L,i:7*cm*Math.min(1.2,r/5),fl,s:Math.round(x*7+y*13)}); return LT[LT.length-1]; };
    let built=false, BG=null, P=null, busy=false; const build=()=>{ '@bath'; built=true; LT.length=0;   // the dojo hall, empty but for its steam, built where it stands (owner, 4 Nov 2026)
      const RW={front:[],back:[cx-xi0-5.6,cx-xi0+5.6],west:[(yi1-yi0)/2],east:[(yi1-yi0)/2]};
      const OPEN=[[DOOR.a0-T,DOOR.a1-T,0,DH]];
      for(const id in WALLS){ const w=WALLS[id], fr=id==='front';
        for(const [u0,u1,z0,z1] of strips(w.L,fr?[{...DOOR,z1:DH}]:[],w.s0,w.s1))gbox({...box3(w,u0,u1,z0,z1===H?H+2:z1,w.at0,w.at1,(nx,ny,x,y,z)=>shoji(w.inA((w.ax==='x'?x:y)-w.o),z+z0,w.inL,null,RW[id],null,fr?OPEN:[]),()=>wood(),id),skf:(nx,ny)=>!(nx===w.n[0]&&ny===w.n[1])},'GDI'); }
      flat(xi0,yi0,xi1,yi1,H+2,(x,y)=>{ const b=(x-xi0)%2.2; return b<.12?wood(.7):sh(J.DJBRD,.62+.06*hs(Math.floor(y*3),Math.floor(x/2.2),726)); },'GDC');
      const TAT=J.DJTAT, B0=.9;
      BATCH.tag=OBJ('bodega','bath house'); flat(xi0,yi0,xi1,yi1,.4,(x,y)=>{ const e=Math.min(x-xi0,xi1-x,y-yi0,yi1-y);
        if(e<B0){ const al=Math.min(x-xi0,xi1-x)<Math.min(y-yi0,yi1-y), a=al?y:x, bb=al?x:y, k=Math.floor(bb*5); return sh(J.DJBRD,(bb*5)%1<.1?.72:.9+.18*hs(k,Math.floor(a*1.3+k*.37),701)); }
        const u=x-(xi0+B0), v=y-(yi0+B0), bi=Math.floor(u/2), bj=Math.floor(v/2), across=(bi+bj)&1, p=across?u-bi*2:v-bj*2, q=across?v-bj*2:u-bi*2, pm=((p%1)+1)%1, w=hs(Math.floor(pm*30),Math.floor(q*9),703);
        return pm<.035||pm>.965?[64,58,40]:q<.02||q>1.98?sh(TAT,.8):sh(TAT,(Math.floor(pm*30)&1?.94:1)*(.96+.06*w)); },'GDL');
      BATCH.tag=null;
      for(const [x,y] of [[cx-4,cy],[cx+4,cy]])light(x,y,H-30,[1,.84,.62],9,0);
      if(STORE.furnish&&STORE.furnish.bath)STORE.furnish.bath({r:[xi0,yi0,xi1,yi1]});
      was=null; };
    const OUTL=[[X0+(BAY.a0+BAY.a1)/2,Y1+1.4,70,[1,.74,.5],7],[X0+(EW.a0+EW.a1)/2,Y1+1.3,74,[1,.74,.5],7],[X0+W/2,Y1+1.2,90,[1,.66,.4],6],[X0+W/2,Y1+.9,H+60,[1,.72,.44],6],[X0-1.1,Y0+D/2,80,[1,.76,.5],5]];
    for(const [x,y,z,c,r] of OUTL){ const cm=Math.max(...c), L=new THREE.PointLight(new THREE.Color(c[0]/cm,c[1]/cm,c[2]/cm),9*cm*Math.min(1.3,r/5),r*TILE*1.25*S,1.6); L.position.set(X(x),Y(z),Z(y)); L.userData.i0=L.intensity; scene.add(L); }
    const SH=[]; { const V=THREE.Vector3, g0=Y(.6);
      const add=(P,col,gaps,a0w,a1w,z0,z1,yf)=>{ for(const [u0,u1] of gaps){ const Q=[[u0,z0],[u1,z0],[u1,z1],[u0,z1]].map(([a,z])=>new V(X(X0+a),Y(z),Z(yf)));
          const G=Q.map(q=>{ const f=(q.y-g0)/(Y(122)-g0); return new V(q.x,g0,q.z+(Z(Y1+1)-Z(Y1))*P*f); });
          for(const [k,f] of [[0,1],[1,.5]]){ const Gk=G.map((g,i)=>Q[i].clone().lerp(g,f)), pos=[], tri=(a,b,c)=>pos.push(a.x,a.y,a.z,b.x,b.y,b.z,c.x,c.y,c.z), quad=(a,b,c,d)=>{ tri(a,b,c); tri(a,c,d); };
            quad(Q[0],Q[1],Gk[1],Gk[0]); quad(Q[3],Q[2],Gk[2],Gk[3]); quad(Q[0],Q[3],Gk[3],Gk[0]); quad(Q[1],Q[2],Gk[2],Gk[1]); if(!k){ const Gp=G.map(g=>g.clone().setY(g0+.01)); quad(Gp[0],Gp[1],Gp[2],Gp[3]); }
            SH.push({pos,col,k}); } } };
      const gapsOf=(a0,a1,n)=>{ const L=(a1-a0)/n, o=[]; for(let i=0;i<n;i++)if(i%2===0)o.push([a0+i*L+.03,a0+(i+1)*L-.03]); return o; };
      { const P=2.1; add(P,0xffd496,[[EW.a0+.08,EW.a0+1.42],[EW.a0+1.57,EW.a1-.08]],EW.a0,EW.a1,EW.z0+6,EW.z1-6,Y1+.07); }
      { const P=1.8; add(P,0xffd496,[[BAY.a0+.08,BAY.a0+1.2],[BAY.a0+1.35,BAY.a0+2.45],[BAY.a0+2.6,BAY.a1-.08]],BAY.a0,BAY.a1,BAY.z0+2,BAY.z1-2,Y1+BAY.out+.01); }
      { const P=2.4; add(P,0xffd496,[[DOOR.a0+.1,DOOR.a1-.1]],DOOR.a0,DOOR.a1,2,DH-40,Y1+.01); } }
    const SHM={}; for(const s of SH){ const key=s.col+':'+s.k; (SHM[key]||(SHM[key]={col:s.col,pos:[]})).pos.push(...s.pos); }
    const SHX=[]; for(const key in SHM){ const S=SHM[key], g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(S.pos,3)); g.computeBoundingSphere();
      const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:S.col,transparent:true,opacity:.1,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false})); m.renderOrder=3; scene.add(m); SHX.push(m); }
    { const pos=[]; for(const [pcx,pcy,rx,ry] of GK.puddles){ for(let i=0;i<9;i++){ const x=pcx-rx*.7+i*rx*1.4/8+(hs(i,1,730)-.5)*.08, l=ry*(.5+hs(i,2,731)*1.2), y0=pcy-ry*.55+hs(i,3,732)*ry*.3, w=(1+Math.floor(hs(i,4,733)*2))/24;
        const a=[X(x),Y(.7),Z(y0)], b=[X(x+w),Y(.7),Z(y0)], c=[X(x+w),Y(.7),Z(y0+l)], d=[X(x),Y(.7),Z(y0+l)]; pos.push(...a,...b,...c,...a,...c,...d); } }
      const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.computeBoundingSphere();
      const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:0xffc890,transparent:true,opacity:.2,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false})); m.renderOrder=3; m.userData.k=2.4; scene.add(m); SHX.push(m); }
    let was=null, hid=null, step=-1, wIn=false;
    const PW={uT:{value:0},uP:{value:new THREE.Vector4()},me:null}, KT=TILE*BLDK, tx=x=>iu(x/KT+SHARED.BOD.OX), ty=z=>iv(z/KT+SHARED.BOD.OY), inPool=(x,z)=>{ const a=tx(x), b=ty(z); return a>xi0&&a<xi1&&b>yi0&&b<yR-.1; };
    const poke=(x,z,k=1)=>{ PW.uP.value.set(x,z,Math.max(PW.uP.value.z,k),0); };
    const R4=(a,b,c,d)=>[Math.min(a,c),Math.min(b,d),Math.max(a,c),Math.max(b,d)];
    SHARED.BOD.GD={r:R4(u(xi0),v(yi0),u(xi1),v(yi1)),floor:R4(u(xi0),v(yi0+.3),u(xi1),v(yi1)),door:[u(X0+W/2),v(Y1)],dw:(DOOR.a1-DOOR.a0)*S,H:(H+2)*S,eave:H*S,inside:inBox,built:()=>built,here:true,   // here: a ghost comes back where it stands, in the steam
      tick(){ const t=performance.now()/1000, inn=inside(); if(inn){ PW.uT.value+=Math.min(.1,t-(PW.t||t)); } PW.t=t;
      near();
      SHARED.steam=built&&(inn||Math.hypot(pos.x-X(X0+W/2),pos.z-Z(Y1))<12*TILE)?STEAM.v||(STEAM.v={b:[Math.min(ix0,ix1),0,Math.min(iz0,iz1),Math.max(ix0,ix1),Y(H+2),Math.max(iz0,iz1)],k:STEAM.k,c:STEAM.c}):null;   // half the steam it had (owner, 4 Nov 2026), drawn by the fog pass; seen through the open door too
      { const f=built&&inn&&renderer.xr.isPresenting; if(f)scene.fog=STEAM.fog; else if(STEAM.was&&scene.fog===STEAM.fog)scene.fog=null; STEAM.was=f; }   // the headset draws without that pass: plain fog there
      for(const l of LT){ const k=l.fl?FLAME.flick(l.s,t):1; l.L.intensity=l.i*k; } was=inn;
      if(hid!==inn){ hid=inn; for(const me of HIDE)SEEN(me,!inn); }
      const e=CLOCK.elev?CLOCK.elev():0, n=Math.max(0,Math.min(1,(12-e)/22)), st=inn?-1:Math.round(n*3); STEAM.c.copy(STEAM.day).multiplyScalar(1-.5*n);
      if(st!==step){ step=st; for(const m of SHX){ m.visible=st>=0; m.material.opacity=[.05,.08,.12,.16][Math.max(0,st)]*(m.userData.k||1); } } }};
    VIT.mends.push(()=>built&&!VIT.dead&&SHARED.LVL==='up'&&inside()?1/45:0);   // the steam mends you slowly
    function near(){ const d=Math.hypot(pos.x-(ix0+ix1)/2,pos.z-(iz0+iz1)/2);   // the inside is built while you are near (it shows through the open door), dropped once you are far
      if(!built&&!busy&&d<NEARB&&SHARED.LVL==='up'&&SYS.started){ busy=true; Promise.all([LOAD('later'),LOAD(build.chunk)]).then(()=>{ BG=new THREE.Group(); BG.name='bath-in'; scene.add(BG); P=ROOMS.part(BG,build,MKG); BG.traverse(o=>{ if(o.isMesh){ o.userData.intr=false; if(o.material&&o.material.isMeshBasicMaterial)o.castShadow=false; } }); }).finally(()=>{ busy=false; }); }
      else if(built&&d>NEARB+12*TILE){ ROOMS.unpart(P); P=null; if(BG)BG.removeFromParent(); BG=null; built=false; LT.length=0; SHARED.steam=null; if(scene.fog===STEAM.fog)scene.fog=null; STEAM.was=null; } }
    window.GSDBG=()=>({X0,X1,Y0,Y1,door:SHARED.BOD.GD.door,step,shafts:SHX.length,tris:SH.length});
    if(WP.bath&&WP.bath.row===2){ const P=WP.bath, hx=LOTX((P.x0+P.x1)/2), hy=LOTY(P.y0), dX=X(X0+W/2);   // on the Hudson row (owner, 7 Nov 2026) the whole bath house stands off the map; its door is on its Hudson lot (a Polyfork building, 059i)
      ROOMS.off.bath={name:'THE BATH HOUSE',box:{x0:Math.min(ix0,ix1)-.3,z0:Math.min(iz0,iz1)-.3,x1:Math.max(ix0,ix1)+.3,z1:Math.max(iz0,iz1)+.3,y0:-1,y1:Y(H+4)},need:()=>Promise.resolve(),build:()=>{},unbuild:()=>{},
        spawn:[dX,Z(Y1-1.6),0,Math.PI],out:[X(hx),Z(hy-.7),0,Math.PI],door:[X(hx),Y(0),Z(hy-.25)],exit:[dX,0,Z(Y1-.4)],exitName:'OUT TO THE PROMENADE'}; }
    window.LOOKAT=(x,z,k=1,y=0)=>{ UI.setFree(true); UI.camT.set(x,y,z); SHARED.ppu=SHARED.ppuTo=PPU*k; return [x,z]; };
    window.LOOKYAW=d=>{ SHARED.yaw=SHARED.yawTo=d*Math.PI/180; }; window.LOOKPITCH=d=>{ SHARED.pitch=SHARED.pitchTo=d*Math.PI/180; return SHARED.pitch; };
    window.GSLOOK=(dx=0,dy=0,k=.5,d)=>{ if(d!=null)LOOKYAW(d); return LOOKAT(X(X0+W/2+dx),Z(Y1+dy),k); };
    window.GSGO=(dx=0,dy=4)=>{ if(MODS.subGo)MODS.subGo(X(X0+W/2+dx),Z(Y1+dy),'up'); return [X(X0+W/2+dx),Z(Y1+dy)]; }; } });
