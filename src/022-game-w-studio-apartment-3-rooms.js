function desk(x,y,f=[0,1]){ PNAME='desk'; const r=rect(x,y,f,1.8,.7), c=AP.oak, H=30;
  const dr=(s,t,z,len)=>{ const k=wood(45,c,t,z,len); if(s!=='f')return k; const q=(z-2)%9; if(q<1)return sh(k,.6); if(q>3.5&&q<5.5&&Math.abs(t-.5)*len*FP<2.5)return AP.steelD; return k; };
  return prop([fb(r,0,1,0,1,H-2,H,c,(s,t,z,len)=>wood(47,c,t,z,len),(t,d,X,Y)=>boards(mt('wood',c),X,Y,.9),{foot:1}),
    fb(r,.7,.98,.04,.96,0,H-2,c,dr),fb(r,.02,.06,.1,.9,0,H-2,c,(s,t,z,len)=>wood(49,c,t,z,len)),fb(r,.06,.7,.9,.96,6,H-2,c,(s,t,z,len)=>sh(wood(51,c,t,z,len),.9))]); }
function officeChair(x,y,f=[0,1]){ PNAME='office chair'; const r=rect(x,y,f,.55,.55), c=AP.clothD, pl=AP.plastic;
  const cl=(s,t,z)=>worn(mt('carpet',hash(Math.floor(t*30),Math.floor(z),53)<.2?sh(c,.9):c),t,z,55);
  return prop([fb(r,.08,.92,.44,.56,0,2,pl),fb(r,.44,.56,.08,.92,0,2,pl),fb(r,.2,.8,.2,.8,0,2,pl),fb(r,.45,.55,.45,.55,2,20,AP.steelD,(s,t,z)=>metal(AP.steelD,t,z),null,{foot:1}),
    fb(r,.05,.95,.05,.95,20,25,c,cl,()=>sh(mt('carpet',c),1.05),{foot:1}),fb(r,.1,.9,.84,.98,25,48,c,cl,null,{foot:1})]); }
function computer(x,y,f=[0,1],z=ONZ){ PNAME='computer'; const r=rect(x,y,f,.5,.44), bg=AP.cream;
  const mon=(s,t,zz)=>{ if(s==='f'&&zz>3&&zz<16&&t>.1&&t<.9){ const n=hash(Math.floor(t*30),Math.floor(zz),57); return n<.08?[60,120,70]:sh(AP.screen,.9+.2*zz/16); } return worn(mt('frame',bg),t,zz,59); };
  return prop([fb(r,.15,.85,.5,.95,z,z+4,bg,null,null,{foot:1}),fb(r,.06,.94,.4,1,z+4,z+22,bg,mon,()=>sh(bg,.9),{foot:1}),
    fb(r,0,1,.02,.36,z,z+2,bg,null,(t,d)=>(t*14)%1<.25||(d*3)%1<.3?sh(bg,.75):bg,{foot:1})]); }
function deskLamp(x,y,f=[0,1],z=ONZ){ PNAME='desk lamp'; const r=rect(x,y,f,.3,.3), c=AP.steelD;
  const p=prop([fb(r,.25,.75,.25,.75,z,z+2,c,null,null,{foot:1}),fb(r,.46,.54,.64,.72,z+2,z+18,c,null,null,{foot:1}),fb(r,.46,.54,.3,.72,z+16,z+19,c,null,null,{foot:1}),
    fb(r,.2,.8,.1,.6,z+18,z+26,AP.glow,(s,t,zz)=>zz>7?sh(c,.9):AP.glow,()=>sh(c,.9),{foot:1,em:1})]);
  LAMPS.push({x,y,z:z+20,r:2.8,c:[1,.82,.56],own:1,room:1,day:true,live:true,prop:p}); return p; }
