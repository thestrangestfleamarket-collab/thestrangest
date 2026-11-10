// THE FRUIT TREES (owner, 10 Nov 2026: "A + B, 2, all trees, all rules"): FTREES, 57 real trees you grow in a big pot at home (150hb) or in your plot in the park orchard (147d): their saplings, pips and what they give, the one model of how a tree grows (a year of its life each real day, fruit in its real months, the real rules) and its 3D model.
import {THREE} from './003-shx.js';
import {CLOCK, FORAGE, ITEMS} from './003b-systems.js';
import {OWNED} from './005-save.js';
import {QS} from './006-map-pre.js';
import {VEG} from './144-veggies.js';
const FTREES={}; window.FTREES=FTREES;
{ const DAY=864e5;
  // k, name, group, crown, leaf, fruit, fruit size, flower, years to first crop, months picked, coldest zone, pollen (self, two: a second of its group, mf: a male and a female), flags, height, product, $ product, $ sapling, bloom month
  // flags: e evergreen, w wrap for winter, s sap, b bark, c fruit on the trunk, n banana leaves, p pips grow random trees, B birds' favourite, N squirrels' favourite, t thin the fruit, f blooms early (late frost), x not to eat
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
  // what they give: the sapling (grafted where real ones are), a pip or nut to plant, the crop; the big pot, a bird net, burlap, a spile and bucket
  const NM={treepot:'BIG TREE POT',birdnet:'BIRD NET',burlap:'BURLAP WRAP',spile:'SPILE AND BUCKET'}, PR={treepot:25,birdnet:6,burlap:4,spile:12}, SELLS={treepot:25,birdnet:6,burlap:4,spile:12}, BUYS={};
  for(const k in CAT){ const K=CAT[k], seedy=K.c==='palm'||/^(coffee|cacao|tea|bay|cinnamon|willow|linden|cork|maple|birch|ginkgo|whiteoak|mulberry|serviceberry|elder)$/.test(k);
    NM[K.sapling]=K.name+(K.ban?' PUP':seedy?' SAPLING':' SAPLING (GRAFTED)'); NM[K.item]=K.pn; PR[K.item]=K.pp; PR[K.sapling]=K.sp; SELLS[K.sapling]=K.sp; BUYS[K.item]=K.pp;
    ITEMS.reg(K.item,{value:K.pp,stackable:true,sellable:true,weight:Math.max(.05,.15*K.fs),edible:K.eat,heals:K.eat?.05:0,icon:K.eat?'fruit':'sack',size:+(.08*K.fs).toFixed(2)});
    ITEMS.reg(K.sapling,{value:K.sp,stackable:true,sellable:true,weight:3,icon:'seed'});
    if(K.pip){ NM[K.pipItem]=K.name+(K.nut?' TO PLANT':' PIP'); PR[K.pipItem]=1; ITEMS.reg(K.pipItem,{value:1,stackable:true,weight:.02,icon:'seed'}); } }
  for(const id of ['birdnet','burlap','spile','treepot'])ITEMS.reg(id,{value:PR[id],stackable:true,weight:id==='treepot'?6:1,icon:id==='treepot'?'crate':'tool'});
  FORAGE.add({names:NM,prices:PR});
  { const w=()=>{ if(!VEG.add)return setTimeout(w,500); VEG.add(SELLS,BUYS); }; w(); }

  /* ---------- the clock: a tree's year is a real day; its fruit comes in its real months (the real date, UTC, as the season's calendar) ---------- */
  FTREES.shift=0; { const qm=+QS.get('month'); if(qm>=1&&qm<=12){ const d=new Date(), y=d.getUTCFullYear()+(qm-1<d.getUTCMonth()?1:0); FTREES.shift=Date.UTC(y,qm-1,15,12)-Date.now(); } }
  const now=FTREES.now=()=>Date.now()+FTREES.shift, PICK={winter:1,spring:4,summer:7,autumn:10};
  const mOf=ms=>new Date(ms).getUTCMonth()+1, yOf=ms=>new Date(ms).getUTCFullYear(), mStart=ms=>{ const d=new Date(ms); return Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),1); }, mNext=ms=>{ const d=new Date(ms); return Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,1); };
  const month=FTREES.month=(ms=now())=>CLOCK.seasonPick&&PICK[CLOCK.seasonPick]&&!FTREES.shift?PICK[CLOCK.seasonPick]:mOf(ms);
  // the run of picking months holding ms ({key, a, b}), or null; a tree that fruits all year has a month at a time
  const block=(ms,M)=>{ const m=mOf(ms); if(!M.includes(m))return null; if(M.length>=12){ const a=mStart(ms); return {key:yOf(ms)*100+m,a,b:mNext(ms)}; }
    let a=mStart(ms); for(let i=0;i<11&&M.includes(mOf(a-DAY));i++)a=mStart(a-DAY); let b=a; for(let i=0;i<12&&M.includes(mOf(b));i++)b=mNext(b); return {key:yOf(a)*100+mOf(a),a,b}; };
  const prevBlock=(ms,M)=>{ let t=block(ms,M); t=t?t.a-DAY:ms; for(let i=0;i<13;i++){ const b=block(t,M); if(b)return b; t=mStart(t)-DAY; } return null; };
  const winterIn=(a,b)=>{ let t=a; for(let i=0;i<60&&t<b;i++){ const m=mOf(t); if(m===12||m<=2)return true; t=mNext(t); } return false; };
  const hs=(s,n)=>{ let h=2166136261; for(const c of String(s)+'|'+n)h=Math.imul(h^c.charCodeAt(0),16777619); h=Math.imul(h^h>>>13,1274126177); return ((h^h>>>16)>>>0)/4294967296; };
  FTREES.block=block; FTREES.winterIn=winterIn; FTREES.hs=hs;

  /* ---------- a tree: {id, k, t0 planted, g years grown up to at, wet watered until, pip, q, sx, pk {season: picked}, pr pruned, th thinned for, nt netted, wr wrapped, wc windfalls cleared, db died back, chk, dead} ---------- */
  FTREES.plant=(k,o={})=>{ const K=CAT[k], t=now(), id=o.id||t.toString(36)+Math.floor(Math.random()*1e6).toString(36), pip=!!o.pip;
    return {id,k,t0:t,at:t,g:pip?0:Math.min(1,K.y*.3),wet:t+(o.pot?1.5:3)*DAY,pip:pip?1:0,q:pip?+(.3+1.1*hs(id,'q')).toFixed(2):1,sx:K.p==='mf'?(hs(id,'sx')<.5?'m':'f'):'',pk:{}}; };
  const Yof=s=>CAT[s.k].y*(s.pip?1.8:1);
  // the years grown by `at`: while its dirt is wet, or always once a tree in the ground is established (fruiting age); a black walnut beside it halves that
  const grown=(s,t,c)=>{ const K=CAT[s.k], r=c.walnut?.5:1, Y=Yof(s); let g=s.g||0; const a=s.at||s.t0;
    if(!c.pot&&g>=Y)g+=Math.max(0,t-a)/DAY*r; else { const e=Math.min(t,s.wet||0); if(e>a)g+=(e-a)/DAY*r; }
    if(K.wrap&&!c.pot&&!s.wr&&winterIn(s.chk||s.t0,t)&&g>1)g=1; return g; };
  // what a tree is now (anyone's view; c: {pot, partner, male, bees, walnut, shade}); nothing here changes the tree
  FTREES.view=(s,c={})=>{ const K=CAT[s.k], t=c.now||now(), m=mOf(t), pot=!!c.pot, why=[];
    const dead=!!s.dead||(!pot&&K.z>=8&&winterIn(s.t0,t)), die=!dead&&K.wrap&&!pot&&!s.wr&&winterIn(s.chk||s.t0,t)&&(s.g||0)>1;
    const g=dead?(s.g||0):grown(s,t,c), Y=Yof(s), f=g/Y, stage=f<.06?1:f<.3?2:f<1?3:4, mature=stage===4&&!dead;
    const sapNow=K.sap&&K.m.includes(m), bare=dead||(!K.ev&&(m===12||m<=2||(m===3&&K.bl!==3)||sapNow)), autumn=!K.ev&&!dead&&(m===10||m===11), bloom=mature&&m===K.bl&&!bare;
    const dry=pot?(s.wet||0)<t:!mature&&(s.wet||0)<t;
    const V={K,dead,die,g,Y,f,stage,mature,bare,autumn,bloom,dry,m,avail:0,crop:0,picked:0,birds:0,wind:0,wasps:false,blk:null,why,male:s.sx==='m'};
    if(dead){ why.push(K.z>=8?'THE FROST KILLED IT: IT IS TOO TENDER FOR A NEW YORK WINTER OUTSIDE.':'IT IS DEAD.'); return V; }
    if(die)why.push('IT DIED BACK IN THE FROST (WRAP IT IN BURLAP EACH WINTER).');
    const mult=(blk)=>{ let n=K.n*(s.q||1)*(K.m.length>=12?.34:1)*(pot?.5:1);
      if(s.sx==='m'){ return 0; } if(s.sx==='f'&&!c.male){ why.push('NO MALE '+K.name+' NEAR IT: NO FRUIT.'); return 0; }
      if(K.p==='two'){ if(!c.partner){ n*=.12; why.push('IT NEEDS A SECOND '+(K.pg==='apple'?'APPLE OR CRABAPPLE':K.pg.toUpperCase())+' NEAR IT TO SET FRUIT.'); } else if(c.bees)n*=1.15; } else if(c.bees)n*=1.05;
      if(c.walnut){ n*=.5; why.push('A BLACK WALNUT BESIDE IT POISONS THE SOIL.'); } if(c.shade){ n*=.85; why.push('A TALLER TREE SHADES IT.'); }
      if(s.pr&&s.pr>blk.a-300*DAY&&s.pr<blk.b)n*=1.25;
      if(!pot&&K.frost&&hs(s.id,blk.key+'frost')<.3){ why.push('A LATE FROST KILLED THE BLOSSOM THIS YEAR.'); return 0; }
      if(s.db===yOf(blk.a)||die){ return 0; }
      if(K.thin&&s.th!==blk.key&&hs(s.id,blk.key+'snap')<.4){ n*=.5; why.push('A BRANCH SNAPPED UNDER THE UNTHINNED FRUIT.'); }
      return Math.max(1,Math.round(n)); };
    const rate=K.bird?.5:K.nut?.4:.12;
    const blk=mature?block(t,K.m):null;
    if(blk){ const N=mult(blk), ripe=Math.max(0,Math.min(1,(t-blk.a)/(blk.b-blk.a)*1.4+.15)), picked=(s.pk&&s.pk[blk.key])||0, birds=!pot&&!s.nt?Math.floor(N*rate*ripe*.6):0;
      Object.assign(V,{blk,crop:N,picked,birds,avail:Math.max(0,Math.floor(N*ripe)-birds-picked)}); if(birds&&!K.sap)why.push((K.nut?'SQUIRRELS':'BIRDS')+' HAVE TAKEN '+birds+' (A BIRD NET STOPS THEM).'); }
    if(mature&&!pot&&!K.sap){ const pb=prevBlock(t,K.m); if(pb&&t-pb.b<45*DAY&&s.wc!==pb.key&&s.t0<pb.a&&g-(t-pb.a)/DAY>=Y){ const ws=why.length, N=mult(pb), left=N-Math.floor(N*rate*.6)*(s.nt?0:1)-((s.pk&&s.pk[pb.key])||0); why.length=ws;
      V.wind=Math.max(0,Math.min(12,left)); V.pb=pb; V.wasps=V.wind>0&&m>=6&&m<=11; } }
    return V; };
  // the owner's turn: what has passed is written down (the years grown, a die-back, the frost)
  FTREES.tick=(s,c={})=>{ const t=c.now||now(), V=FTREES.view(s,{...c,now:t}); if(V.dead){ s.dead=1; return V; } if(V.die){ s.db=yOf(t)+(mOf(t)===12?1:0); }
    s.g=+V.g.toFixed(4); s.at=t; s.chk=t; return V; };
  FTREES.pick=(s,V,n)=>{ const k=V.blk.key, o=s.pk||{}, pk={[k]:(o[k]||0)+n}; for(const q in o)if(+q<+k&&+q>+k-200)pk[q]=o[q]; s.pk=pk; FTREES.logPick(s.k,n); };
  FTREES.canPrune=(s,V)=>V.mature&&(V.bare||CAT[s.k].ev&&(V.m===1||V.m===2))&&!(s.pr&&now()-s.pr<200*DAY);
  FTREES.thinFor=(s,V)=>{ if(!V.mature||!CAT[s.k].thin)return null; const t=now(), b=block(t,CAT[s.k].m)||block(mNext(t),CAT[s.k].m); return b&&s.th!==b.key?b.key:null; };
  FTREES.label=(s,V,who)=>{ const K=V.K, sx=s.sx==='m'?' (MALE)':s.sx==='f'?' (FEMALE)':'', nm=(who?who+' ':'')+(s.pip?'WILD ':'')+K.name+(/PALM$/.test(K.name)?'':K.ban?' PLANT':/^(tea|coffee|elder|hazel)$/.test(K.k)?' BUSH':' TREE')+sx;
    if(V.dead)return nm+': DEAD'; if(V.stage<4)return nm+': '+['','A SEEDLING','A SAPLING','YOUNG'][V.stage]+(V.stage===3?', FRUIT IN ABOUT '+Math.max(1,Math.ceil(V.Y-V.g))+' DAY'+(Math.ceil(V.Y-V.g)===1?'':'S'):'')+(V.dry?' · DRY':'');
    const st=V.blk?(V.avail?V.avail+(K.sap?' JUGS OF SAP':' RIPE'):V.crop?'RIPENING':'NO CROP THIS YEAR'):V.bloom?'IN BLOSSOM':V.bare?'BARE FOR WINTER':'RESTING';
    return nm+': '+st+(V.dry?' · DRY':'')+(V.wind?' · '+V.wind+' WINDFALLS':'')+(V.wasps?' · WASPS':'')+(s.nt?' · NETTED':'')+(s.wr?' · WRAPPED':''); };
  FTREES.ctx=(s,list,o={})=>{ const K=CAT[s.k], P=list.filter(q=>q!==s&&!q.dead&&CAT[q.k]), mat=q=>(q.g||0)>=Yof(q);
    return {pot:!!o.pot,partner:P.some(q=>CAT[q.k].pg===K.pg&&mat(q)),male:P.some(q=>q.k===s.k&&q.sx==='m'&&mat(q)),bees:!!o.bees||P.some(q=>q.k==='linden'&&mat(q)),walnut:!!o.walnut&&s.k!=='blackwalnut',shade:!!o.shade}; };

  /* ---------- the model: one mesh a tree (bark, branches and leaves in one, coloured by its vertices), its fruit and blossom instanced; built in metres, at full size, shared by every tree of a kind at the same look ---------- */
  const V3=THREE.Vector3, BODY=new Map(), MAT=new THREE.MeshLambertMaterial({vertexColors:true,flatShading:true}), FMAT=new THREE.MeshLambertMaterial({color:0xffffff});
  const HT={round:4.5,vase:4,spread:4.4,pyramid:5,column:6,shrub:2.6,weep:5,palm:6};
  const merge=parts=>{ parts=parts.map(([g,c])=>[g.index?g.toNonIndexed():g,c]); let n=0; for(const [g] of parts)n+=g.attributes.position.count; const P=new Float32Array(n*3), N=new Float32Array(n*3), C=new Float32Array(n*3); let o=0; const col=new THREE.Color();
    for(const [g,c] of parts){ const q=g, p=q.attributes.position.array, nr=q.attributes.normal.array; col.set(c); P.set(p,o*3); N.set(nr,o*3); for(let i=0;i<q.attributes.position.count;i++){ C[(o+i)*3]=col.r; C[(o+i)*3+1]=col.g; C[(o+i)*3+2]=col.b; } o+=q.attributes.position.count; }
    const G=new THREE.BufferGeometry(); G.setAttribute('position',new THREE.BufferAttribute(P,3)); G.setAttribute('normal',new THREE.BufferAttribute(N,3)); G.setAttribute('color',new THREE.BufferAttribute(C,3)); G.computeBoundingSphere(); return G; };
  const limb=(a,b,r0,r1,seg=5)=>{ const d=new V3().subVectors(b,a), L=d.length(), g=new THREE.CylinderGeometry(r1,r0,L,seg,1); g.translate(0,L/2,0); const q=new THREE.Quaternion().setFromUnitVectors(new V3(0,1,0),d.normalize()); g.applyQuaternion(q); g.translate(a.x,a.y,a.z); return g; };
  const mix=(a,b,k)=>new THREE.Color(a).lerp(new THREE.Color(b),k).getHex(), shade=(c,k)=>k>1?mix(c,0xffffff,k-1):new THREE.Color(c).multiplyScalar(k).getHex();
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
        const g=K.ban?new THREE.BoxGeometry(L,.01*H,.14*H):new THREE.BoxGeometry(L,.012*H,.06*H); g.translate(L/2,0,0); g.rotateZ(Math.atan2(e.y-top.y,L)); g.rotateY(-an); g.translate(top.x,top.y,top.z); parts.push([g,i%2?K.leaf:shade(K.leaf,.8)]); } }
    else { const tt=K.c==='shrub'?.32:K.c==='pyramid'?.3:K.c==='column'?.45:K.c==='weep'?.6:K.c==='vase'?.36:K.c==='spread'?.32:.45, tr=(K.c==='shrub'?.03:.045)*H;
      if(K.c==='shrub'){ for(let i=0;i<3;i++){ const an=i*2.1+r(i); parts.push([limb(new V3(0,0,0),new V3(Math.cos(an)*.12*H,tt*H,Math.sin(an)*.12*H),tr,tr*.6),barkC]); } }
      else parts.push([limb(new V3(0,0,0),new V3(0,tt*H,0),tr,tr*.75,7),barkC]);
      if(look.bark)parts.push([limb(new V3(0,.05*H,0),new V3(0,tt*H*.85,0),tr*1.06,tr*.82,7),0xc0603a]);
      const L=lumps(K); for(let i=0;i<L.length;i++){ const [x,y,z]=L[i]; parts.push([limb(new V3(0,tt*H*.9,0),new V3(x*H*.8,y*H*.92,z*H*.8),tr*.55,tr*.25),barkC]); }
      if(look.bare||look.dead){ for(let i=0;i<10;i++){ const an=i*.63+r(i+20), a=L[i%L.length]; parts.push([limb(new V3(a[0]*H*.8,a[1]*H*.92,a[2]*H*.8),new V3(a[0]*H*1.25+Math.cos(an)*.08*H,a[1]*H*1.12,a[2]*H*1.25+Math.sin(an)*.08*H),tr*.2,tr*.06,4),barkC]); } }
      else { for(let i=0;i<L.length;i++){ const [x,y,z,rad]=L[i], g=new THREE.IcosahedronGeometry(rad*H,1); if(K.c==='pyramid'||K.c==='column')g.scale(1,1.35,1); g.translate(x*H,y*H,z*H); parts.push([g,i%3===2?shade(leafC,.82):i%3===1?shade(leafC,1.08):leafC]); }
        if(K.c==='pyramid'){ const g=new THREE.ConeGeometry(.2*H,.32*H,7); g.translate(0,.96*H,0); parts.push([g,leafC]); }
        if(K.c==='weep')for(let i=0;i<14;i++){ const an=i/14*6.283, x=Math.cos(an)*.32*H, z=Math.sin(an)*.32*H, g=new THREE.BoxGeometry(.012*H,.42*H,.012*H); g.translate(x,.48*H,z); parts.push([g,i%2?leafC:shade(leafC,1.15)]); } } }
    if(look.wrap){ const g=new THREE.CylinderGeometry(.3*H,.34*H,.8*H,10); g.translate(0,.42*H,0); parts.push([g,0xa0804a]); const b=new THREE.CylinderGeometry(.18*H,.15*H,.14*H,10); b.translate(0,.88*H,0); parts.push([b,0x8a8a92]); }
    if(look.bucket){ const g=new THREE.CylinderGeometry(.045*H,.04*H,.08*H,8); g.translate(.07*H,.18*H,0); parts.push([g,0x9aa0a8]); }
    const G=merge(parts); G.userData.H=H; BODY.set(key,G); return G; };
  // where the fruit hangs (a tree 1 tall): over the outside of its crown, lower half most; on the trunk for cacao and papaya; under the fronds for a palm
  const SPOTS=new Map(), spots=K=>{ if(SPOTS.has(K.k))return SPOTS.get(K.k); const out=[], r=i=>hs(K.k+'f',i);
    if(K.c==='palm'||K.cauli){ const top=K.c==='palm'?(K.ban?.5:.92):.4; for(let i=0;i<24;i++){ const a=i*2.4; out.push(new V3(Math.cos(a)*(K.cauli&&K.c!=='palm'?.05:.07)+(K.c==='palm'&&!K.ban?.06:0),top-(i%6)*.05,Math.sin(a)*(K.cauli&&K.c!=='palm'?.05:.07))); } }
    else { const L=lumps(K); for(let i=0;i<24;i++){ const [x,y,z,rad]=L[i%L.length], o=Math.hypot(x,z)>.03?Math.atan2(z,x):r(i+70)*6.283, a=o+(r(i)-.5)*2.2, e=-.1-r(i+40)*.6, c=Math.cos(e), R=rad*1.04; out.push(new V3(x+Math.cos(a)*c*R,y+Math.sin(e)*R*(K.c==='pyramid'||K.c==='column'?1.35:1),z+Math.sin(a)*c*R)); } }
    SPOTS.set(K.k,out); return out; };
  const FG=new THREE.SphereGeometry(1,7,5), BG=new THREE.IcosahedronGeometry(1,0), m4=new THREE.Matrix4(), q4=new THREE.Quaternion(), cl=new THREE.Color();
  // a tree's group in metres: .set(view, s, {pot}) shows it as it is now
  FTREES.make=()=>{ const G=new THREE.Group(), me=new THREE.Mesh(BODY.get('none')||new THREE.BufferGeometry(),MAT); me.castShadow=true; me.receiveShadow=true; me.raycast=()=>{}; G.add(me);
    const fr=new THREE.InstancedMesh(FG,FMAT,40); fr.count=0; fr.castShadow=true; fr.raycast=()=>{}; fr.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(120),3); G.add(fr);
    const bl=new THREE.InstancedMesh(BG,FMAT,40); bl.count=0; bl.raycast=()=>{}; bl.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(120),3); G.add(bl);
    const net=new THREE.Mesh(new THREE.IcosahedronGeometry(1,1),new THREE.MeshBasicMaterial({color:0xf0f0f0,wireframe:true,transparent:true,opacity:.35})); net.visible=false; net.raycast=()=>{}; G.add(net);
    G.userData.key=''; G.userData.h=0;
    G.userData.set=(V,s,o={})=>{ const K=V.K, sc=(o.pot?.36:.72)*(V.dead?Math.max(.15,Math.min(1,V.f)):.1+.9*Math.pow(Math.min(1,V.f),.8)), look={bare:V.bare,autumn:V.autumn,bloom:V.bloom,dead:V.dead,wrap:!!s.wr&&!o.pot,bucket:K.sap&&V.blk&&!V.dead,bark:K.bark&&!!V.blk};
      const B=body(K,look), H=B.userData.H; me.geometry=B; me.scale.setScalar(sc); G.userData.h=H*sc;
      const S=spots(K), fs=Math.max(.035,.07*Math.pow(K.fs,.7)), show=K.sap||V.dead?0:Math.min(S.length,V.avail+(V.blk&&!V.avail&&V.crop?Math.min(6,V.crop):0)), c0=cl.set(K.fr), green=new THREE.Color(K.leaf).lerp(c0,.35);
      let n=0; for(let i=0;i<show;i++){ const p=S[i]; m4.compose(new V3(p.x*H*sc,p.y*H*sc,p.z*H*sc),q4,new V3(fs,fs*(K.cauli||K.k==='papaya'?1.6:K.k==='banana'?2.2:1),fs)); fr.setMatrixAt(n,m4); fr.setColorAt(n,i<V.avail?c0:green); n++; }
      for(let i=0;i<Math.min(10,V.wind||0);i++){ const a=hs(s.id,i)*6.283, d=(.15+hs(s.id,i+9)*.25)*H*sc; m4.compose(new V3(Math.cos(a)*d,fs*.6,Math.sin(a)*d),q4,new V3(fs,fs*.6,fs)); fr.setMatrixAt(n,m4); fr.setColorAt(n,cl.set(shade(K.fr,.45))); n++; }
      fr.count=n; fr.instanceMatrix.needsUpdate=true; if(fr.instanceColor)fr.instanceColor.needsUpdate=true;
      let b=0; if(V.bloom){ const fc=cl.set(K.fl); for(let i=0;i<S.length&&b<36;i++){ const p=S[(i*7)%S.length]; m4.compose(new V3(p.x*H*sc+(hs(K.k,i)-.5)*.1*sc,p.y*H*sc+.03*sc,p.z*H*sc),q4,new V3(.035,.035,.035)); bl.setMatrixAt(b,m4); bl.setColorAt(b,fc); b++; } }
      bl.count=b; bl.instanceMatrix.needsUpdate=true; if(bl.instanceColor)bl.instanceColor.needsUpdate=true;
      net.visible=!!s.nt&&!o.pot&&!V.dead; if(net.visible){ const L=K.c==='palm'?[[0,.9,0,.3]]:lumps(K); let y=0; for(const l of L)y+=l[1]; net.position.set(0,y/L.length*H*sc,0); net.scale.set(.42*H*sc,.36*H*sc,.42*H*sc); } };
    return G; };
  FTREES.merge=merge; FTREES.MAT=MAT;
  FTREES.height=(k,V,pot)=>HT[CAT[k].c]*CAT[k].hs*(pot?.36:.72)*(.1+.9*Math.pow(Math.min(1,V?V.f:1),.8));
  FTREES.BOOK=()=>({id:'trees',title:'FRUIT TREES',rows:()=>FTREES.ids.map(k=>{ const K=CAT[k], n=FTREES.log&&FTREES.log[k]||0; return [K.name,!!n,n?'PICKED '+n:'',false]; }),foot:'Saplings from the Tomato. A tree ages a year each real day and fruits in its real months. Warm trees live in a big pot at home; hardy ones in your plot in the park orchard.'});
  FTREES.log={}; try{ FTREES.log=JSON.parse(OWNED.get('treelog')||'{}')||{}; }catch(e){}
  FTREES.logPick=(k,n)=>{ FTREES.log[k]=(FTREES.log[k]||0)+n; try{ OWNED.set('treelog',JSON.stringify(FTREES.log)); }catch(e){} }; FORAGE.BOOK.push(FTREES.BOOK());
}
export {FTREES};
