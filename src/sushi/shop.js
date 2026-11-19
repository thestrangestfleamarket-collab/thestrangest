// the shop between days (owner, 19 Nov 2026): what the stall can buy from its savings before the next morning, each thing changing how the stall works (progress.js's UPGRADES); a list with BUY on a screen (dawn.js's card), rows to poke on the headset's board
import { G } from './ctx.js';
import { UPGRADES, TEXT as PT } from './progress.js';

export const TEXT = { title: 'FOR THE STALL', buy: 'BUY', owned: 'OWNED', savings: 'Savings', poor: 'NOT YET' };

export function buildShop() {
  const S = {}; G.shop = S;
  S.items = () => UPGRADES.map((u) => { const owned = G.prog.has(u.id), price = G.prog.price(u.id); return { id: u.id, name: PT.ups[u.id][0], what: PT.ups[u.id][1], price, owned, can: !owned && G.prog.P.money >= price }; });
  S.buy = (id) => { const ok = G.prog.buy(id); G.audio.play(ok ? 'cash' : 'click'); return ok; };
  // on a screen: the list, redrawn after each purchase
  S.dom = (box) => { const el = document.createElement('div'); el.style.cssText = 'padding-top:6px;text-align:left;font-size:13px'; box.appendChild(el);
    const draw = () => { el.innerHTML = ''; const h = document.createElement('div'); h.style.cssText = 'display:flex;justify-content:space-between;font-weight:700;letter-spacing:2px;margin-bottom:4px'; h.innerHTML = `<span>${TEXT.title}</span><span>${TEXT.savings} ${G.money.fmt(G.prog.P.money)}</span>`; el.appendChild(h);
      for (const it of S.items()) { const r = document.createElement('div'); r.style.cssText = 'display:flex;align-items:center;gap:8px;padding:2px 0;opacity:' + (it.owned ? 0.55 : 1);
        const t = document.createElement('div'); t.style.cssText = 'flex:1;line-height:1.2'; t.innerHTML = `<b>${it.name}</b><br><span style="opacity:.75;font-size:12px">${it.what}</span>`; r.appendChild(t);
        const b = document.createElement('button'); b.textContent = it.owned ? TEXT.owned : `${TEXT.buy} ${G.money.fmt(it.price)}`; b.disabled = !it.can; b.dataset.up = it.id; b.style.cssText = 'font:600 12px Georgia,serif;padding:5px 9px;min-width:104px;background:#1a1410;color:#e8dcc8;border:1px solid #6a5a48;border-radius:0;cursor:pointer'; b.onclick = () => { if (S.buy(it.id)) draw(); }; r.appendChild(b); el.appendChild(r); } };
    draw(); return el; };
  return S;
}
