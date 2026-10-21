SHARED.BOD.streetSigns=()=>{ const X=SHARED.BOD.XS, Z=SHARED.BOD.ZS, V3=THREE.Vector3, R=48/TILE, h3=(a,b,c)=>{ const v=Math.sin(a*12.9898+b*78.233+c*37.719)*43758.5453; return v-Math.floor(v); };
  const F5={A:'ehhvhhh',B:'uhhuhhu',C:'ehggghe',D:'uhhhhhu',E:'vgguggv',F:'vgguggg',G:'ehgnhhf',H:'hhhvhhh',I:'e44444e',K:'hikokih',L:'ggggggv',M:'hrllhhh',N:'hpljhhh',O:'ehhhhhe',
    P:'uhhuggg',R:'uhhukih',S:'fgge11u',T:'v444444',U:'hhhhhhe',V:'hhhhha4',W:'hhhllla',Y:'hha4444',X:'hha4ahh',0:'ehjlphe',1:'4c4444e',2:'eh1248v',3:'v2421he',5:'vgu11he',6:'68guhhe',8:'ehhehhe','-':'000e000'};
  const gl=(s,i,j,sc=1)=>{ if(i<0||j<0)return false; i=Math.floor(i/sc); j=Math.floor(j/sc); const g=F5[s[Math.floor(i/6)]]; return !!g&&i%6<5&&j<7&&!!(parseInt(g[j],32)>>(4-i%6)&1); }, gw=(s,sc=1)=>(s.length*6-1)*sc;
  const tx=(s,W,top,sc=1)=>(i,j)=>gl(s,i-Math.floor((W-gw(s,sc))/2),j-top,sc);
  const arrow=(W,cy,d)=>(i,j)=>{ const x0=Math.floor(W*.22), x1=W-1-x0, dy=Math.abs(j-cy); if(i<x0||i>x1)return false; if(d>=0&&i>x1-4)return dy<=x1-i; if(d<=0&&i<x0+4)return dy<=i-x0; return dy<=1; };
  const WH=[238,238,230], RED=[200,34,38], BK=[22,22,24], GN=[18,98,60], GALV=[150,154,158], RUST=[128,66,34], EDGE=[112,116,120];
  const mix=(a,b,k)=>[a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,a[2]+(b[2]-a[2])*k];
  const wear=(base,s,o={})=>(i,j,W,H)=>{ if(o.round!==false&&Math.min(i,W-1-i)+Math.min(j,H-1-j)<2)return null; let c=base(i,j,W,H); if(!c)return null; const r=h3(i,j,s);
    if(c===RED)c=mix(c,[232,176,166],[0,.22,.4][Math.floor(h3(s,7,1)*3)]); else if(c===GN)c=mix(c,[86,140,110],[0,.25][Math.floor(h3(s,8,1)*2)]);
    if(o.edge!==false&&(i===0||j===0))c=mix(c,[255,255,255],.3); else if(o.edge!==false&&(i===W-1||j===H-1))c=mix(c,[0,0,0],.3);
    const bx=Math.floor(W/2)-1; for(const by of o.bolts?[3,H-5]:[]){ if((i===bx||i===bx+1)&&(j===by||j===by+1))return i===bx&&j===by?[206,208,210]:[84,86,90];
      const L=2+Math.floor(h3(s,by,3)*6); if(i===bx+(h3(s,by,4)<.5?0:1)&&j>by+1&&j<=by+1+L)c=mix(c,RUST,j<=by+1+L/2?.75:.4); }
    for(let k=0;k<2;k++){ if(h3(s,k,9)>(k?.25:.6))continue; const sx=Math.floor(h3(s,k,10)*(W-9)), sy=Math.floor(h3(s,k,11)*(H-7)), ty=Math.floor(h3(s,k,12)*3), sw=ty===2?8:6, sh=ty===2?5:5;
      if(i>=sx&&i<sx+sw&&j>=sy&&j<sy+sh){ if(ty===0)return (j-sy)%2&&i>sx&&i<sx+sw-1?[40,40,48]:[236,232,220]; if(ty===1)return i===sx+2&&j===sy+2?[30,30,30]:[[230,196,40],[60,120,200],[220,90,150]][k];
        if(h3(i,j,s+5)<.65)c=[214,206,190]; } }
    if(h3(s,13,1)<.3){ const tx0=Math.floor(h3(s,14,1)*(W*.5)), ty0=Math.floor(H*.3+h3(s,15,1)*H*.5); if(i>=tx0&&i<tx0+Math.min(20,W*.45)&&j===ty0+Math.round(2.2*Math.sin(i*.8+s)))c=h3(s,16,1)<.5?[28,28,34]:[196,200,206]; }
    if(r<.035)c=mix(c,[60,56,50],.3); if(j>=H-3&&j<H-1&&r<.5)c=mix(c,[90,84,72],.18);
    const d=i+j*.9-W*.3; if(i<W*.6&&j<H*.6&&(d>=0&&d<1.6||d>=3.2&&d<4))c=mix(c,[255,255,255],.38);
    return c.map(v=>v*(.95+.08*r)); };
  const back=s=>wear((i,j,W,H)=>W>40&&gl('NYC DOT',i-Math.floor((W-gw('NYC DOT'))/2),j-(H-12))?[118,122,126]:GALV,s+50,{bolts:1});
  const quad=(p,t)=>SHARED.BOD.bq(p[0].toArray(),p[1].toArray(),p[2].toArray(),p[3].toArray(),t,'L');
  const tex=(w,h,f)=>{ const W=Math.max(1,Math.round(w*R)), H=Math.max(1,Math.round(h*R)); return SHARED.BOD.faceTex(W,H,(i,j)=>f(i,j,W,H)); };
  const ob=(c,a,u,n,P,off=0,FW=0)=>{ '@later'; const A=a.length()*2, U=u.length()*2, N=n.length()*2, q=(x,y,z)=>c.clone().addScaledVector(a,x).addScaledVector(u,y).addScaledVector(n,z), FR=P('f'), BA=P('b');
    quad([q(-1,-1,1),q(1,-1,1),q(1,1,1),q(-1,1,1)],tex(A,U,FW?(i,j,W,H)=>FR(i+off,j,FW,H):FR));
    quad([q(1,-1,-1),q(-1,-1,-1),q(-1,1,-1),q(1,1,-1)],tex(A,U,FW?(i,j,W,H)=>BA(i+FW-off-W,j,FW,H):BA));
    quad([q(1,-1,1),q(1,-1,-1),q(1,1,-1),q(1,1,1)],tex(N,U,P('s'))); quad([q(-1,-1,-1),q(-1,-1,1),q(-1,1,1),q(-1,1,-1)],tex(N,U,P('s'))); quad([q(-1,1,1),q(1,1,1),q(1,1,-1),q(-1,1,-1)],tex(A,N,P('t'))); };
  const frame=(x,y,n,s)=>{ '@later'; const lean=h3(s,1,2)<.25?.03+.04*h3(s,2,3):0, la=h3(s,3,4)*6.28, L=new V3(Math.cos(la)*lean,1,Math.sin(la)*lean).normalize(), N=new V3(n[0],0,n[1]), A=new V3().crossVectors(L,N).normalize();
    N.crossVectors(A,L).normalize(); const B=new V3(X(x),0,Z(y)); return {B,L,N,A,s,at:z=>B.clone().addScaledVector(L,z*ZU)}; };
  const PW=.075*TILE, PD=.05*TILE, T=.03*TILE;
  const post=(S,top,round)=>{ '@later'; const s=S.s, fl=h3(s,20,1)<.4?42+Math.floor(h3(s,21,1)*20):-99;
    ob(S.at(top/2),S.A.clone().multiplyScalar(PW/2),S.L.clone().multiplyScalar(top*ZU/2),S.N.clone().multiplyScalar(PD/2),k=>k==='t'?()=>[96,100,104]:k==='s'?(i,j,W,H)=>H-j<H*.05?RUST:[118,122,126]:(i,j,W,H)=>{ const z=(H-1-j)/H*top, r=h3(i,j,s);
      if(z<top*.05)return r<.6?RUST:[96,86,72]; if(z>fl&&z<fl+7)return (Math.floor(z)%2&&r<.7)?[60,60,66]:[226,222,208]; if(!round&&i===Math.floor(W/2)&&j%4===0)return [40,42,46]; return round&&i===0?[176,180,184]:GALV.map(v=>v*(.93+.1*r)); }); };
  const plate=(S,side,z0,z1,w,front,o={})=>{ '@later'; const n=S.N.clone().multiplyScalar(side), a=S.A.clone().multiplyScalar(side), h=(z1-z0)*ZU, c=S.at((z0+z1)/2).addScaledVector(n,o.on?0:PD/2+T/2+.004*TILE), FW=Math.round(w*R);
    const b=o.bend||0, a2=a.clone().multiplyScalar(Math.cos(b)).addScaledVector(n,Math.sin(b)), n2=n.clone().multiplyScalar(Math.cos(b)).addScaledVector(a,-Math.sin(b)), u=S.L.clone().multiplyScalar(h/2), BK_=o.both?front:back(S.s+side);
    const P=k=>k==='f'?front:k==='b'?BK_:()=>EDGE, H0=Math.round(w/2*R);
    ob(c.clone().addScaledVector(a,-w/4),a.clone().multiplyScalar(w/4),u,n.clone().multiplyScalar(T/2),P,0,FW); ob(c.clone().addScaledVector(a2,w/4),a2.clone().multiplyScalar(w/4),u,n2.clone().multiplyScalar(T/2),P,H0,FW); };
  const nopark=(s,dir)=>{ '@later'; const v=Math.floor(h3(s,30,1)*3);
    return wear((i,j,W,H)=>{ if(i===1||j===1||i===W-2||j===H-2)return RED;
      if(v===1){ const cx=(W-1)/2, cy=18, r=Math.hypot(i-cx,j-cy); if(r>10.5&&r<13.5||r<13.5&&Math.abs((i-cx)+(j-cy))*.7<1.3)return RED; if(r<10.5)return tx('P',W,cy-7,2)(i,j)?BK:WH;
        return tx('8AM-6PM',W,36)(i,j)||arrow(W,50,dir)(i,j)?RED:WH; }
      const L=v===0?[['NO',4,2],['PARKING',20,1],['8AM-6PM',30,1],['EXC SUN',39,1]]:[['NO',4,2],['STANDING',20,1],['ANYTIME',31,1]];
      for(const [t,y,sc] of L)if(tx(t,W,y,sc)(i,j))return RED; return arrow(W,v===0?51:45,dir)(i,j)?RED:WH; },s,{bolts:1}); };
  const speed=s=>wear((i,j,W,H)=>{ if(i===2||j===2||i===W-3||j===H-3||i===3||j===3||i===W-4||j===H-4)return BK; for(const [t,y,sc] of [['SPEED',9,2],['LIMIT',27,2],['25',50,5]])if(tx(t,W,y,sc)(i,j))return BK; return WH; },s,{bolts:1});
  const stop=s=>wear((i,j,W,H)=>{ const x=Math.abs(i-(W-1)/2)/((W-1)/2), y=Math.abs(j-(H-1)/2)/((H-1)/2); if(x+y>1.42)return null; if(x>.9||y>.9||x+y>1.3)return WH; return tx('STOP',W,Math.floor((H-14)/2),2)(i,j)?WH:RED; },s,{bolts:1,round:false,edge:false});
  const blade=(t,s)=>wear((i,j,W,H)=>{ if(i===1||j===1||i===W-2||j===H-2)return WH; return tx(t,W,Math.floor((H-14)/2),2)(i,j)?WH:GN; },s);
  const zT=5.6*TILE/.84/ZU;
  BATCH.tag=OBJ('street','street signs');
  SHARED.BOD.signs.forEach((g,k)=>{ '@later'; const {x,y}=g, s=k*7.31+1.7, bend=h3(s,40,1)<.22?(h3(s,41,1)<.5?-1:1)*(.12+.12*h3(s,42,1)):0;
    if(g.kind==='name'){ const S=frame(x,y,[0,1],s), z0=g.np?zT+6:107; if(!g.np)post(S,104,1); ob(S.at(z0-1.5),S.A.clone().multiplyScalar(PW*.7),S.L.clone().multiplyScalar(1.5*ZU),S.N.clone().multiplyScalar(PW*.7),()=>()=>[96,100,104]);
      plate(S,1,z0,z0+18,3.5*TILE,blade(g.ax,s),{on:1,both:1}); ob(S.at(z0+19),S.A.clone().multiplyScalar(PW*.7),S.L.clone().multiplyScalar(ZU),S.N.clone().multiplyScalar(PW*.7),()=>()=>[96,100,104]);
      const S2=frame(x,y,[1,0],s); S2.L=S.L; S2.B=S.B; S2.A=new V3().crossVectors(S.L,S2.N).normalize(); plate(S2,1,z0+20,z0+38,3.5*TILE,blade(g.ay,s+3),{on:1,both:1}); }
    else if(g.kind==='stop'){ const S=frame(x,y,g.n,s); post(S,118); plate(S,-1,74,116,1.6*TILE,stop(s)); }
    else if(g.kind==='nopark'){ const S=frame(x,y,g.n,s); post(S,108); plate(S,1,70,106,1.1*TILE,nopark(s,h3(s,31,1)<.5?0:1),{bend}); plate(S,-1,70,106,1.1*TILE,nopark(s+11,h3(s,31,1)<.5?0:-1)); }
    else if(g.kind==='speed'){ const S=frame(x,y,g.n,s); post(S,124); plate(S,-1,62,122,2*TILE,speed(s),{bend:bend*.6}); } });
  BATCH.tag=null; };