function radio(x,y,f=[0,1],z=ONZ){ PNAME='radio'; const r=rect(x,y,f,.5,.26), H=12, c=AP.walnut, cl=[164,142,104], gl=[186,176,144], kn=[46,34,28]; let p=null;
  const face=(s,t,zz,len)=>{ const a=t*len*FP, n=p&&p.radio;
    if(s==='f'&&t>.6&&t<.94&&zz>H-5.5&&zz<H-1.6){ const tick=zz<H-4.4&&Math.floor(a*2)%3===0, ndl=n&&Math.abs(t-(.62+.3*n.nt))<.025;
      if(LIFE.mode===1)return n&&n.on?(ndl?[236,64,40]:tick?[132,86,44]:[255,216,142]):ndl?[92,30,22]:null; return tick?sh(gl,.62):gl; }
    if(LIFE.mode===1)return null;
    if(s==='f'){ if(t>.57&&t<.97&&zz>H-6.2&&zz<H-1)return [168,140,84];
      if(t>.06&&t<.55&&zz>1.4&&zz<H-1.4)return Math.floor(a)%3===0?wood(61,c,t,zz,len):(Math.floor(a*3)+Math.floor(zz*3))&1?sh(cl,.84):cl; }
    if(s==='b')return zz>2&&zz<H-2&&t>.2&&t<.8&&Math.floor(zz)%2?[40,32,26]:[84,68,52];
    return zz<.8?sh(wood(61,c,t,zz,len),.7):wood(61,c,t,zz,len); };
  const knob=t0=>fb(r,t0,t0+.1,-.25,0,z+1.4,z+4.4,kn,(s,t,zz)=>s==='f'&&Math.abs(t-.5)<.2&&zz>1.5?[196,186,164]:kn,()=>sh(kn,1.25),{foot:1});
  p=prop([fb(r,0,1,0,1,z,z+H,c,face,(t,d)=>t<.03||t>.97||d<.06||d>.94?sh(mt('wood',c),.8):grain(mt('wood',c),t*.5*FP,0,63),{foot:1,life:1}),knob(.63),knob(.82),
    fb(r,.82,.92,.62,.86,z+H,z+H+1.2,AP.steelD,null,null,{foot:1}),fb(r,.85,.89,.7,.8,z+H+1.2,z+H+20,AP.chrome,(s,t,zz)=>zz>17.5?AP.white:metal(AP.chrome,t,zz),null,{foot:1})]);
  const [lx,ly]=r.at(.77,0); p.lamp={x:lx,y:ly,z:z+H-3,r:1.2,c:[0,0,0],own:1,room:1,day:true,live:true,prop:p}; LAMPS.push(p.lamp); return p; }
function sofa(x,y,f=[0,1]){ PNAME='sofa'; const r=rect(x,y,f,1.8,.85), c=AP.cloth;
  const cl=k=>(s,t,z)=>worn(mt('carpet',hash(Math.floor(t*40),Math.floor(z),61)<.15?sh(c,.92):c),t,z,k);
  return prop([fb(r,0,1,0,1,0,3,AP.clothD,null),fb(r,.08,.92,0,.78,3,18,c,cl(63),(t,d)=>{ const m=Math.abs(t-.5); return mt('carpet',m<.012||t<.1||t>.9||d<.08?sh(c,.8):d>.65?sh(c,.92):hash(Math.floor(t*60),Math.floor(d*30),65)<.15?sh(c,.94):sh(c,1.04)); },{foot:1}),
    fb(r,.08,.92,.78,1,3,36,c,cl(67),()=>sh(mt('carpet',c),.96),{foot:1}),fb(r,0,.08,0,1,3,27,c,cl(69),()=>sh(mt('carpet',c),.96),{foot:1}),fb(r,.92,1,0,1,3,27,c,cl(71),()=>sh(mt('carpet',c),.96),{foot:1})]); }
function rug(x,y,f=[0,1]){ PNAME='rug'; const r=rect(x,y,f,2.6,3.1), c=AP.rug, d=AP.rugD;
  return prop([fb(r,0,1,0,1,0,1,c,null,(t,dd,X,Y)=>{ const e=Math.min(t,1-t)*2.6, ee=Math.min(dd,1-dd)*3.1, n=hash(Math.floor(X*48),Math.floor(Y*48),73), m=Math.abs(t-.5)*2.6/1.3+Math.abs(dd-.5)*3.1/1.55;
    let q=e<.05||ee<.05?sh(d,.8):e<.18||ee<.18?d:e<.22||ee<.22?sh(c,1.15):m<.5?(Math.abs(m-.45)<.04?sh(c,1.2):d):Math.abs(m-.6)<.03?sh(c,1.15):c;
    return mt('carpet',n<.3?sh(q,.92):n>.94?sh(q,1.08):q); })],null,{walk:true,flat:true}); }
