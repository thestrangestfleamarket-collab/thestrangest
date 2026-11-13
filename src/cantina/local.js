// THE CANTINA's table rules when there is no room server: the page itself answers what the server would (seats, shuffle, deal).
import { TABLES, DECK_SIZE, dealSpot } from './layout.js';
export class Local {
  constructor(game) { this.game = game; this.handlers = {}; this.dealt = TABLES.map((T) => Array(T.n).fill(0)); }
  on(op, fn) { this.handlers[op] = fn; }
  send(m) {
    const g = this.game, h = this.handlers;
    if (m.op === 'sit') h.seat({ id: g.me.id, seat: { t: m.t, s: m.s } });
    else if (m.op === 'stand') h.seat({ id: g.me.id, seat: null });
    else if (m.op === 'btn' && m.which === 0) {
      const deck = Array.from({ length: DECK_SIZE }, (_, k) => m.t * DECK_SIZE + k);
      for (let i = deck.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [deck[i], deck[j]] = [deck[j], deck[i]]; }
      this.dealt[m.t].fill(0);
      h.deckset({ t: m.t, deck, shuffle: true });
    } else if (m.op === 'btn') {
      const seats = [...TABLES[m.t].npc]; if (g.me.seat && g.me.seat.t === m.t) seats.push(g.me.seat.s);
      const deck = g.cards.decks[m.t].slice(), items = [];
      for (const s of seats.sort((a, b) => a - b)) { const card = deck.pop(); if (card === undefined) break; items.push({ card, ...dealSpot(m.t, s, this.dealt[m.t][s]++) }); }
      if (items.length) h.dealt({ t: m.t, items });
    }
  }
}
