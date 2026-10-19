const PARK=window.PARK={x0:50,x1:108,y0:-61+NORTHY,y1:12.5+NORTHY+NORTHX,gate:[92.5,99.5],round:[96,-47,7]};
PARK.sway={value:0}; PARK.windK={value:1}; PARK.tick=()=>{ PARK.sway.value=performance.now()/1000; };
await grab('park',async()=>{ const PO=LAY.o('park'), PE=LAY.e('park'); PARK.ox=PO.x; PARK.oy=PO.y; PARK.x0=50-MAINX.w+PE[0]; PARK.x1=AVE.x0+PE[2]; PARK.y0+=PE[1]; PARK.y1+=PE[3]; const X=x=>BOD.XS(x+PO.x), Z=y=>BOD.ZS(y+PO.y), Y=BOD.YS, {hash,grain,speck,grassCol}=BOD.g, P=PARK, U=TILE/.84, f32=F32, b8=B64;
  P.round=[(P.x0+P.x1)/2,(P.y0+P.y1-NORTHX)/2,7]; P.gate=[P.round[0]-5,P.round[0]+5]; const RX=x=>x-96+P.round[0], RY=y=>y+47+P.round[1];
  const WA=3, wobX=y=>WA*Math.sin(2*Math.PI*(y-P.y0)/(P.y1-NORTHX-P.y0)), wobY=x=>WA*Math.sin(2*Math.PI*(x-P.x0)/(P.x1-P.x0)); P.wobX=wobX; P.wobY=wobY;
  const path=(x,y)=>{ const [cx,cy,r]=P.round; return Math.abs(x-cx-wobX(y))<3.6||Math.abs(y-cy-wobY(x))<3.6||Math.hypot(x-cx,y-cy)<r; };   P.path=path; FOUNT.at(P);
  const HK=[[P.round[0]+12.5-6,P.round[1]+11.5-6,P.round[0]+12.5+6,P.round[1]+11.5+6],[CASTLE.b[0]-PO.x-3,CASTLE.b[2]-PO.y-3,CASTLE.b[1]-PO.x+3,CASTLE.b[3]-PO.y+3],[RX(90)-3,RY(-41.5)-3,RX(102)+3,RY(-41.5)+3],...(typeof GCAVE!=='undefined'?GCAVE.keep(P):[])];
  const ss=(a,b,v)=>{ const t=Math.max(0,Math.min(1,(v-a)/(b-a))); return t*t*(3-2*t); }, cvn=BOD.g.cvNoise;
  P.hill=(x,y)=>{ if(x<P.x0||x>P.x1||y<P.y0||y>P.y1)return 0; const [cx,cy,r]=P.round;
    let d=Math.min(Math.abs(x-cx-wobX(y))-3.6,Math.abs(y-cy-wobY(x))-3.6,Math.hypot(x-cx,y-cy)-r,x-P.x0-1.5,P.x1-x-1.5,y-P.y0-9,P.y1-y-1.5,FOUNT.away(x,y)); if(d<=0)return 0;
    for(const b of HK){ const e=Math.max(b[0]-x,x-b[2],b[1]-y,y-b[3]); if(e<d)d=e; if(d<=0)return 0; }
    const n=cvn(x/12,y/12,501)*.7+cvn(x/5,y/5,503)*.3; return 1.6*TILE*ss(0,6,d)*Math.max(0,(n-.33)/.67); };
  const BK=P.brook=(()=>{ const K=[[140,33.5],[133,29],[125,25.5],[114,22],[103,20.5],[96,21],[88,23.5],[77,21.5],[65,24.5],[53,20],[41,23],[31,20],[23,17.5],[15,14.5]].map(([x,y])=>[x-99+P.round[0],y+1.25+P.round[1]]), Q=[];
    for(let i=0;i<K.length-1;i++){ const a=K[Math.max(0,i-1)], b=K[i], c=K[i+1], d=K[Math.min(K.length-1,i+2)]; for(let k=0;k<16;k++){ const t=k/16, f=j=>.5*(2*b[j]+(c[j]-a[j])*t+(2*a[j]-5*b[j]+4*c[j]-d[j])*t*t+(3*b[j]-a[j]-3*c[j]+d[j])*t*t*t); Q.push([f(0),f(1)]); } } Q.push(K[K.length-1]);
    const acc=[0]; for(let i=1;i<Q.length;i++)acc.push(acc[i-1]+Math.hypot(Q[i][0]-Q[i-1][0],Q[i][1]-Q[i-1][1])); const SL=acc[acc.length-1], N=Math.round(SL/.5), C=[];
    for(let k=0,j=0;k<=N;k++){ const s=k*SL/N; while(j<Q.length-2&&acc[j+1]<s)j++; const t=(s-acc[j])/(acc[j+1]-acc[j]||1); C.push([Q[j][0]+(Q[j+1][0]-Q[j][0])*t,Q[j][1]+(Q[j+1][1]-Q[j][1])*t,s]); }
    const RF=[20,47,74,101,127,150].map(r=>Math.round(r*SL/185)), B=1.4, W=s=>(1.45+.3*Math.sin(s*.13+1)+.15*Math.sin(s*.41))*(.7+.3*ss(0,8,s))+5*ss(SL-18,SL-4,s),
      L=s=>-.3-RF.reduce((a,r)=>a+.045*ss(r-.5,r+.5,s),0), D=s=>.42-L(s)+.5*ss(SL-18,SL-6,s), G=new Map(), gk=(i,j)=>i*4096+j, st=[];
    for(let k=0;k<N;k++){ const [x0,y0]=C[k], [x1,y1]=C[k+1], r=W(C[k][2])+B+6; for(let i=Math.floor((Math.min(x0,x1)-r)/4);i<=Math.floor((Math.max(x0,x1)+r)/4);i++)for(let j=Math.floor((Math.min(y0,y1)-r)/4);j<=Math.floor((Math.max(y0,y1)+r)/4);j++){ const g=gk(i,j); if(!G.has(g))G.set(g,[]); G.get(g).push(k); } }
    const q=(x,y)=>{ const l=G.get(gk(Math.floor(x/4),Math.floor(y/4))); if(!l)return null; let bd=1e9, bs=0, sg=1;
      for(const k of l){ const [x0,y0,s0]=C[k], [x1,y1,s1]=C[k+1], vx=x1-x0, vy=y1-y0, t=Math.max(0,Math.min(1,((x-x0)*vx+(y-y0)*vy)/(vx*vx+vy*vy))), d=Math.hypot(x-x0-vx*t,y-y0-vy*t); if(d<bd){ bd=d; bs=s0+(s1-s0)*t; sg=vx*(y-y0)-vy*(x-x0)>0?1:-1; } } return [bd,bs,sg]; };
    const h=(x,y)=>{ const r=q(x,y); if(!r)return null; const [d,s]=r, w=W(s), e=d-w; if(e>=B)return null; let v=-D(s)*(1-ss(-.6*w,B,e));
      for(const o of st){ const u=Math.hypot(x-o[0],y-o[1]); if(u<o[2])v=Math.max(v,o[3]); } return v; };
    const nrm=k=>{ const a=C[Math.max(0,k-1)], b=C[Math.min(N,k+1)], l=Math.hypot(b[0]-a[0],b[1]-a[1]); return [-(b[1]-a[1])/l,(b[0]-a[0])/l]; };
    const rim=m=>{ const o=[], r=k=>W(C[k][2])+B+m, side=(k,f)=>{ const [nx,ny]=nrm(k); o.push([C[k][0]+f*nx*r(k),C[k][1]+f*ny*r(k)]); }, cap=(k,off)=>{ const [nx,ny]=nrm(k), a=Math.atan2(ny,nx)+off; for(let i=1;i<12;i++){ const t=a-i/12*Math.PI; o.push([C[k][0]+Math.cos(t)*r(k),C[k][1]+Math.sin(t)*r(k)]); } };
      for(let k=0;k<=N;k++)side(k,1); cap(N,0); for(let k=N;k>=0;k--)side(k,-1); cap(0,Math.PI); return o; };
    const ks=C.map((c,k)=>Math.abs(c[0]-P.round[0]-wobX(c[1]))<3.6?k:-1).filter(k=>k>=0), km=ks[ks.length>>1], yc=C[km][1], S=W(C[km][2])+B+.6, br={k:km,yc,S,H:.55}, hump=(x,y)=>{ const t=Math.abs(y-yc)/(S+2); return t>=1||Math.abs(x-P.round[0]-wobX(y))>=3.6?0:br.H*.5*(1+Math.cos(Math.PI*t)); };
    return {C,SL,N,B,W,L,D,RF,q,h,st,nrm,rim,br,hump,wet:(x,y,m=0)=>{ const r=q(x,y); return !!r&&r[0]<W(r[1])+B+m; }}; })();
  P.campAt=()=>{ if(P.camp0)return P.camp0; const S=FOUNT.S, F=FOUNT, L=S.L, [cx,cy]=P.round; let best=null, bd=1e9;
    for(const [x0,y0] of S.poly){ if(x0>=L.cx-.5||y0>=L.cy-.5)continue; const e=.25, gx=F.lake(x0+e,y0)-F.lake(x0-e,y0), gy=F.lake(x0,y0+e)-F.lake(x0,y0-e), n=Math.hypot(gx,gy)||1, nx=gx/n, ny=gy/n, x=x0+nx*2.8, y=y0+ny*2.8;
      if(x<P.x0+6||x>P.x1-6||y<P.y0+6||y>P.y1-6||F.lake(x,y)<2.2||F.ter(x,y)<4.5||BK.wet(x,y,3.5)||Math.abs(x-cx-wobX(y))<7||Math.abs(y-cy-wobY(x))<7||S.rocks.some(r=>Math.hypot(r[0]-x,r[1]-y)<1.8))continue;
      const d=Math.hypot(x-cx,y-cy); if(d<bd){ bd=d; best={x,y,nx,ny}; } }
    P.camp0=best||{x:S.C.x+S.R+6,y:S.C.y,nx:1,ny:0}; S.oaks=S.oaks.filter(o=>Math.hypot(o[1]-P.camp0.x,o[2]-P.camp0.y)>10); return P.camp0; };
  { const c=P.campAt(); HK.push([c.x-5,c.y-5,c.x+5,c.y+5]); }
  { const h0=P.hill; P.hill=(x,y)=>{ const r=BK.q(x,y); if(!r)return h0(x,y); const e=r[0]-BK.W(r[1])-BK.B; if(path(x,y))return BK.hump(x,y)*TILE/.84; if(e>=0)return h0(x,y)*ss(0,5,e); return BK.h(x,y)*TILE/.84; }; }
  window.HILL=(wx,wz)=>{ const g=window.PARK; return g&&g.hill?g.hill(wx/TILE+72-(g.ox||0),wz/TILE-77-(g.oy||0)):0; };
  const [rcx,rcy,rr]=P.round, smx=(a,b,k)=>{ const h=Math.max(k-Math.abs(a-b),0)/k; return Math.max(a,b)+h*h*k/4; };
  const dep=(x,y)=>smx(smx(3.6-Math.abs(x-rcx-wobX(y)),3.6-Math.abs(y-rcy-wobY(x)),2.4),rr-Math.hypot(x-rcx,y-rcy),2), eo=(x,y)=>{ const n=1.3*(cvn(x/4.5,y/4.5,421)-.5)+.6*(cvn(x/1.4,y/1.4,423)-.5)-.12; return n>.12?.12+(n-.12)*.35:n; }, vis=P.vis=(x,y)=>dep(x,y)+eo(x,y);
  const SC=.36, GR=.05, STN=[[112,109,102],[126,122,113],[140,135,124],[102,104,104],[134,124,108]], TF=[[40,72,32],[54,92,40],[72,114,50],[96,138,62]], SOIL=[[78,66,50],[66,56,44]], KC=new Map();
  const cell=(x,y)=>{ const gx=Math.floor(x/SC), gy=Math.floor(y/SC); let d1=9, d2=9, u=0, v=0, sx=0, sy=0;
    for(let i=-1;i<2;i++)for(let j=-1;j<2;j++){ const a=gx+i, b=gy+j, cx=(a+.1+.8*hash(a,b,401))*SC, cy=(b+.1+.8*hash(a,b,403))*SC, d=Math.hypot(x-cx,y-cy)/(.74+.56*hash(a,b,405)**2);
      if(d<d1){ d2=d1; d1=d; u=a; v=b; sx=cx; sy=cy; } else if(d<d2)d2=d; } return [d2-d1,u,v,sx,sy]; };
  const keep=(u,v,sx,sy)=>{ const id=u*65536+v; let r=KC.get(id); if(r!==undefined)return r; const k=vis(sx,sy), h=hash(u,v,407);
    r=(k>.5?h>.012:k>0?h>.4*(1-k/.5):k>-.45&&h<.1*(1+k/.45))?k:null; KC.set(id,r); return r; };
  const tuft=(x,y,pv)=>{ const a=Math.floor(x*2), b=Math.floor(y*2), h=hash(a,b,441); if(h>.06+.6*Math.max(0,1-pv/1.1))return null;
    const tx=(a+.15+.7*hash(a,b,443))/2, ty=(b+.15+.7*hash(a,b,445))/2, r=.07+.05*hash(a,b,447), dx=x-tx, dy=y-ty, d=Math.hypot(dx,dy); if(d>r)return null;
    const ang=Math.atan2(dy,dx)*5/Math.PI+hash(a,b,449)*9, bl=Math.abs(ang-Math.round(ang)); if(d>r*.35&&bl>.28)return null;
    return TF[d<r*.35?1:d<r*.7?(bl<.12?3:2):(hash(Math.floor(x*24),Math.floor(y*24),451)<.5?2:3)]; };
  const hexCol=(x,y)=>{ const pv=vis(x,y); if(pv<-.8)return null; const tf=pv>-.25?tuft(x,y,pv):null; if(tf)return tf;
    const [e,u,v,sx,sy]=cell(x,y), px=hash(Math.floor(x*24),Math.floor(y*24),453), ks=keep(u,v,sx,sy);
    if(ks===null){ if(pv<0||pv<.6&&hash(u,v,411)<.45)return null; return px<.3?TF[px<.12?0:1]:SOIL[px<.7?0:1]; }
    if(ks<.35&&hash(u,v,409)<.35){ const a=hash(u,v,410)*6.283; if((x-sx)*Math.cos(a)+(y-sy)*Math.sin(a)>.03)return pv<0?null:px<.4?TF[1]:SOIL[0]; }
    const mo=cvn(x/2.2,y/2.2,431);
    if(e<GR){ if(mo>.6)return [[44,70,34],[56,86,40]][px<.5?0:1]; if(px<.5*Math.max(0,.9-pv))return TF[px<.15?0:1]; return [[66,66,56],[58,60,52]][px<.7?0:1]; }
    let c=STN[Math.floor(hash(u,v,413)*5)]; const t=hash(u,v,415); if(t<.06)c=[164,156,138]; else if(t>.95)c=[86,86,86];
    const l=(x-sx)*-.45+(y-sy)*-.9; let f=cvn(x/7,y/7,433)>.64?.92:1;
    if(e<GR+.05){ if(l<=0&&mo>.52)return [56,86,42]; f*=l>0?1.13:.8; } else if(e>GR+.17&&l>.02)f*=1.05;
    if(hash(u,v,419)<.09){ const a=hash(u,v,421)*3.14, s=(x-sx)*Math.cos(a)+(y-sy)*Math.sin(a), q=-(x-sx)*Math.sin(a)+(y-sy)*Math.cos(a); if(Math.abs(q-.25*Math.abs(s))<.022&&e>GR+.02)f*=.62; }
    return [c[0]*f,c[1]*f,c[2]*f]; };
  const CS=(S=>({x0:S.x0-PO.x,x1:S.x1-PO.x,y0:S.y0-PO.y,y1:S.y1-PO.y}))(CASTLE.stair), groundCol=(x,y)=>x>=CS.x0&&x<CS.x1&&y>=CS.y0&&y<CS.y1?null:hexCol(x,y);
  const flat=(x0,y0,x1,y1,z,col)=>BOD.bq([X(x0),Y(z),Z(y1)],[X(x1),Y(z),Z(y1)],[X(x1),Y(z),Z(y0)],[X(x0),Y(z),Z(y0)],BOD.faceTex((x1-x0)*24,(y1-y0)*24,(i,j)=>BOD.C(col(x0+(i+.5)/24,y0+(j+.5)/24))),'G');
  { const [cx,cy,r]=P.round, w=4.6+WA, R=r+1, T3=P.tufts=[], strips=(x0,y0,x1,y1,ax)=>{ const a0=ax?x0:y0, a1=ax?x1:y1, V=(t,q)=>ax?vis(t,q):vis(q,t);
      for(let s=ax?y0:x0, e=ax?y1:x1; s<e; s++){ const s1=Math.min(e,s+1), m=(s+s1)/2; let lo=1e9, hi=-1e9; for(let t=a0;t<a1;t+=1/24)for(let q=0;q<5;q++)if(V(t,s+(s1-s)*q/4)>-.8){ lo=Math.min(lo,t); hi=Math.max(hi,t); }
        if(hi<lo)continue; lo=Math.max(a0,Math.floor(lo*24-2)/24); hi=Math.min(a1,Math.ceil(hi*24+3)/24); ax?flat(lo,s,hi,s1,0,groundCol):flat(s,lo,s1,hi,0,groundCol);
        for(const [b,d,f] of [[lo,1/24,lo>a0+.01],[hi,-1/24,hi<a1-.01]]){ if(!f||hash(Math.floor(m*7),Math.floor(b*7),461)>.6)continue; let t=b; while(V(t,m)<.08&&Math.abs(t-b)<3)t+=d; if(Math.abs(t-b)<3)T3.push(ax?[t,m,hash(Math.floor(m*7),3,463)]:[m,t,hash(Math.floor(m*7),5,463)]); } } };
    strips(P.x0,cy-w,cx-R,cy+w,0); strips(cx+R,cy-w,P.x1,cy+w,0); strips(cx-R,cy-R,cx+R,cy+R,1); strips(cx-w,P.y0+.5,cx+w,cy-R,1); strips(cx-w,cy+R,cx+w,P.y1,1); }
  const stone=(i,j,k,H=99,cap=false)=>BRICKS.face(i,j,k,H,cap);
  const capSide=(i,j,h)=>{ const n=grain(i/24,j/24,91,1.2), c=(j===0?1.2:j>=h-1?.62:1)*(124+20*n); return speck([c,c,c*.96],i/24,j/24,93); };
  const face=(a,b,c,d,w,h,fn)=>BOD.bq(a,b,c,d,BOD.faceTex(w,h,(i,j)=>BOD.C(fn(i,j))),'G');
  const block=(x0,y0,x1,y1,z0,z1,k,top,jo=0,HT,SF)=>{ if((top==='post'||top==='cap')&&HT===undefined){ x0-=PG; x1+=PG; y0-=PG; y1+=PG; }
    if(top==='post'&&HT===undefined){ block(x0,y0,x1,y1,z0,z1,k,'post',0,z1-z0);
      BRICKS.quoins(x0,y0,x1,y1,z0,z1,k,(bx0,by0,bx1,by1,zb,zt,paint)=>block(bx0,by0,bx1,by1,zb,zt,k,()=>[92,90,86],0,zt-zb,paint));
      return; }
    if(x1-x0>40){ const n=Math.ceil((x1-x0)/40), d=(x1-x0)/n; for(let i=0;i<n;i++)block(x0+i*d,y0,x0+(i+1)*d,y1,z0,z1,k,top,jo,HT,SF); return; } const [a,b,c,d]=[X(x0),X(x1),Z(y0),Z(y1)], [e,f]=[Y(z0),Y(z1)], w=x1-x0, dp=y1-y0;
    const W=w*24, D=dp*24, H=z1-z0, sideF=SF?SF:top==='cap'?(i,j)=>capSide(i,j,H):(i,j,kk)=>stone(i,j+jo,kk,HT||H,top==='post'||HT!==undefined);
    face([a,f,d],[b,f,d],[b,f,c],[a,f,c],W,D,typeof top==='function'&&!top.cope?top:((i,j)=>{ const tv=top&&top.cope?top(i,j):null; if(tv)return tv; const n=grain(i/24,j/24,k+5,1.2), ed=Math.min(i,j,W-1-i,D-1-j); let c=118+22*n; if(ed<1)c*=(i<1||j<1)?1.18:.8; else if(ed<2)c*=1.06;
      else if(top===undefined||top.cope){ const L=W>=D?W:D, u=W>=D?i:j, v=W>=D?j:i, DV=W>=D?D:W; let s0=0, n0=0, len=0; for(;;){ len=14+Math.floor(9*hash(n0,k,131)); if(s0+len>u)break; s0+=len; n0++; } const p=u-s0;
        if(p===0)c*=.55; else if(p===1)c*=1.1; else if(p===len-1)c*=.86; c*=.93+.14*hash(n0,k,133); if(hash(n0,k,135)<.18&&Math.abs(p-len*.5+(v-DV/2)*.6)<.6)c*=.72; }
      return speck([c,c,c*.96],i/24,j/24,k+7); }));
    face([a,e,c],[b,e,c],[b,f,c],[a,f,c],W,H,(i,j)=>sideF(i,j,k,W,H)); face([b,e,d],[a,e,d],[a,f,d],[b,f,d],W,H,(i,j)=>sideF(i,j,k+1,W,H));
    face([a,e,d],[a,e,c],[a,f,c],[a,f,d],D,H,(i,j)=>sideF(i,j,k+2,D,H)); face([b,e,c],[b,e,d],[b,f,d],[b,f,c],D,H,(i,j)=>sideF(i,j,k+3,D,H)); };
  const WH=48, PH=150, PG=.22, T=1.5, PW=2.4, [g0,g1]=P.gate, RUNS=[], PIERS=[], LEAVES=[], IVY=[];
  const ashlar=(ch,l0,lv)=>(i,j,k,W,H)=>{ const co=Math.floor(j/ch), w=j-co*ch, u=i+Math.floor(hash(co,k,7)*l0); let s0=0, n=0, len=0; for(;;){ len=l0+Math.floor(lv*hash(n,co,k+3)); if(s0+len>u)break; s0+=len; n++; } const p=u-s0;
    let c=124+18*grain(i/24,j/24,k,1.2)+(hash(n,co,k+5)-.5)*40, wm=hash(n,co,k+9)-.5;
    const joint=w===ch-1||p===0; if(joint)c*=.5; else if(w===0)c*=1.16; else if(p===1)c*=1.07; else if(p===len-1||w===ch-2)c*=.86;
    if(!joint&&hash(i,j,k+11)>.992)c*=.7; if(!joint&&hash(n,co,k+15)<.08&&(p<3||w<2))c*=.78;
    const dn=j/H; c*=1-.3*dn*dn; const sc=i>>1, sl=H*(.15+.7*hash(sc,k,621)); if(hash(sc>>2,k,623)<.3&&hash(sc,k,625)<.6&&j<sl)c*=.8;
    const bl=cvn(i/40,j/26,k+627); if(bl>.64)c*=.86; let col=[c*(1+wm*.08),c,c*(.97-wm*.07)]; if(bl<.26)col=[col[0]*1.06,col[1]*1.02,col[2]*.9];
    if(joint&&dn>.5&&hash(i>>1,j,k+13)<.5)col=[58,78,44]; else if(hash(i>>1,j>>1,k+17)>.986)col=[150,156,108];
    return speck(col,i/24,j/24,k+23); };
  const c01=v=>Math.max(0,Math.min(1,v)), sd=s=>s*.37;
  const CC=new Map(), colV=(u,s,q)=>{ const key=s*1e6+Math.round(u*24)+(q>.58?5e5:0); let v=CC.get(key); if(v)return v;
    const cov=c01((cvn(u/13,sd(s),601)*.75+cvn(u/3.2,sd(s),603)*.25-q)/.22); v=[cov?cov*1.25*(.45+.55*cvn(u/1.1,sd(s),605)):0,.8*c01((cvn(u/7,sd(s)+9,607)-.62)/.2)*(.3+.7*cvn(u/.7,sd(s),609))]; CC.set(key,v); return v; };
  const hang=(u,s,H)=>H*colV(u,s,.56)[1];
  const ivyAt=(u,j,s,H,q=.56,hg=true)=>{ const v=colV(u,s,q), r=(hash(Math.floor(u*12),j>>1,s+611)-.5)*7; return H-j<H*v[0]+r||hg&&j<H*v[1]+r; };
  const leafC=(i,j,s)=>{ if(hash(i>>1,j>>1,s+613)<.13)return null; const g=hash(i,j,s+617); return g<.3?[40,66,30]:g<.65?[56,90,38]:g<.9?[74,112,48]:[100,136,60]; };
  const wallF=ashlar(7,10,8), rusF=(i,j,k,W,H)=>{ if(ivyAt(i/24+k*3.1,j,k,H,.6,false)){ const c=leafC(i,j,k); if(c)return c; } const ch=14, co=Math.floor(j/ch), w=j-co*ch, u=i+(co&1)*13; let s0=0, n=0, len=0; for(;;){ len=22+Math.floor(12*hash(n,co,k+3)); if(s0+len>u)break; s0+=len; n++; } const p=u-s0;
    let c=122+16*grain(i/24,j/24,k,1.2)+(hash(n,co,k+5)-.5)*34; if(w<2)c*=.42; else if(w===2)c*=1.18; else if(w===ch-1)c*=.78; else if(p===0)c*=.62; else if(p===1)c*=1.06; else if(hash(i,j,k+11)>.993)c*=.7;
    c*=1-.26*(j/H)*(j/H); const sc=i>>1; if(hash(sc>>2,k,631)<.35&&hash(sc,k,633)<.55&&j<H*(.1+.5*hash(sc,k,635)))c*=.82;
    let col=[c*1.02,c,c*.95]; if(w<2&&j/H>.6&&hash(i>>1,j,k+13)<.5)col=[58,78,44]; else if(hash(i>>1,j>>1,k+17)>.988)col=[150,156,108]; return speck(col,i/24,j/24,k+23); };
  const wall=(x0,y0,x1,y1,k)=>{ if(x1-x0<=.05||y1-y0<=.05)return; const ax=x1-x0>=y1-y0, L=ax?x1-x0:y1-y0, n=Math.ceil(L/36);
    for(let p=0;p<n;p++){ const a=(ax?x0:y0)+L*p/n, b=(ax?x0:y0)+L*(p+1)/n, [qx0,qy0,qx1,qy1]=ax?[a,y0,b,y1]:[x0,a,x1,b], kp=k*7+p*5, W=(qx1-qx0)*24, D=(qy1-qy0)*24;
      const sf=(i,j,kk,w,H)=>{ if(ivyAt(i/24,j,kk,H)){ const c=leafC(i,j,kk); if(c)return c; } return wallF(i,j,kk,w,H); };
      const S=ax?[[kp,i=>i/24,(i,j)=>j],[kp+1,i=>(W-1-i)/24,(i,j)=>D-1-j]]:[[kp+2,(i,j)=>(D-1-j)/24,i=>i],[kp+3,(i,j)=>j/24,i=>W-1-i]];
      const tp=(i,j)=>{ for(const [s,uf,df] of S){ const u=uf(i,j), e=df(i,j), h=hang(u,s,WH); if(h>4&&e<h*.5+(hash(i>>1,j>>1,s+641)-.5)*6){ const c=leafC(i,j,s+5); if(c)return c; } } return null; }; tp.cope=1;
      block(qx0,qy0,qx1,qy1,0,WH,kp,tp,0,WH,sf); RUNS.push([qx0,qy0,qx1,qy1,kp]);
      const F=ax?[[kp,u=>[qx0+u,qy0],0,-1,qx1-qx0],[kp+1,u=>[qx1-u,qy1],0,1,qx1-qx0]]:[[kp+2,u=>[qx0,qy1-u],-1,0,qy1-qy0],[kp+3,u=>[qx1,qy0+u],1,0,qy1-qy0]], Q=[];
      for(const [s,at,nx,ny,len] of F)for(let u=.15;u<len-.1;u+=.26)for(let z=3;z<WH+2;z+=5){ const j=WH-z; if(!ivyAt(u,j,s,WH)||hash(Math.round(u*40),z,s+651)>.5)continue; const [x,y]=at(u+(hash(z,Math.round(u*40),s+653)-.5)*.2), r=hash(Math.round(u*40),z,s+655);
        Q.push([x+nx*.05,y+ny*.05,Math.min(WH+1,z+(r-.5)*3),.16+.18*r,nx,ny,Math.floor(hash(z,Math.round(u*40),s+657)*4)]); }
      if(Q.length)IVY.push(Q); } };
  const pier=(x0,y0,x1,y1,k)=>{ const B=(e,z0,z1,kk,top,SF)=>block(x0-e,y0-e,x1+e,y1+e,z0,z1,kk,top,0,z1-z0,SF), st=()=>[118,116,110];
    B(.14,0,18,k,st,rusF); B(.08,18,22,k+4,'cap'); B(0,22,PH-24,k+8,st,rusF); B(.06,PH-24,PH-20,k+12,'cap'); B(0,PH-20,PH,k+16,st,rusF);
    B(.1,PH,PH+5,k+20,'cap'); B(.2,PH+5,PH+9,k+24,'cap'); B(.32,PH+9,PH+14,k+28,'cap'); B(.18,PH+14,PH+18,k+32,'cap');
    PIERS.push([(x0+x1)/2,(y0+y1)/2,x0,y0,x1,y1]); };
  wall(P.x0,P.y0,g0-PW,P.y0+T,11); wall(g1+PW,P.y0,P.x1,P.y0+T,15);
  pier(g0-PW,P.y0-.3,g0,P.y0+T+.6,21); pier(g1,P.y0-.3,g1+PW,P.y0+T+.6,25);
  LEAVES.push([g0,P.y0+T+.85,-1,'x',(g1-g0)/2],[g1,P.y0+T+.85,1,'x',(g1-g0)/2]);
  PARK.look=[X(g1+1.8),Z(P.y0-1.6)];
  const EG=PARK.egate=[P.round[1]-1.5,P.round[1]+1.5], ex=P.x1-T;
  wall(ex,P.y0+T,P.x1,EG[0]-PW,31); wall(ex,EG[1]+PW,P.x1,P.y1,35);
  pier(ex-.6,EG[0]-PW,P.x1+.3,EG[0],41); pier(ex-.6,EG[1],P.x1+.3,EG[1]+PW,45);
  LEAVES.push([ex-.85,EG[0],-1,'y',1.5],[ex-.85,EG[1],1,'y',1.5]);
  const CB=[CASTLE.b[0]-PO.x,CASTLE.b[1]-PO.x,CASTLE.b[2]-PO.y,CASTLE.b[3]-PO.y], wx=P.x0, ny=P.y1-T, WG=PARK.wgate=[P.round[1]-1.5,P.round[1]+1.5], NG=PARK.ngate=[P.round[0]-3.5,P.round[0]+3.5];
  const wTop=Math.min(P.y1,CB[2]), nLeft=CB[3]<P.y1-T-1?P.x0:Math.max(P.x0,CB[1]);
  wall(wx,P.y0+T,wx+T,WG[0]-PW,51); wall(wx,WG[1]+PW,wx+T,wTop,55); if(CB[3]<P.y1-T-1)wall(wx,CB[3],wx+T,ny,59);
  pier(wx-.3,WG[0]-PW,wx+T+.6,WG[0],57); pier(wx-.3,WG[1],wx+T+.6,WG[1]+PW,61);
  LEAVES.push([wx+T+.85,WG[0],-1,'y',1.5],[wx+T+.85,WG[1],1,'y',1.5]);
  wall(nLeft,ny,NG[0]-PW,P.y1,65); wall(NG[1]+PW,ny,P.x1-T,P.y1,69);
  pier(NG[0]-PW,ny-.6,NG[0],P.y1+.3,71); pier(NG[1],ny-.6,NG[1]+PW,P.y1+.3,75);
  LEAVES.push([NG[0],ny-.85,-1,'x',3.5],[NG[1],ny-.85,1,'x',3.5]);
  { const M=TILE/.84, VS=ZU*24/TILE, mv=m=>m*M*VS, top=Y(WH), rnd=(a,b,c)=>hash(a,b,c);
    const cut=(g,f)=>{ const N=g.attributes.normal.array, k=[]; for(let t=0;t<N.length/9;t++)if(!f(N[t*9+1]))k.push(t); for(const n of ['position','normal']){ const A=g.attributes[n].array, D=new Float32Array(k.length*9); k.forEach((t,j)=>D.set(A.subarray(t*9,t*9+9),j*9)); g.setAttribute(n,new THREE.BufferAttribute(D,3)); } return g; };
    const pick=(()=>{ const sh=cut(new THREE.BoxGeometry(.042*M,1,.042*M).translate(0,.5,0).toNonIndexed(),y=>Math.abs(y)>.9), cl=new THREE.BoxGeometry(.07*M,.025,.07*M).translate(0,.985,0).toNonIndexed(), tp=cut(new THREE.ConeGeometry(.05*M,.17,4).rotateY(Math.PI/4).translate(0,1.08,0).toNonIndexed(),y=>y<-.9), g=new THREE.BufferGeometry();
      for(const a of ['position','normal']){ const A=sh.attributes[a].array, B=cl.attributes[a].array, Cc=tp.attributes[a].array, C=new Float32Array(A.length+B.length+Cc.length); C.set(A); C.set(B,A.length); C.set(Cc,A.length+B.length); g.setAttribute(a,new THREE.BufferAttribute(C,3)); } return g; })();
    const unit=new THREE.BoxGeometry(1,1,1), iron=new THREE.MeshLambertMaterial({color:0xffffff}), glass=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.62,depthWrite:false}), core=new THREE.MeshBasicMaterial({color:0xffffff});
    const IR=[0x23272a,0x1e2225,0x272b2e,0x2a2420], m4=new THREE.Matrix4(), q=new THREE.Quaternion(), e=new THREE.Euler(), V=THREE.Vector3, col=new THREE.Color();
    const put=(P_,B_)=>{ if(P_.length){ const me=new THREE.InstancedMesh(pick,iron,P_.length); P_.forEach(([x,y,z,h,lean,ax,c],i)=>{ q.setFromEuler(e.set(ax==='x'?lean:0,0,ax==='x'?0:lean)); me.setMatrixAt(i,m4.compose(new V(x,y,z),q,new V(1,h,1))); me.setColorAt(i,col.setHex(c)); });
        me.computeBoundingSphere(); me.castShadow=true; me.receiveShadow=true; scene.add(me); PARK.iron=(PARK.iron||0)+P_.length*28; }
      if(B_.length){ const me=new THREE.InstancedMesh(unit,iron,B_.length); B_.forEach(([x,y,z,sx,sy,sz,c],i)=>{ me.setMatrixAt(i,m4.compose(new V(x,y,z),q.identity(),new V(sx,sy,sz))); me.setColorAt(i,col.setHex(c)); });
        me.computeBoundingSphere(); me.castShadow=true; me.receiveShadow=true; scene.add(me); PARK.iron=(PARK.iron||0)+B_.length*12; } };
    const SP=.19, RH=mv(1.5);
    for(const [x0,y0,x1,y1,k] of RUNS){ const ax=x1-x0>=y1-y0?'x':'y', L=ax==='x'?x1-x0:y1-y0, c0=ax==='x'?(y0+y1)/2:(x0+x1)/2, s0=ax==='x'?x0:y0, NP=Math.ceil(L/16);
      for(let pc=0;pc<NP;pc++){ const a=s0+L*pc/NP, b=s0+L*(pc+1)/NP, Pk=[], Bx=[], at=(u,v)=>ax==='x'?[X(u),Z(v)]:[X(v),Z(u)];
        for(let u=a+SP/2;u<b;u+=SP){ const n=Math.round(u/SP); if(rnd(n,k,301)<.02)continue;
          const [wx_,wz_]=at(u,c0), r=rnd(n,k,303), lean=r<.05?(rnd(n,k,305)-.5)*.3:0; Pk.push([wx_,top,wz_,RH*(r<.03?.85:1),lean,ax==='x'?'z':'x',r<.15?IR[3]:IR[n%3]]); }
        const [cx,cz]=at((a+b)/2,c0), len=(b-a)*TILE; for(const hh of [.1,.84])Bx.push([cx,top+RH*hh,cz,ax==='x'?len:.045*M,.045*M*VS,ax==='x'?.045*M:len,IR[0]]);
        for(let u=Math.ceil(a/2.857)*2.857;u<b;u+=2.857){ const [px,pz]=at(u,c0); Bx.push([px,top+RH*.52,pz,.09*M,RH*1.04,.09*M,IR[1]],[px,top+RH*1.07,pz,.13*M,.13*M*VS*1.4,.13*M,IR[1]],[px,top+RH*1.13,pz,.06*M,.1*M*VS*2.2,.06*M,IR[1]]); }
        put(Pk,Bx); } }
    const GP=[], GB=[];
    for(const [hx,hy,dir,ax,w] of LEAVES){ const at=(u)=>ax==='x'?[X(hx+dir*u),Z(hy)]:[X(hy),Z(hx+dir*u)], H=mv(3.3);
      for(let u=.08;u<w-.04;u+=.17){ const [x,z]=at(u); GP.push([x,0,z,H,0,'x',IR[(Math.round(u*7))%3]]); }
      const [cx,cz]=at(w/2), len=w*TILE; for(const hh of [.08,.55,.9])GB.push([cx,H*hh,cz,ax==='x'?len:.06*M,.06*M*VS,ax==='x'?.06*M:len,IR[0]]);
      for(const u of [0,w]){ const [x,z]=at(u); GB.push([x,H*.5,z,.09*M,H*1.02,.09*M,IR[1]]); }
      for(let u=.3;u<w-.2;u+=.6){ const [x,z]=at(u); GB.push([x,H*.73,z,ax==='x'?.27*M:.045*M,.27*M*VS,ax==='x'?.045*M:.27*M,IR[2]]); }
      const [a1,b1]=at(0), [a2,b2]=at(w); SOL.up.push([Math.min(a1,a2)-.09*M,Math.min(b1,b2)-.09*M,Math.max(a1,a2)+.09*M,Math.max(b1,b2)+.09*M]); FIX.up.push([Math.min(a1,a2)-.09*M,Math.min(b1,b2)-.09*M,0,Math.max(a1,a2)+.09*M,Math.max(b1,b2)+.09*M,H]); }
    put(GP,GB);
    { const leaf=new THREE.OctahedronGeometry(.5,0), lm=new THREE.MeshLambertMaterial({color:0xffffff}), LC=[0x355a28,0x4a7a32,0x5f8f3c,0x3f6a2c];
      for(const Q of IVY){ const me=new THREE.InstancedMesh(leaf,lm,Q.length); Q.forEach(([x,y,z,s,nx,ny,c],i)=>{ q.setFromEuler(e.set(0,0,0)); me.setMatrixAt(i,m4.compose(new V(X(x),Y(z),Z(y)),q,new V(nx?s*M*.4:s*M,mv(s)*.8,nx?s*M:s*M*.4))); me.setColorAt(i,col.setHex(LC[c])); });
        me.computeBoundingSphere(); me.receiveShadow=true; scene.add(me); PARK.ivy=(PARK.ivy||0)+Q.length*8; } }
    const LB=[], LG=[], LC_=[], HL=[];
    for(const [x,y] of PIERS){ const wx_=X(x), wz_=Z(y), t=Y(PH+18), K=1.4, b=(h0,h,w,c=IR[0])=>LB.push([wx_,t+mv((h0+h/2)*K),wz_,w*M*K,mv(h*K),w*M*K,c]);
      b(0,.22,.62,IR[1]); b(.22,.05,.5); b(.27,.05,.4); for(const [dx,dz] of [[-1,-1],[1,-1],[-1,1],[1,1]])LB.push([wx_+dx*.16*M*K,t+mv(.62*K),wz_+dz*.16*M*K,.045*M*K,mv(.66*K),.045*M*K,IR[0]]);
      b(.6,.03,.38,IR[2]); b(.95,.06,.5); b(1.01,.06,.4); b(1.07,.06,.3); b(1.13,.06,.2); b(1.19,.08,.1,IR[1]); b(1.27,.16,.04,IR[1]);
      LG.push([wx_,t+mv(.62*K),wz_,.3*M*K,mv(.64*K),.3*M*K]); LC_.push([wx_,t+mv(.6*K),wz_,.1*M*K,mv(.16*K),.1*M*K]); HL.push([wx_,t+mv(.62*K),wz_]); }
    put([],LB);
    if(LG.length){ const box=(L_,mat)=>{ const me=new THREE.InstancedMesh(unit,mat,L_.length); L_.forEach(([x,y,z,sx,sy,sz],i)=>me.setMatrixAt(i,m4.compose(new V(x,y,z),q.identity(),new V(sx,sy,sz)))); me.computeBoundingSphere(); scene.add(me); return me; };
      PARK.lanterns=box(LG,glass); box(LC_,core);
      const HT=(()=>{ const W=48, cv=document.createElement('canvas'); cv.width=cv.height=W; const g=cv.getContext('2d'), im=g.createImageData(W,W), Bm=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
        for(let j=0;j<W;j++)for(let i=0;i<W;i++){ const d=Math.hypot((i+.5)/W*2-1,(j+.5)/W*2-1), t=(Bm[(j%4)*4+i%4]+.5)/16, a=d<.14?1:d<.3+(t-.5)*.06?.42:d<.55+(t-.5)*.08?.2:d<.9+(t-.5)*.08?.08:0, o=(j*W+i)*4; im.data[o]=255; im.data[o+1]=d<.14?236:204; im.data[o+2]=d<.14?190:130; im.data[o+3]=a*255; }
        g.putImageData(im,0,0); const tx=new THREE.CanvasTexture(cv); tx.magFilter=tx.minFilter=THREE.NearestFilter; tx.generateMipmaps=false; tx.colorSpace=THREE.SRGBColorSpace; return tx; })();
      const hm=new THREE.SpriteMaterial({map:HT,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}), SPR=[], LL=[];
      for(const [x,y,z] of HL){ const s=new THREE.Sprite(hm); s.position.set(x,y,z); s.scale.set(2.6*M,2.6*M,1); s.renderOrder=2; s.visible=false; scene.add(s); SPR.push(s);
        const L=new THREE.PointLight(new THREE.Color(1,.8,.52),24,12*TILE,1.6); L.position.set(x,y,z); L.userData.i0=24; L.intensity=0; scene.add(L); lamps.push(L); LL.push(L); }
      const lit=()=>{ let d=false; try{ d=CLOCK.dark(); }catch(_){ } glass.color.setHex(d?0xffc978:0x6e6656); core.color.setHex(d?0xfff6dc:0x8a7e66); for(const s of SPR)s.visible=d; for(const L of LL)L.intensity=d?L.userData.i0*(window.DN?DN.lk:1):0; }; lit(); setInterval(lit,2000); PARK.lampLit=lit; } }
  const TL=[0,1,2,3].includes(+QS.get('treelook'))&&QS.get('treelook')!==null?+QS.get('treelook'):0;
  const treeLook=sh=>{ sh.vertexShader='attribute vec3 aTr; varying vec3 vTr; varying vec3 vLw;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n vTr=aTr; vLw=transformed;')
      .replace('#include <shadowmap_vertex>',THREE.ShaderChunk.shadowmap_vertex.replace(/(directional|point)LightShadows\[ i \]\.shadowNormalBias/g,'($&+aTr.z*.35)'));
    let f='varying vec3 vTr; varying vec3 vLw; float TW=0., TSH=1.;\nfloat lfH(vec3 p){ return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453); }\n'+sh.fragmentShader
      .replace('diffuseColor.rgb*=wn.y>=max(wn.x,wn.z)?1.:','diffuseColor.rgb*=vTr.z>.5&&'+(TL>1)+'?1.:wn.y>=max(wn.x,wn.z)?1.:');
    if(TL>1)f=f.replace('#include <lights_lambert_pars_fragment>',THREE.ShaderChunk.lights_lambert_pars_fragment.replace('float dotNL = saturate( dot( geometryNormal, directLight.direction ) );','float dotNL = saturate( ( dot( geometryNormal, directLight.direction ) + TW ) / ( 1. + TW ) );'))
      .replace('#include <shadowmap_pars_fragment>',THREE.ShaderChunk.shadowmap_pars_fragment.replace(/return shadow;/g,'return mix( 1., shadow, TSH );'))
      .replace('#include <lights_fragment_begin>','if(vTr.z>.5){ TW=.45; TSH=.7; }\n#include <lights_fragment_begin>')
      .replace('#include <lights_fragment_end>','#include <lights_fragment_end>\n if(vTr.z>.5){ float ao=mix(.5,1.,floor(smoothstep(0.,1.,.62*vTr.x+.38*vTr.y)*2.+.5)/2.); reflectedLight.directDiffuse*=mix(1.,ao,.6); reflectedLight.indirectDiffuse*=ao; }');
    sh.fragmentShader=f; };
  const BATCHED=(g,RG,mat)=>{ const n=RG.length-1; if(QS.get('bm')==='0'||n<2)return new THREE.Mesh(g,mat); const me=new THREE.BatchedMesh(n,RG[n],0,mat), names=Object.keys(g.attributes), I=new THREE.Matrix4();
    for(let i=0;i<n;i++){ const a=RG[i], b=RG[i+1]; if(b<=a)continue; const G=new THREE.BufferGeometry(); for(const k of names){ const A=g.attributes[k], z=A.itemSize; G.setAttribute(k,new THREE.BufferAttribute(A.array.slice(a*z,b*z),z,A.normalized)); } me.setMatrixAt(me.addGeometry(G),I); }
    me.sortObjects=false; return me; };
  const F=Object.assign({},FOREST,PROPS), mesh=(list,leafy,solid=true,sway=false)=>{ const P3=[], C3=[], SW=[], TR=[], LF=[], RN=[], RG=[], IT=[], c=new THREE.Color(); for(const [key,x,y,m,turn,lift] of list){ const p0=P3.length; RG.push(p0/3); const ph=hash(Math.round(x*7),Math.round(y*7),131)*6.28; const D=F[key], p=f32(D.p), col=b8(D.c), k=b8(D.k), s=m/.84*TILE, ca=Math.cos(turn||0), sa=Math.sin(turn||0), ox=X(x), oz=Z(y), oy=(lift||0)/.84*TILE+P.hill(x,y);
      for(let i=0;i<p.length;i+=3){ const px=p[i]*s, py=p[i+1]*s+oy, pz=p[i+2]*s; P3.push(ox+px*ca-pz*sa,py,oz+px*sa+pz*ca); if(sway)SW.push(Math.max(0,p[i+1])*s,ph); if(TL)LF.push(col[i+1]>col[i]*1.08&&col[i+1]>col[i+2]*1.08?1:0); const t=Math.floor(i/9), sh=k[t]===0?.86+.28*hash(t,x*7,y*3):k[t]===2?.9+.2*hash(t,x*5,y*9):.92+.16*hash(t,x*3,y*5);
        c.setRGB(col[i]/255*sh,col[i+1]/255*sh,col[i+2]/255*sh,THREE.SRGBColorSpace); C3.push(c.r,c.g,c.b); }
      if(TL){ const q0=p0/3, q1=P3.length/3; let y0=1e9, y1=-1e9, cx=0, cz=0, n=0, r1=1e-3; for(let v=q0;v<q1;v++)if(LF[v]){ y0=Math.min(y0,P3[v*3+1]); y1=Math.max(y1,P3[v*3+1]); cx+=P3[v*3]; cz+=P3[v*3+2]; n++; } cx/=n||1; cz/=n||1;
        for(let v=q0;v<q1;v++)if(LF[v])r1=Math.max(r1,Math.hypot(P3[v*3]-cx,P3[v*3+2]-cz)); const cy=(y0+y1)/2, ry=Math.max(1e-3,(y1-y0)/2);
        for(let v=q0;v<q1;v++){ TR.push(LF[v]?(P3[v*3+1]-y0)/Math.max(1e-3,y1-y0):0,LF[v]?Math.hypot(P3[v*3]-cx,P3[v*3+2]-cz)/r1:0,LF[v]); RN.push((P3[v*3]-cx)/(r1*r1),(P3[v*3+1]-cy)/(ry*ry),(P3[v*3+2]-cz)/(r1*r1)); } }
      { let t=oy, r=0; for(let v=p0+1;v<P3.length;v+=3)if(P3[v]>t)t=P3[v]; const hm=(oy+t)/2; for(let v=p0;v<P3.length;v+=3)if(P3[v+1]>hm)r=Math.max(r,Math.hypot(P3[v]-ox,P3[v+2]-oz)); IT.push({k:key,x:ox,z:oz,y:oy,top:t,r}); }
      CLIPX.push({place:'park',name:key,P:P3.slice(p0)});
      if(solid){ const r=Math.max(.3,D.trunk*s*.5); SOL.up.push([ox-r,oz-r,ox+r,oz+r]); FIX.up.push([ox-r,oz-r,0,ox+r,oz+r,leafy?Y(60):s*.9]); } }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(P3,3)); g.setAttribute('color',new THREE.Float32BufferAttribute(C3,3)); g.computeVertexNormals(); if(sway)g.setAttribute('aSw',new THREE.Float32BufferAttribute(SW,2)); if(TL)g.setAttribute('aTr',new THREE.Float32BufferAttribute(TR,3));
    if(TL>1){ const N=g.attributes.normal.array; for(let v=0;v<LF.length;v++)if(LF[v]){ let x=RN[v*3], y=RN[v*3+1], z=RN[v*3+2]; const l=Math.hypot(x,y,z)||1; x=x/l*.8+N[v*3]*.2; y=y/l*.8+N[v*3+1]*.2; z=z/l*.8+N[v*3+2]*.2; const m=Math.hypot(x,y,z)||1; N[v*3]=x/m; N[v*3+1]=y/m; N[v*3+2]=z/m; } }
    const mat=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide,shadowSide:THREE.BackSide});
    const SWG=sway&&(sway===2?'{ float h=aSw.x, g=(.7+.3*sin(uSw*.23+aSw.y))*uWk; transformed.x+=sin(uSw*2.3+aSw.y)*h*.12*g; transformed.z+=sin(uSw*1.9+aSw.y*1.7)*h*.08*g; }':'{ float h=aSw.x*aSw.x*.1, g=(.7+.3*sin(uSw*.23+aSw.y))*uWk; transformed.x+=sin(uSw*1.6+aSw.y)*h*.035*g; transformed.z+=sin(uSw*1.2+aSw.y*1.7)*h*.025*g; }'), swayV=sh=>{ sh.uniforms.uSw=PARK.sway; sh.uniforms.uWk=PARK.windK; sh.vertexShader='attribute vec2 aSw; uniform float uSw,uWk;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n '+SWG); };
    if(sway||TL){ mat.onBeforeCompile=sh=>{ if(TL)treeLook(sh); if(sway)swayV(sh); }; mat.customProgramCacheKey=()=>'oaksway'+sway+'tl'+TL; }
    RG.push(P3.length/3); const me=BATCHED(g,RG,mat); me.userData.P=P3; me.userData.LF=LF; me.userData.items=IT; me.castShadow=true; me.receiveShadow=TL!==2;
    if(sway&&TL)for(const [k,M] of [['customDepthMaterial',new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking})],['customDistanceMaterial',new THREE.MeshDistanceMaterial()]]){ M.onBeforeCompile=swayV; M.customProgramCacheKey=()=>'oakswayd'+sway; me[k]=M; }
    scene.add(me); return me; };
  const TREEY=12+4.6; PARK.mesh=mesh;
  const TREES=(()=>{ const out=[], RR=[], KEEP=[[P.round[0]+12.5-6,P.round[1]+11.5-6,P.round[0]+12.5+6,P.round[1]+11.5+6],[CASTLE.b[0]-3,CASTLE.b[2]-3,CASTLE.b[1]+3,CASTLE.b[3]+3],[P.gate[0]-16,P.y0,P.gate[1]+8,P.y0+12],(c=>[c.x-7,c.y-7,c.x+7,c.y+7])(P.campAt()),[RX(90)-3,RY(-41.5)-3,RX(102)+3,RY(-41.5)+3],...(typeof GCAVE!=='undefined'?GCAVE.keep(P):[])];
    const [cx,cy]=P.round, W=k=>/^Oak/.test(k)?.42:F[k].wide*.45, add=(k,x,y,m,t)=>{ out.push([k,+x.toFixed(1),+y.toFixed(1),+m.toFixed(1),+t.toFixed(2)]); RR.push(m*W(k)); }, near=(x,y,r,f,g)=>out.some((o,j)=>Math.hypot(o[1]-x,o[2]-y)<Math.max(g,(RR[j]+r)*f)),
      ok=(x,y,r)=>!(Math.abs(x-cx-wobX(y))<6.6+r||Math.abs(y-cy-wobY(x))<6.6+r||y<P.y0+TREEY+4||y>P.y1-r-8||x<P.x0+r+10||x>P.x1-r-10||Math.hypot(x-cx,y-cy)<P.round[2]+r+6||KEEP.some(b=>x>b[0]-r&&x<b[2]+r&&y>b[1]-r&&y<b[3]+r)||BK.wet(x,y,r)||FOUNT.lake(x,y)<r*.35+1.5||FOUNT.ter(x,y)<r+.5);
    for(const [k,m,qx,qy,lk] of [['Willow1',19,1,1,1],['Giant1',34,-1,1,0],['Spruce1',28,1,-1,0]]){ const r=m*W(k), tx=(qx<0?P.x0:P.x1)/2+cx/2, ty=(qy<0?P.y0:P.y1)/2+cy/2; let best=null, bs=1e9;
      for(let pass=0;pass<2&&!best;pass++)for(let i=0;i<1600;i++){ const x=P.x0+(P.x1-P.x0)*hash(i,71,k.length), y=P.y0+(P.y1-P.y0)*hash(i,73,k.length+3); if(!pass&&((x-cx)*qx<0||(y-cy)*qy<0)||!ok(x,y,r)||near(x,y,r,1,14))continue; const sc=lk?FOUNT.lake(x,y):Math.hypot(x-tx,y-ty); if(sc<bs){ bs=sc; best=[x,y]; } }
      if(best)add(k,best[0],best[1],m,hash(Math.round(best[0]),Math.round(best[1]),77)*6.28); }
    let nm=0; for(let i=0;i<2400&&nm<22;i++){ const el=hash(i,59,17)<.38, k=el?'Elder'+(1+Math.floor(hash(i,61,7)*2)):'OakTree'+(1+Math.floor(hash(i,53,13)*3)), m=(9+hash(i,47,11)*15)*(el?.85:1), r=m*W(k), hy=hash(i,43,9)<.5, y0=hy?Math.max(P.y0+TREEY+4,P.y0+r+8):cy, y1=hy?cy:P.y1, x=P.x0+(P.x1-P.x0)*(.12+.76*hash(i,41,7)), y=(y0+y1)/2+(hash(i,49,5)-.5)*(y1-y0)*.4;
      if(!ok(x,y,r)||near(x,y,r,.75,12))continue; add(k,x,y,m,hash(i,63,3)*6.28); nm++;
      if(hash(i,65,9)<.45)for(let j=0,nb=1+Math.floor(hash(i,67,5)*2);j<nb;j++){ const a=hash(i,69+j,3)*6.28, mm=m*(.5+.25*hash(i,79+j,5)), kk=hash(i,81+j,7)<.5?k:el?'OakTree'+(1+(i+j)%3):'Elder'+(1+(i+j)%2), rr=mm*W(kk), d=r*.55+rr*.6+2, x2=x+Math.cos(a)*d, y2=y+Math.sin(a)*d;
        if(ok(x2,y2,rr)&&!near(x2,y2,rr,.5,4.5))add(kk,x2,y2,mm,hash(i,83+j,9)*6.28); } }
    for(const [k0,x,y,m] of FOUNT.S.oaks){ const k=hash(Math.round(x),Math.round(y),87)<.35?'Elder'+(1+Math.abs(Math.round(x))%2):k0; if(!near(x,y,m*W(k),.6,8)&&!BK.wet(x,y,m*.42))add(k,x,y,m,hash(Math.round(x),Math.round(y),89)*6.28); } return out; })();
  PARK.trees=QS.get('trees')==='0'?null:mesh(TREES,true,true,true);
  PARK.oaks=TREES.map(([k,x,y,m])=>[X(x),Z(y),m]); window.PARKDBG=()=>({oaks:PARK.oaks,trees:TREES,TL,progs:renderer.info.programs.length});
  PARK.rocks=mesh([['BigRock3',87.5,-37,2.6,1.8],['BigRock5',126,-41,2.4,.2],['Rock_12',55.5,-41,1,1],['Rock1',111,-41,.6,2],['BigRock1',66,-35,2,1.1]].map(([k,x,y,...r])=>[k,RX(x),RY(y),...r]),false);
  { const UG=[['bush1',1.1],['bush2',1.2],['bush3',1.3],['bush4',1.5],['bush5',1.1],['flower1',.5],['flower2',.7],['flower3',.3],['flower4',.7],['flower5',.35],['flower6',.8],['grass1',.5],['grass2',.6],['grass1',.45],['grass2',.55],['mushroom1',.3],['mushroom2',.35],['mushroom3',.3],['mushroom4',.25],['stone2',.5],['stone3',.2],['stones1',.25]];
    const list=[]; for(let i=0;i<90;i++){ const x=P.x0+2+hash(i,3,91)*(P.x1-P.x0-4), y=P.y1-NORTHX-1-Math.pow(hash(i,7,93),1.6)*(P.y1-NORTHX-P.y0-3); if(path(x,y)||path(x+1,y)||path(x-1,y)||path(x,y+1)||path(x,y-1)||BK.wet(x,y,1)||hash(i,11,95)<.3||FOUNT.away(x,y)<0)continue; if(x>67&&x<77&&y>-44+NORTHY&&y<-24+NORTHY)continue; if(Math.hypot(x-P.campAt().x,y-P.campAt().y)<4)continue; if(typeof GCAVE!=='undefined'&&GCAVE.keep(P).some(b=>x>b[0]&&x<b[2]&&y>b[1]&&y<b[3]))continue; { const [a,b,c,d]=CASTLE.b.map((v,i)=>v-(i<2?PO.x:PO.y)); if(x>a-1.6&&x<b+1.6&&y>c-1.6&&y<d+1.6)continue; }
      const [k,m]=UG[Math.floor(hash(i,13,97)*UG.length)]; list.push([k,x,y,m*(.8+.4*hash(i,17,99)),hash(i,19,101)*6.28]); }
    list.push(...[['log1',65,-41,.5,.4],['log2',86,-40.5,.6,1.2],['log3',104,-39,.6,2.6],['fence1',57,-41,.8,0],['fence1',126,-41,.8,1.57],['pmushroom1',62.5,-36.5,.6,0],['pmushroom2',63.5,-36.2,.5,1],['pmushroom3',61.8,-35.5,.55,2]].map(([k,x,y,...r])=>[k,RX(x),RY(y),...r]));
    const isPlant=k=>/^(bush|flower|grass)/.test(k);
    PARK.under=mesh(list.filter(e=>isPlant(e[0])),false,false,2); PARK.underStill=mesh(list.filter(e=>!isPlant(e[0])),false,false,false);
    const CF=P.campAt(), wa=(dx,dy)=>Math.atan2(Z(dy)-Z(0),X(dx)-X(0)), cpt=(a,b)=>[CF.x+CF.nx*a-CF.ny*b,CF.y+CF.ny*a+CF.nx*b], LOG=cpt(1.75,-.2), WP=cpt(.25,1.7);
    PARK.camp=mesh([['campfire',CF.x,CF.y,.13,0],['woodpile',WP[0],WP[1],.5,.6+wa(WP[0]-CF.x,WP[1]-CF.y)-wa(1.5,-1.1)]],false,true); PARK.fire={x:X(CF.x),z:Z(CF.y),y:.3};
    { const L=new THREE.PointLight(new THREE.Color(1,.6,.25),26,9*TILE,1.6); L.position.set(X(CF.x),.5*TILE,Z(CF.y)); L.userData.fire=1; scene.add(L); PARK.fireL=L;
      PARK.flame=FLAME.add({kind:'bed',name:'campfire',x:X(CF.x),y:.12*TILE,z:Z(CF.y),w:.78*TILE,h:.95*TILE,embers:4,smoke:2.2,sk:1.3,light:L,seed:5}); }
    PARK.more=mesh([['pillar1',90,-41.5,3.2,.3],['pillar2',102,-41.5,2.6,1.2],
      ['daisy',92.3,-56,.35,0],['tulip',92.3,-54,.4,1],['rose',92.3,-52,.45,2],['sunflower',99.7,-56,.9,.5],['lily',99.7,-54,.4,1.5],['daisy',99.7,-52,.35,2.5],['hbush1',91.5,-58.8,.9,0],['hbush2',100.5,-58.8,.9,1.2]].map(([k,x,y,...r])=>[k,RX(x),/^(daisy|tulip|rose|sunflower|lily|hbush)/.test(k)?y+NORTHY:RY(y),...r]).concat([['sitlog',LOG[0],LOG[1],.5,.4+wa(LOG[0]-CF.x,LOG[1]-CF.y)-wa(-1.5,-.9)]]),false,false); PARK.sitlog=[X(LOG[0]),Z(LOG[1])];
    for(const [x,y,m] of [[RX(90),RY(-41.5),3.2],[RX(102),RY(-41.5),2.6]]){ const r=.35*m/.84*.2; SOL.up.push([X(x)-r,Z(y)-r,X(x)+r,Z(y)+r]); FIX.up.push([X(x)-r,Z(y)-r,0,X(x)+r,Z(y)+r,m/.84*TILE]); } }
  const LP=[]; { const [cx,cy]=P.round; for(let y=P.y0+4;y<P.y1-2;y+=13)if(Math.abs(y-cy)>9){ let v=y; while(BK.wet(cx+wobX(v)+(LP.length%2?4.2:-4.2),v,.8))v+=1.5; LP.push([cx+wobX(v)+(LP.length%2?4.2:-4.2),v]); } for(let x=P.x0+6;x<P.x1-4;x+=16)if(Math.abs(x-cx)>9){ let u=x; while(BK.wet(u,cy+wobY(u)+(LP.length%2?4.2:-4.2),.8))u+=1.5; LP.push([u,cy+wobY(u)+(LP.length%2?4.2:-4.2)]); } LP.push(...FOUNT.S.lamps); for(const [a,b] of [[-1,-1],[1,-1],[1,1],[-1,1]]){ const x=cx+a*4.2, y=cy+b*4.2; LP.push([x+wobX(y),y+wobY(x)]); } }
  for(const [x,y] of LP){ const h0=170, h1=179, w=.17; BATCH.tag=OBJ('park','park lamp'); block(x-.07,y-.07,x+.07,y+.07,0,h0,31,()=>[40,40,44]); block(x-w-.04,y-w-.04,x+w+.04,y+w+.04,h1,h1+3,35,()=>[48,46,44]);
    for(const [a,b,c,d] of [[[X(x-w),Y(h0),Z(y+w)],[X(x+w),Y(h0),Z(y+w)],[X(x+w),Y(h1),Z(y+w)],[X(x-w),Y(h1),Z(y+w)]],[[X(x+w),Y(h0),Z(y-w)],[X(x-w),Y(h0),Z(y-w)],[X(x-w),Y(h1),Z(y-w)],[X(x+w),Y(h1),Z(y-w)]],
        [[X(x-w),Y(h0),Z(y-w)],[X(x-w),Y(h0),Z(y+w)],[X(x-w),Y(h1),Z(y+w)],[X(x-w),Y(h1),Z(y-w)]],[[X(x+w),Y(h0),Z(y+w)],[X(x+w),Y(h0),Z(y-w)],[X(x+w),Y(h1),Z(y-w)],[X(x+w),Y(h1),Z(y+w)]]])
      BOD.bq(a,b,c,d,BOD.faceTex(9,9,(i,j)=>i<1||i>7||j<1||j>7?[48,46,44]:[255,236,190,1]),'G');
    const L=new THREE.PointLight(new THREE.Color(1,.86,.62),24,12*TILE,1.6); L.position.set(X(x),Y(h0+4),Z(y)); L.userData.i0=L.intensity; scene.add(L); lamps.push(L);
    SOL.up.push([X(x-.1),Z(y-.1),X(x+.1),Z(y+.1)]); FIX.up.push([X(x-.1),Z(y-.1),0,X(x+.1),Z(y+.1),Y(h0)]); } BATCH.tag=null;
  const sol=(x0,y0,x1,y1,h)=>{ SOL.up.push([X(x0),Z(y0),X(x1),Z(y1)]); FIX.up.push([X(x0),Z(y0),0,X(x1),Z(y1),Y(h)]); };
  for(const [x0,y0,x1,y1] of RUNS)sol(x0,y0,x1,y1,WH); for(const [,,x0,y0,x1,y1] of PIERS)sol(x0-.14,y0-.14,x1+.14,y1+.14,PH+18);
  FOUNT.paint({flat,X,Z,Y,hash,grain,speck});
  BATCH.cast=true; BATCH.build((k,map,emap)=>new THREE.MeshLambertMaterial({map,emissiveMap:emap||null,emissive:emap?new THREE.Color(1,1,1):new THREE.Color(0,0,0),alphaTest:.5,side:THREE.DoubleSide})); BATCH.cast=false;
  MODS.park={BOUND:{x0:X(P.x0+.3),x1:X(P.x1-.3),z0:Z(P.y0),z1:Z(P.y1-.3)},inside:()=>false}; });
