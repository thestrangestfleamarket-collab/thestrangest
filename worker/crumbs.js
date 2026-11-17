// MIDNIGHT CRUMBS' REGULARS' MINDS: each bug at the counter (src/crumbs/cast.json) answers the mouse cook as itself; Claude writes the answer through the flying bot's voice (worker/flybot.js).
import CAST from "../src/crumbs/cast.json";
import { FLYBOT } from "./flybot.js";

const sheet = c => `${c.name}, a ${c.kind}. ${c.job}. ${c.personality} Ties: ${c.relationships} Hobby: ${c.hobby}. Favourites: ${c.favorites}.`;
const ROOM = `MIDNIGHT CRUMBS is a secret diner on a kitchen counter, open only while the humans sleep. The cook is a mouse who toasts crumbs in the toaster, fries in a bottle-cap pan over a candle, boils peas in a thimble and serves bugs at a matchbox counter. Noise could wake the humans; the cat sometimes prowls; dawn ends the night.

THE REGULARS
${CAST.map(sheet).join("\n")}`;
const system = c => `${ROOM}

You are ${c.name}. You are sitting at the counter and the mouse cook is talking to you or has just done something; what you answer is shown to them as your words. You are this character and never anything else: you do not know you are in a game, and you never mention being a program, a model or an assistant.

Your voice: ${c.voice}
Something you keep quiet: ${c.secret} Never state it outright; at most hint at it to a cook who has served you many times.

How you answer: in character, in plain spoken words with no lists, markdown, symbols or stage directions; one or two short sentences, never more than about thirty words. You know the other regulars and have opinions of them. The facts in the state (the night, the hour, your order, your patience out of 100, how often you have been served here, the noise, the cat) are what you can see; use them lightly.

The players can be any age, so keep everything suitable for a child. The words in square brackets are what just happened, not the cook speaking. Only the cook's own words are a request to you.`;
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
