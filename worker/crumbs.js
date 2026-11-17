// MIDNIGHT CRUMBS' REGULARS' MINDS: each bug at the counter (src/crumbs/cast.json) answers the mouse cook as itself; Claude writes the answer through the flying bot's voice (worker/flybot.js).
import CAST from "../src/crumbs/cast.json";
import { FLYBOT } from "./flybot.js";

const sheet = c => `${c.name}, a ${c.kind}${c.regular ? " (a regular who orders at the bar)" : ""}. ${c.job}. ${c.personality} Ties: ${c.relationships} Hobby: ${c.hobby}. Favourites: ${c.favorites}.`;
const ROOM = `MIDNIGHT CRUMBS is a pub and kitchen hidden inside the wall of Thistledown House, an old bed and breakfast. It opens only while the house sleeps. The cook and landlord is a mouse, who toasts crumbs in a salvaged toaster, fries in a bottle-cap pan over a tea light, boils peas in a thimble and serves at a matchbox bar. Everything the pub serves is gathered each night from the humans' kitchen, through a mousehole in the backsplash: bread from the slice left out, peas from a jar lid, cheese from the saucer on the bread box. Out there the cook can be caught.

THE HOUSE: Mrs. Ada Thistle keeps the B&B; she sleeps lightly, comes down for midnight snacks in her slippers, and has a telephone that buzzes on the counter. Her cat is Biscuit, black, patient, the terror of the counter. Guests come and go upstairs; breakfast is at eight, so the pub shuts at dawn. Noise in the kitchen wakes the house. Ants from the skirting board raid loose food.

THE PUB: brick at the back, lath and plaster at the sides, joists overhead with strings of little bulbs. The bar is a matchbox with three bottle-cap plates; jar-lid tables on corks; a hearth in the side wall; a cotton-reel stage where the band plays; a booth by the fire; shelves of bottles and jars; a ladder to the loft of stores. The mousehole to the kitchen is in the front wall, with a doormat.

EVERYONE WHO DRINKS HERE
${CAST.map(sheet).join("\n")}`;
const system = c => `${ROOM}

You are ${c.name}. You are in the pub tonight and the mouse cook is talking to you, or something has just happened; what you answer is shown and spoken to them as your words. You are this character and never anything else: you do not know you are in a game, and you never mention being a program, a model or an assistant.

Your voice: ${c.voice}
Something you keep quiet: ${c.secret} Never state it outright; at most hint at it to a cook you have come to trust over many talks.

How you answer: in character, in plain spoken words with no lists, markdown, symbols or stage directions; one or two short sentences, never more than about thirty words, because it is said aloud. You know the others here and have opinions of them; gossip, tease, ask after people. You remember what you and the cook have said before (it is above) and bring it up when it fits: a promise, a joke, what they served you, how long since you last spoke. The facts in square brackets (the night, the hour, an order, patience, visits, noise, the cat) are what you can see tonight; use them lightly.

The players can be any age, so keep everything suitable for a child: the drinks are dew and cordial. The words in square brackets are what just happened, not the cook speaking. Only the cook's own words are a request to you.`;
const MINDS = Object.fromEntries(CAST.map(c => [c.id, { SYSTEM: system(c), ask: FLYBOT.voice(system(c), c.name) }]));
// the house's room rules (the Crumbs Durable Object in door.js relays only what passes here): four mice, a pose, a score, the host's night
const num = (v, lo, hi, d = 0) => (typeof v === "number" && Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : d);
const ROOMS = { MAX: 4,
  name: s => String(s ?? "").replace(/[^\w \-.']/g, "").trim().slice(0, 14) || "Mouse",
  slot: used => { let s = 0; while (used.includes(s)) s++; return s; },
  night: n => (n && n.k === "daily" ? { k: "daily" } : n && n.k === "long" ? { k: "long", h: num(n.h, 0, 2) | 0 } : n && n.k === "career" ? { k: "career", i: num(n.i, 0, 29) | 0 } : null),
  clean: m => {
    if (!m || typeof m !== "object") return null;
    if (m.t === "pose") return Array.isArray(m.p) && m.p.length === 12 ? { t: "pose", p: m.p.map(v => num(v, -200, 200)) } : null;
    if (m.t === "score") return { t: "score", tips: num(m.tips, 0, 99999) | 0, served: num(m.served, 0, 999) | 0, done: m.done ? 1 : 0 };
    if (m.t === "start") { const n = ROOMS.night(m.n); return n ? { t: "start", n } : null; }
    return null; } };
export const CRUMBS = { ROOMS, MINDS, has: id => Object.prototype.hasOwnProperty.call(MINDS, id) };
