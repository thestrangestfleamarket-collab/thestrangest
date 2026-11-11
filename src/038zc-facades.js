// FACADES: a street building's outside modelled, not painted (owner, 8 Nov 2026): solid walls in plain colours, real window openings with frames, sills, lintels, glass and a drawn shade behind it, the room's dark beyond, lit warm at night; string courses, a cornice and a parapet; a shop window left open for its real glass (WINDOWS.pane) and a door.
import {SHARED, THREE} from './003-shx.js';
import {CLOCK, pos} from './003b-systems.js';
import {scene} from './004-main.js';
import {SYS, TILE} from './006-map-pre.js';
const FACADES={night:{value:0},made:0,tris:0,near:[]};
{ const hs=(a,b,c)=>SHARED.BOD.g.hash(a,b,c), lin=c=>{ const t=new THREE.Color(); t.setRGB(c[0]/255,c[1]/255,c[2]/255,THREE.SRGBColorSpace); return [t.r,t.g,t.b]; };
  const SHADES=[[226,214,186],[196,176,140],[168,62,52],[62,82,110],[214,206,196],[120,132,96],[236,226,206],[150,110,80]];
  let MS=null, MG=null; const mats=()=>{ if(MS)return; MS=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide});
    MS.onBeforeCompile=sh=>{ sh.uniforms.uNight=FACADES.night; sh.vertexShader='attribute float aGlow; varying float vGlow;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n vGlow=aGlow;');
      sh.fragmentShader='uniform float uNight; varying float vGlow;\n'+sh.fragmentShader.replace('#include <opaque_fragment>','outgoingLight+=diffuseColor.rgb*vGlow*uNight*1.6;\n#include <opaque_fragment>'); };
    MS.customProgramCacheKey=()=>'facade1';
    MG=new THREE.MeshPhongMaterial({color:0xb8ccd8,specular:0xffffff,shininess:110,transparent:true,opacity:.12,depthWrite:false,side:THREE.DoubleSide}); };
  SYS.add('life',()=>{ const h=CLOCK.h??12, c=x=>Math.max(0,Math.min(1,x)); FACADES.night.value=1-c((h-6.5)/1.5)*c((19.5-h)/1.5); },'038zc-facades');
  // the rich fronts' carved stone shows only near (o.rich.near tiles); farther the plain front stands alone
  let nt=0; SYS.add('places',dt=>{ if((nt-=dt||0)>0)return; nt=.25; for(const n of FACADES.near){ const v=Math.hypot(pos.x-n.x,pos.z-n.z)<n.r; if(n.g.visible!==v)n.g.visible=v; } },'038zc-facades near');
  // the rich fronts' walls: brick laid in running bond, and rusticated stone for the base, each a tile-able picture (TX tiles across)
  const TX=3.6, TEX={}, tex=k=>TEX[k]||(TEX[k]=(()=>{ const cv=document.createElement('canvas'); cv.width=cv.height=512; const g=cv.getContext('2d'), R=(a,b,c)=>hs(a,b,c);
    if(k==='brick'){ g.fillStyle='#8c8274'; g.fillRect(0,0,512,512); const bh=512/48, bw=512/14; for(let r=0;r<48;r++)for(let i=-1;i<15;i++){ const x=i*bw+(r&1)*bw/2, n=R(i,r,3), d=.78+.3*n-(R(i,r,9)<.08?.25:0), q=R(i,r,5)*14-7;
        g.fillStyle=`rgb(${(150+q)*d|0},${(64+q*.4)*d|0},${(46+q*.3)*d|0})`; g.fillRect(x+1.2,r*bh+1.2,bw-2.4,bh-2.4); if(R(i,r,7)<.3){ g.fillStyle='rgba(30,20,16,.18)'; g.fillRect(x+1.2,r*bh+1.2,bw-2.4,2); } } }
    else { g.fillStyle='#4e4b46'; g.fillRect(0,0,512,512); const bh=512/9, bw=512/4; for(let r=0;r<9;r++)for(let i=-1;i<5;i++){ const x=i*bw+(r&1)*bw/2, d=.86+.2*R(i,r,11);
        g.fillStyle=`rgb(${148*d|0},${144*d|0},${136*d|0})`; g.fillRect(x+4,r*bh+5,bw-8,bh-9); g.fillStyle=`rgba(255,255,255,.08)`; g.fillRect(x+4,r*bh+5,bw-8,3); } }
    for(let i=0;i<9000;i++){ const x=R(i,1,13)*512, y=R(i,2,13)*512; g.fillStyle=R(i,3,13)<.5?'rgba(0,0,0,.12)':'rgba(255,255,255,.07)'; g.fillRect(x,y,1.5,1.5); }
    const t=new THREE.CanvasTexture(cv); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.colorSpace=THREE.SRGBColorSpace; return new THREE.MeshLambertMaterial({map:t,side:THREE.DoubleSide}); })());
  // o: L the lot in its own frame (front along L.y1), pt (u,v)->lot tiles (TURN's pt), z1 the height in z-pixels (24 a tile), wall/trim colours,
  // door {u,w} (tiles, its middle and half width), shop [{u0,u1,z0,z1}] openings kept for real glass, glass:true glazes the ground floor's windows itself, seed
  FACADES.make=o=>{ mats(); const {X,Y,Z}=SHARED.BOD, L=o.L, pt=o.pt||((u,v)=>[u,v]), P=[], C=[], G=[], GP=[], seed=o.seed||7;
    const W=(u,v,z)=>{ const q=pt(u,v); return [X(q[0]),Y(z),Z(q[1])]; };
    let T={P,C,G}; const NEAR={P:[],C:[],G:[]}, TQ={brick:{P:[],U:[]},stone:{P:[],U:[]}};
    const quad=(a,b,c,d,col,glow=0)=>{ const k=lin(col); for(const p of [a,b,c,a,c,d]){ T.P.push(p[0],p[1],p[2]); T.C.push(k[0],k[1],k[2]); T.G.push(glow); } };
    // a wall quad with its picture: a..d the corners, (s,z) each corner's run along the wall in tiles and height in z-pixels
    const tq=(k,a,b,c,d,s0,s1,z0,z1)=>{ const q=TQ[k], uv=[[s0,z0],[s1,z0],[s1,z1],[s0,z1]], pts=[a,b,c,d]; for(const i of [0,1,2,0,2,3]){ q.P.push(...pts[i]); q.U.push(uv[i][0]/TX,uv[i][1]/24/TX); } };
    const glass=(a,b,c,d)=>{ for(const p of [a,b,c,a,c,d])GP.push(p[0],p[1],p[2]); };
    // a box in the lot's own frame: u across, v depth (front at larger v), z up
    const box=(u0,u1,v0,v1,z0,z1,col,f=1,gl=0)=>{ const s=k=>col.map(x=>Math.min(255,x*k*f));
      quad(W(u0,v1,z0),W(u1,v1,z0),W(u1,v1,z1),W(u0,v1,z1),s(1),gl); quad(W(u1,v0,z0),W(u0,v0,z0),W(u0,v0,z1),W(u1,v0,z1),s(.8));
      quad(W(u0,v0,z0),W(u0,v1,z0),W(u0,v1,z1),W(u0,v0,z1),s(.86)); quad(W(u1,v1,z0),W(u1,v0,z0),W(u1,v0,z1),W(u1,v1,z1),s(.86));
      quad(W(u0,v0,z1),W(u0,v1,z1),W(u1,v1,z1),W(u1,v0,z1),s(1.08)); quad(W(u0,v1,z0),W(u0,v0,z0),W(u1,v0,z0),W(u1,v1,z0),s(.6)); };
    const {x0,x1,y0,y1}=L, H=o.z1, wall=o.wall||[138,60,44], trim=o.trim||[200,192,178], fr=o.frame||[40,40,44], D=.28, TOP=H-34;
    // the openings on the front: the shop's, the door, then the upper floors' windows (and the ground floor's when it has no shop glass)
    const holes=[], GF=o.ground??110; for(const s of o.shop||[])holes.push({...s,kind:'shop'});
    if(o.door)holes.push({u0:o.door.u-o.door.w,u1:o.door.u+o.door.w,z0:0,z1:o.door.h||88,kind:'door'});
    const bay=o.bay||2.6, ww=o.ww||1.15, nb=Math.max(1,Math.floor((x1-x0-.8)/bay)), b0=x0+(x1-x0-nb*bay)/2, FH=o.floor||92;
    if(o.glass)for(let i=0;i<nb;i++){ const c=b0+(i+.5)*bay; if(o.door&&Math.abs(c-o.door.u)<o.door.w+ww/2+.3)continue; holes.push({u0:c-ww*.6,u1:c+ww*.6,z0:18,z1:84,kind:'win',sill:1}); }
    const RI=o.rich, ST=RI&&(RI.stone||[156,150,140]), RU=RI?(RI.rustic??GF+16):0;
    if(RI&&RI.base)for(let i=0;i<nb;i++){ const c=b0+(i+.5)*bay; if(o.door&&Math.abs(c-o.door.u)<o.door.w+(RI.stoop||1.4))continue; holes.push({u0:c-.42,u1:c+.42,z0:5,z1:GF-5,kind:'base'}); }
    let fl=0; for(let z=GF+30;z+66<TOP-6;z+=FH,fl++)for(let i=0;i<nb;i++){ const c=b0+(i+.5)*bay; holes.push({u0:c-ww/2,u1:c+ww/2,z0:z,z1:z+64,kind:'win',sill:1,fl}); }
    // the front wall with real holes: cut into cells at every opening's edges, a cell inside an opening left out
    const us=[...new Set([x0,x1,...holes.flatMap(h=>[h.u0,h.u1])])].sort((a,b)=>a-b), zs=[...new Set([0,6,16,30,H,...holes.flatMap(h=>[h.z0,h.z1])])].filter(z=>z<=H).sort((a,b)=>a-b);
    const grime=z=>z<6?.74:z<16?.84:z<30?.93:1;   // (wear: the foot of a wall darkened by the street's dirt and splash)
    for(let i=0;i+1<us.length;i++)for(let j=0;j+1<zs.length;j++){ const um=(us[i]+us[i+1])/2, zm=(zs[j]+zs[j+1])/2; if(holes.some(h=>um>h.u0&&um<h.u1&&zm>h.z0&&zm<h.z1))continue;
      if(RI){ tq(zm<RU?'stone':'brick',W(us[i],y1,zs[j]),W(us[i+1],y1,zs[j]),W(us[i+1],y1,zs[j+1]),W(us[i],y1,zs[j+1]),us[i]-x0,us[i+1]-x0,zs[j],zs[j+1]); continue; }
      quad(W(us[i],y1,zs[j]),W(us[i+1],y1,zs[j]),W(us[i+1],y1,zs[j+1]),W(us[i],y1,zs[j+1]),wall.map(c=>c*(1-.06*hs(i,j,seed))*grime(zm))); }
    // RICH: each window in a carved stone surround (quoins, a hood with its keystone, a sill on two brackets), its sash framed; an air conditioner in some of the lowest floor's
    const carve=(h,k,v)=>{ const {u0,u1,z0,z1}=h, mu=(u0+u1)/2, fq=T; T=NEAR; const st=f=>ST.map(c=>c*f*(.94+.1*hs(k,seed,17)));
      for(const [a,b] of [[u0,u0+.06],[u1-.06,u1]])box(a,b,v,v+.06,z0,z1,fr); box(u0,u1,v,v+.06,z1-3,z1,fr); box(u0,u1,v,v+.06,z0,z0+3,fr);
      box(u0-.13,u0,y1-.02,y1+.07,z0,z1+4,st(1)); box(u1,u1+.13,y1-.02,y1+.07,z0,z1+4,st(1)); box(u0-.13,u1+.13,y1-.02,y1+.07,z1,z1+5,st(1));
      for(let j=0;j<5;j++){ const a=z0+j*(z1-z0)/5+.8, b=z0+(j+1)*(z1-z0)/5-.8, w=j&1?.2:.34; box(u0-.13-w,u0-.13,y1-.02,y1+.1,a,b,st(.97+.06*(j&1))); box(u1+.13,u1+.13+w,y1-.02,y1+.1,a,b,st(.97+.06*(j&1))); }
      box(u0-.52,u1+.52,y1-.02,y1+.16,z1+5,z1+12,st(.92)); box(u0-.6,u1+.6,y1-.02,y1+.23,z1+12,z1+15,st(1.08)); box(mu-.13,mu+.13,y1-.02,y1+.2,z1-5,z1+14,st(1.12));
      box(u0-.42,u1+.42,y1-.02,y1+.2,z0-7,z0,st(1.06)); for(const c of [u0-.2,u1+.2]){ box(c-.1,c+.1,y1-.02,y1+.15,z0-16,z0-7,st(.9)); box(c-.07,c+.07,y1-.02,y1+.09,z0-22,z0-16,st(.84)); }
      if(h.fl===0&&hs(k,seed,11)<.5){ const A=[198,200,196], a=mu-.36, b=mu+.36; box(a,b,v-.08,y1+.4,z0,z0+15,A); for(let t=1;t<5;t++)box(a+.05,b-.05,y1+.4,y1+.42,z0+t*3,z0+t*3+1.2,[118,122,122]); box(a-.02,b+.02,y1+.02,y1+.42,z0-2,z0,[90,92,94]); }
      T=fq; };
    // RICH: the entrance: double doors glazed and lit, a transom with its lattice, a fanlight in a stone arch, stone pilasters and an entablature with a lamp under it
    const entry=(h,d)=>{ const {u0,u1,z1}=h, m=(u0+u1)/2, v=y1-d, r=(u1-u0)/2, zr=r*24, zt=z1+zr+6, WARM=[236,178,104], st=f=>ST.map(c=>c*f);
      quad(W(u0,v,0),W(u1,v,0),W(u1,v,z1),W(u0,v,z1),fr.map(c=>c*.8));
      const dz=z1-22; for(const [a,b] of [[u0+.04,m-.02],[m+.02,u1-.04]]){ box(a,b,v,v+.06,0,dz,fr,1.3); const gu0=a+.12, gu1=b-.12; quad(W(gu0,v+.065,40),W(gu1,v+.065,40),W(gu1,v+.065,dz-10),W(gu0,v+.065,dz-10),WARM,1.1);
        for(let t=1;t<3;t++){ const z=40+(dz-50)*t/3; box(gu0,gu1,v+.065,v+.09,z-.7,z+.7,fr,.8); } box((gu0+gu1)/2-.02,(gu0+gu1)/2+.02,v+.065,v+.09,40,dz-10,fr,.8); box(a+.1,b-.1,v+.06,v+.09,12,30,fr,1.5); }
      box(m+.1,m+.16,v+.06,v+.13,44,50,[200,164,84]); box(m-.16,m-.1,v+.06,v+.13,44,50,[200,164,84]);
      box(u0,u1,v,v+.07,dz,dz+3,fr); quad(W(u0,v+.03,dz+3),W(u1,v+.03,dz+3),W(u1,v+.03,z1),W(u0,v+.03,z1),WARM,1.2);
      for(let i=0;i<4;i++){ const a=u0+(u1-u0)*i/4, b=u0+(u1-u0)*(i+1)/4, t=.03; for(const [p,q] of [[[a,dz+3],[b,z1]],[[a,z1],[b,dz+3]]]){ quad(W(p[0]-t,v+.06,p[1]),W(p[0]+t,v+.06,p[1]),W(q[0]+t,v+.06,q[1]),W(q[0]-t,v+.06,q[1]),fr); } }
      const fv=y1+.05, N=14, pt_=(a,rr)=>W(m+Math.cos(a)*rr,fv,z1+Math.sin(a)*rr*24);
      for(let i=0;i<N;i++){ const a=Math.PI*i/N, b=Math.PI*(i+1)/N; quad(W(m,fv,z1),pt_(a,r),pt_(b,r),pt_(b,r),WARM,1.2); quad(pt_(a,r),pt_(a,r+.28),pt_(b,r+.28),pt_(b,r),st(1.02)); }
      for(let i=1;i<6;i++){ const a=Math.PI*i/6, t=.025, n=[-Math.sin(a)*t,Math.cos(a)*t]; const P0=[m,z1], P1=[m+Math.cos(a)*r,z1+Math.sin(a)*r*24];
        quad(W(P0[0]-n[0],fv+.02,P0[1]-n[1]*24),W(P0[0]+n[0],fv+.02,P0[1]+n[1]*24),W(P1[0]+n[0],fv+.02,P1[1]+n[1]*24),W(P1[0]-n[0],fv+.02,P1[1]-n[1]*24),fr); }
      box(m-.15,m+.15,y1-.02,y1+.16,z1+zr-2,z1+zr+8,st(1.12)); box(u0-.05,u1+.05,y1-.02,y1+.09,z1-1,z1+2,st(1));
      for(const [a,b] of [[u0-.46,u0-.08],[u1+.08,u1+.46]]){ box(a,b,y1-.02,y1+.16,0,zt-3,st(.95)); box(a-.05,b+.05,y1-.02,y1+.2,zt-9,zt-3,st(1.08)); for(let z=8;z<zt-14;z+=14)box(a+.05,b-.05,y1+.16,y1+.18,z,z+.8,st(.8)); }
      box(u0-.7,u1+.7,y1-.02,y1+.3,zt-3,zt+8,st(.98)); box(u0-.8,u1+.8,y1-.02,y1+.38,zt+8,zt+12,st(1.1)); for(let u=u0-.62;u<u1+.6;u+=.36)box(u,u+.14,y1-.02,y1+.3,zt-7,zt-3,st(.9));
      box(m-.1,m+.1,y1+.12,y1+.32,zt-14,zt-7,[255,214,150],1,1.6); box(m-.13,m+.13,y1+.1,y1+.34,zt-7,zt-6,[40,36,32]); };
    // the other walls and the roof, plain; a parapet round the roof
    if(RI){ tq('brick',W(x0,y0,0),W(x0,y1,0),W(x0,y1,H),W(x0,y0,H),0,y1-y0,0,H); tq('brick',W(x1,y1,0),W(x1,y0,0),W(x1,y0,H),W(x1,y1,H),0,y1-y0,0,H); quad(W(x1,y0,0),W(x0,y0,0),W(x0,y0,H),W(x1,y0,H),wall.map(c=>c*.8)); }
    else { quad(W(x1,y0,0),W(x0,y0,0),W(x0,y0,H),W(x1,y0,H),wall.map(c=>c*.8)); quad(W(x0,y0,0),W(x0,y1,0),W(x0,y1,H),W(x0,y0,H),wall.map(c=>c*.88)); quad(W(x1,y1,0),W(x1,y0,0),W(x1,y0,H),W(x1,y1,H),wall.map(c=>c*.88)); }
    const RC=o.roof||[72,70,72]; quad(W(x0,y0,H-8),W(x0,y1,H-8),W(x1,y1,H-8),W(x1,y0,H-8),RC);
    for(const [a,b,c,d] of [[x0,x1,y1-.3,y1],[x0,x1,y0,y0+.3],[x0,x0+.3,y0,y1],[x1-.3,x1,y0,y1]])box(a,b,c,d,H-8,H+4,trim,.9);
    // each opening: its reveal, and for a window the glass, a shade drawn part way, the dark of the room past it, a sill and a lintel
    for(const [k,h] of holes.entries()){ const {u0,u1,z0,z1}=h, d=h.kind==='shop'?.12:D, R=trim.map(c=>c*.7);
      quad(W(u0,y1,z0),W(u0,y1-d,z0),W(u0,y1-d,z1),W(u0,y1,z1),R); quad(W(u1,y1-d,z0),W(u1,y1,z0),W(u1,y1,z1),W(u1,y1-d,z1),R); quad(W(u0,y1-d,z1),W(u1,y1-d,z1),W(u1,y1,z1),W(u0,y1,z1),R.map(c=>c*.8));
      if(z0>0)quad(W(u0,y1,z0),W(u1,y1,z0),W(u1,y1-d,z0),W(u0,y1-d,z0),R.map(c=>c*1.1));
      if(h.kind==='shop'){ const v=y1-d, F=fr.map(c=>c*1.15), n=Math.max(1,Math.round((u1-u0)/1.6)), tz=z1>60?z1-16:null;   // a shopfront's frame: a deep surround, mullions, a transom with its own lights, a sill, the stall riser below
        box(u0,u0+.08,v,y1+.06,z0,z1,F); box(u1-.08,u1,v,y1+.06,z0,z1,F); box(u0,u1,v,y1+.06,z1-2.4,z1,F); box(u0-.06,u1+.06,y1-.02,y1+.14,z0-2.5,z0,trim,1.08);
        for(let i=1;i<n;i++){ const u=u0+(u1-u0)*i/n; box(u-.035,u+.035,v,y1+.04,z0,z1,F); }
        if(tz){ box(u0,u1,v,y1+.05,tz-1.2,tz+1.2,F); for(let i=1;i<n*2;i++){ const u=u0+(u1-u0)*i/(n*2); box(u-.015,u+.015,v,y1+.03,tz,z1,F); } }
        if(z0>3){ box(u0,u1,y1-.04,y1+.04,0,z0-2.5,trim,.62); for(let i=0;i<n;i++){ const a=u0+(u1-u0)*i/n+.12, b=u0+(u1-u0)*(i+1)/n-.12; if(b-a>.2)box(a,b,y1+.04,y1+.06,1.5,z0-4,trim,.7); } }
        continue; }
      if(h.kind==='base'){ const v=y1-d, lit=hs(k,seed,7)<.6?1:0, r=v-.6; quad(W(u0,r,z0),W(u1,r,z0),W(u1,r,z1),W(u0,r,z1),lit?[150,104,52]:[22,22,26],lit*1.3); glass(W(u0,v+.02,z0),W(u1,v+.02,z0),W(u1,v+.02,z1),W(u0,v+.02,z1));
        for(let u=u0+.12;u<u1-.05;u+=.14)box(u-.015,u+.015,v+.06,v+.09,z0,z1,[30,30,34]); box(u0,u1,v+.06,v+.09,(z0+z1)/2-.6,(z0+z1)/2+.6,[30,30,34]); continue; }
      if(h.kind==='door'&&RI){ entry(h,d); continue; }
      if(h.kind==='door'){ const v=y1-d; quad(W(u0,v,0),W(u1,v,0),W(u1,v,z1),W(u0,v,z1),fr.map(c=>c*1.2)); const m=(u0+u1)/2;
        for(const [a,b] of [[u0+.12,m-.06],[m+.06,u1-.12]]){ box(a,b,v,v+.05,10,40,fr,1.35); box(a,b,v,v+.05,48,z1-10,fr,1.35); } box(m-.04,m+.04,v,v+.06,0,z1,fr,.8); box(m+.12,m+.18,v+.05,v+.12,40,46,[196,160,80]); continue; }
      const v=y1-d, lit=hs(k,seed,3)<.55?1:0, sd=SHADES[Math.floor(hs(k,seed,5)*SHADES.length)], drop=.25+.7*hs(k,seed,9), zs1=z1-(z1-z0)*drop;
      quad(W(u0,v-.05,zs1),W(u1,v-.05,zs1),W(u1,v-.05,z1),W(u0,v-.05,z1),sd,lit*.9); box(u0,u1,v-.07,v-.03,zs1-3,zs1,sd,.8);   // the shade
      const r=v-.75, dk=[22,22,26]; quad(W(u0,r,z0),W(u1,r,z0),W(u1,r,zs1),W(u0,r,zs1),lit?[90,70,48]:dk,lit*.5);   // the room past it
      quad(W(u0,r,z0),W(u0,v,z0),W(u0,v,zs1),W(u0,r,zs1),dk); quad(W(u1,v,z0),W(u1,r,z0),W(u1,r,zs1),W(u1,v,zs1),dk); quad(W(u0,v,z0),W(u0,r,z0),W(u1,r,z0),W(u1,v,z0),dk.map(c=>c*1.3));
      glass(W(u0,v+.02,z0),W(u1,v+.02,z0),W(u1,v+.02,z1),W(u0,v+.02,z1));
      const mu=(u0+u1)/2; box(mu-.03,mu+.03,v,v+.05,z0,z1,fr); box(u0,u1,v,v+.05,(z0+z1)/2-1.5,(z0+z1)/2+1.5,fr);   // the frame's cross
      if(RI){ carve(h,k,v); continue; }
      if(h.sill){ box(u0-.12,u1+.12,y1-.02,y1+.12,z0-5,z0,trim,1.05); for(let t=0;t<3;t++){ const a=u0+(u1-u0)*hs(k,t,31), w=.05+.08*hs(t,k,37), L=12+30*hs(k+t,9,41); quad(W(a,y1+.012,Math.max(0,z0-5-L)),W(a+w,y1+.012,Math.max(0,z0-5-L)),W(a+w,y1+.012,z0-5),W(a,y1+.012,z0-5),wall.map(c=>c*.78)); } }   // the rain's streaks off the sill
      box(u0-.08,u1+.08,y1-.02,y1+.06,z1,z1+8,trim,.95); }
    // a building's own wear and works: a downpipe from the roof to the pavement at one end, bracketed, with its shoe; a grilled vent or two; the meter box by the door (owner, 9 Nov 2026: "wear tear. outside decor. vents, draings")
    { const PIPE=[78,80,82], side=hs(seed,1,51)<.5, pu=side?x0+.42:x1-.62; box(pu,pu+.16,y1+.02,y1+.18,6,TOP,PIPE,.9); box(pu-.04,pu+.2,y1+.02,y1+.24,0,7,PIPE,.8); box(pu-.06,pu+.22,y1+.02,y1+.2,TOP-8,TOP,PIPE,1);
      for(let z=24;z<TOP-10;z+=40)box(pu-.05,pu+.21,y1-.01,y1+.2,z,z+2.5,[60,62,64]);
      const nv=1+Math.floor(hs(seed,2,53)*2); for(let i=0;i<nv;i++){ const vu=x0+1+(x1-x0-2.4)*hs(seed,i,57), vz=GF+(hs(i,seed,59)<.5?-26:22); if(holes.some(h=>vu+.5>h.u0&&vu<h.u1&&vz+12>h.z0&&vz<h.z1))continue;
        box(vu,vu+.5,y1-.01,y1+.07,vz,vz+12,[110,112,112],.9); for(let t=1;t<5;t++)box(vu+.04,vu+.46,y1+.07,y1+.09,vz+t*2.4,vz+t*2.4+.9,[48,50,52]); }
      if(o.door||(o.shop&&o.shop.length)){ const du=o.door?o.door.u+o.door.w+.5:(o.shop[0].u1+.25); if(du+.5<x1-.6&&!holes.some(h=>du+.5>h.u0&&du<h.u1&&h.z0<40))box(du,du+.42,y1-.01,y1+.12,24,40,[136,140,132],.95); } }
    // string courses between the floors, a cornice and frieze at the top, a plinth, pilasters at the corners
    for(let z=GF+16;z<TOP-40;z+=FH)box(x0,x1,y1-.02,y1+.07,z,z+5,trim,.92);
    box(x0-.05,x1+.05,y1-.02,y1+.12,TOP,TOP+14,trim,.85); box(x0-.15,x1+.15,y1-.02,y1+.32,TOP+14,TOP+24,trim,1.05); box(x0,x1,y1-.02,y1+.05,0,8,trim,.7);
    for(const a of [x0,x1-.35])box(a,a+.35,y1-.02,y1+.1,0,TOP,RI?ST:wall,.94);
    if(RI){ T=NEAR; const dw=o.door?o.door.w+1.3:0;
      for(let i=1;i<nb;i++){ const u=b0+i*bay; if(o.door&&Math.abs(u-o.door.u)<dw)continue; box(u-.12,u+.12,y1-.02,y1+.06,RU,TOP,ST,.84); for(const h of holes)if(h.kind==='win'&&Math.abs((h.u0+h.u1)/2-u)<bay)box(u-.08,u+.08,y1+.06,y1+.09,(h.z0+h.z1)/2-4,(h.z0+h.z1)/2+4,ST,.95); }
      for(let u=x0+.25;u<x1-.3;u+=.3)box(u,u+.13,y1-.02,y1+.1,TOP-6,TOP,ST,.9); for(let u=x0+.4;u<x1-.4;u+=1.1)box(u,u+.16,y1-.02,y1+.28,TOP+6,TOP+14,ST,.8);
      box(x0,x1,y1-.02,y1+.12,RU-4,RU,ST,1.04); T={P,C,G}; }
    const g=new THREE.Group(), geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); geo.setAttribute('color',new THREE.Float32BufferAttribute(C,3)); geo.setAttribute('aGlow',new THREE.Float32BufferAttribute(G,1)); geo.computeVertexNormals();
    const me=new THREE.Mesh(geo,MS); me.castShadow=me.receiveShadow=true; g.add(me);
    if(GP.length){ const gg=new THREE.BufferGeometry(); gg.setAttribute('position',new THREE.Float32BufferAttribute(GP,3)); gg.computeVertexNormals(); const gm=new THREE.Mesh(gg,MG); gm.renderOrder=2; gm.raycast=()=>{}; g.add(gm); }
    for(const k in TQ){ const q=TQ[k]; if(!q.P.length)continue; const tg=new THREE.BufferGeometry(); tg.setAttribute('position',new THREE.Float32BufferAttribute(q.P,3)); tg.setAttribute('uv',new THREE.Float32BufferAttribute(q.U,2)); tg.computeVertexNormals(); const tm=new THREE.Mesh(tg,tex(k)); tm.castShadow=tm.receiveShadow=true; g.add(tm); FACADES.tris+=q.P.length/9; }
    if(NEAR.P.length){ const ng=new THREE.BufferGeometry(); ng.setAttribute('position',new THREE.Float32BufferAttribute(NEAR.P,3)); ng.setAttribute('color',new THREE.Float32BufferAttribute(NEAR.C,3)); ng.setAttribute('aGlow',new THREE.Float32BufferAttribute(NEAR.G,1)); ng.computeVertexNormals();
      const nm=new THREE.Mesh(ng,MS); nm.castShadow=nm.receiveShadow=true; const ngp=new THREE.Group(); ngp.add(nm); g.add(ngp); const c=W((x0+x1)/2,y1,0); FACADES.near.push({g:ngp,x:c[0],z:c[2],r:(RI.near||40)*TILE+(x1-x0)/2*TILE}); FACADES.tris+=NEAR.P.length/9; }
    g.userData.facade=o.id||1; (o.parent||scene).add(g); FACADES.made++; FACADES.tris+=P.length/9+GP.length/9; return g; };
}
window.FACADES=FACADES;
export {FACADES};
