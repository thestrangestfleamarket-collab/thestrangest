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
  // ---- A COAT ON ITS HANGER, cut as a tailor cuts one (owner, 17 Oct 2026: "those should be shaped like coats ... coats that npcs will
  // wear"; "they still look square, i want real coat shapes"): no model file could be fetched from here (the free ones sit behind logins
  // and quotas), so the coat is lofted from a pattern: cross-sections from the neck over sloping shoulders, out at the chest, in at the
  // waist, out again over the hips to a flared hem, each an ellipse (wider than deep) joined in a smooth skin; the sleeves lofted tubes set
  // into the shoulders, full at the top, bent a little at the elbow, hanging to the cuffs; the collar stands round the neck and folds into
  // two lapels lying on the chest with the lining showing in the V; the front overlaps, buttoned; patch pockets on the hips. The hanger's
  // hook up from the collar. Its origin at the hook's top (ox,oy,oz). deco(pts,rows,c,D) lays the decoration on its skin ----
  const lerp=(a,b,t)=>a+(b-a)*t, smooth=t=>t*t*(3-2*t);
  // a loft: sections [{y,rx,rz,x,z}] top to bottom, each an ellipse of n points, joined by quads; open at both ends (the top closed by a lid)
  const loft=(S,n=24,lid=true)=>{ const P=[]; const ring=s=>Array.from({length:n},(_,k)=>{ const a=k/n*TAU; return [s.x+Math.sin(a)*s.rx,s.y,s.z+Math.cos(a)*s.rz]; });
    const R=S.map(ring); for(let i=0;i<S.length-1;i++)for(let k=0;k<n;k++){ const a=R[i][k], b=R[i][(k+1)%n], c=R[i+1][(k+1)%n], d=R[i+1][k]; P.push(...a,...b,...c, ...a,...c,...d); }
    if(lid){ const s=S[0], r=R[0]; for(let k=0;k<n;k++)P.push(s.x,s.y,s.z, ...r[(k+1)%n], ...r[k]); }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(P),3)); return g; };
  // a tube along a path of points with a radius at each, sections set square to the path
  const tube=(path,radii,n=10)=>{ const S=[]; for(let i=0;i<path.length;i++){ const p=path[i], q=path[Math.min(path.length-1,i+1)], o=path[Math.max(0,i-1)], d=new THREE.Vector3(q[0]-o[0],q[1]-o[1],q[2]-o[2]).normalize(), u=new THREE.Vector3(1,0,0).cross(d).normalize(), v=new THREE.Vector3().crossVectors(d,u);
      if(u.length()<.01){ u.set(0,0,1); v.crossVectors(d,u); } S.push({p,u,v,r:radii[i]}); }
    const P=[], ring=s=>Array.from({length:n},(_,k)=>{ const a=k/n*TAU; return [s.p[0]+(s.u.x*Math.cos(a)+s.v.x*Math.sin(a))*s.r,s.p[1]+(s.u.y*Math.cos(a)+s.v.y*Math.sin(a))*s.r,s.p[2]+(s.u.z*Math.cos(a)+s.v.z*Math.sin(a))*s.r]; });
    const R=S.map(ring); for(let i=0;i<S.length-1;i++)for(let k=0;k<n;k++){ const a=R[i][k], b=R[i][(k+1)%n], c=R[i+1][(k+1)%n], d=R[i+1][k]; P.push(...a,...b,...c, ...a,...c,...d); }
    for(const [i,sg] of [[0,-1],[S.length-1,1]]){ const s=S[i], r=R[i]; for(let k=0;k<n;k++)P.push(...s.p, ...(sg<0?[...r[(k+1)%n],...r[k]]:[...r[k],...r[(k+1)%n]])); }   // (both ends closed)
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(P),3)); return g; };
  const coat=(pre,ox,oy,oz,col,deco,o={})=>{ const TOP=oy-.14, HEM=oy-.98, L=TOP-HEM;
    // the pattern: height below the top, half width across, half depth (metres); the neck sits a little forward
    const PAT=[[-.07,.11,.085,.01],[-.035,.2,.11,.005],[0,.30,.13,0],[.06,.285,.14,0],[.16,.27,.145,0],[.3,.255,.14,0],[.42,.245,.135,0],[.56,.26,.14,0],[.72,.285,.15,0],[.84,.31,.16,0]];
    const SEC=PAT.map(([d,rx,rz,zf])=>({y:TOP-d,rx,rz,x:ox,z:oz+zf})), rx=y=>{ for(let i=0;i<SEC.length-1;i++)if(y<=SEC[i].y&&y>=SEC[i+1].y){ const t=(SEC[i].y-y)/(SEC[i].y-SEC[i+1].y); return lerp(SEC[i].rx,SEC[i+1].rx,t); } return y>SEC[0].y?SEC[0].rx:SEC[SEC.length-1].rx; },
      rz=y=>{ for(let i=0;i<SEC.length-1;i++)if(y<=SEC[i].y&&y>=SEC[i+1].y){ const t=(SEC[i].y-y)/(SEC[i].y-SEC[i+1].y); return lerp(SEC[i].rz,SEC[i+1].rz,t); } return y>SEC[0].y?SEC[0].rz:SEC[SEC.length-1].rz; };
    const body=[ shape(loft(SEC,26),col) ];
    // the sleeves: set into the shoulder at its point, a full cap, bent at the elbow, hanging just clear of the body
    const SL=sx=>[[ox+sx*.25,TOP-.04,oz],[ox+sx*.335,TOP-.07,oz+.005],[ox+sx*.365,TOP-.2,oz+.01],[ox+sx*.37,TOP-.36,oz+.02],[ox+sx*.375,TOP-.52,oz+.04],[ox+sx*.38,TOP-.66,oz+.05]];
    const sleeves=[-1,1].flatMap(sx=>[shape(tube(SL(sx),[.07,.086,.082,.078,.073,.07],12),col), shape(tube([[ox+sx*.379,TOP-.64,oz+.049],[ox+sx*.381,TOP-.69,oz+.052]],[.074,.074],12),o.cuff||col)]);
    const lining=o.lining||CREAM, lapelC=o.lapel||col, RZ0=rz(TOP-.15);
    const front=[ shape(box(.19,.3,.008),lining,[ox,TOP-.15,oz+RZ0+.002]),   // (the lining in the V)
      ...[-1,1].map(sx=>shape(box(.08,.3,.014),lapelC,[ox+sx*.075,TOP-.16,oz+RZ0+.012],null,[-8,sx*18,sx*-24])),   // (the lapels, folded back over the chest, following its curve)
      shape(loft([{y:TOP+.09,rx:.12,rz:.1,x:ox,z:oz-.01},{y:TOP+.0,rx:.15,rz:.125,x:ox,z:oz-.02}],18,false),lapelC),   // (the collar standing round the neck)
      shape(box(.03,L-.36,.01),col,[ox+.012,HEM+(L-.36)/2,oz+rz(HEM+.4)+.006]),   // (the front edge, overlapping)
      ...[0,1,2].map(i=>shape(sph(.019,8,6),o.button||DARK,[ox+.035,TOP-.4-i*.15,oz+rz(TOP-.4-i*.15)+.016])),
      ...[-1,1].map(sx=>shape(box(.13,.13,.012),col,[ox+sx*.15,HEM+.3,oz+rz(HEM+.3)+.004],null,[0,sx*18,0])) ];   // (the pockets, on the curve)
    const hanger=[ shape(torus(.035,.007,6,12),WOOD,[ox,oy-.035,oz]), shape(cyl(.008,.008,.08,6),WOOD,[ox,oy-.11,oz]), limb([ox-.26,TOP-.01,oz],[ox,oy-.13,oz],.012,.012,WOOD,6), limb([ox+.26,TOP-.01,oz],[ox,oy-.13,oz],.012,.012,WOOD,6) ];
    // the skin: a point on the body at angle a (0 the front) and height y, or on a sleeve (side sx, angle b, height y), out by a little
    const onBody=(a,y,out=.012)=>{ const n=Math.atan2(Math.sin(a)/rx(y),Math.cos(a)/rz(y)); return {p:[ox+Math.sin(a)*(rx(y)+out),y,oz+Math.cos(a)*(rz(y)+out)],rot:n*180/Math.PI,a}; };
    const onSleeve=(sx,b,y,out=.012)=>{ const path=SL(sx), rad=[.07,.086,.082,.078,.073,.07]; let i=1; while(i<path.length-1&&path[i+1][1]>y)i++; const t=Math.max(0,Math.min(1,(path[i][1]-y)/(path[i][1]-path[i+1][1]||1))), X=lerp(path[i][0],path[i+1][0],t), Z=lerp(path[i][2],path[i+1][2],t), r=lerp(rad[i],rad[i+1],t)+out;
      return {p:[X+Math.sin(b)*r,y,Z+Math.cos(b)*r],rot:b*180/Math.PI,a:b}; };
    const pts=(n,gap)=>{ const S=[]; let tries=0; const nr=Math.max(2,Math.round(.5/gap)), na=Math.max(2,Math.round(.36/gap));   // (the sleeves first: rows round each one's outer side, as many as the gap allows)
      for(const sx of [-1,1])for(let i=0;i<nr;i++)for(let j=0;j<na;j++){ const y=TOP-.62+(i+.5)/nr*.52, b=sx*Math.PI/2+((j+.5)/na-.5)*Math.PI*1.1; const q=onSleeve(sx,b,y); q.sx=sx; q.y=y; S.push(q); }
      const need=S.length+n; while(S.length<need&&tries++<1200){ const y=HEM+.06+rnd()*(L-.1), a=rnd()*TAU; { if(y>TOP-.3&&Math.cos(a)>.9&&Math.abs(Math.sin(a))<.4)continue;   /* (then n over the body; the V at the top of the front stays clear) */ const q=onBody(a,y);
          if(S.every(s=>s.sx||Math.hypot(s.p[0]-q.p[0],s.p[1]-q.p[1],s.p[2]-q.p[2])>gap)){ q.sx=0; q.y=y; S.push(q); } } } return S; };
    const rows=(nr,nc,fn)=>{ for(let i=0;i<nr;i++)for(let j=0;j<nc;j++){ const a=(j+.5)/nc*TAU, y=TOP-.06-(i+.5)*(L-.1)/nr; fn(onBody(a,y),i,j); } };
    const D=[]; if(deco)deco(pts,rows,{ox,oy,oz,TOP,HEM,onBody,onSleeve},D);
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
