// THE THINGS' OWN MODELS (owner, 8 Nov 2026: "i awnt the 3d model to show up for things like guitar", "do that for all items"): a 3D look for every item no family draws, built from the inspect window's parts in metres and coloured from its own bag picture; the guitar is the one you play.
import {THREE} from './003-shx.js';
import {BAG, INSPECT} from './003b-systems.js';
import {GHOLD} from './146zoa-guitar-hold.js';
{ const P=(...a)=>INSPECT.part(...a), G=()=>new THREE.Group(), add=(g,...a)=>{ g.add(P(...a)); return g; };
  // an item's two main colours, from its bag picture (the outline left out); grey and white when it has none
  const cols=id=>{ let c=null; try{ c=BAG.pic&&BAG.pic(id); }catch(e){} if(!c)return [0x9a8a7a,0xe8e2d4]; const D=c.getContext('2d').getImageData(0,0,c.width,c.height).data, N=new Map();
    for(let i=0;i<D.length;i+=4){ if(D[i+3]<128)continue; const r=D[i],g=D[i+1],b=D[i+2]; if(r+g+b<90)continue; const k=(r>>4<<8)|(g>>4<<4)|(b>>4); N.set(k,(N.get(k)||0)+1); }
    const L=[...N].sort((a,b)=>b[1]-a[1]).map(([k])=>((k>>8&15)*17<<16)|((k>>4&15)*17<<8)|((k&15)*17)); return [L[0]??0x9a8a7a,L[1]??L[0]??0xe8e2d4]; };
  const M=(kind,o={})=>({kind,...o}), METAL=M('metal',{metal:1,rough:.3}), GLASS={glass:1};
  // the shapes: each a few parts about a metre's scale (the ground sets its real size)
  const S={
    spray:(a,b)=>{ const g=G(); add(g,'cyl',a,0,.09,0,.033,.18,.033,0,0,0,M('metal',{metal:1,rough:.35})); add(g,'cap',a,0,.18,0,.033,.025,.033,0,0,0,M('metal',{metal:1,rough:.35})); add(g,'cyl',0xf4efe4,0,.205,0,.012,.025,.012,0,0,0,M('plastic')); return g; },
    can:(a,b)=>{ const g=G(); add(g,'cyl',a,0,.06,0,.033,.12,.033,0,0,0,M('metal',{metal:1,rough:.35})); add(g,'cyl',b,0,.06,0,.0335,.07,.0335,0,0,0,M('paper')); add(g,'cyl',0xc8ccd2,0,.121,0,.03,.004,.03,0,0,0,METAL); return g; },
    box:(a,b)=>{ const g=G(); add(g,'box',a,0,.15,0,.2,.3,.07,0,0,0,M('paper')); add(g,'box',b,0,.17,.036,.14,.12,.002,0,0,0,M('paper')); return g; },
    flat:(a,b)=>{ const g=G(); add(g,'box',a,0,.01,0,.2,.02,.3,0,0,0,M('paper')); add(g,'box',b,0,.021,0,.14,.002,.2,0,0,0,M('paper')); return g; },
    card:(a,b)=>{ const g=G(); add(g,'box',a,0,.002,0,.15,.003,.1,0,0,0,M('paper')); add(g,'box',b,.03,.004,0,.06,.001,.07,0,0,0,M('paper')); return g; },
    board:(a,b)=>{ const g=G(); add(g,'box',0x6a4a2a,0,.3,0,.62,.62,.03,0,0,0,M('wood')); add(g,'box',b,0,.3,.016,.56,.56,.004,0,0,0,M('cloth')); add(g,'ball',a,-.08,.34,.02,.1,.08,.01); return g; },
    bottle:(a,b)=>INSPECT.shape('bottle',a,b), jar:(a,b)=>INSPECT.shape('jar',a,b), sack:(a)=>INSPECT.shape('sack',a), packet:(a,b)=>INSPECT.shape('packet',a,b),
    implant:(a,b)=>{ const g=G(); add(g,'box',0xe8ecee,0,.006,0,.12,.012,.08,0,0,0,M('plastic')); add(g,'cyl',0xc8ccd2,0,.022,0,.012,.07,.012,0,Math.PI/2,0,METAL); add(g,'ball',a,0,.022,0,.016,.016,.016,0,0,1); return g; },   // an implant in its sterile tray: a steel capsule, its core glowing
    tub:(a,b)=>{ const g=G(); add(g,'cyl',a,0,.06,0,.06,.12,.06,0,0,0,M('plastic')); add(g,'cyl',b,0,.122,0,.064,.01,.064,0,0,0,M('plastic')); return g; },
    jug:(a,b)=>{ const g=G(); add(g,'box',a,0,.14,0,.14,.26,.1,0,0,0,M('plastic')); add(g,'cyl',b,0,.29,0,.025,.04,.025,0,0,0,M('plastic')); add(g,'tor',a,.05,.22,0,.04,.05,.04,Math.PI/2,0,0,M('plastic')); return g; },
    carton:(a,b)=>{ const g=G(); add(g,'box',a,0,.1,0,.09,.2,.09,0,0,0,M('paper')); add(g,'cone',b,0,.225,0,.065,.05,.065,0,0,0,M('paper')); return g; },
    crystal:(a,b)=>{ const g=G(); add(g,'oct',a,0,.04,0,.025,.045,.025,0,0,0,M('gem',{glass:1})); add(g,'oct',b,.02,.025,.01,.015,.025,.015,0,.4,0,M('gem',{glass:1})); return g; },
    gem:(a)=>{ const g=G(); add(g,'cone',a,0,.012,0,.02,.016,.02,Math.PI,0,0,M('gem',{glass:1})); add(g,'cyl',a,0,.024,0,.02,.008,.02,0,0,0,M('gem',{glass:1})); return g; },
    rock:(a,b)=>{ const g=G(); add(g,'dod',a,0,.06,0,.07,.06,.065,0,0,0,M('stone')); add(g,'ico',b,.03,.08,.04,.03,.03,.03,0,0,0,M('gem',{glass:1})); return g; },
    mushroom:(a,b)=>{ const g=G(); add(g,'cyl',0xe8e0cc,0,.04,0,.012,.08,.012,0,0,0,M('food')); add(g,'cap',a,0,.075,0,.045,.035,.045,0,0,0,M('food')); add(g,'ball',b,.02,.1,.01,.006,.004,.006); return g; },
    fruit:(a)=>{ const g=G(); add(g,'sph',a,0,.04,0,.04,.04,.04,0,0,0,M('food')); add(g,'cyl',0x5a3a1a,0,.085,0,.003,.015,.003,0,0,0,M('wood')); add(g,'ball',0x3f8a3a,.012,.085,0,.012,.003,.007,0,0,0,M('leaf')); return g; },
    moth:(a,b)=>{ const g=G(); add(g,'cyl',0x3a2a1a,0,.005,0,.004,.04,.004,Math.PI/2,0,0,M('fur')); for(const s of [-1,1]){ add(g,'ball',a,s*.022,.006,-.004,.022,.002,.016,0,0,0,M('wax')); add(g,'ball',b,s*.016,.006,.014,.013,.002,.01,0,0,0,M('wax')); } return g; },
    glass:(a)=>{ const g=G(); add(g,'cyl',a,0,.06,0,.035,.11,.035,0,0,0,M('wet')); add(g,'cyl',0xe6f0ec,0,.07,0,.04,.14,.04,0,0,0,GLASS); return g; },
    plate:(a,b)=>INSPECT.shape('plate',a,b), lump:(a)=>INSPECT.shape('lump',a), bowl:(a)=>INSPECT.shape('bowl',a),
    coat:(a,b)=>{ const g=G(); add(g,'box',a,0,.02,0,.5,.04,.7,0,0,0,M('cloth')); for(const s of [-1,1]){ add(g,'box',a,s*.36,.018,.12,.14,.035,.5,0,0,0,M('cloth')); add(g,'box',b,s*.08,.042,-.05,.08,.004,.55,0,0,0,M('cloth')); } add(g,'box',b,0,.045,.33,.3,.012,.08,0,0,0,M('cloth')); for(let i=0;i<4;i++)add(g,'ball',0xd8c890,0,.045,-.25+i*.14,.012,.006,.012,0,0,0,METAL); return g; }, goggles:(a,b)=>INSPECT.shape('goggles',a,b), gadget:(a)=>INSPECT.shape('gadget',a), cage:()=>INSPECT.shape('cage'),
    jeans:(a)=>{ const g=G(); add(g,'box',a,0,.02,.3,.4,.04,.16,0,0,0,M('denim')); for(const s of [-1,1])add(g,'box',a,s*.1,.02,-.12,.17,.035,.7,0,0,0,M('denim')); return g; },
    hat:(a,b)=>{ const g=G(); add(g,'cyl',a,0,.004,0,.2,.008,.2,0,0,0,M('cloth')); add(g,'cyl',a,0,.07,0,.1,.13,.1,0,0,0,M('cloth')); add(g,'cyl',b,0,-.08,0,.2,.15,.2,0,0,0,M('cloth',{glass:1})); return g; },
    candle:(a)=>{ const g=G(); add(g,'cyl',a,0,.09,0,.035,.18,.035,0,0,0,M('wax')); add(g,'cyl',0x2a2a2a,0,.19,0,.002,.02,.002); add(g,'cone',0xffc04a,0,.21,0,.006,.02,.006,0,0,1); return g; },
    ball:(a)=>{ const g=G(); add(g,'sph',a,0,.0215,0,.0215,.0215,.0215,0,0,0,M('leather')); return g; },
    coin:(a)=>{ const g=G(); add(g,'cyl',a,0,.001,0,.0125,.002,.0125,0,0,0,METAL); return g; },
    ring:(a,b)=>{ const g=G(); add(g,'tor',a,0,.005,0,.01,.01,.01,Math.PI/2,0,0,M('plastic')); add(g,'oct',b,0,.012,.009,.005,.005,.005,0,0,0,{glass:1}); return g; },
    yoyo:(a)=>{ const g=G(); for(const s of [-1,1])add(g,'cyl',a,0,.03,s*.009,.03,.012,.03,Math.PI/2,0,0,M('plastic')); add(g,'cyl',0xe8e2d4,0,.03,0,.004,.008,.004,Math.PI/2,0,0); return g; },
    cube:(a,b)=>{ const g=G(); add(g,'box',0x1a1a1e,0,.03,0,.056,.056,.056,0,0,0,M('plastic')); for(const [x,y,z,sx,sy,sz,c] of [[0,.0585,0,.05,.002,.05,a],[0,.03,.0285,.05,.05,.002,b],[.0285,.03,0,.002,.05,.05,0xf4efe4]])add(g,'box',c,x,y,z,sx,sy,sz,0,0,0,M('plastic')); return g; },
    plush:(a,b)=>{ const g=G(); add(g,'ball',a,0,.1,0,.1,.11,.09,0,0,0,M('fur')); add(g,'ball',a,0,.24,0,.08,.075,.075,0,0,0,M('fur')); for(const s of [-1,1]){ add(g,'ball',a,s*.06,.31,0,.03,.03,.02,0,0,0,M('fur')); add(g,'ball',0x1a1a1a,s*.028,.25,.07,.01,.01,.006); add(g,'ball',a,s*.09,.12,.03,.04,.06,.04,0,0,0,M('fur')); } add(g,'ball',b,0,.22,.07,.025,.02,.015,0,0,0,M('fur')); return g; },
    phone:(a)=>{ const g=G(); add(g,'box',a,0,.005,0,.07,.01,.14,0,0,0,M('plastic')); add(g,'box',0x16181c,0,.011,0,.062,.002,.12,0,0,0,M('glass')); return g; },
    radio:(a)=>{ const g=G(); add(g,'box',a,0,.06,0,.1,.12,.04,0,0,0,M('plastic')); add(g,'cyl',0xc8ccd2,.035,.16,0,.003,.1,.003,0,0,0,METAL); add(g,'box',0x16181c,0,.08,.021,.07,.04,.002,0,0,0,M('glass')); return g; },
    reel:(a)=>{ const g=G(); add(g,'cyl',a,0,.03,0,.03,.03,.03,Math.PI/2,0,0,METAL); add(g,'cyl',0x2a2a2e,0,.03,.02,.008,.03,.008,Math.PI/2,0,0,METAL); add(g,'box',0x2a2a2e,0,.065,0,.01,.03,.06,0,0,0,METAL); return g; },
    rod:(a,b)=>{ const g=G(); add(g,'cyl',a,0,.01,0,.008,2.4,.008,Math.PI/2,0,0,M('plastic')); add(g,'cyl',b,0,.012,-1,.014,.35,.014,Math.PI/2,0,0,M('cork')); return g; },
    lure:(a,b)=>{ const g=G(); add(g,'ball',a,0,.005,0,.012,.003,.03,0,0,0,METAL); add(g,'tor',b,0,.005,.035,.006,.006,.006,Math.PI/2,0,0,METAL); return g; },
    worm:(a)=>{ const g=G(); for(let i=0;i<6;i++)add(g,'ball',a,Math.sin(i*.9)*.012,.005,i*.016-.04,.008,.006,.01,0,0,0,M('rubber')); return g; },
    cooler:(a,b)=>{ const g=G(); add(g,'box',a,0,.17,0,.55,.34,.34,0,0,0,M('plastic')); add(g,'box',b,0,.35,0,.56,.04,.35,0,0,0,M('plastic')); add(g,'box',0x2a2a2e,0,.39,0,.25,.03,.04,0,0,0,M('plastic')); return g; },
    hive:(a,b)=>{ const g=G(); for(let i=0;i<3;i++)add(g,'box',i%2?a:b,0,.1+i*.2,0,.5,.19,.4,0,0,0,M('wood')); add(g,'box',0x8a8a8a,0,.62,0,.54,.04,.44,0,0,0,METAL); return g; },
    smoker:(a)=>{ const g=G(); add(g,'cyl',0xc8ccd2,0,.1,0,.05,.2,.05,0,0,0,METAL); add(g,'cone',0xc8ccd2,0,.23,0,.05,.06,.05,0,0,0,METAL); add(g,'box',a,-.09,.1,0,.04,.14,.08,0,0,0,M('leather')); return g; },
    block:(a)=>{ const g=G(); add(g,'box',a,0,.02,0,.1,.04,.06,0,0,0,M('wax')); return g; },
    pot:(a,b)=>{ const g=G(); add(g,'cyl',a,0,.1,0,.12,.2,.12,0,0,0,M('ceramic')); add(g,'cyl',a,0,.205,0,.135,.03,.135,0,0,0,M('ceramic')); add(g,'cyl',0x4a3020,0,.205,0,.115,.012,.115,0,0,0,M('dirt')); return g; },
    plant:(a,b)=>{ const g=S.pot(0xb06a3a); add(g,'ball',a,0,.33,0,.13,.12,.13,0,0,0,M('leaf')); add(g,'ball',b,.06,.4,.04,.03,.03,.03,0,0,0,M('wax')); return g; },
    cactus:(a,b)=>{ const g=S.pot(0xb06a3a); add(g,'cyl',a,0,.33,0,.05,.22,.05,0,0,0,M('leaf')); add(g,'cyl',a,.06,.36,0,.025,.1,.025,0,-.6,0,M('leaf')); add(g,'ball',b,0,.45,0,.02,.02,.02,0,0,0,M('wax')); return g; },
    feeder:(a,b)=>{ const g=G(); add(g,'cone',a,0,.3,0,.18,.08,.18,0,0,0,M('wood')); add(g,'cyl',0xdfeee8,0,.18,0,.08,.16,.08,0,0,0,GLASS); add(g,'cyl',b,0,.08,0,.14,.02,.14,0,0,0,M('wood')); return g; },
    wheel:(a,b)=>{ const g=G(); add(g,'box',a,0,.15,0,.5,.3,.35,0,0,0,M('metal',{metal:1,rough:.5})); add(g,'cyl',b,0,.31,0,.15,.02,.15,0,0,0,M('stone')); return g; },
    key:(a)=>{ const g=G(); add(g,'tor',a,-.06,.005,0,.03,.03,.03,Math.PI/2,0,0,METAL); add(g,'box',a,.03,.005,0,.12,.008,.012,0,0,0,METAL); add(g,'box',a,.08,.005,.012,.008,.008,.02,0,0,0,METAL); return g; },
    feather:(a,b)=>{ const g=G(); add(g,'cyl',0xe8e2d4,0,.004,0,.002,.25,.002,Math.PI/2,0,0); add(g,'ball',a,0,.004,.03,.025,.002,.1,0,0,0,M('fur')); add(g,'ball',b,0,.005,.08,.015,.002,.04,0,0,0,M('fur')); return g; },
    acorns:(a)=>{ const g=G(); for(let i=0;i<5;i++){ const x=Math.cos(i*1.3)*.025, z=Math.sin(i*1.3)*.025; add(g,'ball',a,x,.012,z,.01,.013,.01,0,0,0,M('wood')); add(g,'cap',0x6a4a2a,x,.02,z,.011,.006,.011,0,0,0,M('wood')); } return g; },
    pouch:(a)=>{ const g=G(); add(g,'ball',a,0,.05,0,.07,.06,.05,0,0,0,M('leather')); add(g,'cone',a,0,.11,0,.03,.04,.03,0,0,0,M('leather')); add(g,'tor',0x3a2a1a,0,.1,0,.03,.03,.02,Math.PI/2,0,0,M('leather')); return g; },
    tank:(a,b)=>{ const g=G(); add(g,'cyl',a,0,.1,0,.09,.6,.09,Math.PI/2,0,0,METAL); add(g,'cap',a,0,.1,.3,.09,.05,.09,Math.PI/2,0,0,METAL); add(g,'cyl',0x2a2a2e,0,.1,.37,.02,.05,.02,Math.PI/2,0,0,METAL); add(g,'box',b,0,.02,0,.25,.03,.3,0,0,0,M('rubber')); return g; },
    flag:(a,b)=>{ const g=G(); add(g,'cyl',0x6a4a2a,0,.005,0,.005,.5,.005,Math.PI/2,0,0,M('wood')); add(g,'cone',a,0,.005,-.14,.1,.25,.004,Math.PI/2,0,0,M('cloth')); return g; },
    club:(a)=>{ const g=G(); add(g,'cyl',a,0,.03,-.08,.03,.3,.03,Math.PI/2,0,0,M('plastic')); add(g,'cyl',0xf4efe4,0,.03,.1,.012,.14,.012,Math.PI/2,0,0,M('plastic')); add(g,'sph',0xf4efe4,0,.03,.17,.016,.016,.016,0,0,0,M('plastic')); return g; },
    stick:(a,b)=>{ const g=G(); add(g,'cyl',0xe8d0a0,0,.004,.1,.003,.12,.003,Math.PI/2,0,0,M('wood')); add(g,'ball',a,0,.02,-.02,.025,.022,.07,0,0,0,M('food')); return g; },
    cloud:(a)=>{ const g=G(); add(g,'cyl',0xe8e0cc,0,.004,.15,.004,.2,.004,Math.PI/2,0,0,M('paper')); add(g,'ball',a,0,.06,-.05,.12,.11,.12,0,0,0,M('cloth')); return g; },
    pen:(a,b)=>{ const g=S.feather(a,b); add(g,'cone',0x2a2a2e,0,.004,-.13,.003,.02,.003,-Math.PI/2,0,0,METAL); return g; },
    auger:(a)=>{ const g=G(); add(g,'cyl',0xc8ccd2,0,.03,0,.02,1.1,.02,Math.PI/2,0,0,METAL); for(let i=0;i<8;i++)add(g,'tor',0xc8ccd2,0,.03,.15+i*.05,.06,.06,.05,0,0,0,METAL); add(g,'cyl',a,0,.03,-.55,.02,.3,.02,0,Math.PI/2,0,M('rubber')); return g; },
    crab:()=>INSPECT.shape('cage',0x5a4a3a),
    guitar:()=>{ const g=G(); if(GHOLD.model)g.add(GHOLD.model()); return g; },
    harp:(a,b)=>{ const g=G(); add(g,'box',a,0,.05,0,.5,.1,.3,0,0,0,M('wood')); add(g,'box',a,-.2,.85,0,.08,1.6,.08,0,0,0,M('wood')); add(g,'box',a,.05,1.55,0,.55,.08,.08,0,-.35,0,M('wood')); for(let i=0;i<12;i++)add(g,'cyl',0xe8d8a0,-.16+i*.03,.6+i*.07,0,.002,1-.07*i,.002,0,0,0,METAL); return g; },
    piano:(a,b)=>{ const g=G(); add(g,'box',a,0,.65,0,1.5,1.3,.6,0,0,0,M('wood')); add(g,'box',0xf4efe4,0,.75,.32,1.3,.03,.15,0,0,0,M('ivory')); for(let i=0;i<20;i++)if(i%7!==2&&i%7!==6)add(g,'box',0x16161a,-.6+i*.064,.77,.3,.025,.02,.09,0,0,0,M('wood')); for(const s of [-1,1])add(g,'box',a,s*.7,.3,.25,.08,.6,.12,0,0,0,M('wood')); return g; },
    drums:(a,b)=>{ const g=G(); add(g,'cyl',a,0,.3,0,.28,.4,.28,Math.PI/2,0,0,M('wood')); add(g,'cyl',0xf4efe4,0,.3,.2,.27,.01,.27,Math.PI/2,0,0,M('paper')); for(const [x,z,r] of [[-.4,.25,.18],[.4,.25,.2]]){ add(g,'cyl',a,x,.5,z,r,.2,r,0,0,0,M('wood')); add(g,'cyl',0xf4efe4,x,.6,z,r*.97,.01,r*.97,0,0,0,M('paper')); } add(g,'cyl',0xd8b04a,.55,.95,-.1,.22,.01,.22,.2,0,0,METAL); add(g,'cyl',0xc8ccd2,.55,.5,-.1,.01,.9,.01,0,0,0,METAL); return g; },
    kazoo:(a)=>{ const g=G(); add(g,'cyl',a,0,.012,0,.012,.12,.012,Math.PI/2,0,0,M('plastic')); add(g,'cyl',a,0,.025,.01,.008,.02,.008,0,0,0,M('plastic')); return g; },
    book:(a,b)=>INSPECT.shape('book',a,b), frame:(a,b)=>INSPECT.shape('frame',a,b), scroll:(a,b)=>{ const g=G(); add(g,'cyl',b,0,.025,0,.025,.3,.025,0,Math.PI/2,0,M('paper')); for(const s of [-1,1])add(g,'cyl',a,s*.16,.025,0,.01,.04,.01,0,Math.PI/2,0,M('wood')); return g; },
    kit:(a,b)=>{ const g=S.box(a,b); add(g,'tor',0x6a4a2a,0,.31,0,.04,.04,.02,0,0,0,M('leather')); return g; },
    cotton:(a)=>S.cloud(a), popcorn:(a,b)=>{ const g=S.tub(0xd83a3a,0xf4efe4); for(let i=0;i<9;i++)add(g,'ball',0xf4e8c0,Math.cos(i*2.3)*.035,.13+(i%3)*.01,Math.sin(i*2.3)*.035,.014,.012,.014,0,0,0,M('food')); return g; },
  };
  // which shape each item is (by its id), first match
  const BY=[[/^guitar$/,'guitar'],[/^jugball$/,'ball'],[/^jugclub$/,'club'],[/^harp$/,'harp'],[/^piano$/,'piano'],[/^drums$/,'drums'],[/^kazoo$/,'kazoo'],
    [/^spray_/,'spray'],[/^g_(beans|soup|tuna|spam|catfood|vienna|soda|beer|coffee|cleanser)$/,'can'],[/^g_(juice|water|shampoo|dishsoap|aspirin)$|^soda_|^lemonade$|^p_royal$|^curse_stink$/,'bottle'],[/^g_bleach$|^water$/,'jug'],[/^g_milk$/,'carton'],
    [/^g_(fishfood|oats|yogurt|noodles|vaseline)$/,'tub'],[/^(honey_|jar_)|^curse_(cloud|rats)$/,'jar'],[/^g_(chips|bagels|dogfood|rice|diapers|tp|towels|bananas|plantains)$|^dirt$|^fix_parts$/,'sack'],[/^g_(koolaid|gum|batteries|candy)$|^seed_/,'packet'],
    [/^g_(cereal|detergent|pasta|tea|qtips|matches|eggs|bread|cheese|butter)$|^f_(bonbons|candybox)$/,'box'],[/^g_(candle|bulb)$|^wax_candle$/,'candle'],[/^g_(toothbrush|toothpaste|deodorant|lighter|sponge|soap)$/,'block'],
    [/^cut_m_/,'mushroom'],[/^cut_/,'gem'],[/^(amber|amethyst|emerald|ruby|sapphire|opal|moonstone|quartz)$/,'crystal'],[/^(meteor|geode)$/,'rock'],[/^([mu]_|shroom_)/,'mushroom'],[/^fr_/,'fruit'],[/^mo_/,'moth'],
    [/^d_/,'glass'],[/^f_(chowder|hash|eggs|pancake|grilled|smokeeel|sturgeon|grillbass|hfish|hmush|fishfry|nachos)$/,'plate'],[/^f_(croissant|bec|blt|burger|hero|chopped|cake|pie)$/,'lump'],[/^f_icepop$|^corndog$|^funnelcake$/,'stick'],[/^f_popcorn$|^popcorn$/,'popcorn'],[/^cotton_candy$/,'cotton'],[/^f_gumball$/,'ball'],
    [/^(art_postcard|mus_postcard|lotto_ticket|play_ticket|ticket|fairticket|ptix|fairphoto|photo)$/,'card'],[/^(art_print|paper|news_paper)$|^plate_/,'flat'],[/^(canvas_|painting$|unfinished$)/,'board'],[/^(passport|mus_guidebook)$/,'book'],[/^rf_scroll$/,'scroll'],
    [/^(coat_|jacket_)/,'coat'],[/^jeans$/,'jeans'],[/^bee_veil$/,'hat'],[/^(shades|nv_goggles)$/,'goggles'],[/^(plush_|mus_plush$)/,'plush'],[/^prize_ring$/,'ring'],[/^prize_yoyo$/,'yoyo'],[/^cube\d$/,'cube'],[/^arc_token$/,'coin'],
    [/^(handheld|junk_handheld|pockettv|junk_pockettv|walkman|junk_walkman)$/,'gadget'],[/^phone_/,'phone'],[/^radio_scanner$/,'radio'],[/^reel_/,'reel'],[/^rod_/,'rod'],[/^lure_spoon$/,'lure'],[/^lure_worm$/,'worm'],[/^crabpot$/,'crab'],[/^auger$/,'auger'],[/^cooler_/,'cooler'],
    [/^bee_hive$/,'hive'],[/^bee_smoker$/,'smoker'],[/^bee_wax$/,'block'],[/^gb_/,'ball'],[/^gem_wheel$/,'wheel'],[/^orchard_key$/,'key'],[/^quill_pen$/,'pen'],[/^bird_feather$/,'feather'],[/^nut_acorn$/,'acorns'],[/^pouch$/,'pouch'],[/^scuba$/,'tank'],
    [/^fair_pennant$/,'flag'],[/^(bonsai)$/,'plant'],[/^im_/,'implant'],[/^cactus/,'cactus'],[/^pot$/,'pot'],[/^feeder$/,'feeder'],[/^(bs_kit)$/,'kit'],[/^mus_replica$/,'frame']];
  const shapeOf=id=>{ const k=String(id).split('~')[0]; for(const [re,s] of BY)if(re.test(k))return s; return null; };
  INSPECT.kinds.push({is:id=>!!shapeOf(id),make:id=>{ '@later'; const [a,b]=cols(String(id).split('~')[0]), g=S[shapeOf(id)](a,b); g.userData.made=1; return g; }});
  INSPECT.shapeOf=shapeOf; }
