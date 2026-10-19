(()=>{ const {FP,rect,fb,worn,art,plane,line,ell,glassCase,plinth,BRZ,BRZL}=MUK, c=MUC;
const CLOTH=[34,40,58], CLOTHL=[44,52,72];
const board=(W,H,draw)=>art(W,H,(put,w,h)=>{ for(let z=0;z<h;z++)for(let x=0;x<w;x++)put(x,z,hash(x>>1,z>>1,1901)<.1?CLOTHL:CLOTH); draw(put,w,h); });
function rosetta(x,y){ PNAME='the Rosetta Stone'; const r=rect(x,y,[0,1],1.3,.9), Z=28, H=40, B=glassCase(r,Z,H,{cab:[52,50,48],floor:[58,54,50]});
  const G=[62,64,70], GL=[98,100,106], GD=[44,46,50], INK=[150,150,156], hs=[26,29,31,32,29,24], n=hs.length, w=.84/1.3, d0=.33, d1=.33+.32/.9;
  for(let i=0;i<n;i++){ const t0=.5-w/2+i*w/n, t1=t0+w/n, h=hs[i];
    B.push(fb(r,t0,t1,d0,d1,Z,Z+h,G,(s,t,z,len)=>{ const a=Math.floor((i+t)*len*FP), zz=Math.floor(z); if(zz>=h-1||(s==='l'&&i===0)||(s==='r'&&i===n-1))return GD;
        const v=Math.abs(zz-(h-4)-(a-10)*.25)<1&&a<18; if(v)return [168,120,116];
        if(s==='f'&&a>1&&a<20-1&&zz>0){ if(zz<11)return zz%2===0&&hash(a,zz,1903)<.55?INK:G;
          if(zz>=12&&zz<21)return zz%2===1&&hash(a>>1,zz,1905)<.6?INK:G;
          if(zz>=22&&zz<h-2)return (a%3<2&&zz%3<2)&&hash(a>>1,zz>>1,1907)<.7?INK:G; }
        return hash(a,zz,1909)<.08?GL:G; },()=>GD,{foot:0})); }
  return prop(B); }
function tablets(x,y){ PNAME='clay tablets'; const r=rect(x,y,[0,1],1.8,.6), Z=26, H=46;
  const back=board(Math.round(1.8*FP),H-2,(put,W,h)=>{ const wedge=(cx,cz,k,dir)=>{ for(let i=0;i<k*3;i++)for(let j=-i/2;j<=i/2;j++)put(dir?cx+i:cx+j,dir?cz+j:cz-i,[200,170,120]); };
    for(let i=0;i<5;i++){ wedge(8+i*8,34,2,1); wedge(10+i*8,26,2,0); } wedge(58,36,3,1); wedge(66,30,3,0); wedge(70,36,2,1); });
  const B=glassCase(r,Z,H,{cab:[52,50,48],back:MUK.plane(r,.86,.9,Z,H-2,back)});
  const clay=[150,112,76], clayL=[184,146,104], clayD=[110,80,54], tab=(t,w,h,col,face)=>{ B.push(fb(r,t-.012,t+.012,.4,.6,Z,Z+3,[40,40,42],null,()=>[50,50,52],{foot:0}));
      B.push(fb(r,t-w/2,t+w/2,.46,.54,Z+3,Z+3+h,col,(s,tt,z,len)=>{ const a=Math.floor(tt*len*FP), zz=Math.floor(z); if(s!=='f')return sh(col,.9); return face(a,zz,Math.round(len*FP))||col; },()=>sh(col,1.1),{foot:0})); };
  tab(.14,.17/1.8,4,clay,(a,z,W)=>z%2===0&&a>0&&a<W-1&&hash(a,z,1911)<.6?clayD:null);
  tab(.34,.14/1.8,3,clayL,(a,z,W)=>a%2===0&&z>0?clayD:null);
  tab(.52,.1/1.8,3,clay,(a,z)=>(a===1&&z===1)||(a===2&&z===2)?[60,44,30]:hash(a,z,1913)<.3?clayD:null);
  tab(.68,.09/1.8,3,[196,170,130],(a,z)=>z%2?[150,126,96]:null);
  B.push(fb(r,.8,.94,.4,.6,Z,Z+2,[40,40,42],null,()=>[50,50,52],{foot:0}),fb(r,.8,.94,.42,.58,Z+2,Z+5,[176,150,112],(s,t,z)=>Math.floor(t*12)%2&&z>1?[136,110,78]:[176,150,112],()=>[190,166,128],{foot:0}));
  return prop(B); }
function ishango(x,y){ PNAME='the Ishango bone'; const r=rect(x,y,[0,1],.6,.6), Z=34, H=30;
  const back=board(Math.round(.6*FP),H-2,(put,W,h)=>{ const bz=12, b0=1, b1=W-2; for(let x=b0;x<b1;x++)for(let z=bz-2;z<=bz+2;z++)put(x,z,z===bz+2?[170,140,100]:z===bz-2?[96,72,48]:[136,106,72]);
    put(b1,bz,[230,230,236]); put(b1+1,bz,[230,230,236]); put(b1,bz+1,[200,200,210]);
    let x=b0+1; for(const g of [3,6,4,8,10,5,5,7]){ for(let i=0;i<g&&x<b1-1;i++,x+=.6)put(Math.floor(x),bz+((i&1)?2:3),[60,44,30]); x+=1; } });
  const B=glassCase(r,Z,H,{cab:[52,50,48],back:MUK.plane(r,.86,.9,Z,H-2,back)});
  B.push(fb(r,.48,.52,.45,.55,Z,Z+5,BRZ,null,()=>BRZL,{foot:0}),fb(r,.36,.36+.11/.6,.47,.53,Z+5,Z+6,[110,82,54],(s,t)=>t>.85?[220,220,228]:[110,82,54],()=>[136,106,72],{foot:0}));
  return prop(B); }
function antikythera(x,y){ PNAME='the Antikythera mechanism'; const r=rect(x,y,[0,1],1.4,.8), Z=28, H=36;
  const back=board(Math.round(1.4*FP),H-2,(put,W,h)=>{ const gear=(cx,cz,R,spokes)=>{ for(let z=Math.floor(cz-R-2);z<=cz+R+2;z++)for(let x=Math.floor(cx-R-2);x<=cx+R+2;x++){ const dx=x+.5-cx, dz=z+.5-cz, rr=Math.hypot(dx,dz), a=Math.atan2(dz,dx);
        const tooth=rr<=R+1.6&&rr>R&&Math.floor((a+Math.PI)/(2*Math.PI)*Math.max(12,R*3))%2===0, rim=rr<=R&&rr>R-1.5, hub=rr<1.6, sp=rr<R&&spokes&&[0,1,2,3].some(k=>Math.abs(Math.sin(a-k*Math.PI/2))*rr<.8);
        if(tooth||rim||hub||sp)put(x,z,rr>R?[176,140,74]:[150,118,62]); } };
    gear(14,18,10,1); gear(29,24,5,0); gear(27,9,4,0); gear(38,16,6,1); gear(48,23,4,0); gear(50,10,5,0); gear(60,18,6,1); });
  const B=glassCase(r,Z,H,{cab:[52,50,48],back:MUK.plane(r,.86,.9,Z,H-2,back)}), V=[82,106,84], VL=[118,146,112], VD=[56,76,60];
  const frag=(t,w,h)=>B.push(fb(r,t,t+w,.4,.6,Z,Z+h,V,(s,tt,z,len)=>{ const a=Math.floor(tt*len*FP); return hash(a,Math.floor(z),1921)<.25?VL:hash(a,Math.floor(z),1923)<.15?VD:V; },(t2,d)=>hash(Math.floor(t2*20),Math.floor(d*10),1925)<.3?VL:V,{foot:0}));
  frag(.06,.18/1.4,5); frag(.26,.1/1.4,3); frag(.36,.08/1.4,3);
  B.push(fb(r,.56,.56+.34/1.4,.4,.4+.18/.8,Z,Z+6,[110,76,46],(s,t,z,len)=>{ if(s!=='f')return [110,76,46]; const a=t*len*FP; return z>1&&z<5&&Math.hypot(a-4,z-3)<2.4?[196,160,84]:[110,76,46]; },()=>[124,88,54],{foot:0}));
  return prop(B); }
const K={'the Rosetta Stone':rosetta,'clay tablets':tablets,'the Ishango bone':ishango,'the Antikythera mechanism':antikythera};
for(const k in K){ CATALOG[k]=(x,y)=>K[k](x,y); KIND_OF[k]=k; }
})();