function coffeeTable(x,y,f=[0,1]){ PNAME='coffee table'; const r=rect(x,y,f,.9,.55), c=AP.pine, leg=(t,d)=>fb(r,t,t+.07,d,d+.1,0,14,AP.walnut,null,null,{foot:1});
  return prop([fb(r,0,1,0,1,14,16,c,(s,t,z,len)=>wood(75,c,t,z,len),(t,d,X,Y)=>boards(mt('wood',c),X,Y,.45),{foot:1}),leg(.04,.06),leg(.89,.06),leg(.04,.84),leg(.89,.84)]); }
function bed(x,y,f=[0,1]){ PNAME='single bed'; const r=rect(x,y,f,2.1,.95), c=AP.pine;
  const sheet=(s,t,z)=>worn(mt('carpet',hash(Math.floor(t*50),Math.floor(z),77)<.1?sh(AP.cream,.94):AP.cream),t,z,79);
  return prop([fb(r,0,1,.04,.96,0,10,c,(s,t,z,len)=>z<3?sh(wood(81,c,t,z,len),.7):wood(81,c,t,z,len)),fb(r,0,.04,0,1,0,34,c,(s,t,z,len)=>wood(83,c,t,z,len),()=>sh(mt('wood',c),.9)),
    fb(r,.04,1,.06,.94,10,18,AP.cream,sheet,()=>mt('carpet',AP.cream),{foot:1}),
    fb(r,.26,1,.04,.96,18,21,AP.blanket,(s,t,z)=>worn(mt('carpet',AP.blanket),t,z,85),(t,d)=>mt('carpet',(d*12)%1<.12?sh(AP.blanket,.9):hash(Math.floor(t*40),Math.floor(d*20),87)<.12?sh(AP.blanket,1.08):AP.blanket),{foot:1}),
    fb(r,.06,.24,.2,.8,18,23,AP.white,(s,t,z)=>z>3?AP.white:sh(AP.white,.9),(t,d)=>Math.min(t-.06,.24-t)<.015?sh(AP.white,.85):AP.white,{foot:1})]); }
function diningTable(x,y,f=[0,1]){ PNAME='dining table'; const r=rect(x,y,f,.9,.9), c=AP.walnut, leg=(t,d)=>fb(r,t,t+.07,d,d+.07,0,28,c,(s,tt,z,len)=>wood(89,c,tt,z,len),null,{foot:1});
  return prop([fb(r,0,1,0,1,28,30,c,(s,t,z,len)=>wood(91,c,t,z,len),(t,d,X,Y)=>boards(mt('wood',c),X,Y,.3),{foot:1}),leg(.05,.05),leg(.88,.05),leg(.05,.88),leg(.88,.88)]); }
function stool(x,y,f=[0,1]){ PNAME='stool'; const r=rect(x,y,f,.36,.36), c=AP.pine, leg=(t,d)=>fb(r,t,t+.1,d,d+.1,0,18,AP.walnut,null,null,{foot:1});
  return prop([fb(r,0,1,0,1,18,20,c,(s,t,z,len)=>wood(93,c,t,z,len),(t,d)=>mt('wood',Math.min(t,1-t,d,1-d)<.07?sh(c,.8):c),{foot:1}),leg(.05,.05),leg(.85,.05),leg(.05,.85),leg(.85,.85),
    fb(r,.1,.9,.1,.9,7,8,AP.walnut,null,(t,d)=>Math.min(t-.1,.9-t,d-.1,.9-d)<.08?AP.walnut:null,{foot:1})]); }
const FRH=70, FRZ=46;
const frP=(s,t,z,len)=>{ const c=AP.enamel; let k=worn(mt('frame',c),t,z,95); if(z<4)return sh(k,.5); if(s==='f'){ if(Math.abs(z-FRZ)<.6||z>FRH-2)return sh(k,.72); const a=t*len*FP; if(a>2&&a<4&&(z>22&&z<42||z>50&&z<62))return AP.plastic; }
  return z>FRH-2?sh(k,.85):k; };
function fridge(x,y,f=[0,1]){ PNAME='fridge'; const r=rect(x,y,f,.75,.7), c=AP.enamel;
  return prop([fb(r,0,1,0,1,0,FRH,c,frP,()=>sh(mt('frame',c),.9))]); }
