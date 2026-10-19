(()=>{ const {FP,rect,fb,worn,art,plane,line,ell,bone,BONE,glassCase,plinth,BRZ,BRZL}=MUK, c=MUC;
const part=(B,r,zb)=>(x0,x1,y0,y1,z0,z1,col,paint,top)=>B.push(fb(r,.5+x0/r.W,.5+x1/r.W,y0/r.D,y1/r.D,zb+z0,zb+z1,col,paint?(s,t,z,len)=>paint(s,t*len*FP,z):null,
  top?(t,d)=>top((t-.5)*r.W,d*r.D):()=>sh(col,1.08),{foot:0}));
const CLOTH=[34,40,58], CLOTHL=[44,52,72], board=(W,H,draw)=>art(W,H,(put,w,h)=>{ for(let z=0;z<h;z++)for(let x=0;x<w;x++)put(x,z,hash(x>>1,z>>1,2101)<.1?CLOTHL:CLOTH); draw(put,w,h); });
const FOUND=[112,82,56], CAST=[214,204,180], FOUNDD=[84,60,40], CASTD=[184,174,150];
function lucy(x,y){ PNAME='Lucy'; const r=rect(x,y,[0,1],.9,.9), Z=14, H=46, B=glassCase(r,Z,H,{cab:[52,50,48],floor:[60,56,52]}), P=part(B,r,Z), o=.4;
  const pc=(f)=>f?FOUND:CAST, ribs=(s,a,z)=>Math.floor(z)%2?null:(a%3<1?CASTD:FOUND);
  for(const [sx,f] of [[-1,1],[1,0]]){ const X=(a,b)=>sx<0?[-b,-a]:[a,b];
    P(...X(.02,.07),o,o+.1,0,1,pc(f)); P(...X(.03,.05),o+.03,o+.06,1,9,pc(f)); P(...X(.04,.06),o+.03,o+.06,9,13,pc(f)); P(...X(.055,.075),o+.03,o+.06,13,17,pc(f));
    P(...X(.11,.13),o+.03,o+.06,19,27,pc(f)); P(...X(.12,.14),o+.03,o+.06,13,19,pc(f)); P(...X(.12,.15),o+.02,o+.07,11,13,pc(f)); }
  P(-.1,.1,o+.01,o+.08,16,19,FOUND,(s,a,z)=>s==='f'&&Math.abs(a-2.4)<.9&&z>1?null:(a<2.4?FOUND:CAST));
  P(-.012,.012,o+.06,o+.08,19,28,FOUND); P(-.09,.09,o-.02,o+.08,20,27,FOUND,ribs,()=>null);
  P(-.13,.13,o+.03,o+.05,27,28,CAST);
  P(-.05,.05,o-.03,o+.08,28,33,CAST,(s,a,z)=>s==='f'&&Math.floor(z)===2&&Math.abs(Math.abs(a-1.2)-.6)<.4?[40,36,32]:CAST); P(-.04,.04,o-.03,o+.03,27,29,FOUND);
  return prop(B); }
function laetoli(x,y){ PNAME='Laetoli footprints'; const W=3.2, r=rect(x,y,[0,1],W,1.2), Z=12, H=8, B=glassCase(r,Z,H,{cab:[52,50,48]});
  const ASH=[150,142,128], ASHD=[110,102,90], ASHL=[170,162,148];
  B.push(fb(r,.02,.98,.06,.94,Z,Z+1,ASH,null,(t,d,X,Y)=>{ const u=t*W, v=d*1.2, n=hash(Math.floor(u*24),Math.floor(v*24),2103);
      for(const [vc,s0] of [[.42,0],[.78,.2]]){ const k=Math.round((u-s0)/.42), uc=s0+k*.42, vv=vc+(k&1?.06:-.06), du=(u-uc)/.11, dv=(v-vv)/.045;
        if(du*du+dv*dv<1)return du>.5?ASHD:sh(ASHD,1.08); if(Math.abs(u-uc-.13)<.03&&Math.abs(v-vv)<.05)return ASHD; }
      return n<.1?ASHD:n>.92?ASHL:ASH; },{foot:0}));
  return prop(B); }
function handAxes(x,y){ PNAME='hand axes'; const r=rect(x,y,[0,1],.9,.6), Z=30, H=26;
  const back=board(Math.round(.9*FP),H-2,(put,W,h)=>{ const cx=W*.62, cz=h/2; for(let z=0;z<h;z++)for(let q=0;q<W;q++){ const dx=(q+.5-cx)/7, dz=(z+.5-cz)/10; if(dx*dx+dz*dz*(dz>0?1.6:.7)>1)continue;
      const s=Math.floor(cvNoise(q/2.5,z/2.5,2105)*5); put(q,z,[[150,138,120],[128,116,98],[168,156,138],[110,100,86],[140,128,110]][s]); } });
  const B=glassCase(r,Z,H,{cab:[52,50,48],back:MUK.plane(r,.86,.9,Z,H-2,back)}), LAVA=[126,116,102];
  const pin=t=>B.push(fb(r,t-.01,t+.01,.45,.55,Z,Z+2,BRZ,null,()=>BRZL,{foot:0}));
  pin(.3); B.push(fb(r,.3-.13/.9,.3+.13/.9,.47,.53,Z+2,Z+8,LAVA,(s,t,z,len)=>{ const a=t*len*FP, m=len*FP/2, w=(z<2?.6:1-(z-2)/5)*m; if(Math.abs(a-m)>w)return null; return hash(Math.floor(a),Math.floor(z),2107)<.35?[104,96,84]:LAVA; },()=>null,{foot:0}));
  pin(.62); B.push(fb(r,.62-.05/.9,.62+.05/.9,.46,.54,Z+2,Z+5,[140,124,100],(s,t,z)=>z>2&&t>.5?[110,98,80]:[140,124,100],()=>[152,136,110],{foot:0}));
  return prop(B); }
function skulls(x,y){ PNAME='four skulls'; const W=2.4, r=rect(x,y,[0,1],W,.6), Z=26, H=30;
  const back=board(Math.round(W*FP),H-2,(put,w)=>{ line(put,4,6,w-5,6,[200,190,160],1); for(let i=0;i<=3;i++)line(put,4+i*(w-9)/3,4,4+i*(w-9)/3,8,[200,190,160],1); });
  const B=glassCase(r,Z,H,{cab:[52,50,48],back:MUK.plane(r,.86,.9,Z,H-2,back)}), P=part(B,r,Z+3);
  const sk=(cx,w,d,h,brow,col)=>{ const cd=col===FOUND?FOUNDD:CASTD; B.push(fb(r,.5+(cx-.012)/W,.5+(cx+.012)/W,.45,.55,Z,Z+3,[40,40,42],null,()=>[50,50,52],{foot:0}));
    P(cx-w/2,cx+w/2,.24,.24+d,1,1+h,col,(s,a,z)=>{ const zz=Math.floor(z); if(s==='f'&&zz===Math.floor(h*.45)&&Math.abs(Math.abs(a-w*12)-w*5)<w*3)return [36,30,26]; if(s==='f'&&zz===Math.floor(h*.6)&&brow)return cd; return col; });
    P(cx-w*.35,cx+w*.35,.2,.3,0,Math.max(2,h*.4),col,(s,a,z)=>z<1?cd:col); };
  sk(-.9,.12,.15,5,0,CAST); sk(-.3,.16,.2,6,1,FOUND); sk(.3,.18,.24,6,2,FOUND); sk(.9,.17,.2,8,0,CAST);
  return prop(B); }
function mammoth(x,y){ PNAME='woolly mammoth'; const S=MUSCAN.mammoth, r=rect(x,y,[0,1],S.W/FP+.5,S.D/FP+.5), Z=8, B=[plinth(r,Z,[36,34,34],{top:[46,44,42]})];
  return prop(B.concat(MUK.scanBoxes('mammoth',rect(x,y,r.f,S.W/FP,S.D/FP),Z))); }
function meteorite(x,y){ PNAME='Gibeon meteorite'; const r=rect(x,y,[0,1],.7,.7), Z=26, B=[plinth(r,Z,[96,94,92])], P=part(B,r,Z);
  const FE=[78,72,66], FED=[52,48,44], FEL=[150,150,154], skin=(s,a,z)=>{ if(s==='f'&&z>1&&z<8&&a>2&&a<13){ const u=Math.floor(a), zz=Math.floor(z); return (u+zz)%5===0||(u-zz+40)%5===0||zz%4===0?[124,128,134]:[176,180,186]; }
    return hash(Math.floor(a/2),Math.floor(z/2),2111)<.3?FED:FE; };
  P(-.3,.3,.14,.56,0,6,FE,skin); P(-.24,.26,.18,.52,6,9,FE,skin,(u,v)=>Math.hypot(u,v-.35)<.12?FEL:hash(Math.floor(u*24),Math.floor(v*24),2113)<.3?FED:FE); P(-.12,.14,.24,.44,9,10,FE,skin,()=>FEL);
  return prop(B); }
const K={'Lucy':lucy,'Laetoli footprints':laetoli,'hand axes':handAxes,'four skulls':skulls,'woolly mammoth':mammoth,'Gibeon meteorite':meteorite};
for(const k in K){ CATALOG[k]=(x,y)=>K[k](x,y); KIND_OF[k]=k; }
})();
