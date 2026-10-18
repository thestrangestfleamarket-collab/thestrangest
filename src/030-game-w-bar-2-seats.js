  const leather=(c,u,v,s)=>{ const n=pcVn(u,v,s); return n>.78?DP.redH:n>.62?DP.redL:n<.18?DP.redD:c; };
  function sofa(x,y){ PNAME='sofa'; const D=.92, L=2.2, x1=x+D, y1=y+L, bs=[], R=DP.red;
    const lf=(seed)=>(s,a,row,Lf,h)=>row<2?DP.redL:row>h-3?DP.redK:leather(R,a/9,row/9,seed);
    bs.push(fb(x+.08,y+.22,x1,y1-.22,0,6,DP.redD,(s,a,row)=>row<1?DP.red:DP.redK,DP.redD,{foot:1}));
    for(const [a,b] of [[y+.24,y+L/2],[y+L/2,y1-.24]])bs.push(fb(x+.3,a+.01,x1-.02,b-.01,6,14,R,lf(81),(X,Y)=>{ const e=edge(X,Y,x+.3,a,x1-.02,b); return e<.04?DP.redL:leather(R,X*9,Y*9,82); }));
    bs.push(fb(x,y+.22,x+.32,y1-.22,0,27,R,(s,a,row,Lf,h)=>{ if(row<2)return DP.redH; if(row<6)return DP.redL; if(row<8)return DP.redD;
        if(row<h-14&&(a%16===8&&row%16===12))return DP.redK; if(row<h-14&&((a+8)%16<1||((a%16)-8)**2+((row%16)-12)**2<5&&(a%16)!==8))return DP.redD; return row>h-4?DP.redK:leather(R,a/7,row/7,83); },
      (X,Y)=>(X-x)>.24||(X-x)<.06?DP.redL:DP.redH,{foot:1}));
    for(const [a,b] of [[y,y+.24],[y1-.24,y1]])bs.push(fb(x,a,x1,b,0,20,R,(s,a2,row,Lf,h)=>row<3?DP.redL:row<5?DP.redH:(s==='px'&&Math.hypot(a2-Lf/2,row-11)<8)?(Math.hypot(a2-Lf/2,row-11)<6?DP.redL:DP.redD):row>h-3?DP.redK:leather(R,a2/9,row/9,86),
      (X,Y)=>Math.abs(Y-(a+b)/2)<.05?DP.redH:DP.redL,{foot:1}));
    return prop(bs); }
  function armchair(x,y){ PNAME='armchair'; const R0=.47, Ri=.3, cx=x+.47, cy=y+.475, bs=[], C=DP.red;
    const fs=(X0,Y0)=>(s,a,row,Lf,h)=>{ const nx=s==='px'?1:s==='nx'?-1:0, ny=s==='py'?1:s==='ny'?-1:0, inner=(X0-cx)*nx+(Y0-cy)*ny<0, ang=Math.floor((Math.atan2(Y0-cy,X0-cx)+3.2)*R0*S);
      if(row<2)return DP.redH; if(row<4)return DP.redL; if(row>h-3)return DP.redK; if(inner)return ang%9<2?DP.redD:ang%9<4?DP.redL:C; return leather(C,ang/8,row/8,94); };
    for(let Y=cy-R0;Y<cy+R0-1e-6;Y+=.04){ const m=Y+.02-cy, ox=Math.sqrt(Math.max(0,R0*R0-m*m)), ix=Math.abs(m)<Ri?Math.sqrt(Ri*Ri-m*m):null, xf=Math.min(cx+ox,cx+.42);
      const segs=ix!=null?[[cx-ox,cx-ix]]:[[cx-ox,cx-ox*.3],[cx-ox*.3,cx+ox*.3],[cx+ox*.3,xf]];
      for(const [a,b] of segs){ if(b-a<.01)continue; const xm=(a+b)/2-cx, h=Math.round(19+10*Math.max(0,-xm/R0));
        bs.push(fb(a,Y,b,Y+.04,0,h,C,fs((a+b)/2,Y+.02),(X,YY)=>DP.redL,{foot:1,nb:1})); } }
    bs.push(fb(cx-.3,cy-Ri+.02,cx+.42,cy+Ri-.02,0,13,C,(s,a,row,L,h)=>row<2?DP.redL:row>h-12?DP.redD:leather(C,a/8,row/8,95),(X,Y)=>{ const e=edge(X,Y,cx-.3,cy-Ri+.02,cx+.42,cy+Ri-.02); return e<.04?DP.redL:leather(C,X*9,Y*9,96); },{foot:1}));
    return prop(bs); }
  const FLH=[3,4,4,3,2,4,3,4];
  const flame=(zz,FL)=>{ if(typeof LIFE==='undefined'||LIFE.mode!==1)return null; const hh=FLH[FL.ph]; if(zz>=hh)return null; return lit(zz<1?[255,236,190]:zz<hh-1?[255,190,74]:[246,128,40]); };
  const tcandle=(cx,cy,z,FL)=>[...round(cx,cy,z,z+4,.07,(dx,dy,zz,top)=>top?lit([236,210,170]):lit(zz<1?[150,30,24]:[214,60,48]),1,.03),pb(cx-.012,cy-.012,cx+.012,cy+.012,z+4,z+5,[30,26,24],{nb:1}),
    {x0:cx-.03,y0:cy-.03,x1:cx+.03,y1:cy+.03,z0:z+5,z1:z+10,c:[255,200,90],foot:0,nb:1,life:1,top:()=>null,fi:(v,zz)=>flame(zz-z-5,FL),fj:(u,zz)=>flame(zz-z-5,FL)}];
  const flick=(p,FL,seed)=>{ p.life=t=>{ FL.ph=Math.floor(hash(Math.floor(t*7),seed,425)*8); }; p.lifeKey=()=>FL.ph; };
  function table(x,y,k){ PNAME='round table'; const bs=[];
    bs.push(...round(x,y,0,2,.3,(dx,dy,z,top)=>top?DP.blackL:DP.black,1,.04));
    bs.push(pb(x-.05,y-.05,x+.05,y+.05,2,19,DP.black,{nb:1,fj:()=>DP.blackL}));
    bs.push(...round(x,y,19,22,.46,(dx,dy,z,top)=>{ const r=Math.hypot(dx,dy); if(top)return r>.42?DP.woodL:pcVn(dx*12,dy*12,91)<.3?DP.woodD:DP.wood; return z>2?DP.woodL:DP.woodD; },1,.04));
    if(k)bs.push(pb(x+.08,y-.12,x+.16,y-.04,22,27,[200,224,214],{nb:1,top:()=>[200,170,90]}),pb(x-.18,y+.06,x-.04,y+.2,22,23,DP.white,{top:(X,Y)=>Math.hypot(X-(x-.11),Y-(y+.13))<.03?DP.ink:DP.white}));
    const FL={ph:0}; bs.push(...tcandle(x+.16,y+.16,22,FL)); const p=prop(bs); flick(p,FL,Math.round(x*7+y*13)); LAMPS.push({own:1,room:1,day:true,x,y,z:30,r:2.4,c:[.72,.4,.15],prop:p}); return p; }
  function rug(x,y,L,W){ PNAME='rug'; const x1=x+L, y1=y+W;
    return prop([pb(x,y,x1,y1,0,.5,DP.rug,{foot:1,top:(X,Y)=>{ const e=edge(X,Y,x,y,x1,y1); if(e<.03)return DP.rugD; if(e<.14&&e>.1)return DP.rugD; const n=hash(Math.floor(X*48),Math.floor(Y*48),92); return n<.12?DP.rugD:n>.94?DP.rugL:pcVn(X*4,Y*4,93)<.25?sh(DP.rug,.92):DP.rug; },fi:()=>DP.rugD,fj:()=>DP.rugD})],null,{walk:true,flat:true}); }

  const LEAF=[[24,60,34],[36,84,44],[56,110,56],[86,140,70],[20,44,28]];
  function leavesArt(Wp,Hp,seed,n,len,droop,z0f){ return pic(Wp,Hp,put=>{ const cx=Wp/2;
    for(let i=0;i<n;i++){ const s=hash(i,seed,94)*2-1, side=Math.sign(s)||1, el=.25+hash(i,seed,95)*1.15, L=len*(.55+.45*hash(i,seed,96)), base=Hp*(z0f+(1-z0f)*hash(i,seed,97)*.25);
      for(let t=0;t<1;t+=.004){ const d=side*Math.cos(el)*L*t*(.3+.7*Math.abs(s)), h=Math.sin(el)*L*t-droop*L*t*t*(1.2-el*.4), X=cx+d, Y=base-h, w=Math.max(.6,2.4*(1-t));
        for(let o=-w;o<=w;o+=.5){ const c=LEAF[Math.min(4,Math.floor((1-t*.4)*2+hash(i,seed,98)*2+(o>0?1:0)))]; put(X,Y+o,t>.92&&o>0?LEAF[4]:c); } } } }); }
  function plant(x,y,big){ PNAME=big?'potted palm':'potted plant'; const r=big?.36:.28, ph=big?20:24, Hp=big?220:190, Wp=big?160:110, bs=[];
    bs.push(...round(x,y,0,ph,z=>r*(.78+.22*z/ph)+(z>ph-2?.03:0),(dx,dy,z,top)=>top?(Math.hypot(dx,dy)>r-.02?DP.potL:DP.soil):z>ph-2?DP.potL:Math.atan2(dy,dx)>1.4?DP.potL:z<2?DP.potD:big?DP.pot:[184,176,160],2,.04));
    if(big)bs.push(...round(x,y,0,1.5,r+.08,(dx,dy,z,top)=>top?DP.potL:DP.potD,1.5,.05));
    bs.push(pb(x-.03,y-.03,x+.03,y+.03,ph,ph+(big?30:14),[90,70,40],{nb:1}));
    const A=[0,1,2,3].map(k=>leavesArt(Wp,Hp,k*13+(big?1:7),big?26:20,big?Hp*.55:Hp*.62,big?.55:.25,.12)), Wt=Wp/S, zt=ph+(big?18:4)+Hp/H*.12;
    const pane=(k,alongX)=>{ const L2=Wt/2; return fb(alongX?x-L2:x-.004,alongX?y-.004:y-L2,alongX?x+L2:x+.004,alongX?y+.004:y+L2,zt+Hp/H*.12-Hp/H,zt+Hp/H*.12,LEAF[2],(s,a,row)=>{ const ff=(s==='nx'||s==='ny')?A[k]((Wp-1-a),row):A[k](a,row); return ff||null; },()=>null,{nb:1}); };
    bs.push(pane(0,true),pane(1,false),pane(2,true),pane(3,false));
    bs[bs.length-2].x0+=.01; bs[bs.length-2].x1+=.01; bs[bs.length-1].y0+=.01; bs[bs.length-1].y1+=.01;
    return prop(bs,null,{solids:[{x0:x-r,y0:y-r,x1:x+r,y1:y+r}]}); }