const LIN=[236,238,234], linr=(t,z,k)=>sh(LIN,k*(.97+.04*hash(Math.floor(t*30),Math.floor(z/3),131)));
function fridgeOpen(x,y,f=[0,1]){ PNAME='fridge, open'; const r=rect(x,y,f,.75,.7), c=AP.enamel, gl=[206,222,226], top=()=>sh(mt('frame',c),.9);
  const wall=(inn,k)=>(s,t,z,len)=>s===inn?linr(t,z,k):s==='f'?AP.enamelD:frP(s,t,z+6,len);
  const shelf=z=>fb(r,.06,.94,.02,.93,z-1,z,gl,s=>s==='f'?[240,242,240]:sh(gl,.9),(t,d)=>d<.06?[236,240,240]:hash(Math.floor(t*20),Math.floor(d*20),133)<.05?sh(gl,1.08):gl,{foot:1});
  const cf=[232,236,234], cfr=(s,t,z,len)=>{ const a=t*len*FP; if(s!=='f'&&s!=='b')return cf; if(z>5.4&&z<6.2&&Math.abs(t-.5)<.2)return sh(cf,.78);
      return a<1||a>len*FP-1||z<1||z>5?cf:null; };
  const veg=(cs,k)=>(s,t,z,len)=>{ const n=hash(Math.floor(t*len*FP),Math.floor(z),k); return n<.3?cs[1]:n>.86?cs[2]:cs[0]; }, vegT=(cs,k)=>(t,d,X,Y)=>{ const n=hash(Math.floor(X*48),Math.floor(Y*48),k); return n<.3?cs[1]:n>.86?cs[2]:cs[0]; };
  const LET=[[96,150,70],[72,122,52],[156,198,112]], CAR=[[214,112,40],[178,84,30],[234,146,70]], CUC=[[52,96,44],[38,72,34],[96,140,70]], TOM=[[200,52,40],[160,36,30],[232,110,90]];
  const crisper=[fb(r,.1,.9,.06,.88,6,7,cf,null,null,{foot:1}),fb(r,.1,.9,.04,.07,6,14,cf,cfr,null,{foot:1}),fb(r,.1,.12,.07,.88,7,14,cf,null,null,{foot:1}),fb(r,.88,.9,.07,.88,7,14,cf,null,null,{foot:1}),
    fb(r,.12,.88,.85,.88,7,14,cf,null,null,{foot:1}),
    fb(r,.15,.41,.22,.62,7,11,LET[0],veg(LET,141),vegT(LET,143),{foot:1}),fb(r,.19,.37,.28,.56,11,12.6,LET[0],veg(LET,145),vegT(LET,147),{foot:1}),
    ...[[.2,.28,7,8.4],[.31,.39,7,8.4],[.25,.33,8.4,9.8]].map(([d0,d1,z0,z1],i)=>fb(r,.47,.79,d0,d1,z0,z1,CAR[0],(s,t,z,len)=>(t*len*FP)%2<.5?CAR[1]:CAR[0],vegT(CAR,149+i),{foot:1})),
    fb(r,.79,.86,.2,.39,7,9.6,LET[1],veg(LET,153),vegT(LET,155),{foot:1}),
    fb(r,.46,.84,.5,.62,7,9,CUC[0],veg(CUC,157),vegT(CUC,159),{foot:1}),fb(r,.7,.84,.68,.82,7,10,TOM[0],veg(TOM,161),(t,d)=>Math.abs(t-.5)<.2&&Math.abs(d-.5)<.2?[70,120,50]:TOM[0],{foot:1}),
    fb(r,.08,.92,.04,.9,14,15,gl,s=>s==='f'?[240,242,240]:sh(gl,.9),(t,d)=>d<.05?[232,236,234]:sh(gl,1.02),{foot:1})];
  const p=prop([fb(r,0,1,0,1,0,6,c,frP,(t,d)=>linr(t,d*9,1)),fb(r,0,.06,0,.93,6,FRZ,c,wall('r',.92),top,{foot:1}),fb(r,.94,1,0,.93,6,FRZ,c,wall('l',.92),top,{foot:1}),
    fb(r,0,1,.93,1,6,FRZ,c,wall('f',.86),top,{foot:1}),fb(r,0,1,0,1,FRZ,FRH,c,(s,t,z,len)=>frP(s,t,z+FRZ,len),top,{foot:1}),
    ...crisper,shelf(26),shelf(36),fb(r,.38,.62,.04,.22,FRZ-2,FRZ,[250,250,244],null,null,{foot:1})]);
  const [lx,ly]=r.at(.5,.2); p.face=r.f; p.lamp={x:lx,y:ly,z:FRZ-4,r:2.2,c:[0,0,0],own:1,room:1,day:true,vary:1,prop:p}; LAMPS.push(p.lamp);
  return p; }
