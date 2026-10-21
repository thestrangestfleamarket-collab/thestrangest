const MUK=(()=>{ const {FP,rect,sub,fb,worn,metal}=STUDIO.kit, c=MUC;
const art=(W,H,draw)=>{ const a=new Array(W*H).fill(null); draw((x,z,col)=>{ x=Math.floor(x); z=Math.floor(z); if(col&&x>=0&&z>=0&&x<W&&z<H)a[z*W+x]=col; },W,H); return (x,z)=>{ x=Math.floor(x); z=Math.floor(z); return x>=0&&z>=0&&x<W&&z<H?a[z*W+x]:null; }; };
const plane=(r,d0,d1,z0,H,pic,o)=>fb(r,0,1,d0,d1,z0,z0+H,c.ink,(s,t,z,len)=>s==='f'?pic(t*len*FP,z):s==='b'?pic((1-t)*len*FP,z):null,()=>null,{foot:0,...o});
const line=(put,x0,z0,x1,z1,col,w=1)=>{ const n=Math.max(1,Math.ceil(Math.max(Math.abs(x1-x0),Math.abs(z1-z0)))); for(let i=0;i<=n;i++){ const x=x0+(x1-x0)*i/n, z=z0+(z1-z0)*i/n; for(let a=0;a<w;a++)for(let b=0;b<w;b++)put(Math.round(x-w/2+a),Math.round(z-w/2+b),col); } };
const ell=(put,cx,cz,rx,rz,col,fill=true,ring=.7)=>{ for(let z=Math.floor(cz-rz)-1;z<=cz+rz+1;z++)for(let x=Math.floor(cx-rx)-1;x<=cx+rx+1;x++){ const d=((x+.5-cx)/rx)**2+((z+.5-cz)/rz)**2; if(d<1&&(fill||d>ring))put(x,z,col); } };
const BONE={b:[104,80,58],l:[142,112,82],d:[64,48,36]};
const bone=(put,x0,z0,x1,z1,w,B=BONE)=>{ '@later'; const dx=x1-x0, dz=z1-z0, L=Math.hypot(dx,dz)||1, nx=-dz/L, nz=dx/L, sg=nz<0?-1:1;
  for(let z=Math.floor(Math.min(z0,z1)-w);z<=Math.max(z0,z1)+w;z++)for(let x=Math.floor(Math.min(x0,x1)-w);x<=Math.max(x0,x1)+w;x++){ const px=x+.5-x0, pz=z+.5-z0, t=(px*dx+pz*dz)/(L*L);
    const tt=Math.max(0,Math.min(1,t)), s=(px-dx*tt)*nx*sg+(pz-dz*tt)*nz*sg, h=w/2+(t<.08||t>.92?.8:0); if(Math.abs(s)>h||t<-.12||t>1.12)continue;
    put(x,z,s>h-1.2?B.l:s<-h+1.2?B.d:B.b); } };
const BRZ=[118,92,52], BRZL=[164,132,76], GLINT=[220,232,236];
const glassF=(s,t,z,len)=>{ const a=t*len*FP, g=((a+z)%34+34)%34; return g<1.2||g>4&&g<5?GLINT:null; };
const glassT=(t,d)=>{ const g=((t*40+d*30)%17+17)%17; return g<.7?GLINT:null; };
const label=(a,z,Z,W)=>{ const m=W/2; if(z<Z-14||z>Z-6||Math.abs(a-m)>9)return null; if(z<Z-13||z>Z-7||Math.abs(a-m)>8)return BRZ; return (z===Math.floor(Z-9)||z===Math.floor(Z-11))&&Math.abs(a-m)<6&&Math.floor(a)%3?[96,90,80]:[226,218,196]; };
function glassCase(r,Z,H,o={}){ const cab=o.cab||[62,58,54], B=[];
  B.push(fb(r,0,1,0,1,0,Z,cab,(s,t,z,len)=>{ const a=t*len*FP; if(z<2)return sh(cab,.7); if(z>=Z-2)return z>=Z-1?BRZL:BRZ; if(s==='f'&&!o.noLabel){ const l=label(a,z,Z,len*FP); if(l)return l; } return worn(cab,t,z,7); },
    ()=>o.floor||[70,64,58]));
  if(o.back)B.push(o.back);
  const e=.035, rail=(t0,t1,d0,d1,z0,z1)=>fb(r,t0,t1,d0,d1,z0,z1,BRZ,(s,t,z)=>z>=z1-z0-1?BRZL:BRZ,()=>BRZL,{foot:0,nb:1});
  for(const [t,d] of [[0,0],[1-e/r.W*2,0],[0,1-e/r.D*2],[1-e/r.W*2,1-e/r.D*2]])B.push(rail(t,t+e/r.W*2,d,d+e/r.D*2,Z,Z+H));
  B.push(rail(0,1,0,e/r.D*2,Z+H-2,Z+H),rail(0,1,1-e/r.D*2,1,Z+H-2,Z+H),rail(0,e/r.W*2,0,1,Z+H-2,Z+H),rail(1-e/r.W*2,1,0,1,Z+H-2,Z+H));
  B.push(fb(r,0,1,0,1,Z,Z+H-2,GLINT,glassF,glassT,{foot:0,nb:1}));
  return B; }
function plinth(r,Z,col,o={}){ return fb(r,0,1,0,1,0,Z,col,(s,t,z,len)=>{ const a=t*len*FP; if(z<3)return sh(col,.7); if(z>=Z-1)return sh(col,1.1); if(s==='f'&&!o.noLabel){ const l=label(a,z,Z,len*FP); if(l)return l; } return worn(col,t,z,11); },()=>o.top||sh(col,1.06)); }
const MARB=[226,220,206], MARBD=[194,188,174], MARBL=[240,236,226];
function column(x,y,H){ const s=.3, flute=sided({x0:x-s*.8,y0:y-s*.8,x1:x+s*.8,y1:y+s*.8,z0:12,z1:H-16,foot:0,nb:1,c:MARB,top:()=>MARBL,
    fs:(nx,ny,X,Y,z,k)=>{ const u=Math.floor((nx?Y:X)*24*1.4), q=((u%4)+4)%4; return sh(q===0?MARBD:q===2?MARBL:MARB,k*(z<2?.9:1)); }});
  const vol=sided({x0:x-s*1.25,y0:y-s*1.25,x1:x+s*1.25,y1:y+s*1.25,z0:H-16,z1:H-6,foot:0,c:MARB,top:()=>MARBL,
    fs:(nx,ny,X,Y,z,k)=>{ const u=(nx?Y-y:X-x)*24, a=Math.abs(u)-9, v=z-5, r=Math.hypot(a,v); if(Math.abs(u)<5)return sh(z>7?MARBL:MARB,k); const t=(Math.atan2(v,a)/(2*Math.PI)+r/3.2+8)%1; return sh(r<5&&t<.35?MARBD:MARB,k); }});
  return [{x0:x-s*1.3,y0:y-s*1.3,x1:x+s*1.3,y1:y+s*1.3,z0:0,z1:5,foot:1,c:MARBD,top:()=>MARB,fi:()=>sh(MARBD,.62),fj:()=>sh(MARBD,.8)},
    {x0:x-s*1.05,y0:y-s*1.05,x1:x+s*1.05,y1:y+s*1.05,z0:5,z1:12,foot:0,c:MARB,top:()=>MARBL,fi:(v,z)=>sh(z>7&&z<10?MARBL:MARB,.62),fj:(v,z)=>sh(z>7&&z<10?MARBL:MARB,.8)},
    flute,vol,{x0:x-s*1.35,y0:y-s*1.35,x1:x+s*1.35,y1:y+s*1.35,z0:H-6,z1:H,foot:0,c:MARBL,top:()=>MARBL,fi:()=>sh(MARB,.62),fj:()=>sh(MARB,.8)}]; }
function scanBoxes(name,r,z0){ const S=MUSCAN[name], raw=atob(S.runs), sx=r.W/S.W, sy=r.D/S.D, B=[], T=S.pal.map(c=>({c,top:()=>c,fi:()=>sh(c,.62),fj:()=>sh(c,.8)}));
  for(let i=0;i+4<raw.length;i+=5){ const x=raw.charCodeAt(i), y=raw.charCodeAt(i+1), z=raw.charCodeAt(i+2), L=raw.charCodeAt(i+3), t=T[raw.charCodeAt(i+4)];
    const p=r.at(x/S.W,y/S.D), q=r.at((x+(S.k||1))/S.W,(y+(S.k||1))/S.D);
    B.push({x0:Math.min(p[0],q[0]),x1:Math.max(p[0],q[0]),y0:Math.min(p[1],q[1]),y1:Math.max(p[1],q[1]),z0:z0+z,z1:z0+z+L,foot:0,nb:1,...t}); }
  return B; }
return {FP,rect,sub,fb,worn,metal,art,plane,line,ell,bone,BONE,glassCase,plinth,column,label,scanBoxes,BRZ,BRZL,MARB,MARBD,MARBL}; })();
(()=>{ const {FP,rect,fb,worn,art,plane,line,ell,bone,BONE,plinth,column,BRZ,BRZL,MARB,MARBD,MARBL}=MUK, c=MUC;
function porticoSteps(x,y){ SHARED.PNAME='museum portico steps'; const W=9, D=3;
  return prop([{x0:x-W/2,y0:y-D/2,x1:x+W/2,y1:y+D/2,z0:0,z1:1,foot:1,c:MARB,top:(X,Y)=>{ const v=Y-(y-D/2); if(v<1.2&&Math.abs(v%.4-.38)<.03||Math.abs(X-(x-W/2))<.05||Math.abs(X-(x+W/2))<.05)return mt('concrete',MARBD);
    const i=Math.floor((X-x+W)/1.2), j=Math.floor(v/.8); if(((X-x+W)%1.2)<.03||(v%.8)<.03&&v>1.2)return mt('concrete',sh(MARBD,.95)); return mt('concrete',hash(i,j,1801)<.4?sh(MARB,.96):MARB); },fi:()=>sh(MARBD,.62),fj:()=>sh(MARBD,.8)}],null,{walk:true,flat:true}); }
const portColumn=(x,y)=>{ SHARED.PNAME='museum column'; return prop(column(x,y,150)); };
const hallColumn=(x,y)=>{ SHARED.PNAME='museum column'; return prop(column(x,y,190)); };
function entablature(x,y,nm='MUSEUM OF EARTH',k=1){ SHARED.PNAME=k>1?'bank entablature':'museum entablature'; const W=8.8, r=rect(x,y,[0,-1],W,.9), Z=150, H=k>1?32:26, B=[];
  B.push(fb(r,0,1,0,1,Z,Z+H,MARB,(s,t,z,len)=>{ const a=(1-t)*len*FP, L=len*FP;
    if(z>=H-5)return z>=H-2?MARBL:Math.floor(a/4)%2?MARBD:MARB;
    if(z<10)return z%3===0?MARBD:z<3?sh(MARB,.96):MARB;
    if(s==='f'||k>1&&s==='b'){ const tw=muTW(nm,k), l=(L-tw)/2, cc=Math.floor(((s==='b'?L-a:a)-l)/k), zz=Math.floor((z-12)/k); if(cc>=0&&cc<tw/k&&zz>=0&&zz<7){ const g=MUF[nm[Math.floor(cc/6)]], q=cc%6; if(g&&q<5&&g[(6-zz)*5+q]==='#')return k>1?muLit([238,204,120]):[92,84,70]; } }
    return MARB; },()=>MARBL,{foot:1}));
  for(const t of [0,1-.9/W])B.push(fb(r,t,t+.9/W,0,2.9,Z,Z+H,MARB,(s,tt,z)=>z>=H-2?MARBL:z<10&&z%3===0?MARBD:MARB,()=>MARBL,{foot:1}));
  const PH=26, ped=(s,t,z,len)=>{ if(s!=='f'&&s!=='b')return null; const a=t*len*FP, L=len*FP, w=(1-z/PH)*L/2, d=Math.abs(a-L/2); if(d>w)return null;
    if(d>w-4||z<3)return d>w-2||z<1.5?MARBL:MARBD;
    const ex=(a-L/2)/13, ez=(z-14)/11, rr=ex*ex+ez*ez; if(rr<1){ const land=cvNoise(a/7+3,z/7,1803)>.55; return rr>.8?MARBD:land?MARBL:sh(MARB,.94); }
    return sh(MARB,.9); };
  B.push(fb(r,0,1,.1,.7,Z+H,Z+H+PH,MARB,ped,()=>null,{foot:0}));
  return prop(B,null,{high:true,walk:true}); }
function infoDesk(x,y){ SHARED.PNAME='information desk'; const r=rect(x,y,[0,1],3,.8), H=30, wal=[84,58,40], nm='INFORMATION', B=[];
  B.push(fb(r,0,1,0,1,0,H-2,wal,(s,t,z,len)=>{ const a=(1-t)*len*FP, L=len*FP; if(z<2)return sh(wal,.6);
    if(s==='f'){ const tw=muTW(nm,1), l=Math.floor((L-tw)/2), cc=Math.floor(a-l), zz=Math.floor(z-15); if(cc>=-2&&cc<tw+2&&zz>=-2&&zz<9){ const g=cc>=0&&cc<tw&&zz>=0&&zz<7&&MUF[nm[Math.floor(cc/6)]], q=cc%6; return g&&q<5&&g[(6-zz)*5+q]==='#'?BRZL:[46,34,26]; }
      if(Math.floor(a)%24<1)return sh(wal,.8); }
    return worn(mt('wood',wal),t,z,13); }));
  B.push(fb(r,-.01,1.01,-.03,1.03,H-2,H,MARB,(s,t,z)=>z>=1?MARBL:MARB,(t,d,X,Y)=>cvNoise(X*3,Y*3,1805)>.7?MARBD:MARBL));
  B.push(fb(r,.08,.2,.4,.8,H,H+8,[200,196,186],(s,t,z)=>z%2?[200,190,160]:[150,170,190],()=>[214,208,190]));
  B.push(fb(r,.7,.86,.5,.75,H,H+12,[40,40,44],(s,t,z)=>s==='f'?(z>2&&t>.1&&t<.9?muLit([90,130,160]):[40,40,44]):[48,48,52],()=>[44,44,48]));
  B.push(fb(r,.5,.54,.3,.4,H,H+3,BRZL,null,()=>BRZL));
  return prop(B); }
function museumBench(x,y){ SHARED.PNAME='museum bench'; const r=rect(x,y,[0,1],2,.6), L=[70,46,36], S=[34,34,36], B=[];
  for(const t of [.04,.92])B.push(fb(r,t,t+.04,.05,.95,0,12,S,null,()=>S));
  B.push(fb(r,0,1,0,1,12,17,L,(s,t,z)=>z<1?sh(L,.7):L,(t,d)=>{ const a=Math.floor(t*48), b=Math.floor(d*14); return (a%6===3&&b%4===2)?sh(L,.7):(a+b)%7===0?sh(L,1.08):L; }));
  return prop(B); }
const K={'museum portico steps':porticoSteps,'museum column':portColumn,'museum hall column':hallColumn,'museum entablature':entablature,'bank entablature':(x,y)=>entablature(x,y,'BANK',2),'information desk':infoDesk,'museum bench':museumBench};
for(const k in K){ CATALOG[k]=(x,y)=>K[k](x,y); KIND_OF[k]=k; }
})();
