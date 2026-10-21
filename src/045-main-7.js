
{ const {art,onF,lit,C,rect,sub,fb,worn,metal}=MLK, FP=24;
  function vending(x,y,f=[1,0],red=0){ '@later'; SHARED.PNAME=red?'vending machine, red':'vending machine, white'; const r=rect(x,y,f,1.1,.85), B=red?[116,30,36]:[220,222,226], BD=sh(B,.7), cans=[[220,60,60],[70,140,220],[240,200,60],[90,180,90],[230,230,230],[240,130,60]];
    const IN=lit([200,210,222]), body=(s,t,z)=>z<3?BD:worn(B,t,z,105), hole=[22,22,26], fb1=(t0,t1,d0,d1,z0,z1,c,pt,tp,o)=>fb(r,t0,t1,d0,d1,z0,z1,c,pt,tp,{foot:1,...o}), Q=[];
    Q.push(fb(r,0,1,.04,1,0,3,BD,null,()=>BD));
    for(const [a,b,inn] of [[0,.06,'r'],[.94,1,'l']])Q.push(fb1(a,b,.04,1,3,62,B,(s,t,z)=>s===inn&&z>=19&&z<53?IN:body(s,t,z+3),()=>sh(B,.96)));
    Q.push(fb1(.06,.94,.94,1,3,62,B,(s,t,z)=>s==='f'?lit([228,236,244]):body(s,t,z+3),()=>sh(B,.96)));
    Q.push(fb1(.06,.94,.04,.94,56,62,B,(s,t,z)=>s==='f'&&z<3&&t<.78?[60,60,66]:worn(B,t,z+56,105),()=>sh(B,.96)));
    Q.push(fb1(.74,.94,.06,.94,22,56,B,(s,t,z)=>s==='l'?IN:worn(B,t,z+22,105),()=>B));
    Q.push(fb1(.77,.92,.04,.06,26,54,BD,null,()=>BD,{nb:1}));
    for(let i=0;i<5;i++){ const z=49-i*5, c=lit(i===0?[240,80,80]:[80,220,120]); Q.push(fb1(.8,.89,.02,.04,z,z+2,c,null,()=>c,{nb:1})); }
    Q.push(fb1(.8,.89,.03,.04,27,29,hole,null,()=>hole,{nb:1}));
    Q.push(fb1(.06,.74,.04,.94,22,25,B,(s,t,z)=>worn(B,t,z+22,105),(t,d)=>d<.1?B:IN));
    Q.push(fb1(.06,.94,.04,.36,14,22,B,(s,t,z)=>s==='f'&&z>3&&z<6&&t>.1&&t<.88?BD:worn(B,t,z+14,105),()=>B));
    Q.push(fb1(.06,.94,.04,.36,3,6,B,body,(t,d)=>d>.1&&t>.19&&t<.83?hole:B));
    for(const [a,b] of [[.06,.19],[.83,.94]])Q.push(fb1(a,b,.04,.36,6,14,B,(s,t,z)=>worn(B,t,z+6,105),()=>B));
    Q.push(fb1(.19,.83,.32,.36,6,14,hole,()=>hole,()=>hole));
    Q.push(fb1(.2,.82,.05,.07,10,14,sh(BD,.85),null,()=>BD,{nb:1}));
    for(let s=0;s<3;s++){ const z=27+s*10; Q.push(fb1(.07,.73,.1,.88,z-1,z,[160,164,170],null,()=>lit([180,184,190]),{nb:1}));
      for(let i=0;i<4;i++)for(const [d0,row] of [[.14,0],[.48,1]]){ const c=lit(cans[Math.floor(hash(i,s+row*7,103)*6)]), t0=.11+i*.155;
        Q.push(fb1(t0,t0+.09,d0,d0+.14,z,z+7,c,(ss,t,zz)=>zz>5?lit([200,200,206]):t<.35?lit(sh(c,1.3)):c,()=>lit([200,200,206]),{nb:1})); } }
    Q.push(fb1(.06,.74,.04,.05,25,56,B,(s,t,z,len)=>{ const g=Math.floor(t*len*FP)+Math.floor(z); return s==='f'&&z>14&&z<26&&(g===30||g===35)?lit([240,246,252]):null; },()=>null,{nb:1}));
    const p=prop(Q); LAMPS.push({own:1,x:r.cx+f[0]*.8,y:r.cy+f[1]*.8,z:30,r:2.4,c:[.9,.95,1],prop:p,day:true}); return p; }

  CATALOG['vending machine, white']=(x,y,f)=>vending(x,y,f||[1,0],0); CATALOG['vending machine, red']=(x,y,f)=>vending(x,y,f||[1,0],1); }
}
SHARED.BOD.STOREK=STOREK;

{
const LBLD=[{id:'ldungeon',...CASTLE.hall,st:1}], CATALOG={}, CAT_INFO={}, CAT_DEPTS=[], LAMPS=[];