function fridgeDoor(x,y,f=[0,1]){ PNAME='fridge door, open'; const r=rect(x,y,f,.75,.7), c=AP.enamel, A=a=>-.75/.7*(1-a/18), bc=[214,222,222];
  const bins=[[3,[[2,6,9,[244,244,240],[60,110,190]],[7,10,8,[240,170,50],[240,240,236]],[11,14,7,[200,50,40],[240,240,236]],[15,17,6,[150,90,40],[60,40,30]]]],
    [16,[[2,5,6,[180,60,50],[240,230,220]],[6,9,6,[220,200,120],[60,60,60]],[11,15,4,[246,230,150],[246,230,150]]]],[29,[[9,12,6,[120,150,60],[60,120,60]],[13,16,5,[250,250,246],[150,150,150]]]]];
  const P=(s,t,z,len)=>{ if(s==='r')return z<1||z>41?AP.enamelD:linr(t,z,.92);
    if(s==='l'){ const a=t*len*FP; return a>2&&a<4&&z>18&&z<38?AP.plastic:worn(mt('frame',c),t,z+4,95); } return AP.enamelD; };
  const B=[fb(r,-.1,0,-.75/.7,0,4,FRZ,c,P,()=>sh(mt('frame',c),.9),{foot:1})], o={foot:1};
  for(const [b,its] of bins){ const z=4+b;
    B.push(fb(r,0,.2,A(1),A(17),z,z+1,sh(bc,.9),null,null,o),fb(r,0,.2,A(1),A(1.6),z+1,z+4,bc,null,null,o),fb(r,0,.2,A(16.4),A(17),z+1,z+4,bc,null,null,o),
      fb(r,.17,.2,A(1.6),A(16.4),z+1,z+4,bc,(s,t,zz)=>zz>2.2?bc:s==='r'||s==='l'?null:bc,()=>bc,o));
    for(const [a0,a1,h,col,cap] of its)B.push(fb(r,.03,.15,A(a0),A(a1),z+1,z+1+h,col,(s,t,zz)=>zz>=h-1?cap:zz<1?sh(col,.85):col,()=>cap,o)); }
  const z=4+29; B.push(fb(r,.02,.16,A(1.8),A(8.2),z+1,z+2,[206,196,176],null,null,o),...[[2,4],[4.1,6.1],[6.2,8.1]].map(([a0,a1])=>fb(r,.05,.13,A(a0),A(a1),z+2,z+4,[236,226,206],(s,t,zz)=>zz>1.4?[246,238,222]:[236,226,206],()=>[246,238,222],o)));
  return prop(B); }
function stove(x,y,f=[0,1]){ PNAME='stove'; const r=rect(x,y,f,.7,.65), H=36, c=AP.enamel;
  const P=(s,t,z,len)=>{ let k=worn(mt('frame',c),t,z,97); if(z<3)return sh(k,.5); if(s==='f'){ const a=t*len*FP, m=Math.abs(t-.5)*len*FP; if(z>8&&z<22&&m<len*FP/2-3)return z>10&&z<20&&m<len*FP/2-5?sh(AP.black,.9+.1*hash(Math.floor(a),Math.floor(z),99)):AP.steelD; if(z>27&&z<30&&m<len*FP/2-2)return AP.steelD; }
    return k; };
  const top=(t,d)=>{ for(const [a,b] of [[.28,.3],[.72,.3],[.28,.72],[.72,.72]]){ const q=Math.hypot((t-a)*.7,(d-b)*.65); if(q<.1)return q<.04?AP.plastic:q>.08?AP.black:(Math.floor(q*100)&1)?AP.black:AP.steelD; } return mt('frame',hash(Math.floor(t*30),Math.floor(d*30),101)<.05?AP.enamelD:c); };
  return prop([fb(r,0,1,0,.88,0,H,c,P,top),fb(r,0,1,.88,1,0,H+10,c,(s,t,z,len)=>s==='f'&&z>H+2&&z<H+8&&((t*len*FP)%5)<2.5?AP.black:worn(mt('frame',c),t,z,103),()=>sh(mt('frame',c),.85))]); }
