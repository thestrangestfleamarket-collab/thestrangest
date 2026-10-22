// THE MINING: MINING seeds each cavern's finds by the calendar day, shows the ones your prospecting can spot, and lets you work them free; the golems buy them all.
import {SHARED, THREE} from './003-shx.js';
import {CITY, FORAGE, INV, MAIL, SFX, UI} from './003b-systems.js';
import {TILE} from './006-map-pre.js';
import {CAVERNS} from './066a-caverns.js';
import {GEMS} from './101-gems.js';
{ const T=TILE, X=SHARED.BOD.XS, Z=SHARED.BOD.ZS, Y=SHARED.BOD.YS, day=()=>window.MAIL&&MAIL.ready?MAIL.day():window.CITY?CITY.day||0:0; CAVERNS.day=day;
  const hs=(a,b,c=0)=>{ const s=Math.sin(a*127.1+b*311.7+c*74.7)*43758.5453; return s-Math.floor(s); };
  // each zone's finds: [id, NAME, price, weight, prospecting to spot it, colour]; the gem cave holds the golems' ten stones
  const FINDS={gemcave:GEMS.slice(0,10).map((g,i)=>[g[0],g[1],g[2],g[3],i*9,[0xb0c8ff,0xc080ff,0xd0b090,0xffb060,0xe0f0ff,0xff90d0,0x60ff90,0x6090ff,0xff5050,0xffffff][i]]),
    hudson:[['pearl','RIVER PEARL',12,30,0,0xf0ecff],['seaglass','SEA GLASS',6,34,0,0x8fe3d6],['coral','RED CORAL',22,18,15,0xff6a5a],['nacre','NACRE SHELL',30,12,30,0xe8d8ff],['aquamarine','AQUAMARINE',70,7,45,0x60d0ff],['blackpearl','BLACK PEARL',110,4,55,0x2a2a3a]],
    lake:[['jade','JADE',26,22,0,0x60c080],['amber','LAKE AMBER',18,26,0,0xffb040],['silver','SILVER ORE',38,14,20,0xd0d8e0],['goldnug','GOLD NUGGET',60,10,30,0xffd040],['garnet','GARNET',48,9,40,0xa02040],['platinum','PLATINUM ORE',140,3,65,0xe8f0f8]]};
  for(const k in FINDS)if(k!=='gemcave')for(const f of FINDS[k])GEMS.push([f[0],f[1],f[2],0]);   // the golems buy every find; weight 0 keeps them out of the old cave glints
  CAVERNS.hooks.push((C,G,m)=>{ const F=FINDS[C.id]; if(!F)return; const B=C.lot, d=day(), n=10+Math.floor(hs(d,1)*6), sk=FORAGE.sk?FORAGE.sk('prosp'):0, fy=C.api.ground(0,0), W=F.reduce((a,f)=>a+f[3],0);
    for(let i=0;i<n;i++){ const gx=B.x0+1.5+hs(d,i,2)*(B.x1-B.x0-3), gy=B.y0+1.5+hs(d,i,3)*(B.y1-B.y0-3), deep=(gx-B.x0)/(B.x1-B.x0);   // further in, the rarer finds
      let r=hs(d,i,4)*Math.pow(deep+.2,1.5)*W, f=F[0]; for(const q of F){ if((r-=q[3])<0){ f=q; break; } }
      if(f[4]>sk+15)continue;   // too rare for your prospecting to spot today
      const key=C.id+':'+d+':'+i; if(!INV.ready(key))continue;
      const cr=new THREE.Mesh(new THREE.OctahedronGeometry(.5,0),new THREE.MeshBasicMaterial({color:f[5]})); cr.position.set(X(gx),fy+Y(3),Z(gy)); cr.scale.set(.16*T,.34*T,.16*T); cr.rotation.set(.3,i,.2); G.add(cr); m.objs.push(cr);
      const hb=new THREE.Mesh(new THREE.BoxGeometry(.7*T,Y(14),.7*T),new THREE.MeshBasicMaterial({visible:false})); hb.position.set(X(gx),fy+Y(7),Z(gy)); G.add(hb); m.objs.push(hb);
      const th={name:'A GLINT',obj:hb,reach:.9*T,near:1.8*T,tall:Y(20),act:()=>{ if(!INV.ready(key))return; cr.visible=hb.visible=false;
        if(FORAGE.use&&!FORAGE.use('prosp',f[4]-20,f[4]+30)){ if(FORAGE.say)FORAGE.say('IT CRUMBLES AS YOU WORK IT FREE.','#c8a090'); return; }
        INV.picked[key]=d; INV.add(f[0],1); SFX.play('chirp',{vol:.4}); if(FORAGE.say)FORAGE.say('YOU FIND '+(/^[AEIOU]/.test(f[1])?'AN ':'A ')+f[1]+' · THE GOLEMS PAY $'+f[2],'#f2c14e'); }};
      UI.thing(th); m.things.push(th); } });
  window.MININGDBG=()=>({day:day(),zones:Object.keys(FINDS),glints:UI.things.filter(t=>t.name==='A GLINT').length}); }
