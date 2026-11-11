// THE GEMS: GEMS lists the gems, INV keeps what the player carries, and TRADE buys and sells them.
import {CITY, CIVIC, FORAGE, INV, LINES, MAIL, pos, SFX, TEXT, TRADE, UI, WORTH} from './003b-systems.js';
import {OWNED} from './005-save.js';
import {QS} from './006-map-pre.js';
const GTIER={quartz:'c',amethyst:'c',geode:'c',amber:'r',moonstone:'r',opal:'r',emerald:'s',sapphire:'s',ruby:'s',meteor:'s'};
const GEMS=[['quartz','QUARTZ CRYSTAL',6,30],['amethyst','AMETHYST',14,22],['geode','GEODE',18,16],['amber','FOSSIL AMBER',24,12],['moonstone','MOONSTONE',30,10],
  ['opal','OPAL',45,7],['emerald','EMERALD',70,5],['sapphire','SAPPHIRE',85,4],['ruby','RUBY',100,3],['meteor','STAR METEORITE',150,1]];
Object.assign(INV,{items:{},picked:{}}); window.INV=INV; GEMS.TIER=GTIER; window.GEMS=GEMS;
{ const KEY='inv', W=GEMS.reduce((a,g)=>a+g[3],0), byId=id=>GEMS.find(g=>g[0]===id);
  const day=()=>window.MAIL&&MAIL.ready?MAIL.day():CITY?CITY.day||0:0;
  // money (owner, 11 Nov 2026, UO's rules): your gold is kept in the bank; INV.cash is what you carry; a price is paid from what you carry, then the rest from the bank (INV.bank, filled in 146zm)
  INV.bank={bal:()=>0,take:()=>0}; INV.money=()=>Math.max(0,INV.cash||0)+INV.bank.bal(); INV.afford=n=>INV.money()>=(+n||0);
  INV.pay=n=>{ n=+n||0; if(n<=0)return true; if(!INV.afford(n))return false; const h=Math.min(Math.max(0,INV.cash||0),n); INV.cash=(INV.cash||0)-h; if(n>h)INV.bank.take(n-h); return true; };
  INV.START=1000;   // what a new player starts with (owner, 7 Nov 2026: "$1,000"); a save from before is topped up to it once, and keeps more
  try{ const D=JSON.parse(OWNED.get(KEY)||'null'); if(D&&D.v===1){ INV.items=D.items||{}; INV.picked=D.picked||{}; INV.inside=D.inside||{}; INV.inst=+D.inst||0; INV.cash=D.cash??INV.START; if(!D.g1m)INV.cash=Math.max(INV.cash,INV.START); } }catch(e){} if(QS.get('fresh')&&QS.get('keepinv')!=='1'){ INV.items={}; INV.picked={}; INV.inside={}; } INV.inside=INV.inside||{}; if(INV.cash==null)INV.cash=INV.START;
  const save=()=>{ OWNED.set(KEY,JSON.stringify({v:1,g1m:1,items:INV.items,picked:INV.picked,inside:INV.inside||{},inst:INV.inst||0,cash:INV.cash})); if(window.MAIL&&MAIL.save)MAIL.save(); };
  INV.save=save; INV.add=(id,n=1)=>{ INV.items[id]=(INV.items[id]||0)+n; save(); TRADE.draw(); };
  INV.count=()=>Object.values(INV.items).reduce((a,b)=>a+b,0);
  INV.random=()=>{ let r=Math.random()*W; for(const g of GEMS){ if((r-=g[3])<0)return g[0]; } return GEMS[0][0]; };
  INV.ready=k=>INV.picked[k]==null||INV.picked[k]<day();
  INV.mark=k=>{ INV.picked[k]=day(); save(); };   // a find taken today (INV.pick also gives a stone)
  INV.pick=k=>{ '@later'; if(!INV.ready(k)){ TRADE.note('NOTHING HERE TODAY. BACK TOMORROW'); return false; } const id=INV.random(), g=byId(id); INV.picked[k]=day(); INV.add(id);
    TRADE.note('YOU FOUND '+(/^[AEIOU]/.test(g[1])?'AN ':'A ')+g[1]+' · THE GEM SHOP PAYS $'+g[2]); SFX.play('chirp',{vol:.4}); return true; };
  // the server kept less than this game saved (more cash or things than play allows at once): what you carry follows it
  OWNED.onClip=c=>{ INV.cash=Math.max(0,(INV.cash||0)-Math.max(0,+c.cash||0)); for(const k in c.items||{}){ INV.items[k]=Math.max(0,(INV.items[k]||0)-c.items[k]); if(!INV.items[k])delete INV.items[k]; } save(); if(FORAGE&&FORAGE.draw)FORAGE.draw(); };
  INV.sell=(id,n=1)=>{ '@later'; const g=byId(id), have=INV.items[id]||0; n=Math.min(n,have); if(!g||n<1)return 0; INV.items[id]=have-n; if(!INV.items[id])delete INV.items[id]; const v=WORTH?WORTH.sell(id,n,g[2]):g[2]*n; INV.cash+=v; save();
    if(window.CIVIC&&CIVIC.note)CIVIC.note('you sold '+n+' '+g[1].toLowerCase()+' to the golems for $'+v,'park'); SFX.play('clunk',{vol:.5}); return v; }; }
 window.TRADE=TRADE;
{ const esc=TEXT.esc, btn='class="btn" style="margin:0 0 0 6px;font:inherit;color:#ece5d3;background:#0e1016;border:2px solid #3a3f4e;padding:3px 8px;cursor:pointer"';
  const panel=()=>{ '@later'; let P=document.getElementById('gemp'); if(P)return P; P=document.createElement('div'); P.id='gemp'; P.hidden=true;
    P.style.cssText='position:fixed;left:50%;top:10%;transform:translateX(-50%);width:min(460px,92vw);max-height:80vh;overflow:auto;z-index:21;padding:14px 16px;font:11px Silkscreen,monospace;letter-spacing:.4px;color:#d8dae2;background:#0b0d13f2;border:2px solid #3a3f4e;zoom:var(--uiz,1)';
    document.body.appendChild(P); P.addEventListener('keydown',e=>e.stopPropagation()); P.addEventListener('keyup',e=>e.stopPropagation());
    P.addEventListener('click',e=>{ const b=e.target.closest('button[data-s],button[data-train]'); if(!b)return; if(b.dataset.train){ FORAGE.train(b.dataset.train,+b.dataset.cap); TRADE.draw(); return; } const id=b.dataset.s, got=INV.sell(id,b.dataset.n==='all'?1e9:1); if(got)TRADE.note('SOLD · +$'+got); TRADE.draw(); }); return P; };
  TRADE.note=t=>{ '@later'; let n=document.getElementById('gemn'); if(!n){ n=document.createElement('div'); n.id='gemn'; n.style.cssText='position:fixed;left:50%;transform:translateX(-50%);bottom:56px;font:12px Silkscreen,monospace;color:#f2c14e;background:rgba(16,18,26,.88);border:2px solid #2a2e3a;padding:6px 10px;z-index:22;pointer-events:none'; document.body.appendChild(n); }
    n.textContent=t; n.hidden=false; clearTimeout(TRADE.nt); TRADE.nt=setTimeout(()=>n.hidden=true,3200); };
  TRADE.draw=()=>{ const P=document.getElementById('gemp'); if(!P||P.hidden)return;
    let o=`<h3 style="margin:0 0 4px;color:#f2c14e;font:12px Silkscreen,monospace">THE GOLEMS BUY</h3><div style="color:#9b9584;margin-bottom:8px">Rare gems and crystals, any kind. Fair prices, paid in coin.</div>
      <div style="margin-bottom:8px">YOU HAVE <b style="color:#f2c14e">$${Math.round(INV.cash)}</b> · ${INV.count()} STONE${INV.count()===1?'':'S'}</div><table style="border-collapse:collapse;width:100%">`;
    for(const [id,name,pr] of GEMS){ const n=INV.items[id]||0, W=WORTH, price=W?W.sell(id,1,pr):pr, all=W?W.sell(id,n,pr):pr*n;
      o+=`<tr style="border-bottom:1px solid #22252f;${n?'':'color:#7d7a70'}"><td style="padding:4px 2px">${esc(name)}</td><td style="text-align:right;padding:4px 6px">$${price}</td><td style="text-align:right;padding:4px 6px">${n?'x'+n:'-'}</td><td style="text-align:right;white-space:nowrap">${n?`<button ${btn} data-s="${id}">SELL</button>${n>1?`<button ${btn} data-s="${id}" data-n="all">ALL $${all}</button>`:''}`:''}</td></tr>`; }
    o+=(FORAGE&&FORAGE.trainRows?FORAGE.trainRows(['gem']):'')+`</table><div style="color:#9b9584;margin-top:10px">Find them: the glints on the cave's floor (back each day).</div>`;
    const x=P.querySelector(':scope>.pX'); P.innerHTML=o; if(x)P.appendChild(x); };
  TRADE.open=N=>{ const P=panel(); P.hidden=false; TRADE.draw();
    if(N&&N.walker&&N.walker.state==='stay'){ N.walker.t=Math.max(N.walker.t,14); N.st.face={x:pos.x,z:pos.z}; }
    if(N&&typeof LINES!=='undefined')setTimeout(()=>LINES.say(N,'golem'),60); };
  TRADE.close=()=>{ const P=document.getElementById('gemp'); if(P)P.hidden=true; };
  { const isG=N=>N&&N.walker&&N.walker.kind==='golem'; for(const th of UI.things)if(th.npc){ const a0=th.act; th.act=()=>{ if(isG(th.npc))TRADE.open(th.npc); else a0(); }; } }
  window.GEMDBG=()=>({cash:INV.cash,items:INV.items,picked:INV.picked,open:!!(document.getElementById('gemp')&&!document.getElementById('gemp').hidden)}); }
export {GEMS};