function sinkCounter(x,y,f=[0,1]){ PNAME='sink and counter'; const r=rect(x,y,f,1.4,.62), H=36, c=AP.cream, st=AP.steel;
  const P=(s,t,z,len)=>{ const k=wood(105,c,t,z,len); if(z<3)return sh(k,.5); if(s==='f'){ const m=Math.abs(t-.5)*len*FP; if(m<.5)return sh(k,.5); if(z>24&&z<27&&m>1.5&&m<4)return AP.steelD; } return k; };
  const top=(t,d)=>{ const e=Math.min(t-.3,.72-t,d-.14,.86-d); if(e>0)return e<.02?sh(st,.6):Math.hypot(t-.51,d-.5)<.03?AP.black:sh(mt('frame',st),.7+.1*hash(Math.floor(t*40),Math.floor(d*20),107)); return metal(st,t,d*4,109); };
  return prop([fb(r,0,1,0,1,0,H-2,c,P),fb(r,0,1,0,1,H-2,H,st,(s,t,z)=>metal(st,t,z),top,{foot:1}),fb(r,.49,.53,.86,.92,H,H+9,AP.chrome,null,null,{foot:1}),fb(r,.49,.53,.6,.92,H+8,H+10,AP.chrome,null,null,{foot:1})]); }
function bath(x,y,f=[0,1]){ PNAME='bath'; const r=rect(x,y,f,1.8,.75), H=22, c=AP.enamel;
  const top=(t,d)=>{ const e=Math.min((t-.04)*1.8,(.96-t)*1.8,(d-.1)*.75,(.9-d)*.75); if(e>0)return e<.03?sh(c,.75):mt('frame',sh(AP.enamelD,1+.1*Math.min(1,e*4)+.04*hash(Math.floor(t*60),Math.floor(d*20),111))); return mt('frame',c); };
  return prop([fb(r,.05,.95,.1,.9,0,4,AP.enamelD),fb(r,0,1,0,1,4,H,c,(s,t,z)=>z>H-5?sh(worn(mt('frame',c),t,z,113),.95):worn(mt('frame',c),t,z,113),top,{foot:1}),
    fb(r,.05,.09,.4,.6,H,H+5,AP.chrome,null,null,{foot:1}),fb(r,.05,.14,.45,.55,H+4,H+6,AP.chrome,null,null,{foot:1})]); }
function toilet(x,y,f=[0,1]){ PNAME='toilet'; const r=rect(x,y,f,.46,.72), c=AP.enamel, en=(s,t,z)=>worn(mt('frame',c),t,z,115);
  return prop([fb(r,.1,.9,.08,.6,0,14,c,en,(t,d)=>Math.hypot((t-.5)*.46,(d-.34)*.72)<.17?sh(AP.enamelD,.85):mt('frame',c),{foot:1}),fb(r,.2,.8,.2,.5,0,2,AP.enamelD),
    fb(r,.05,.95,.1,.65,14,16,c,null,(t,d)=>Math.hypot((t-.5)*.46,(d-.36)*.72)<.12?[70,80,90]:mt('frame',c),{foot:1}),fb(r,.08,.92,.64,.98,8,36,c,en,()=>sh(mt('frame',c),.9),{foot:1}),fb(r,.84,.92,.58,.64,30,32,AP.chrome,null,null,{foot:1})]); }
function washingMachine(x,y,f=[0,1]){ PNAME='washing machine'; const r=rect(x,y,f,.7,.7), H=36, c=AP.enamel;
  const P=(s,t,z,len)=>{ let k=worn(mt('frame',c),t,z,117); if(z<3)return sh(k,.5); if(s==='f'){ const q=Math.hypot((t-.5)*len*FP,z-16); if(q<8)return q>6.5?AP.steelD:q>5.5?AP.chrome:sh(AP.black,.9+.15*hash(Math.floor(t*30),Math.floor(z),119));
      if(z>29&&z<34){ const a=t*len*FP; if(a>2&&a<6)return AP.plastic; if(Math.hypot(a-len*FP+4,z-31.5)<1.8)return AP.plastic; return sh(k,.9); } }
    return k; };
  return prop([fb(r,0,1,0,1,0,H,c,P,(t,d)=>mt('frame',hash(Math.floor(t*20),Math.floor(d*20),121)<.04?AP.enamelD:c))]); }
