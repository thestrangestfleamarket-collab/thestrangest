// THE FIXER'S SETS AT HOME: each TV, computer and modem bought from the Fixer (146l) is a thing for your apartment — DECORATE shows it as YOURS once you own one; a click works it: the TVs change channel, the computer dials the market's board when a modem sits in the same room.
import {THREE} from './003-shx.js';
import {DRONE} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {FIXIT} from './146l-fixer.js';
import {ROOMK} from './150a-bedroom.js';
{ const SETS=FIXIT.SETS, draw=FIXIT.draw, SCR=FIXIT.SCR, SMAP=FIXIT.SMAP;
  ROOMK.parts.push(ctx=>{ '@later'; const {R}=ctx; for(const id in SETS){ const S=SETS[id], k='fx:'+id; if(R.kinds[k])continue; const D={kind:k,name:S.name,own:id,loose:!!S.loose,m:S.loose||0,wire:'set',sol:S.sol?[[-S.sol[0],-S.sol[1],S.sol[0],S.sol[1],S.sol[2]]]:[],shf:[],dept:'electronics',deptName:'ELECTRONICS'};
      Object.defineProperty(D,'tpl',{configurable:true,enumerable:true,get(){ const t=S.make(); t.userData.set=id; Object.defineProperty(D,'tpl',{value:t,enumerable:true}); return t; }}); R.kinds[k]=D; } });
  ROOMK.wires.set=(un,c)=>{ '@later'; const id=(un.kind||'').replace(/^fx:/,''), scr=[]; un.obj.traverse(o=>{ if(o.userData.screen){ o.material=o.material.clone(); const S={ch:(SMAP.get(o)||{}).ch||0,m:o,c:document.createElement('canvas')}; S.c.width=64; S.c.height=48; S.t=new THREE.CanvasTexture(S.c); S.t.colorSpace=THREE.SRGBColorSpace; S.t.magFilter=THREE.NearestFilter; o.material.map=S.t; S.on=false; SCR.push(S); scr.push(S); draw(S,0); } });
    const L=new THREE.PointLight(0x9ab8e0,0,2.4*(c.M||1),2); L.position.set(0,.4,.5); un.obj.add(L);
    if(id==='modem'){ c.hit(un,()=>'THE MODEM: '+(FIXIT.dialed?'CONNECTED':'READY'),()=>FIXIT.dial()); return; }
    if(id==='pc_home'){ c.hit(un,()=>'THE HOME COMPUTER',()=>{ const S=scr[0]; if(S){ S.on=true; draw(S,0); L.intensity=.5; } FIXIT.dial(true); }); return; }
    c.hit(un,()=>un.name+': '+(scr[0]&&scr[0].on?['STATIC','CH 7','THE CINEMA','THE NEWS'][scr[0].ch]:'OFF'),()=>{ const S=scr[0]; if(!S)return; if(!S.on){ S.on=true; S.ch=1; } else if(S.ch<3)S.ch++; else S.on=false; L.intensity=S.on?.6:0; draw(S,Date.now()/1000); }); };
  // the computer reaches the market's board only through a modem in the same room
  FIXIT.dial=pc=>{ '@later'; const A=ROOMK.api, U=A?A.units():[], has=n=>U.some(u=>u.kind==='fx:'+n&&!u.gone);
    if(pc&&!has('modem'))return SAY('NO DIAL TONE. THE COMPUTER NEEDS A MODEM BESIDE IT.','#c8a090');
    if(!pc&&!has('pc_home'))return SAY('THE MODEM SQUEALS AT NOTHING. IT NEEDS A COMPUTER.','#c8a090');
    FIXIT.dialed=true; SAY('EEEE-KSSHHH-BWONG. CONNECTED TO THE MARKET BOARD.','#9fe0a0'); if(DRONE&&DRONE.open)DRONE.open(); };

}
