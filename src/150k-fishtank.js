// THE FISH TANK: the tank in every apartment (owner, 5, 9 and 12 Nov 2026): live rippling water, caustics on the sand, Polyfork's koi and reef fish swimming; double-click it to look close and set its size, stand, rim, water, light, fish (their size and colour) and decor (Polyfork's corals, rocks and sunken things) (kept with your layout); with fish food the fish rise to eat.
import {SHARED, THREE} from './003-shx.js';
import {FORAGE, PETS, pos, SFX, UI, VR, W3} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {renderer} from './004-main.js';
import {SYS} from './006-map-pre.js';
import {FISHES} from './141f-fishes.js';
import {ROOMK} from './150a-bedroom.js';
import {TANKFX} from './150ja-tankfx.js';
{ const GL=.012, NX=TANKFX.NX, NZ=TANKFX.NZ, CAPS=40;
  const hs=(a,b)=>{ const s=Math.sin(a*127.1+b*311.7)*43758.5453; return s-Math.floor(s); };
  // the choices: each water says if it is salt; each fish its length in metres and which water it lives in
  const WATER={fresh:{n:'FRESH',salt:0,c:[.86,.96,.97],at:[.55,.82,.84],ad:2.2,s:0xcfeef2,sand:[.86,.8,.66]},salt:{n:'TROPICAL SALT',salt:1,c:[.72,.9,1],at:[.18,.58,.95],ad:1.3,s:0x8fd6ff,sand:[.95,.92,.84]},
    pond:{n:'MURKY POND',salt:0,c:[.72,.8,.56],at:[.34,.46,.2],ad:.55,s:0x7d9156,sand:[.5,.46,.34]},glow:{n:'BLACKLIGHT',salt:0,c:[.5,.42,.95],at:[.24,.12,.62],ad:1,s:0x8c66ff,sand:[.3,.3,.42],glow:1}};
  const KIND=[{id:'pfkoi',n:'KOI',L:.15,sp:.09,b:'cruise',var:['pfkoi','koi_showa','koi_gold','koi_sanke','koi_platinum','koi_asagi','koi_orange','koi_black','koi']},{id:'goldfish',n:'GOLDFISH',L:.1,sp:.1,b:'shoal'},{id:'pfclown',n:'CLOWNFISH',L:.09,sp:.14,salt:1,b:'hover'},{id:'pfbluetang',n:'BLUE TANG',L:.15,sp:.16,salt:1,b:'cruise'},
    {id:'yellowtang',n:'YELLOW TANG',L:.13,sp:.15,salt:1,b:'shoal'},{id:'angelfish',n:'ANGELFISH',L:.13,sp:.1,salt:1,b:'hover'},{id:'mandarinfish',n:'MANDARIN',L:.07,sp:.06,salt:1,b:'bottom'},
    {id:'puffer',n:'PUFFER',L:.12,sp:.07,salt:1,b:'hover'},{id:'lionfish',n:'LIONFISH',L:.15,sp:.06,salt:1,b:'hover'},{id:'moorishidol',n:'MOORISH IDOL',L:.13,sp:.12,salt:1,b:'cruise'},{id:'butterflyfish',n:'BUTTERFLYFISH',L:.11,sp:.12,salt:1,b:'shoal'},
    {id:'firefish',n:'FIREFISH',L:.07,sp:.1,salt:1,b:'hover'},{id:'cardinalfish',n:'CARDINALFISH',L:.07,sp:.08,salt:1,b:'shoal'},{id:'chromis',n:'CHROMIS',L:.07,sp:.14,salt:1,b:'shoal'},{id:'cleanerwrasse',n:'CLEANER WRASSE',L:.08,sp:.16,salt:1,b:'cruise'},
    {id:'foxface',n:'FOXFACE',L:.14,sp:.12,salt:1,b:'cruise'},{id:'shrimp',n:'SHRIMP',L:.05,sp:.04,salt:1,b:'bottom'},
    // the river's and the lake's own (owner, 13 Nov 2026), each as it lives: the trout holds its place in the current, the pike hangs still and strikes, the catfish and the sturgeon work the bottom, the eel keeps to the wood
    {id:'x_trout',n:'RAINBOW TROUT',L:.2,sp:.14,b:'station'},{id:'x_lbass',n:'LARGEMOUTH BASS',L:.22,sp:.1,b:'lurk'},{id:'x_bluegill',n:'BLUEGILL',L:.11,sp:.1,b:'shoal'},{id:'x_sunfish',n:'SUNFISH',L:.1,sp:.09,b:'hover'},{id:'x_yperch',n:'YELLOW PERCH',L:.13,sp:.12,b:'shoal'},{id:'x_perch',n:'WHITE PERCH',L:.13,sp:.12,b:'shoal'},
    {id:'x_shad',n:'AMERICAN SHAD',L:.16,sp:.16,b:'shoal'},{id:'dace',n:'DACE',L:.08,sp:.15,b:'shoal'},{id:'sockeye',n:'SOCKEYE SALMON',L:.24,sp:.15,b:'station'},{id:'x_carp',n:'CARP',L:.26,sp:.08,b:'forage'},{id:'x_catfish',n:'CHANNEL CATFISH',L:.28,sp:.07,b:'forage'},
    {id:'x_pike',n:'NORTHERN PIKE',L:.36,sp:.1,b:'lurk',pred:1},{id:'x_sturgeon',n:'STURGEON',L:.45,sp:.08,b:'forage'},{id:'x_eel',n:'AMERICAN EEL',L:.34,sp:.07,b:'den'},
    // the sea's, whatever their size, made small enough to turn in the glass: the shark never stops, the ray glides over the sand, the octopus keeps a den, the jellyfish pulses and drifts, the dolphin and the turtle come up for air
    {id:'shark',n:'GREAT WHITE SHARK',L:.6,sp:.2,salt:1,b:'patrol',pred:1},{id:'barracuda',n:'BARRACUDA',L:.42,sp:.16,salt:1,b:'lurk',pred:1},{id:'dolphin',n:'DOLPHIN',L:.55,sp:.24,salt:1,b:'surface'},{id:'seaturtle',n:'SEA TURTLE',L:.32,sp:.08,salt:1,b:'surface'},
    {id:'stingray',n:'STINGRAY',L:.4,sp:.1,salt:1,b:'glide'},{id:'octopus',n:'OCTOPUS',L:.26,sp:.09,salt:1,b:'den'},{id:'moray',n:'MORAY EEL',L:.42,sp:.07,salt:1,b:'den'},{id:'jellyfish',n:'JELLYFISH',L:.16,sp:.025,salt:1,b:'drift'},{id:'coelacanth',n:'COELACANTH',L:.42,sp:.06,salt:1,b:'hover'},{id:'plesiosaur',n:'PLESIOSAUR',L:.7,sp:.14,salt:1,b:'patrol',pred:1},
    {id:'x_bass',n:'STRIPED BASS',L:.26,sp:.15,salt:1,b:'cruise'},{id:'x_bluefish',n:'BLUEFISH',L:.2,sp:.18,salt:1,b:'shoal'},{id:'trevally',n:'TREVALLY',L:.2,sp:.18,salt:1,b:'shoal'},{id:'seabream',n:'SEA BREAM',L:.16,sp:.12,salt:1,b:'shoal'},{id:'goatfish',n:'GOATFISH',L:.13,sp:.08,salt:1,b:'forage'},{id:'wrasse',n:'WRASSE',L:.13,sp:.13,salt:1,b:'cruise'},
    {id:'knifejaw',n:'KNIFEJAW',L:.15,sp:.1,salt:1,b:'hover'},{id:'stripedpuffer',n:'STRIPED PUFFER',L:.12,sp:.07,salt:1,b:'hover'},{id:'x_flounder',n:'FLOUNDER',L:.2,sp:.07,salt:1,b:'glide'},{id:'x_tomcod',n:'TOMCOD',L:.13,sp:.1,salt:1,b:'forage'},{id:'x_crab',n:'BLUE CRAB',L:.1,sp:.05,salt:1,b:'bottom'}];
  const DECOR=[['sand','SAND'],['pebbles','ROCKS'],['driftwood','DRIFTWOOD'],['plants','PLANTS'],['castle','CASTLE'],['chest','CHEST'],['bubbler','BUBBLER']];
  // the tank itself (owner, 12 Nov 2026): its length (of the medium one, never past the room's wall), what it stands on, its rim; how many fish each length holds
  const SIZES={s:{n:'SMALL',k:.66,f:10},m:{n:'MEDIUM',k:1,f:16},l:{n:'LARGE',k:1.5,f:24},xl:{n:'SHOWPIECE',k:2,f:32}};
  const BASES={walnut:{n:'WALNUT',c:[70,46,32]},oak:{n:'OAK',c:[176,132,84]},black:{n:'BLACK',c:[26,26,30]},white:{n:'WHITE',c:[232,230,224]},stone:{n:'STONE',c:[140,138,132]},steel:{n:'STEEL FRAME',c:[58,60,66],frame:1}};
  const RIMS={black:{n:'BLACK',c:[24,24,26]},steel:{n:'STEEL',c:[170,174,180]},wood:{n:'WOOD',c:[96,62,40]},none:{n:'RIMLESS'}};
  const FSIZE={s:{n:'S',k:.72},m:{n:'M',k:1},l:{n:'L',k:1.35}}, FTINT={nat:'#ffffff',gold:'#ffd24a',red:'#ff6a5a',pink:'#ff9ad0',blue:'#6aa8ff',green:'#7fe08a',violet:'#b48aff',black:'#4a4a52'}, LIGHTB={low:{n:'LOW',k:.55},mid:{n:'NORMAL',k:1},high:{n:'BRIGHT',k:1.6}};
  // Polyfork's pieces (data/tankpf.json, tools/tank-pf-bake.py): [key, name, group, height in the tank (m), mossy]; each has its own place on the sand, tall ones at the back
  const PF=[['staghorn','STAGHORN','CORAL',.3],['pillar','PILLAR','CORAL',.36],['softtree','SOFT TREE','CORAL',.34],['seafan','SEA FAN','CORAL',.3],['tubesponge','TUBE SPONGE','CORAL',.26],['table','TABLE','CORAL',.18],['barrelsponge','BARREL SPONGE','CORAL',.2],['toadstool','TOADSTOOL','CORAL',.15],['torch','TORCH','CORAL',.14],['brain','BRAIN','CORAL',.11],
    ['clam','GIANT CLAM','REEF LIFE',.1],['anemone','ANEMONE','REEF LIFE',.1],['seagrass','SEAGRASS','REEF LIFE',.2],['urchin','URCHIN','REEF LIFE',.05],['starfish','STARFISH','REEF LIFE',.03],
    ['reefarch','REEF ARCH','ROCK',.42],['bommie','ROCK SPIRE','ROCK',.36],['rockarch','ROCK ARCH','ROCK',.28],['reefboulder','REEF BOULDER','ROCK',.26],['lavarock','LAVA ROCK','ROCK',.2],['liverock','LIVE ROCK','ROCK',.18],
    ['wreck','WRECKED HULL','SUNK',.46,1],['column','BROKEN COLUMN','SUNK',.4,1],['anchor','ANCHOR','SUNK',.38],['wheel',"SHIP'S WHEEL",'SUNK',.3],['dragonskull','DRAGON SKULL','SUNK',.26,1],['amphora','AMPHORA','SUNK',.22],['moai','FALLEN MOAI','SUNK',.2,1],['barrel','BARREL','SUNK',.2],
    ['hoard','OVERFLOWING CHEST','SUNK',.2],['pfchest','TREASURE CHEST','SUNK',.16],['skull','MOSSY SKULL','SUNK',.13,1],['coins','GOLD COINS','SUNK',.03]];
  const PFD=__LAZY__("data/tankpf.json"), ALLD=()=>DECOR.map(d=>d[0]).concat(PF.map(p=>p[0]));
  const LIGHTC={white:'#f2f7ff',warm:'#ffd9a0',blue:'#7fb6ff',pink:'#ff8fd0',green:'#9cffb0',uv:'#9a6bff'};
  const DEF={w:'fresh',d:['sand','pebbles','driftwood','plants'],f:{pfkoi:5,goldfish:6},l:{on:1,c:'white',b:'mid'},sz:'m',base:'walnut',rim:'black',fz:{},fc:{}};
  // a layout's tank as it may be read (another player's layout too): only known choices, at most MAXF fish
  const clean=s=>{ s=s&&typeof s==='object'?s:{}; const o={w:WATER[s.w]?s.w:DEF.w,d:Array.isArray(s.d)?ALLD().filter(k=>s.d.includes(k)):DEF.d.slice(),f:{},l:{on:s.l&&s.l.on===0?0:1,c:s.l&&LIGHTC[s.l.c]?s.l.c:'white',b:s.l&&LIGHTB[s.l.b]?s.l.b:'mid'},sz:SIZES[s.sz]?s.sz:'m',base:BASES[s.base]?s.base:'walnut',rim:RIMS[s.rim]?s.rim:'black',fz:{},fc:{}}, MAXF=SIZES[o.sz].f;
    let n=0; for(const k of KIND){ const c=Math.max(0,Math.min(8,Math.round(+((s.f||DEF.f)[k.id])||0))); if(c&&n+c<=MAXF){ o.f[k.id]=c; n+=c; const z=s.fz&&s.fz[k.id], t=s.fc&&s.fc[k.id]; if(FSIZE[z]&&z!=='m')o.fz[k.id]=z; if(FTINT[t]&&t!=='nat')o.fc[k.id]=t; } } return o; };
  const TANKS=[]; window.TANKDBG=()=>TANKS.map(T=>({fish:T.fish.length,ways:[...new Set(T.fish.map(f=>f.b))],koiL:Math.max(0,...T.fish.filter(f=>f.kind==='pfkoi').map(f=>f.L)),vis:T.g.visible,pos:[+T.g.position.x.toFixed(2),+T.g.position.z.toFixed(2)],at:T.tg.localToWorld(new THREE.Vector3(0,T.SH+T.TH/2,0)).toArray().map(v=>+v.toFixed(2)),front:T.tg.localToWorld(new THREE.Vector3(0,T.SH+T.TH/2,-1)).toArray().map(v=>+v.toFixed(2)),fed:+(T.fed||0).toFixed(1),y:T.fish.length?+(T.fish.reduce((a,f)=>a+f.y,0)/T.fish.length).toFixed(3):0,
    kinds:T.sch?Object.keys(T.sch).filter(k=>T.sch[k].im.count):[],wave:+(T.h.reduce((a,v)=>Math.max(a,Math.abs(v)),0)*1000).toFixed(4),sy:+T.surf.geometry.attributes.position.getY(NX*(NZ>>1)+(NX>>1)).toFixed(5),steps:T.steps,set:T.s,pf:Object.keys(T.pf||{}),view:!!(V&&V.T===T),look:V&&V.T===T?[V.yaw,V.pit,V.zoom].map(v=>+v.toFixed(3)):null,cam:SHARED.cam?[...SHARED.cam.position.toArray(),...SHARED.cam.getWorldDirection(new THREE.Vector3()).toArray()].map(v=>+v.toFixed(2)):null,size:[T.TW,T.TD,T.TH],f0:T.fish[0]?[T.fish[0].id,+T.fish[0].x.toFixed(3),+T.fish[0].y.toFixed(3),+T.fish[0].z.toFixed(3)]:null}));
  for(const k of ['FISH TANK'])ROOMK.always.add(k);   // in every apartment from the start (owner, 7 Nov 2026)
  ROOMK.parts.push(c=>{ '@apts'; const {part,mat,rbox,cap,Lx,Ly,du,solid}=c;
    // along the back wall between the back door and the corner, where no window is (owner, 12 Nov 2026: half as long)
    const TW0=Math.max(1.2,Math.min(1.8,(Lx-du-2.4)/2)), TMAX=Math.max(TW0,Lx-du-2.4), TD=1, TH=1.2, SH=.7, U0=du+.95+TW0/2, V0=Ly-TD/2-.13, SD=TD-2*GL, WY=SH+TH*.9, len=s=>Math.max(1,Math.min(TMAX,TW0*SIZES[s.sz].k));
    const FX=TANKFX.kit||(TANKFX.kit=TANKFX.make()), sandY=FX.sandY(SH,SD);   // the sand's top, banked up toward the back
    // everything in the tank's own group, built for a length, a stand and a rim (built again when one of them changes)
    const fill=(tg,TW,s,U)=>{ const SW=TW-2*GL, T0={}, P=(geo,m,x,y,z,ry=0,cast=true)=>part(geo,m,x,y,z,ry,tg,cast), IN=(gm,ro,y=0)=>{ const m=P(gm[0],gm[1],0,y,0,0,false); m.receiveShadow=false; m.userData.noMerge=true;   // its own draw: merged with the room (161c) it would lose the water's light
        if(ro){ m.renderOrder=ro; m.userData.soft=true; } return m; };
      U.uWD.value.set(SW,SD); U.uB0.value.set(-SW/2,SH+.02,-SD/2); U.uB1.value.set(SW/2,WY,SD/2); U.uTop.value=WY-.006; U.uBar.value.set(TW/2-.08,SH+TH+.04,TD/2-.1);
      const V3=THREE.Vector3, ONE=new V3(1,1,1);
      // a few parts in their own colours as one mesh (one draw): [geometry, rgb, x,y,z, rx,ry,rz]
      const merge=list=>{ let n=0; const G=list.map(([q,col,x,y,z,rx=0,ry=0,rz=0])=>{ const a=q.index?q.toNonIndexed():q; a.applyMatrix4(new THREE.Matrix4().compose(new V3(x,y,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(rx,ry,rz)),ONE)); a.computeVertexNormals(); n+=a.attributes.position.count; return [a,col]; });
        const Pp=new Float32Array(n*3), N=new Float32Array(n*3), C=new Float32Array(n*3), cc=new THREE.Color(); let o=0;
        for(const [a,col] of G){ const k=a.attributes.position.count; Pp.set(a.attributes.position.array,o*3); N.set(a.attributes.normal.array,o*3); cc.setRGB(col[0]/255,col[1]/255,col[2]/255,THREE.SRGBColorSpace); for(let i=0;i<k;i++){ C[(o+i)*3]=cc.r; C[(o+i)*3+1]=cc.g; C[(o+i)*3+2]=cc.b; } o+=k; }
        const bg=new THREE.BufferGeometry(); bg.setAttribute('position',new THREE.BufferAttribute(Pp,3)); bg.setAttribute('normal',new THREE.BufferAttribute(N,3)); bg.setAttribute('color',new THREE.BufferAttribute(C,3)); return bg; };
      const vc=(o={})=>new THREE.MeshStandardMaterial({vertexColors:true,roughness:.85,flatShading:true,...o});
      const wv=(o,w)=>FX.wet(vc(o),U,{grain:2,...w});
      const B=(w,h,d)=>new THREE.BoxGeometry(w,h,d), BS=BASES[s.base], rimC=RIMS[s.rim].c, RL=[[B(TW-.1,.035,.14),[40,40,44],0,SH+TH+.06,TD/2-.1]];
      if(BS.frame){ const L=[[B(TW+.08,.05,TD+.08),BS.c,0,SH-.025,0],[B(TW+.04,.03,TD+.04),BS.c,0,.16,0]]; for(const sx of [-1,1])for(const sz of [-1,1])L.push([B(.05,SH-.05,.05),BS.c,sx*(TW/2+.015),(SH-.05)/2,sz*(TD/2+.015)]); P(merge(L),vc({flatShading:false,roughness:.45,metalness:.5}),0,0,0); }
      else { P(rbox(TW+.08,SH,TD+.08,.02),mat(BS.c),0,SH/2,0); P(merge([[B(TW*.48,SH-.14,.012),BS.c.map(v=>v*.86),-TW*.245,SH/2,-TD/2-.045],[B(TW*.48,SH-.14,.012),BS.c.map(v=>v*.86),TW*.245,SH/2,-TD/2-.045],[B(.02,.12,.02),[190,170,120],-.03,SH/2,-TD/2-.06],[B(.02,.12,.02),[190,170,120],.03,SH/2,-TD/2-.06]]),vc({flatShading:false,roughness:.6}),0,0,0); }
      if(rimC)RL.push([B(TW+.03,.04,.03),rimC,0,SH+TH+.02,-TD/2],[B(TW+.03,.04,.03),rimC,0,SH+TH+.02,TD/2],[B(.03,.04,TD),rimC,-TW/2,SH+TH+.02,0],[B(.03,.04,TD),rimC,TW/2,SH+TH+.02,0],[B(TW+.03,.03,.03),rimC,0,SH+.015,-TD/2],[B(TW+.03,.03,.03),rimC,0,SH+.015,TD/2]);
      for(const sx of [-1,1])for(const sz of [-1,1])RL.push([B(.012,TH-.03,.012),[30,32,34],sx*(TW/2-GL-.004),SH+TH/2,sz*(TD/2-GL-.004)]);   // the silicone in the corners
      P(merge(RL),vc({flatShading:false,roughness:.5}),0,0,0);
      const bar=new THREE.MeshBasicMaterial({color:0xffffff,toneMapped:false}); P(B(TW-.16,.006,.08),bar,0,SH+TH+.04,TD/2-.1,0,false);
      // the kit every tank has: a dark backing on the back glass, the filter's intake and return in one back corner, the heater and a thermometer in the other; the side panes mirror the water from inside
      { const blk=[18,20,24], Cy=(r,l)=>new THREE.CylinderGeometry(r,r,l,8), pl=(w,h,ry,x,y,z)=>{ const g=new THREE.PlaneGeometry(w,h); g.rotateY(ry); g.translate(x,y,z); return g; };
        IN([merge([[Cy(.012,TH*.7),blk,-SW/2+.06,SH+TH*.55,SD/2-.05],[B(.05,.07,.05),blk,-SW/2+.06,SH+TH*.2,SD/2-.05],[Cy(.01,.3),blk,-SW/2+.2,WY+.03,SD/2-.05,0,0,Math.PI/2],
          [Cy(.014,.26),[190,210,215],SW/2-.06,SH+TH*.5,SD/2-.05],[Cy(.015,.04),[230,120,40],SW/2-.06,SH+TH*.5-.15,SD/2-.05],[B(.012,.14,.004),[235,235,225],SW/2-.14,SH+TH*.6,SD/2-.012]]),wv({flatShading:false,roughness:.6},{grain:0})]);
        IN([pl(SW,TH-.01,Math.PI,0,SH+TH/2,SD/2-.004),FX.wet(new THREE.MeshStandardMaterial({color:0x060b12,roughness:1}),U,{far:.3})]);
        const lm=FX.wet(new THREE.MeshStandardMaterial({color:0x04080c,roughness:1}),U,{far:1.5}); IN([pl(SD,WY-SH,Math.PI/2,-SW/2+.002,(WY+SH)/2,0),lm]); IN([pl(SD,WY-SH,-Math.PI/2,SW/2-.002,(WY+SH)/2,0),lm]); }
      // the sand, the stones, the wood and the plants (150ja): lit by the tank's own light, the surface's caustics moving over all of it
      const SG=FX.sand(SW,SD,SH,sandY,U,WATER.fresh.sand), sand=SG[1]; IN(SG,0,SH+.04);
      const D={}, rnd=(i,k)=>hs(i,k), BD=FX.bed(SW,SD,SH,WY,sandY,U); D.pebbles=IN(BD.pebbles); D.driftwood=IN(BD.driftwood); D.plants=IN(BD.plants); T0.leaf=BD.plants[1]; T0.anch=BD.anch;
      { const st=[150,150,156], st2=[118,118,126], dk=[26,24,30], x0=SW*.3, z0=SD*.18, y0=sandY(x0,z0)-.01, L=[[new THREE.CylinderGeometry(.11,.12,.42,8),st,x0,y0+.21,z0],[B(.36,.22,.16),st2,x0-.2,y0+.11,z0+.02],[B(.12,.14,.02),dk,x0-.2,y0+.07,z0-.07],[new THREE.CylinderGeometry(.06,.07,.3,8),st,x0-.4,y0+.15,z0+.03],[new THREE.ConeGeometry(.13,.14,8),[120,64,60],x0,y0+.49,z0],[new THREE.ConeGeometry(.075,.1,8),[120,64,60],x0-.4,y0+.35,z0+.03]];
        for(let i=0;i<5;i++)L.push([B(.05,.05,.17),st2,x0-.34+i*.07,y0+.245,z0+.02]); L.push([B(.05,.09,.02),dk,x0,y0+.3,z0-.11]);
        D.castle=IN([merge(L),wv()]); }
      { const x0=-SW*.38, z0=-SD*.05, y0=sandY(x0,z0)-.01, wood=[104,62,34], gold=[214,170,60];
        D.chest=IN([merge([[B(.26,.14,.16),wood,x0,y0+.07,z0,0,.3,0],[B(.27,.025,.17),gold,x0,y0+.11,z0,0,.3,0],[B(.03,.145,.165),gold,x0,y0+.072,z0,0,.3,0],[new THREE.CylinderGeometry(.05,.05,.02,10),gold,x0+.02,y0+.15,z0,0,0,0]]),wv({flatShading:false,roughness:.6,metalness:.2})]);
        const lid=new THREE.Group(); lid.rotation.order='YXZ'; lid.position.set(x0+Math.sin(.3)*.08,y0+.14,z0+Math.cos(.3)*.08); lid.rotation.y=.3; D.chest.add(lid);
        const lm=new THREE.Mesh(merge([[new THREE.CylinderGeometry(.08,.08,.26,10,1,false,0,Math.PI),wood,0,0,-.08,0,0,Math.PI/2],[B(.27,.02,.02),gold,0,.0,-.155]]),D.chest.material); lm.userData.noMerge=true; lid.add(lm); T0.lid=lid; T0.chestAt=[x0,y0+.18,z0]; }
      { const x0=SW*.44, z0=SD*.3, y0=sandY(x0,z0); D.bubbler=IN([merge([[new THREE.CylinderGeometry(.03,.035,.03,8),[50,52,60],x0,y0+.01,z0],[new THREE.CylinderGeometry(.004,.004,WY-y0,4),[200,230,230],x0+.03,(WY+y0)/2,z0+.03]]),wv()]); T0.bubAt=[x0,y0+.03,z0]; }
      // the water: shafts of light and motes through its depth, its open top a live surface (a wave sim: ripples from fish, food, bubbles and the filter), the glass round it, the light it throws on the floor
      IN(FX.rays(SW,SD,SH,WY,U),2); const surf=IN(FX.surface(SW,SD,WY,U),3,WY);
      { const gg=merge([[B(TW,TH,GL),[255,255,255],0,SH+TH/2,-TD/2+GL/2],[B(TW,TH,GL),[255,255,255],0,SH+TH/2,TD/2-GL/2],[B(GL,TH,TD),[255,255,255],-TW/2+GL/2,SH+TH/2,0],[B(GL,TH,TD),[255,255,255],TW/2-GL/2,SH+TH/2,0]]); gg.deleteAttribute('color'); IN(FX.glass(gg,U),4); }
      IN(FX.spill(TW,TD,U),1,.012);
      // the bubbles and the food: small instanced spheres
      const bub=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,1),FX.bubble(U),72); bub.count=0; bub.frustumCulled=false; bub.instanceMatrix.setUsage(THREE.DynamicDrawUsage); tg.add(bub); bub.renderOrder=3;
      const food=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,0),new THREE.MeshStandardMaterial({color:0xa0602a,roughness:.9}),16); food.count=0; food.frustumCulled=false; food.instanceMatrix.setUsage(THREE.DynamicDrawUsage); tg.add(food);
      // the live surface: a height for every point of a 96 x 56 grid, stepped 60 times a second; its curvature is the light it focuses onto the sand
      const ftx=new THREE.DataTexture(new Uint8Array(NX*NZ*4).fill(128),NX,NZ); ftx.magFilter=ftx.minFilter=THREE.LinearFilter; ftx.needsUpdate=true; U.uF.value=ftx;
      return {TW,SW,D,surf,sand,bar,bub,food,ftx,leaf:T0.leaf,lid:T0.lid,chestAt:T0.chestAt,bubAt:T0.bubAt,anch:T0.anch,pf:{},pfM:FX.wet(new THREE.MeshStandardMaterial({vertexColors:true,roughness:.85,flatShading:true}),U,{grain:2})}; };
    cap('FISH TANK',g=>{ const tg=new THREE.Group(); tg.position.set(U0,0,V0); g.add(tg); const s=clean(DEF), TW=len(s), U=FX.uniforms();
      const T={g,tg,TD,TH,SH,SD,WY,sandY,fill,len,h:new Float32Array(NX*NZ),p:new Float32Array(NX*NZ),acc:0,E:0,steps:0,fish:[],sch:{},shoal:{},bubs:[],pel:[],t:Math.random()*100,s,chestT:6,U}; Object.assign(T,fill(tg,TW,s,U)); TANKS.push(T); apply(T,T.s);
      solid(U0-TW/2-.04,V0-TD/2-.04,U0+TW/2+.04,V0+TD/2+.04,SH+TH+.06);
      FISHES.load().then(()=>{ T.ready=true; school(T); }).catch(()=>{});
    },{id:'fishtank',wire:'tank'}); });

  /* ---------- the settings: water, decor, fish, light ---------- */
  // a new length, stand or rim: the tank's own group built again where it stands, its fish kept, its footprint with it
  const refill=T=>{ for(const k in T.sch)T.tg.remove(T.sch[k].im); for(const ch of [...T.tg.children]){ T.tg.remove(ch); ch.traverse(o=>{ if(o.geometry)o.geometry.dispose(); }); }
    Object.assign(T,T.fill(T.tg,T.len(T.s),T.s,T.U)); for(const k in T.sch)T.tg.add(T.sch[k].im); T.h.fill(0); T.p.fill(0); T.bubs.length=0; T.pel.length=0;
    for(const f of T.fish){ f.x=Math.max(-T.SW/2+.1,Math.min(T.SW/2-.1,f.x)); f.t=0; }
    const un=T.un, A=ROOMK.api; if(un&&un.sol&&un.sol[0]){ const x=T.tg.position.x, z=T.tg.position.z; un.sol[0]=[x-T.TW/2-.04,z-T.TD/2-.04,x+T.TW/2+.04,z+T.TD/2+.04,un.sol[0][4]]; if(A&&A.setT&&A.getT&&!un.gone)A.setT(un,A.getT(un)); } };
  // a Polyfork piece: its baked shape (moss on what has lain long: the faces that look up go green), sized to its height in the tank, on its own place on the sand
  const pfGeo={}, pfMake=(D,k,moss)=>{ if(pfGeo[k])return pfGeo[k]; const d=D[k]; if(!d)return null; const bin=atob(d.p), q=new Int16Array(Uint8Array.from(bin,c=>c.charCodeAt(0)).buffer), cl=Uint8Array.from(atob(d.c),c=>c.charCodeAt(0)), ib=Uint8Array.from(atob(d.i),c=>c.charCodeAt(0)), n=d.n, Pp=new Float32Array(n*3), cc=new THREE.Color();
    for(let i=0;i<n*3;i++)Pp[i]=(q[i]+32500)*d.sc+d.lo[i%3]; let g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(Pp,3)); const Cu=new Float32Array(n*3); for(let i=0;i<n*3;i+=3){ cc.setRGB(cl[i]/255,cl[i+1]/255,cl[i+2]/255,THREE.SRGBColorSpace); Cu[i]=cc.r; Cu[i+1]=cc.g; Cu[i+2]=cc.b; }
    g.setAttribute('color',new THREE.BufferAttribute(Cu,3)); g.setIndex(new THREE.BufferAttribute(d.i32?new Uint32Array(ib.buffer):new Uint16Array(ib.buffer),1)); g=g.toNonIndexed(); g.computeVertexNormals(); g.computeBoundingBox(); const b=g.boundingBox; g.translate(-(b.min.x+b.max.x)/2,-b.min.y,-(b.min.z+b.max.z)/2); g.computeBoundingBox();
    if(moss){ const N=g.attributes.normal, C=g.attributes.color, Y=g.attributes.position, H=g.boundingBox.max.y||1; for(let i=0;i<N.count;i++){ const m=Math.max(0,Math.min(1,(N.getY(i)-.25)*1.6))*(.55+.45*hs(i/3|0,7))*(.5+.5*Y.getY(i)/H); C.setXYZ(i,C.getX(i)*(1-m)+.05*m,C.getY(i)*(1-m)+.2*m,C.getZ(i)*(1-m)+.07*m); } }
    return pfGeo[k]=g; };
  const pfShow=T=>{ const want=PF.filter(p=>T.s.d.includes(p[0])); for(const k in T.pf)T.pf[k].visible=T.s.d.includes(k); if(!want.some(p=>!T.pf[p[0]]))return; const pf=T.pf;
    PFD().then(D=>{ if(T.pf!==pf)return; for(const p of want){ const [k,,grp,h,moss]=p; if(pf[k])continue; const g=pfMake(D,k,moss); if(!g)continue; const i=PF.indexOf(p), B=g.boundingBox.max, RW=q=>q[3]>=.3?2:q[3]>=.16?1:0, row=RW(p), col=PF.filter((q,j)=>j<i&&RW(q)===row).length, nrow=PF.filter(q=>RW(q)===row).length;
        const x=(col+.5)/nrow*(T.SW-.24)-(T.SW-.24)/2+(hs(i,41)-.5)*.06, z=[-.3,.02,.3][row]*T.SD+(hs(i,42)-.5)*.1, sc=Math.min(h/B.y,.5/(B.x*2),.36/(B.z*2)), m=new THREE.Mesh(g,T.pfM); m.position.set(x,T.sandY(x,z)-.012,z); m.rotation.y=(hs(i,43)-.5)*1.2; m.scale.setScalar(sc); m.userData.keep=1; m.userData.noMerge=true; T.tg.add(m); pf[k]=m; m.visible=T.s.d.includes(k); } }).catch(()=>{}); };
  const apply=(T,s)=>{ const o=T.s; T.s=clean(s); if(T.fill&&o&&(o.sz!==T.s.sz||o.base!==T.s.base||o.rim!==T.s.rim))refill(T); const W=WATER[T.s.w], L=new THREE.Color(LIGHTC[T.s.l.c]), on=T.s.l.on, LB=LIGHTB[T.s.l.b].k;
    T.U.uWC.value.setRGB(...W.at); T.U.uFog.value=.55/W.ad; T.U.uAb.value.set(1-W.at[0],1-W.at[1],1-W.at[2]).multiplyScalar(.9/Math.max(.6,W.ad));   // the water's own colour, how far you see through it, what it takes from the light with depth
    T.sand.color.setRGB(...(T.s.d.includes('sand')?W.sand:[.14,.14,.16])); T.U.uL.value.copy(L); T.U.uK.value=on?(W.glow?1.6:1)*LB:0;
    T.bar.color.copy(on?L:new THREE.Color(.05,.05,.06)); T.leaf.emissive.setHex(W.glow&&on?0x146a34:0);
    for(const [k] of DECOR)if(T.D[k])T.D[k].visible=T.s.d.includes(k); pfShow(T); if(T.ready)school(T); };
  // the fish: one instanced school a kind (the shared swim of 141f), those that fit the water and your sea pets from the aquarium
  const fits=(k,W)=>!!k.salt===!!W.salt;
  // each fish its own way of swimming (owner, 10 Nov 2026): its kind's habit (cruising the length, shoaling, keeping by the wood or a stone, working the sand), its own pace, depth, laziness and place
  const BAND={cruise:[.35,.8],shoal:[.45,.85],hover:[.2,.6],bottom:[0,.1],wander:[.15,.85],patrol:[.4,.75],glide:[0,.1],drift:[.3,.9],den:[0,.06],surface:[.45,.8],lurk:[.08,.4],forage:[0,.12],station:[.3,.7]};
  const soul=(T,f,w)=>{ f.kind=w.kind; f.pred=w.pred; if(f.b===w.b)return; f.b=w.b; const R=Math.random, B=BAND[f.b]||BAND.wander, a=T.anch[Math.floor(R()*T.anch.length)]; f.k=.75+R()*.5; f.lazy=R()*.45; f.d0=B[0]+R()*(B[1]-B[0])*.4; f.d1=f.d0+(B[1]-f.d0)*(.5+R()*.5); f.dir=R()<.5?1:-1; f.ax=a[0]+(R()-.5)*.2; f.az=a[1]+(R()-.5)*.1; f.rest=0; f.dart=0; };
  const pick=(T,f,x0,x1,z0,z1,yb,yt)=>{ const R=Math.random, cl=(v,a,b)=>Math.max(a,Math.min(b,v)), yy=()=>yb+(yt-yb)*(f.d0+(f.d1-f.d0)*R()); f.rest=R()<f.lazy?1+R()*3:0;
    if(f.b==='cruise'&&R()<.8){ f.dir=-f.dir; f.tx=f.dir>0?x1-R()*(x1-x0)*.12:x0+R()*(x1-x0)*.12; f.tz=z0+(z1-z0)*(.25+.5*R()); f.ty=yy(); f.t=8+R()*8; }
    else if(f.b==='shoal'){ const S=T.shoal[f.kind]||(T.shoal[f.kind]={t:0,x:0,z:0,y:.5}); if(T.t>S.t){ S.t=T.t+4+R()*6; S.x=x0+R()*(x1-x0); S.z=z0+R()*(z1-z0); S.y=R(); } const r=.1+f.L; f.tx=cl(S.x+(R()-.5)*r*3,x0,x1); f.tz=cl(S.z+(R()-.5)*r*2,z0,z1); f.ty=yb+(yt-yb)*(f.d0+(f.d1-f.d0)*S.y)+(R()-.5)*r; f.t=1+R()*2; f.rest=0; }
    else if(f.b==='hover'&&R()<.85){ f.tx=cl(f.ax+(R()-.5)*.3,x0,x1); f.tz=cl(f.az+(R()-.5)*.24,z0,z1); f.ty=yy(); f.t=2+R()*5; }
    else if(f.b==='bottom'){ const d=.15+R()*.5, a=R()*6.28; f.tx=cl(f.x+Math.cos(a)*d,x0,x1); f.tz=cl(f.z+Math.sin(a)*d,z0,z1); f.ty=yb; f.t=2+R()*4; f.rest=R()<.6?1+R()*4:0; }
    else if(f.b==='patrol'){ f.lap=((f.lap||0)+f.dir+4)%4; const c=[[.1,.2],[.9,.2],[.9,.8],[.1,.8]][f.lap]; f.tx=x0+(x1-x0)*(c[0]+(R()-.5)*.1); f.tz=z0+(z1-z0)*(c[1]+(R()-.5)*.2); f.ty=yy(); f.t=30; f.rest=0; if(R()<.08)f.dir=-f.dir; }   // round and round, never still
    else if(f.b==='glide'){ const d=.4+R()*.9, a=R()*6.28; f.tx=cl(f.x+Math.cos(a)*d,x0,x1); f.tz=cl(f.z+Math.sin(a)*d,z0,z1); f.ty=R()<.2?yb+(yt-yb)*.3:yb; f.t=5+R()*6; f.rest=R()<.3?2+R()*5:0; }   // low over the sand, now and then a rise; sometimes it settles
    else if(f.b==='drift'){ f.tx=cl(f.x+(R()-.5)*.4,x0,x1); f.tz=cl(f.z+(R()-.5)*.3,z0,z1); f.ty=yy(); f.t=5+R()*6; f.rest=0; }
    else if(f.b==='den'){ if(R()<.3){ const a=T.anch[Math.floor(R()*T.anch.length)]; f.ax=a[0]+(R()-.5)*.16; f.az=a[1]+(R()-.5)*.1; f.dart=.7; f.rest=0; } else f.rest=4+R()*10; f.tx=cl(f.ax+(R()-.5)*.08,x0,x1); f.tz=cl(f.az+(R()-.5)*.06,z0,z1); f.ty=yb; f.t=6+R()*8; }   // home in a hollow by the stones or the wood; a quick move to another now and then
    else if(f.b==='surface'){ f.n=(f.n||0)+1; f.dir=-f.dir; f.tx=f.dir>0?x1-R()*(x1-x0)*.15:x0+R()*(x1-x0)*.15; f.tz=z0+(z1-z0)*(.25+.5*R()); f.ty=f.n%4===0?yt:yy(); f.t=8+R()*6; f.rest=0; }   // up for air every few lengths
    else if(f.b==='lurk'){ if(R()<.18){ f.tx=x0+R()*(x1-x0); f.tz=z0+R()*(z1-z0); f.ty=yy(); f.dart=.6; f.rest=0; f.t=2+R()*2; } else { f.tx=cl(f.ax+(R()-.5)*.2,x0,x1); f.tz=cl(f.az+(R()-.5)*.14,z0,z1); f.ty=yy(); f.t=3+R()*4; f.rest=3+R()*7; } }   // hanging still by cover, then a strike
    else if(f.b==='forage'){ f.tx=x0+R()*(x1-x0); f.tz=z0+R()*(z1-z0); f.ty=yb; f.t=6+R()*8; f.rest=R()<.35?1+R()*3:0; }
    else if(f.b==='station'){ if(f.sx==null||R()<.1){ f.sx=x0+(x1-x0)*(.15+R()*.6); f.sz=z0+(z1-z0)*(.2+R()*.6); f.sy=R(); } f.tx=cl(f.sx-.1-R()*.1,x0,x1); f.tz=cl(f.sz+(R()-.5)*.08,z0,z1); f.ty=yb+(yt-yb)*(f.d0+(f.d1-f.d0)*f.sy); f.t=1.5+R()*2.5; f.rest=0; }   // nose into the filter's current, holding its place
    else { f.t=3+R()*6; f.tx=x0+R()*(x1-x0); f.tz=z0+R()*(z1-z0); f.ty=yy(); } };
  const TINTS={}, TINT=c=>TINTS[c||'#ffffff']||(TINTS[c||'#ffffff']=new THREE.Color(c||'#ffffff'));
  const school=T=>{ if(!FISHES.school)return; const W=WATER[T.s.w], want=[];
    for(const k of KIND)if(fits(k,W))for(let i=0;i<(T.s.f[k.id]||0);i++)want.push({id:k.var&&FISHES.ids.includes(k.var[i%k.var.length])?k.var[i%k.var.length]:k.id,kind:k.id,b:k.b||'wander',pred:k.pred,L:Math.min(1,T.SW*.38/k.L)*k.L*(.82+hs(i,k.id.length)*.36)*FSIZE[T.s.fz[k.id]||'m'].k,sp:k.sp,c:FTINT[T.s.fc[k.id]||'nat']});
    const g0=FISHES.len('goldfish',1)||1; for(const r of (PETS.sea?PETS.sea():[]).slice(0,24)){ const L0=FISHES.len(r.k,1); if(L0)want.push({id:r.k,kind:r.k,b:'wander',L:Math.min(.3,Math.max(.06,.1*Math.sqrt(L0/g0))),sp:.08,pet:1}); }
    const old=T.fish, out=[]; for(const w of want){ if(!T.sch[w.id]){ const im=FISHES.school(w.id,CAPS); if(!im)continue; { const m0=im.material, m=m0.clone(); m.onBeforeCompile=m0.onBeforeCompile; m.customProgramCacheKey=m0.customProgramCacheKey; im.material=TANKFX.kit.wet(m,T.U,{gain:.45}); } T.tg.add(im); T.sch[w.id]={im,n:0}; }
      const j=old.findIndex(f=>f.id===w.id); let f; if(j>=0){ f=old.splice(j,1)[0]; f.L=w.L; f.sp=w.sp; soul(T,f,w); f.c=TINT(w.c); } else { const i=out.length; f={id:w.id,L:w.L,sp:w.sp,v:w.sp*.7,x:(hs(i,21)-.5)*T.SW*.7,z:(hs(i,22)-.5)*T.SD*.5,y:T.SH+.3+hs(i,23)*(T.WY-T.SH-.45),h:hs(i,24)*6.28,tx:0,ty:0,tz:0,t:0,ph:hs(i,25)*6.28,pt:0}; f.tx=f.x; f.ty=f.y; f.tz=f.z; soul(T,f,w); f.c=TINT(w.c); }
      if(T.sch[w.id].n++<CAPS)out.push(f); }
    for(const k in T.sch)T.sch[k].n=0; T.fish=out; };

  /* ---------- the water's physics: a height field (the wave equation, damped, walls reflecting) ---------- */
  const poke=(T,x,z,a,r)=>{ const dx=T.SW/(NX-1), dz=T.SD/(NZ-1), cx=(x+T.SW/2)/dx, cz=(z+T.SD/2)/dz, R=Math.ceil(r/dx)+1;
    for(let j=Math.max(0,Math.floor(cz-R));j<=Math.min(NZ-1,Math.ceil(cz+R));j++)for(let i=Math.max(0,Math.floor(cx-R));i<=Math.min(NX-1,Math.ceil(cx+R));i++){ const d2=((i-cx)*dx)**2+((j-cz)*dz)**2; if(d2<r*r*4)T.h[j*NX+i]-=a*Math.exp(-d2/(r*r)); } };
  // ripples travel at one speed whichever way they go (.5 m/s), whatever the tank's length; 60 steps a second
  const step=T=>{ const h=T.h, p=T.p, Dm=.994, a=(.5/60*(NX-1)/T.SW)**2, b=(.5/60*(NZ-1)/T.SD)**2, q=Math.min(1,.46/(a+b)), Cx=a*q, Cz=b*q; let E=0;
    for(let j=0;j<NZ;j++)for(let i=0;i<NX;i++){ const k=j*NX+i, c=h[k], l=h[i?k-1:k], r=h[i<NX-1?k+1:k], u=h[j?k-NX:k], d=h[j<NZ-1?k+NX:k]; p[k]=(2*c-p[k]+Cx*(l+r-2*c)+Cz*(u+d-2*c))*Dm; E+=Math.abs(p[k]); }
    T.h=p; T.p=h; T.E=E/(NX*NZ); T.steps++; };
  const shape=T=>{ const h=T.h, g=T.surf.geometry, P=g.attributes.position, N=g.attributes.normal, dx=T.SW/(NX-1), dz=T.SD/(NZ-1), F=T.ftx.image.data;
    for(let j=0;j<NZ;j++)for(let i=0;i<NX;i++){ const k=j*NX+i, l=h[i?k-1:k], r=h[i<NX-1?k+1:k], u=h[j?k-NX:k], d=h[j<NZ-1?k+NX:k], sx=(r-l)/(2*dx), sz=(d-u)/(2*dz), n=1/Math.hypot(sx,1,sz);
      P.setY(k,h[k]); N.setXYZ(k,-sx*n,n,-sz*n); F[k*4]=Math.max(0,Math.min(255,128-(l+r+u+d-4*h[k])*26000)); }
    P.needsUpdate=N.needsUpdate=true; T.ftx.needsUpdate=true; };

  /* ---------- each frame: the fish swim, the bubbles rise, the food falls, the surface moves ---------- */
  const Mx=new THREE.Matrix4(), Q=new THREE.Quaternion(), E3=new THREE.Euler(0,0,0,'XYZ'), Pv=new THREE.Vector3(), Sv=new THREE.Vector3();
  const tick=(T,dt)=>{ T.t+=dt; T.U.uT.value=T.t; T.U.uE.value=Math.min(1,T.E*400); const W2=T.SW/2, D2=T.SD/2, on=k=>T.s.d.includes(k);
    const up=T.fed>0?Math.min(1,T.fed/3,(30-T.fed)/.6):0; if(T.fed>0)T.fed-=dt;   // fed: they swim to the top and quicker, then settle back
    // the filter's return stirs one corner a little, always
    if(Math.random()<dt*14)poke(T,-W2+.1+Math.random()*.22,D2-.1,.0011,.035); if(Math.random()<dt*5)poke(T,(Math.random()-.5)*T.SW*.9,(Math.random()-.5)*T.SD*.9,.00035,.05);
    if(T.bubs.length<60&&Math.random()<dt*7)T.bubs.push({x:-W2+.1+Math.random()*.2,y:T.WY-.03-Math.random()*.12,z:D2-.1+(Math.random()-.5)*.04,r:.0015+Math.random()*.002,ph:Math.random()*6});   // the fine bubbles the return carries under
    { const U=T.U, c=SHARED.cam; T.tg.updateWorldMatrix(true,false); U.uTI.value.copy(T.tg.matrixWorld).invert(); if(c)U.uCam.value.setFromMatrixPosition(c.matrixWorld).applyMatrix4(U.uTI.value); }
    // bubbles: a stream from the bubbler, a burst when the chest's lid lifts; each breaks the surface where it reaches it
    if(on('bubbler')&&T.bubs.length<56&&Math.random()<dt*14){ const b=T.bubAt; T.bubs.push({x:b[0]+(Math.random()-.5)*.02,y:b[1],z:b[2]+(Math.random()-.5)*.02,r:.004+Math.random()*.008,ph:Math.random()*6}); }
    if(T.lid){ T.chestT-=dt; const o=T.chestT<0&&T.chestT>-2.5; T.lid.rotation.x+=((o&&on('chest')?.9:0)-T.lid.rotation.x)*Math.min(1,dt*3); if(o&&on('chest')&&T.bubs.length<46&&Math.random()<dt*10){ const c=T.chestAt; T.bubs.push({x:c[0]+(Math.random()-.5)*.08,y:c[1],z:c[2],r:.006+Math.random()*.01,ph:Math.random()*6}); } if(T.chestT<-2.5)T.chestT=10+Math.random()*8; }
    let nb=0; for(let i=T.bubs.length-1;i>=0;i--){ const b=T.bubs[i]; b.y+=(.05+b.r*30)*dt; b.ph+=dt*9; b.x+=Math.sin(b.ph)*.012*dt; b.z+=Math.cos(b.ph*.7)*.008*dt; if(b.y>=T.WY-b.r){ poke(T,b.x,b.z,.0005+b.r*.18,.035); T.bubs.splice(i,1); continue; }
      if(nb<72){ Mx.compose(Pv.set(b.x,b.y,b.z),Q.identity(),Sv.setScalar(b.r)); T.bub.setMatrixAt(nb++,Mx); } }
    T.bub.count=nb; T.bub.instanceMatrix.needsUpdate=true;
    // the food: floats a moment where it fell, then sinks and drifts, and is gone when a fish takes it or it lies on the sand a while
    let nf=0; for(let i=T.pel.length-1;i>=0;i--){ const q=T.pel[i]; q.t+=dt; if(q.t>1.4)q.y=Math.max(T.sandY(q.x,q.z)+.006,q.y-.035*dt); else q.y=T.WY-.004; q.x+=Math.sin(q.t*1.3+i)*.004*dt;
      if(q.t>40){ T.pel.splice(i,1); continue; } if(nf<16){ Mx.compose(Pv.set(q.x,q.y,q.z),Q.identity(),Sv.setScalar(.008)); T.food.setMatrixAt(nf++,Mx); } }
    T.food.count=nf; T.food.instanceMatrix.needsUpdate=true;
    // the fish: each wanders the tank (a new spot every few seconds), turns smoothly, keeps off the glass and its neighbours; fed, it rises and chases the food; at the top it breaks the surface
    for(const k in T.sch)T.sch[k].n=0;
    for(const f of T.fish){ const m=f.L*.55+.03, x0=-W2+m, x1=W2-m, z0=-D2+Math.min(m,D2*.8), z1=D2-Math.min(m,D2*.8), yb=T.sandY(f.x,f.z)+f.L*.22+.03, yt=T.WY-f.L*.18-.02; let sp=f.sp*f.k*(1+up*.8); f.t-=dt; if(f.rest>0&&!up){ f.rest-=dt; sp*=.08; } if(f.dart>0){ f.dart-=dt; sp*=2.6; } else if(Math.random()<dt*(f.b==='hover'?.09:.03))f.dart=.5;
      let tgt=null; if(T.pel.length&&up>0){ let bd=1e9; for(const q of T.pel){ const d=Math.hypot(q.x-f.x,q.y-f.y,q.z-f.z); if(d<bd){ bd=d; tgt=q; } } }
      if(tgt){ f.tx=tgt.x; f.ty=tgt.y; f.tz=tgt.z; sp*=1.4; if(Math.hypot(tgt.x-f.x,tgt.y-f.y,tgt.z-f.z)<f.L*.45){ T.pel.splice(T.pel.indexOf(tgt),1); if(tgt.y>T.WY-.03)poke(T,tgt.x,tgt.z,.003,.03); f.t=0; } }
      else if(f.t<=0||Math.hypot(f.tx-f.x,f.tz-f.z)<f.L*.6)pick(T,f,x0,x1,z0,z1,yb,yt);
      const ty=up>0&&!tgt?yt-.02:f.ty;
      const want=Math.atan2(-(f.tz-f.z),f.tx-f.x); let dh=Math.atan2(Math.sin(want-f.h),Math.cos(want-f.h)); { const tr=1.6*Math.min(1,.4+.12/f.L); f.h+=Math.max(-tr*dt,Math.min(tr*dt,dh)); } f.v+=(sp*(Math.abs(dh)<1.2?1:.35)-f.v)*Math.min(1,dt*1.2);
      for(const o of T.fish){ if(o===f)continue; const ax=f.x-o.x, az=f.z-o.z, ay=f.y-o.y, d=Math.hypot(ax,ay,az), r=(f.L+o.L)*.42; if(d<r&&d>1e-4){ const k=(r-d)/r*dt*.5; f.x+=ax/d*k; f.z+=az/d*k; f.y+=ay/d*k*.5; }
        if(o.pred&&!f.pred&&f.L<o.L*.6&&d<.22+o.L*.5&&d>1e-4&&!(f.dart>0)){ f.dart=.8; f.rest=0; f.t=1+Math.random(); f.tx=Math.max(x0,Math.min(x1,f.x+ax/d*.6)); f.tz=Math.max(z0,Math.min(z1,f.z+az/d*.4)); f.ty=Math.max(yb,Math.min(yt,f.y+ay/d*.3)); } }
      f.x+=Math.cos(f.h)*f.v*dt+(f.b==='station'||f.b==='drift'?.012*dt:0); f.z-=Math.sin(f.h)*f.v*dt; if(f.x<x0||f.x>x1||f.z<z0||f.z>z1){ f.x=Math.max(x0,Math.min(x1,f.x)); f.z=Math.max(z0,Math.min(z1,f.z)); f.t=0; }
      const vy=(ty-f.y)*Math.min(1,dt*.8); f.y=Math.max(yb,Math.min(yt,f.y+vy)); f.pt+=(Math.max(-.4,Math.min(.4,vy/Math.max(dt,1e-3)/Math.max(f.v,.05)))-f.pt)*Math.min(1,dt*3);
      if(f.y>yt-.01&&f.v>.03&&Math.random()<dt*8)poke(T,f.x+Math.cos(f.h)*f.L*.4,f.z-Math.sin(f.h)*f.L*.4,.0015*f.v/.1,.03+f.L*.1);
      f.ph+=dt*(3+12*f.v)*Math.min(1,Math.sqrt(.16/f.L)); if(f.b==='drift'){ const q=Math.sin(f.ph*.8); f.y=Math.max(yb,Math.min(yt,f.y+(q>0?.05*q:-.012)*dt)); }
      const S=T.sch[f.id]; if(!S||S.n>=CAPS)continue; const i=S.n++; E3.set(0,f.h,f.pt); Q.setFromEuler(E3); if(f.b==='drift'){ const q=Math.sin(f.ph*.8)*.12; Sv.set(f.L*(1-q),f.L*(1+q),f.L*(1-q)); } else Sv.setScalar(f.L); Mx.compose(Pv.set(f.x,f.y,f.z),Q,Sv); S.im.setMatrixAt(i,Mx); S.im.setColorAt(i,f.c||TINT()); S.im.userData.sw.setXYZ(i,f.ph,.6+Math.min(1.4,f.v*2),S.im.userData.style); }
    for(const k in T.sch){ const S=T.sch[k]; S.im.count=S.n; S.im.instanceMatrix.needsUpdate=true; if(S.im.instanceColor)S.im.instanceColor.needsUpdate=true; S.im.userData.sw.needsUpdate=true; }
    // the surface: stepped at 30 a second (at most three steps a frame), then shaped
    T.acc=Math.min(T.acc+dt,.1); let n=0; while(T.acc>=1/60){ T.acc-=1/60; step(T); n++; } if(n)shape(T); };

  /* ---------- feeding: a pinch of food lands on the water and the fish come up for it ---------- */
  const feed=T=>{ FORAGE.take('g_fishfood',1); if(FORAGE.draw)FORAGE.draw(); T.fed=30; if(SFX)SFX.play('click',{vol:.3,vary:.2});
    const cx=(Math.random()-.5)*T.SW*.5, cz=-T.SD*.15+(Math.random()-.5)*T.SD*.3; for(let i=0;i<12;i++){ const x=cx+(Math.random()-.5)*.25, z=cz+(Math.random()-.5)*.18; T.pel.push({x,y:T.WY,z,t:Math.random()*.4}); poke(T,x,z,.004,.025); }
    SAY('YOU SHAKE IN A PINCH OF FOOD. THE FISH RISE AND SNAP IT UP.','#c8e8f0'); };
  ROOMK.wires.tank=(un,c)=>{ const T=TANKS.find(q=>q.g===un.obj); if(!T)return; T.id=un.id; T.un=un;
    c.hit(un,()=>'THE FISH TANK',()=>TANKV.open(T)); };   // always its menu (FEED THE FISH is a button in it)

  /* ---------- the close look: the camera before the tank's glass, and its settings beside it ---------- */
  let V=null, P=null;
  const TANKV=window.TANKV={on:()=>!!V};
  const css=`#tankp{position:fixed;right:14px;top:50%;transform:translateY(-50%);z-index:22;width:min(340px,92vw);max-height:90vh;overflow:auto;padding:12px 14px;font:11px Silkscreen,monospace;letter-spacing:.4px;color:#d8dae2;background:#0b0d13ee;border:2px solid #3a3f4e;zoom:var(--uiz,1)}
    #tankp h4{margin:10px 0 4px;color:#7d8aa0;font:inherit}#tankp button{font:inherit;color:#d8dae2;background:#1a1d27;border:1px solid #3a3f4e;padding:3px 6px;margin:2px;cursor:pointer}#tankp button.on{background:#2c4a5a!important;border-color:#7fd0ff!important;color:#fff!important}
    #tankp button:disabled{opacity:.35;cursor:default}#tankp .row{display:flex;align-items:center;justify-content:space-between}#tankp .sw,#tankp .sw.on{width:18px;height:18px;padding:0;background:var(--c)!important}#tankp .sw.on{outline:2px solid #fff}`;
  let TAB='tank';
  const draw=()=>{ '@later'; if(!P||!V)return; const T=V.T, s=T.s, W=WATER[s.w], guest=ROOMK.guest&&ROOMK.guest(), dis=guest?' disabled':'', n=Object.values(s.f).reduce((a,b)=>a+b,0), MAXF=SIZES[s.sz].f, food=FORAGE.has('g_fishfood');
    const bt=(a,nm,on,d='')=>`<button data-a="${a}" class="${on?'on':''}"${dis||d}>${nm}</button>`, pick=(a,O,cur)=>Object.keys(O).map(k=>bt(a+':'+k,O[k].n,cur===k)).join('');
    let h='';
    if(TAB==='tank')h='<h4>SIZE</h4>'+Object.keys(SIZES).map(k=>bt('z:'+k,SIZES[k].n,s.sz===k,T.len({sz:k})<T.len({sz:'m'})*SIZES[k].k-.05?' disabled title="NO ROOM ALONG THIS WALL"':'')).join('')+'<h4>STANDS ON</h4>'+pick('b',BASES,s.base)+'<h4>RIM</h4>'+pick('r',RIMS,s.rim)+`<div style="color:#7d7a70;margin-top:8px">${T.TW.toFixed(1)} M LONG · HOLDS ${MAXF} FISH</div>`;
    if(TAB==='water')h='<h4>WATER</h4>'+pick('w',WATER,s.w)+'<h4>LIGHT</h4>'+bt('l:on',s.l.on?'ON':'OFF',s.l.on)+Object.keys(LIGHTC).map(k=>`<button class="sw ${s.l.c===k?'on':''}" data-a="l:c:${k}" title="${k.toUpperCase()}" style="--c:${LIGHTC[k]}"${dis}></button>`).join('')+'<h4>BRIGHTNESS</h4>'+Object.keys(LIGHTB).map(k=>bt('l:b:'+k,LIGHTB[k].n,s.l.b===k)).join('');
    if(TAB==='fish')h=`<h4>IN THE TANK: ${n} OF ${MAXF}</h4>`+[0,1].map(sl=>`<h4>${sl?'SALT WATER':'FRESH WATER'}</h4>`+KIND.filter(k=>!!k.salt===!!sl).map(k=>{ const ok=fits(k,W), c=s.f[k.id]||0; return `<div class="row" style="opacity:${ok?1:.45}"><span>${k.n} <i style="color:#7d7a70">${k.salt?'SALT':'FRESH'}</i></span><span><button data-a="f:${k.id}:-1"${dis||(!c?' disabled':'')}>-</button> ${c} <button data-a="f:${k.id}:1"${dis||(!ok||n>=MAXF||c>=8?' disabled':'')}>+</button></span></div>`+
        (c?`<div class="row" style="margin:0 0 6px 8px"><span>${Object.keys(FSIZE).map(z=>bt('fz:'+k.id+':'+z,FSIZE[z].n,(s.fz[k.id]||'m')===z)).join('')}</span><span>${Object.keys(FTINT).map(t=>`<button class="sw ${(s.fc[k.id]||'nat')===t?'on':''}" data-a="fc:${k.id}:${t}" title="${t==='nat'?'ITS OWN COLOURS':t.toUpperCase()}" style="--c:${FTINT[t]};width:13px;height:13px"${dis}></button>`).join('')}</span></div>`:''); }).join('')).join('')+
      (PETS.sea&&PETS.sea().length?`<div style="color:#7d7a70;margin-top:4px">AND YOUR ${PETS.sea().length} FROM THE AQUARIUM</div>`:'');
    if(TAB==='decor')h='<h4>THE BED</h4>'+DECOR.map(([k,nm])=>bt('d:'+k,nm,s.d.includes(k))).join('')+[...new Set(PF.map(p=>p[2]))].map(G=>`<h4>${G==='SUNK'?'SUNKEN THINGS':G}</h4>`+PF.filter(p=>p[2]===G).map(p=>bt('d:'+p[0],p[1],s.d.includes(p[0]))).join('')).join('');
    P.innerHTML=`<div class="row"><b style="color:#f2c14e">THE FISH TANK</b><button data-a="x">X</button></div>`+(guest?'<div style="color:#c8a090;margin-top:6px">SOMEONE ELSE\'S TANK: YOU CAN LOOK.</div>':'')+
      '<div style="margin-top:8px">'+[['tank','TANK'],['water','WATER & LIGHT'],['fish','FISH'],['decor','DECOR']].map(([k,nm])=>`<button data-a="tab:${k}" class="${TAB===k?'on':''}">${nm}</button>`).join('')+'</div>'+h+
      (food&&!guest?'<div style="margin-top:10px"><button data-a="feed">FEED THE FISH</button></div>':'')+'<div style="color:#7d7a70;margin-top:10px">DRAG TO LOOK ROUND · SCROLL TO COME CLOSE · TAP THE GLASS · ESC TO STEP BACK</div>'; };
  const act=a=>{ '@later'; if(!V)return; const T=V.T, s=JSON.parse(JSON.stringify(T.s)), [k,x,y]=a.split(':');
    if(k==='x')return TANKV.close(); if(k==='tab'){ TAB=x; return draw(); } if(k==='feed'){ if(FORAGE.has('g_fishfood'))feed(T); return draw(); } if(ROOMK.guest&&ROOMK.guest())return;
    if(k==='w')s.w=x; if(k==='d')s.d=s.d.includes(x)?s.d.filter(q=>q!==x):s.d.concat(x); if(k==='f'){ const n=Object.values(s.f).reduce((a,b)=>a+b,0), d=+y; if(d<0||n<SIZES[s.sz].f)s.f[x]=Math.max(0,Math.min(8,(s.f[x]||0)+d)); if(!s.f[x])delete s.f[x]; }
    if(k==='l'){ if(x==='on')s.l.on=s.l.on?0:1; else if(x==='b')s.l.b=y; else s.l.c=y; } if(k==='z')s.sz=x; if(k==='b')s.base=x; if(k==='r')s.rim=x; if(k==='fz')s.fz[x]=y; if(k==='fc')s.fc[x]=y;
    apply(T,s); if(SFX)SFX.play('click',{vol:.25,vary:.2}); if(ROOMK.save)ROOMK.save(); draw(); };
  TANKV.open=T=>{ '@later'; if(V)TANKV.close(); if(!P){ const st=document.createElement('style'); st.textContent=css; document.head.appendChild(st); P=document.createElement('div'); P.id='tankp'; document.body.appendChild(P);
      P.addEventListener('click',e=>{ const b=e.target.closest('button'); if(b&&!b.disabled)act(b.dataset.a); }); for(const ev of ['pointerdown','dblclick','wheel'])P.addEventListener(ev,e=>e.stopPropagation()); }
    V={T,yaw:0,pit:0,zoom:0,px:0,py:0,cy:0,cp:0,cz:0,cx:0,cpy:0,view0:UI.view,x:pos.x,z:pos.z,t0:performance.now(),fp:UI.persp?SHARED.cam.position.clone():null,fq:SHARED.cam.quaternion.clone()}; if(!(VR&&VR.on)){ if(!UI.persp)UI.setView('third'); UI.holdCam='tank'; } P.hidden=false; draw(); };
  TANKV.close=()=>{ if(!V)return; const v0=V.view0; V=null; if(P)P.hidden=true; if(UI.holdCam==='tank'){ UI.holdCam=null; if(v0&&UI.view!==v0)UI.setView(v0); } };
  TANKV.act=a=>act(a);
  addEventListener('keydown',e=>{ if(V&&e.key==='Escape'){ e.stopPropagation(); e.preventDefault(); TANKV.close(); } },true);
  const LK=new THREE.Matrix4(), QT=new THREE.Quaternion(), UP=new THREE.Vector3(0,1,0), CA=new THREE.Vector3(), CB=new THREE.Vector3(), RA=new THREE.Vector3(), RB=new THREE.Vector3();
  // looking round the tank (owner, 12 Nov 2026): drag to go round and over it, the wheel (or a pinch) to come close to where you point, a tap on the glass startles the fish
  const aim=(T,cx,cy)=>{ const c=SHARED.cam, r=renderer.domElement.getBoundingClientRect(); RA.set((cx-r.left)/r.width*2-1,-((cy-r.top)/r.height*2-1),.5).unproject(c); T.tg.worldToLocal(RA); T.tg.worldToLocal(RB.setFromMatrixPosition(c.matrixWorld)); RA.sub(RB);
    const t=Math.abs(RA.z)>1e-4?-RB.z/RA.z:0; return t>0?RB.addScaledVector(RA,t):null; };
  const zoomBy=(d,cx,cy)=>{ const T=V.T, z0=V.zoom; V.zoom=Math.max(0,Math.min(1,V.zoom+d)); if(V.zoom<=0){ V.px=V.py=0; return; } const h=d>0&&aim(T,cx,cy), k=d>0?.4:-.35*(z0>0?Math.min(1,-d/z0):1), tx=h?h.x:0, ty=h?h.y-(T.SH+T.TH*.5):0;
    V.px=Math.max(-T.SW*.46,Math.min(T.SW*.46,V.px+((d>0?tx:0)-V.px)*Math.abs(k))); V.py=Math.max(-T.TH*.42,Math.min(T.TH*.36,V.py+((d>0?ty:0)-V.py)*Math.abs(k))); };
  const tap=(cx,cy)=>{ const T=V.T, h=aim(T,cx,cy); if(!h||Math.abs(h.x)>T.TW/2||h.y<T.SH||h.y>T.SH+T.TH)return; if(SFX)SFX.play('click',{vol:.35,vary:.3}); poke(T,h.x,-T.SD/2+.05,.0025,.05);
    for(const f of T.fish){ const dx=f.x-h.x, dy=f.y-h.y, d=Math.hypot(dx,dy); if(d>.55)continue; const m=f.L*.55+.05; f.dart=.9+Math.random()*.5; f.rest=0; f.t=1.2+Math.random(); f.tx=Math.max(-T.SW/2+m,Math.min(T.SW/2-m,f.x+dx/(d+.01)*.6)); f.tz=T.SD/2-m-Math.random()*.2; f.ty=Math.max(T.sandY(f.x,f.z)+.05,Math.min(T.WY-.05,f.y+dy/(d+.01)*.3)); } };
  { const PT=new Map(); let moved=0, t0=0, pd=0; const mine=e=>V&&UI.holdCam==='tank'&&!(e.target&&e.target.closest&&e.target.closest('#tankp')), eat=e=>{ e.stopPropagation(); if(e.cancelable)e.preventDefault(); };
    addEventListener('pointerdown',e=>{ if(!mine(e))return; eat(e); PT.set(e.pointerId,[e.clientX,e.clientY]); if(PT.size===1){ moved=0; t0=performance.now(); } else { const [a,b]=[...PT.values()]; pd=Math.hypot(a[0]-b[0],a[1]-b[1]); moved=99; } },true);
    addEventListener('pointermove',e=>{ const q=PT.get(e.pointerId); if(!q||!V)return; eat(e); const dx=e.clientX-q[0], dy=e.clientY-q[1]; q[0]=e.clientX; q[1]=e.clientY;
      if(PT.size>=2){ const [a,b]=[...PT.values()], d=Math.hypot(a[0]-b[0],a[1]-b[1]); if(pd>0)zoomBy((d-pd)/260,(a[0]+b[0])/2,(a[1]+b[1])/2); pd=d; return; }
      moved+=Math.abs(dx)+Math.abs(dy); if(moved<5)return; V.yaw=Math.max(-1.25,Math.min(1.25,V.yaw-dx*.006)); V.pit=Math.max(-.2,Math.min(.95,V.pit+dy*.005)); },true);
    const up=e=>{ if(!PT.has(e.pointerId))return; PT.delete(e.pointerId); if(!V)return; eat(e); if(e.type==='pointerup'&&moved<5&&performance.now()-t0<350)tap(e.clientX,e.clientY); }; addEventListener('pointerup',up,true); addEventListener('pointercancel',up,true);
    addEventListener('wheel',e=>{ if(!mine(e))return; eat(e); zoomBy(-Math.sign(e.deltaY)*Math.min(.18,Math.abs(e.deltaY)/600+.06),e.clientX,e.clientY); },{capture:true,passive:false});
    for(const ev of ['click','dblclick','mousedown','mouseup','contextmenu'])addEventListener(ev,e=>{ if(mine(e))eat(e); },true); }
  SYS.add('cam',dt=>{ if(!V)return; const T=V.T; if(!T.g.parent||!T.g.visible||Math.hypot(pos.x-V.x,pos.z-V.z)>3*(T.g.parent.scale.x||1)){ TANKV.close(); return; } if(UI.holdCam!=='tank')return; const cam=SHARED.cam; if(!cam||!cam.isPerspectiveCamera)return;
    if(!V.fp){ V.fp=cam.position.clone(); V.fq=cam.quaternion.clone(); } const s=Math.min(1,(performance.now()-V.t0)/800), e=s*s*(3-2*s), th=Math.tan(cam.fov*Math.PI/360)*cam.aspect, d0=Math.max(1.6,T.TW*.78/th), ym=T.SH+T.TH*.5, k=Math.min(1,(dt||.016)*7);
    V.cy+=(V.yaw-V.cy)*k; V.cp+=(V.pit-V.cp)*k; V.cz+=(V.zoom-V.cz)*k; V.cx+=(V.px-V.cx)*k; V.cpy+=(V.py-V.cpy)*k;
    const d=d0*Math.pow(.2/d0,V.cz), off=T.TW*.26*d/d0, cyw=Math.cos(V.cy), syw=Math.sin(V.cy), cpt=Math.cos(V.cp), fz=1-V.cz;
    CA.set(V.cx,ym+V.cpy,0); CB.set(CA.x+syw*cpt*d,CA.y+.25*fz+Math.sin(V.cp)*d,-cyw*cpt*d-T.TD/2*fz);
    // never inside the glass, the wall behind or the floor; over the top is allowed
    if(CB.y<T.SH+T.TH+.1&&Math.abs(CB.x)<T.TW/2+.1&&CB.z>-T.TD/2-.1){ const pz=CB.z+T.TD/2+.1, px=T.TW/2+.1-Math.abs(CB.x), py=T.SH+T.TH+.1-CB.y; if(pz<=px&&pz<=py||V.cp<.5)CB.z=-T.TD/2-.1; else if(py<px)CB.y=T.SH+T.TH+.1; else CB.x=Math.sign(CB.x||1)*(T.TW/2+.1); }
    CB.z=Math.min(CB.z,T.TD/2+.02); CB.y=Math.max(.3,Math.min(2.35,CB.y)); CB.x=Math.max(-T.TW/2-1,Math.min(T.TW/2+1,CB.x));
    RA.set(-cyw,0,-syw).multiplyScalar(off); CA.add(RA); CB.add(RA);   // aimed right of the tank's middle, so it shows left of the settings
    T.tg.localToWorld(CA); T.tg.localToWorld(CB); LK.lookAt(CB,CA,UP); QT.setFromRotationMatrix(LK);
    cam.position.lerpVectors(V.fp,CB,e); cam.quaternion.slerpQuaternions(V.fq,QT,e); cam.updateMatrixWorld(); if(W3.group)W3.group.visible=false; },'150k-tankview');
  ROOMK.keep.push({ out:(L)=>{ const o={}; for(const T of TANKS)if(T.g.parent&&T.id)o[T.id]=T.s; if(Object.keys(o).length)L.tanks=o; },
    in:(L)=>{ for(const T of TANKS)if(T.g.parent&&T.id)apply(T,L.tanks&&L.tanks[T.id]||DEF); if(V)draw(); } });
  SYS.add('life',dt=>{ for(let k=TANKS.length-1;k>=0;k--){ const T=TANKS[k]; if(!T.g.parent){ TANKS.splice(k,1); continue; } if(!T.g.visible)continue; tick(T,Math.min(dt,.1)); } },'150k-fishtank'); }
