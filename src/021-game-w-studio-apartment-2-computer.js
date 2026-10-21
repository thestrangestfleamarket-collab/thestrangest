function homeComputer(x,y,f=[0,1]){ SHARED.PNAME='home computer'; const r=rect(x,y,f,3.6,1.4), c=AP.oak, H=30, lit=q=>Object.assign([...q],{e:1});
  const B=[205,194,159], Bl=[222,213,182], Bd=[160,150,120], K=[42,44,47], K2=[58,60,64], Kd=[24,24,27], G=lit([108,94,181]), Gs=lit([100,87,171]), Gl=lit([150,138,214]),
    sl=[150,146,132], on=lit([90,200,96]), cap=[192,184,162], capD=[150,144,126], gap=[96,90,76], paper=[214,208,192], ink=[120,116,104], red=[150,60,52], yel=[228,208,98], pch=[232,160,110];
  const dr=(s,t,z,len)=>{ const k=wood(45,c,t,z,len); if(s!=='f')return k; const q=(z-2)%9; if(t>.72&&q<1)return sh(k,.6); return k; };
  const part=(t0,t1,d0,d1,z0,z1,col,P={})=>{ const w=(t1-t0)*r.W*FP, d=(d1-d0)*r.D*FP, pic=(W,Hh,dr)=>{ const W2=Math.max(1,Math.round(W)), H2=Math.max(1,Math.round(Hh)); return {W2,H2,a:art(W2,H2,put=>dr(put,W2,H2))}; };
    const F={}; for(const k of ['f','b','r','l'])if(P[k])F[k]=pic(k==='f'||k==='b'?w:d,z1-z0,P[k]); F.l=F.l||F.r; const T=P.t&&pic(w,d,P.t), cl=v=>v<0?0:v>.9999?.9999:v;
    return fb(r,t0,t1,d0,d1,H+z0,H+z1,col,(s,t,z)=>{ const p=F[s]; if(!p)return col; const u=s==='f'||s==='r'?1-t:t; return p.a(Math.floor(u*p.W2),Math.max(0,Math.min(p.H2-1,Math.floor((z1-z0-z)*p.H2/(z1-z0)))))||col; },
      T?(t,dd)=>T.a(Math.floor(cl((t-t0)/(t1-t0))*T.W2),Math.floor(cl(1-(dd-d0)/(d1-d0))*T.H2))||col:null,{foot:1}); };
  const bx=(put,x0,y0,x1,y1,c)=>{ for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)put(x,y,c); };
  const shell=(put,W,Hh,c=B)=>{ bx(put,0,0,W-1,Hh-1,c); bx(put,0,0,W-1,0,Bl); bx(put,0,Hh-1,W-1,Hh-1,Bd); };
  const monF=(put,W,Hh)=>{ shell(put,W,Hh); bx(put,0,0,0,Hh-2,Bl); bx(put,W-1,1,W-1,Hh-1,Bd); bx(put,2,2,W-3,Hh-4,K); bx(put,3,2,W-4,2,K2); bx(put,2,3,2,Hh-5,K2);
    for(const [a,b] of [[2,2],[W-3,2],[2,Hh-4],[W-3,Hh-4]])put(a,b,B);
    bx(put,4,4,W-12,19,Kd); bx(put,5,5,W-13,18,G); for(let y=6;y<=18;y+=2)bx(put,5,y,W-13,y,Gs);
    for(const [a,b] of [[5,5],[6,5],[5,6],[W-13,5],[W-14,5],[W-13,6],[5,18],[6,18],[5,17],[W-13,18],[W-14,18],[W-13,17]])put(a,b,Kd);
    bx(put,7,6,11,6,Gl); bx(put,6,7,6,9,Gl); put(7,7,Gl);
    bx(put,5,21,9,21,sl); bx(put,11,21,12,21,sl); bx(put,6,23,10,23,sl); bx(put,5,22,9,22,Kd);
    for(const x of [W-15,W-12,W-9]){ bx(put,x,23,x+1,23,[184,178,160]); bx(put,x,24,x+1,24,[110,106,96]); } put(W-6,23,on);
    bx(put,1,Hh-3,W-2,Hh-3,Bd);
    bx(put,0,3,5,9,yel); bx(put,0,9,5,9,[200,180,80]); bx(put,1,5,4,5,[128,110,62]); bx(put,1,7,3,7,[128,110,62]);
    bx(put,0,11,4,15,pch); bx(put,0,15,4,15,[204,136,90]); bx(put,1,12,2,13,[100,64,46]); put(3,12,[120,80,60]); put(3,14,[120,80,60]); };
  const monS=st=>(put,W,Hh)=>{ shell(put,W,Hh); put(0,0,B); bx(put,0,1,0,Hh-1,Bl); bx(put,1,1,1,Hh-1,sh(B,1.04)); const m=Math.round(W*.7); bx(put,m,1,m,Hh-1,Bd); bx(put,m+1,1,m+1,Hh-1,Bl);
    bx(put,2,Hh-9,5,Hh-4,K); bx(put,3,Hh-8,4,Hh-5,B); bx(put,3,Hh-7,4,Hh-7,Kd);
    if(st)for(let j=0;j<6;j++){ const a=5-((j+1)>>1), b=5+((j+1)>>1); for(let x=a;x<=b;x++)put(x,3+j,j===5||x===a||x===b?[70,56,30]:[230,196,64]); }
    if(st){ put(5,5,[70,56,30]); put(5,6,[70,56,30]); } };
  const vent=bk=>(put,W,Hh)=>{ shell(put,W,Hh,sh(B,.95)); for(let y=2;y<Hh*.6;y+=2)bx(put,1,y,W-2,y,gap); if(bk){ bx(put,W/2-4,Hh-7,W/2+3,Hh-3,Bd); bx(put,W/2-3,Hh-6,W/2+2,Hh-6,paper); } };
  const caseF=(put,W,Hh)=>{ shell(put,W,Hh); bx(put,0,1,W-1,1,Bd); bx(put,0,2,W-1,2,Bl);
    bx(put,3,4,18,7,Bd); bx(put,4,5,17,5,Kd); bx(put,4,6,17,6,sh(B,.9)); bx(put,15,7,16,7,K); put(20,5,on);
    bx(put,W-8,4,W-3,7,K); bx(put,W-7,5,W-4,6,K2); put(W-7,5,Bl); put(W-5,5,Bl); };
  const caseS=(put,W,Hh)=>{ shell(put,W,Hh); bx(put,0,1,W-1,1,Bd); bx(put,0,2,W-1,2,Bl); for(let x=W-9;x<W-1;x+=2){ bx(put,x,4,x,Hh-2,Bd); bx(put,x+1,4,x+1,Hh-2,Bl); } };
  const kbF=(put,W,Hh)=>{ shell(put,W,Hh); bx(put,W-9,1,W-5,1,K); put(W-8,1,Bl); put(W-6,1,Bl); };
  const kbT=(put,W,Hh)=>{ bx(put,0,0,W-1,Hh-1,gap); bx(put,0,0,W-1,0,Bd); bx(put,0,Hh-1,W-1,Hh-1,Bl); bx(put,0,0,0,Hh-1,Bd); bx(put,W-1,0,W-1,Hh-1,Bd);
    for(let i=0;i<4;i++){ const y=1+i*2; for(let x=2+i%3;x<W-3;x+=3)bx(put,x,y,x+1,y,i===0||x<4||x>W-7?capD:cap); }
    bx(put,2,9,4,9,capD); bx(put,6,9,8,9,capD); bx(put,11,9,W-13,9,cap); bx(put,W-11,9,W-9,9,capD); bx(put,W-7,9,W-4,9,capD); };
  const fl=[36,36,40], flT=(put,W,Hh)=>{ bx(put,0,0,W-1,Hh-1,fl); bx(put,1,0,W-2,2,paper); bx(put,2,1,W-3,1,red);
    for(let y=3;y<Hh;y++)for(let x=0;x<W;x++){ const q=Math.hypot(x-(W-1)/2,y-5); if(q<.8)put(x,y,[150,150,152]); else if(q<1.9)put(x,y,[70,70,76]); }
    bx(put,4,Hh-2,5,Hh-1,[90,88,84]); };
  const db=[78,82,92], dbF=(put,W,Hh)=>{ shell(put,W,Hh,db); bx(put,0,0,W-1,0,sh(db,1.25)); bx(put,2,1,W-3,4,paper); bx(put,3,2,6,2,red); bx(put,3,3,W-4,3,ink); };
  const dbS=(put,W,Hh)=>{ shell(put,W,Hh,sh(db,.95)); bx(put,0,0,W-1,0,sh(db,1.25)); for(let x=1;x<W-1;x+=2)bx(put,x,2,x,Hh-2,sh(db,.8)); };
  const dbT=(put,W,Hh)=>{ bx(put,0,0,W-1,Hh-1,sh(db,1.15)); const cs=[[44,44,50],red,[60,90,140],[44,44,50],paper]; for(let y=1;y<Hh-1;y++)bx(put,1,y,W-2,y,cs[y%5]); };
  const pd=[52,60,76], pdT=(put,W,Hh)=>{ bx(put,0,0,W-1,Hh-1,sh(pd,.7)); bx(put,1,1,W-2,Hh-2,pd); for(const [a,b] of [[9,0],[9,1],[8,2],[8,3],[9,4]])put(a,b,[26,26,30]); };
  const msT=(put,W,Hh)=>{ bx(put,0,0,W-1,Hh-1,B); put(0,0,Bd); put(W-1,0,Bd); bx(put,0,Hh-3,W-1,Hh-3,Bd); bx(put,2,Hh-2,2,Hh-1,Bd); put(1,1,Bl); put(1,2,Bl); };
  const msF=(put,W,Hh)=>{ bx(put,0,0,W-1,Hh-1,B); bx(put,0,Hh-1,W-1,Hh-1,Bd); put(2,0,Bd); };
  return prop([fb(r,0,1,0,1,H-2,H,c,null,(t,d,X,Y)=>boards(mt('wood',c),X,Y,.45)),fb(r,.02,.08,.05,.95,0,H-2,c,dr),fb(r,.7,.98,.05,.95,0,H-2,c,dr),
    part(.28,.72,.40,.98,0,10,B,{f:caseF,b:(p,W,Hh)=>shell(p,W,Hh,sh(B,.9)),r:caseS,t:(p,W,Hh)=>{ bx(p,0,0,W-1,Hh-1,B); bx(p,0,Hh-1,W-1,Hh-1,Bl); }}),
    part(.31,.69,.44,.84,10,40,B,{f:monF,b:(p,W,Hh)=>shell(p,W,Hh,sh(B,.9)),r:monS(1),l:monS(0),
      t:(p,W,Hh)=>{ shell(p,W,Hh,sh(B,1.04)); bx(p,0,Hh-1,W-1,Hh-1,Bl); const m=Math.round(Hh*.3); bx(p,0,m,W-1,m,Bd); bx(p,0,m+1,W-1,m+1,Bl); }}),
    part(.36,.64,.84,.97,16,36,B,{f:vent(0),b:vent(1),r:vent(0),t:(p,W,Hh)=>{ bx(p,0,0,W-1,Hh-1,sh(B,1.02)); for(let x=2;x<W-2;x+=2)bx(p,x,1,x,Hh-2,gap); }}),
    part(.296,.31,.43,.44,31,37,yel),part(.30,.31,.43,.44,25,29,pch),
    part(.645,.695,.435,.475,38.6,40.8,[176,180,184]),
    part(.19,.71,.04,.38,0,3,B,{f:kbF,b:(p,W,Hh)=>shell(p,W,Hh,sh(B,.9)),t:kbT}),
    part(.045,.155,.08,.36,0,1,fl,{t:flT}),part(.77,.92,.52,.84,0,6,db,{f:dbF,r:dbS,b:dbS,t:dbT}),
    part(.755,.975,.04,.44,0,1,pd,{t:pdT}),part(.83,.885,.12,.30,1,4,B,{t:msT,f:msF})],null,{opts(){ return typeof compOpts==='function'?compOpts(this):[]; }}); }
