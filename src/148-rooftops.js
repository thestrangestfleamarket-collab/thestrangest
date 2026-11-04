// THE ROOFTOPS: ROOFS dresses the roofs with tanks, vents, ducts and ledges.
import {SHARED, THREE} from './003-shx.js';
import {BLK} from './003b-systems.js';
import {scene} from './004-main.js';
import {BLOCK, MODS, OUT, TILE} from './006-map-pre.js';
const ROOFS=window.ROOFS={};
ROOFS.init=()=>{ if(typeof SHARED.BOD==='undefined'||!MODS.apts||!MODS.apts.A)return;
  const X=SHARED.BOD.X, Y=SHARED.BOD.Y, Z=SHARED.BOD.Z, MH=TILE/.84, MV=SHARED.BOD.YS(24)/.84;
  const BX=[], CY=[], B2=[], C2=[], m4=new THREE.Matrix4(), q=new THREE.Quaternion(), e=new THREE.Euler(), V=THREE.Vector3, col=new THREE.Color();
  const b=(x,y,z,sx,sy,sz,c)=>BX.push([x,y,z,sx,sy,sz,c]), cyl=(x,y,z,r,h,c,cone=0)=>CY.push([x,y,z,r,h,c,cone]);
  const rnd=(()=>{ let t=19; return ()=>{ t=(t*16807)%2147483647; return t/2147483647; }; })();
  const leader=(x,z,ox,oz,top,c)=>{ const r=.07*MH, h=top-.15*MV; b(x,h/2,z,r*2,h,r*2,c);
    b(x,top-.3*MV,z,.32*MH,.4*MV,.28*MH,c); b(x-ox*.1*MH,top-.05*MV,z-oz*.1*MH,.18*MH,.12*MV,.18*MH,c);
    for(let y=.6*MV;y<h-.6*MV;y+=2.4*MV)b(x-ox*.06*MH,y,z-oz*.06*MH,(ox?.06:.26)*MH,.05*MV,(oz?.06:.26)*MH,0x3a3c3e);
    b(x+ox*.12*MH,.08*MV,z+oz*.12*MH,(ox?.36:.16)*MH,.16*MV,(oz?.36:.16)*MH,c); };
  const parapet=(x0,z0,x1,z1,top,ph,c,cc)=>{ const t=.3*MH, h=ph*MV;
    for(const [ax,az,lx,lz] of [[(x0+x1)/2,z0+t/2,x1-x0,t],[(x0+x1)/2,z1-t/2,x1-x0,t],[x0+t/2,(z0+z1)/2,t,z1-z0-2*t],[x1-t/2,(z0+z1)/2,t,z1-z0-2*t]]){ b(ax,top+h/2,az,lx,h,lz,c); b(ax,top+h+.05*MV,az,lx+.08*MH,.1*MV,lz+.08*MH,cc); } };
  const vent=(x,y,z)=>{ cyl(x,y,z,.18*MH,.55*MV,0x8a8e90); cyl(x,y+.55*MV,z,.3*MH,.18*MV,0x9a9ea0,1); };
  const stack=(x,y,z)=>cyl(x,y,z,.06*MH,.7*MV,0x4a4c4e);
  const box=(xa,xb,za,zb,ya,yb,c)=>b((xa+xb)/2,(ya+yb)/2,(za+zb)/2,Math.abs(xb-xa),yb-ya,Math.abs(zb-za),c);

  { const H=MODS.apts, A=H.A, x0=Math.min(X(A.x0),X(A.x1)), x1=Math.max(X(A.x0),X(A.x1)), z0=Math.min(Z(A.y0),Z(A.y1)), z1=Math.max(Z(A.y0),Z(A.y1)), top=H.lvY(H.floors||3);
    const fz=Z(A.y1)>Z(A.y0)?1:-1, front=fz>0?z1:z0, back=fz>0?z0:z1, BRK=0x7a3a2c, COP=0xb8b2a6, PIPE=0x3e4448;
    parapet(x0,z0,x1,z1,top,1,BRK,COP);
    for(const [x,ox] of [[x0+.25*MH,-1],[x1-.25*MH,1]]){ leader(x,front+fz*.1*MH,0,fz,top,PIPE); leader(x,back-fz*.1*MH,0,-fz,top,PIPE); }
    const W=Math.abs(A.x1-A.x0), S=u=>u>13?u-Math.max(0,26-W):u, U=u=>X(A.x0+u), Vv=v=>Z(A.y0+v), mr=Math.min(10.5,W-5.6);   // laid out for a 26-wide roof: the east half moved in to the house's own width
    box(U(mr),U(mr+5),Vv(.15),Vv(2.65),top,top+3*MV,BRK); box(U(mr-.1),U(mr+5.1),Vv(.05),Vv(2.75),top+3*MV,top+3.2*MV,COP);
    for(const u of [mr+.6,mr+3.1])for(let k=0;k<4;k++)box(U(u),U(u+1.2),Vv(2.65),Vv(2.7),top+1.2*MV+k*.25*MV,top+1.35*MV+k*.25*MV,0x5a5e62);
    const tx=U(5), tz=Vv(2.4), r=1.5*MH, legH=3.2*MV;
    for(const [a,c] of [[-1,-1],[1,-1],[-1,1],[1,1]])b(tx+a*r*.7,top+legH/2,tz+c*r*.7,.16*MH,legH,.16*MH,0x2c2e30);
    for(const y of [top+1.1*MV,top+2.3*MV]){ b(tx,y,tz-r*.7,r*1.4,.1*MV,.1*MH,0x2c2e30); b(tx,y,tz+r*.7,r*1.4,.1*MV,.1*MH,0x2c2e30); b(tx-r*.7,y,tz,.1*MH,.1*MV,r*1.4,0x2c2e30); b(tx+r*.7,y,tz,.1*MH,.1*MV,r*1.4,0x2c2e30); }
    b(tx,top+legH+.08*MV,tz,r*2,.16*MV,r*2,0x5a4a38);
    cyl(tx,top+legH+.16*MV,tz,r,3.4*MV,0x7a5a3a); for(const k of [.5,1.4,2.3,3.1])cyl(tx,top+legH+.16*MV+k*MV,tz,r*1.03,.1*MV,0x2e2a28);
    cyl(tx,top+legH+3.56*MV,tz,r*1.08,1.3*MV,0x3c3430,1);
    for(let k=0;k<9;k++)b(tx+r*1.05,top+legH+.3*MV+k*.42*MV,tz,.04*MH,.04*MV,.4*MH,0x2c2e30); b(tx+r*1.05,top+legH+1.9*MV,tz-.2*MH,.04*MH,3.6*MV,.04*MH,0x2c2e30); b(tx+r*1.05,top+legH+1.9*MV,tz+.2*MH,.04*MH,3.6*MV,.04*MH,0x2c2e30);
    for(const [w,v] of [[0,6],[0,10.5],[S(24.4),6],[S(24.4),10.5]]){ box(U(w+.35),U(w+1.25),Vv(v),Vv(v+.9),top,top+1.8*MV,0x6e3428); box(U(w+.25),U(w+1.35),Vv(v-.1),Vv(v+1),top+1.8*MV,top+1.95*MV,COP); cyl((U(w+.55)+U(w+.75))/2,top+1.95*MV,Vv(v+.45),.12*MH,.3*MV,0x5a3a30); }
    for(const [u,v] of [[3,6.5],[5.6,8.2],[2.4,11.6],[9.2,12.4],[17.5,6.5],[20.6,8.2],[23.4,11.6]])vent(U(S(u)),top,Vv(v)); for(const [u,v] of [[4.4,5.6],[8.3,9.4],[18.2,10.8],[24.2,4.4]])stack(U(S(u)),top,Vv(v));
    { const ax=U(S(19.8)), az=Vv(12.8), h=3.2*MV; b(ax,top+h/2,az,.05*MH,h,.05*MH,0x9aa0a6); for(const [y,w] of [[.75,1.4],[.88,1.1],[.97,.8]])b(ax,top+h*y,az,w*MH,.03*MV,.04*MH,0x9aa0a6); } }

  { const B=SHARED.BOD.B0, x0=Math.min(X(B.x0),X(B.x1)), x1=Math.max(X(B.x0),X(B.x1)), z0=Math.min(Z(B.y0),Z(B.y1)), z1=Math.max(Z(B.y0),Z(B.y1)), top=Y(B.h||130);
    const fz=Z(B.y1)>Z(B.y0)?1:-1, front=fz>0?z1:z0, GALV=0x8a8e92, mx=(x0+x1)/2, mz=(z0+z1)/2;
    for(const x of [x0+.22*MH,x1-.22*MH])leader(x,front+fz*.1*MH,0,fz,top+.8*MV,GALV);
    const turb=(x,z)=>{ cyl(x,top,z,.2*MH,.25*MV,0x2a2a2c); cyl(x,top+.25*MV,z,.14*MH,.5*MV,0x8a8e90); for(let k=0;k<4;k++)cyl(x,top+.75*MV+k*.09*MV,z,(.3-k*.035)*MH,.09*MV,k&1?0x6e7274:0xa4a8aa); cyl(x,top+1.11*MV,z,.12*MH,.1*MV,0x7a7e80,1); };
    const soil=(x,z,h)=>{ cyl(x,top,z,.16*MH,.08*MV,0x2c2c2e); cyl(x,top+.08*MV,z,.1*MH,.22*MV,0x5a5c5c); cyl(x,top+.08*MV,z,.065*MH,h*MV,0x3a3634); cyl(x,top+(.08+h)*MV,z,.075*MH,.05*MV,0x6a4a3a); };
    turb(x0+2.6*MH,z1-2.4*MH); soil(x1-1.6*MH,z0+1.5*MH,.7); soil(mx+1.8*MH,mz-2*MH,.45); soil(x0+1.2*MH,mz+3.2*MH,.55);
    { const gx=x0+1.6*MH, gz=z0+2.1*MH; cyl(gx,top,gz,.22*MH,.1*MV,0x2c2c2e); cyl(gx,top+.1*MV,gz,.12*MH,.75*MV,0x8a8e8a); b(gx+.1*MH,top+.85*MV,gz,.34*MH,.24*MV,.26*MH,0x8a8e8a); b(gx+.26*MH,top+.72*MV,gz,.08*MH,.2*MV,.3*MH,0x6a6e6a); } }

  if(SHARED.BOD.GD&&SHARED.BOD.GD.r){ const [a0,b0,a1,b1]=SHARED.BOD.GD.r, x0=Math.min(X(a0),X(a1))-.15*MH, x1=Math.max(X(a0),X(a1))+.15*MH, fzz=Math.max(Z(b0),Z(b1))+.15*MH, top=Y(SHARED.BOD.GD.eave||100);
    for(const x of [x0+.12*MH,x1-.12*MH])leader(x,fzz+.1*MH,0,1,top,0x9a6a40); }
  { const R=(SHARED.BOD.GHOSTST||[]).find(p=>/shop roof/.test(p.name||p.key||'')); if(R&&R.boxes&&R.boxes.length){ const bs=R.boxes, xa=Math.min(...bs.map(o=>o.x0)), xb=Math.max(...bs.map(o=>o.x1)), ya=Math.min(...bs.map(o=>o.y0)), yb=Math.max(...bs.map(o=>o.y1)), ze=Math.min(...bs.map(o=>o.z0)), zr=Math.max(...bs.map(o=>o.z1));
    const ym=(ya+yb)/2, half=(yb-ya)/2, zAt=y=>zr-(zr-ze)*Math.min(1,Math.abs(y-ym)/half), back=Z(ya)<Z(yb)?-1:1, yB=y=>ym+(ya<yb?-1:1)*y, yF=y=>ym-(ya<yb?-1:1)*y;
    { const cx=xb-(xb-xa)*.2, c0=yB(half*.25), c1=yB(half*.25+.5), lo=zAt(Math.max(Math.abs(c0-ym),Math.abs(c1-ym))*(1)+ym)-2, hi=zr+16;
      box(X(cx-.3),X(cx+.3),Z(c0),Z(c1),Y(lo),Y(hi),0x7a3a2c); box(X(cx-.36),X(cx+.36),Z(c0)-back*.06*MH,Z(c1)+back*.06*MH,Y(hi),Y(hi+2.5),0xa8a296); cyl(X(cx),Y(hi+2.5),(Z(c0)+Z(c1))/2,.12*MH,.35*MV,0xa0563a); }
    { const vx=xa+(xb-xa)*.38, vy=yF(half*.45), z0=zAt(vy); cyl(X(vx),Y(z0-1),Z(vy),.2*MH,.12*MV,0x4a4c4e); cyl(X(vx),Y(z0-1),Z(vy),.08*MH,.9*MV,0x6a6e70); cyl(X(vx),Y(z0-1)+.9*MV,Z(vy),.17*MH,.15*MV,0x6a6e70,1); }
    { const lx=xa+.25; b(X(lx),Y(zr)+.08*MV,Z(ym),.12*MH,.16*MV,.12*MH,0x9a6a40); b(X(lx),Y(zr)+1.1*MV,Z(ym),.03*MH,2*MV,.03*MH,0xb07a48); b(X(lx),Y(zr)+1.6*MV,Z(ym),.14*MH,.14*MV,.14*MH,0x6aa0b0);
      b(X(xa)-.02*MH,(Y(ze)+Y(zr))/2,Z(ym),.03*MH,Y(zr)-Y(ze),.03*MH,0x9a6a40); } } }

  // The across-street block: the Market St row (row 1), the Hudson row (row 2) and the alley between, dressed busy (units, dishes, ducts, planters, furniture, debris).
  if(BLK&&BLK.blds&&BLK.blds.length){ const XS=SHARED.BOD.XS, ZS=SHARED.BOD.ZS, YS=SHARED.BOD.YS;
    const b=(x,y,z,sx,sy,sz,c)=>B2.push([x,y,z,sx,sy,sz,c]), cyl=(x,y,z,r,h,c,cone=0)=>C2.push([x,y,z,r,h,c,cone]), vent=(x,y,z)=>{ cyl(x,y,z,.18*MH,.55*MV,0x8a8e90); cyl(x,y+.55*MV,z,.3*MH,.18*MV,0x9a9ea0,1); };
    let rs=7; const rr=()=>((rs=(rs*48271)%2147483647)/2147483647), pick=a=>a[(rr()*a.length)|0];
    const GR=[0x9a9ea2,0x8a8e90,0xb0b4b6,0x7a7e80], DK=0x4a4c4e, DK2=0x3a3c3e, RUST=0x6a4a38, WOOD=0x7a5a3a, WHT=0xd8dade, DISH=0xcfd2d4, GRN=[0x6fae3e,0x86c24a,0x58923a,0x9ad24e,0x4e8232], TER=0xb0603a, GLASS=0x8aa6b4, DUCT=0x9aa0a2, SOIL=0x4a3828, FL=[0xe0483a,0xf0a0c0,0xf0d040,0xf2efe6,0x9a5ac0,0xf08a30], FAB=[0xc94a3a,0x3a6a9a,0xe0b040,0x5a9a5a,0xd8d0c0,0x8a5aa0], WARM=0xffe0a0;
    const unit=(x,z,t,w,d,h,c)=>{ b(x,t+h/2,z,w,h,d,c); b(x,t+h+.02*MV,z,w*1.04,.05*MV,d*1.04,DK2); };
    const ac=(x,z,t,sc)=>{ const w=.7*MH*sc, h=.42*MV*sc; unit(x,z,t,w,.7*MH*sc,h,pick(GR)); cyl(x,t+h+.03*MV,z,.26*MH*sc,.07*MV,DK); cyl(x,t+h+.03*MV,z,.08*MH*sc,.1*MV,0x6a6e70); };
    const hvac=(x,z,t,sc)=>{ const w=1.5*MH*sc, d=.95*MH*sc, h=.5*MV*sc; unit(x,z,t,w,d,h,pick(GR)); for(let k=0;k<3;k++)b(x-w*.25+k*w*.25,t+h+.06*MV,z,.04*MH*sc,.09*MV,d*.8,DK); b(x+w*.36,t+h*.5,z,.06*MH*sc,h*.7,d*.5,DK2); cyl(x-w*.52,t+h*.6,z,.12*MH*sc,.5*MV,DUCT); };
    const dish=(x,z,t,sc)=>{ b(x,t+.05*MV,z,.3*MH*sc,.1*MV,.3*MH*sc,DK); cyl(x,t+.1*MV,z,.05*MH*sc,.55*MV,0x8a8e90); cyl(x,t+.58*MV,z,.42*MH*sc,.2*MV,DISH,1); cyl(x,t+.74*MV,z,.1*MH*sc,.08*MV,WHT); b(x+.3*MH*sc,t+.72*MV,z,.05*MH*sc,.04*MV,.05*MH*sc,DK); };
    const duct=(x,z,t,len,ax)=>{ b(x,t+.26*MV,z,ax?len:.4*MH,.3*MV,ax?.4*MH:len,DUCT); for(const e of [-1,1])b(x+(ax?e*len/2:0),t+.4*MV,z+(ax?0:e*len/2),ax?.14*MH:.5*MH,.6*MV,ax?.5*MH:.14*MH,DK2); };
    const foli=(x,z,t,r,h)=>cyl(x,t,z,r,h,pick(GRN),1);   // a leafy crown (reads as a green mass at the game's iso angle, like the park trees)
    const planter=(x,z,t,sc)=>{ b(x,t+.12*MV,z,.62*MH*sc,.24*MV,.32*MH*sc,pick([TER,WOOD])); b(x,t+.25*MV,z,.56*MH*sc,.04*MV,.28*MH*sc,SOIL); for(const o of [-1,1])foli(x+o*.17*MH*sc,t+.26*MV,z,.18*MH*sc,.46*MV*sc); if(rr()<.5)b(x,t+.74*MV,z,.05*MH,.06*MV,.05*MH,pick(FL)); };
    const bush=(x,z,t,sc)=>{ cyl(x,t+.02*MV,z,.2*MH*sc,.08*MV,TER); foli(x,t+.1*MV,z,.42*MH*sc,.78*MV*sc); };
    const gardenbed=(x,z,t,sc)=>{ const w=1.5*MH*sc, d=.58*MH*sc; b(x,t+.13*MV,z,w,.26*MV,d,pick([TER,WOOD,0x6a6e70])); b(x,t+.27*MV,z,w*.92,.05*MV,d*.86,SOIL); for(let k=0,n=Math.max(2,Math.round(w/(.55*MH)));k<n;k++){ const px=x-w/2+(k+.5)/n*w; foli(px,t+.3*MV,z,.24*MH,.5*MV*(.8+rr()*.5)); if(rr()<.4)b(px,t+.82*MV,z,.05*MH,.06*MV,.05*MH,pick(FL)); } };
    const pots=(x,z,t,sc)=>{ for(let k=0,n=2+(rr()*2|0);k<n;k++){ const px=x+(rr()-.5)*.9*MH, pz=z+(rr()-.5)*.9*MH, pr=.13*MH*(.8+rr()*.5); cyl(px,t,pz,pr,.2*MV,pick([TER,0x9a9ea0,WOOD])); foli(px,t+.2*MV,pz,pr*2.1,.52*MV*(.7+rr()*.7)); } };
    const planttree=(x,z,t,sc)=>{ cyl(x,t,z,.3*MH*sc,.22*MV,pick([TER,0x6a6e70])); b(x,t+.22*MV,z,.09*MH*sc,.55*MV*sc,.09*MH*sc,WOOD); foli(x,t+.55*MV*sc,z,.66*MH*sc,1.3*MV*sc); };
    const trellis=(x,z,t,sc)=>{ const w=1*MH*sc, h=1.2*MV*sc; for(const o of [-1,1])b(x+o*w/2,t+h/2,z,.05*MH,h,.05*MH,WOOD); for(let k=1;k<4;k++)b(x,t+h*k/4,z,w,.03*MV,.04*MH,WOOD); for(let k=0;k<3;k++)foli(x-w/2+(k+.5)/3*w,t+.34*MV+rr()*h*.35,z,.22*MH,.42*MV); };
    const umbrella=(x,z,t,sc)=>{ const c=pick(FAB); cyl(x,t,z,.32*MH*sc,.04*MV,DK); cyl(x,t+.04*MV,z,.32*MH*sc,.04*MV,0xd8d4c8); cyl(x,t+.04*MV,z,.04*MH,1.4*MV*sc,WOOD); cyl(x,t+1.4*MV*sc,z,.72*MH*sc,.42*MV,c,1); for(const o of [-1,1])b(x+o*.46*MH,t+.17*MV,z,.18*MH,.34*MV,.18*MH,c); };
    const lounge=(x,z,t,sc)=>{ const c=pick(FAB); b(x,t+.1*MV,z,.4*MH*sc,.14*MV,.8*MH*sc,c); b(x,t+.28*MV,z-.34*MH*sc,.4*MH*sc,.34*MV,.08*MH,c); for(const [ox,oz] of [[-1,-1],[1,-1],[-1,1],[1,1]])b(x+ox*.16*MH*sc,t+.05*MV,z+oz*.36*MH*sc,.04*MH,.1*MV,.04*MH,DK); };
    const grill=(x,z,t,sc)=>{ b(x,t+.3*MV,z,.4*MH*sc,.28*MV,.4*MH*sc,0x2a2c2e); cyl(x,t+.44*MV,z,.24*MH*sc,.18*MV,0x3a3c3e,1); for(const [ox,oz] of [[-1,-1],[1,-1],[-1,1],[1,1]])b(x+ox*.16*MH*sc,t+.14*MV,z+oz*.16*MH*sc,.04*MH,.28*MV,.04*MH,DK); b(x+.38*MH*sc,t+.24*MV,z,.14*MH,.04*MV,.3*MH,0x6a6e70); };
    const strng=(x,z,t,len,ax)=>{ const n=Math.max(4,Math.round(len/(.5*MH))); for(const e of [-1,1])b(x+(ax?e*len/2:0),t+.9*MV,z+(ax?0:e*len/2),.05*MH,1.8*MV,.05*MH,WOOD); for(let k=1;k<n;k++){ const f=k/n, bx=ax?x-len/2+f*len:x, bz=ax?z:z-len/2+f*len; b(bx,t+1.8*MV-Math.sin(f*Math.PI)*.5*MV,bz,.06*MH,.1*MV,.06*MH,WARM); } };
    const laundry=(x,z,t,len,ax)=>{ const n=Math.max(3,Math.round(len/(.7*MH))); for(const e of [-1,1])b(x+(ax?e*len/2:0),t+.9*MV,z+(ax?0:e*len/2),.05*MH,1.8*MV,.05*MH,0x9aa0a6); for(let k=1;k<n;k++){ const f=k/n, bx=ax?x-len/2+f*len:x, bz=ax?z:z-len/2+f*len; b(bx,t+1.5*MV,bz,.22*MH,.5*MV,.03*MH,pick(FAB)); } };
    const patio=(x,z,t)=>{ cyl(x,t+.3*MV,z,.04*MH,.3*MV,DK); cyl(x,t+.3*MV,z,.3*MH,.04*MV,0xd8d4c8); for(const [ox,oz] of [[-1,0],[1,0],[0,-1],[0,1]])b(x+ox*.48*MH,t+.17*MV,z+oz*.48*MH,.2*MH,.34*MV,.2*MH,pick([0x5a5c5e,0x7a4a3a,0x3a5a6a])); };
    const skylight=(x,z,t,sc)=>{ b(x,t+.08*MV,z,.7*MH*sc,.16*MV,.5*MH*sc,DK2); b(x,t+.18*MV,z,.6*MH*sc,.06*MV,.4*MH*sc,GLASS); };
    const crate=(x,z,t,sc)=>b(x,t+.14*MV*sc,z,.3*MH*sc,.28*MV*sc,.3*MH*sc,pick([WOOD,RUST,0x5a5c5e]));
    const pallet=(x,z,t)=>{ b(x,t+.04*MV,z,.6*MH,.06*MV,.45*MH,WOOD); for(const o of [-.2,0,.2])b(x+o*MH,t+.1*MV,z,.05*MH,.06*MV,.45*MH,WOOD); };
    const pipes=(x,z,t)=>{ for(let k=0;k<3;k++)cyl(x+(k-1)*.12*MH,t+.5*MV,z,.05*MH,1*MV,pick([DK,DUCT,RUST])); b(x,t+.05*MV,z,.4*MH,.1*MV,.22*MH,DK2); };
    const ant=(x,z,t,sc)=>{ const h=1.6*MV*sc; b(x,t+h/2,z,.05*MH,h,.05*MH,0x9aa0a6); for(const [y,w] of [[.75,.5],[.88,.38],[.97,.26]])b(x,t+h*y,z,w*MH,.03*MV,.04*MH,0x9aa0a6); };
    const tank=(x,z,t,sc)=>{ const legH=1.6*MV*sc, r=.9*MH*sc; for(const [a,c] of [[-1,-1],[1,-1],[-1,1],[1,1]])b(x+a*r*.7,t+legH/2,z+c*r*.7,.1*MH*sc,legH,.1*MH*sc,DK); b(x,t+legH,z,r*1.5,.1*MV,r*1.5,WOOD); cyl(x,t+legH+.1*MV,z,r,1.8*MV*sc,0x8a6a44); for(const k of [.4,1,1.5])cyl(x,t+legH+.1*MV+k*MV*sc,z,r*1.03,.06*MV,DK2); cyl(x,t+legH+.1*MV+1.9*MV*sc,z,r*1.08,.7*MV*sc,0x5a4634,1); };
    const bulk=(x,z,t,sc)=>{ const w=1.1*MH*sc, d=.9*MH*sc, h=.9*MV*sc; unit(x,z,t,w,d,h,0x6a3a2c); b(x,t+h*.5,z+d*.5,w*.4,h*.7,.06*MH,DK2); };
    const KINDS=[['ac',3],['hvac',1],['dish',1],['duct',1],['skylight',1],['pipes',1],['ant',1],['crate',2],['pallet',1],
      ['bush',5],['planter',4],['gardenbed',5],['pots',5],['planttree',2],['trellis',2],
      ['patio',2],['umbrella',2],['lounge',2],['grill',1],['strng',2],['laundry',1]];
    const put=(x,z,t,kind)=>{ const sc=.85+rr()*.5; switch(kind){ case'hvac':return hvac(x,z,t,sc); case'dish':return dish(x,z,t,sc); case'duct':return duct(x,z,t,(1.2+rr()*1.6)*MH,rr()<.5?1:0); case'planter':return planter(x,z,t,sc); case'bush':return bush(x,z,t,sc); case'gardenbed':return gardenbed(x,z,t,sc); case'pots':return pots(x,z,t,sc); case'planttree':return planttree(x,z,t,sc); case'trellis':return trellis(x,z,t,sc); case'patio':return patio(x,z,t); case'umbrella':return umbrella(x,z,t,sc); case'lounge':return lounge(x,z,t,sc); case'grill':return grill(x,z,t,sc); case'strng':return strng(x,z,t,(1.5+rr()*1.5)*MH,rr()<.5?1:0); case'laundry':return laundry(x,z,t,(1.5+rr()*1.2)*MH,rr()<.5?1:0); case'skylight':return skylight(x,z,t,sc); case'crate':return crate(x,z,t,sc); case'pallet':return pallet(x,z,t); case'pipes':return pipes(x,z,t); case'ant':return ant(x,z,t,sc); default:return ac(x,z,t,sc); } };
    const weighted=()=>{ let tot=0; for(const [,w] of KINDS)tot+=w; let r=rr()*tot; for(const [k,w] of KINDS)if((r-=w)<0)return k; return 'ac'; };
    // bake each building's props into one still low-poly mesh (6-sided rounds) that frustum-culls off-screen; no shadow cast (a distant backdrop), still sunlit and shadowed-on.
    const RM=new THREE.Group(); RM.name='roofclutter'; scene.add(RM); window.ROOFS.blockG=RM;
    const BMAT=new THREE.MeshLambertMaterial({vertexColors:true});
    const BG=new THREE.BoxGeometry(1,1,1).toNonIndexed(), CG6=new THREE.CylinderGeometry(1,1,1,6).translate(0,.5,0).toNonIndexed(), KG6=new THREE.ConeGeometry(1,1,6).translate(0,.5,0).toNonIndexed();
    const v=new V(), vn=new V(), sv=new V(), nm=new THREE.Matrix3(); let blkV=0, blkB=0, blkR=0, blkM=0;
    const emit=(G,P,N,pos,nor,cl,o,hex)=>{ col.setHex(hex); nm.getNormalMatrix(m4); const cnt=P.count; for(let i=0;i<cnt;i++,o++){ v.set(P.getX(i),P.getY(i),P.getZ(i)).applyMatrix4(m4); vn.set(N.getX(i),N.getY(i),N.getZ(i)).applyMatrix3(nm).normalize(); const o3=o*3; pos[o3]=v.x; pos[o3+1]=v.y; pos[o3+2]=v.z; nor[o3]=vn.x; nor[o3+1]=vn.y; nor[o3+2]=vn.z; cl[o3]=col.r; cl[o3+1]=col.g; cl[o3+2]=col.b; } return o; };
    const flush=()=>{ const boxes=B2, cyls=C2; if(boxes.length||cyls.length){ let nv=boxes.length*BG.attributes.position.count; for(const c of cyls)nv+=(c[6]?KG6:CG6).attributes.position.count;
      const pos=new Float32Array(nv*3), nor=new Float32Array(nv*3), cl=new Float32Array(nv*3); let o=0;
      for(const [x,y,z,sx,sy,sz,hex] of boxes){ m4.compose(sv.set(x,y,z),q,new V(Math.max(.001,sx),Math.max(.001,sy),Math.max(.001,sz))); o=emit(BG,BG.attributes.position,BG.attributes.normal,pos,nor,cl,o,hex); }
      for(const [x,y,z,r,h,hex,cone] of cyls){ const G=cone?KG6:CG6; m4.compose(sv.set(x,y,z),q,new V(Math.max(.001,r),Math.max(.001,h),Math.max(.001,r))); o=emit(G,G.attributes.position,G.attributes.normal,pos,nor,cl,o,hex); }
      const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(pos,3)); g.setAttribute('normal',new THREE.BufferAttribute(nor,3)); g.setAttribute('color',new THREE.BufferAttribute(cl,3)); g.computeBoundingSphere();
      const m=new THREE.Mesh(g,BMAT); m.castShadow=false; m.receiveShadow=true; RM.add(m); OUT.add(m,'open'); blkV+=nv; blkB+=boxes.length; blkR+=cyls.length; blkM++; }
      B2.length=0; C2.length=0; };
    let props=0; const propRows=new Set();
    for(const q of BLK.blds){ if(q.row!==1)continue; propRows.add(q.row); rs=(Math.abs((q.x0*131+q.y0*17+q.h)|0)%2147483646)+1;   // only the Market St row wears a busy roof; the Hudson row's garages are bare (owner)
      const x0=Math.min(XS(q.x0),XS(q.x1)), x1=Math.max(XS(q.x0),XS(q.x1)), z0=Math.min(ZS(q.y0),ZS(q.y1)), z1=Math.max(ZS(q.y0),ZS(q.y1)), top=YS(q.h);
      const inn=.6*MH, gx0=x0+inn, gx1=x1-inn, gz0=z0+inn, gz1=z1-inn, W=gx1-gx0, D=gz1-gz0; if(W<MH||D<MH)continue;
      if(rr()<.4){ tank(gx0+(.1+rr()*.25)*W,gz0+(.1+rr()*.25)*D,top,.7+rr()*.45); props++; }
      bulk(gx0+(.3+rr()*.4)*W,gz0+(.3+rr()*.4)*D,top,.8+rr()*.4); props++;
      const edge=q.row===1?gz0+.3*MH:gz1-.3*MH; for(let k=0,m=Math.max(2,Math.round(W/(3*MH)));k<m;k++){ ac(gx0+(k+.5)/m*W,edge,top,.9+rr()*.4); props++; }
      const gedge=q.row===1?gz1-.4*MH:gz0+.4*MH; for(let k=0,m=Math.max(1,Math.round(W/(3.4*MH)));k<m;k++){ const px=gx0+(k+.5)/m*W; [pots,bush,planter][rr()*3|0](px,gedge,top,.9+rr()*.4); props++; }
      const cell=2.5*MH, cols=Math.max(1,Math.round(W/cell)), rows=Math.max(1,Math.round(D/cell));
      for(let i=0;i<cols;i++)for(let j=0;j<rows;j++){ if(rr()<.12)continue; put(gx0+(i+.15+rr()*.7)/cols*W,gz0+(j+.15+rr()*.7)/rows*D,top,weighted()); props++; }
      flush(); }
    { rs=991; const za=ZS(BLOCK.back), zb=ZS(BLOCK.row2[1]), zm=(za+zb)/2, D=Math.abs(zb-za), ax0=XS(BLOCK.x0), ax1=XS(BLOCK.x1);
      for(let x=ax0+3*MH;x<ax1-3*MH;x+=5*MH){ if(rr()<.5){ const y=YS(112); for(let k=1,n=Math.max(4,Math.round(D/(.5*MH)));k<n;k++){ const f=k/n; b(x,y-Math.sin(f*Math.PI)*.5*MV,zm-D/2+f*D,.06*MH,.1*MV,.06*MH,WARM); } }
        else { b(x,YS(116+(((x|0)%5)*4)),zm,.14*MH,.14*MV,D,pick([DK,DUCT,RUST])); if(rr()<.5)vent(x+1.4*MH,YS(114),zm); }
        if((x|0)%37<5)flush(); } flush(); }
    ROOFS.blockProps=props; ROOFS.blockBoxes=blkB; ROOFS.blockRounds=blkR; ROOFS.blockMeshes=blkM; ROOFS.blockTris=Math.round(blkV/3); ROOFS.propRows=[...propRows]; }
  const geo=new THREE.BoxGeometry(1,1,1), lam=new THREE.MeshLambertMaterial({color:0xffffff});
  const BM=new THREE.InstancedMesh(geo,lam,BX.length); BX.forEach(([x,y,z,sx,sy,sz,c],i)=>{ BM.setMatrixAt(i,m4.compose(new V(x,y,z),q,new V(Math.max(.001,sx),Math.max(.001,sy),Math.max(.001,sz)))); BM.setColorAt(i,col.setHex(c)); });
  const CG=new THREE.CylinderGeometry(1,1,1,8).translate(0,.5,0), KG=new THREE.ConeGeometry(1,1,8).translate(0,.5,0);
  const cy=CY.filter(c=>!c[6]), co=CY.filter(c=>c[6]), mk=(G,L)=>{ const M=new THREE.InstancedMesh(G,lam,Math.max(1,L.length)); L.forEach(([x,y,z,r,h,c],i)=>{ M.setMatrixAt(i,m4.compose(new V(x,y,z),q,new V(r,h,r))); M.setColorAt(i,col.setHex(c)); }); M.count=L.length; return M; };
  const CM=mk(CG,cy), KM=mk(KG,co);
  for(const M of [BM,CM,KM]){ M.castShadow=M.receiveShadow=true; scene.add(M); }
  for(const M of [BM,CM,KM])OUT.add(M,'open');
  ROOFS.tris=BX.length*12+cy.length*32+co.length*16+(ROOFS.blockTris||0); window.ROOFSDBG=()=>({boxes:BX.length,rounds:cy.length,cones:co.length,blockMeshes:ROOFS.blockMeshes||0,blockBoxes:ROOFS.blockBoxes||0,blockRounds:ROOFS.blockRounds||0,blockProps:ROOFS.blockProps||0,blockTris:ROOFS.blockTris||0,tris:ROOFS.tris,propRows:ROOFS.propRows||[]}); };
export {ROOFS};
