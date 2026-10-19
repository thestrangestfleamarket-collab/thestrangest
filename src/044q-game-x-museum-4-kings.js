(()=>{ const {FP,rect,fb,worn,art,plane,line,ell,glassCase,plinth,BRZ,BRZL}=MUK, c=MUC;
const GOLD=[214,170,64], GOLDL=[240,206,104], GOLDD=[160,118,40], LAP=[36,58,132], LAPD=[26,40,96];
const part=(B,r,zb)=>(x0,x1,y0,y1,z0,z1,col,paint,top)=>B.push(fb(r,.5+x0/r.W,.5+x1/r.W,y0/r.D,y1/r.D,zb+z0,zb+z1,col,paint?(s,t,z,len)=>paint(s,t*len*FP,z):null,
  top?(t,d)=>top((t-.5)*r.W,d*r.D):()=>sh(col,1.08),{foot:0}));
function tutMask(x,y){ PNAME='Tutankhamun\'s mask'; const r=rect(x,y,[0,1],.9,.9), Z=40, H=26, B=glassCase(r,Z,H,{cab:[40,36,34],floor:[30,28,28]});
  const m=rect(x,y,[0,1],.9,.9), P=part(B,m,Z+2), D0=.18, stripe=(s,a,z)=>Math.floor(z/1.5)%2?GOLD:LAP;
  B.push(fb(m,.44,.56,.44,.56,Z,Z+2,[30,28,28],null,()=>[36,34,34],{foot:0}));
  P(-.2,.2,D0,D0+.36,0,4,GOLD,(s,a,z)=>z>=3?GOLDL:[GOLD,LAP,[150,40,36],GOLD,[40,110,90]][Math.floor(z)%5],(u,v)=>Math.abs(u)<.1&&v<D0+.12?GOLD:[GOLD,LAP][Math.floor(Math.hypot(u,v-D0)*30)%2]);
  P(-.22,-.12,D0+.06,D0+.3,3,11,GOLD,stripe); P(.12,.22,D0+.06,D0+.3,3,11,GOLD,stripe);
  P(-.03,.03,D0-.02,D0+.08,1,6,LAP,(s,a,z)=>Math.floor(z)%2?LAP:GOLD);
  P(-.11,.11,D0,D0+.26,5,12,GOLD,(s,a,z)=>{ if(s!=='f')return GOLD; const u=a-2.64, zz=Math.floor(z);
    if(zz===4&&Math.abs(Math.abs(u)-1.3)<.6)return [20,18,22]; if(zz===5&&Math.abs(Math.abs(u)-1.3)<.9)return LAPD;
    if(zz===2&&Math.abs(u)<1)return GOLDD; if(zz===3&&Math.abs(u)<.6)return GOLDL; return GOLD; },(u,v)=>GOLDL);
  P(-.13,-.1,D0+.08,D0+.16,7,10,GOLD); P(.1,.13,D0+.08,D0+.16,7,10,GOLD);
  P(-.17,.17,D0+.03,D0+.5,11,14,GOLD,stripe,(u,v)=>Math.floor(Math.abs(u)*40+v*10)%2?GOLD:LAP);
  P(-.14,.14,D0+.26,D0+.52,4,12,GOLD,stripe,(u,v)=>GOLD);
  P(-.03,.03,D0-.03,D0+.03,12,15,GOLDL,(s,a,z)=>z>=2?[220,60,40]:GOLDL);
  return prop(B); }
function coffin(x,y){ PNAME='painted coffin'; const r=rect(x,y,[0,1],2.6,1), Z=18, H=22, B=glassCase(r,Z,H,{cab:[44,38,34],floor:[150,132,100]});
  const Y=[204,164,72], YD=[168,124,44], RED=[160,52,36], BLU=[40,70,120], GRN=[54,110,82], BLK=[34,30,28], SKN=[184,96,56];
  const seg=(t0,t1,w,h,top)=>B.push(fb(r,t0,t1,.5-w/2,.5+w/2,Z,Z+h,Y,(s,t,z,len)=>{ const a=Math.floor(t*len*FP); return z<1?YD:z>=h-1?YD:(a+Math.floor(z))%6===0?RED:(Math.floor(z)%4===1?BLU:Y); },(t,d)=>top(t0+(t1-t0)*t,d),{foot:0}));
  const lid=(T,d)=>{ const a=Math.floor(T*200), dd=Math.abs(d-.5);
    if(T>.88)return dd<.18&&T<.97?(T>.95?BLK:SKN):Math.floor(d*20)%2?BLU:Y;
    if(T>.8)return [RED,BLU,GRN,Y][Math.floor(T*90)%4];
    if(T>.68)return dd<.06?RED:Math.floor(dd*40+T*30)%3===0?BLU:Math.floor(dd*40)%2?GRN:Y;
    if(dd<.05)return a%3?BLK:Y;
    return a%9===0?RED:Math.floor(T*28)%2?(dd>.3?BLU:Y):(hash(a,Math.floor(d*12),2001)<.2?GRN:Y); };
  seg(.08,.3,.44,10,lid); seg(.3,.72,.56,13,lid); seg(.72,.86,.6,14,lid); seg(.86,.97,.52,15,lid);
  return prop(B); }
function warriors(x,y){ PNAME='terracotta warriors'; const W=5.6, r=rect(x,y,[0,1],W,1.6), EZ=8, B=[], CL=[150,140,128], CLL=[172,162,148], CLD=[116,106,96];
  const earth=[138,108,78]; B.push(fb(r,0,1,0,1,0,EZ,earth,(s,t,z)=>z>=EZ-1?[156,124,92]:hash(Math.floor(t*200),Math.floor(z),2011)<.2?[120,92,66]:earth,(t,d)=>hash(Math.floor(t*120),Math.floor(d*30),2013)<.25?[126,98,70]:earth));
  for(const t of [.02,.98])B.push(fb(r,t-.004,t+.004,0,.06,EZ,EZ+20,BRZ,null,()=>BRZL,{foot:0})); B.push(fb(r,.02,.98,0,.04,EZ+18,EZ+20,BRZ,null,()=>BRZL,{foot:0}));
  const clay=(k)=>(s,a,z)=>{ const n=hash(Math.floor(a),Math.floor(z),k); return n<.04?[150,60,50]:n<.07?[70,110,90]:n<.25?CLD:n>.9?CLL:CL; };
  const man=(tc,dc,kind,seed)=>{ const m=rect(r.at(tc,dc)[0],r.at(tc,dc)[1],r.f,.6,.5), P=part(B,m,EZ), cl=clay(seed);
    if(kind==='kneel'){ P(-.14,.14,-.05,.4,0,2,CLD); P(-.12,-.02,.1,.4,2,8,CL,cl); P(.02,.12,-.02,.18,2,14,CL,cl); P(-.15,.15,.12,.34,10,28,CL,cl);
      P(-.2,-.15,.12,.3,14,26,CL,cl); P(.15,.2,.05,.25,16,26,CL,cl); P(-.07,.07,.14,.3,28,36,CL,(s,a,z)=>s==='f'&&Math.floor(z)===5&&Math.abs(Math.abs(a-1.7)-.9)<.5?[60,54,48]:cl(s,a,z)); P(-.05,.03,.24,.32,36,39,CLD); return; }
    const tall=kind==='officer'?4:0;
    P(-.17,.17,-.02,.38,0,2,CLD);
    P(-.12,-.02,.08,.28,2,20,CL,cl); P(.02,.12,.08,.28,2,20,CL,cl);
    P(-.17,.17,.04,.32,18,28+tall,CL,(s,a,z)=>Math.floor(z)%3===0?CLD:cl(s,a,z));
    P(-.16,.16,.06,.3,28+tall,42+tall,CL,(s,a,z)=>kind!=='plain'&&Math.floor(z)%3===1&&Math.floor(a)%2?CLD:kind==='officer'&&s==='f'&&Math.abs(a-3.84)<1.2?[140,60,52]:cl(s,a,z));
    P(-.23,-.16,.1,.26,26+tall,42+tall,CL,cl); P(.16,.23,.04,.22,30+tall,42+tall,CL,cl);
    P(-.04,.04,.12,.22,42+tall,45+tall,CL);
    P(-.07,.07,.1,.28,45+tall,53+tall,CL,(s,a,z)=>{ const zz=Math.floor(z); if(s!=='f')return cl(s,a,z); if(zz===5&&Math.abs(Math.abs(a-1.7)-.9)<.5)return [60,54,48]; if(zz===3&&Math.abs(a-1.7)<.8)return CLD; return cl(s,a,z); });
    if(kind==='officer')P(-.08,.08,.08,.3,53+tall,57+tall,[96,88,82]); else P(.0,.08,.16,.26,53+tall,56+tall,CL);
  };
  man(.14,.4,'officer',2021); man(.38,.45,'armour',2023); man(.62,.42,'plain',2025); man(.86,.45,'kneel',2027);
  return prop(B); }
function suttonHoo(x,y){ PNAME='the Sutton Hoo helmet'; const r=rect(x,y,[0,1],.7,.7), Z=40, H=22, B=glassCase(r,Z,H,{cab:[40,36,34],floor:[30,28,28]});
  const P=part(B,r,Z+4), I=[96,98,104], T=[188,192,196], TD=[140,144,150], G=[206,164,72];
  B.push(fb(r,.47,.53,.47,.53,Z,Z+4,[30,28,28],null,()=>[36,34,34],{foot:0}));
  P(-.1,.1,.24,.48,3,9,I,(s,a,z)=>Math.floor(a/2+Math.floor(z/2))%2?T:TD,(u,v)=>Math.abs(u)<.015?G:Math.floor((u+.2)*30+v*20)%2?T:TD);
  P(-.075,.075,.22,.26,0,6,I,(s,a,z)=>{ if(s!=='f')return I; const u=a-1.8, zz=Math.floor(z); if(zz===4&&Math.abs(u)<1.9)return G; if(Math.abs(u)<.6&&zz>=1&&zz<4)return G; if(zz===1&&Math.abs(u)<1.6)return G; if(zz===3&&Math.abs(Math.abs(u)-1.1)<.5)return [20,18,20]; return TD; });
  P(-.11,-.075,.26,.4,0,5,T); P(.075,.11,.26,.4,0,5,T); P(-.09,.09,.44,.5,0,4,T,(s,a,z)=>Math.floor(z)%2?T:TD);
  return prop(B); }
function jadeSuit(x,y){ PNAME='jade burial suit'; const r=rect(x,y,[0,1],2.5,1), Z=18, H=18, B=glassCase(r,Z,H,{cab:[44,38,34],floor:[120,30,34]});
  const J=[[104,148,104],[122,164,118],[88,130,94],[136,160,128]], WI=[200,164,80], jade=(a,b)=>a%2===0&&b%2===0?WI:J[Math.floor(hash(a>>1,b>>1,2031)*4)];
  const bx=(t0,t1,d0,d1,h)=>B.push(fb(r,t0,t1,d0,d1,Z,Z+h,J[0],(s,t,z,len)=>jade(Math.floor(t*len*FP),Math.floor(z)),(t,d,X,Y)=>jade(Math.floor(X*24),Math.floor(Y*24)),{foot:0}));
  bx(.86,.97,.42,.58,6); bx(.84,.86,.46,.54,4); bx(.52,.84,.33,.67,7); bx(.54,.82,.27,.33,5); bx(.54,.82,.67,.73,5);
  bx(.5,.54,.27,.33,4); bx(.5,.54,.67,.73,4); bx(.12,.52,.36,.49,5); bx(.12,.52,.51,.64,5); bx(.06,.12,.35,.49,6); bx(.06,.12,.51,.65,6);
  return prop(B); }
const K={'Tutankhamun\'s mask':tutMask,'painted coffin':coffin,'terracotta warriors':warriors,'the Sutton Hoo helmet':suttonHoo,'jade burial suit':jadeSuit};
for(const k in K){ CATALOG[k]=(x,y)=>K[k](x,y); KIND_OF[k]=k; }
})();
