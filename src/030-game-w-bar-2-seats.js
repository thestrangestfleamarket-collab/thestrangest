  
  
  
  const FLH=[3,4,4,3,2,4,3,4];
  const flame=(zz,FL)=>{ if(typeof LIFE==='undefined'||LIFE.mode!==1)return null; const hh=FLH[FL.ph]; if(zz>=hh)return null; return lit(zz<1?[255,236,190]:zz<hh-1?[255,190,74]:[246,128,40]); };
  const tcandle=(cx,cy,z,FL)=>[...round(cx,cy,z,z+4,.07,(dx,dy,zz,top)=>top?lit([236,210,170]):lit(zz<1?[150,30,24]:[214,60,48]),1,.03),pb(cx-.012,cy-.012,cx+.012,cy+.012,z+4,z+5,[30,26,24],{nb:1}),
    {x0:cx-.03,y0:cy-.03,x1:cx+.03,y1:cy+.03,z0:z+5,z1:z+10,c:[255,200,90],foot:0,nb:1,life:1,top:()=>null,fi:(v,zz)=>flame(zz-z-5,FL),fj:(u,zz)=>flame(zz-z-5,FL)}];
  const flick=(p,FL,seed)=>{ p.life=t=>{ FL.ph=Math.floor(hash(Math.floor(t*7),seed,425)*8); }; p.lifeKey=()=>FL.ph; };
  function table(x,y,k){ SHARED.PNAME='round table'; const bs=[];
    bs.push(...round(x,y,0,2,.3,(dx,dy,z,top)=>top?DP.blackL:DP.black,1,.04));
    bs.push(pb(x-.05,y-.05,x+.05,y+.05,2,19,DP.black,{nb:1,fj:()=>DP.blackL}));
    bs.push(...round(x,y,19,22,.46,(dx,dy,z,top)=>{ const r=Math.hypot(dx,dy); if(top)return r>.42?DP.woodL:pcVn(dx*12,dy*12,91)<.3?DP.woodD:DP.wood; return z>2?DP.woodL:DP.woodD; },1,.04));
    if(k)bs.push(pb(x+.08,y-.12,x+.16,y-.04,22,27,[200,224,214],{nb:1,top:()=>[200,170,90]}),pb(x-.18,y+.06,x-.04,y+.2,22,23,DP.white,{top:(X,Y)=>Math.hypot(X-(x-.11),Y-(y+.13))<.03?DP.ink:DP.white}));
    const FL={ph:0}; bs.push(...tcandle(x+.16,y+.16,22,FL)); const p=prop(bs); flick(p,FL,Math.round(x*7+y*13)); LAMPS.push({own:1,room:1,day:true,x,y,z:30,r:2.4,c:[.72,.4,.15],prop:p}); return p; }
  

  
  
  

