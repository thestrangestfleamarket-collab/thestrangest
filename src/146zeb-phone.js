// THE BRICK PHONE (owner, 8 Nov 2026: "give all players a 1980s style cellular phone they can use to order things. a drone can deliver things to them anywhere they are"): every player has one; use it and its green screen lists what the bodega sells, SEND orders one (its price and $2 delivery), and the drone flies it to you wherever you stand outdoors.
import {SHARED} from './003-shx.js';
import {DRONE, FORAGE, INSPECT, INV, pos, ROOMS} from './003b-systems.js';
import {SYS, TILE} from './006-map-pre.js';
import {MINI} from './038zd-mini.js';
import {BODEGA} from './146ze-bodega.js';
const PHONE={fee:2}; window.PHONE=PHONE;
{ const ID='brickphone', W=260, H=500, LINES=7, LY=78, LH=24;
  FORAGE.add({names:{[ID]:'BRICK PHONE'},prices:{[ID]:0}});
  INSPECT.kinds.push({is:id=>id===ID,make:()=>INSPECT.shape('brickphone',0x2c2d31)});
  // given once to everyone, new and old, kept with the account
  SYS.onStart(()=>{ const S=FORAGE.S; if(!S||S.phone1)return; INV.items[ID]=Math.max(INV.items[ID]||0,1); S.phone1=1; if(INV.save)INV.save(); if(FORAGE.save)FORAGE.save(); },'146zeb-phone');
  const lines=()=>{ const A=BODEGA.all?BODEGA.all():{supplies:[],shelves:[],goods:[]}, L=[], seen=new Set(); for(const r of [...A.supplies,...A.shelves,...A.goods])if(r&&r.id&&!seen.has(r.id)){ seen.add(r.id); L.push(r); } return L; };
  // where the drone brings it: a step in front of you, outdoors on the street's level only
  const here=()=>{ const T=TILE, h=SHARED.heading||0, x=pos.x+Math.sin(h)*.9*T, z=pos.z+Math.cos(h)*.9*T; return {x,y:SHARED.groundY?SHARED.groundY(x,z):0,z}; };
  const signal=()=>SHARED.LVL==='up'&&!(ROOMS.offIn&&ROOMS.offIn())&&!(ROOMS.cur&&ROOMS.cur.name);
  PHONE.order=r=>{ if(!r)return 'NOTHING PICKED.'; if(!signal())return 'NO SIGNAL IN HERE. TRY OUTSIDE.'; if(!DRONE.go)return 'NO DRONE ANSWERS.'; if(DRONE.state!=='home')return 'THE DRONE IS OUT. CALL BACK SOON.';
    const cost=r.price+PHONE.fee; if(INV.cash<cost)return 'NOT ENOUGH CASH ($'+cost+').'; INV.cash-=cost; if(INV.save)INV.save();
    DRONE.go(r.name,()=>{ FORAGE.give(r.id,1); if(FORAGE.save)FORAGE.save(); if(FORAGE.draw)FORAGE.draw(); },{follow:here}); return ''; };
  const view={title:'BRICK PHONE',w:W,h:H,help:'Up and down pick a line (or click it), SEND orders it: its price and $'+PHONE.fee+' delivery. The drone brings it to wherever you are outdoors. END hangs up.',
    start:S=>{ S.L=lines(); S.sel=0; S.top=0; S.msg='THE BODEGA · DRONE DELIVERY'; },
    tick:S=>{ const n=S.L.length; if(S.wheel){ S.sel=Math.max(0,Math.min(n-1,S.sel+Math.sign(S.wheel))); S.wheel=0; }
      if(S.press){ const x=S.mx, y=S.my; const B=btn(x,y);
        if(B==='up')S.sel=Math.max(0,S.sel-1); else if(B==='dn')S.sel=Math.min(n-1,S.sel+1);
        else if(B==='send'){ const r=S.L[S.sel], e=PHONE.order(r); S.msg=e||('ORDERED: '+r.name+'. THE DRONE IS ON ITS WAY.'); }
        else if(B==='end'){ S.close=true; if(MINI.close)MINI.close(); }
        else if(y>LY&&y<LY+LINES*LH&&x>36&&x<W-36)S.sel=Math.min(n-1,S.top+Math.floor((y-LY)/LH)); }
      if(S.sel<S.top)S.top=S.sel; if(S.sel>=S.top+LINES)S.top=S.sel-LINES+1; },
    draw:(S,g)=>{ g.fillStyle='#14161a'; g.fillRect(0,0,W,H);
      g.fillStyle='#2b2b2e'; g.fillRect(24,30,W-48,H-40); g.fillStyle='#38383c'; g.fillRect(28,34,W-56,6); g.fillStyle='#1c1c1f'; g.fillRect(W-70,0,10,34);   // the brick and its antenna
      g.fillStyle='#8fa86a'; g.fillRect(34,52,W-68,LY+LINES*LH-40); g.fillStyle='#1e2a14'; g.font='11px monospace'; g.textBaseline='middle'; g.textAlign='left';
      g.fillText(('$'+INV.cash).padEnd(8)+'▮▮▮▯'.padStart(14),40,64);
      for(let i=0;i<LINES;i++){ const r=S.L[S.top+i]; if(!r)break; const y=LY+i*LH+LH/2, on=S.top+i===S.sel; if(on){ g.fillStyle='#1e2a14'; g.fillRect(36,y-LH/2+2,W-72,LH-4); } g.fillStyle=on?'#8fa86a':'#1e2a14';
        g.textAlign='left'; g.fillText(r.name.slice(0,17),40,y); g.textAlign='right'; g.fillText('$'+r.price,W-40,y); }
      g.fillStyle='#e8e2cc'; g.textAlign='center'; g.font='10px monospace'; wrap(g,S.msg,W/2,LY+LINES*LH+22,W-60);
      for(const b of BTN){ g.fillStyle=b.c; g.fillRect(b.x,b.y,b.w,b.h); g.fillStyle='#e8e2cc'; g.font='12px monospace'; g.fillText(b.t,b.x+b.w/2,b.y+b.h/2); }
      g.fillStyle='#4a4a50'; for(let r=0;r<4;r++)for(let c=0;c<3;c++)g.fillRect(56+c*54,362+r*31,40,22); g.fillStyle='#c8c8cc'; g.font='11px monospace';
      '123456789*0#'.split('').forEach((k,i)=>g.fillText(k,76+(i%3)*54,373+Math.floor(i/3)*31)); }};
  const BTN=[{k:'up',t:'▲',x:100,y:290,w:60,h:26,c:'#4a4a50'},{k:'dn',t:'▼',x:100,y:320,w:60,h:26,c:'#4a4a50'},{k:'send',t:'SEND',x:36,y:300,w:56,h:36,c:'#2a6a3a'},{k:'end',t:'END',x:W-92,y:300,w:56,h:36,c:'#7a2a24'}];
  const btn=(x,y)=>{ const b=BTN.find(b=>x>=b.x&&x<=b.x+b.w&&y>=b.y&&y<=b.y+b.h); return b&&b.k; };
  const wrap=(g,t,x,y,w)=>{ const ws=String(t||'').split(' '); let l='', k=0; for(const s of ws){ if(g.measureText(l+s).width>w&&l){ g.fillText(l.trim(),x,y+k*13); l=''; k++; } l+=s+' '; } g.fillText(l.trim(),x,y+k*13); };
  PHONE.open=()=>MINI.open(view);
  FORAGE.ACT[ID]=()=>PHONE.open(); }
