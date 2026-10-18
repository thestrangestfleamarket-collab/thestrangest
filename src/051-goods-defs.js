const gk=(c,k)=>[Math.min(255,c[0]*k),Math.min(255,c[1]*k),Math.min(255,c[2]*k)];
const gMat=(hh,o)=>(q,n)=>{ if(n[2]>.5)return o.top||gk(o.c,1.1); if(n[2]<-.5)return o.bot||gk(o.c,.7); const z=q[2]/hh;
  if(o.bands)for(const [a,b,c] of o.bands)if(z>=a&&z<b)return c;
  if(o.lab&&n[1]>.5){ const [c,w,a,b]=o.lab; if(Math.abs(q[0])<w&&z>a&&z<b)return c; }
  if(o.crimp&&z>.8&&(Math.floor((q[0]+1)*60)&1))return gk(o.c,.7);
  return o.c; };
const GW=[240,238,230], GR=[200,200,206];
const GSC=1.25;
const box=(x,y,z,o)=>({t:'box',c:[0,0,z*GSC],h:[x*GSC,y*GSC,z*GSC],mat:gMat(z*GSC,o)}), cyl=(r,hh,o,z0=0)=>({t:'cyl',c:[0,0,(z0+hh)*GSC],r:r*GSC,hh:hh*GSC,mat:gMat(hh*GSC,o)});
const GOOD={
  can:(c)=>({parts:[cyl(.07,.125,{c,top:GR,bot:GR,bands:[[.85,1.01,GR],[-1.01,-.85,GR],[-.15,.35,gk(c,1.35)]]})],m:.37}),
  water:()=>({parts:[cyl(.068,.17,{c:[170,206,236],bands:[[-.2,.25,GW]]}),cyl(.026,.035,{c:[170,206,236],top:GW,bands:[[.3,1.01,GW]]},.34)],m:.52}),
  bottle:(c,cap=GW,lab=GW)=>({parts:[cyl(.07,.17,{c,bands:[[-.3,.3,lab]]}),cyl(.028,.04,{c,top:cap,bands:[[.2,1.01,cap]]},.34)],m:.6}),
  milk:(c)=>({parts:[box(.1,.1,.2,{c:GW,top:gk(GW,.9),bands:[[-1.01,-.8,c],[-.2,.35,c]]})],m:1.9}),
  eggs:()=>({parts:[box(.16,.1,.075,{c:[200,184,152],top:[214,198,166],bands:[[.6,1.01,[184,168,138]]]})],m:.4}),
  butter:()=>({parts:[box(.12,.06,.04,{c:[240,222,130],top:[250,236,170]})],m:.25}),
  cheese:()=>({parts:[box(.1,.1,.025,{c:[246,190,70],top:[214,226,234]})],m:.2}),
  yogurt:(c)=>({parts:[cyl(.07,.085,{c:GW,top:c,bands:[[-.4,.4,c]]})],m:.16}),
  cereal:(c)=>({parts:[box(.2,.07,.29,{c,lab:[[250,240,200],.13,-.1,.6]})],m:.5}),
  bread:()=>({parts:[box(.3,.125,.12,{c:[214,168,104],top:[232,196,140],bands:[[-1.01,-.7,[190,140,84]]]}),box(.03,.1,.08,{c:[230,230,236],top:[220,60,60]})],m:.6}),
  bagels:()=>({parts:[box(.2,.1,.1,{c:[230,226,214],top:[236,232,222],lab:[[200,150,90],.14,-.6,.5]})],m:.45}),
  coffee:(c)=>({parts:[cyl(.1,.135,{c,top:GR,bot:GR,bands:[[-.3,.3,[240,230,200]]]})],m:.9}),
  oats:()=>({parts:[cyl(.1,.19,{c:[200,150,90],top:[230,200,150],bands:[[-.4,.4,[240,230,200]]]})],m:.55}),
  bag:(c,w=.15,d=.09,h=.22,m=1)=>({parts:[box(w,d,h,{c,crimp:1,lab:[gk(c,1.35),w*.7,-.4,.4]})],m}),
  jar:(c,lid=[200,60,50])=>({parts:[cyl(.08,.11,{c,top:lid,bands:[[.82,1.01,lid],[-.4,.4,[240,236,226]]]})],m:.5}),
  soup:(c)=>({parts:[cyl(.078,.105,{c:GW,top:GR,bot:GR,bands:[[.85,1.01,GR],[-.6,.4,c]]})],m:.42}),
  tuna:()=>({parts:[cyl(.088,.04,{c:GR,top:GR,bands:[[-.6,.6,[60,110,170]]]})],m:.18}),
  pasta:()=>({parts:[box(.08,.05,.25,{c:[40,80,170],lab:[[240,220,150],.05,-.2,.5]})],m:.5}),
  noodle:()=>({parts:[cyl(.095,.11,{c:GW,top:[220,60,40],bands:[[.75,1.01,[220,60,40]]]})],m:.1}),
  candy:(c)=>({parts:[box(.13,.035,.012,{c,top:gk(c,1.25)})],m:.05}),
  gum:(c)=>({parts:[box(.085,.022,.02,{c,top:gk(c,1.2)})],m:.03}),
  tp:()=>({parts:[box(.21,.21,.12,{c:[244,244,244],top:[226,230,240],bands:[[-.1,.1,[210,214,226]]]})],m:.5}),
  towels:()=>({parts:[cyl(.12,.28,{c:[244,244,244],top:[236,236,236],bands:[[-.2,.2,[90,150,210]]]})],m:.3}),
  dish:()=>({parts:[box(.085,.04,.2,{c:[90,190,110],top:[230,230,230]}),box(.02,.02,.025,{c:GW},.4)],m:.5}),
  jug:()=>({parts:[box(.2,.12,.25,{c:[240,140,40],lab:[GW,.14,-.5,.3]}),box(.06,.05,.04,{c:[240,140,40],top:[40,40,44]},.54)],m:3}),
  sponge:()=>({parts:[box(.09,.06,.03,{c:[240,220,60],top:[60,150,80]})],m:.03}),
  tbags:()=>({parts:[box(.25,.12,.12,{c:[60,64,70],lab:[[230,230,230],.18,-.4,.4]})],m:.5}),
  bulbs:()=>({parts:[box(.06,.06,.115,{c:GW,top:[240,200,60],bands:[[.6,1.01,[240,200,60]]]})],m:.08}),
  batt:()=>({parts:[box(.1,.02,.16,{c:[220,60,50],lab:[[210,170,60],.06,-.5,.5]})],m:.1}),
  matches:()=>({parts:[box(.05,.035,.015,{c:[200,40,40],top:[230,220,200]})],m:.02}),
  lighter:(c)=>({parts:[box(.085,.025,.012,{c,top:gk(c,1.2)})],m:.02}),
  soap:(c)=>({parts:[box(.095,.06,.03,{c,top:gk(c,1.15)})],m:.12}),
  paste:()=>({parts:[box(.19,.04,.04,{c:[240,240,240],top:[240,240,240],lab:[[40,110,200],.19,-1.01,1.01]})],m:.15}),
  brush:(c)=>({parts:[box(.03,.015,.2,{c,top:GW,bands:[[.7,1.01,GW]]})],m:.03}),
  shampoo:(c)=>({parts:[box(.075,.04,.2,{c,top:GW,lab:[GW,.05,-.3,.3]})],m:.45}),
  deo:()=>({parts:[cyl(.047,.145,{c:[80,90,110],top:[230,230,230],bands:[[.75,1.01,[230,230,230]]]})],m:.15}),
  pills:()=>({parts:[box(.095,.04,.065,{c:GW,top:GW,bands:[[.4,1.01,[220,50,50]]]})],m:.05}),
  cotton:()=>({parts:[box(.15,.075,.15,{c:[226,226,236],crimp:1,lab:[[160,190,230],.1,-.3,.3]})],m:.1}),
  catfood:()=>({parts:[cyl(.088,.05,{c:GR,top:GR,bands:[[-.7,.6,[150,90,170]]]})],m:.17}),
  dogfood:()=>({parts:[box(.2,.08,.3,{c:[170,110,50],crimp:1,lab:[[240,220,150],.14,-.4,.3]})],m:2}),
  fishfood:()=>({parts:[cyl(.065,.09,{c:[236,232,222],top:[200,50,40],bands:[[.7,1.01,[200,50,40]],[-.4,.1,[50,104,176]]]})],m:.08}),
  bananas:()=>({parts:[box(.16,.08,.045,{c:[240,210,60],top:[244,220,80],bands:[[-1.01,-.5,[200,170,40]]]})],m:.9})};
