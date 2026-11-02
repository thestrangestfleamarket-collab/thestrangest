// THE DAILY REQUESTS: each day some merchants ask for things you can find (mushrooms, butterflies, birds, honey, flowers) and pay over the odds; the pack's ASKS tab lists them, and you hand them in at that merchant's shop.
import {CITY, FORAGE, INV, ITEMS, MAIL} from './003b-systems.js';
import {OWNED} from './005-save.js';
{ const say=(t,c)=>FORAGE.say&&FORAGE.say(t,c||'#e8e2cc'), day=()=>window.MAIL&&MAIL.ready?MAIL.day():window.CITY?CITY.day||0:0, N=3;
  // who asks, and from what: [merchant key, their name, the things they might want, how many at most]
  const POOL=[['mushroom','THE MUSHROOM SELLER',()=>Object.keys(FORAGE.MU).map(k=>'m_'+k),4],['radish','THE RADISH',()=>['m_button','m_puffball','m_chanterelle','m_oyster','m_bolete','fl_daisy','fl_clover','fl_tulip','fl_sunflower','fl_rose'],3],
    ['origamifox','THE NATURE MERCHANT',()=>[...Array(12).keys()].map(k=>'b_'+k).concat(['bd_0','bd_1','bd_2','bd_3','bird_feather']),3],['beekeeper','THE BEEKEEPER',()=>['honey_wild','honey_clover','honey_lav','honey_sun','honey_rose','bee_wax'],3]];
  const hs=(a,b)=>{ const s=Math.sin(a*127.1+b*311.7)*43758.5453; return s-Math.floor(s); };
  const worth=id=>Math.max(1,(FORAGE.PRICE&&FORAGE.PRICE[id])||(FORAGE.MU&&id.startsWith('m_')&&FORAGE.MU[id.slice(2)]?FORAGE.MU[id.slice(2)][2]:0)||(window.ITEMS?+ITEMS.prop(id,'value'):0)||2);
  let S={v:1,d:-1,done:{}}; try{ const D=JSON.parse(OWNED.get('asks')||'null'); if(D&&D.v===1)S=D; }catch(e){} const save=()=>{ try{ OWNED.set('asks',JSON.stringify(S)); }catch(e){} };
  // today's asks: the same for the whole day, a new set each day
  const today=()=>{ const d=day(); if(S.d!==d){ S={v:1,d,done:{}}; save(); } const out=[], used=new Set();
    for(let i=0;out.length<N&&i<12;i++){ const P=POOL[Math.floor(hs(d,i)*POOL.length)]; if(used.has(P[0]))continue; used.add(P[0]); const L=P[2](), id=L[Math.floor(hs(d+7,i)*L.length)], n=1+Math.floor(hs(d+3,i)*P[3]);
      out.push({i:out.length,who:P[0],name:P[1],id,n,pay:Math.round(worth(id)*n*1.8)+5,done:!!S.done[out.length]}); } return out; };
  FORAGE.asks=today;
  FORAGE.hand=i=>{ const a=today()[i]; if(!a||a.done)return; if(FORAGE.has(a.id)<a.n)return say(`YOU NEED ${a.n} ${FORAGE.NM[a.id]||a.id}.`,'#c8a090'); FORAGE.take(a.id,a.n); INV.cash+=a.pay; S.done[i]=1; save(); 
    say(`${a.name} TAKES THE ${a.n>1?a.n+' ':''}${FORAGE.NM[a.id]||a.id} AND PAYS $${a.pay}. THANK YOU!`,'#f2c14e'); FORAGE.draw(); };
  // the rows a shop shows for its keeper's asks today
  const B='style="margin:0 0 0 4px;font:inherit;color:#ece5d3;background:#0e1016;border:2px solid #3a3f4e;padding:2px 7px;cursor:pointer"';
  FORAGE.askRows=who=>{ const L=today().filter(a=>a.who===who); if(!L.length)return ''; return `<tr><td colspan="4" style="padding:8px 2px 2px;color:#9b9584">TODAY I WANT</td></tr>`+L.map(a=>`<tr style="border-bottom:1px solid #22252f;${a.done?'color:#5d5a52':''}"><td style="padding:4px 2px">${a.n} ${FORAGE.NM[a.id]||a.id}</td><td style="text-align:right;padding:4px 6px">$${a.pay}</td><td style="text-align:right">${FORAGE.has(a.id)||0}/${a.n}</td><td style="text-align:right">${a.done?'DONE':`<button ${B} data-ask="${a.i}">HAND IN</button>`}</td></tr>`).join(''); };
  FORAGE.TABS.push({id:'asks',draw:()=>{ const L=today(); return `<div style="margin-bottom:6px">TODAY'S ASKS · ${L.filter(a=>a.done).length} OF ${L.length} DONE</div><table style="border-collapse:collapse;width:100%">`+
    L.map(a=>`<tr style="border-bottom:1px solid #22252f;${a.done?'color:#5d5a52':''}"><td style="padding:4px 2px">${a.name}<div style="color:#8a8676;font-size:10px">WANTS ${a.n} ${FORAGE.NM[a.id]||a.id}</div></td><td style="text-align:right;padding:4px 6px">${a.done?'DONE':'$'+a.pay}</td><td style="text-align:right">${FORAGE.has(a.id)||0}/${a.n}</td></tr>`).join('')+
    `</table><div style="color:#9b9584;margin-top:8px;line-height:1.5">New asks each day. Bring what they want to their shop and press HAND IN.</div>`; }});
  window.ASKDBG=()=>({day:S.d,asks:today()});
}