function bathSink(x,y,f=[0,1]){ PNAME='bathroom sink'; const r=rect(x,y,f,.5,.42), c=AP.enamel, en=(s,t,z)=>worn(mt('frame',c),t,z,123);
  return prop([fb(r,.35,.65,.4,.85,0,26,c,en,null,{foot:1}),fb(r,0,1,0,1,26,32,c,en,(t,d)=>{ const q=Math.hypot((t-.5)*.5,(d-.45)*.42); return q<.14?q<.02?AP.black:sh(AP.enamelD,.9+.3*q/.14):mt('frame',c); },{foot:1}),
    fb(r,.47,.53,.86,.92,32,40,AP.chrome,null,null,{foot:1}),fb(r,.1,.2,.2,.4,32,34,[200,210,190],null,null,{foot:1})]); }
function towelRail(x,y,f=[0,1]){ PNAME='towel rail'; const r=rect(x,y,f,.55,.12), Z=42, tw=[178,170,150];
  return prop([fb(r,0,1,.8,1,Z,Z+2,AP.chrome,null,null,{foot:1}),fb(r,.02,.08,.85,1,Z-3,Z,AP.chrome,null,null,{foot:1}),fb(r,.92,.98,.85,1,Z-3,Z,AP.chrome,null,null,{foot:1}),
    fb(r,.15,.85,.5,.8,Z-18,Z+1,tw,(s,t,z)=>mt('carpet',worn(Math.abs(z-6)<1.2||Math.abs(z-12)<1.2?AP.red:z%3<1?sh(tw,.92):tw,t,z,125)),()=>mt('carpet',sh(tw,1.05)),{foot:1})],null,{high:true,walk:true}); }

function floorLamp(x,y,f=[0,1]){ PNAME='floor lamp'; const r=rect(x,y,f,.3,.3), c=[52,44,38], sh0=[226,204,160];
  const p=prop([fb(r,.08,.92,.08,.92,0,2,c,null,null,{foot:1}),fb(r,.44,.56,.44,.56,2,42,c,(s,t,z)=>z%9<1?sh(c,1.25):c,null,{foot:1}),
    fb(r,0,1,0,1,40,54,sh0,(s,t,z)=>z<1||z>12.5?[150,128,96]:Object.assign([...sh0],{e:1}),()=>[88,74,58],{foot:1,em:1})]);
  LAMPS.push({x,y,z:47,r:3.2,c:[.6,.4,.22],own:1,room:1,day:true,prop:p}); return p; }
function blinds(x,y,f=[0,1]){ PNAME='window blinds'; const r=rect(x,y,f,1.16,.03), c=[214,204,182];
  return prop([fb(r,0,1,0,1,40,93,c,(s,t,z)=>mt('frame',z%3<1?sh(c,.74):hash(Math.floor(t*40),Math.floor(z/3),131)<.06?sh(c,.9):c),()=>sh(c,.86),{foot:1}),
    fb(r,-.01,1.01,-.3,1,92,95,[176,168,150],null,null,{foot:1})],null,{high:true,walk:true}); }

Object.assign(CATALOG,{'home computer':(x,y)=>homeComputer(x,y),
  'entrance mat':(x,y)=>aptMat(x,y),'wardrobe':(x,y)=>wardrobe(x,y),'shelves with boxes':(x,y)=>wallShelves(x,y),'vacuum':(x,y)=>vacuum(x,y),'TV on a low stand':(x,y)=>tvStand(x,y),
  'poster':(x,y)=>aptPoster(x,y),'wall shelf with plant':(x,y)=>plantShelf(x,y),'bookcase':(x,y)=>bookcase(x,y),'desk':(x,y)=>desk(x,y),'office chair':(x,y)=>officeChair(x,y),
  'computer':(x,y)=>computer(x,y),'desk lamp':(x,y)=>deskLamp(x,y),'sofa':(x,y)=>sofa(x,y),'rug':(x,y)=>rug(x,y),'coffee table':(x,y)=>coffeeTable(x,y),'single bed':(x,y)=>bed(x,y),
  'dining table':(x,y)=>diningTable(x,y),'stool':(x,y)=>stool(x,y),'fridge':(x,y)=>fridge(x,y),'fridge, open':(x,y)=>fridgeOpen(x,y),'fridge door, open':(x,y)=>fridgeDoor(x,y),'stove':(x,y)=>stove(x,y),'sink and counter':(x,y)=>sinkCounter(x,y),
  'bath':(x,y)=>bath(x,y),'toilet':(x,y)=>toilet(x,y),'washing machine':(x,y)=>washingMachine(x,y),'bathroom sink':(x,y)=>bathSink(x,y),'towel rail':(x,y)=>towelRail(x,y),'floor lamp':(x,y)=>floorLamp(x,y),'window blinds':(x,y)=>blinds(x,y),'radio':(x,y)=>radio(x,y)});