const GC={red:[196,60,52],blue:[40,90,170],grn:[70,150,90],yel:[228,170,60],org:[240,140,40],pur:[120,60,150],pink:[226,120,150],brn:[120,70,40],blk:[40,40,46],sky:[150,200,240]};
const GLAY={
  fridge1:[[['water',4]],[['can',3,GC.red],['can',2,GC.grn]],[['can',3,GC.blk],['can',2,GC.sky]],[['bottle',4,[110,60,40],[220,40,40]]]],
  fridge2:[[['bottle',4,GC.org]],[['bottle',4,GC.yel,GW,[90,150,70]]],[['can',5,GC.blk]],[['bottle',4,[200,170,130],[90,60,40],[90,60,40]]]],
  fridge3:[[['milk',2,GC.blue],['milk',2,GC.red]],[['eggs',2]],[['butter',2],['cheese',2]],[['yogurt',3,GC.pink],['yogurt',2,GC.blue]]],
  aisle1a:[[['bread',2],['bagels',2]],[['cereal',2,GC.red],['cereal',2,GC.yel],['cereal',1,GC.blue],['oats',2]],[['coffee',2,GC.brn],['coffee',1,GC.red],['bag',2,GW,.15,.09,.22,2],['bag',1,[230,200,140],.15,.09,.22,2]],[['jar',3,[160,100,50]],['jar',3,[150,40,80],GR],['bag',2,[240,236,226],.14,.07,.19,1]]],
  aisle1b:[[['soup',4,GC.red],['soup',3,GC.grn],['soup',3,[200,120,60]]],[['soup',4,GC.blue],['tuna',4]],[['pasta',5],['bag',2,GW,.13,.06,.2,1]],[['noodle',7]]],
  aisle2a:[[['bag',3,GC.yel,.22,.075,.3,.2],['bag',3,GC.red,.22,.075,.3,.2]],[['bag',3,GC.grn,.2,.07,.25,.2],['bag',2,GC.org,.2,.07,.25,.2]],[['bag',3,[140,90,60],.2,.06,.1,.3],['bag',3,[240,220,160],.12,.05,.17,.25]],[['candy',6,GC.brn],['candy',6,GC.red]]],
  aisle2b:[[['catfood',8]],[['catfood',6],['jar',2,GW,[60,60,60]]],[['dogfood',3]],[['fishfood',5]]],
  back1:[[['tp',3],['towels',3]],[['dish',3],['jug',2],['sponge',2]],[['tbags',2],['bulbs',3],['batt',3]],[['matches',6]]],
  back2:[[['soap',4,[150,200,230]],['paste',3]],[['shampoo',3,GC.blue],['shampoo',3,GC.pink],['deo',4]],[['brush',6,[120,200,230]],['pills',4]],[['cotton',4]]],
  counter:[['candy',3,GC.brn],['candy',3,GC.yel],['gum',3,GC.grn],['gum',3,GC.blue],['lighter',3,GC.red],['bananas',1]]};
