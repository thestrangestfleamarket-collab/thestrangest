// HULL DOWN's fruit and useful trees: THE MARKET's fifty-seven (its src/144j-fruittrees.js: the catalogue and the model, copied in), each drawn for a pair of crossed cards (put into main.js by tools/edge.cjs)
const FRUIT=(()=>{ const FTREES={};
  const L=[
['apple','APPLE','POME','round',0x4f7f3a,0xc8321e,1,0xf6d8de,3.5,[8,9,10],3,'two:apple','pt',1,'APPLE',3,28,4],
['pear','PEAR','POME','pyramid',0x4a7a36,0xb8c050,1.1,0xf4f0ea,4.5,[8,9,10],4,'two:pear','pt',1,'PEAR',3,30,4],
['asianpear','ASIAN PEAR','POME','round',0x4a7a36,0xd0a050,1.1,0xf4f0ea,4,[8,9],5,'two:pear','p',1,'ASIAN PEAR',4,32,4],
['quince','QUINCE','POME','spread',0x5a8a40,0xe0c840,1.3,0xf8d8e0,5,[10],5,'self','p',.9,'QUINCE',4,30,5],
['medlar','MEDLAR','POME','spread',0x4f7a38,0x8a5a32,.9,0xf4f0ea,3.5,[10,11],5,'self','p',.85,'MEDLAR',5,34,5],
['crabapple','CRABAPPLE','POME','round',0x4a6a34,0xc03040,.45,0xf0a0b8,3,[9,10],3,'self:apple','pB',.85,'CRABAPPLE',1,22,4],
['loquat','LOQUAT','POME','round',0x3e6a30,0xf0a030,.6,0xf6f0e0,4,[4,5],8,'self','ep',.9,'LOQUAT',3,38,11],
['peach','PEACH','STONE','vase',0x5a8a3a,0xf0905a,1,0xf4a0b8,3,[7,8],5,'self','pt',.9,'PEACH',3,30,4],
['nectarine','NECTARINE','STONE','vase',0x5a8a3a,0xd84a3a,1,0xf4a0b8,3,[7,8],5,'self','pt',.9,'NECTARINE',3,32,4],
['apricot','APRICOT','STONE','vase',0x5a8a3a,0xf0a040,.8,0xf8e0e8,3.5,[6,7],5,'self','ptf',.9,'APRICOT',3,32,3],
['sweetcherry','SWEET CHERRY','STONE','round',0x4a7a34,0x8a1020,.4,0xf8f4f4,5.5,[6,7],5,'two:cherry','pB',1.1,'SWEET CHERRIES',2,34,4],
['sourcherry','SOUR CHERRY','STONE','round',0x4a7a34,0xd02030,.4,0xf8f4f4,4,[6,7],4,'self:cherry','pB',.8,'SOUR CHERRIES',2,28,4],
['gage','GREENGAGE PLUM','STONE','round',0x4f7f3a,0x9ac048,.7,0xf8f8f0,4.5,[8,9],5,'self','pt',1,'GREENGAGE PLUM',4,32,4],
['plum','EUROPEAN PLUM','STONE','round',0x4f7f3a,0x6a3a7a,.7,0xf8f8f0,4.5,[8,9],4,'self','pt',1,'PLUM',3,28,4],
['mango','MANGO','STONE','round',0x2e5a2a,0xf0a030,1.3,0xe8d8a0,4,[5,6,7,8,9],10,'self','ep',1.1,'MANGO',5,48,2],
['lemon','MEYER LEMON','CITRUS','shrub',0x2e6a2e,0xf0e040,.9,0xffffff,2.5,[12,1,2,3],9,'self','ep',1,'MEYER LEMON',3,36,10],
['lime','KEY LIME','CITRUS','shrub',0x2e6a2e,0x9ac040,.5,0xffffff,2.5,[6,7,8,9,10],10,'self','ep',1,'KEY LIME',2,36,3],
['orange','NAVEL ORANGE','CITRUS','round',0x2a5e2a,0xf08a20,1,0xffffff,4,[11,12,1,2,3],9,'self','ep',1,'NAVEL ORANGE',3,40,4],
['mandarin','MANDARIN','CITRUS','round',0x2a5e2a,0xf07a10,.7,0xffffff,3.5,[11,12,1],8,'self','ep',.9,'MANDARIN',3,38,4],
['grapefruit','GRAPEFRUIT','CITRUS','round',0x2a5e2a,0xf0b060,1.5,0xffffff,4.5,[11,12,1,2,3],9,'self','ep',1.1,'GRAPEFRUIT',4,40,4],
['kumquat','KUMQUAT','CITRUS','shrub',0x2e6a2e,0xf09020,.35,0xffffff,2.5,[12,1,2,3],8,'self','ep',1,'KUMQUATS',2,34,7],
['yuzu','YUZU','CITRUS','shrub',0x2e6a2e,0xe8d030,.7,0xffffff,3.5,[10,11,12],7,'self','ep',1,'YUZU',6,44,5],
['walnut','ENGLISH WALNUT','NUTS','spread',0x4a7a36,0x5a7a30,.9,0xc8c890,5.5,[9,10],5,'self','pN',1.15,'WALNUTS',3,40,4],
['blackwalnut','BLACK WALNUT','NUTS','spread',0x4a7a36,0x4a6a2a,1,0xc8c890,8.5,[9,10],4,'self','pN',1.2,'BLACK WALNUTS',4,36,4],
['pecan','PECAN','NUTS','round',0x4a7a36,0x7a5a32,.5,0xc8c890,8,[10,11],6,'two:pecan','pN',1.25,'PECANS',4,42,5],
['hazel','HAZELNUT','NUTS','shrub',0x4f7f3a,0xa07a40,.45,0xd8c860,3.5,[8,9],4,'two:hazel','pN',1,'HAZELNUTS',3,26,2],
['chestnut','CHESTNUT','NUTS','round',0x3e6e30,0x9aa040,1,0xf0e8b0,4,[9,10],4,'two:chestnut','pN',1.2,'CHESTNUTS',3,38,6],
['almond','ALMOND','NUTS','vase',0x5a8a3a,0x8a9a5a,.6,0xf8e0ea,3.5,[8,9],7,'two:almond','pNf',.9,'ALMONDS',4,36,2],
['pistachio','PISTACHIO','NUTS','spread',0x6a8a50,0xc8a0a0,.4,0xa08060,6.5,[9],7,'mf','N',1,'PISTACHIOS',6,48,4],
['whiteoak','WHITE OAK','NUTS','round',0x3e6a30,0x8a6a3a,.4,0xc8c890,35,[9,10],3,'self','pN',1.3,'ACORNS',1,24,5],
['ginkgo','GINKGO','NUTS','pyramid',0x7a9a3a,0xe0c060,.5,0xc8c890,20,[10,11],3,'mf','',1.2,'GINKGO NUTS',3,40,4],
['fig','FIG','MORE TEMPERATE','spread',0x4a7a36,0x6a3a5a,.8,0x4a7a36,2.5,[7,8,9],7,'self','wB',.75,'FIGS',3,30,5],
['mulberry','MULBERRY','MORE TEMPERATE','round',0x4f7f3a,0x3a1a3a,.4,0xc8d890,2.5,[6,7],4,'self','B',1,'MULBERRIES',2,26,4],
['serviceberry','SERVICEBERRY','MORE TEMPERATE','vase',0x4a7a3a,0x5a2a6a,.35,0xffffff,3,[6],4,'self','B',.9,'SERVICEBERRIES',2,26,4],
['persimmon','AMERICAN PERSIMMON','MORE TEMPERATE','pyramid',0x4a7a36,0xe07020,.6,0xf0e8c0,5,[10,11],4,'mf','',1,'AMERICAN PERSIMMON',3,32,5],
['fuyu','FUYU PERSIMMON','MORE TEMPERATE','round',0x4a7a36,0xf08020,1.1,0xf0e8c0,4,[10,11],7,'self','',1,'FUYU PERSIMMON',4,38,5],
['pawpaw','PAWPAW','MORE TEMPERATE','pyramid',0x3e6a2e,0x8aa040,1.3,0x7a2030,6,[9],5,'two:pawpaw','p',1,'PAWPAW',5,36,4],
['elder','ELDERBERRY','MORE TEMPERATE','shrub',0x4f7f3a,0x2a1a3a,.25,0xf8f4e0,2.5,[8,9],4,'self','Bx',1,'ELDERBERRIES',2,20,6],
['jujube','JUJUBE','MORE TEMPERATE','spread',0x4a7a36,0x8a3020,.5,0xe0e0a0,1.5,[9,10],6,'self','',.9,'JUJUBES',3,32,6],
['pomegranate','POMEGRANATE','MORE TEMPERATE','shrub',0x4a7a36,0xb02030,1.2,0xe04020,2.5,[10,11],8,'self','',1,'POMEGRANATE',5,34,6],
['olive','OLIVE','MORE TEMPERATE','round',0x8a9a78,0x3a3a2a,.4,0xf0f0d8,4,[10,11],8,'self','ex',1,'OLIVES',3,40,5],
['avocado','AVOCADO','TROPICAL','round',0x2e5a2a,0x3a5a2a,1.1,0xd8d8a0,3.5,[2,3,4,5,6,7,8,9],9,'self','ep',1.15,'AVOCADO',4,44,1],
['banana','BANANA','TROPICAL','palm',0x4a8a3a,0xe8d040,.6,0x8a3050,.9,[1,2,3,4,5,6,7,8,9,10,11,12],9,'self','en',.6,'BANANAS',2,30,0],
['papaya','PAPAYA','TROPICAL','palm',0x4a8a3a,0xf09030,1.1,0xf8f0d0,.85,[1,2,3,4,5,6,7,8,9,10,11,12],10,'mf','enc',.7,'PAPAYA',4,30,0],
['coconut','COCONUT PALM','TROPICAL','palm',0x4a7a36,0x6a4a2a,1.4,0xe8e0b0,8,[1,2,3,4,5,6,7,8,9,10,11,12],10,'self','e',1.2,'COCONUT',4,60,0],
['date','DATE PALM','TROPICAL','palm',0x6a8a50,0xa0602a,.4,0xe8e0b0,6,[9,10,11],9,'mf','e',1.2,'DATES',4,56,4],
['cacao','CACAO','TROPICAL','round',0x2e5a2a,0xc08030,1.2,0xf0e0e0,4,[10,11,12,1,2,3],11,'self','ecx',.8,'CACAO PODS',6,52,7],
['coffee','COFFEE','TROPICAL','shrub',0x2a5a2a,0xc0202a,.35,0xffffff,3.5,[10,11,12,1],10,'self','ex',1,'COFFEE CHERRIES',4,40,4],
['guava','GUAVA','TROPICAL','spread',0x3e6a30,0xc8d070,.8,0xffffff,3,[8,9,10,11,12],9,'self','ep',.85,'GUAVA',3,36,5],
['maple','SUGAR MAPLE','USEFUL','round',0x3e6e30,0xc8a050,.4,0xc8d060,35,[2,3],3,'self','sx',1.3,'MAPLE SAP',6,26,4],
['birch','BIRCH','USEFUL','column',0x6a9a40,0xc8a050,.3,0xc8c870,17,[3,4],2,'self','sx',1.2,'BIRCH SAP',4,22,4],
['tea','TEA','USEFUL','shrub',0x2e5e2a,0x9ad060,.3,0xffffff,3,[4,5,6,7,8,9],7,'self','ex',.8,'TEA LEAVES',4,30,10],
['bay','BAY LAUREL','USEFUL','pyramid',0x2e5a2a,0x4a7a3a,.3,0xe8e0a0,1.5,[1,2,3,4,5,6,7,8,9,10,11,12],8,'self','ex',.8,'BAY LEAVES',2,24,4],
['cinnamon','CINNAMON','USEFUL','shrub',0x3e6a30,0xb0603a,.3,0xf0f0d0,2.5,[5,6,7,8,9,10,11],10,'self','ebx',1,'CINNAMON STICKS',6,40,1],
['linden','LINDEN','USEFUL','pyramid',0x4f7f3a,0xf0e080,.3,0xf0e080,12.5,[6,7],3,'self','x',1.2,'LINDEN FLOWERS',3,30,6],
['cork','CORK OAK','USEFUL','spread',0x4a6a3a,0xb0603a,.3,0xc8c890,25,[6,7,8],8,'self','ebx',1,'CORK',12,48,5],
['willow','BASKET WILLOW','USEFUL','weep',0x7a9a50,0xb08a40,.3,0xe0e0a0,1,[12,1,2],4,'self','x',1,'WILLOW WHIPS',2,18,3]];
  const CAT={}; FTREES.CAT=CAT; FTREES.ids=L.map(r=>r[0]);
  for(const [k,name,g,c,leaf,fr,fs,fl,y,m,z,pol,fx,hs,pn,pp,sp,bl] of L){ const [p,pg]=pol.split(':');
    CAT[k]={k,name,g,c,leaf,fr,fs,fl,y,m,z,p,pg:pg||k,hs,pn,pp,sp,bl,ev:fx.includes('e'),wrap:fx.includes('w'),sap:fx.includes('s'),bark:fx.includes('b'),cauli:fx.includes('c'),ban:fx.includes('n'),pip:fx.includes('p'),bird:fx.includes('B'),nut:fx.includes('N'),thin:fx.includes('t'),frost:fx.includes('f'),eat:!fx.includes('x'),
      n:Math.max(3,Math.min(18,Math.round(9/Math.sqrt(fs)))),item:'tf_'+k,sapling:'sp_'+k,pipItem:'pp_'+k}; }
  const hs=(s,n)=>{ let h=2166136261; for(const c of String(s)+'|'+n)h=Math.imul(h^c.charCodeAt(0),16777619); h=Math.imul(h^h>>>13,1274126177); return ((h^h>>>16)>>>0)/4294967296; };
  const V3=T.Vector3, BODY=new Map(), MAT=new T.MeshLambertMaterial({vertexColors:true,flatShading:true}), FMAT=new T.MeshLambertMaterial({color:0xffffff});
  const HT={round:4.5,vase:4,spread:4.4,pyramid:5,column:6,shrub:2.6,weep:5,palm:6};
  const merge=parts=>{ parts=parts.map(([g,c])=>[g.index?g.toNonIndexed():g,c]); let n=0; for(const [g] of parts)n+=g.attributes.position.count; const P=new Float32Array(n*3), N=new Float32Array(n*3), C=new Float32Array(n*3); let o=0; const col=new T.Color();
    for(const [g,c] of parts){ const q=g, p=q.attributes.position.array, nr=q.attributes.normal.array; col.set(c); P.set(p,o*3); N.set(nr,o*3); for(let i=0;i<q.attributes.position.count;i++){ C[(o+i)*3]=col.r; C[(o+i)*3+1]=col.g; C[(o+i)*3+2]=col.b; } o+=q.attributes.position.count; }
    const G=new T.BufferGeometry(); G.setAttribute('position',new T.BufferAttribute(P,3)); G.setAttribute('normal',new T.BufferAttribute(N,3)); G.setAttribute('color',new T.BufferAttribute(C,3)); G.computeBoundingSphere(); return G; };
  const limb=(a,b,r0,r1,seg=5)=>{ const d=new V3().subVectors(b,a), L=d.length(), g=new T.CylinderGeometry(r1,r0,L,seg,1); g.translate(0,L/2,0); const q=new T.Quaternion().setFromUnitVectors(new V3(0,1,0),d.normalize()); g.applyQuaternion(q); g.translate(a.x,a.y,a.z); return g; };
  const mix=(a,b,k)=>new T.Color(a).lerp(new T.Color(b),k).getHex(), shade=(c,k)=>k>1?mix(c,0xffffff,k-1):new T.Color(c).multiplyScalar(k).getHex();
  // the crown's lumps for a kind (centres and radii, in a tree 1 tall) and the points its fruit hangs from
  const LUMPS=new Map(), lumps=K=>{ if(LUMPS.has(K.k))return LUMPS.get(K.k); const r=i=>hs(K.k,i), out=[];
    const add=(x,y,z,rad)=>out.push([x,y,z,rad]);
    if(K.c==='round')for(let i=0;i<6;i++){ const a=i*1.05+r(i)*.6; add(Math.cos(a)*.17,.64+(r(i+9)-.5)*.16,Math.sin(a)*.17,.2+r(i+3)*.06); }
    else if(K.c==='vase')for(let i=0;i<6;i++){ const a=i*1.05+r(i)*.5; add(Math.cos(a)*.26,.72+(r(i+9)-.5)*.1,Math.sin(a)*.26,.17+r(i+3)*.05); }
    else if(K.c==='spread')for(let i=0;i<7;i++){ const a=i*.9+r(i)*.5; add(Math.cos(a)*.3,.58+(r(i+9)-.5)*.1,Math.sin(a)*.3,.18+r(i+3)*.05); }
    else if(K.c==='pyramid')for(let i=0;i<5;i++){ const y=.32+i*.14, w=.26*(1-i/5)+.06; add((r(i)-.5)*.05,y,(r(i+4)-.5)*.05,w); }
    else if(K.c==='column')for(let i=0;i<5;i++)add((r(i)-.5)*.06,.48+i*.1,(r(i+4)-.5)*.06,.12+r(i+2)*.03);
    else if(K.c==='shrub')for(let i=0;i<7;i++){ const a=i*.9+r(i)*.6; add(Math.cos(a)*.24,.45+(r(i+9))*.3,Math.sin(a)*.24,.2+r(i+3)*.06); }
    else if(K.c==='weep')for(let i=0;i<6;i++){ const a=i*1.05+r(i)*.6; add(Math.cos(a)*.2,.72+(r(i+9)-.5)*.12,Math.sin(a)*.2,.19+r(i+3)*.05); }
    LUMPS.set(K.k,out); return out; };
  // look: {bare, autumn, bloom, dead, wrap, bucket, bark}
  const body=(K,look)=>{ const key=K.k+'|'+['bare','autumn','bloom','dead','wrap','bucket','bark'].map(k=>look[k]?1:0).join(''); if(BODY.has(key))return BODY.get(key);
    const H=HT[K.c]*K.hs, parts=[], barkC=K.c==='column'?0xd8d4c8:look.dead?0x6a6058:0x5a4232, r=i=>hs(K.k+'b',i);
    let leafC=K.leaf; if(look.autumn)leafC=K.k==='maple'?0xd84a20:K.k==='ginkgo'?0xf0c830:K.k==='persimmon'||K.k==='fuyu'?0xc85a28:0xc89a30; if(look.bloom)leafC=mix(leafC,K.fl,.45);
    if(K.c==='palm'){ const top=new V3(K.ban?0:.06*H,K.ban?.55*H:H,0); let a=new V3(0,0,0); for(let i=1;i<=5;i++){ const b=new V3(top.x*Math.pow(i/5,2),top.y*i/5,0); parts.push([limb(a,b,(K.ban?.09:.07)*H*(1-i*.06),(K.ban?.08:.06)*H*(1-i*.06),6),K.ban?0x6a7a3a:barkC]); a=b; }
      if(!look.dead)for(let i=0;i<(K.ban?7:9);i++){ const an=i/(K.ban?7:9)*6.283+r(i), L=(K.ban?.42:.45)*H, e=new V3(top.x+Math.cos(an)*L,top.y+(K.ban?.15:-.05)*H-r(i+3)*.15*H,Math.sin(an)*L);
        const g=K.ban?new T.BoxGeometry(L,.01*H,.14*H):new T.BoxGeometry(L,.012*H,.06*H); g.translate(L/2,0,0); g.rotateZ(Math.atan2(e.y-top.y,L)); g.rotateY(-an); g.translate(top.x,top.y,top.z); parts.push([g,i%2?K.leaf:shade(K.leaf,.8)]); } }
    else { const tt=K.c==='shrub'?.32:K.c==='pyramid'?.3:K.c==='column'?.45:K.c==='weep'?.6:K.c==='vase'?.36:K.c==='spread'?.32:.45, tr=(K.c==='shrub'?.03:.045)*H;
      if(K.c==='shrub'){ for(let i=0;i<3;i++){ const an=i*2.1+r(i); parts.push([limb(new V3(0,0,0),new V3(Math.cos(an)*.12*H,tt*H,Math.sin(an)*.12*H),tr,tr*.6),barkC]); } }
      else parts.push([limb(new V3(0,0,0),new V3(0,tt*H,0),tr,tr*.75,7),barkC]);
      if(look.bark)parts.push([limb(new V3(0,.05*H,0),new V3(0,tt*H*.85,0),tr*1.06,tr*.82,7),0xc0603a]);
      const L=lumps(K); for(let i=0;i<L.length;i++){ const [x,y,z]=L[i]; parts.push([limb(new V3(0,tt*H*.9,0),new V3(x*H*.8,y*H*.92,z*H*.8),tr*.55,tr*.25),barkC]); }
      if(look.bare||look.dead){ for(let i=0;i<10;i++){ const an=i*.63+r(i+20), a=L[i%L.length]; parts.push([limb(new V3(a[0]*H*.8,a[1]*H*.92,a[2]*H*.8),new V3(a[0]*H*1.25+Math.cos(an)*.08*H,a[1]*H*1.12,a[2]*H*1.25+Math.sin(an)*.08*H),tr*.2,tr*.06,4),barkC]); } }
      else { for(let i=0;i<L.length;i++){ const [x,y,z,rad]=L[i], g=new T.IcosahedronGeometry(rad*H,1); if(K.c==='pyramid'||K.c==='column')g.scale(1,1.35,1); g.translate(x*H,y*H,z*H); parts.push([g,i%3===2?shade(leafC,.82):i%3===1?shade(leafC,1.08):leafC]); }
        if(K.c==='pyramid'){ const g=new T.ConeGeometry(.2*H,.32*H,7); g.translate(0,.96*H,0); parts.push([g,leafC]); }
        if(K.c==='weep')for(let i=0;i<14;i++){ const an=i/14*6.283, x=Math.cos(an)*.32*H, z=Math.sin(an)*.32*H, g=new T.BoxGeometry(.012*H,.42*H,.012*H); g.translate(x,.48*H,z); parts.push([g,i%2?leafC:shade(leafC,1.15)]); } } }
    if(look.wrap){ const g=new T.CylinderGeometry(.3*H,.34*H,.8*H,10); g.translate(0,.42*H,0); parts.push([g,0xa0804a]); const b=new T.CylinderGeometry(.18*H,.15*H,.14*H,10); b.translate(0,.88*H,0); parts.push([b,0x8a8a92]); }
    if(look.bucket){ const g=new T.CylinderGeometry(.045*H,.04*H,.08*H,8); g.translate(.07*H,.18*H,0); parts.push([g,0x9aa0a8]); }
    const G=merge(parts); G.userData.H=H; BODY.set(key,G); return G; };
  // where the fruit hangs (a tree 1 tall): over the outside of its crown, lower half most; on the trunk for cacao and papaya; under the fronds for a palm
  const bake=k=>{const K=CAT[k],g0=body(K,{}),H=g0.userData.H||1,g=g0.clone(),c=g.attributes.color;if(c)for(let i=0;i<c.array.length;i++)c.array[i]=Math.pow(c.array[i],2.2);
    const sc=new T.Scene(),me=new T.Mesh(g,new T.MeshLambertMaterial({vertexColors:true,flatShading:true,side:T.DoubleSide}));me.scale.setScalar(1/H);sc.add(me);g.computeBoundingBox();const bb=g.boundingBox,wd=Math.max(Math.abs(bb.min.x),Math.abs(bb.max.x),Math.abs(bb.min.z),Math.abs(bb.max.z))/H;
    const sun=new T.DirectionalLight(0xfff0d8,1.9);sun.position.set(.6,.9,.7);sc.add(sun,new T.HemisphereLight(0xbfd4ff,0x4a4030,.85));
    const w=Math.max(.2,wd*2.06),cam=new T.OrthographicCamera(-w/2,w/2,.52,-.51,.1,20),tm=renderer.toneMapping,cc=renderer.getClearColor(new T.Color()).clone(),ca=renderer.getClearAlpha(),tex=[],rts=[];renderer.toneMapping=T.NoToneMapping;renderer.setClearColor(0x2a3a1c,0);
    for(const a of[0,Math.PI/2]){const rt=new T.WebGLRenderTarget(512,512,{depthBuffer:true});rt.texture.generateMipmaps=true;rt.texture.minFilter=T.LinearMipmapLinearFilter;rt.texture.anisotropy=4;cam.position.set(Math.sin(a)*8,.5,Math.cos(a)*8);cam.lookAt(0,.5,0);renderer.setRenderTarget(rt);renderer.clear();renderer.render(sc,cam);tex.push(rt.texture);rts.push(rt);}
    renderer.setRenderTarget(null);renderer.toneMapping=tm;renderer.setClearColor(cc,ca);g.dispose();return{w,tex,rts,name:K.name,metres:HT[K.c]*K.hs};};
  return{CAT,ids:FTREES.ids,bake,HT};
})();
