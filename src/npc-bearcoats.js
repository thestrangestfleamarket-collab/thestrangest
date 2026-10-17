// ---- THE COAT BEAR AND HIS COATS (owner, 17 Oct 2026, his picture: a shaggy grey-brown felted bear at a market, a blue knitted sweater under a
// brown coat with a shearling collar and a buckled pocket, holding coats up on wooden hangers: a donut coat, a patchwork coat, an ocean coat
// with fish and bubbles, a cherry-blossom coat, a clover coat, a waves-and-sand coat; "create this as a character in game, and all the coats as
// items, be as detailed as possible"). All built here in code in their parts (npc-parts.js): the bear (head, muzzle, ears, eyes, nose, body,
// sweater, coat, collar, lapels, pocket, sleeves, paws, legs, feet, his shag), the coat he holds up, and each coat its own thing on its hanger
// (hook, bar, body, sleeves, lapels, buttons, and its own decoration), hung on a rack of two posts and a bar beside him at the park wall's
// foot. He stands at his rack as a seller does (not wandering), turning to you when you come near; a double click on a coat walks up to it.
// Cost: the bear some 5,000 triangles, the six coats and the rack some 17,000 together; no lights ----
const BEARCOATS={};
{ const {shape,limb,sph,cyl,box,torus,blob,noise,shell}=PARTSNPC.T, TAU=Math.PI*2;
  const part=(name,rank,of)=>({name,rank,of});
  let seed=11; const rnd=()=>{ seed=(seed*16807)%2147483647; return seed/2147483647; };
  // ---- the coats' colours
  const WOOD=[.72,.58,.4], DARK=[.2,.14,.1], CREAM=[.92,.88,.78];
  // ---- A COAT ON ITS HANGER, shaped as a coat a character wears (owner, 17 Oct 2026: "those should be shaped like coats ... coats that npcs
  // will wear"): a torso, flat front and back (an elliptical tube, wider than deep, a little fuller to the hem), its front open in a V under the
  // collar where the lapels fold back over the chest and the lining shows, buttoned below, patch pockets on the hips; the shoulders a low
  // dome on the hanger's arms; two sleeves hanging straight down beside the body, cuffed; the hook up from the collar. Its origin at the
  // hook's top (ox,oy,oz). deco(pts,rows,c) lays the decoration on its skin: pts(n,gap) gives n points spread over body and sleeves (each
  // {p,rot}: the point and its outward turn about y), rows(nr,nc) a grid over the body ----
  const coat=(pre,ox,oy,oz,col,deco,o={})=>{ const RX=.29, RZ=.125, TOP=oy-.14, HEM=oy-.98, L=TOP-HEM, SX=RX+.085;   // (SX: a sleeve's axis from the middle)
    const rx=y=>RX+(TOP-y)*.035, rz=y=>RZ+(TOP-y)*.02;
    const body=[ shape(cyl(1,1,L,22,1,true),col,[ox,(TOP+HEM)/2,oz]), shape(sph(1,18,6),col,[ox,TOP,oz]) ];   // (sized below: the tube and the shoulders' dome)
    { const g=body[0]; for(let i=0;i<g.P.length;i+=3){ const y=g.P[i+1]-(TOP+HEM)/2+(TOP+HEM)/2, yy=g.P[i+1]; g.P[i]=ox+(g.P[i]-ox)*rx(yy); g.P[i+2]=oz+(g.P[i+2]-oz)*rz(yy); }
      const d=body[1]; for(let i=0;i<d.P.length;i+=3){ d.P[i]=ox+(d.P[i]-ox)*RX; d.P[i+1]=TOP+(d.P[i+1]-TOP)*.09; d.P[i+2]=oz+(d.P[i+2]-oz)*RZ; } }
    const lining=o.lining||CREAM, lapelC=o.lapel||col;
    const front=[ shape(box(.2,.3,.01),lining,[ox,TOP-.15,oz+RZ+.004]),   // (the lining in the V)
      ...[-1,1].map(sx=>shape(box(.085,.3,.016),lapelC,[ox+sx*.075,TOP-.16,oz+RZ+.012],null,[0,0,sx*-24])),   // (the lapels, folded back)
      shape(shell(.1,.1,.06,10,Math.PI*.55,Math.PI*.9),lapelC,[ox,TOP+.02,oz],[1,1,.7]),   // (the collar round the back of the neck)
      shape(box(.03,L-.34,.012),col,[ox+.01,HEM+(L-.34)/2,oz+RZ+.012]),   // (the front edge, overlapping)
      ...[0,1,2].map(i=>shape(sph(.02,8,6),o.button||DARK,[ox+.03,TOP-.38-i*.16,oz+RZ+.024])),
      ...[-1,1].map(sx=>shape(box(.13,.13,.014),col,[ox+sx*.16,HEM+.3,oz+rz(HEM+.3)+.008])) ];   // (the pockets)
    const sleeves=[-1,1].flatMap(sx=>[limb([ox+sx*SX,TOP-.01,oz],[ox+sx*(SX+.02),HEM+.2,oz],.08,.072,col,10), shape(cyl(.078,.078,.06,10),o.cuff||col,[ox+sx*(SX+.02),HEM+.2,oz])]);
    const hanger=[ shape(torus(.035,.007,6,12),WOOD,[ox,oy-.035,oz]), shape(cyl(.008,.008,.08,6),WOOD,[ox,oy-.11,oz]), limb([ox-.24,TOP+.015,oz],[ox,oy-.13,oz],.012,.012,WOOD,6), limb([ox+.24,TOP+.015,oz],[ox,oy-.13,oz],.012,.012,WOOD,6) ];
    // the skin: a point on the body at angle a (0 the front) and height y, or on a sleeve (side sx, angle b), out by a little
    const onBody=(a,y,out=.012)=>{ const n=Math.atan2(Math.sin(a)/rx(y),Math.cos(a)/rz(y)); return {p:[ox+Math.sin(a)*(rx(y)+out),y,oz+Math.cos(a)*(rz(y)+out)],rot:n*180/Math.PI,a}; };
    const onSleeve=(sx,b,y,out=.012)=>{ const u=(TOP-.01-y)/(TOP-.21-HEM), X=ox+sx*(SX+.02*u), r=.08-.008*u+out; return {p:[X+Math.sin(b)*r,y,oz+Math.cos(b)*r],rot:b*180/Math.PI,a:b}; };
    const pts=(n,gap)=>{ const S=[]; let tries=0; const nr=Math.max(2,Math.round(.52/gap)), na=Math.max(2,Math.round(.36/gap));   // (the sleeves first: rows round each one's outer side, as many as the gap allows)
      for(const sx of [-1,1])for(let i=0;i<nr;i++)for(let j=0;j<na;j++){ const y=HEM+.28+(i+.5)/nr*(L-.36), b=sx*Math.PI/2+((j+.5)/na-.5)*Math.PI*1.1; const q=onSleeve(sx,b,y); q.sx=sx; q.y=y; S.push(q); }
      const need=S.length+n; while(S.length<need&&tries++<1200){ const y=HEM+.06+rnd()*(L-.1), a=rnd()*TAU; { if(y>TOP-.3&&Math.cos(a)>.9&&Math.abs(Math.sin(a))<.4)continue;   /* (then n over the body; the V at the top of the front stays clear) */ const q=onBody(a,y);
          if(S.every(s=>s.sx||Math.hypot(s.p[0]-q.p[0],s.p[1]-q.p[1],s.p[2]-q.p[2])>gap)){ q.sx=0; q.y=y; S.push(q); } } } return S; };
    const rows=(nr,nc,fn)=>{ for(let i=0;i<nr;i++)for(let j=0;j<nc;j++){ const a=(j+.5)/nc*TAU, y=TOP-.06-(i+.5)*(L-.1)/nr; fn(onBody(a,y),i,j); } };
    const D=[]; if(deco)deco(pts,rows,{ox,oy,oz,TOP,HEM,RX,RZ,onBody,onSleeve},D);
    return [part(pre+' hanger',3,hanger),part(pre+' body',1,body),part(pre+' sleeves',1,sleeves),part(pre+' front',2,front)].concat(D.length?[part(pre+' decoration',3,D)]:[]); };
  // the decorations, over the skin (rot: the piece turned to lie flat on it)
  const flat=(g,colr,q,extra=[0,0,0])=>shape(g,colr,q.p,null,[extra[0],q.rot+extra[1],extra[2]]);
  const DONUTS=(pts,rows,c,D)=>{ const GL=[[.95,.5,.65],[.4,.24,.14],[.9,.75,.5],[.98,.85,.9],[.55,.33,.2]]; for(const q of pts(95,.082)){ const g=GL[(rnd()*GL.length)|0]; D.push(flat(torus(.042,.018,5,10),g,q));
      for(let k=0;k<3;k++){ const b=rnd()*TAU, r=q.rot*Math.PI/180; D.push(shape(box(.013,.005,.005),[[1,1,1],[.4,.8,1],[1,.9,.3],[.3,.8,.4]][k%4],[q.p[0]+Math.cos(b)*.045*Math.cos(r),q.p[1]+Math.sin(b)*.045,q.p[2]-Math.cos(b)*.045*Math.sin(r)],null,[0,q.rot,rnd()*180])); } } };   // (sprinkles)
  const PATCH=(pts,rows,c,D)=>{ const PAL=[[.85,.15,.15],[.15,.55,.25],[.95,.75,.1],[.95,.92,.85],[.9,.45,.1],[.2,.2,.25],[.45,.3,.15]]; rows(9,20,q=>D.push(flat(box(.075,.085,.01),PAL[(rnd()*PAL.length)|0],q)));
    for(const q of pts(40,.085))if(q.sx)D.push(flat(box(.07,.08,.01),PAL[(rnd()*PAL.length)|0],q)); };   // (the sleeves too)
  const FISH=(q,D,col)=>{ const r=q.rot*Math.PI/180; D.push(flat(blob(.055,.03,.015,10,6),col,q)); D.push(shape(cyl(.0,.028,.045,4),col,[q.p[0]-Math.cos(r)*.07,q.p[1],q.p[2]+Math.sin(r)*.07],null,[0,q.rot,90])); D.push(shape(sph(.007,6,4),[0,0,0],[q.p[0]+Math.cos(r)*.028,q.p[1]+.008,q.p[2]-Math.sin(r)*.028+.012])); };
  const OCEAN=(pts,rows,c,D)=>{ rows(3,16,(q,i,j)=>{ q.p[1]+=Math.sin(j*1.3)*.03; D.push(flat(blob(.065,.022,.012,8,4),[[.85,.93,1],[.6,.8,1],[.9,.96,1]][i],q)); });   // (the waves' crests)
    for(const q of pts(6,.26))FISH(q,D,[[1,.55,.15],[1,.8,.2],[1,.45,.2]][(rnd()*3)|0]);
    for(const q of pts(10,.12))D.push(flat(torus(.022,.005,5,10),[.95,.98,1],q));   // (bubbles)
    for(let i=0;i<4;i++){ const q=c.onBody(i/4*TAU+.4,c.HEM+.05); for(let k=-1;k<=1;k++)D.push(limb([q.p[0]+k*.02,q.p[1],q.p[2]],[q.p[0]+k*.04,q.p[1]+.13+Math.abs(k)*.03,q.p[2]],.011,.007,[.3,.65,.3],5)); } };   // (seaweed)
  const BLOSSOM=(pts,rows,c,D)=>{ for(const q of pts(140,.058)){ const pk=rnd()<.5?[.97,.65,.75]:[.95,.5,.65], r=q.rot*Math.PI/180; for(let k=0;k<5;k++){ const b=k/5*TAU; D.push(shape(blob(.026,.02,.01,4,2),pk,[q.p[0]+Math.cos(b)*.03*Math.cos(r),q.p[1]+Math.sin(b)*.03,q.p[2]-Math.cos(b)*.03*Math.sin(r)],null,[0,q.rot,b*180/Math.PI])); } D.push(shape(sph(.01,4,2),[1,.85,.3],q.p)); } };
  const CLOVER=(pts,rows,c,D)=>{ for(const q of pts(120,.062)){ const g=[[.15,.5,.2],[.25,.65,.3],[.1,.4,.15]][(rnd()*3)|0], r=q.rot*Math.PI/180; for(let k=0;k<4;k++){ const b=k/4*TAU+Math.PI/4; D.push(shape(blob(.026,.026,.01,4,2),g,[q.p[0]+Math.cos(b)*.032*Math.cos(r),q.p[1]+Math.sin(b)*.032,q.p[2]-Math.cos(b)*.032*Math.sin(r)],null,[0,q.rot,0])); } } };
  const SAND=(pts,rows,c,D)=>{ for(let j=0;j<18;j++){ const q=c.onBody(j/18*TAU,c.TOP-.42+Math.sin(j*1.1)*.025); D.push(flat(blob(.075,.028,.012,8,4),[.95,.97,1],q)); }
    for(let j=0;j<24;j++){ const q=c.onBody(j/24*TAU,c.TOP-.56); D.push(flat(torus(.026,.006,5,10),[.95,.97,1],q)); }   // (the lace's rings over the sand's edge)
    for(const sx of [-1,1])for(let j=0;j<7;j++){ const q=c.onSleeve(sx,j/7*TAU,c.HEM+.34); D.push(flat(torus(.02,.005,5,8),[.95,.97,1],q)); } };
  // the coats: name, body colour (by place), decoration, trims
  const COATS=[ ['donut coat',(x,y,z)=>[.3,.2,.14],DONUTS,{}],
    ['patchwork coat',(x,y,z)=>[.12,.1,.12],PATCH,{lapel:[.9,.35,.1],button:[.3,.3,.25]}],
    ['ocean coat',(x,y,z)=>noise(x,y,z,8)>.55?[.2,.5,.9]:[.12,.38,.8],OCEAN,{lapel:[.35,.6,.95],button:[.75,.6,.4]}],
    ['cherry blossom coat',(x,y,z)=>[.9,.55,.65],BLOSSOM,{lapel:[.93,.6,.7]}],
    ['clover coat',(x,y,z)=>[.1,.35,.15],CLOVER,{lapel:[.15,.45,.2]}],
    ['waves and sand coat',null,SAND,{cuff:[.78,.62,.42],lapel:[.3,.6,.9],button:[.75,.6,.4]}] ];
  const sandCol=(TOP)=>(x,y,z)=>y<TOP-.56?(noise(x,y,z,10)>.5?[.78,.62,.42]:[.7,.54,.36]):y<TOP-.42?[.1,.3,.7]:[.2,.5,.9];   // (sand below the lace, the deep sea, then the sky-blue top)
  // ---- THE RACK AND THE COATS: hung along a bar between two posts, at the park wall's foot (the far sidewalk), each coat its own thing ----
  const AT={x:62,y:-62.2};   // (bodega tiles: the far sidewalk; the bear stands before the rack's middle)
  const rack=[part('posts',0,[-1,1].map(sx=>shape(cyl(.03,.035,1.95,8),WOOD,[sx*1.3,.975,0]))),part('bar',1,[limb([-1.32,1.88,0],[1.32,1.88,0],.02,.02,WOOD,8)]),part('feet',0,[-1,1].map(sx=>shape(box(.4,.05,.3),WOOD,[sx*1.3,.025,0])))];
  const still=o=>Object.assign({eye:-1,radius:0,speed:0,stride:0,rock:0,bob:0,lv:'up',group:'bodega',ground:(x,z)=>MODS.bodega.ground(x,z),brain:(dt,you,st,N)=>{ st.to=null; st.hold=true; st.face={x:st.x,z:st.z+1}; }},o);
  const R=PARTSNPC.make(rack,still({key:'rack',name:'THE COAT RACK',metres:1.95,x:BOD.XS(AT.x),z:BOD.ZS(AT.y)})); R.blocks=()=>false; R.push=()=>{};
  BEARCOATS.coats=COATS.map(([name,col,deco,trim],i)=>{ const parts=coat('',0,1.0,0,col||sandCol(1.0-.14),deco,trim);
    const N=PARTSNPC.make(parts,still({key:'coat'+(i+1),name:name.toUpperCase(),metres:1.0,x:BOD.XS(AT.x)+(i-2.5)*.42*TILE/1.13,z:BOD.ZS(AT.y),ground:(x,z)=>MODS.bodega.ground(x,z)+.85/.84*TILE}));   // (hung: its hook at the bar)
    N.blocks=()=>false; N.push=()=>{}; return N; });
  // ---- THE BEAR: shaggy grey-brown felt (two tones by a value noise), a lighter muzzle, black button eyes and nose; the blue knitted sweater
  // (its ribs), the brown coat open over it with its shearling collar and lapels, the pocket and its brass buckle; his paws up before him holding
  // the waves and sand coat on its hanger ----
  const FUR=(x,y,z)=>noise(x,y,z,9)>.52?[.47,.42,.37]:[.36,.31,.27], MUZ=[.62,.55,.47], BLACK=[0,0,0], SWEAT=(x,y,z)=>((y*44)|0)%2?[.58,.68,.84]:[.5,.6,.78], COAT=(x,y,z)=>noise(x,y,z,7)>.5?[.52,.42,.3]:[.45,.36,.26], SHEAR=[.88,.84,.74], BRASS=[.8,.65,.3];
  const shag=(cx,cy,cz,r,n,s)=>{ const out=[]; for(let i=0;i<n;i++){ const a=rnd()*TAU, b=(rnd()-.5)*Math.PI; out.push(shape(blob(s*(.7+rnd()*.6),s*.7,s*(.7+rnd()*.6),6,4),FUR,[cx+Math.cos(b)*Math.sin(a)*r,cy+Math.sin(b)*r,cz+Math.cos(b)*Math.cos(a)*r],null,[rnd()*360,rnd()*360,rnd()*360])); } return out; };
  const B=[ part('eyes',0,[ ...[-1,1].map(sx=>shape(sph(.032,8,6),BLACK,[sx*.09,1.56,.2])), shape(blob(.045,.035,.04,8,6),BLACK,[0,1.465,.31]), shape(box(.06,.012,.02),BLACK,[0,1.4,.29]) ]),   // (and the nose, the smile)
    part('head',2,[ shape(sph(.25,14,10),FUR,[0,1.52,0],[1.05,.95,.95]), ...shag(0,1.52,0,.24,22,.06) ]),
    part('muzzle',3,[ shape(blob(.13,.1,.11,12,8),MUZ,[0,1.43,.19]) ]),
    part('ears',2,[-1,1].flatMap(sx=>[shape(sph(.075,10,7),FUR,[sx*.2,1.73,-.02]),shape(sph(.042,8,6),MUZ,[sx*.2,1.73,.035])])),
    part('body',0,[ shape(blob(.31,.44,.27,12,9),FUR,[0,.92,0]) ]),
    part('sweater',1,[ shape(cyl(.26,.3,.52,14),SWEAT,[0,1.02,.02]), shape(cyl(.12,.14,.1,10),SWEAT,[0,1.3,0]) ]),
    part('coat',2,[ shape(shell(.35,.4,.98,16,Math.PI*.3,Math.PI*1.4),COAT,[0,.88,0]), ...shag(0,.9,-.2,.3,10,.05) ]),
    part('collar',3,[ shape(shell(.37,.37,.13,14,Math.PI*.3,Math.PI*1.4),SHEAR,[0,1.36,0]), ...[-1,1].map(sx=>shape(box(.07,.9,.03),SHEAR,[sx*.3,.9,.2],null,[0,sx*-25,0])) ]),
    part('pocket',3,[ shape(box(.18,.17,.035),(x,y,z)=>[.58,.47,.33],[-.26,.72,.24],null,[0,-28,0]), shape(box(.06,.045,.015),BRASS,[-.25,.78,.27],null,[0,-28,0]) ]),
    part('sleeves',2,[-1,1].map(sx=>limb([sx*.36,1.28,.02],[sx*.2,1.42,.34],.12,.1,COAT,10))),
    part('paws',3,[-1,1].flatMap(sx=>[shape(sph(.095,10,7),FUR,[sx*.17,1.5,.38]),...[0,1,2].map(k=>shape(sph(.018,6,4),BLACK,[sx*.17+(k-1)*.035,1.56,.46]))])),
    part('legs',1,[-1,1].map(sx=>limb([sx*.14,.6,0],[sx*.16,.12,.02],.14,.12,FUR,10))),
    part('feet',2,[-1,1].flatMap(sx=>[shape(blob(.14,.08,.19,10,6),FUR,[sx*.16,.07,.08]),...[0,1,2].map(k=>shape(sph(.018,6,4),BLACK,[sx*.16+(k-1)*.07,.06,.27]))])) ]
    .concat(coat('held',0,1.72,.52,sandCol(1.72-.14),SAND,{cuff:[.78,.62,.42],lapel:[.3,.6,.9],button:[.75,.6,.4]}));   // (the coat he holds up)
  const N=PARTSNPC.make(B,{key:'coatbear',name:'THE COAT BEAR',eye:0,eyeC:'0.,0.,0.',metres:1.8,radius:.4,speed:0,stride:0,rock:0,bob:.012,lv:'up',group:'bodega',x:BOD.XS(AT.x),z:BOD.ZS(AT.y+1.1),ground:(x,z)=>MODS.bodega.ground(x,z),
    brain:(dt,you,st,N)=>{ if(N.sheet)return; st.to=null; st.hold=true; const d=Math.hypot(you.x-st.x,you.z-st.z); st.face=d<5*TILE?{x:you.x,z:you.z}:{x:st.x,z:st.z+1}; }});   // (at his rack, facing the street; to you when you come near)
  BEARCOATS.N=N; window.BEARDBG=()=>({x:+N.st.x.toFixed(2),z:+N.st.z.toFixed(2),tris:N.tris,coats:BEARCOATS.coats.map(c=>[c.key,c.tris])}); }
