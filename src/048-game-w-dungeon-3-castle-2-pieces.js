const KMK={};
(()=>{
const C=KPP;
const kTop=(X,Y)=>{ const j=Math.floor(Y*2.5), o=(j&1)*.2, i=Math.floor(X*2.5+o), fx=X*2.5+o-i, fy=Y*2.5-j; if(fx<.07||fy<.07)return C.mortar; return sh(C.ash[Math.floor(hash(i,j,4301)*5)],1.04); };
function kb(x0,y0,x1,y1,z0,z1,seed,o={},paint){ return sided({x0,y0,x1,y1,z0,z1,c:C.ash[1],foot:z0===0?1:0,top:kTop,...o,
  fs:(nx,ny,X,Y,zr,k)=>{ const u=(nx?Y:X)*24, z=zr+z0, p=paint&&paint(nx,ny,u,z,X,Y); if(p)return p.e?p:sh(p,k); return sh(castleWeather(castleStone(u,z,seed),u,z,seed),k); }}); }
function merlons(B,axis,a,b,s,e,z0,seed){ const n=Math.max(1,Math.round((e-s)/.85)), step=(e-s)/n;
  for(let i=0;i<n;i++){ const m0=s+i*step+step*.18, m1=m0+step*.64; B.push(axis==='x'?kb(m0,a,m1,b,z0,z0+26,seed,{foot:0}):kb(a,m0,b,m1,z0,z0+26,seed,{foot:0})); } }
KMK.curtain=(ax,ay,bx,by,H,out)=>{ PNAME='curtain wall'; const X=ay===by, t=.45, B=[], sd=Math.round(ax*7+ay*13), o=out[1]==='+'?1:-1;
  const [x0,y0,x1,y1]=X?[ax,ay-t,bx,ay+t]:[ax-t,ay,ax+t,by];
  const paint=(nx,ny,u,z)=>{ if((X?ny:nx)!==o)return null; const k=Math.floor(u/67), du=u-k*67-33;
    if(Math.abs(du)<1.5&&z>=118&&z<150)return C.dark; if(Math.abs(du)<4&&z>=114&&z<154)return z<117||z>=151||Math.abs(du)>=3?C.trimD:C.trim;
    for(const pz of [62,124,176])if(z>=pz&&z<pz+3&&Math.abs(((u+11)%36)-18)<1.5)return C.dark; return null; };
  B.push(kb(x0,y0,x1,y1,0,H,sd,{},paint));
  const s=X?x0:y0, e=X?x1:y1, a=o>0?(X?y1:x1)-.3:(X?y0:x0), b=a+.3;
  B.push(X?kb(x0,a,x1,b,H,H+10,sd,{foot:0}):kb(a,y0,b,y1,H,H+10,sd,{foot:0})); merlons(B,X?'x':'y',a,b,s,e,H+10,sd);
  const f0=o>0?(X?y1:x1):(X?y0:x0)-.16;
  B.push(X?kb(x0,f0,x1,f0+.16,0,22,sd+1):kb(f0,y0,f0+.16,y1,0,22,sd+1));
  return prop(B,null,{solids:[{x0:Math.min(x0,X?x0:f0),y0:Math.min(y0,X?f0:y0),x1:Math.max(x1,X?x1:f0+.16),y1:Math.max(y1,X?f0+.16:y1)}]}); };
KMK.drum=(cx,cy,r,H,seed=0)=>{ PNAME='drum tower'; const B=[], sd=4400+seed;
  const face=(X,Y,z,k)=>{ const a=Math.atan2(Y-cy,X-cx), u=(a+Math.PI)*r*24, rk=.86+.2*Math.cos(a-2.2);
    for(const [az,z0] of [[.6,96],[2.3,96],[-1.4,96],[1.4,190],[-.4,190],[3,190]]){ const du=u-(az+Math.PI)*r*24; if(Math.abs(du)<1.5&&z>=z0&&z<z0+34)return sh(C.dark,k); if(Math.abs(du)<4&&z>=z0-4&&z<z0+38)return sh(z<z0||z>=z0+34||Math.abs(du)>=3?C.trimD:C.trim,k*rk); }
    return sh(castleWeather(castleStone(u,z,sd),u,z,sd),k*rk); };
  const slices=(R,z0,z1,top)=>{ const n=Math.max(4,Math.round(2*R/.2)), w=2*R/n;
    for(let i=0;i<n;i++){ const xa=cx-R+i*w, xm=xa+w/2, hy=Math.sqrt(Math.max(0,R*R-(xm-cx)**2)); if(hy<.06)continue;
      B.push(sided({x0:xa,y0:cy-hy,x1:xa+w,y1:cy+hy,z0,z1,c:C.ash[1],foot:z0===0?1:0,top,fs:(nx,ny,X,Y,zr,k)=>face(X,Y,zr+z0,k)})); } };
  slices(r+.16,0,24,kTop); slices(r,24,H,(X,Y)=>Math.hypot(X-cx,Y-cy)<r-.5?(hash(Math.floor(X*6),Math.floor(Y*3),4403)<.5?C.lead:C.leadL):kTop(X,Y));
  const n=Math.max(8,Math.round(2*Math.PI*r/.85)); for(let i=0;i<n;i+=1){ if(i&1)continue; const a=i/n*2*Math.PI, mx=cx+Math.cos(a)*(r-.22), my=cy+Math.sin(a)*(r-.22);
    B.push(sided({x0:mx-.2,y0:my-.2,x1:mx+.2,y1:my+.2,z0:H,z1:H+26,c:C.ash[1],foot:0,top:kTop,fs:(nx,ny,X,Y,zr,k)=>face(X,Y,zr+H,k)})); }
  const q=r*.72; return prop(B,null,{solids:[{x0:cx-q,y0:cy-r,x1:cx+q,y1:cy+r},{x0:cx-r,y0:cy-q,x1:cx+r,y1:cy+q}]}); };
KMK.gate=(gx,wy,H)=>{ PNAME='gatehouse'; const y0=wy-1.1, y1=wy+.5, w=.65, sd=4800, ps=[];
  const arch=(nx,ny,u,z)=>ny>0||ny<0?castleArch(u-gx*24,z,104,15.6,KARCH.out):null;
  const leaf=(x0,x1)=>sided({x0,y0:y0+.05,x1,y1:y1-.05,z0:0,z1:100,c:DGP.oak,foot:1,top:()=>DGP.oakD,fs:(nx,ny,X,Y,z,k)=>{ const u=(nx?Y:X)*24; if([12,48,84].some(b=>z>=b&&z<b+4))return sh(z-Math.floor(z)<.5&&Math.floor(u)%6===0?DGP.ironL:DGP.iron,k); return sh(Math.floor(u)%7===0?DGP.oakD:hash(Math.floor(u),Math.floor(z/3),4801)<.15?DGP.oakL:DGP.oak,k); }});
  for(const [a,b,l0,l1] of [[gx-.9,gx-w,gx-w,gx-w+.08],[gx+w,gx+.9,gx+w-.08,gx+w]]){ const B=[kb(a,y0,b,y1,0,H,sd,{},arch),leaf(l0,l1)]; merlons(B,'x',y1-.3,y1,a,b,H,sd); ps.push(prop(B,null,{solids:[{x0:Math.min(a,l0),y0,x1:Math.max(b,l1),y1}]})); }
  const B=[kb(gx-w,y0,gx+w,y1,104,H,sd,{foot:1},arch)];
  B.push(sided({x0:gx-w,y0:wy-.46,x1:gx+w,y1:wy-.36,z0:84,z1:104,c:DGP.iron,foot:0,top:()=>DGP.iron,fs:(nx,ny,X,Y,z,k)=>{ const u=(nx?Y:X)*24, g=((u%6)+6)%6;
    if(z<4)return g<1.5&&z>=4-(1.5-Math.abs(g-.75))*4?sh(DGP.ironL,k):null; return g<1.5||Math.floor(z)%6<1.5?sh(z%6<1?DGP.ironL:DGP.iron,k):null; }}));
  merlons(B,'x',y1-.3,y1,gx-w,gx+w,H,sd); ps.push(prop(B,null,{walk:1})); return ps; };
KMK.well=(x,y)=>{ PNAME='well'; const r=.55, d=.16, B=[], top=(X,Y)=>{ const q=Math.hypot(X-x,Y-y); return q<.34?C.dark:q<.38?C.mortar:kTop(X,Y); };
  B.push(kb(x-r,y-r+d,x+r,y+r-d,0,22,4901,{top}),kb(x-r+d,y-r,x+r-d,y+r,0,22,4901,{top}));
  const wood=(x0,y0,x1,y1,z0,z1)=>({x0,y0,x1,y1,z0,z1,foot:0,c:DGP.oak,top:()=>DGP.oakL,fi:()=>sh(DGP.oak,.7),fj:()=>sh(DGP.oak,.86)});
  B.push(wood(x-.44,y-.04,x-.36,y+.04,22,66),wood(x+.36,y-.04,x+.44,y+.04,22,66),wood(x-.48,y-.05,x+.48,y+.05,66,71));
  B.push({x0:x-.012,y0:y-.012,x1:x+.012,y1:y+.012,z0:30,z1:66,foot:0,nb:1,c:[150,128,90],top:()=>null,fi:()=>[132,112,78],fj:()=>[150,128,90]});
  B.push({x0:x+.18,y0:y+.3,x1:x+.34,y1:y+.46,z0:22,z1:30,foot:0,c:DGP.oak,top:()=>DGP.oakD,fi:(v,z)=>z>27?DGP.iron:sh(DGP.oak,.7),fj:(u,z)=>z>27?DGP.iron:sh(DGP.oak,.86)});
  return prop(B,null,{}); };
KMK.bars=(x0,y0,x1,y1)=>{ PNAME='iron bars'; const X=y0===y1, t=.03, h=96, I=DGP.iron, IL=DGP.ironL, B=[], ib=(a,b,c,d,z0,z1,cl)=>({x0:a,y0:b,x1:c,y1:d,z0,z1,foot:z0===0?1:0,nb:1,c:cl,top:()=>IL,fi:()=>sh(cl,.7),fj:()=>sh(cl,.86)});
  const L=X?x1-x0:y1-y0, n=Math.round(L/.2); for(let i=0;i<=n;i++){ const m=(X?x0:y0)+L*i/n; B.push(X?ib(m-t,y0-t,m+t,y0+t,0,h,I):ib(x0-t,m-t,x0+t,m+t,0,h,I)); }
  for(const [z0,c] of [[0,DGP.rust],[44,I],[h-4,I]])B.push(X?ib(x0,y0-t*1.6,x1,y0+t*1.6,z0,z0+4,c):ib(x0-t*1.6,y0,x0+t*1.6,y1,z0,z0+4,c));
  return prop(B,null,{solids:[X?{x0,y0:y0-.06,x1,y1:y0+.06}:{x0:x0-.06,y0,x1:x0+.06,y1}]}); };
KMK.rim=(x0,y0,x1,y1,h=26)=>{ PNAME='stairwell rim'; return prop([kb(x0,y0,x1,y1,0,h,4851,{top:()=>sh(C.trim,1.04)},(nx,ny,u,z)=>z>=h-4?(z>=h-1?sh(C.trim,1.08):C.trim):null)],null,{}); };
KMK.dblock=(x0,y0,x1,y1,z0,z1,arch,walk)=>{ '@later'; PNAME='dungeon stone'; const H=126, sd=4861+Math.round(x0*3+y0*7);
  const b=sided({x0,y0,x1,y1,z0,z1,c:DGP.st[1],foot:1,nb:z0>0?1:0,top:()=>DGP.lo,fs:(nx,ny,X,Y,zr,k)=>{ const u=(nx?Y:X)*24, z=zr+z0;
    if(arch)for(const [ax,zs,r] of arch){ const c=castleArch((X-ax)*24,z,zs,r,KARCH.in); if(c&&ny)return sh(c,k); }
    const c=dgnRidge(u,z,H)||dgnFoot(u,z,sd); return sh(c||dgnStone(u,z,sd),k*(c?1:dgnDamp(u,z,sd,H))); }});
  return prop([b],null,walk?{walk:1}:{}); };
KMK.gravel=(x0,y0,x1,y1)=>{ PNAME='gravel'; const G=[[120,114,104],[134,128,118],[108,102,94],[96,92,86]];
  const top=(X,Y)=>{ const n=hash(Math.floor(X*1.5),Math.floor(Y*1.5),4951); return G[n<.18?2:0]; };
  return prop([{x0,y0,x1,y1,z0:0,z1:1,c:G[0],foot:1,nb:1,top,fi:()=>null,fj:()=>null}],null,{walk:true}); };
})();