CAT_DEPTS.push(['apartment','Apartment']);
{ const I=(no,name,desc,mat)=>({no:'P-7'+String(no).padStart(2,'0'),name,dept:'apartment',price:0,desc,mat});
  Object.assign(CAT_INFO,{
  'entrance mat':I(1,'Entrance Mat','A coir mat, trodden thin in the middle. Goes by the door.','coir'),
  'wardrobe':I(2,'Wardrobe','Dark oak, two doors, one of them sticks.','oak'),
  'shelves with boxes':I(3,'Shelves with Boxes','Three pine boards on the wall, with cardboard boxes and old papers on them. Hangs on a wall.','pine, cardboard'),
  'vacuum':I(4,'Vacuum Cleaner','An upright with a red dust bag. Loud.','steel, plastic, cloth'),
  'TV on a low stand':I(5,'TV on a Low Stand','A black set on a walnut cabinet. Gets three channels on a good night.','walnut, glass'),
  'poster':I(6,'Poster','A gig poster, yellowed, one corner torn. Hangs on a wall.','paper'),
  'wall shelf with plant':I(7,'Wall Shelf with Plant','One pine board on two brackets, a pot plant that is still alive. Hangs on a wall.','pine, terracotta, living'),
  'bookcase':I(8,'Bookcase','Four shelves in an oak case, for real books.','oak'),
  'home computer':I(27,'Home Computer','A long oak desk and a big home computer: the boxy monitor on its case, the keyboard, the mouse on its pad, a floppy and a box of disks.','oak, plastic, glass'),
  'desk':I(9,'Desk','An oak desk with three drawers down the right.','oak'),
  'office chair':I(10,'Office Chair','Black cloth on a five-star base. Squeaks when it turns.','steel, cloth'),
  'computer':I(11,'Computer','A beige monitor and keyboard. The screen glows a little green.','plastic, glass'),
  'desk lamp':I(12,'Desk Lamp','A bent-arm lamp with a warm shade.','steel'),
  'sofa':I(13,'Sofa','Two seats of grey-blue cloth, a little worn where people sit.','cloth, pine'),
  'rug':I(14,'Rug','A red wool rug with a dark border and a diamond, faded along the walkway.','wool'),
  'coffee table':I(15,'Coffee Table','A low pine table on square legs.','pine'),
  'single bed':I(16,'Single Bed','A pine frame, a cream sheet, a blue blanket and one pillow.','pine, cotton, wool'),
  'dining table':I(17,'Dining Table','A square walnut table for two.','walnut'),
  'stool':I(18,'Stool','A pine stool with a footrest.','pine'),
  'fridge':I(19,'Fridge','White enamel gone grey. The freezer is the top door.','steel, enamel'),
  'stove':I(20,'Stove','Four burners and an oven. The window in the oven door is black with use.','steel, enamel'),
  'sink and counter':I(21,'Sink and Counter','A steel counter with a basin and a tap over a two-door cupboard.','steel, pine'),
  'bath':I(22,'Bath','A white enamel tub on short feet.','enamel'),
  'toilet':I(23,'Toilet','White, with a tank and a lever.','porcelain'),
  'washing machine':I(24,'Washing Machine','A front loader with a porthole and one dial.','steel, enamel, glass'),
  'bathroom sink':I(25,'Bathroom Sink','A basin on a pedestal, a tap and a bar of soap.','porcelain, chrome'),
  'towel rail':I(26,'Towel Rail','A chrome bar with a striped towel over it. Hangs on a wall.','chrome, cotton'),
  'floor lamp':I(28,'Floor Lamp','An iron pole on a round foot, a cream drum shade. A warm, low light for a corner.','iron, cotton'),
  'window blinds':I(29,'Window Blinds','Cream slats on a rail, let all the way down. Hangs in a window.','aluminium'),
  'radio':I(30,'Radio','A walnut tabletop radio: a cloth speaker, a dial that lights up, two knobs and an aerial. Plays the stations of the market.','walnut, cloth, glass, bakelite')}); }
for(const k of Object.keys(CAT_INFO))if(!KIND_OF[k])KIND_OF[k]=k;
return {face(f,z){ FACE=f; ONZ=z||0; },kit:{FP,AP,rect,sub,fb,worn,wood,metal,z:()=>ONZ}}; })();
