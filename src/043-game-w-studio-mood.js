(()=>{ const {FP,AP,rect,sub,fb,worn,wood}=STUDIO.kit, ONZ=STUDIO.kit.z, lit=q=>Object.assign([...q],{e:1});
function venetian(x,y,f=[0,1],up=0){ '@later'; SHARED.PNAME=up?'venetian blinds, up':'venetian blinds'; const r=rect(x,y,f,1.16,.05), c=[222,214,196], B=[];
  const slat=(s,t,z)=>mt('frame',z<1?sh(c,.66):z<2?sh(c,.9):sh(c,1.04+.05*hash(Math.floor(t*40),3,421)));
  if(up)B.push(fb(r,0,1,0,1,80,92,c,(s,t,z)=>mt('frame',z%2<1?sh(c,.74):c),()=>sh(c,1.05),{foot:1}),fb(r,.9,.92,-1,0,44,80,[200,196,184],null,null,{foot:1}));
  else{ for(let z=44;z<91;z+=4)B.push(fb(r,0,1,0,1,z,z+3,c,slat,()=>sh(c,1.12),{foot:1}));
    B.push(fb(r,0,1,0,1,41,43,sh(c,.9),null,null,{foot:1}),fb(r,.9,.92,-1,0,58,91,[200,196,184],null,null,{foot:1})); }
  B.push(fb(r,-.01,1.01,-.3,1,92,95,[176,168,150],null,null,{foot:1}));
  return prop(B,null,{high:true,walk:true}); }
function silkCurtains(x,y,f=[0,1],loose=0){ '@later'; SHARED.PNAME=loose?'silk curtains, loose':'silk curtains'; const r=rect(x,y,f,1.96,.07), c=[112,34,58], B=[], gold=[204,164,70];
  const silk=out=>(s,t,z,len)=>{ if(s==='l'||s==='r')return sh(c,.7); if(z<1)return sh(c,.6); const a=(out?1-t:t)*len*FP, k=Math.sin(a*1.7+z*.04);
    return mt('frame',sh(c,k>.7?1.45:k>.2?1.12:k>-.45?.9:.72)); };
  const seg=loose?[]:[[66,100,.19],[54,66,.13],[46,54,.08],[40,46,.11]];
  for(const [z0,z1,w] of seg){ B.push(fb(r,0,w,0,1,z0,z1,c,silk(0),()=>sh(c,.9),{foot:1}),fb(r,1-w,1,0,1,z0,z1,c,silk(1),()=>sh(c,.9),{foot:1})); }
  if(!loose)B.push(fb(r,0,.09,-.2,1,50,52,gold,null,null,{foot:1}),fb(r,.91,1,-.2,1,50,52,gold,null,null,{foot:1}));
  B.push(fb(r,-.03,1.03,.3,.7,100,102,[150,118,60],null,null,{foot:1}),fb(r,-.05,-.02,.2,.8,99,103,gold,null,null,{foot:1}),fb(r,1.02,1.05,.2,.8,99,103,gold,null,null,{foot:1}));
  if(loose){ const s=sub(r,0,1,-2.6,1); B.push({...s,z0:36,z1:101,c:[0,0,0],top:()=>null,fi:()=>null,fj:()=>null,nb:1,foot:1}); }
  const p=prop(B,null,{high:true,walk:true}); if(!loose)return p;
  const rec=CLOTH.sheet('silk panel',{w:.21*1.96*24,h:60,nt:6,nz:13,pin:'top',wall:true,wind:28}), S={}, [cx,cy]=r.at(.5,.5); CLOTH.still(p,cx,cy,70);
  p.lifeDraw=(D,W,H,ox,oy,t,K)=>{ const [lv,fr]=CLOTH.frame(p,rec,t), L=CLOTH.light(p,S,t,cx,cy,70), col=(k,i,j)=>{ const b=.5+.5*Math.sin(i*1.7+j*.3), m=.55*b+.45*k, q=sh(c,m>.72?1.45:m>.5?1.12:m>.32?.9:.72); return [q[0]*L[0],q[1]*L[1],q[2]*L[2]]; };
    for(const side of [0,1])CLOTH.draw(D,W,H,ox,oy,K,rec,lv,fr,(a,d,z)=>{ const [x,y]=r.at(side?1-.21+a/(1.96*24):a/(1.96*24),.5-d/(.07*24)); return [x,y,100-z]; },col); };
  return p; }
const leafC=(u,d)=>{ const h=hash(u,d,411); return h<.25?[38,78,36]:h<.65?[56,108,46]:h<.9?[78,138,60]:[118,170,84]; };
function ivyPx(u,d,long){ '@later'; if(d<4)return hash(u,d,405)<.8?leafC(u,d):null;
  const g=Math.floor(u/4), L=(long?14:8)+Math.floor(hash(g,3,403)*(long?52:34)); if(hash(g,7,401)>.5||d>=L)return null;
  const cx=g*4+1+Math.round(1.2*Math.sin(d/5+g*1.7)); if(u===cx)return hash(u,d,407)<.5?[66,74,40]:leafC(u,d);
  const side=Math.floor((d+g*3)/4)%2?1:-1; return (d+g*3)%4<3&&(u-cx)*side>0&&Math.abs(u-cx)<=2&&hash(u,d,409)<.85?leafC(u,d):null; }
function ivy(x,y,f=[0,1],long=0){ '@later'; SHARED.PNAME=long?'trailing ivy, long':'trailing ivy'; const r=rect(x,y,f,2.35,.05), Z0=long?60:76, Z1=126;
  return prop([fb(r,0,1,0,1,Z0,Z1,[56,108,46],(s,t,z,len)=>s==='f'?ivyPx(Math.floor(t*len*FP),Math.floor(Z1-Z0-1-z),long):null,()=>null,{foot:1,nb:1})],null,{high:true,walk:true}); }
const FLH=[3,4,4,3,2,4,3,4];
function candle(r,t,d,z,h,i,FL){ '@later'; const w=[234,224,200];
  return [fb(r,t-.05,t+.05,d-.05,d+.05,z,z+h,w,(s,tt,zz)=>zz>h-2?sh(w,.86):hash(Math.floor(tt*9),Math.floor(zz),423+i)<.12?sh(w,1.06):sh(w,.97),()=>[200,186,160],{foot:1}),
    fb(r,t-.012,t+.012,d-.012,d+.012,z+h,z+h+1,[30,26,24],null,null,{foot:1}),
    fb(r,t-.03,t+.03,d-.03,d+.03,z+h+1,z+h+6,[255,200,90],(s,tt,zz)=>{ if(LIFE.mode!==1)return null; const ph=(FL.ph+i*3)%8, hh=FLH[ph]; if(zz>=hh)return null;
      if(ph%3===1&&zz>=hh-1&&tt<.5)return null; return lit(zz<1?[255,236,190]:zz<hh-1?[255,190,74]:[246,128,40]); },()=>null,{foot:1,nb:1,life:1})]; }
const flicker=(p,FL,seed)=>{ p.life=t=>{ FL.ph=Math.floor(hash(Math.floor(t*7),seed,425)*8); }; p.lifeKey=()=>FL.ph; };
function candles(x,y,f=[0,1],z=ONZ(),n=3){ '@later'; SHARED.PNAME=n===2?'two candles':'candles'; const r=rect(x,y,f,.26,.26), FL={ph:0}, br=[168,132,64];
  const B=[fb(r,.04,.96,.04,.96,z,z+1,br,(s,t,zz)=>sh(br,.8),()=>sh(br,1.1),{foot:1})];
  (n===2?[[.32,.4,9],[.66,.62,6]]:[[.3,.35,10],[.66,.38,7],[.46,.7,5]]).forEach(([t,d,h],i)=>B.push(...candle(r,t,d,z+1,h,i,FL)));
  const p=prop(B); flicker(p,FL,Math.round(x*7+y*13)); LAMPS.push({x,y,z:z+14,r:2.8,c:[.72,.4,.15],own:1,room:1,day:true,prop:p}); return p; }
function patternedRug(x,y,f=[0,1]){ '@later'; SHARED.PNAME='patterned rug'; const r=rect(x,y,f,2.6,3.1), W=2.6*FP, D=3.1*FP, pu=[104,52,98], pd=[64,32,66], gd=[196,150,64], gl=[226,186,96];
  return prop([fb(r,0,1,0,1,0,1,pu,()=>sh(pd,.8),(t,d,X,Y)=>{ const a=t*W, b=d*D; if(b<2||b>D-2)return Math.floor(a)%2?[226,214,184]:null;
    const e=Math.min(a,W-a,b-2,D-2-b), n=hash(Math.floor(X*48),Math.floor(Y*48),427); let q;
    if(e<1)q=pd; else if(e<4)q=(Math.floor(a/2)+Math.floor(b/2))%2?gd:pd; else if(e<5)q=pd;
    else{ const m=Math.abs(a-W/2)/(W/2)+Math.abs(b-D/2)/(D/2);
      q=m<.22?((Math.floor(a/2)+Math.floor(b/2))%3===0?[150,70,96]:[178,110,138]):m<.27?pd:m<.5?((Math.floor(a)%5===2&&Math.floor(b)%5===2)?pd:gd):m<.53?[90,58,36]
        :(Math.round(a+b)%8===0&&Math.round(a-b)%8===0)?gl:pu; }
    return mt('carpet',n<.3?sh(q,.92):n>.94?sh(q,1.08):q); })],null,{walk:true,flat:true}); }
function fig(x,y,f=[0,1]){ '@later'; SHARED.PNAME='fiddle-leaf fig'; const r=rect(x,y,f,.64,.64), pot=[58,60,64], B=[];
  B.push(fb(r,.3,.7,.3,.7,0,11,pot,(s,t,z)=>z>9?sh(pot,1.2):worn(pot,t,z,429),()=>[52,40,30],{foot:1}),fb(r,.47,.53,.47,.53,11,56,[96,78,58],null,null,{foot:1,nb:1}));
  const leaf=(t,d,z,h)=>{ const c=[72,142,58];
    return fb(r,t-.11,t+.11,d-.11,d+.11,z,z+h,c,(s,tt,zz)=>{ const a=(tt-.5)*2, b=(zz/h-.5)*2.1; if(a*a*(b>0?.85:1.3)+b*b>1)return null;
      return Math.abs(a)<.14?[146,192,104]:b>.4?[108,176,80]:b<-.45?[50,104,44]:c; },(tt,dd)=>((tt-.5)**2+(dd-.5)**2)<.2?(Math.abs(tt-.5)<.07?[146,192,104]:[92,160,70]):null,{foot:1,nb:1}); };
  for(const [t,d,z] of [[.22,.3,18],[.78,.28,21],[.2,.74,24],[.8,.72,27],[.5,.12,31],[.1,.5,34],[.9,.5,37],[.5,.88,33],[.3,.42,42],[.7,.58,45],[.62,.3,49],[.38,.7,51],[.5,.5,56]])B.push(leaf(t,d,z,11));
  return prop(B); }
const potC=(u,d)=>{ const h=hash(u,d,451); return h<.2?[52,110,44]:h<.6?[82,148,58]:h<.9?[110,172,70]:[150,196,96]; };
function trailPx(u,d,n,seed){ '@later'; const g=Math.floor(u/4); if(hash(g,1,seed)>.6)return null; const L=6+Math.floor(hash(g,2,seed)*n); if(d>=L)return null;
  const cx=g*4+1+Math.round(Math.sin(d/6+g)); if(u===cx)return [74,96,48]; return (d+g)%5<3&&Math.abs(u-cx)<=(d%5===1?2:1)&&hash(u,d,seed+1)<.8?potC(u,d):null; }
function pothosShelf(x,y,f=[0,1]){ '@later'; SHARED.PNAME='pothos shelf'; const r=rect(x,y,f,.9,.26), Z=66, pine=AP.pine;
  return prop([fb(r,0,1,0,1,Z,Z+2,pine,(s,t,z,len)=>wood(453,pine,t,z,len),null,{foot:1}),fb(r,.1,.15,.4,.9,Z-6,Z,AP.steelD,null,null,{foot:1}),fb(r,.85,.9,.4,.9,Z-6,Z,AP.steelD,null,null,{foot:1}),
    fb(r,.1,.4,.25,.8,Z+2,Z+9,AP.terra,(s,t,z)=>z>6?sh(AP.terra,.8):worn(AP.terra,t,z,455),()=>[52,40,30],{foot:1}),
    fb(r,.04,.46,.15,.9,Z+9,Z+15,[82,148,58],(s,t,z,len)=>hash(Math.floor(t*len*FP),Math.floor(z),457)<.3?null:potC(Math.floor(t*len*FP),Math.floor(z)),(t,d)=>hash(Math.floor(t*12),Math.floor(d*8),459)<.25?null:potC(Math.floor(t*12),Math.floor(d*8)),{foot:1}),
    fb(r,.02,.55,0,.12,Z-34,Z+9,[82,148,58],(s,t,z,len)=>s==='f'?trailPx(Math.floor(t*len*FP),Math.floor(42-z),30,461):null,()=>null,{foot:1,nb:1}),
    ...[[.6,.66,[120,40,40],11],[.67,.72,[40,70,100],10],[.73,.8,[160,130,70],12]].map(([t0,t1,c,h])=>fb(r,t0,t1,.3,.85,Z+2,Z+2+h,c,(s,t,z)=>s==='f'&&z>1&&z<3?[200,170,90]:c,()=>[222,212,188],{foot:1}))],null,{high:true,walk:true}); }
function hangingPothos(x,y,f=[0,1]){ '@later'; SHARED.PNAME='hanging pothos'; const r=rect(x,y,f,.4,.4), Z=74, cord=[214,200,170], iron=[44,40,38], B=[];
  B.push(fb(r,.47,.53,.47,1.38,96,98,iron,null,null,{foot:1,nb:1}),fb(r,.42,.58,1.3,1.38,90,100,iron,null,null,{foot:1,nb:1}),fb(r,.48,.52,.48,.52,93,96,iron,null,null,{foot:1,nb:1}));
  for(const [t,d] of [[.3,.3],[.7,.3],[.5,.72]])B.push(fb(r,t-.02,t+.02,d-.02,d+.02,Z+8,Z+12,cord,null,null,{foot:1,nb:1}));
  B.push(fb(r,.42,.58,.42,.58,Z+12,93,cord,(s,tt,z)=>z%5<1?sh(cord,.8):cord,null,{foot:1,nb:1}),
    fb(r,.28,.72,.28,.72,Z,Z+8,AP.terra,(s,t,z)=>z>6?sh(AP.terra,.8):z%4<1?cord:worn(AP.terra,t,z,463),()=>[52,40,30],{foot:1,nb:1}),
    fb(r,.16,.84,.16,.84,Z+8,Z+14,[110,172,70],(s,t,z,len)=>hash(Math.floor(t*len*FP),Math.floor(z),465)<.25?null:potC(Math.floor(t*len*FP),Math.floor(z)),(t,d)=>hash(Math.floor(t*10),Math.floor(d*10),467)<.2?null:potC(Math.floor(t*10),Math.floor(d*10)),{foot:1,nb:1}),
    fb(r,.12,.88,.12,.88,Z-24,Z+2,[110,172,70],(s,t,z,len)=>trailPx(Math.floor(t*len*FP),Math.floor(26-z),22,469),()=>null,{foot:1,nb:1}));
  return prop(B,null,{high:true,walk:true}); }
function teaTray(x,y,f=[0,1],z=ONZ()){ '@later'; SHARED.PNAME='tea tray'; const r=rect(x,y,f,.38,.28), wd=AP.walnut, wh=[226,228,232], bl=[70,96,150], ST={ph:0};
  const B=[fb(r,0,1,0,1,z,z+1,wd,null,()=>sh(wd,1.15),{foot:1}),
    fb(r,.12,.44,.22,.78,z+1,z+7,wh,(s,t,zz)=>zz>2&&zz<4?bl:zz>5?sh(wh,1.05):wh,()=>sh(wh,1.08),{foot:1}),fb(r,.24,.32,.42,.58,z+7,z+8,bl,null,null,{foot:1}),
    fb(r,.44,.54,.44,.56,z+3,z+6,wh,null,null,{foot:1}),fb(r,.06,.12,.42,.58,z+2,z+6,wh,null,null,{foot:1}),
    fb(r,.58,.86,.3,.7,z+1,z+2,wh,null,()=>sh(wh,1.04),{foot:1}),fb(r,.64,.8,.38,.62,z+2,z+4,wh,null,(t,d)=>Math.min(t,1-t,d,1-d)<.18?wh:[118,66,32],{foot:1}),
    fb(r,.66,.78,.42,.58,z+4,z+13,[200,200,206],(s,t,zz)=>{ if(LIFE.mode!==1)return null; const k=Math.floor(zz+ST.ph), dx=Math.round(Math.sin(k*.8)*1.2);
      return Math.abs(t*3-1.5-dx*.5)<.6&&k%4<2&&hash(k,Math.floor(t*3),431)<.7?[176,176,184]:null; },()=>null,{foot:1,nb:1,life:1})];
  const p=prop(B); p.life=t=>{ ST.ph=Math.floor(t*4)%8; }; p.lifeKey=()=>ST.ph; return p; }
function pegRail(x,y,f=[0,1]){ '@later'; SHARED.PNAME='peg rail with a hat and a bag'; const r=rect(x,y,f,.9,.12), wd=AP.walnut, cv=[196,180,140], sc=[60,90,120];
  return prop([fb(r,0,1,.6,1,62,66,wd,(s,t,z,len)=>wood(433,wd,t,z,len),null,{foot:1}),...[.15,.5,.85].map(t=>fb(r,t-.03,t+.03,0,.6,63,65,sh(wd,1.2),null,null,{foot:1})),
    fb(r,0,.3,0,.7,55,57,[50,44,40],null,null,{foot:1}),fb(r,.05,.25,.1,.6,57,58,[120,40,40],null,null,{foot:1}),fb(r,.05,.25,.1,.6,58,63,[62,54,48],null,()=>[70,62,54],{foot:1}),
    fb(r,.44,.56,.2,.6,36,64,sc,(s,t,z)=>Math.floor(z/3)%2?sc:[190,150,70],null,{foot:1}),
    fb(r,.83,.87,.3,.5,50,64,[170,150,110],null,null,{foot:1}),fb(r,.7,1,.25,.75,30,50,cv,(s,t,z)=>z<1||z>18?sh(cv,.82):hash(Math.floor(t*20),Math.floor(z),435)<.06?sh(cv,.9):cv,null,{foot:1})],null,{high:true,walk:true}); }
function bookStack(x,y,f=[0,1]){ '@later'; SHARED.PNAME='stack of books with a candle'; const r=rect(x,y,f,.42,.32), FL={ph:0}, B=[];
  [[.05,.95,.05,.95,0,3,[92,40,36]],[.1,.92,.1,.9,3,5,[40,60,84]],[.02,.88,.15,.95,5,8,[70,84,52]],[.12,.95,.05,.85,8,10,[150,120,70]],[.1,.85,.12,.88,10,12,[110,44,70]]].forEach(([t0,t1,d0,d1,z0,z1,c],i)=>
    B.push(fb(r,t0,t1,d0,d1,z0,z1,c,(s,t,z)=>s==='b'?(z>=z1-z0-1||z<1?c:sh(c,i%2?1.25:.8)):z<1||z>=z1-z0-1?c:[222,212,188],()=>sh(c,1.08),{foot:1})));
  B.push(...candle(r,.5,.5,12,7,0,FL)); const p=prop(B); flicker(p,FL,Math.round(x*11+y*5)); LAMPS.push({x,y,z:24,r:2.4,c:[.66,.37,.14],own:1,room:1,day:true,prop:p}); return p; }
const BFPICS=new Map();
function bfHouse(x,y,f=[0,1]){ '@later'; SHARED.PNAME='butterfly house'; const r=rect(x,y,f,.64,.44), wd=AP.walnut, net=[70,74,70], fr=[40,38,34], B=[];
  B.push(fb(r,0,1,0,1,24,26,wd,(s,t,z,len)=>wood(437,wd,t,z,len),()=>sh(wd,1.1),{foot:1}),fb(r,.06,.94,.08,.92,6,7,wd,null,null,{foot:1}));
  for(const [t,d] of [[.02,.04],[.92,.04],[.02,.88],[.92,.88]])B.push(fb(r,t,t+.06,d,d+.08,0,24,sh(wd,.85),null,null,{foot:1}));
  B.push(fb(r,.04,.96,.06,.94,26,29,[92,70,48],null,(t,d)=>hash(Math.floor(t*30),Math.floor(d*20),439)<.6?[70,110,52]:[86,64,42],{foot:1}));
  for(const [t,d,z,h,c] of [[.25,.3,29,9,AP.leaf],[.3,.65,29,12,AP.leafD],[.78,.7,29,8,AP.leaf],[.7,.28,29,6,AP.leafD]])
    B.push(fb(r,t-.1,t+.1,d-.12,d+.12,z,z+h,c,(s,tt,zz)=>hash(Math.floor(tt*12),Math.floor(zz),441)<.35?null:hash(Math.floor(tt*12),Math.floor(zz),443)<.3?sh(c,.8):c,()=>sh(c,1.1),{foot:1,nb:1}));
  B.push(fb(r,.48,.52,.45,.55,29,44,[110,84,58],null,null,{foot:1}),fb(r,.36,.6,.47,.53,43,44,[110,84,58],null,null,{foot:1}),
    fb(r,.56,.68,.18,.32,29,31,[236,130,70],null,(t,d)=>Math.hypot(t-.5,d-.5)<.2?[250,214,90]:[236,130,70],{foot:1}));
  const mesh=(s,t,z,len)=>{ const a=Math.floor(t*len*FP); return a<1||a>=Math.floor(len*FP)-1||z<1||z>=26?fr:a%3===0&&Math.floor(z)%3===0?net:null; };
  B.push(fb(r,.03,.97,.05,.95,29,56,fr,mesh,(t,d)=>Math.min(t,1-t,d,1-d)<.03?fr:(Math.floor(t*15)+Math.floor(d*10))%2?null:net,{foot:1,nb:1}));
  const p=prop(B,null,{lifeKSet:2}), S={b:null,t:-1,Lc:[1,1,1],lcAt:-9};
  const perch=[[.25,.3,39],[.3,.65,42],[.78,.7,38],[.7,.28,36],[.4,.5,45],[.6,.5,45],[.62,.25,32],[.12,.5,48],[.88,.5,48],[.5,.12,50]];
  const W=(t,d)=>r.at(t,d);
  p.lifeDraw=(D,Wd,Hh,ox,oy,t,K)=>{ const ks=p.bf||[12,13], night=typeof CLOCK!=='number'||CLOCK<6.5*60||CLOCK>=19.5*60;
    if(!S.b)S.b=ks.map((k,i)=>({k,at:i*4,to:i*4,t0:t,dur:0,until:t+2+i*3,fx:1}));
    if(t-S.lcAt>1){ S.lcAt=t; const env=envNear(x,y); S.Lc=env?lightAt(env,x,y,(LVZ(p.lv)+42)/24,null).map(v=>.4+.6*Math.max(v,CHARMIN)):[1,1,1]; }
    S.b.forEach((b,i)=>{ let pose=2, P, Pt=perch[b.to];
      if(b.dur&&t<b.t0+b.dur){ const u=(t-b.t0)/b.dur, A=perch[b.at], C=perch[b.to], hump=Math.sin(Math.PI*u)*7, zig=Math.sin(u*Math.PI*5)*.06;
        P=[A[0]+(C[0]-A[0])*u+zig*(C[1]-A[1]),A[1]+(C[1]-A[1])*u-zig*(C[0]-A[0]),A[2]+(C[2]-A[2])*u+hump+Math.sin(t*9+i)*1.2]; pose=[0,1,2,1][Math.floor(t*12+i)%4]; }
      else{ if(b.dur){ b.at=b.to; b.dur=0; } P=perch[b.at];
        if(!night&&t>b.until){ let n=Math.floor(hash(Math.floor(t*10),i,445)*perch.length); if(n===b.at||S.b.some(o=>o!==b&&(o.at===n||o.to===n)))n=(n+3)%perch.length;
          const A=perch[b.at], C=perch[n]; b.to=n; b.t0=t; b.dur=.9+Math.hypot(C[0]-A[0],C[1]-A[1])*2.4; b.until=t+b.dur+4+hash(Math.floor(t),i,447)*9; }
        else pose=!night&&hash(Math.floor(t/2.5),i,449)<.55?0:2; }
      const [wx,wy]=W(P[0],P[1]), [vx,vy]=vw(wx,wy), sxp=((vx-vy)*HW-ox)*K, syp=((vx+vy)*HH-P[2]-oy)*K, [vx2,vy2]=vw(...W(perch[b.to][0],perch[b.to][1])), [vxa,vya]=vw(...W(perch[b.at][0],perch[b.at][1]));
      if(b.dur)b.fx=(vx2-vy2)-(vxa-vya)<0?-1:1;
      const span=Math.max(7,Math.min(10,BF_KINDS[b.k][3]/35*2)), key=b.k+':'+pose+':'+K; let Q=BFPICS.get(key); if(!Q){ Q=bfPic(b.k,Math.max(4,Math.round(span*K)),pose); BFPICS.set(key,Q); }
      const L=S.Lc, x0=Math.round(sxp-Q.w/2), y0=Math.round(syp-Q.oy);
      for(let py=0;py<Q.h;py++)for(let px=0;px<Q.w;px++){ const c=Q.px[py*Q.w+(pose===2&&b.fx<0?Q.w-1-px:px)]; if(!c)continue; const X=x0+px, Y=y0+py; if(X<0||Y<0||X>=Wd||Y>=Hh)continue;
        const q=(Y*Wd+X)*4; D[q]=c[0]*L[0]; D[q+1]=c[1]*L[1]; D[q+2]=c[2]*L[2]; D[q+3]=255; } }); };
  return p; }
Object.assign(CATALOG,{'venetian blinds':(x,y)=>venetian(x,y),'venetian blinds, up':(x,y)=>venetian(x,y,undefined,1),'silk curtains':(x,y)=>silkCurtains(x,y),
  'silk curtains, loose':(x,y)=>silkCurtains(x,y,undefined,1),'trailing ivy':(x,y)=>ivy(x,y),'trailing ivy, long':(x,y)=>ivy(x,y,undefined,1),'candles':(x,y)=>candles(x,y),
  'two candles':(x,y)=>candles(x,y,undefined,undefined,2),'patterned rug':(x,y)=>patternedRug(x,y),'fiddle-leaf fig':(x,y)=>fig(x,y),'tea tray':(x,y)=>teaTray(x,y),
  'peg rail with a hat and a bag':(x,y)=>pegRail(x,y),'stack of books with a candle':(x,y)=>bookStack(x,y),'butterfly house':(x,y)=>bfHouse(x,y),'pothos shelf':(x,y)=>pothosShelf(x,y),'hanging pothos':(x,y)=>hangingPothos(x,y)});
{ const I=(no,name,price,desc,mat)=>({no:'P-7'+no,name,dept:'apartment',price,desc,mat});
  Object.assign(CAT_INFO,{
  'venetian blinds':I(30,'Venetian Blinds',40,'Cream slats on a rail, tilted half open: the daylight comes through in stripes. Hangs in a window.','aluminium, cord'),
  'venetian blinds, up':I(31,'Venetian Blinds (pulled up)',40,'The same blinds pulled up under their rail, for an open window.','aluminium, cord'),
  'silk curtains':I(32,'Silk Curtains',160,'Two panels of plum silk on a brass rail, tied back with gold cord.','silk, brass'),
  'silk curtains, loose':I(33,'Silk Curtains (loose)',160,'Plum silk hanging straight from a brass rail; it stirs when the air does.','silk, brass'),
  'trailing ivy':I(34,'Trailing Ivy',20,'English ivy along the top of a wall, its strands hanging down. Goes on a wall.','living'),
  'trailing ivy, long':I(35,'Trailing Ivy (long)',25,'English ivy along the top of a wall, its strands hanging well down. Goes on a wall.','living'),
  'candles':I(36,'Candles',12,'Three pillar candles on a brass dish, burning.','wax, brass'),
  'two candles':I(37,'Two Candles',8,'Two pillar candles on a brass dish, burning.','wax, brass'),
  'patterned rug':I(38,'Patterned Rug',220,'Purple and gold: a checked border, a gold lattice, a medallion round a rose diamond, fringed ends.','wool'),
  'fiddle-leaf fig':I(39,'Fiddle-Leaf Fig',45,'Big glossy leaves on a thin trunk, in a dark glazed pot.','ceramic, living'),
  'tea tray':I(40,'Tea Tray',30,'A walnut tray, a white teapot with a blue band, a cup of tea still steaming.','walnut, porcelain'),
  'peg rail with a hat and a bag':I(41,'Peg Rail',35,'Walnut, three pegs: a felt hat, a striped scarf and a canvas bag on them. Goes on a wall.','walnut, felt, wool, canvas'),
  'stack of books with a candle':I(42,'Stack of Books',20,'Five books every which way, a candle burning on top.','paper, wax'),
  'pothos shelf':I(44,'Pothos Shelf',40,'A pine board on two brackets, a pothos trailing off one end, three books. Goes on a wall.','pine, clay, living'),
  'hanging pothos':I(45,'Hanging Pothos',35,'A pothos in a terracotta pot in a macrame hanger, on an iron bracket on the wall, trailing. Goes on a wall.','clay, cotton, living'),
  'butterfly house':I(43,'Butterfly House',180,'A mesh cube on a walnut stand, moss, leaves and a flower of nectar inside, and two of the world\'s rarest butterflies.','walnut, mesh, living')}); }
for(const k of Object.keys(CAT_INFO))if(!KIND_OF[k])KIND_OF[k]=k;
})();

STOREK.bf={BF_KINDS,bfPic,bfSpan};
}

{
